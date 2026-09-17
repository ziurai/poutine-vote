import { getServiceClient, cleanEmail } from "../_lib/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Record a participant's final vote. Replaces the anonymous update that used to
// run in the browser. The vote is only written when none is set yet, so a cast
// vote can never be changed or overwritten - the UI enforced this client-side;
// now the server enforces it too.
export async function POST(request) {
  try {
    const db = getServiceClient();
    if (!db) {
      console.error("vote/cast: SUPABASE_SERVICE_ROLE_KEY is not set");
      return Response.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const email = cleanEmail(body.email);
    const favorite = typeof body.favorite === "string" ? body.favorite : null;
    if (!email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!favorite) {
      return Response.json({ error: "Invalid favorite" }, { status: 400 });
    }

    const { data: rest, error: rErr } = await db
      .from("restaurants")
      .select("id")
      .eq("id", favorite)
      .maybeSingle();
    if (rErr) throw rErr;
    if (!rest) return Response.json({ error: "Unknown restaurant" }, { status: 400 });

    // Conditional update: only rows whose favorite is still null are touched.
    const { data: updated, error: uErr } = await db
      .from("participants")
      .update({ favorite })
      .eq("email", email)
      .is("favorite", null)
      .select("email, visited, favorite");
    if (uErr) throw uErr;

    if (updated && updated.length === 1) {
      return Response.json({ participant: updated[0] });
    }

    // Nothing updated: the participant already voted, or the row is missing.
    // Return the current row so the client reflects the real state.
    const { data: current } = await db
      .from("participants")
      .select("email, visited, favorite")
      .eq("email", email)
      .maybeSingle();
    if (!current) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ participant: current });
  } catch (e) {
    console.error("vote/cast error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
