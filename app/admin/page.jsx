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
  .admin-app { font-family: 'DM Sans', sans-serif; background: #111; min-height: 100vh; color: #fff; }
  .login-wrap { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; }
  .login-title { font-family: 'GravySans', sans-serif; font-size: 48px; color: #FFD000; margin-bottom: 4px; }
  .login-sub { font-size: 12px; color: #666; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 32px; }
  .login-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 4px; padding: 2rem; width: 100%; max-width: 380px; }
  .login-input { width: 100%; background: #111; border: 2px solid #333; border-radius: 2px; color: #fff; font-size: 15px; padding: 11px 14px; outline: none; font-family: 'DM Sans', sans-serif; margin-bottom: 10px; transition: border-color 0.15s; }
  .login-input:focus { border-color: #FFD000; }
  .login-btn { width: 100%; background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 13px; font-family: 'GravySans', sans-serif; font-size: 20px; letter-spacing: 0.1em; cursor: pointer; }
  .login-btn:disabled { background: #333; color: #555; cursor: not-allowed; }
  .login-error { color: #ff4444; font-size: 13px; margin-bottom: 10px; }
  .admin-header { background: #111; border-bottom: 3px solid #FFD000; padding: 0 1.5rem; display: flex; align-items: center; height: 60px; justify-content: space-between; }
  .admin-title { font-family: 'GravySans', sans-serif; font-size: 24px; color: #FFD000; letter-spacing: 0.06em; }
  .btn-ghost { background: transparent; color: #666; border: 1px solid #333; border-radius: 2px; padding: 6px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; transition: border-color 0.15s, color 0.15s; }
  .btn-ghost:hover { border-color: #FFD000; color: #FFD000; }
  .btn-danger { background: transparent; color: #ff4444; border: 1px solid #ff4444; border-radius: 2px; padding: 6px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; font-size: 12px; }
  .btn-yellow { background: #FFD000; color: #111; border: none; border-radius: 2px; padding: 6px 16px; cursor: pointer; font-family: 'GravySans', sans-serif; font-size: 15px; letter-spacing: 0.06em; }
  .admin-main { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  .tabs { display: flex; gap: 0; border-bottom: 2px solid #2a2a2a; margin-bottom: 28px; }
  .tab { background: transparent; border: none; border-bottom: 3px solid transparent; margin-bottom: -2px; padding: 10px 20px; color: #666; font-family: 'GravySans', sans-serif; font-size: 16px; letter-spacing: 0.06em; cursor: pointer; transition: color 0.15s, border-color 0.15s; }
  .tab.active { color: #FFD000; border-bottom-color: #FFD000; }
  .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
  .stat-card { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 1.25rem; text-align: center; }
  .stat-num { font-family: 'GravySans', sans-serif; font-size: 40px; color: #FFD000; line-height: 1; }
  .stat-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px; }
  .section-label { font-family: 'GravySans', sans-serif; font-size: 13px; letter-spacing: 0.2em; color: #555; margin-bottom: 12px; border-bottom: 1px solid #1f1f1f; padding-bottom: 8px; }
  .rank-row { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 12px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
  .rank-row.top { border-color: #FFD000; background: #1f1a00; }
  .rank-name { font-weight: 700; font-size: 14px; color: #fff; margin-bottom: 4px; }
  .rank-name.top { color: #FFD000; }
  .rank-bar-bg { background: #111; border-radius: 2px; height: 4px; overflow: hidden; margin-top: 4px; }
  .rank-bar { height: 100%; background: #FFD000; border-radius: 2px; }
  .rank-votes { font-family: 'GravySans', sans-serif; font-size: 22px; color: #FFD000; min-width: 32px; text-align: right; }
  .rank-visits { font-size: 11px; color: #666; }
  .participant-row { background: #151515; border: 1px solid #1f1f1f; border-radius: 2px; padding: 10px 14px; display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .p-email { font-size: 13px; color: #aaa; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .p-voted { font-size: 12px; color: #FFD000; font-weight: 600; flex-shrink: 0; }
  .p-novote { font-size: 12px; color: #444; flex-shrink: 0; }
  .p-visits { font-size: 11px; color: #555; flex-shrink: 0; }

  /* Restaurant editor */
  .rest-editor-row { background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 2px; padding: 14px; margin-bottom: 8px; }
  .rest-editor-row.inactive { opacity: 0.5; }
  .rest-editor-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
  .rest-input { width: 100%; background: #111; border: 1px solid #333; border-radius: 2px; color: #fff; font-size: 13px; padding: 8px 12px; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; }
  .rest-input:focus { border-color: #FFD000; }
  .rest-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .btn-sm { background: transparent; border: 1px solid #333; border-radius: 2px; color: #aaa; padding: 5px 12px; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .btn-sm:hover { border-color: #FFD000; color: #FFD000; }
  .btn-sm.danger:hover { border-color: #ff4444; color: #ff4444; }
  .btn-sm.success { border-color: #7ab320; color: #7ab320; }
  .add-rest-form { background: #1a1a1a; border: 2px dashed #333; border-radius: 2px; padding: 16px; margin-top: 12px; }
  .add-rest-title { font-family: 'GravySans', sans-serif; font-size: 14px; color: #666; letter-spacing: 0.1em; margin-bottom: 12px; }
`;

const medals = ["#1", "#2", "#3"];

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
        <div className="login-title">ADMIN</div>
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

function RestaurantEditor() {
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [newRest, setNewRest] = useState({ name: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadRestaurants(); }, []);

  const loadRestaurants = async () => {
    const { data } = await supabase.from("restaurants").select("*").order("sort_order");
    if (data) { setRestaurants(data); setEditing({}); }
  };

  const startEdit = (r) => setEditing(prev => ({ ...prev, [r.id]: { name: r.name, description: r.description } }));
  const cancelEdit = (id) => setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });

  const saveEdit = async (id) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    const { error } = await supabase.from("restaurants").update({ name: editing[id].name, description: editing[id].description }).eq("id", id);
    if (!error) {
      setSaved(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved(prev => { const n = { ...prev }; delete n[id]; return n; }), 2000);
      cancelEdit(id);
      loadRestaurants();
    }
    setSaving(prev => ({ ...prev, [id]: false }));
  };

  const toggleActive = async (r) => {
    await supabase.from("restaurants").update({ active: !r.active }).eq("id", r.id);
    loadRestaurants();
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm("Remove this restaurant? This cannot be undone.")) return;
    await supabase.from("restaurants").delete().eq("id", id);
    loadRestaurants();
  };

  const addRestaurant = async () => {
    if (!newRest.name.trim()) return;
    const id = newRest.name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_");
    const maxOrder = Math.max(...restaurants.map(r => r.sort_order), 0);
    const { error } = await supabase.from("restaurants").insert({ id, name: newRest.name.trim(), description: newRest.description.trim(), sort_order: maxOrder + 1, active: true });
    if (!error) { setNewRest({ name: "", description: "" }); setAdding(false); loadRestaurants(); }
    else alert("Could not add restaurant. The name may already exist.");
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0, border: "none", padding: 0 }}>RESTAURANTS</div>
        <button className="btn-yellow" onClick={() => setAdding(a => !a)}>{adding ? "CANCEL" : "+ ADD RESTAURANT"}</button>
      </div>

      {restaurants.map(r => (
        <div key={r.id} className={`rest-editor-row${r.active ? "" : " inactive"}`}>
          {editing[r.id] ? (
            <>
              <div className="rest-editor-fields">
                <input className="rest-input" placeholder="Restaurant name" value={editing[r.id].name} onChange={e => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], name: e.target.value } }))} />
                <input className="rest-input" placeholder="Description (shown under name)" value={editing[r.id].description} onChange={e => setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], description: e.target.value } }))} />
              </div>
              <div className="rest-actions">
                <button className="btn-sm success" onClick={() => saveEdit(r.id)} disabled={saving[r.id]}>{saving[r.id] ? "Saving..." : "Save"}</button>
                <button className="btn-sm" onClick={() => cancelEdit(r.id)}>Cancel</button>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: r.active ? "#fff" : "#666" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{r.description}</div>
              </div>
              {saved[r.id] && <span style={{ color: "#7ab320", fontSize: 12 }}>Saved!</span>}
              <div className="rest-actions">
                <button className="btn-sm" onClick={() => startEdit(r)}>Edit</button>
                <button className="btn-sm" onClick={() => toggleActive(r)}>{r.active ? "Hide" : "Show"}</button>
                <button className="btn-sm danger" onClick={() => deleteRestaurant(r.id)}>Remove</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {adding && (
        <div className="add-rest-form">
          <div className="add-rest-title">ADD NEW RESTAURANT</div>
          <div className="rest-editor-fields">
            <input className="rest-input" placeholder="Restaurant name *" value={newRest.name} onChange={e => setNewRest(p => ({ ...p, name: e.target.value }))} />
            <input className="rest-input" placeholder="Description (optional)" value={newRest.description} onChange={e => setNewRest(p => ({ ...p, description: e.target.value }))} />
          </div>
          <button className="btn-yellow" onClick={addRestaurant}>ADD</button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab] = useState("leaderboard");

  useEffect(() => {
    document.title = "Poutine Week — Admin";
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); if (s) loadData(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadData(); }, [session]);

  const loadData = async () => {
    setDataLoading(true);
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("participants").select("*").order("created_at", { ascending: false }),
      supabase.from("restaurants").select("*").order("sort_order"),
    ]);
    if (p) setParticipants(p);
    if (r) setRestaurants(r);
    setDataLoading(false);
  };

  const resetAllVotes = async () => {
    if (!window.confirm("Reset ALL votes and visits for every participant? This cannot be undone.")) return;
    const { error } = await supabase.from("participants").update({ visited: [], favorite: null }).neq("email", "");
    if (!error) { await loadData(); alert("All votes and visits have been reset."); }
    else alert("Something went wrong: " + error.message);
  };

  const signOut = async () => { await supabase.auth.signOut(); setSession(null); setParticipants([]); };

  if (loading) return <div style={{ background: "#111", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", color: "#FFD000", fontSize: 20 }}>Loading...</div>;
  if (!session) return <LoginForm />;

  const voteCounts = {}; const visitCounts = {};
  restaurants.forEach(r => { voteCounts[r.id] = 0; visitCounts[r.id] = 0; });
  participants.forEach(p => {
    if (p.favorite) voteCounts[p.favorite] = (voteCounts[p.favorite] || 0) + 1;
    (p.visited || []).forEach(id => { visitCounts[id] = (visitCounts[id] || 0) + 1; });
  });

  const ranked = [...restaurants]
    .map(r => ({ ...r, votes: voteCounts[r.id] || 0, visits: visitCounts[r.id] || 0 }))
    .sort((a, b) => b.votes - a.votes || b.visits - a.visits);

  const maxVotes = Math.max(...ranked.map(r => r.votes), 1);
  const totalVoters = participants.filter(p => p.favorite).length;

  return (
    <div className="admin-app">
      <style>{css}</style>
      <div className="admin-header">
        <div className="admin-title">POUTINE WEEK — ADMIN</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={loadData}>{dataLoading ? "..." : "Refresh"}</button>
          <button className="btn-danger" onClick={resetAllVotes}>Reset All Votes</button>
          <button className="btn-ghost" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div className="admin-main">
        <div className="tabs">
          <button className={`tab${tab === "leaderboard" ? " active" : ""}`} onClick={() => setTab("leaderboard")}>LEADERBOARD</button>
          <button className={`tab${tab === "restaurants" ? " active" : ""}`} onClick={() => setTab("restaurants")}>RESTAURANTS</button>
          <button className={`tab${tab === "participants" ? " active" : ""}`} onClick={() => setTab("participants")}>PARTICIPANTS</button>
        </div>

        {tab === "leaderboard" && (
          <>
            <div className="stat-grid">
              {[{ label: "Participants", value: participants.length }, { label: "Votes Cast", value: totalVoters }, { label: "Restaurants", value: restaurants.filter(r => r.active).length }].map(s => (
                <div key={s.label} className="stat-card"><div className="stat-num">{s.value}</div><div className="stat-label">{s.label}</div></div>
              ))}
            </div>
            <div className="section-label">RANKINGS</div>
            {ranked.filter(r => r.active).map((r, i) => (
              <div key={r.id} className={`rank-row${i === 0 && r.votes > 0 ? " top" : ""}`}>
                <span style={{ fontSize: 14, fontWeight: 700, minWidth: 28, color: "#FFD000" }}>{r.votes > 0 ? (medals[i] || "#" + (i + 1)) : "—"}</span>
                <div style={{ flex: 1 }}>
                  <div className={`rank-name${i === 0 && r.votes > 0 ? " top" : ""}`}>{r.name}</div>
                  <div className="rank-bar-bg"><div className="rank-bar" style={{ width: (r.votes / maxVotes * 100) + "%" }} /></div>
                  <div className="rank-visits">{r.visits} visited</div>
                </div>
                <div className="rank-votes">{r.votes}<div style={{ fontFamily: "DM Sans", fontSize: 10, color: "#666", fontWeight: 400 }}>votes</div></div>
              </div>
            ))}
          </>
        )}

        {tab === "restaurants" && <RestaurantEditor />}

        {tab === "participants" && (
          <>
            <div className="section-label">ALL PARTICIPANTS {dataLoading && "· LOADING..."}</div>
            {participants.map(p => {
              const fav = restaurants.find(r => r.id === p.favorite);
              return (
                <div key={p.email} className="participant-row">
                  <div className="p-email">{p.email}</div>
                  <div className="p-visits">{(p.visited || []).length} visited</div>
                  {fav ? <div className="p-voted">{fav.name}</div> : <div className="p-novote">No vote yet</div>}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
