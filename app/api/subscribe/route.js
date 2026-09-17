import crypto from "node:crypto";

const TAG = "Poutine Week 2026 Participant";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
    const server = process.env.MAILCHIMP_SERVER;

    // Without this, a missing or misnamed var silently becomes a request to
    // https://undefined.api.mailchimp.com/... and surfaces as a generic 500.
    if (!apiKey || !audienceId || !server) {
      console.error("Mailchimp is not configured:", {
        MAILCHIMP_API_KEY: Boolean(apiKey),
        MAILCHIMP_AUDIENCE_ID: Boolean(audienceId),
        MAILCHIMP_SERVER: Boolean(server),
      });
      return Response.json({ error: "Mailchimp is not configured" }, { status: 500 });
    }

    const clean = email.trim().toLowerCase();
    const hash = crypto.createHash("md5").update(clean).digest("hex");
    const member = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members/${hash}`;
    const headers = { Authorization: `apikey ${apiKey}`, "Content-Type": "application/json" };

    // PUT upserts. POSTing to /members 400s with "Member Exists" for anyone
    // already in the audience, and the audience has thousands of contacts from
    // previous years. status_if_new only subscribes genuinely new addresses, so
    // this never resurrects someone who has unsubscribed.
    const upsert = await fetch(member, {
      method: "PUT",
      headers,
      body: JSON.stringify({ email_address: clean, status_if_new: "subscribed" }),
    });

    if (!upsert.ok) {
      const detail = await upsert.json().catch(() => ({}));
      console.error("Mailchimp upsert failed:", detail);
      return Response.json({ error: detail.detail || "Mailchimp error" }, { status: 500 });
    }

    // Tags are ignored on member create/update and have to be set on their own
    // endpoint. Returns 204 on success.
    const tagged = await fetch(`${member}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tags: [{ name: TAG, status: "active" }] }),
    });

    if (!tagged.ok) {
      // The contact is subscribed either way, so don't fail the signup over a tag.
      console.error("Mailchimp tagging failed:", tagged.status, await tagged.text().catch(() => ""));
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
