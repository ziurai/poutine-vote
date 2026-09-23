"use client";
import { useState } from "react";

// Marketing dashboard for the admin area. Everything here is derived from data
// the app already stores: participants (email, visited[], favorite, created_at)
// and restaurants. There is NO per-visit timestamp, so time-based charts are
// about SIGN-UPS (created_at), which is the only time axis available; visit and
// vote figures are running totals, not per-day.

const YELLOW = "#FFD000";

const css = `
  .ins { display: flex; flex-direction: column; gap: 16px; }
  .ins-tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .ins-tile { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 16px; }
  .ins-tile-num { font-family: 'GravySans', sans-serif; font-size: 34px; color: ${YELLOW}; line-height: 1; }
  .ins-tile-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 6px; }
  .ins-tile-sub { font-size: 11px; color: #555; margin-top: 3px; }
  .ins-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 18px; }
  .ins-card-title { font-family: 'GravySans', sans-serif; font-size: 16px; color: #fff; letter-spacing: 0.04em; }
  .ins-card-note { font-size: 11px; color: #666; margin-top: 2px; margin-bottom: 16px; }
  .ins-grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }

  /* vertical bars */
  .ins-vbars { display: flex; align-items: flex-end; gap: 3px; height: 160px; }
  .ins-vbar-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 0; }
  .ins-vbar { width: 100%; max-width: 34px; background: ${YELLOW}; border-radius: 4px 4px 0 0; min-height: 2px; transition: opacity 0.15s; }
  .ins-vbar.dim { background: #3a3a2a; }
  .ins-vbar-val { font-size: 10px; color: #aaa; margin-bottom: 4px; font-weight: 600; }
  .ins-xrow { display: flex; gap: 3px; margin-top: 6px; }
  .ins-xlabel { flex: 1; text-align: center; font-size: 10px; color: #777; min-width: 0; overflow: hidden; white-space: nowrap; }

  /* horizontal bars */
  .ins-hrow { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .ins-hlabel { width: 130px; flex-shrink: 0; font-size: 12px; color: #ddd; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ins-htrack { flex: 1; background: #111; border-radius: 3px; height: 20px; overflow: hidden; }
  .ins-hfill { height: 100%; background: ${YELLOW}; border-radius: 3px; min-width: 2px; }
  .ins-hval { width: 42px; flex-shrink: 0; font-size: 12px; color: #fff; font-weight: 700; }

  /* funnel */
  .ins-funnel-row { margin-bottom: 10px; }
  .ins-funnel-top { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
  .ins-funnel-stage { color: #ddd; }
  .ins-funnel-figs { color: #888; }
  .ins-funnel-figs b { color: ${YELLOW}; font-weight: 700; }
  .ins-funnel-track { background: #111; border-radius: 3px; height: 22px; overflow: hidden; }
  .ins-funnel-fill { height: 100%; background: ${YELLOW}; border-radius: 3px; min-width: 2px; }

  .ins-empty { font-size: 13px; color: #666; padding: 20px 0; text-align: center; }

  /* fraud signals */
  .ins-flag-card { background: #1a1a1a; border: 2px solid #3a2a12; border-radius: 4px; padding: 18px; }
  .ins-flag-title { font-family: 'GravySans', sans-serif; font-size: 16px; color: #ffb020; letter-spacing: 0.04em; }
  .ins-group { border: 1px solid #2a2a2a; border-radius: 3px; padding: 10px 12px; margin-bottom: 8px; background: #151515; }
  .ins-group-head { font-size: 12px; color: #ffb020; font-weight: 700; margin-bottom: 6px; }
  .ins-group-row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; padding: 3px 0; border-top: 1px solid #202020; }
  .ins-group-row:first-of-type { border-top: none; }
  .ins-gr-email { color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ins-gr-meta { color: #888; flex-shrink: 0; text-align: right; }
  .ins-gr-meta b { color: ${YELLOW}; font-weight: 600; }
  .ins-conv { color: #ff8a3d; font-weight: 700; }
  .ins-del { flex-shrink: 0; background: transparent; border: 1px solid #5a2626; color: #ff6b6b; border-radius: 3px; font-size: 11px; padding: 2px 8px; cursor: pointer; transition: all 0.15s; }
  .ins-del:hover { background: #ff4444; border-color: #ff4444; color: #fff; }
  .ins-del:disabled { opacity: 0.5; cursor: default; }
  .ins-ok { font-size: 13px; color: #7ab320; padding: 12px 0; }
`;

function localDayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDay(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function hourLabel(h) {
  if (h === 0) return "12a";
  if (h === 12) return "12p";
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

// created_at is a `timestamp without time zone` holding UTC with no marker, so
// JS would otherwise parse it as the viewer's local time. Force-interpret it as
// UTC, then read the day and hour in Eastern (America/New_York handles EDT/EST).
function easternParts(iso) {
  if (!iso) return null;
  const hasTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
  const d = new Date(hasTz ? iso : iso + "Z");
  if (isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  }).formatToParts(d).reduce((o, p) => ((o[p.type] = p.value), o), {});
  return { dayKey: `${parts.year}-${parts.month}-${parts.day}`, hour: parseInt(parts.hour, 10) % 24 };
}

// Canonical stem of an email's local part: lowercase, drop separators and any
// trailing digits, so "isaiah.riordan21" and "isaiahriordan19" both become
// "isaiahriordan".
function emailStem(email) {
  const at = (email || "").lastIndexOf("@");
  if (at < 1) return "";
  return email.slice(0, at).toLowerCase().replace(/[._+\-]/g, "").replace(/\d+$/, "");
}

// Bounded Levenshtein: returns max+1 as soon as it's exceeded.
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < best) best = cur[j];
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// Group participants that are probably the same person, by any of: identical
// name stem, one stem containing another, a small typo distance between stems,
// or a shared IP (sign-up or vote). Union-find over the participant list.
function buildClusters(participants) {
  const people = participants.map((p) => {
    const at = (p.email || "").lastIndexOf("@");
    return {
      email: p.email || "",
      domain: at > 0 ? p.email.slice(at + 1).toLowerCase() : "",
      stem: emailStem(p.email),
      created_at: p.created_at,
      voted_at: p.voted_at,
      favorite: p.favorite || null,
      ips: [p.signup_ip, p.vote_ip].filter(Boolean),
    };
  });
  const N = people.length;
  const parent = people.map((_, i) => i);
  const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };

  const doFuzzy = N <= 1500; // O(n^2) guard for very large lists
  for (let a = 0; a < N; a++) {
    for (let b = a + 1; b < N; b++) {
      const A = people[a], B = people[b];
      let link = false;
      if (A.ips.length && B.ips.length && A.ips.some((ip) => B.ips.includes(ip))) link = true;
      else if (A.stem && B.stem) {
        if (A.stem === B.stem) link = true;
        else if (A.stem.length >= 4 && B.stem.length >= 4 && (A.stem.includes(B.stem) || B.stem.includes(A.stem))) link = true;
        else if (doFuzzy && Math.min(A.stem.length, B.stem.length) >= 4 && editDistance(A.stem, B.stem, 2) <= 2) link = true;
      }
      if (link) union(a, b);
    }
  }

  const groups = {};
  people.forEach((p, i) => { const r = find(i); (groups[r] ||= []).push(p); });
  return Object.values(groups)
    .filter((g) => g.length >= 2)
    .map((g) => {
      const members = g.slice().sort((a, b) => (a.created_at || "").localeCompare(b.created_at || ""));
      const domains = [...new Set(g.map((m) => m.domain).filter(Boolean))];
      const ips = [...new Set(g.flatMap((m) => m.ips))];
      const votes = g.filter((m) => m.favorite);
      const targets = [...new Set(votes.map((m) => m.favorite))];
      const times = g.map((m) => m.created_at).filter(Boolean).sort();
      let spanMin = null;
      if (times.length >= 2) {
        const t0 = new Date(times[0] + (/[zZ]|[+-]\d\d:?\d\d$/.test(times[0]) ? "" : "Z"));
        const t1 = new Date(times[times.length - 1] + (/[zZ]|[+-]\d\d:?\d\d$/.test(times[times.length - 1]) ? "" : "Z"));
        spanMin = Math.round((t1 - t0) / 60000);
      }
      return {
        members, size: g.length, domains, ips,
        voteCount: votes.length,
        convergesOn: targets.length === 1 && votes.length >= 2 ? targets[0] : null,
        spanMin,
      };
    })
    .sort((a, b) => (b.convergesOn ? 1 : 0) - (a.convergesOn ? 1 : 0) || b.size - a.size);
}

function spanText(min) {
  if (min == null) return "";
  if (min < 1) return "under a minute apart";
  if (min < 60) return `within ${min} min`;
  if (min < 60 * 36) return `within ${Math.round(min / 60)} h`;
  return `within ${Math.round(min / 1440)} days`;
}

export function AdminInsights({ participants, restaurants, onDelete }) {
  const total = participants.length;
  const [busy, setBusy] = useState(null);

  const confirmDelete = async (m) => {
    if (!onDelete) return;
    const voteLine = m.favorite ? `\n\nThis also removes their vote for ${(restaurants.find((r) => r.id === m.favorite) || {}).name || "a restaurant"}.` : "";
    if (!window.confirm(`Permanently delete ${m.email}?${voteLine}\n\nThis cannot be undone.`)) return;
    setBusy(m.email);
    try { await onDelete(m.email); } finally { setBusy(null); }
  };

  // --- signups per day (created_at, Eastern) ---
  const et = participants
    .map((p) => easternParts(p.created_at))
    .filter(Boolean);
  const dayCounts = {};
  et.forEach((e) => { dayCounts[e.dayKey] = (dayCounts[e.dayKey] || 0) + 1; });
  let days = [];
  const keys = Object.keys(dayCounts).sort();
  if (keys.length) {
    const start = new Date(keys[0] + "T00:00:00");
    const end = new Date(keys[keys.length - 1] + "T00:00:00");
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = localDayKey(d);
      days.push({ key: k, count: dayCounts[k] || 0 });
    }
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // --- signups by hour of day ---
  const byHour = Array(24).fill(0);
  et.forEach((e) => { byHour[e.hour]++; });
  const maxHour = Math.max(1, ...byHour);
  const peakHour = byHour.indexOf(maxHour);

  // --- visits per restaurant ---
  const visitCount = {};
  const voteCount = {};
  restaurants.forEach((r) => { visitCount[r.id] = 0; voteCount[r.id] = 0; });
  participants.forEach((p) => {
    (p.visited || []).forEach((id) => { if (id in visitCount) visitCount[id]++; });
    if (p.favorite && p.favorite in voteCount) voteCount[p.favorite]++;
  });
  const ranked = restaurants
    .map((r) => ({ name: r.name, visits: visitCount[r.id] || 0, votes: voteCount[r.id] || 0 }))
    .sort((a, b) => b.visits - a.visits);
  const maxVisits = Math.max(1, ...ranked.map((r) => r.visits));

  // --- funnel ---
  const v1 = participants.filter((p) => (p.visited || []).length >= 1).length;
  const v4 = participants.filter((p) => (p.visited || []).length >= 4).length;
  const voted = participants.filter((p) => p.favorite).length;
  const funnel = [
    { stage: "Signed up", n: total },
    { stage: "Visited a restaurant", n: v1 },
    { stage: "Shirt-eligible (4+ visits)", n: v4 },
    { stage: "Cast a vote", n: voted },
  ];

  // --- visit-depth distribution ---
  const depthBuckets = [
    { label: "0", n: 0 }, { label: "1", n: 0 }, { label: "2", n: 0 },
    { label: "3", n: 0 }, { label: "4+", n: 0 },
  ];
  participants.forEach((p) => {
    const n = (p.visited || []).length;
    depthBuckets[Math.min(n, 4)].n++;
  });
  const maxDepth = Math.max(1, ...depthBuckets.map((b) => b.n));

  // --- headline tiles ---
  const totalVisits = participants.reduce((s, p) => s + (p.visited || []).length, 0);
  const avgVisits = total ? (totalVisits / total).toFixed(1) : "0";
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  // --- fraud signals: cluster likely-same-person accounts ---
  const fmtWhen = (iso) => {
    const e = easternParts(iso);
    if (!e) return "";
    const d = new Date(e.dayKey + "T00:00:00");
    const h12 = e.hour % 12 === 0 ? 12 : e.hour % 12;
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${h12}${e.hour < 12 ? "am" : "pm"}`;
  };
  const restName = (id) => (restaurants.find((r) => r.id === id) || {}).name || "—";
  const clusters = buildClusters(participants);

  return (
    <div className="ins">
      <style>{css}</style>

      <div className="ins-tiles">
        <div className="ins-tile">
          <div className="ins-tile-num">{avgVisits}</div>
          <div className="ins-tile-label">Avg visits / person</div>
          <div className="ins-tile-sub">{totalVisits} stamps total</div>
        </div>
        <div className="ins-tile">
          <div className="ins-tile-num">{pct(voted)}%</div>
          <div className="ins-tile-label">Voted</div>
          <div className="ins-tile-sub">{voted} of {total}</div>
        </div>
        <div className="ins-tile">
          <div className="ins-tile-num">{pct(v4)}%</div>
          <div className="ins-tile-label">Shirt-eligible</div>
          <div className="ins-tile-sub">{v4} hit 4+ visits</div>
        </div>
        <div className="ins-tile">
          <div className="ins-tile-num">{peakHour >= 0 && et.length ? hourLabel(peakHour) : "—"}</div>
          <div className="ins-tile-label">Busiest sign-up hour</div>
          <div className="ins-tile-sub">Eastern (ET)</div>
        </div>
      </div>

      <div className="ins-card">
        <div className="ins-card-title">Sign-ups per day</div>
        <div className="ins-card-note">New participants who entered their email each day.</div>
        {days.length ? (
          <>
            <div className="ins-vbars">
              {days.map((d) => (
                <div className="ins-vbar-col" key={d.key} title={`${shortDay(d.key)}: ${d.count} sign-ups`}>
                  {d.count > 0 && <div className="ins-vbar-val">{d.count}</div>}
                  <div className="ins-vbar" style={{ height: `${(d.count / maxDay) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="ins-xrow">
              {days.map((d) => <div className="ins-xlabel" key={d.key}>{shortDay(d.key)}</div>)}
            </div>
          </>
        ) : <div className="ins-empty">No sign-up dates recorded yet.</div>}
      </div>

      <div className="ins-card">
        <div className="ins-card-title">Sign-ups by hour of day</div>
        <div className="ins-card-note">When people sign up, in Eastern Time. (This is the only "hot times" your data can show — visits aren't timestamped.)</div>
        {et.length ? (
          <>
            <div className="ins-vbars">
              {byHour.map((c, h) => (
                <div className="ins-vbar-col" key={h} title={`${hourLabel(h)}: ${c} sign-ups`}>
                  <div className={`ins-vbar${c === 0 ? " dim" : ""}`} style={{ height: `${(c / maxHour) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="ins-xrow">
              {byHour.map((c, h) => <div className="ins-xlabel" key={h}>{h % 3 === 0 ? hourLabel(h) : ""}</div>)}
            </div>
          </>
        ) : <div className="ins-empty">No sign-up times recorded yet.</div>}
      </div>

      <div className="ins-grid-2">
        <div className="ins-card">
          <div className="ins-card-title">Most-visited restaurants</div>
          <div className="ins-card-note">Total stamps collected, all-time.</div>
          {ranked.length ? ranked.map((r) => (
            <div className="ins-hrow" key={r.name} title={`${r.name}: ${r.visits} visits, ${r.votes} votes`}>
              <div className="ins-hlabel">{r.name}</div>
              <div className="ins-htrack"><div className="ins-hfill" style={{ width: `${(r.visits / maxVisits) * 100}%` }} /></div>
              <div className="ins-hval">{r.visits}</div>
            </div>
          )) : <div className="ins-empty">No restaurants.</div>}
        </div>

        <div className="ins-card">
          <div className="ins-card-title">How many places people visit</div>
          <div className="ins-card-note">Participants grouped by number of stamps.</div>
          <div className="ins-vbars" style={{ height: 140 }}>
            {depthBuckets.map((b) => (
              <div className="ins-vbar-col" key={b.label} title={`${b.label} visits: ${b.n} people`}>
                {b.n > 0 && <div className="ins-vbar-val">{b.n}</div>}
                <div className="ins-vbar" style={{ height: `${(b.n / maxDepth) * 100}%` }} />
              </div>
            ))}
          </div>
          <div className="ins-xrow">
            {depthBuckets.map((b) => <div className="ins-xlabel" key={b.label}>{b.label}</div>)}
          </div>
        </div>
      </div>

      <div className="ins-card">
        <div className="ins-card-title">Engagement funnel</div>
        <div className="ins-card-note">How far participants get, from sign-up to a cast vote.</div>
        {funnel.map((f) => (
          <div className="ins-funnel-row" key={f.stage}>
            <div className="ins-funnel-top">
              <span className="ins-funnel-stage">{f.stage}</span>
              <span className="ins-funnel-figs"><b>{f.n}</b> · {pct(f.n)}%</span>
            </div>
            <div className="ins-funnel-track">
              <div className="ins-funnel-fill" style={{ width: `${total ? (f.n / total) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="ins-flag-card">
        <div className="ins-flag-title">⚑ Review — likely duplicate accounts ({clusters.length})</div>
        <div className="ins-card-note">
          Accounts grouped when they share a name stem, a near-identical name (typo), one name inside another, or an IP.
          Signals to review, not proof — shared WiFi (a venue, a household) can put unrelated people on one IP.
          Groups that pile onto a single restaurant are listed first.
        </div>

        {clusters.length ? clusters.slice(0, 40).map((c, i) => (
          <div className="ins-group" key={i}>
            <div className="ins-group-head">
              {c.size} accounts
              {c.convergesOn && <span className="ins-conv"> · all voted {restName(c.convergesOn)}</span>}
              {c.domains.length > 1 && <span> · {c.domains.length} domains</span>}
              {c.ips.length > 0 && <span> · {c.ips.length === 1 ? "same IP" : `${c.ips.length} IPs`}</span>}
              {c.spanMin != null && <span> · {spanText(c.spanMin)}</span>}
            </div>
            {c.members.map((m) => (
              <div className="ins-group-row" key={m.email}>
                <span className="ins-gr-email">{m.email}</span>
                <span className="ins-gr-meta">
                  {fmtWhen(m.created_at)}
                  {m.favorite ? <> · <b>{restName(m.favorite)}</b></> : " · no vote"}
                </span>
                {onDelete && (
                  <button className="ins-del" disabled={busy === m.email} onClick={() => confirmDelete(m)}>
                    {busy === m.email ? "…" : "Delete"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )) : <div className="ins-ok">✓ No duplicate-account clusters detected.</div>}
        {clusters.length > 40 && <div className="ins-card-note">Showing the top 40 of {clusters.length} groups.</div>}
      </div>
    </div>
  );
}
