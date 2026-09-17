import { getServiceClient, cleanEmail } from "../_lib/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Save a participant's collected stamps. Replaces the anonymous update that
// used to run in the browser. Stored ids are constrained to real restaurants
// so the column cannot be stuffed with arbitrary values.
export async function POST(request) {
  try {
    const db = getServiceClient();
    if (!db) {
      console.error("vote/visit: SUPABASE_SERVICE_ROLE_KEY is not set");
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = cleanEmail(body.email);
    if (!email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!Array.isArray(body.visited)) {
      return Response.json({ error: "Invalid visited" }, { status: 400 });
    }

    // Keep only ids that correspond to an actual restaurant (active or not, so a
    // venue toggled inactive mid-event does not silently drop existing stamps).
    const { data: rests, error: rErr } = await db.from("restaurants").select("id");
    if (rErr) throw rErr;
    const validIds = new Set((rests || []).map((r) => r.id));
    const visited = [
      ...new Set(body.visited.filter((id) => typeof id === "string" && validIds.has(id))),
    ];

    const { data, error } = await db
      .from("participants")
      .update({ visited })
      .eq("email", email)
      .select("email, visited, favorite")
      .single();
    if (error) throw error;

    return Response.json({ participant: data });
  } catch (e) {
    console.error("vote/visit error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
