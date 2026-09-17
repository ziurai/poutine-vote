import { promises as dns } from "node:dns";
import { DISPOSABLE_DOMAINS } from "./disposable.js";

// Requires a local part, an @, and a dotted domain with a 2+ char TLD.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidFormat(email) {
  return EMAIL_RE.test(email);
}

export function isDisposableDomain(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
}

// Does the domain actually accept mail? Blocks invented domains (typos,
// made-up TLDs) by requiring an MX record, or failing that an A/AAAA record
// (RFC 5321 allows delivery to the address record when no MX exists).
//
// Fails OPEN on transient DNS trouble (timeout, SERVFAIL) so a flaky lookup
// never turns a real participant away; only a domain that definitively does
// not resolve (NXDOMAIN / no records) is rejected.
export async function domainHasMail(email) {
  const domain = email.split("@")[1];
  if (!domain) return { ok: false };

  try {
    const mx = await dns.resolveMx(domain);
    if (mx && mx.length > 0) return { ok: true };
  } catch (e) {
    if (e.code !== "ENOTFOUND" && e.code !== "ENODATA") return { ok: true };
  }

  for (const fn of ["resolve4", "resolve6"]) {
    try {
      const recs = await dns[fn](domain);
      if (recs && recs.length > 0) return { ok: true };
    } catch (e) {
      if (e.code !== "ENOTFOUND" && e.code !== "ENODATA") return { ok: true };
    }
  }

  return { ok: false };
}
