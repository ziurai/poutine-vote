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

const GRAVY_QUOTES = [
  "Every vote counts... like curds in gravy.",
  "Your cheese squeak is your voice.",
  "Michigan's poutine scene is no joke — vote wisely.",
  "Gravy flows where democracy leads.",
  "The people's choice: drowned in glory.",
];

function EmailGate({ onEnter }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("participants")
        .select("*")
        .eq("email", clean)
        .single();
      if (err && err.code === "PGRST116") {
        const { data: newP, error: insertErr } = await supabase
          .from("participants")
          .insert({ email: clean, visited: [], favorite: null })
          .select()
          .single();
        if (insertErr) throw insertErr;
        onEnter(newP);
      } else if (err) {
        throw err;
      } else {
        onEnter(data);
      }
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🍟</div>
      <h1 style={{ fontFamily: "'Georgia', serif", color: "#c89c3c", fontSize: "clamp(28px, 5vw, 44px)", margin: "0 0 6px", textAlign: "center" }}>
        Poutine Week
      </h1>
      <p style={{ color: "#7a6a3a", fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 32 }}>
        Grand Rapids · Michigan Street
      </p>
      <div style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 400 }}>
        <div style={{ color: "#c0b8d0", fontWeight: 600, fontSize: 17, fontFamily: "'Georgia', serif", marginBottom: 6 }}>
          Welcome, Poutine Explorer!
        </div>
        <div style={{ color: "#5a5a7a", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
          Enter your email to track which restaurants you've visited and cast your vote for the best poutine.
        </div>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(""); }}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          style={{ width: "100%", boxSizing: "border-box", background: "#0f0f23", border: "1px solid #3a3a6a", borderRadius: 8, color: "#d4c9a8", fontSize: 15, padding: "10px 14px", outline: "none", fontFamily: "inherit", marginBottom: 8 }}
        />
        {error && <div style={{ color: "#e63946", fontSize: 13, marginBottom: 8 }}>{error}</div>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", background: "linear-gradient(90deg, #c89c3c, #e8b94f)", color: "#1a1408", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}
        >
          {loading ? "Loading..." : "Let's Go →"}
        </button>
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
    const { data, error } = await supabase
      .from("participants")
      .update({ visited })
      .eq("email", participant.email)
      .select()
      .single();
    if (!error) {
      onUpdate(data);
      setSavedMsg("Saved!");
      setTimeout(() => setSavedMsg(""), 2000);
    }
    setSaving(false);
  };

  const castVote = async (id) => {
    if (favorite) return;
    const rest = RESTAURANTS.find(x => x.id === id);
    if (!window.confirm(`Cast your final vote for "${rest.name}"?

This cannot be changed after submitting.`)) return;
    setVoteSaving(true);
    const { data, error } = await supabase
      .from("participants")
      .update({ favorite: id })
      .eq("email", participant.email)
      .select()
      .single();
    if (!error) {
      setFavorite(id);
      onUpdate(data);
    }
    setVoteSaving(false);
  };

  const visitedRestaurants = RESTAURANTS.filter(r => visited.includes(r.id));
  const canVote = visited.length >= 1;

  return (
    <div style={{ background: "#0d0d1f", minHeight: "100vh", paddingBottom: 40, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(180deg, #1a0e00 0%, #0d0d1f 100%)", borderBottom: "1px solid #2a1f0a", padding: "1.25rem 1rem", textAlign: "center" }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#7a6a3a", textTransform: "uppercase", marginBottom: 4 }}>Grand Rapids · Michigan Street</div>
        <h1 style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 700, margin: 0, color: "#c89c3c" }}>🍟 Poutine Week</h1>
        <div style={{ color: "#5a5a6a", fontSize: 12, marginTop: 6 }}>Signed in as <span style={{ color: "#c89c3c" }}>{participant.email}</span></div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>

        {/* Step 1: Mark visited */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ background: "#c89c3c", color: "#1a1408", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>1</div>
            <div>
              <div style={{ color: "#f0e6c8", fontWeight: 600, fontSize: 16 }}>Which restaurants have you visited?</div>
              <div style={{ color: "#5a5a7a", fontSize: 12, marginTop: 2 }}>Check off each place you've tried. Come back and add more as you go!</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {RESTAURANTS.map(r => {
              const isVisited = visited.includes(r.id);
              const isFav = favorite === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => toggleVisited(r.id)}
                  style={{
                    background: isVisited ? (isFav ? "linear-gradient(135deg, #1e1608, #2a1f0a)" : "#0f1e0f") : "#16213e",
                    border: isFav ? "2px solid #c89c3c" : isVisited ? "1.5px solid #2a5a2a" : "1.5px solid #2a2a4a",
                    borderRadius: 12, padding: "0.9rem 1rem",
                    cursor: isFav ? "default" : "pointer",
                    display: "flex", alignItems: "center", gap: 12,
                    transition: "all 0.15s",
                    userSelect: "none"
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                    background: isVisited ? (isFav ? "#c89c3c" : "#2a8a2a") : "transparent",
                    border: isVisited ? "none" : "2px solid #3a3a5a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#fff", fontWeight: 700
                  }}>
                    {isVisited ? (isFav ? "★" : "✓") : ""}
                  </div>
                  <span style={{ fontSize: 22 }}>{r.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: isVisited ? "#f0e6c8" : "#8a8aaa", fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ color: "#5a5a7a", fontSize: 11, marginTop: 1 }}>{r.description}</div>
                  </div>
                  {isFav && <div style={{ color: "#c89c3c", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>YOUR PICK</div>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14 }}>
            <button
              onClick={saveVisited}
              disabled={saving}
              style={{
                background: "linear-gradient(90deg, #c89c3c, #e8b94f)", color: "#1a1408",
                border: "none", borderRadius: 8, padding: "9px 22px",
                fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit"
              }}
            >
              {saving ? "Saving..." : "Save My Visits"}
            </button>
            {savedMsg && <span style={{ color: "#2a9d8f", fontSize: 13, fontWeight: 600 }}>{savedMsg}</span>}
            <span style={{ color: "#5a5a7a", fontSize: 12, marginLeft: "auto" }}>{visited.length} of {RESTAURANTS.length} visited</span>
          </div>
        </div>

        {/* Step 2: Cast vote */}
        <div style={{ borderTop: "1px solid #1e1e3a", paddingTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ background: canVote ? "#c89c3c" : "#2a2a4a", color: canVote ? "#1a1408" : "#5a5a7a", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>2</div>
            <div>
              <div style={{ color: canVote ? "#f0e6c8" : "#5a5a7a", fontWeight: 600, fontSize: 16 }}>Which is your favourite?</div>
              <div style={{ color: "#5a5a7a", fontSize: 12, marginTop: 2 }}>
                {favorite ? "Your vote has been cast — thank you!" : canVote ? "⚠️ This cannot be changed once submitted. Choose wisely!" : "Visit at least one restaurant first."}
              </div>
            </div>
          </div>

          {canVote && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
              {visitedRestaurants.map(r => {
                const isFav = favorite === r.id;
                const isOtherFav = favorite && !isFav;
                return (
                  <div
                    key={r.id}
                    onClick={() => !favorite && castVote(r.id)}
                    style={{
                      background: isFav ? "linear-gradient(135deg, #1e1608, #2a1f0a)" : "#16213e",
                      border: isFav ? "2px solid #c89c3c" : "1.5px solid #2a2a4a",
                      borderRadius: 12, padding: "1rem",
                      cursor: favorite ? "default" : "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      opacity: isOtherFav ? 0.4 : 1,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!favorite) e.currentTarget.style.borderColor = "#c89c3c"; }}
                    onMouseLeave={e => { if (!isFav) e.currentTarget.style.borderColor = "#2a2a4a"; }}
                  >
                    <span style={{ fontSize: 26 }}>{r.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: isFav ? "#f0d080" : "#c0b8d0", fontWeight: 700, fontSize: 15, fontFamily: "'Georgia', serif" }}>{r.name}</div>
                      <div style={{ color: "#5a5a7a", fontSize: 11, marginTop: 2 }}>{r.description}</div>
                    </div>
                    {isFav && (
                      <div style={{ background: "rgba(200,156,60,0.2)", border: "1px solid #c89c3c", borderRadius: 20, padding: "4px 12px", color: "#c89c3c", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        ★ My Pick
                      </div>
                    )}
                    {!favorite && (
                      <div style={{ color: "#3a3a6a", fontSize: 12, flexShrink: 0, textAlign: "right", lineHeight: 1.4 }}>Tap to vote</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {voteSaving && <div style={{ color: "#c89c3c", fontSize: 13, marginTop: 10 }}>Saving your vote...</div>}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [participant, setParticipant] = useState(null);
  const [quoteIdx] = useState(Math.floor(Math.random() * GRAVY_QUOTES.length));

  return participant
    ? <MainApp participant={participant} onUpdate={setParticipant} />
    : <EmailGate onEnter={setParticipant} />;
}
