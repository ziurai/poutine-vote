"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xvulyfnioguodavfkteb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dWx5Zm5pb2d1b2RhdmZrdGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTQsImV4cCI6MjA5NDg2MzAxNH0.yMvc8y_lcBhZFPhWhWNnsoAZayKjX52CDHAf66IixwU"
);

const RESTAURANTS = [
  { id: "brewery_vivant", name: "Brewery Vivant", emoji: "🍺" },
  { id: "ganders", name: "Ganders at the B.O.B.", emoji: "🏢" },
  { id: "barrio", name: "Barrio", emoji: "🌶️" },
  { id: "the_meanwhile", name: "The Meanwhile Bar", emoji: "🎸" },
  { id: "kitchen_by_lons", name: "Kitchen by Lon's", emoji: "🍴" },
  { id: "terra_grt", name: "Terra GR", emoji: "🌱" },
  { id: "rockford_brewing", name: "Rockford Brewing", emoji: "🍻" },
  { id: "the_cheshire", name: "The Cheshire", emoji: "🐱" },
];

const medals = ["🥇", "🥈", "🥉"];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; }
  .admin-app { font-family: 'DM Sans', sans-serif; background: #111; min-height: 100vh; color: #fff; }
  .login-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; }
  .login-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #FFD000; margin-bottom: 4px; }
  .login-sub { font-size: 12px; color: #666; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 32px; }
  .login-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 2rem; width: 100%; max-width: 380px; }
  .login-input { width: 100%; background: #111; border: 2px solid #333; border-radius: 2px; color: #fff; font-size: 15px; padding: 11px 14px; outline: none; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; transition: border-color 0.15s; }
  .login-input:focus { border-color: #FFD000; }
  .login-btn { width: 100%; background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 13px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 0.1em; cursor: pointer; }
  .login-btn:disabled { background: #333; color: #555; cursor: not-allowed; }
  .login-error { color: #ff4444; font-size: 13px; margin-bottom: 10px; }
  .admin-header { background: #111; border-bottom: 3px solid #FFD000; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; }
  .admin-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: #FFD000; letter-spacing: 0.06em; }
  .btn-ghost { background: transparent; color: #666; border: 1px solid #333; border-radius: 2px; padding: 6px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; transition: border-color 0.15s, color 0.15s; }
  .btn-ghost:hover { border-color: #FFD000; color: #FFD000; }
  .btn-danger { background: transparent; color: #ff4444; border: 1px solid #ff4444; border-radius: 2px; padding: 6px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; }
  .admin-main { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 32px; }
  .stat-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 1.25rem; text-align: center; }
  .stat-num { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: #FFD000; line-height: 1; }
  .stat-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
  .section-label { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 0.2em; color: #555; margin-bottom: 12px; border-bottom: 1px solid #1f1f1f; padding-bottom: 8px; }
  .rank-row { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
  .rank-row.top { border-color: #FFD000; background: #1f1a00; }
  .rank-bar-wrap { flex: 1; }
  .rank-name { font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 4px; }
  .rank-name.top { color: #FFD000; }
  .rank-bar-bg { background: #111; border-radius: 2px; height: 4px; overflow: hidden; }
  .rank-bar { height: 100%; background: #FFD000; border-radius: 2px; transition: width 0.8s ease; }
  .rank-votes { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #FFD000; min-width: 32px; text-align: right; }
  .rank-visits { font-size: 11px; color: #666; }
  .participant-row { background: #151515; border: 1px solid #1f1f1f; border-radius: 2px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .p-email { font-size: 13px; color: #aaa; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-voted { font-size: 12px; color: #FFD000; font-weight: 600; flex-shrink: 0; }
  .p-novote { font-size: 12px; color: #444; flex-shrink: 0; }
  .p-visits { font-size: 11px; color: #555; flex-shrink: 0; }
`;

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError("Invalid email or password.");
    setLoading(false);
  };

  return (
    <div className="admin-app">
      <style>{css}</style>
      <div className="login-wrap">
        <div className="login-title">🏆 ADMIN</div>
        <div className="login-sub">Poutine Week · Leaderboard Access</div>
        <div className="login-card">
          <input className="login-input" type="email" placeholder="Email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} />
          <input className="login-input" type="password" placeholder="Password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {error && <div className="login-error">{error}</div>}
          <button className="login-btn" onClick={handleLogin} disabled={loading}>{loading ? "SIGNING IN..." : "SIGN IN"}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (s) loadData(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadData(); }, [session]);

  const loadData = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("participants").select("*").order("created_at", { ascending: false });
    if (data) setParticipants(data);
    setDataLoading(false);
  };

  const resetAllVotes = async () => {
    if (!window.confirm("Reset ALL votes and visits for every participant? This cannot be undone.")) return;
    const { error } = await supabase.from("participants").update({ visited: [], favorite: null }).neq("email", "");
    if (!error) { await loadData(); alert("All votes and visits have been reset."); }
    else alert("Something went wrong: " + error.message);
  };

  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setParticipants([]); };

  if (loading) return <div style={{ background: "#111", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#FFD000" }}>Loading…</div>;
  if (!session) return <LoginForm />;

  const voteCounts = {}; const visitCounts = {};
  RESTAURANTS.forEach(r => { voteCounts[r.id] = 0; visitCounts[r.id] = 0; });
  participants.forEach(p => {
    if (p.favorite) voteCounts[p.favorite] = (voteCounts[p.favorite] || 0) + 1;
    (p.visited || []).forEach(id => { visitCounts[id] = (visitCounts[id] || 0) + 1; });
  });

  const ranked = [...RESTAURANTS].map(r => ({ ...r, votes: voteCounts[r.id] || 0, visits: visitCounts[r.id] || 0 })).sort((a, b) => b.votes - a.votes || b.visits - a.visits);
  const maxVotes = Math.max(...ranked.map(r => r.votes), 1);
  const totalVoters = participants.filter(p => p.favorite).length;

  return (
    <div className="admin-app">
      <style>{css}</style>
      <div className="admin-header">
        <div className="admin-title">🏆 POUTINE WEEK · ADMIN</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={loadData}>{dataLoading ? "..." : "↻ Refresh"}</button>
          <button className="btn-danger" onClick={resetAllVotes}>🗑 Reset All</button>
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>
      <div className="admin-main">
        <div className="stat-grid">
          {[{ label: "Participants", value: participants.length }, { label: "Votes Cast", value: totalVoters }, { label: "Restaurants", value: RESTAURANTS.length }].map(s => (
            <div key={s.label} className="stat-card"><div className="stat-num">{s.value}</div><div className="stat-label">{s.label}</div></div>
          ))}
        </div>
        <div className="section-label">RANKINGS</div>
        <div style={{ marginBottom: 28 }}>
          {ranked.map((r, i) => (
            <div key={r.id} className={"rank-row" + (i === 0 && r.votes > 0 ? " top" : "")}>
              <span style={{ fontSize: 20, minWidth: 28, textAlign: "center" }}>{r.votes > 0 ? (medals[i] || "#" + (i+1)) : "—"}</span>
              <span style={{ fontSize: 20 }}>{r.emoji}</span>
              <div className="rank-bar-wrap">
                <div className={"rank-name" + (i === 0 && r.votes > 0 ? " top" : "")}>{r.name}</div>
                <div className="rank-bar-bg"><div className="rank-bar" style={{ width: (r.votes / maxVotes * 100) + "%" }} /></div>
                <div className="rank-visits">{r.visits} visited</div>
              </div>
              <div className="rank-votes">{r.votes}<div style={{ fontFamily: "DM Sans", fontSize: 10, color: "#666", fontWeight: 400 }}>votes</div></div>
            </div>
          ))}
        </div>
        <div className="section-label">ALL PARTICIPANTS {dataLoading && "· LOADING..."}</div>
        {participants.map(p => {
          const fav = RESTAURANTS.find(r => r.id === p.favorite);
          return (
            <div key={p.email} className="participant-row">
              <div className="p-email">{p.email}</div>
              <div className="p-visits">{(p.visited || []).length} visited</div>
              {fav ? <div className="p-voted">{fav.emoji} {fav.name}</div> : <div className="p-novote">No vote yet</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
