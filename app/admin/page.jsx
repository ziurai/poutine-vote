"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xvulyfnioguodavfkteb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dWx5Zm5pb2d1b2RhdmZrdGViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyODcwMTQsImV4cCI6MjA5NDg2MzAxNH0.yMvc8y_lcBhZFPhWhWNnsoAZayKjX52CDHAf66IixwU"
);

const ADMIN_EMAILS = ["alexziuraitis@gmail.com"]; // add admin emails here

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

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const email = session.user?.email;
    if (ADMIN_EMAILS.includes(email)) {
      setIsAdmin(true);
      loadData();
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  const loadData = async () => {
    setDataLoading(true);
    const { data } = await supabase.from("participants").select("*");
    if (data) setParticipants(data);
    setDataLoading(false);
  };

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.href }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const voteCounts = {};
  const visitCounts = {};
  RESTAURANTS.forEach(r => { voteCounts[r.id] = 0; visitCounts[r.id] = 0; });
  participants.forEach(p => {
    if (p.favorite) voteCounts[p.favorite] = (voteCounts[p.favorite] || 0) + 1;
    (p.visited || []).forEach(id => { visitCounts[id] = (visitCounts[id] || 0) + 1; });
  });

  const ranked = [...RESTAURANTS]
    .map(r => ({ ...r, votes: voteCounts[r.id] || 0, visits: visitCounts[r.id] || 0 }))
    .sort((a, b) => b.votes - a.votes || b.visits - a.visits);

  const totalVoters = participants.filter(p => p.favorite).length;
  const totalParticipants = participants.length;

  if (loading) {
    return (
      <div style={{ background: "#0d0d1f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#c89c3c", fontFamily: "'Georgia', serif", fontSize: 18 }}>Loading…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ background: "#0d0d1f", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontFamily: "'Georgia', serif", color: "#c89c3c", fontSize: 28, margin: "0 0 8px" }}>Admin Access</h1>
        <p style={{ color: "#5a5a7a", fontSize: 14, marginBottom: 28 }}>Sign in with Google to view the leaderboard.</p>
        <button
          onClick={signIn}
          style={{ background: "#fff", color: "#1a1a1a", border: "none", borderRadius: 8, padding: "12px 28px", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{ fontSize: 18 }}>G</span> Sign in with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ background: "#0d0d1f", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⛔</div>
        <h1 style={{ fontFamily: "'Georgia', serif", color: "#e63946", fontSize: 24, margin: "0 0 8px" }}>Access Denied</h1>
        <p style={{ color: "#5a5a7a", fontSize: 14, marginBottom: 20 }}>Your account doesn't have admin access.</p>
        <p style={{ color: "#5a5a7a", fontSize: 12, marginBottom: 20 }}>Signed in as: {session.user?.email}</p>
        <button onClick={signOut} style={{ background: "transparent", color: "#5a5a7a", border: "1px solid #3a3a5a", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: "inherit" }}>
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#0d0d1f", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", paddingBottom: 40 }}>
      <div style={{ background: "linear-gradient(180deg, #1a0e00 0%, #0d0d1f 100%)", borderBottom: "1px solid #2a1f0a", padding: "1.25rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Georgia', serif", color: "#c89c3c", fontSize: 24, margin: 0 }}>🏆 Admin Leaderboard</h1>
          <div style={{ color: "#5a5a6a", fontSize: 12, marginTop: 4 }}>Poutine Week · Michigan Street</div>
        </div>
        <button onClick={signOut} style={{ background: "transparent", color: "#5a5a7a", border: "1px solid #3a3a5a", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Participants", value: totalParticipants },
            { label: "Votes cast", value: totalVoters },
            { label: "Restaurants", value: RESTAURANTS.length },
          ].map(s => (
            <div key={s.label} style={{ background: "#16213e", border: "1px solid #2a2a4a", borderRadius: 12, padding: "1rem", textAlign: "center" }}>
              <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 28 }}>{s.value}</div>
              <div style={{ color: "#5a5a7a", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: "#7a6a3a", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>Rankings</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ranked.map((r, i) => (
              <div key={r.id} style={{
                background: i === 0 && r.votes > 0 ? "linear-gradient(90deg, #1e1608, #2a1f0a)" : "#12122a",
                border: i === 0 && r.votes > 0 ? "1.5px solid #c89c3c" : "1px solid #1e1e3a",
                borderRadius: 12, padding: "0.9rem 1rem",
                display: "flex", alignItems: "center", gap: 12
              }}>
                <span style={{ fontSize: 20, minWidth: 28, textAlign: "center" }}>{r.votes > 0 ? (medals[i] || `#${i+1}`) : "—"}</span>
                <span style={{ fontSize: 20 }}>{r.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: i === 0 && r.votes > 0 ? "#f0d080" : "#c0b8d0", fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                  <div style={{ color: "#5a5a7a", fontSize: 11, marginTop: 2 }}>{r.visits} visited</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#c89c3c", fontWeight: 700, fontSize: 18 }}>{r.votes}</div>
                  <div style={{ color: "#5a5a7a", fontSize: 11 }}>vote{r.votes !== 1 ? "s" : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Participant list */}
        <div>
          <div style={{ color: "#7a6a3a", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>All Participants</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {participants.map(p => {
              const fav = RESTAURANTS.find(r => r.id === p.favorite);
              return (
                <div key={p.email} style={{ background: "#12122a", border: "1px solid #1e1e3a", borderRadius: 10, padding: "0.7rem 1rem", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#c0b8d0", fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.email}</div>
                    <div style={{ color: "#5a5a7a", fontSize: 11, marginTop: 2 }}>{(p.visited || []).length} visited</div>
                  </div>
                  {fav ? (
                    <div style={{ color: "#c89c3c", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{fav.emoji} {fav.name}</div>
                  ) : (
                    <div style={{ color: "#3a3a5a", fontSize: 12, flexShrink: 0 }}>No vote yet</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
