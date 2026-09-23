"use client";

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

export function AdminInsights({ participants, restaurants }) {
  const total = participants.length;

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

  // --- fraud signals ---
  const fmtWhen = (iso) => {
    const e = easternParts(iso);
    if (!e) return "";
    const d = new Date(e.dayKey + "T00:00:00");
    const h12 = e.hour % 12 === 0 ? 12 : e.hour % 12;
    return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${h12}${e.hour < 12 ? "am" : "pm"}`;
  };
  const restName = (id) => (restaurants.find((r) => r.id === id) || {}).name || "—";

  // Same local part (before @), 2+ different domains -> likely one person with
  // several addresses. Gmail dot/plus aliases are already merged at sign-up, so
  // this catches the cross-provider case (alex@gmail / alex@yahoo).
  const byLocal = {};
  participants.forEach((p) => {
    const at = (p.email || "").lastIndexOf("@");
    if (at < 1) return;
    const local = p.email.slice(0, at).toLowerCase();
    const domain = p.email.slice(at + 1).toLowerCase();
    (byLocal[local] ||= []).push({ email: p.email, domain, created_at: p.created_at, favorite: p.favorite });
  });
  const lookalikes = Object.entries(byLocal)
    .filter(([, rows]) => new Set(rows.map((r) => r.domain)).size > 1)
    .map(([local, rows]) => ({ local, rows: rows.slice().sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")) }))
    .sort((a, b) => b.rows.length - a.rows.length);

  // Multiple cast votes from one IP (populated going forward from vote_ip).
  const byIp = {};
  participants.forEach((p) => {
    if (p.favorite && p.vote_ip) (byIp[p.vote_ip] ||= []).push(p);
  });
  const dupIps = Object.entries(byIp)
    .filter(([, rows]) => rows.length > 1)
    .map(([ip, rows]) => ({ ip, rows: rows.slice().sort((a, b) => (a.voted_at || "").localeCompare(b.voted_at || "")) }))
    .sort((a, b) => b.rows.length - a.rows.length);
  const anyVoteIp = participants.some((p) => p.vote_ip);

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
        <div className="ins-flag-title">⚑ Review — possible duplicates</div>
        <div className="ins-card-note">Signals to eyeball, not proof. Shared WiFi (a restaurant, a household) can make unrelated people share an IP.</div>

        <div style={{ fontSize: 13, color: "#ccc", fontWeight: 700, margin: "10px 0 8px" }}>
          Look-alike emails · same name, different domain
        </div>
        {lookalikes.length ? lookalikes.map((g) => (
          <div className="ins-group" key={g.local}>
            <div className="ins-group-head">{g.local}@ — {g.rows.length} accounts</div>
            {g.rows.map((r) => (
              <div className="ins-group-row" key={r.email}>
                <span className="ins-gr-email">{r.email}</span>
                <span className="ins-gr-meta">{fmtWhen(r.created_at)} · {r.favorite ? <b>voted {restName(r.favorite)}</b> : "no vote"}</span>
              </div>
            ))}
          </div>
        )) : <div className="ins-ok">✓ No look-alike email groups.</div>}

        <div style={{ fontSize: 13, color: "#ccc", fontWeight: 700, margin: "18px 0 8px" }}>
          Multiple votes from one IP
        </div>
        {!anyVoteIp
          ? <div className="ins-empty" style={{ textAlign: "left" }}>No vote IPs recorded yet — this fills in as new votes come in.</div>
          : dupIps.length ? dupIps.map((g) => (
            <div className="ins-group" key={g.ip}>
              <div className="ins-group-head">{g.ip} — {g.rows.length} votes</div>
              {g.rows.map((r) => (
                <div className="ins-group-row" key={r.email}>
                  <span className="ins-gr-email">{r.email}</span>
                  <span className="ins-gr-meta">{fmtWhen(r.voted_at)} · <b>{restName(r.favorite)}</b></span>
                </div>
              ))}
            </div>
          )) : <div className="ins-ok">✓ No IP cast more than one vote.</div>}
      </div>
    </div>
  );
}
