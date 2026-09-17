import { getServiceClient, cleanEmail } from "../_lib/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const email = cleanEmail(body.email);
    if (!email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const { data: existing, error: selErr } = await db
      .from("participants")
      .select("email, visited, favorite")
      .eq("email", email)
      .maybeSingle();
    if (selErr) throw selErr;
    if (existing) return Response.json({ participant: existing });

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

    return Response.json({ participant: created });
  } catch (e) {
    console.error("vote/enter error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
