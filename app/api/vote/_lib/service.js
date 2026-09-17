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

export function cleanEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}
