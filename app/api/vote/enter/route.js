import { getServiceClient, normalizeEmail } from "../_lib/service";
import { isValidFormat, isDisposableDomain, domainHasMail } from "../_lib/validate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request) {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || null;
  return request.headers.get("x-real-ip") || null;
}

// Look up a participant by email, creating the row if it does not exist yet.
// Replaces the anonymous select-or-insert that used to run in the browser.
export async function POST(request) {
  try {
    const db = getServiceClient();
    if (!db) {
      console.error("vote/enter: SUPABASE_SERVICE_ROLE_KEY is not set");
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = normalizeEmail(body.email);

    // Gate fake / throwaway addresses before a row is ever created.
    if (!isValidFormat(email)) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (isDisposableDomain(email)) {
      return Response.json({ error: "Please use a permanent email address - temporary inboxes aren't allowed." }, { status: 400 });
    }
    const mail = await domainHasMail(email);
    if (!mail.ok) {
      return Response.json({ error: "That email address doesn't look right - please double-check it." }, { status: 400 });
    }

    const ip = clientIp(request);

    const { data: existing, error: selErr } = await db
      .from("participants")
      .select("email, visited, favorite")
      .eq("email", email)
      .maybeSingle();
    if (selErr) throw selErr;
    if (existing) {
      // Best-effort: record the first sign-up IP only (don't overwrite it on
      // return visits). Never fails the request if the column is absent.
      if (ip) {
        const { error: ipErr } = await db.from("participants").update({ signup_ip: ip }).eq("email", email).is("signup_ip", null);
        if (ipErr) console.error("signup_ip capture skipped:", ipErr.message);
      }
      return Response.json({ participant: existing });
    }

    const { data: created, error: insErr } = await db
      .from("participants")
      .insert({ email, visited: [], favorite: null })
      .select("email, visited, favorite")
      .single();

    if (insErr) {
      // Unique-violation: another request created the row in between. Re-read it.
      if (insErr.code === "23505") {
        const { data: again } = await db
          .from("participants")
          .select("email, visited, favorite")
          .eq("email", email)
          .single();
        if (again) return Response.json({ participant: again });
      }
      throw insErr;
    }

    if (ip) {
      const { error: ipErr } = await db.from("participants").update({ signup_ip: ip }).eq("email", email);
      if (ipErr) console.error("signup_ip capture skipped:", ipErr.message);
    }

    return Response.json({ participant: created });
  } catch (e) {
    console.error("vote/enter error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
