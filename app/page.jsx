"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xvulyfnioguodavfkteb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dWx5Zm5pb2d1b2RhdmZrdGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTQsImV4cCI6MjA5NDg2MzAxNH0.yMvc8y_lcBhZFPhWhWNnsoAZayKjX52CDHAf66IixwU"
);

const RESTAURANTS = [
  { id: "brewery_vivant", name: "Brewery Vivant", emoji: "🍺", description: "Belgian-inspired pub poutine" },
  { id: "ganders", name: "Ganders at the B.O.B.", emoji: "🏢", description: "Downtown classic with a twist" },
  { id: "barrio", name: "Barrio", emoji: "🌶️", description: "Latin-fusion poutine experience" },
  { id: "the_meanwhile", name: "The Meanwhile Bar", emoji: "🎸", description: "Rock-and-roll loaded poutine" },
  { id: "kitchen_by_lons", name: "Kitchen by Lon's", emoji: "🍴", description: "Elevated upscale curds & gravy" },
  { id: "terra_grt", name: "Terra GR", emoji: "🌱", description: "Farm-to-table vegetarian option" },
  { id: "rockford_brewing", name: "Rockford Brewing", emoji: "🍻", description: "Craft beer braised poutine" },
  { id: "the_cheshire", name: "The Cheshire", emoji: "🐱", description: "Quirky neighbourhood favourite" },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; }
  .poutine-app { font-family: 'DM Sans', sans-serif; background: #111; min-height: 100vh; color: #fff; }
  .display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }

  /* Email Gate */
  .gate-wrap { min-height: 100vh; background: #111; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; }
  .gate-badge { background: #FFD000; color: #111; font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.2em; padding: 4px 14px; border-radius: 2px; margin-bottom: 18px; display: inline-block; }
  .gate-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px, 10vw, 88px); line-height: 0.92; color: #FFD000; text-align: center; margin-bottom: 6px; }
  .gate-sub { font-size: 15px; color: #888; text-align: center; margin-bottom: 36px; letter-spacing: 0.05em; text-transform: uppercase; font-size: 12px; }
  .gate-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 2rem; width: 100%; max-width: 420px; }
  .gate-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-bottom: 8px; }
  .gate-input { width: 100%; background: #111; border: 2px solid #333; border-radius: 2px; color: #fff; font-size: 16px; padding: 12px 16px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; }
  .gate-input:focus { border-color: #FFD000; }
  .gate-btn { width: 100%; margin-top: 12px; background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 14px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.1em; cursor: pointer; transition: background 0.15s, transform 0.1s; }
  .gate-btn:hover { background: #ffe033; }
  .gate-btn:active { transform: scale(0.98); }
  .gate-btn:disabled { background: #444; color: #666; cursor: not-allowed; }
  .gate-error { color: #ff4444; font-size: 13px; margin-top: 8px; }

  /* Header */
  .header { background: #111; border-bottom: 3px solid #FFD000; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
  .header-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #FFD000; letter-spacing: 0.06em; }
  .header-email { font-size: 12px; color: #555; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Main */
  .main { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }

  /* Step header */
  .step-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
  .step-num { background: #FFD000; color: #111; font-family: 'Bebas Neue', sans-serif; font-size: 18px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 2px; margin-top: 2px; }
  .step-num.inactive { background: #2a2a2a; color: #555; }
  .step-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; color: #fff; line-height: 1; }
  .step-title.inactive { color: #444; }
  .step-desc { font-size: 13px; color: #666; margin-top: 4px; line-height: 1.5; }

  /* Restaurant grid */
  .rest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 8px; margin-bottom: 16px; }
  .rest-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: border-color 0.15s, background 0.15s; user-select: none; }
  .rest-card:hover { border-color: #FFD000; }
  .rest-card.visited { background: #1a1f0a; border-color: #7ab320; }
  .rest-card.favorite { background: #1f1a00; border-color: #FFD000; }
  .rest-card.disabled { cursor: default; }
  .rest-check { width: 22px; height: 22px; border: 2px solid #333; border-radius: 2px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; transition: all 0.15s; }
  .rest-check.checked { background: #7ab320; border-color: #7ab320; color: #fff; }
  .rest-check.fav { background: #FFD000; border-color: #FFD000; color: #111; font-size: 14px; }
  .rest-emoji { font-size: 24px; flex-shrink: 0; }
  .rest-name { font-weight: 700; font-size: 14px; color: #fff; }
  .rest-desc { font-size: 11px; color: #666; margin-top: 2px; }
  .rest-tag { font-family: 'Bebas Neue', sans-serif; font-size: 11px; letter-spacing: 0.1em; color: #FFD000; background: rgba(255,208,0,0.1); border: 1px solid #FFD000; padding: 2px 8px; border-radius: 2px; flex-shrink: 0; }

  /* Save button */
  .save-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 10px 24px; font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 0.08em; cursor: pointer; transition: background 0.15s, transform 0.1s; }
  .btn-primary:hover { background: #ffe033; }
  .btn-primary:active { transform: scale(0.97); }
  .btn-primary:disabled { background: #333; color: #555; cursor: not-allowed; }
  .save-count { font-size: 12px; color: #555; margin-left: auto; }
  .save-ok { color: #7ab320; font-size: 13px; font-weight: 600; }

  /* Divider */
  .divider { border: none; border-top: 2px solid #1f1f1f; margin: 28px 0; }

  /* Vote grid */
  .vote-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s; }
  .vote-card:hover { border-color: #FFD000; background: #1f1f00; }
  .vote-card.chosen { background: #1f1a00; border-color: #FFD000; }
  .vote-card.faded { opacity: 0.3; cursor: default; }
  .vote-card.faded:hover { border-color: #2a2a2a; background: #1a1a1a; }
  .vote-name { font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #fff; line-height: 1; }
  .vote-name.chosen { color: #FFD000; }
  .vote-desc { font-size: 11px; color: #666; margin-top: 3px; }
  .vote-arrow { font-size: 18px; color: #333; margin-left: auto; flex-shrink: 0; }
  .vote-arrow.chosen { color: #FFD000; }
  .warning-box { background: #1a1200; border: 2px solid #FFD000; border-radius: 2px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: #FFD000; display: flex; align-items: center; gap: 10px; }
`;

function EmailGate({ onEnter }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.from("participants").select("*").eq("email", clean).single();
      if (err && err.code === "PGRST116") {
        const { data: newP, error: insertErr } = await supabase.from("participants").insert({ email: clean, visited: [], favorite: null }).select().single();
        if (insertErr) throw insertErr;
        onEnter(newP);
      } else if (err) { throw err; } else { onEnter(data); }
    } catch (e) { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="poutine-app">
      <style>{css}</style>
      <div className="gate-wrap">
        <span className="gate-badge">Michigan Street · Grand Rapids</span>
        <h1 className="gate-title">POUTINE<br/>WEEK</h1>
        <p className="gate-sub">September 16–27, 2026 &nbsp;·&nbsp; Cast your vote</p>
        <div className="gate-card">
          <div className="gate-label">Your Email Address</div>
          <input
            className="gate-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          {error && <div className="gate-error">{error}</div>}
          <button className="gate-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "LOADING..." : "LET'S GO →"}
          </button>
          <p style={{ fontSize: 11, color: "#555", marginTop: 14, textAlign: "center", lineHeight: 1.6 }}>
            Your email is used to save your progress and cast one vote.<br/>We won&apos;t send you anything.
          </p>
        </div>
      </div>
    </div>
  );
}

function MainApp({ participant, onUpdate }) {
  const [visited, setVisited] = useState(participant.visited || []);
  const [favorite, setFavorite] = useState(participant.favorite || null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [voteSaving, setVoteSaving] = useState(false);

  const toggleVisited = (id) => {
    if (favorite === id) return;
    setVisited(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  };

  const saveVisited = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("participants").update({ visited }).eq("email", participant.email).select().single();
    if (!error) { onUpdate(data); setSavedMsg("Saved!"); setTimeout(() => setSavedMsg(""), 2500); }
    setSaving(false);
  };

  const castVote = async (id) => {
    if (favorite) return;
    const rest = RESTAURANTS.find(x => x.id === id);
    if (!window.confirm(`Cast your final vote for "${rest.name}"?\n\nThis cannot be changed after submitting.`)) return;
    setVoteSaving(true);
    const { data, error } = await supabase.from("participants").update({ favorite: id }).eq("email", participant.email).select().single();
    if (!error) { setFavorite(id); onUpdate(data); }
    setVoteSaving(false);
  };

  const visitedRestaurants = RESTAURANTS.filter(r => visited.includes(r.id));
  const canVote = visited.length >= 1;

  return (
    <div className="poutine-app">
      <style>{css}</style>
      <div className="header">
        <div>
          <div className="header-title">🍟 POUTINE WEEK</div>
          <div className="header-email">{participant.email}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "#FFD000", letterSpacing: "0.1em" }}>SEPT 16–27</div>
          <div style={{ fontSize: 11, color: "#555" }}>Michigan Street GR</div>
        </div>
      </div>

      <div className="main">
        {/* Step 1 */}
        <div className="step-header">
          <div className="step-num">1</div>
          <div>
            <div className="step-title">WHERE HAVE YOU EATEN?</div>
            <div className="step-desc">Check off each restaurant you&apos;ve visited. Come back and add more as you go!</div>
          </div>
        </div>

        <div className="rest-grid">
          {RESTAURANTS.map(r => {
            const isVisited = visited.includes(r.id);
            const isFav = favorite === r.id;
            return (
              <div key={r.id} className={`rest-card${isFav ? " favorite" : isVisited ? " visited" : ""}${isFav ? " disabled" : ""}`} onClick={() => toggleVisited(r.id)}>
                <div className={`rest-check${isFav ? " fav" : isVisited ? " checked" : ""}`}>
                  {isFav ? "★" : isVisited ? "✓" : ""}
                </div>
                <span className="rest-emoji">{r.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rest-name">{r.name}</div>
                  <div className="rest-desc">{r.description}</div>
                </div>
                {isFav && <span className="rest-tag">MY PICK</span>}
              </div>
            );
          })}
        </div>

        <div className="save-row">
          <button className="btn-primary" onClick={saveVisited} disabled={saving}>
            {saving ? "SAVING..." : "SAVE MY VISITS"}
          </button>
          {savedMsg && <span className="save-ok">✓ {savedMsg}</span>}
          <span className="save-count">{visited.length} / {RESTAURANTS.length} visited</span>
        </div>

        <hr className="divider" />

        {/* Step 2 */}
        <div className="step-header">
          <div className={`step-num${canVote ? "" : " inactive"}`}>2</div>
          <div>
            <div className={`step-title${canVote ? "" : " inactive"}`}>WHICH IS YOUR FAVOURITE?</div>
            <div className="step-desc">
              {favorite ? "Your vote has been cast — thank you!" : canVote ? "Visit at least one restaurant, then cast your vote." : "Check off your visits above first."}
            </div>
          </div>
        </div>

        {canVote && !favorite && (
          <div className="warning-box">
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span><strong>One vote only.</strong> Once submitted, your choice cannot be changed.</span>
          </div>
        )}

        {favorite && (
          <div style={{ background: "#1f1a00", border: "2px solid #FFD000", borderRadius: 2, padding: "14px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>{RESTAURANTS.find(r => r.id === favorite)?.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, color: "#FFD000", letterSpacing: "0.1em" }}>YOUR VOTE</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "#fff" }}>{RESTAURANTS.find(r => r.id === favorite)?.name}</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 24 }}>🏆</span>
          </div>
        )}

        {canVote && (
          <div className="rest-grid">
            {visitedRestaurants.map(r => {
              const isFav = favorite === r.id;
              const isOther = favorite && !isFav;
              return (
                <div key={r.id} className={`vote-card${isFav ? " chosen" : isOther ? " faded" : ""}`} onClick={() => !favorite && castVote(r.id)}>
                  <span style={{ fontSize: 26 }}>{r.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`vote-name${isFav ? " chosen" : ""}`}>{r.name}</div>
                    <div className="vote-desc">{r.description}</div>
                  </div>
                  <span className={`vote-arrow${isFav ? " chosen" : ""}`}>{isFav ? "★" : !favorite ? "→" : ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {voteSaving && <div style={{ color: "#FFD000", fontSize: 13, marginTop: 12, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}>SAVING YOUR VOTE...</div>}
      </div>
    </div>
  );
}

export default function Home() {
  const [participant, setParticipant] = useState(null);
  return participant
    ? <MainApp participant={participant} onUpdate={setParticipant} />
    : <EmailGate onEnter={setParticipant} />;
}
