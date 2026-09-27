import { getServiceClient } from "../../vote/_lib/service";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Distinct IPs resolved per call. Kept small so one invocation stays well under
// the function timeout; the client calls repeatedly until `remaining` hits 0.
const BATCH = 120;

// Admin-only: verify the caller holds a valid Supabase auth session. Public
// voters are never authenticated, so any valid user is an admin. Fails closed.
async function requireAuth(request) {
  const h = request.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return null;
  const c = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  const { data, error } = await c.auth.getUser();
  return error ? null : data?.user || null;
}

export async function POST(request) {
  try {
    if (!(await requireAuth(request))) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const db = getServiceClient();
    if (!db) return Response.json({ error: "Server not configured" }, { status: 500 });

    // Distinct vote IPs not fully resolved yet. Gated on `location` (the last
    // field added) so a re-run also backfills location onto rows that already
    // have an isp from an earlier version.
    const { data: rows, error } = await db
      .from("participants")
      .select("vote_ip")
      .not("vote_ip", "is", null)
      .is("location", null)
      .limit(20000);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    const allIps = [...new Set(rows.map((r) => r.vote_ip).filter(Boolean))];
    const remainingBefore = allIps.length;
    if (!remainingBefore) return Response.json({ processed: 0, updated: 0, hosting: 0, remaining: 0 });

    const ips = allIps.slice(0, BATCH);

    // Resolve ISPs via ip-api.com's free batch endpoint (100 IPs per call).
    const map = {};
    for (let i = 0; i < ips.length; i += 100) {
      const chunk = ips.slice(i, i + 100);
      const res = await fetch("http://ip-api.com/batch?fields=query,status,isp,org,as,hosting,city,region,country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      if (!res.ok) return Response.json({ error: `ISP lookup failed (HTTP ${res.status})` }, { status: 502 });
      for (const r of await res.json()) {
        map[r.query] = r.status === "success"
          ? {
              isp: r.isp || r.org || r.as || "Unknown",
              hosting: !!r.hosting,
              location: [r.city, r.region].filter(Boolean).join(", ") || r.country || "Unknown",
            }
          : { isp: "Unknown", hosting: false, location: "Unknown" };
      }
      if (i + 100 < ips.length) await new Promise((r) => setTimeout(r, 1300)); // stay under the rate limit
    }

    // Write each resolved IP onto every participant that used it. Guarded by
    // .is("isp", null) so re-runs only fill blanks (safe to repeat).
    let updated = 0, hosting = 0;
    for (const ip of ips) {
      const info = map[ip] || { isp: "Unknown", hosting: false, location: "Unknown" };
      if (info.hosting) hosting++;
      const { error: uErr, count } = await db
        .from("participants")
        .update({ isp: info.isp, isp_hosting: info.hosting, location: info.location }, { count: "exact" })
        .eq("vote_ip", ip)
        .is("location", null);
      if (!uErr) updated += count || 0;
    }

    return Response.json({ processed: ips.length, updated, hosting, remaining: remainingBefore - ips.length });
  } catch (e) {
    console.error("isp-backfill error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
