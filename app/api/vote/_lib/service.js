import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SERVICE ROLE key. This key bypasses
// row-level security, so it must never be exposed to the browser: it is read
// from a non-NEXT_PUBLIC env var and only ever imported by server route
// handlers. Returns null when the key is absent so routes can fail loudly
// instead of silently falling back to anonymous access.
let cached = null;

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!cached) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

// Canonicalise an address so aliases of the same inbox collapse to one identity.
// Trim + lowercase for everyone; for Gmail (and its googlemail.com alias) also
// strip dots and any "+tag" from the local part, since Gmail ignores both -
// otherwise one inbox yields unlimited "unique" emails (a.lex+1@gmail.com,
// a.l.e.x@gmail.com, ...). Idempotent: normalizing an already-canonical address
// returns it unchanged, so lookups from later requests still match.
export function normalizeEmail(raw) {
  const email = (typeof raw === "string" ? raw : "").trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at === -1) return email;
  let local = email.slice(0, at);
  let domain = email.slice(at + 1);
  if (domain === "googlemail.com") domain = "gmail.com";
  if (domain === "gmail.com") {
    local = local.split("+")[0].replace(/\./g, "");
  }
  return local + "@" + domain;
}
