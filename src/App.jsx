import { useState, useEffect, useRef } from "react";
 
const ADMIN_PASSWORD = "grest2026";
 
const initialTeams = [
  { id: 1, name: "Squadra Sole", points: 0, color: "#F5C500", icon: "☀️", img: null },
  { id: 2, name: "Squadra Cielo", points: 0, color: "#29B8D8", icon: "🐦", img: null },
  { id: 3, name: "Squadra Fuoco", points: 0, color: "#F4631E", icon: "🔥", img: null },
  { id: 4, name: "Squadra Rosa", points: 0, color: "#E8295B", icon: "🌸", img: null },
];
 
const initialHistory = [
  { id: 1, year: "2024", winner: "Squadra Sole", theme: "Un esempio — cancellami!", notes: "", logo: null },
];
 
const style = document.createElement("style");
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff8ed; }
  @keyframes popIn { 0%{transform:scale(1)} 40%{transform:scale(1.07)} 100%{transform:scale(1)} }
  @keyframes fadeSlide { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  .card-anim { animation: popIn 0.45s ease; }
  .fade-in { animation: fadeSlide 0.35s ease both; }
  .team-card {
    background: white; border-radius: 20px; padding: 16px 18px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 4px 0 rgba(0,0,0,0.07);
    border: 3px solid transparent;
    transition: transform 0.18s, box-shadow 0.18s;
    animation: fadeSlide 0.45s ease both;
  }
  .team-card:hover { transform: translateY(-2px); box-shadow: 0 8px 0 rgba(0,0,0,0.07); }
  .btn {
    border: none; border-radius: 10px;
    font-family: 'Fredoka One', cursive;
    cursor: pointer; font-size: 15px; padding: 7px 13px;
    transition: transform 0.1s, filter 0.1s;
  }
  .btn:active { transform: scale(0.92); filter: brightness(0.88); }
  .progress-track { height: 11px; background: #f0ece6; border-radius: 999px; overflow: hidden; flex: 1; }
  .progress-fill { height: 100%; border-radius: 999px; transition: width 0.6s cubic-bezier(.34,1.56,.64,1); }
  input[type=number], input[type=text], textarea {
    background: #f9f5ef; border: 2px solid #e5ddd0; border-radius: 10px;
    color: #333; font-family: 'Nunito', sans-serif; font-size: 15px; padding: 7px 11px;
  }
  input[type=number] { text-align: center; }
  input[type=number]:focus, input[type=text]:focus, textarea:focus { outline: none; border-color: #F5C500; }
  textarea { resize: vertical; width: 100%; min-height: 56px; }
  .history-card {
    background: white; border-radius: 16px; padding: 16px 20px;
    border-left: 5px solid #F5C500;
    box-shadow: 0 3px 0 rgba(0,0,0,0.06);
    animation: fadeSlide 0.4s ease both;
  }
  .logo-circle {
    width: 110px; height: 110px; border-radius: 50%;
    background: white; margin: 0 auto 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 56px; box-shadow: 0 6px 0 rgba(0,0,0,0.13);
    overflow: hidden; position: relative;
  }
  .clickable-img { cursor: pointer; }
  .clickable-img:hover .img-overlay { opacity: 1; }
  .img-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
    color: white; font-size: 12px; font-family: 'Fredoka One', cursive;
    flex-direction: column; gap: 2px; border-radius: inherit;
  }
  .team-icon {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; overflow: hidden; position: relative; flex-shrink: 0;
    background: rgba(0,0,0,0.04);
  }
  .hist-logo {
    width: 48px; height: 48px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; overflow: hidden; position: relative; flex-shrink: 0;
    background: #f9f5ef; border: 2px solid #f0ece6;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #F5C500; border-radius: 99px; }
`;
document.head.appendChild(style);
 
// Leggi base64 da file
function readFile(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });
}
 
export default function App() {
  const [teams, setTeams] = useState(() => load("grest_teams", initialTeams));
  const [history, setHistory] = useState(() => load("grest_history", initialHistory));
  const [logo, setLogo] = useState(() => localStorage.getItem("grest_logo") || null);
  const [grestYear, setGrestYear] = useState(() => localStorage.getItem("grest_year") || "2026");
  const [hidePoints, setHidePoints] = useState(() => localStorage.getItem("grest_hide_points") === "true");
  const [editingYear, setEditingYear] = useState(false);
  const [yearTmp, setYearTmp] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [tab, setTab] = useState("classifica");
 
  // squadre
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTmp, setEditTmp] = useState({});
  const [pointInput, setPointInput] = useState({});
  const [addInput, setAddInput] = useState({});
  const [subInput, setSubInput] = useState({});
  const [animId, setAnimId] = useState(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", icon: "⭐", color: "#8e44ad", img: null });
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "team"|"history", id }
 
  // storico
  const [editingHistory, setEditingHistory] = useState(null);
  const [editHistTmp, setEditHistTmp] = useState({});
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newHist, setNewHist] = useState({ year: "", winner: "", theme: "", notes: "", logo: null });
 
  // refs per input file nascosti
  const logoRef = useRef();
  const newTeamImgRef = useRef();
  const editTeamImgRef = useRef();
  const newHistLogoRef = useRef();
  const editHistLogoRef = useRef();
 
  useEffect(() => { save("grest_teams", teams); }, [teams]);
  useEffect(() => { save("grest_history", history); }, [history]);
  useEffect(() => { if (logo) localStorage.setItem("grest_logo", logo); else localStorage.removeItem("grest_logo"); }, [logo]);
  useEffect(() => { localStorage.setItem("grest_year", grestYear); }, [grestYear]);
  useEffect(() => { localStorage.setItem("grest_hide_points", hidePoints); }, [hidePoints]);
 
  function load(key, def) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; } catch { return def; } }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
 
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  const maxPts = sorted[0]?.points || 1;
  const sortedHistory = [...history].sort((a, b) => b.year - a.year);
  const medals = ["🥇", "🥈", "🥉"];
  const rankBorder = ["#F5C500", "#C0C0C0", "#F4631E"];
  const rankBg = ["#FFFBEA", "#F8F8F8", "#FFF5EE"];
 
  const flash = (id) => { setAnimId(id); setTimeout(() => setAnimId(null), 500); };
  const addPts = (id, val) => { const n = parseInt(val); if (!isNaN(n) && n > 0) { setTeams(p => p.map(t => t.id === id ? { ...t, points: t.points + n } : t)); flash(id); } };
  const subPts = (id, val) => { const n = parseInt(val); if (!isNaN(n) && n > 0) { setTeams(p => p.map(t => t.id === id ? { ...t, points: Math.max(0, t.points - n) } : t)); flash(id); } };
  const setPts = (id) => { const n = parseInt(pointInput[id]); if (!isNaN(n) && n >= 0) { setTeams(p => p.map(t => t.id === id ? { ...t, points: n } : t)); setPointInput(p => ({ ...p, [id]: "" })); flash(id); } };
 
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPassword(""); setWrongPw(false); }
    else setWrongPw(true);
  };
 
  // Icona squadra: immagine se presente, altrimenti emoji
  const TeamIcon = ({ team, size = 52, emojiSize = 28 }) => (
    <div className="team-icon" style={{ width: size, height: size, fontSize: emojiSize }}>
      {team.img
        ? <img src={team.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <span>{team.icon || "⭐"}</span>
      }
    </div>
  );
 
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fff8ed,#ffecd2)", fontFamily: "'Nunito',sans-serif", paddingBottom: 60 }}>
 
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#F5C500,#F4631E 50%,#E8295B)", padding: "28px 20px 36px", textAlign: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: "0 8px 0 rgba(244,99,30,0.25)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -18, left: -18, width: 90, height: 90, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -28, right: -18, width: 110, height: 110, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: 12, right: 28, fontSize: 26, animation: "float 3s ease-in-out infinite" }}>🐦</div>
        <div style={{ position: "absolute", top: 18, left: 20, fontSize: 20, animation: "float 4s ease-in-out infinite 1s" }}>☀️</div>
 
        {/* LOGO GREST */}
        <div className={`logo-circle ${isAdmin ? "clickable-img" : ""}`} onClick={() => isAdmin && logoRef.current.click()}
          style={{ cursor: isAdmin ? "pointer" : "default" }}>
          {logo ? <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🌟</span>}
          {isAdmin && <div className="img-overlay" style={{ borderRadius: "50%" }}><span style={{ fontSize: 22 }}>📷</span><span>Cambia logo</span></div>}
        </div>
        <input ref={logoRef} type="file" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (f) setLogo(await readFile(f)); e.target.value = ""; }} style={{ display: "none" }} />
 
        <div style={{ color: "white", fontSize: 12, fontWeight: 700, letterSpacing: 6, opacity: 0.9, marginBottom: 2 }}>CRE</div>
        <div style={{ color: "white", fontSize: 50, fontFamily: "'Fredoka One',cursive", lineHeight: 1, textShadow: "0 4px 0 rgba(0,0,0,0.13)", letterSpacing: 2 }}>GREST</div>
 
        {/* Anno modificabile */}
        {editingYear && isAdmin ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 6 }}>
            <input type="text" value={yearTmp} onChange={e => setYearTmp(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setGrestYear(yearTmp); setEditingYear(false); } }}
              style={{ width: 120, textAlign: "center", fontSize: 18, fontFamily: "'Fredoka One',cursive", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "white", borderRadius: 10, padding: "4px 10px" }}
              autoFocus
            />
            <button onClick={() => { setGrestYear(yearTmp); setEditingYear(false); }} className="btn" style={{ background: "rgba(255,255,255,0.3)", color: "white", fontSize: 13, padding: "5px 10px" }}>✓</button>
            <button onClick={() => setEditingYear(false)} className="btn" style={{ background: "rgba(0,0,0,0.2)", color: "white", fontSize: 13, padding: "5px 10px" }}>✕</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <div style={{ color: "white", fontSize: 15, fontFamily: "'Fredoka One',cursive", opacity: 0.95 }}>Bella Fra! {grestYear}</div>
            {isAdmin && (
              <button onClick={() => { setYearTmp(grestYear); setEditingYear(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, padding: "2px 7px", color: "white" }}>✏️</button>
            )}
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3, fontStyle: "italic" }}>Guardate a lui e sarete raggianti — Sal 34</div>
 
        <div style={{ marginTop: 14 }}>
          {!isAdmin ? (
            <button onClick={() => setShowLogin(true)} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.35)", fontSize: 13 }}>🔒 Accesso Animatori</button>
          ) : (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,0.25)", color: "white", padding: "4px 14px", borderRadius: 999, fontFamily: "'Fredoka One',cursive", fontSize: 13 }}>✅ Admin</span>
              <button onClick={() => setShowAddTeam(s => !s)} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>➕ Squadra</button>
              <button onClick={() => setHidePoints(h => !h)} className="btn" style={{ background: hidePoints ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>
                {hidePoints ? "👁️ Mostra punti" : "🙈 Nascondi punti"}
              </button>
              <button onClick={() => setConfirmDelete({ type: "reset" })} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>🔄 Reset</button>
              <button onClick={() => setIsAdmin(false)} className="btn" style={{ background: "rgba(255,255,255,0.13)", color: "white", border: "2px solid rgba(255,255,255,0.25)", fontSize: 13 }}>🚪 Esci</button>
            </div>
          )}
        </div>
      </div>
 
      {/* TABS */}
      <div style={{ display: "flex", maxWidth: 580, margin: "20px auto 0", padding: "0 16px", gap: 10 }}>
        {["classifica", "storico"].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn" style={{
            flex: 1, padding: 11, fontSize: 16,
            background: tab === t ? "linear-gradient(135deg,#F5C500,#F4631E)" : "white",
            color: tab === t ? "white" : "#888",
            boxShadow: tab === t ? "0 4px 0 rgba(244,99,30,0.3)" : "0 3px 0 rgba(0,0,0,0.06)",
          }}>{t === "classifica" ? "🏆 Classifica" : "📅 Storico"}</button>
        ))}
      </div>
 
      {/* CONFERMA ELIMINA / RESET */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="fade-in" style={{ background: "white", borderRadius: 24, padding: 28, width: "100%", maxWidth: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>{confirmDelete.type === "reset" ? "🔄" : "🗑️"}</div>
            <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#333", marginBottom: 8 }}>
              {confirmDelete.type === "reset" ? "Azzerare tutti i punti?" : "Sei sicuro?"}
            </h3>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>Questa azione non può essere annullata.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => {
                if (confirmDelete.type === "team") setTeams(prev => prev.filter(t => t.id !== confirmDelete.id));
                if (confirmDelete.type === "history") setHistory(prev => prev.filter(h => h.id !== confirmDelete.id));
                if (confirmDelete.type === "reset") setTeams(p => p.map(t => ({ ...t, points: 0 })));
                setConfirmDelete(null);
              }} className="btn" style={{ flex: 1, padding: 12, background: "#E8295B", color: "white", fontSize: 15 }}>
                {confirmDelete.type === "reset" ? "Azzera" : "Elimina"}
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn" style={{ flex: 1, padding: 12, background: "#f0ece6", color: "#666", fontSize: 15 }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
 
      {/* LOGIN */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div className="fade-in" style={{ background: "white", borderRadius: 24, padding: 32, width: "100%", maxWidth: 340, boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
            <div style={{ textAlign: "center", fontSize: 40, marginBottom: 8 }}>🔐</div>
            <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: "#333", textAlign: "center", marginBottom: 18 }}>Accesso Animatori</h3>
            <input type="password" placeholder="Password" value={password}
              onChange={e => { setPassword(e.target.value); setWrongPw(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "11px 15px", fontSize: 16 }} autoFocus />
            {wrongPw && <p style={{ color: "#E8295B", fontSize: 13, marginTop: 6, textAlign: "center" }}>❌ Password errata!</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={handleLogin} className="btn" style={{ flex: 1, padding: 12, background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 16 }}>Entra</button>
              <button onClick={() => { setShowLogin(false); setPassword(""); setWrongPw(false); }} className="btn" style={{ flex: 1, padding: 12, background: "#f0ece6", color: "#666", fontSize: 16 }}>Annulla</button>
            </div>
          </div>
        </div>
      )}
 
      <div style={{ maxWidth: 580, margin: "18px auto 0", padding: "0 16px" }}>
 
        {/* ===== CLASSIFICA ===== */}
        {tab === "classifica" && (
          <>
            {/* Form nuova squadra */}
            {isAdmin && showAddTeam && (
              <div className="fade-in" style={{ background: "white", borderRadius: 18, padding: 18, marginBottom: 16, border: "3px solid #F5C500", boxShadow: "0 4px 0 rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: "#F4631E", marginBottom: 12 }}>➕ Nuova Squadra</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input type="text" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="Nome squadra" style={{ flex: 2, minWidth: 120 }} />
 
                  {/* Simbolo: emoji o immagine */}
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {newTeam.img
                      ? <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}>
                          <img src={newTeam.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      : <input type="text" value={newTeam.icon} onChange={e => setNewTeam(p => ({ ...p, icon: e.target.value }))} placeholder="🎯" style={{ width: 52, textAlign: "center", fontSize: 22 }} />
                    }
                    <button onClick={() => newTeamImgRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 8px" }} title="Carica immagine">📷</button>
                    {newTeam.img && <button onClick={() => setNewTeam(p => ({ ...p, img: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 8px" }}>✕</button>}
                    <input ref={newTeamImgRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={async (e) => { const f = e.target.files[0]; if (f) setNewTeam(p => ({ ...p, img: null, _imgFile: f })); e.target.value = ""; readFile(f).then(d => setNewTeam(p => ({ ...p, img: d }))); }} />
                  </div>
 
                  <input type="color" value={newTeam.color} onChange={e => setNewTeam(p => ({ ...p, color: e.target.value }))} style={{ width: 42, height: 38, border: "2px solid #e5ddd0", borderRadius: 10, cursor: "pointer" }} />
                  <button onClick={() => {
                    if (!newTeam.name.trim()) return;
                    setTeams(p => [...p, { id: Date.now(), name: newTeam.name.trim(), points: 0, color: newTeam.color, icon: newTeam.icon, img: newTeam.img }]);
                    setNewTeam({ name: "", icon: "⭐", color: "#8e44ad", img: null }); setShowAddTeam(false);
                  }} className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white" }}>Crea</button>
                </div>
              </div>
            )}
 
            {/* Banner punti nascosti */}
            {hidePoints && !isAdmin && (
              <div className="fade-in" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", borderRadius: 14, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🙈</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: "white" }}>Punti nascosti dagli animatori!</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>La classifica sarà svelata a breve...</div>
                </div>
              </div>
            )}
 
            {/* Cards squadre */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sorted.map((team, index) => (
                <div key={team.id} className={`team-card ${animId === team.id ? "card-anim" : ""}`}
                  style={{ borderColor: index < 3 ? rankBorder[index] : "#f0ece6", background: index < 3 ? rankBg[index] : "white", animationDelay: `${index * 0.06}s` }}>
 
                  {editingTeam === team.id ? (
                    /* EDIT MODE */
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input type="text" value={editTmp.name} onChange={e => setEditTmp(p => ({ ...p, name: e.target.value }))} placeholder="Nome" style={{ flex: 1, minWidth: 100 }} />
                        <input type="color" value={editTmp.color} onChange={e => setEditTmp(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 36, border: "2px solid #e5ddd0", borderRadius: 8, cursor: "pointer" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Simbolo:</span>
                        {editTmp.img
                          ? <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}>
                              <img src={editTmp.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          : <input type="text" value={editTmp.icon} onChange={e => setEditTmp(p => ({ ...p, icon: e.target.value }))} style={{ width: 52, textAlign: "center", fontSize: 22 }} />
                        }
                        <button onClick={() => editTeamImgRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 8px" }}>📷 Immagine</button>
                        {editTmp.img && <button onClick={() => setEditTmp(p => ({ ...p, img: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 8px" }}>✕ Rimuovi</button>}
                        <input ref={editTeamImgRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setEditTmp(p => ({ ...p, img: d })); } e.target.value = ""; }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => {
                          setTeams(p => p.map(t => t.id === team.id ? { ...t, name: editTmp.name, icon: editTmp.icon, color: editTmp.color, img: editTmp.img } : t));
                          setEditingTeam(null);
                        }} className="btn" style={{ flex: 1, background: "#2ecc71", color: "white", padding: 9 }}>✓ Salva</button>
                        <button onClick={() => setEditingTeam(null)} className="btn" style={{ flex: 1, background: "#f0ece6", color: "#666", padding: 9 }}>✕ Annulla</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: index < 3 ? 26 : 17, minWidth: 32, textAlign: "center", fontFamily: "'Fredoka One',cursive", color: index < 3 ? rankBorder[index] : "#bbb" }}>
                        {index < 3 ? medals[index] : `${index + 1}°`}
                      </div>
 
                      <TeamIcon team={team} size={50} emojiSize={26} />
 
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: team.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: hidePoints && !isAdmin ? "50%" : `${Math.max(4, (team.points / maxPts) * 100)}%`, background: `linear-gradient(90deg,${team.color}77,${team.color})`, filter: hidePoints && !isAdmin ? "blur(4px)" : "none" }} />
                          </div>
                        </div>
                      </div>
 
                      <div style={{ textAlign: "right", minWidth: 52 }}>
                        {hidePoints && !isAdmin ? (
                          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: team.color, lineHeight: 1, filter: "blur(6px)", userSelect: "none" }}>000</div>
                        ) : (
                          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: team.color, lineHeight: 1 }}>{team.points}</div>
                        )}
                        <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700 }}>PUNTI</div>
                      </div>
 
                      {isAdmin && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 150 }}>
                          {/* + */}
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="+pts" value={addInput[team.id] ?? ""}
                              onChange={e => setAddInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") { addPts(team.id, addInput[team.id]); setAddInput(p => ({ ...p, [team.id]: "" })); } }}
                              style={{ width: 68 }} />
                            <button onClick={() => { addPts(team.id, addInput[team.id]); setAddInput(p => ({ ...p, [team.id]: "" })); }}
                              className="btn" style={{ background: "#2ecc71", color: "white", fontSize: 17, padding: "5px 9px" }}>＋</button>
                          </div>
                          {/* - */}
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="−pts" value={subInput[team.id] ?? ""}
                              onChange={e => setSubInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") { subPts(team.id, subInput[team.id]); setSubInput(p => ({ ...p, [team.id]: "" })); } }}
                              style={{ width: 68 }} />
                            <button onClick={() => { subPts(team.id, subInput[team.id]); setSubInput(p => ({ ...p, [team.id]: "" })); }}
                              className="btn" style={{ background: "#E8295B", color: "white", fontSize: 17, padding: "5px 9px" }}>－</button>
                          </div>
                          {/* set */}
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="= pts" value={pointInput[team.id] ?? ""}
                              onChange={e => setPointInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") setPts(team.id); }}
                              style={{ width: 68 }} />
                            <button onClick={() => setPts(team.id)} className="btn" style={{ background: "#F5C500", color: "#333", fontSize: 12, padding: "5px 8px" }}>Set</button>
                          </div>
                          {/* modifica / elimina */}
                          <div style={{ display: "flex", gap: 5 }}>
                            <button onClick={() => { setEditingTeam(team.id); setEditTmp({ name: team.name, icon: team.icon || "⭐", color: team.color, img: team.img || null }); }}
                              className="btn" style={{ background: "#f0ece6", color: "#555", flex: 1, fontSize: 13 }}>✏️</button>
                            <button
                              onClick={() => setConfirmDelete({ type: "team", id: team.id })}
                              className="btn" style={{ background: "#fde8ec", color: "#E8295B", flex: 1, fontSize: 13 }}>🗑</button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
 
        {/* ===== STORICO ===== */}
        {tab === "storico" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#F4631E" }}>📅 Storico Edizioni</div>
              {isAdmin && (
                <button onClick={() => setShowAddHistory(s => !s)} className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 13 }}>
                  ➕ Aggiungi anno
                </button>
              )}
            </div>
 
            {/* Form aggiungi anno */}
            {isAdmin && showAddHistory && (
              <div className="fade-in" style={{ background: "white", borderRadius: 18, padding: 18, marginBottom: 16, border: "3px solid #F5C500", boxShadow: "0 4px 0 rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: "#F4631E", marginBottom: 12 }}>🏆 Nuova Edizione</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <div style={{ display: "flex", gap: 9 }}>
                    <input type="text" placeholder="Anno (es. 2025)" value={newHist.year} onChange={e => setNewHist(p => ({ ...p, year: e.target.value }))} style={{ flex: 1 }} />
                    <input type="text" placeholder="Squadra vincitrice 🏆" value={newHist.winner} onChange={e => setNewHist(p => ({ ...p, winner: e.target.value }))} style={{ flex: 2 }} />
                  </div>
                  <input type="text" placeholder="Tema (es. Bella Fra!)" value={newHist.theme} onChange={e => setNewHist(p => ({ ...p, theme: e.target.value }))} style={{ width: "100%" }} />
                  <textarea placeholder="Note, ricordi... (facoltativo)" value={newHist.notes} onChange={e => setNewHist(p => ({ ...p, notes: e.target.value }))} />
 
                  {/* Logo anno */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Logo edizione:</span>
                    {newHist.logo
                      ? <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}>
                          <img src={newHist.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      : <span style={{ fontSize: 13, color: "#ccc" }}>Nessun logo</span>
                    }
                    <button onClick={() => newHistLogoRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 10px" }}>📷 Carica</button>
                    {newHist.logo && <button onClick={() => setNewHist(p => ({ ...p, logo: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 10px" }}>✕</button>}
                    <input ref={newHistLogoRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setNewHist(p => ({ ...p, logo: d })); } e.target.value = ""; }} />
                  </div>
 
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => {
                      if (!newHist.year.trim() || !newHist.winner.trim()) return;
                      setHistory(p => [...p, { id: Date.now(), ...newHist }]);
                      setNewHist({ year: "", winner: "", theme: "", notes: "", logo: null }); setShowAddHistory(false);
                    }} className="btn" style={{ flex: 1, padding: 11, background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 15 }}>Salva</button>
                    <button onClick={() => setShowAddHistory(false)} className="btn" style={{ flex: 1, padding: 11, background: "#f0ece6", color: "#666", fontSize: 15 }}>Annulla</button>
                  </div>
                </div>
              </div>
            )}
 
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sortedHistory.map((entry, i) => (
                <div key={entry.id} className="history-card" style={{ animationDelay: `${i * 0.06}s`, borderLeftColor: i === 0 ? "#F5C500" : i === 1 ? "#C0C0C0" : "#F4631E" }}>
                  {editingHistory === entry.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      <div style={{ display: "flex", gap: 9 }}>
                        <input type="text" value={editHistTmp.year} onChange={e => setEditHistTmp(p => ({ ...p, year: e.target.value }))} placeholder="Anno" style={{ flex: 1 }} />
                        <input type="text" value={editHistTmp.winner} onChange={e => setEditHistTmp(p => ({ ...p, winner: e.target.value }))} placeholder="Vincitrice" style={{ flex: 2 }} />
                      </div>
                      <input type="text" value={editHistTmp.theme} onChange={e => setEditHistTmp(p => ({ ...p, theme: e.target.value }))} placeholder="Tema" style={{ width: "100%" }} />
                      <textarea value={editHistTmp.notes} onChange={e => setEditHistTmp(p => ({ ...p, notes: e.target.value }))} placeholder="Note..." />
 
                      {/* Modifica logo anno */}
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Logo:</span>
                        {editHistTmp.logo
                          ? <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}>
                              <img src={editHistTmp.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          : <span style={{ fontSize: 13, color: "#ccc" }}>Nessun logo</span>
                        }
                        <button onClick={() => editHistLogoRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 10px" }}>📷 Carica</button>
                        {editHistTmp.logo && <button onClick={() => setEditHistTmp(p => ({ ...p, logo: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 10px" }}>✕</button>}
                        <input ref={editHistLogoRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setEditHistTmp(p => ({ ...p, logo: d })); } e.target.value = ""; }} />
                      </div>
 
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setHistory(p => p.map(h => h.id === entry.id ? { ...h, ...editHistTmp } : h)); setEditingHistory(null); }}
                          className="btn" style={{ flex: 1, background: "#2ecc71", color: "white", padding: 9 }}>✓ Salva</button>
                        <button onClick={() => setEditingHistory(null)} className="btn" style={{ flex: 1, background: "#f0ece6", color: "#666", padding: 9 }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      {/* Logo edizione */}
                      <div className="hist-logo">
                        {entry.logo
                          ? <img src={entry.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <span>{i === 0 ? "⭐" : "📌"}</span>
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: "#F4631E" }}>{entry.year}</div>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: "#333", marginTop: 1 }}>🏆 {entry.winner}</div>
                        {entry.theme && <div style={{ fontSize: 13, color: "#F4631E", fontWeight: 700, marginTop: 3 }}>"{entry.theme}"</div>}
                        {entry.notes && <div style={{ fontSize: 13, color: "#888", marginTop: 5, lineHeight: 1.5 }}>{entry.notes}</div>}
                      </div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <button onClick={() => { setEditingHistory(entry.id); setEditHistTmp({ year: entry.year, winner: entry.winner, theme: entry.theme || "", notes: entry.notes || "", logo: entry.logo || null }); }}
                            className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 13, padding: "6px 9px" }}>✏️</button>
                          <button onClick={() => setConfirmDelete({ type: "history", id: entry.id })}
                            className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 13, padding: "6px 9px" }}>🗑</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
 
              {history.length === 0 && (
                <div style={{ textAlign: "center", color: "#ccc", padding: "40px 20px", fontFamily: "'Fredoka One',cursive", fontSize: 16 }}>
                  Nessuna edizione ancora 📅<br />
                  <span style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>Aggiungila con il bottone qui sopra!</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
 
      <div style={{ textAlign: "center", marginTop: 36, color: "#ccc", fontSize: 12, fontStyle: "italic" }}>
        ☀️ Bella Fra! · CRE Grest 2026
      </div>
    </div>
  );
}
 