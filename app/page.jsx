"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xvulyfnioguodavfkteb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dWx5Zm5pb2d1b2RhdmZrdGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTQsImV4cCI6MjA5NDg2MzAxNH0.yMvc8y_lcBhZFPhWhWNnsoAZayKjX52CDHAf66IixwU"
);

const RESTAURANTS = [
  { id: "brewery_vivant", name: "Brewery Vivant", emoji: "🍺", description: "TESTBelgian-inspired pub poutine" },
  { id: "ganders", name: "Ganders at the B.O.B.", emoji: "🏢", description: "Downtown classic with a twist" },
  { id: "barrio", name: "Barrio", emoji: "🌶️", description: "Latin-fusion poutine experience" },
  { id: "the_meanwhile", name: "The Meanwhile Bar", emoji: "🎸", description: "Rock-and-roll loaded poutine" },
  { id: "kitchen_by_lons", name: "Kitchen by Lon's", emoji: "🍴", description: "Elevated upscale curds & gravy" },
  { id: "terra_grt", name: "Terra GR", emoji: "🌱", description: "Farm-to-table vegetarian option" },
  { id: "rockford_brewing", name: "Rockford Brewing", emoji: "🍻", description: "Craft beer braised poutine" },
  { id: "the_cheshire", name: "The Cheshire", emoji: "🐱", description: "Quirky neighborhood favourite" },
];

const RATING_LABELS = ["", "Meh", "Decent", "Good", "Great", "Incredible!"];
const STAR_COLORS = ["", "#aaa", "#f4a261", "#e9c46a", "#2a9d8f", "#e63946"];

const GRAVY_QUOTES = [
  "Every vote counts... like curds in gravy.",
  "Your cheese squeak is your voice.",
  "Michigan's poutine scene is no joke — vote wisely.",
  "Gravy flows where democracy leads.",
  "The people's choice: drowned in glory.",
];

function Star({ filled, color, onClick, onHover, size = 28 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      onClick={onClick} onMouseEnter={onHover}
      style={{ cursor: "pointer", transition: "transform 0.1s", display: "inline-block" }}
      onMouseDown={e => e.currentTarget.style.transform = "scale(0.88)"}
      onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={filled ? color : "none"}
        stroke={filled ? color : "#ccc"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}
      onMouseLeave={() => setHover(0)}>
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          filled={i <= display}
          color={STAR_COLORS[display] || "#e9c46a"}
          onClick={() => onChange(i)}
          onHover={() => setHover(i)}
        />
      ))}
      {display > 0 && (
        <span style={{
          marginLeft: 8, fontSize: 13, fontWeight: 600,
          color: STAR_COLORS[display],
          minWidth: 70,
          fontFamily: "'Georgia', serif",
          letterSpacing: "0.02em"
        }}>
          {RATING_LABELS[display]}
        </span>
      )}
    </div>
  );
}

function VoteCard({ restaurant, onVote, voted, userRating }) {
  const [rating, setRating] = useState(userRating || 0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    await onVote(restaurant.id, rating, notes);
    setSuccess(true);
    setSubmitting(false);
  };

  if (success || voted) {
    return (
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        border: "2px solid #c89c3c",
        borderRadius: 16,
        padding: "1.5rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 8, minHeight: 200,
        position: "relative", overflow: "hidden"
      }}>
        <div style={{ fontSize: 40 }}>{restaurant.emoji}</div>
        <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 18, textAlign: "center", fontFamily: "'Georgia', serif" }}>
          {restaurant.name}
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 4 }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} filled={i <= (userRating || rating)} color="#c89c3c" size={22} />
          ))}
        </div>
        <div style={{
          background: "rgba(200,156,60,0.15)", border: "1px solid #c89c3c",
          borderRadius: 20, padding: "4px 14px", marginTop: 6,
          color: "#c89c3c", fontSize: 13, fontWeight: 600
        }}>
          ✓ Vote submitted!
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#16213e",
      border: "1.5px solid #2a2a4a",
      borderRadius: 16, padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: 10,
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#c89c3c"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a4a"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>{restaurant.emoji}</span>
        <div>
          <div style={{ color: "#f0e6c8", fontWeight: 700, fontSize: 16, fontFamily: "'Georgia', serif" }}>
            {restaurant.name}
          </div>
          <div style={{ color: "#7a7a9a", fontSize: 12, marginTop: 2 }}>{restaurant.description}</div>
        </div>
      </div>
      <StarRating value={rating} onChange={setRating} />
      <input
        type="text"
        placeholder="Tasting notes (optional)..."
        value={notes}
        onChange={e => setNotes(e.target.value)}
        style={{
          background: "#0f0f23", border: "1px solid #2a2a4a", borderRadius: 8,
          color: "#d4c9a8", fontSize: 13, padding: "7px 12px",
          outline: "none", fontFamily: "inherit",
          transition: "border-color 0.2s"
        }}
        onFocus={e => e.target.style.borderColor = "#c89c3c"}
        onBlur={e => e.target.style.borderColor = "#2a2a4a"}
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || submitting}
        style={{
          background: rating > 0 ? "linear-gradient(90deg, #c89c3c, #e8b94f)" : "#2a2a3a",
          color: rating > 0 ? "#1a1408" : "#555",
          border: "none", borderRadius: 8,
          padding: "8px 0", fontWeight: 700, fontSize: 13,
          cursor: rating > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s",
          letterSpacing: "0.05em",
          fontFamily: "inherit"
        }}
      >
        {submitting ? "Submitting..." : "Cast My Vote"}
      </button>
    </div>
  );
}

function Leaderboard({ votes }) {
  const totals = {};
  const counts = {};
  RESTAURANTS.forEach(r => { totals[r.id] = 0; counts[r.id] = 0; });
  votes.forEach(v => {
    totals[v.restaurantId] = (totals[v.restaurantId] || 0) + v.rating;
    counts[v.restaurantId] = (counts[v.restaurantId] || 0) + 1;
  });

  const ranked = RESTAURANTS
    .map(r => ({
      ...r,
      avg: counts[r.id] > 0 ? totals[r.id] / counts[r.id] : 0,
      count: counts[r.id]
    }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.avg - a.avg || b.count - a.count);

  if (ranked.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "#5a5a7a", padding: "3rem 1rem", fontSize: 14 }}>
        No votes yet — be the first to taste and vote!
      </div>
    );
  }

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ranked.map((r, i) => {
        const barWidth = Math.round((r.avg / 5) * 100);
        return (
          <div key={r.id} style={{
            background: i === 0 ? "linear-gradient(90deg, #1e1608, #2a1f0a)" : "#12122a",
            border: i === 0 ? "1.5px solid #c89c3c" : "1px solid #1e1e3a",
            borderRadius: 12, padding: "0.9rem 1.1rem",
            display: "flex", alignItems: "center", gap: 12
          }}>
            <span style={{ fontSize: 22, minWidth: 28, textAlign: "center" }}>{medals[i] || `#${i+1}`}</span>
            <span style={{ fontSize: 22 }}>{r.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ color: i === 0 ? "#f0d080" : "#c0b8d0", fontWeight: 700, fontSize: 15, fontFamily: "'Georgia', serif" }}>
                  {r.name}
                </span>
                <span style={{ color: "#c89c3c", fontWeight: 700, fontSize: 16, marginLeft: 8 }}>
                  {r.avg.toFixed(1)} <span style={{ color: "#7a7a6a", fontSize: 12, fontWeight: 400 }}>/ 5</span>
                </span>
              </div>
              <div style={{ marginTop: 6, background: "#0a0a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: i === 0 ? "linear-gradient(90deg, #c89c3c, #f0d080)" : "#3a3a6a",
                  width: `${barWidth}%`,
                  transition: "width 0.8s ease"
                }} />
              </div>
              <div style={{ color: "#5a5a7a", fontSize: 12, marginTop: 4 }}>
                {r.count} vote{r.count !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("vote");
  const [votes, setVotes] = useState([]);
  const [voterName, setVoterName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [quoteIdx] = useState(Math.floor(Math.random() * GRAVY_QUOTES.length));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("votes").select("*");
      if (data) {
        setVotes(data.map(v => ({
          restaurantId: v.restaurant_id,
          rating: v.rating,
          notes: v.notes,
          voter: v.voter,
        })));
      }
      setLoading(false);
    })();
  }, []);

  const handleVote = async (restaurantId, rating, notes) => {
    const newVote = { restaurantId, rating, notes, voter: voterName };
    await supabase.from("votes").insert({
      voter: voterName,
      restaurant_id: restaurantId,
      rating: rating,
      notes: notes,
    });
    setVotes(prev => [...prev, newVote]);
  };

  const userVoted = votes
    .filter(v => v.voter === voterName)
    .reduce((acc, v) => { acc[v.restaurantId] = v.rating; return acc; }, {});

  const totalVotes = votes.length;

  if (loading) {
    return (
      <div style={{ background: "#0d0d1f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c89c3c", fontFamily: "'Georgia', serif", fontSize: 18 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{
      background: "#0d0d1f",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: "#f0e6c8",
      paddingBottom: 40
    }}>
      <div style={{
        background: "linear-gradient(180deg, #1a0e00 0%, #0d0d1f 100%)",
        borderBottom: "1px solid #2a1f0a",
        padding: "1.5rem 1rem 1rem",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#7a6a3a", textTransform: "uppercase", marginBottom: 6 }}>
          Grand Rapids · Michigan Street
        </div>
        <h1 style={{
          fontFamily: "'Georgia', serif",
          fontSize: "clamp(26px, 5vw, 42px)",
          fontWeight: 700,
          margin: 0,
          color: "#c89c3c",
          lineHeight: 1.15
        }}>
          🍟 Poutine Week
        </h1>
        <div style={{ color: "#c89c3c", fontSize: 14, marginTop: 6, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
          {GRAVY_QUOTES[quoteIdx]}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 20 }}>{totalVotes}</div>
            <div style={{ color: "#5a5a7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Votes</div>
          </div>
          <div style={{ width: 1, background: "#2a2a4a" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 20 }}>{RESTAURANTS.length}</div>
            <div style={{ color: "#5a5a7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Restaurants</div>
          </div>
          <div style={{ width: 1, background: "#2a2a4a" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 20 }}>
              {new Set(votes.map(v => v.voter).filter(Boolean)).size}
            </div>
            <div style={{ color: "#5a5a7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Participants</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 1rem" }}>
        {!nameConfirmed && (
          <div style={{
            background: "#16213e", border: "1px solid #2a2a4a",
            borderRadius: 16, padding: "1.5rem",
            margin: "1.5rem 0", textAlign: "center"
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🧑‍🍳</div>
            <div style={{ color: "#c0b8d0", fontWeight: 600, marginBottom: 4, fontFamily: "'Georgia', serif", fontSize: 17 }}>
              Welcome, Poutine Explorer!
            </div>
            <div style={{ color: "#5a5a7a", fontSize: 13, marginBottom: 16 }}>
              Enter your name to track your votes across restaurants.
            </div>
            <div style={{ display: "flex", gap: 8, maxWidth: 360, margin: "0 auto" }}>
              <input
                type="text"
                placeholder="Your name..."
                value={voterName}
                onChange={e => setVoterName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && voterName.trim() && setNameConfirmed(true)}
                style={{
                  flex: 1, background: "#0f0f23", border: "1px solid #3a3a6a",
                  borderRadius: 8, color: "#d4c9a8", fontSize: 14,
                  padding: "8px 14px", outline: "none", fontFamily: "inherit"
                }}
              />
              <button
                onClick={() => voterName.trim() && setNameConfirmed(true)}
                style={{
                  background: "linear-gradient(90deg, #c89c3c, #e8b94f)",
                  color: "#1a1408", border: "none", borderRadius: 8,
                  padding: "8px 18px", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit"
                }}
              >
                Let&apos;s Go
              </button>
            </div>
          </div>
        )}

        {nameConfirmed && (
          <>
            <div style={{ display: "flex", gap: 2, margin: "1.5rem 0 1rem", background: "#12122a", borderRadius: 10, padding: 4 }}>
              {[
                { id: "vote", label: "🗳️ Vote", sub: "Rate restaurants" },
                { id: "leaderboard", label: "🏆 Leaderboard", sub: "See rankings" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  flex: 1, background: tab === t.id ? "#1e1e3e" : "transparent",
                  border: tab === t.id ? "1px solid #c89c3c" : "1px solid transparent",
                  borderRadius: 8, padding: "10px 8px",
                  color: tab === t.id ? "#c89c3c" : "#5a5a7a",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s"
                }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.label}</div>
                  <div style={{ fontSize: 11, marginTop: 1, color: tab === t.id ? "#8a7a4a" : "#3a3a5a" }}>{t.sub}</div>
                </button>
              ))}
            </div>

            {tab === "vote" && (
              <>
                <div style={{ color: "#5a5a7a", fontSize: 13, marginBottom: 14, textAlign: "center" }}>
                  Voting as <span style={{ color: "#c89c3c", fontWeight: 600 }}>{voterName}</span>
                  {" · "}
                  <span
                    style={{ color: "#5a5a7a", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => { setNameConfirmed(false); setVoterName(""); }}
                  >change name</span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
                  gap: 14
                }}>
                  {RESTAURANTS.map(r => (
                    <VoteCard
                      key={r.id}
                      restaurant={r}
                      onVote={handleVote}
                      voted={!!userVoted[r.id]}
                      userRating={userVoted[r.id]}
                    />
                  ))}
                </div>
              </>
            )}

            {tab === "leaderboard" && (
              <Leaderboard votes={votes} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
