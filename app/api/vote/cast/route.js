import { getServiceClient, normalizeEmail } from "../_lib/service";

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
    const email = normalizeEmail(body.email);
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

    // Read the authoritative row first: a vote requires the person to have
    // actually visited somewhere. The UI enforced this, but the API did not,
    // which let 0-visit votes in through direct calls.
    const { data: current, error: cErr } = await db
      .from("participants")
      .select("email, visited, favorite")
      .eq("email", email)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!current) return Response.json({ error: "Not found" }, { status: 404 });

    // Already voted: votes are final, return the existing choice unchanged.
    if (current.favorite) return Response.json({ participant: current });

    const visitCount = Array.isArray(current.visited) ? current.visited.length : 0;
    if (visitCount < 1) {
      return Response.json({ error: "Visit at least one restaurant before voting." }, { status: 400 });
    }

    // Conditional update: only write when favorite is still null (no overwrite).
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
    // Lost a race (voted in a concurrent request): return the stored row.
    const { data: after } = await db
      .from("participants")
      .select("email, visited, favorite")
      .eq("email", email)
      .maybeSingle();
    return Response.json({ participant: after || current });
  } catch (e) {
    console.error("vote/cast error:", e?.message || e);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
