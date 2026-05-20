"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xvulyfnioguodavfkteb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dWx5Zm5pb2d1b2RhdmZrdGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTQsImV4cCI6MjA5NDg2MzAxNH0.yMvc8y_lcBhZFPhWhWNnsoAZayKjX52CDHAf66IixwU"
);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
  @font-face { font-family: 'GravySans'; src: url('/fonts/GravySans.woff') format('woff'); font-weight: 400; }
  @font-face { font-family: 'GravySans'; src: url('/fonts/GravySans-2.woff') format('woff'); font-weight: 700; }
  @font-face { font-family: 'GravySans'; src: url('/fonts/GravySans-3.woff') format('woff'); font-weight: 900; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; }
  .app { font-family: 'DM Sans', sans-serif; background: #111; min-height: 100vh; color: #fff; }
  .nav { background: #111; border-bottom: 3px solid #FFD000; padding: 0 1.5rem; display: flex; align-items: center; height: 60px; gap: 0; position: sticky; top: 0; z-index: 100; }
  .nav-logo { display: flex; align-items: center; text-decoration: none; margin-right: auto; }
  .nav-logo img { height: 36px; width: auto; }
  .nav-link { color: #aaa; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; padding: 0 16px; height: 60px; display: flex; align-items: center; border-bottom: 3px solid transparent; margin-bottom: -3px; transition: color 0.15s, border-color 0.15s; white-space: nowrap; }
  .nav-link:hover { color: #FFD000; border-bottom-color: #FFD000; }
  .nav-btn { background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 7px 16px; font-family: 'GravySans', sans-serif; font-size: 15px; letter-spacing: 0.06em; cursor: pointer; margin-left: 12px; transition: background 0.15s; white-space: nowrap; }
  .nav-btn:hover { background: #ffe033; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal { background: #1a1a1a; border: 2px solid #FFD000; border-radius: 4px; width: 100%; max-width: 780px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
  .modal-header { padding: 14px 18px; border-bottom: 2px solid #2a2a2a; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .modal-title { font-family: 'GravySans', sans-serif; font-size: 22px; color: #FFD000; letter-spacing: 0.06em; }
  .modal-close { background: transparent; border: 1px solid #444; border-radius: 2px; color: #aaa; font-size: 18px; width: 32px; height: 32px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .modal-close:hover { border-color: #FFD000; color: #FFD000; }
  .modal-body iframe { width: 100%; height: 500px; border: none; display: block; }
  .gate-wrap { min-height: calc(100vh - 63px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; }
  .gate-badge { background: #FFD000; color: #111; font-family: 'GravySans', sans-serif; font-size: 13px; letter-spacing: 0.15em; padding: 4px 14px; border-radius: 2px; margin-bottom: 18px; display: inline-block; }
  .gate-title { font-family: 'GravySans', sans-serif; font-size: clamp(56px, 11vw, 96px); line-height: 0.9; color: #FFD000; text-align: center; margin-bottom: 8px; }
  .gate-sub { font-size: 12px; color: #777; text-align: center; margin-bottom: 36px; letter-spacing: 0.12em; text-transform: uppercase; }
  .gate-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 2rem; width: 100%; max-width: 420px; }
  .gate-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #777; margin-bottom: 8px; }
  .gate-input { width: 100%; background: #111; border: 2px solid #333; border-radius: 2px; color: #fff; font-size: 16px; padding: 12px 16px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; }
  .gate-input:focus { border-color: #FFD000; }
  .gate-btn { width: 100%; margin-top: 12px; background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 14px; font-family: 'GravySans', sans-serif; font-size: 22px; letter-spacing: 0.08em; cursor: pointer; transition: background 0.15s; }
  .gate-btn:hover { background: #ffe033; }
  .gate-btn:disabled { background: #444; color: #666; cursor: not-allowed; }
  .gate-error { color: #ff4444; font-size: 13px; margin-top: 8px; }
  .main { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  .user-bar { display: flex; align-items: center; justify-content: space-between; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 2px; padding: 8px 14px; margin-bottom: 24px; }
  .user-email { font-size: 12px; color: #777; }
  .step-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px; }
  .step-num { background: #FFD000; color: #111; font-family: 'GravySans', sans-serif; font-size: 18px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 2px; margin-top: 2px; }
  .step-num.inactive { background: #2a2a2a; color: #555; }
  .step-title { font-family: 'GravySans', sans-serif; font-size: 30px; color: #fff; line-height: 1; letter-spacing: 0.03em; }
  .step-title.inactive { color: #444; }
  .step-desc { font-size: 13px; color: #666; margin-top: 5px; line-height: 1.5; }
  .rest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 8px; margin-bottom: 16px; }
  .rest-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 14px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: border-color 0.15s, background 0.15s; user-select: none; }
  .rest-card:hover { border-color: #FFD000; }
  .rest-card.visited { background: #1a1f0a; border-color: #7ab320; }
  .rest-card.favorite { background: #1f1a00; border-color: #FFD000; cursor: default; }
  .rest-check { width: 22px; height: 22px; border: 2px solid #333; border-radius: 2px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; transition: all 0.15s; }
  .rest-check.checked { background: #7ab320; border-color: #7ab320; color: #fff; }
  .rest-check.fav { background: #FFD000; border-color: #FFD000; color: #111; font-size: 14px; }
  .rest-name { font-weight: 700; font-size: 14px; color: #fff; }
  .rest-desc { font-size: 11px; color: #666; margin-top: 2px; }
  .rest-tag { font-family: 'GravySans', sans-serif; font-size: 11px; letter-spacing: 0.1em; color: #FFD000; background: rgba(255,208,0,0.1); border: 1px solid #FFD000; padding: 2px 8px; border-radius: 2px; flex-shrink: 0; }
  .save-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 10px 24px; font-family: 'GravySans', sans-serif; font-size: 20px; letter-spacing: 0.08em; cursor: pointer; transition: background 0.15s; }
  .btn-primary:hover { background: #ffe033; }
  .btn-primary:disabled { background: #333; color: #555; cursor: not-allowed; }
  .save-count { font-size: 12px; color: #555; margin-left: auto; }
  .save-ok { color: #7ab320; font-size: 13px; font-weight: 600; }
  .divider { border: none; border-top: 2px solid #1f1f1f; margin: 28px 0; }
  .warning-box { background: #1a1200; border: 2px solid #FFD000; border-radius: 2px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: #FFD000; display: flex; align-items: center; gap: 10px; }
  .vote-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 16px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.15s; }
  .vote-card:hover { border-color: #FFD000; background: #1f1f00; }
  .vote-card.chosen { background: #1f1a00; border-color: #FFD000; cursor: default; }
  .vote-card.faded { opacity: 0.3; cursor: default; }
  .vote-card.faded:hover { border-color: #2a2a2a; background: #1a1a1a; }
  .vote-name { font-family: 'GravySans', sans-serif; font-size: 22px; color: #fff; line-height: 1; letter-spacing: 0.02em; }
  .vote-name.chosen { color: #FFD000; }
  .vote-desc { font-size: 11px; color: #666; margin-top: 3px; }
  .voted-banner { background: #1f1a00; border: 2px solid #FFD000; border-radius: 2px; padding: 14px 18px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
  .loading-screen { min-height: 100vh; background: #111; display: flex; align-items: center; justify-content: center; font-family: 'GravySans', sans-serif; color: #FFD000; font-size: 22px; letter-spacing: 0.1em; }
  /* How it works */
  .how-section { width: 100%; max-width: 900px; margin: 0 auto 48px; padding: 0 1rem; }
  .how-title { font-family: 'GravySans', sans-serif; font-size: clamp(28px, 5vw, 42px); color: #fff; text-align: center; letter-spacing: 0.05em; margin-bottom: 28px; }
  .how-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .how-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; overflow: hidden; }
  .how-img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #222; }
  .how-body { padding: 14px; background: #1a1a1a; }
  .how-step { font-family: 'GravySans', sans-serif; font-size: 12px; color: #FFD000; letter-spacing: 0.15em; margin-bottom: 4px; }
  .how-name { font-family: 'GravySans', sans-serif; font-size: 20px; color: #fff; line-height: 1.1; margin-bottom: 6px; }
  .how-desc { font-size: 12px; color: #888; line-height: 1.5; }

`;

function Nav({ onOpenTracker }) {
  return (
    <nav className="nav">
      <a className="nav-logo" href="https://mistreet.org" target="_blank" rel="noopener noreferrer">
        <img src="https://mistreet.org/wp-content/uploads/2022/03/LOGO-SYSTEMS-10.png" alt="Michigan Street" />
      </a>
      <a className="nav-link" href="https://mistreet.org" target="_blank" rel="noopener noreferrer">mistreet.org</a>
      <button className="nav-btn" onClick={onOpenTracker}>Gravy Train Tracker</button>
    </nav>
  );
}

function GravyTrainModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">GRAVY TRAIN TRACKER</span>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>
        <div className="modal-body">
          <iframe src="https://gravy-train-tracker.vercel.app/embed" title="Gravy Train Tracker" allowFullScreen />
        </div>
      </div>
    </div>
  );
}

function EmailGate({ onEnter }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => { document.title = "Poutine Week — Vote"; }, []);

  const handleSubmit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.from("participants").select("*").eq("email", clean).single();
      if (err && err.code === "PGRST116") {
        const { data: newP, error: insertErr } = await supabase.from("participants").insert({ email: clean, visited: [], favorite: null }).select().single();
        if (insertErr) throw insertErr;
        fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clean }) }).catch(() => {});
        onEnter(newP);
      } else if (err) { throw err; } else {
        fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: clean }) }).catch(() => {});
        onEnter(data);
      }
    } catch (e) { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="app">
      <style>{css}</style>
      <Nav onOpenTracker={() => setTrackerOpen(true)} />
      {trackerOpen && <GravyTrainModal onClose={() => setTrackerOpen(false)} />}
      <div className="gate-wrap">
        <span className="gate-badge">Michigan Street · Grand Rapids</span>
        <h1 className="gate-title">POUTINE<br/>WEEK</h1>
        <p className="gate-sub">September 16–27, 2026 · Cast your vote</p>

        <div className="how-section">
          <div className="how-title">HOW IT WORKS</div>
          <div className="how-grid">
            {[
              { step: "STEP 1", name: "GET A PASSPORT", desc: "Pick up your passport at any participating restaurant when the event kicks off.", img: "https://mistreet.org/wp-content/uploads/2026/04/PoutineWeek2025_Passport_Mockup_V2-scaled.png" },
              { step: "STEP 2", name: "EAT POUTINE", desc: "Visit at least 4 locations and collect a stamp at each. More than 4? Strongly encouraged.", img: "https://mistreet.org/wp-content/uploads/2026/04/DSC02048-scaled.png" },
              { step: "STEP 3", name: "VOTE", desc: "Cast your vote online for your favourite. Voting opens September 16.", img: "https://mistreet.org/wp-content/uploads/2026/05/vote.png" },
              { step: "STEP 4", name: "GET A SHIRT", desc: "4 stamps + your vote = a free Poutine Week tee. Pick up your shirt at 7 Monks.", img: "https://mistreet.org/wp-content/uploads/2026/05/D1-Shirt_CB.png" },
            ].map(s => (
              <div key={s.step} className="how-card">
                <img className="how-img" src={s.img} alt={s.name} />
                <div className="how-body">
                  <div className="how-step">{s.step}</div>
                  <div className="how-name">{s.name}</div>
                  <div className="how-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="gate-card">
          <div style={{ fontFamily: "GravySans, sans-serif", fontSize: 22, color: "#fff", marginBottom: 12, letterSpacing: "0.04em" }}>Track your progress and vote!</div>
          <div className="gate-label">Your Email Address</div>
          <input className="gate-input" type="email" placeholder="you@email.com" value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          {error && <div className="gate-error">{error}</div>}
          <button className="gate-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "LOADING..." : "LET'S GO"}
          </button>

        </div>
      </div>
    </div>
  );
}

function MainApp({ participant, onUpdate }) {
  const [restaurants, setRestaurants] = useState([]);
  const [visited, setVisited] = useState(participant.visited || []);
  const [favorite, setFavorite] = useState(participant.favorite || null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [voteSaving, setVoteSaving] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);

  useEffect(() => {
    document.title = "Poutine Week — Vote";
    supabase.from("restaurants").select("*").eq("active", true).order("sort_order").then(({ data }) => {
      if (data) setRestaurants(data);
    });
  }, []);

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
    const rest = restaurants.find(x => x.id === id);
    if (!window.confirm(`Cast your final vote for "${rest.name}"?\n\nThis cannot be changed after submitting.`)) return;
    setVoteSaving(true);
    const { data, error } = await supabase.from("participants").update({ favorite: id }).eq("email", participant.email).select().single();
    if (!error) { setFavorite(id); onUpdate(data); }
    setVoteSaving(false);
  };

  const visitedRestaurants = restaurants.filter(r => visited.includes(r.id));
  const canVote = visited.length >= 1;
  const favRest = restaurants.find(r => r.id === favorite);

  if (restaurants.length === 0) return <div className="loading-screen">LOADING...</div>;

  return (
    <div className="app">
      <style>{css}</style>
      <Nav onOpenTracker={() => setTrackerOpen(true)} />
      {trackerOpen && <GravyTrainModal onClose={() => setTrackerOpen(false)} />}
      <div className="main">
        <div className="user-bar">
          <span className="user-email">Signed in as {participant.email}</span>
        </div>

        <div className="step-header">
          <div className="step-num">1</div>
          <div>
            <div className="step-title">WHERE HAVE YOU EATEN?</div>
            <div className="step-desc">Check off each restaurant you&apos;ve visited. Come back and add more as you go!</div>
          </div>
        </div>

        <div className="rest-grid">
          {restaurants.map(r => {
            const isVisited = visited.includes(r.id);
            const isFav = favorite === r.id;
            return (
              <div key={r.id} className={`rest-card${isFav ? " favorite" : isVisited ? " visited" : ""}`} onClick={() => !isFav && toggleVisited(r.id)}>
                <div className={`rest-check${isFav ? " fav" : isVisited ? " checked" : ""}`}>{isFav ? "*" : isVisited ? "v" : ""}</div>
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
          <button className="btn-primary" onClick={saveVisited} disabled={saving}>{saving ? "SAVING..." : "SAVE MY VISITS"}</button>
          {savedMsg && <span className="save-ok">Saved!</span>}
          <span className="save-count">{visited.length} / {restaurants.length} visited</span>
        </div>

        <hr className="divider" />

        <div className="step-header">
          <div className={`step-num${canVote ? "" : " inactive"}`}>2</div>
          <div>
            <div className={`step-title${canVote ? "" : " inactive"}`}>WHICH IS YOUR FAVOURITE?</div>
            <div className="step-desc">
              {favorite ? "Your vote has been cast — thank you!" : canVote ? "One vote only. Choose wisely!" : "Check off your visits above first."}
            </div>
          </div>
        </div>

        {canVote && !favorite && (
          <div className="warning-box">
            <span>!</span>
            <span><strong>One vote only.</strong> Once submitted, your choice cannot be changed.</span>
          </div>
        )}

        {favorite && favRest && (
          <div className="voted-banner">
            <div>
              <div style={{ fontFamily: "'GravySans', sans-serif", fontSize: 12, color: "#FFD000", letterSpacing: "0.12em" }}>YOUR VOTE</div>
              <div style={{ fontFamily: "'GravySans', sans-serif", fontSize: 24, color: "#fff" }}>{favRest.name}</div>
            </div>
          </div>
        )}

        {canVote && (
          <div className="rest-grid">
            {visitedRestaurants.map(r => {
              const isFav = favorite === r.id;
              const isOther = favorite && !isFav;
              return (
                <div key={r.id} className={`vote-card${isFav ? " chosen" : isOther ? " faded" : ""}`} onClick={() => !favorite && castVote(r.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className={`vote-name${isFav ? " chosen" : ""}`}>{r.name}</div>
                    <div className="vote-desc">{r.description}</div>
                  </div>
                  <span style={{ fontSize: 16, color: isFav ? "#FFD000" : "#333", marginLeft: "auto", flexShrink: 0 }}>{isFav ? "*" : !favorite ? ">" : ""}</span>
                </div>
              );
            })}
          </div>
        )}

        {voteSaving && <div style={{ fontFamily: "'GravySans', sans-serif", color: "#FFD000", fontSize: 16, marginTop: 12, letterSpacing: "0.1em" }}>SAVING YOUR VOTE...</div>}
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
