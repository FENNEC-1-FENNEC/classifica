import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { ref, onValue, set, remove, update, push } from "firebase/database";

// Password caricate da Firebase — non visibili nel codice

const initialTeams = [
  { id: "1", name: "Squadra Sole", points: 0, color: "#F5C500", icon: "☀️", img: null },
  { id: "2", name: "Squadra Cielo", points: 0, color: "#29B8D8", icon: "🐦", img: null },
  { id: "3", name: "Squadra Fuoco", points: 0, color: "#F4631E", icon: "🔥", img: null },
  { id: "4", name: "Squadra Rosa", points: 0, color: "#E8295B", icon: "🌸", img: null },
];

const styleEl = document.createElement("style");
styleEl.textContent = `
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
  input[type=number], input[type=text], input[type=password], textarea {
    background: #f9f5ef; border: 2px solid #e5ddd0; border-radius: 10px;
    color: #333; font-family: 'Nunito', sans-serif; font-size: 15px; padding: 7px 11px;
  }
  input[type=number] { text-align: center; }
  input[type=number]:focus, input[type=text]:focus, input[type=password]:focus, textarea:focus { outline: none; border-color: #F5C500; }
  textarea { resize: vertical; width: 100%; min-height: 56px; }
  .history-card {
    background: white; border-radius: 16px; padding: 16px 20px;
    border-left: 5px solid #F5C500;
    box-shadow: 0 3px 0 rgba(0,0,0,0.06);
    animation: fadeSlide 0.4s ease both;
  }
  .log-item {
    background: white; border-radius: 12px; padding: 12px 16px;
    border-left: 4px solid #29B8D8;
    box-shadow: 0 2px 0 rgba(0,0,0,0.05);
    animation: fadeSlide 0.3s ease both;
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
  .schedule-card {
    background: white; border-radius: 16px; padding: 16px 18px;
    box-shadow: 0 4px 0 rgba(0,0,0,0.06);
    border: 2px solid #f0ece6;
    animation: fadeSlide 0.4s ease both;
  }
  .day-col {
    background: #f9f5ef; border-radius: 12px; padding: 12px;
    flex: 1; min-width: 0;
  }
  .game-item {
    background: white; border-radius: 8px; padding: 8px 10px;
    margin-top: 6px; font-size: 13px; color: #333;
    border-left: 3px solid #F5C500;
    display: flex; align-items: center; justify-content: space-between; gap: 6px;
  }
    display: flex; align-items: center; justify-content: center;
    min-height: 100vh; font-family: 'Fredoka One', cursive;
    font-size: 22px; color: #F4631E; flex-direction: column; gap: 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 40px; height: 40px; border: 4px solid #f0ece6; border-top-color: #F4631E; border-radius: 50%; animation: spin 0.8s linear infinite; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-thumb { background: #F5C500; border-radius: 99px; }
`;
document.head.appendChild(styleEl);

function readFile(file) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.readAsDataURL(file);
  });
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s fa`;
  if (diff < 3600) return `${Math.floor(diff/60)}min fa`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h fa`;
  return new Date(ts).toLocaleDateString("it-IT");
}

export default function App() {
  const [teams, setTeams] = useState([]);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logo, setLogo] = useState(null);
  const [grestYear, setGrestYear] = useState("2026");
  const [hidePoints, setHidePoints] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ super: null, admin: null, semi: null });
  const [siteTitle, setSiteTitle] = useState("GREST 2026");
  const [favicon, setFavicon] = useState(null);
  const [siteTitleTmp, setSiteTitleTmp] = useState("");
  const [frozenOrder, setFrozenOrder] = useState([]);

  // role: null | "super" | "admin" | "semi"
  const [role, setRole] = useState(null);
  const isSuper = role === "super";
  const isAdmin = role === "admin" || role === "super";
  const isSemi  = role === "semi" || role === "admin" || role === "super";

  const [showLogin, setShowLogin] = useState(false);
  const [password, setPassword] = useState("");
  const [wrongPw, setWrongPw] = useState(false);
  const [tab, setTab] = useState("classifica");
  const [editingYear, setEditingYear] = useState(false);
  const [yearTmp, setYearTmp] = useState("");

  const [editingTeam, setEditingTeam] = useState(null);
  const [editTmp, setEditTmp] = useState({});
  const [pointInput, setPointInput] = useState({});
  const [addInput, setAddInput] = useState({});
  const [subInput, setSubInput] = useState({});
  const [animId, setAnimId] = useState(null);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", icon: "⭐", color: "#8e44ad", img: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [editingHistory, setEditingHistory] = useState(null);
  const [editHistTmp, setEditHistTmp] = useState({});
  const [showAddHistory, setShowAddHistory] = useState(false);
  const [newHist, setNewHist] = useState({ year: "", winner: "", theme: "", notes: "", logo: null });

  const [schedules, setSchedules] = useState([]);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", days: 7, dates: [] });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [newGameInput, setNewGameInput] = useState({});
  const [pwEdit, setPwEdit] = useState({ super: "", admin: "", semi: "" });
  const [pwSaved, setPwSaved] = useState(false);

  const logoRef = useRef();
  const newTeamImgRef = useRef();
  const editTeamImgRef = useRef();
  const newHistLogoRef = useRef();
  const editHistLogoRef = useRef();
  const faviconRef = useRef();

  useEffect(() => {
    let loaded = 0;
    const done = () => { loaded++; if (loaded >= 6) setLoading(false); };

    const teamsRef = ref(db, "teams");
    const unsubTeams = onValue(teamsRef, (snap) => {
      const data = snap.val();
      if (data) { setTeams(Object.values(data)); }
      else { const obj = {}; initialTeams.forEach(t => { obj[t.id] = t; }); set(teamsRef, obj); }
      done();
    });

    const histRef = ref(db, "history");
    const unsubHist = onValue(histRef, (snap) => {
      const data = snap.val();
      setHistory(data ? Object.values(data) : []);
      done();
    });

    const settRef = ref(db, "settings");
    const unsubSett = onValue(settRef, (snap) => {
      const data = snap.val();
      if (data) {
        if (data.logo !== undefined) setLogo(data.logo);
        if (data.grestYear !== undefined) setGrestYear(data.grestYear);
        if (data.hidePoints !== undefined) setHidePoints(data.hidePoints);
        if (data.frozenOrder !== undefined) setFrozenOrder(data.frozenOrder || []);
        if (data.siteTitle !== undefined) setSiteTitle(data.siteTitle);
        if (data.favicon !== undefined) setFavicon(data.favicon);
      }
      done();
    });

    const pwRef = ref(db, "passwords");
    const unsubPw = onValue(pwRef, (snap) => {
      const data = snap.val();
      if (data) setPasswords({ super: data.super || null, admin: data.admin || null, semi: data.semi || null });
      done();
    });

    const schedRef = ref(db, "schedules");
    const unsubSched = onValue(schedRef, (snap) => {
      const data = snap.val();
      setSchedules(data ? Object.values(data).sort((a,b) => b.createdAt - a.createdAt) : []);
      done();
    });

    const logRef = ref(db, "logs");
    const unsubLog = onValue(logRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr = Object.entries(data).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.ts - a.ts);
        setLogs(arr.slice(0, 50));
      } else setLogs([]);
      done();
    });

    return () => { unsubTeams(); unsubHist(); unsubSett(); unsubPw(); unsubLog(); unsubSched(); };
  }, []);

  // Aggiorna titolo browser
  useEffect(() => { document.title = siteTitle; }, [siteTitle]);

  // Aggiorna favicon browser
  useEffect(() => {
    const src = favicon || logo;
    if (!src) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
    link.href = src;
  }, [favicon, logo]);

  const fbSetTeam = (team) => set(ref(db, `teams/${team.id}`), team);
  const fbDeleteTeam = (id) => remove(ref(db, `teams/${id}`));
  const fbSetHistory = (entry) => set(ref(db, `history/${entry.id}`), entry);
  const fbDeleteHistory = (id) => remove(ref(db, `history/${id}`));
  const fbSetting = (key, val) => update(ref(db, "settings"), { [key]: val });

  // Scrivi log
  const writeLog = (action, detail) => {
    const roleLabel = role === "super" ? "Super Admin" : role === "admin" ? "Admin" : "Animatore";
    push(ref(db, "logs"), { action, detail, role: roleLabel, ts: Date.now() });
  };

  const sorted = hidePoints && !role && frozenOrder.length > 0
    ? frozenOrder.map(id => teams.find(t => t.id === id)).filter(Boolean)
    : [...teams].sort((a, b) => b.points - a.points);
  const maxPts = [...teams].sort((a, b) => b.points - a.points)[0]?.points || 1;
  const sortedHistory = [...history].sort((a, b) => b.year - a.year);
  const medals = ["🥇", "🥈", "🥉"];
  const rankBorder = ["#F5C500", "#C0C0C0", "#F4631E"];
  const rankBg = ["#FFFBEA", "#F8F8F8", "#FFF5EE"];

  const flash = (id) => { setAnimId(id); setTimeout(() => setAnimId(null), 500); };

  const addPts = (id, val) => {
    const n = parseInt(val); if (isNaN(n) || n <= 0) return;
    const team = teams.find(t => t.id === id); if (!team) return;
    fbSetTeam({ ...team, points: team.points + n });
    writeLog("➕ Punti aggiunti", `+${n} a ${team.name} (tot: ${team.points + n})`);
    flash(id);
  };
  const subPts = (id, val) => {
    const n = parseInt(val); if (isNaN(n) || n <= 0) return;
    const team = teams.find(t => t.id === id); if (!team) return;
    const newPts = Math.max(0, team.points - n);
    fbSetTeam({ ...team, points: newPts });
    writeLog("➖ Punti tolti", `-${n} a ${team.name} (tot: ${newPts})`);
    flash(id);
  };
  const setPts = (id) => {
    const n = parseInt(pointInput[id]); if (isNaN(n) || n < 0) return;
    const team = teams.find(t => t.id === id); if (!team) return;
    fbSetTeam({ ...team, points: n });
    writeLog("✏️ Punti impostati", `${team.name} → ${n} punti`);
    setPointInput(p => ({ ...p, [id]: "" })); flash(id);
  };

  const toggleHidePoints = () => {
    const newVal = !hidePoints;
    if (newVal) {
      const order = [...teams].sort((a, b) => b.points - a.points).map(t => t.id);
      update(ref(db, "settings"), { hidePoints: newVal, frozenOrder: order });
      writeLog("🙈 Punti nascosti", "Classifica congelata");
    } else {
      update(ref(db, "settings"), { hidePoints: newVal });
      writeLog("👁️ Punti mostrati", "Classifica svelata");
    }
  };

  const handleLogin = () => {
    if (password === passwords.super) { setRole("super"); setShowLogin(false); setPassword(""); setWrongPw(false); }
    else if (password === passwords.admin) { setRole("admin"); setShowLogin(false); setPassword(""); setWrongPw(false); }
    else if (password === passwords.semi) { setRole("semi"); setShowLogin(false); setPassword(""); setWrongPw(false); }
    else setWrongPw(true);
  };

  const savePasswords = () => {
    const updates = {};
    if (pwEdit.super) updates.super = pwEdit.super;
    if (pwEdit.admin) updates.admin = pwEdit.admin;
    if (pwEdit.semi) updates.semi = pwEdit.semi;
    if (Object.keys(updates).length === 0) return;
    update(ref(db, "passwords"), updates);
    writeLog("🔑 Password cambiate", Object.keys(updates).map(k => k === "super" ? "Super Admin" : k === "admin" ? "Admin" : "Animatore").join(", "));
    setPwEdit({ super: "", admin: "", semi: "" });
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  };

  const TeamIcon = ({ team, size = 52, emojiSize = 28 }) => (
    <div className="team-icon" style={{ width: size, height: size, fontSize: emojiSize }}>
      {team.img ? <img src={team.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{team.icon || "⭐"}</span>}
    </div>
  );

  const RoleBadge = () => {
    if (!role) return null;
    const colors = { super: ["#8e44ad", "#9b59b6"], admin: ["#F5C500", "#F4631E"], semi: ["#29B8D8", "#2980b9"] };
    const labels = { super: "👑 Super Admin", admin: "✅ Admin", semi: "⚡ Animatore" };
    return (
      <span style={{ background: `linear-gradient(135deg,${colors[role][0]},${colors[role][1]})`, color: "white", padding: "4px 14px", borderRadius: 999, fontFamily: "'Fredoka One',cursive", fontSize: 13 }}>
        {labels[role]}
      </span>
    );
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Caricamento...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#fff8ed,#ffecd2)", fontFamily: "'Nunito',sans-serif", paddingBottom: 60 }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#F5C500,#F4631E 50%,#E8295B)", padding: "28px 20px 36px", textAlign: "center", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, boxShadow: "0 8px 0 rgba(244,99,30,0.25)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -18, left: -18, width: 90, height: 90, background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -28, right: -18, width: 110, height: 110, background: "rgba(255,255,255,0.08)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 12, right: 28, fontSize: 26, animation: "float 3s ease-in-out infinite" }}>🐦</div>
        <div style={{ position: "absolute", top: 18, left: 20, fontSize: 20, animation: "float 4s ease-in-out infinite 1s" }}>☀️</div>

        <div className={`logo-circle ${isAdmin ? "clickable-img" : ""}`} onClick={() => isAdmin && logoRef.current.click()} style={{ cursor: isAdmin ? "pointer" : "default" }}>
          {logo ? <img src={logo} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>🌟</span>}
          {isAdmin && <div className="img-overlay" style={{ borderRadius: "50%" }}><span style={{ fontSize: 22 }}>📷</span><span>Cambia logo</span></div>}
        </div>
        <input ref={logoRef} type="file" accept="image/*" onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); fbSetting("logo", d); writeLog("🖼️ Logo cambiato", ""); } e.target.value = ""; }} style={{ display: "none" }} />

        <div style={{ color: "white", fontSize: 12, fontWeight: 700, letterSpacing: 6, opacity: 0.9, marginBottom: 2 }}>CRE</div>
        <div style={{ color: "white", fontSize: 50, fontFamily: "'Fredoka One',cursive", lineHeight: 1, textShadow: "0 4px 0 rgba(0,0,0,0.13)", letterSpacing: 2 }}>GREST</div>

        {editingYear && isAdmin ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginTop: 6 }}>
            <input type="text" value={yearTmp} onChange={e => setYearTmp(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { fbSetting("grestYear", yearTmp); writeLog("📅 Anno cambiato", yearTmp); setEditingYear(false); } }}
              style={{ width: 120, textAlign: "center", fontSize: 18, fontFamily: "'Fredoka One',cursive", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.5)", color: "white", borderRadius: 10, padding: "4px 10px" }} autoFocus />
            <button onClick={() => { fbSetting("grestYear", yearTmp); writeLog("📅 Anno cambiato", yearTmp); setEditingYear(false); }} className="btn" style={{ background: "rgba(255,255,255,0.3)", color: "white", fontSize: 13, padding: "5px 10px" }}>✓</button>
            <button onClick={() => setEditingYear(false)} className="btn" style={{ background: "rgba(0,0,0,0.2)", color: "white", fontSize: 13, padding: "5px 10px" }}>✕</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <div style={{ color: "white", fontSize: 15, fontFamily: "'Fredoka One',cursive", opacity: 0.95 }}>Bella Fra! {grestYear}</div>
            {isAdmin && <button onClick={() => { setYearTmp(grestYear); setEditingYear(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, padding: "2px 7px", color: "white" }}>✏️</button>}
          </div>
        )}
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 3, fontStyle: "italic" }}>Guardate a lui e sarete raggianti — Sal 34</div>

        <div style={{ marginTop: 14 }}>
          {!role ? (
            <button onClick={() => setShowLogin(true)} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.35)", fontSize: 13 }}>🔒 Accesso Animatori</button>
          ) : (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <RoleBadge />
              {isAdmin && <button onClick={() => setShowAddTeam(s => !s)} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>➕ Squadra</button>}
              {isAdmin && <button onClick={toggleHidePoints} className="btn" style={{ background: hidePoints ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>
                {hidePoints ? "👁️ Mostra punti" : "🙈 Nascondi punti"}
              </button>}
              {isAdmin && <button onClick={() => setConfirmDelete({ type: "reset" })} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid rgba(255,255,255,0.3)", fontSize: 13 }}>🔄 Reset</button>}
              <button onClick={() => setRole(null)} className="btn" style={{ background: "rgba(255,255,255,0.13)", color: "white", border: "2px solid rgba(255,255,255,0.25)", fontSize: 13 }}>🚪 Esci</button>
            </div>
          )}
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", maxWidth: 580, margin: "20px auto 0", padding: "0 16px", gap: 8, flexWrap: "wrap" }}>
        {["classifica", "storico", "programma", ...(isAdmin ? ["impostazioni"] : []), ...(isSuper ? ["log", "password"] : [])].map(t => (
          <button key={t} onClick={() => setTab(t)} className="btn" style={{
            flex: 1, minWidth: 80, padding: "10px 8px", fontSize: 13,
            background: tab === t ? (t === "log" || t === "password" ? "linear-gradient(135deg,#8e44ad,#9b59b6)" : "linear-gradient(135deg,#F5C500,#F4631E)") : "white",
            color: tab === t ? "white" : "#888",
            boxShadow: tab === t ? "0 4px 0 rgba(0,0,0,0.2)" : "0 3px 0 rgba(0,0,0,0.06)",
          }}>
            {t === "classifica" ? "🏆" : t === "storico" ? "📅" : t === "programma" ? "🎮 Giochi" : t === "impostazioni" ? "⚙️" : t === "log" ? "📋 Log" : "🔑 Password"}
          </button>
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
                if (confirmDelete.type === "team") { fbDeleteTeam(confirmDelete.id); writeLog("🗑️ Squadra eliminata", confirmDelete.name || ""); }
                if (confirmDelete.type === "history") fbDeleteHistory(confirmDelete.id);
                if (confirmDelete.type === "reset") { teams.forEach(t => fbSetTeam({ ...t, points: 0 })); writeLog("🔄 Reset punti", "Tutti i punti azzerati"); }
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
            <h3 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 22, color: "#333", textAlign: "center", marginBottom: 6 }}>Accesso</h3>
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginBottom: 16 }}>Inserisci la tua password</p>
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
            {isAdmin && showAddTeam && (
              <div className="fade-in" style={{ background: "white", borderRadius: 18, padding: 18, marginBottom: 16, border: "3px solid #F5C500", boxShadow: "0 4px 0 rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: "#F4631E", marginBottom: 12 }}>➕ Nuova Squadra</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <input type="text" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} placeholder="Nome squadra" style={{ flex: 2, minWidth: 120 }} />
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {newTeam.img
                      ? <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}><img src={newTeam.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                      : <input type="text" value={newTeam.icon} onChange={e => setNewTeam(p => ({ ...p, icon: e.target.value }))} placeholder="🎯" style={{ width: 52, textAlign: "center", fontSize: 22 }} />
                    }
                    <button onClick={() => newTeamImgRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 8px" }}>📷</button>
                    {newTeam.img && <button onClick={() => setNewTeam(p => ({ ...p, img: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 8px" }}>✕</button>}
                    <input ref={newTeamImgRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setNewTeam(p => ({ ...p, img: d })); } e.target.value = ""; }} />
                  </div>
                  <input type="color" value={newTeam.color} onChange={e => setNewTeam(p => ({ ...p, color: e.target.value }))} style={{ width: 42, height: 38, border: "2px solid #e5ddd0", borderRadius: 10, cursor: "pointer" }} />
                  <button onClick={() => {
                    if (!newTeam.name.trim()) return;
                    const id = Date.now().toString();
                    fbSetTeam({ id, name: newTeam.name.trim(), points: 0, color: newTeam.color, icon: newTeam.icon, img: newTeam.img });
                    writeLog("➕ Squadra creata", newTeam.name.trim());
                    setNewTeam({ name: "", icon: "⭐", color: "#8e44ad", img: null }); setShowAddTeam(false);
                  }} className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white" }}>Crea</button>
                </div>
              </div>
            )}

            {hidePoints && !role && (
              <div className="fade-in" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", borderRadius: 14, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🙈</span>
                <div>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 15, color: "white" }}>Punti nascosti dagli animatori!</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>La classifica sarà svelata a breve...</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sorted.map((team, index) => (
                <div key={team.id} className={`team-card ${animId === team.id ? "card-anim" : ""}`}
                  style={{ borderColor: index < 3 ? rankBorder[index] : "#f0ece6", background: index < 3 ? rankBg[index] : "white", animationDelay: `${index * 0.06}s` }}>

                  {editingTeam === team.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <input type="text" value={editTmp.name} onChange={e => setEditTmp(p => ({ ...p, name: e.target.value }))} placeholder="Nome" style={{ flex: 1, minWidth: 100 }} />
                        <input type="color" value={editTmp.color} onChange={e => setEditTmp(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 36, border: "2px solid #e5ddd0", borderRadius: 8, cursor: "pointer" }} />
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Simbolo:</span>
                        {editTmp.img
                          ? <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}><img src={editTmp.img} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                          : <input type="text" value={editTmp.icon} onChange={e => setEditTmp(p => ({ ...p, icon: e.target.value }))} style={{ width: 52, textAlign: "center", fontSize: 22 }} />
                        }
                        <button onClick={() => editTeamImgRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 8px" }}>📷</button>
                        {editTmp.img && <button onClick={() => setEditTmp(p => ({ ...p, img: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 8px" }}>✕</button>}
                        <input ref={editTeamImgRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setEditTmp(p => ({ ...p, img: d })); } e.target.value = ""; }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { fbSetTeam({ ...team, name: editTmp.name, icon: editTmp.icon, color: editTmp.color, img: editTmp.img }); writeLog("✏️ Squadra modificata", editTmp.name); setEditingTeam(null); }}
                          className="btn" style={{ flex: 1, background: "#2ecc71", color: "white", padding: 9 }}>✓ Salva</button>
                        <button onClick={() => setEditingTeam(null)} className="btn" style={{ flex: 1, background: "#f0ece6", color: "#666", padding: 9 }}>✕ Annulla</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: index < 3 ? 26 : 17, minWidth: 32, textAlign: "center", fontFamily: "'Fredoka One',cursive", color: index < 3 ? rankBorder[index] : "#bbb" }}>
                        {hidePoints && !role ? "❓" : (index < 3 ? medals[index] : `${index + 1}°`)}
                      </div>
                      <TeamIcon team={team} size={50} emojiSize={26} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: team.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{team.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: hidePoints && !role ? "50%" : `${Math.max(4, (team.points / maxPts) * 100)}%`, background: `linear-gradient(90deg,${team.color}77,${team.color})`, filter: hidePoints && !role ? "blur(4px)" : "none" }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: 52 }}>
                        {hidePoints && !role
                          ? <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: team.color, lineHeight: 1, filter: "blur(6px)", userSelect: "none" }}>000</div>
                          : <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 28, color: team.color, lineHeight: 1 }}>{team.points}</div>
                        }
                        <div style={{ fontSize: 10, color: "#bbb", fontWeight: 700 }}>PUNTI</div>
                      </div>

                      {isSemi && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 150 }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="+pts" value={addInput[team.id] ?? ""}
                              onChange={e => setAddInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") { addPts(team.id, addInput[team.id]); setAddInput(p => ({ ...p, [team.id]: "" })); } }}
                              style={{ width: 68 }} />
                            <button onClick={() => { addPts(team.id, addInput[team.id]); setAddInput(p => ({ ...p, [team.id]: "" })); }}
                              className="btn" style={{ background: "#2ecc71", color: "white", fontSize: 17, padding: "5px 9px" }}>＋</button>
                          </div>
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="−pts" value={subInput[team.id] ?? ""}
                              onChange={e => setSubInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") { subPts(team.id, subInput[team.id]); setSubInput(p => ({ ...p, [team.id]: "" })); } }}
                              style={{ width: 68 }} />
                            <button onClick={() => { subPts(team.id, subInput[team.id]); setSubInput(p => ({ ...p, [team.id]: "" })); }}
                              className="btn" style={{ background: "#E8295B", color: "white", fontSize: 17, padding: "5px 9px" }}>－</button>
                          </div>
                          <div style={{ display: "flex", gap: 5 }}>
                            <input type="number" min="0" placeholder="= pts" value={pointInput[team.id] ?? ""}
                              onChange={e => setPointInput(p => ({ ...p, [team.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") setPts(team.id); }}
                              style={{ width: 68 }} />
                            <button onClick={() => setPts(team.id)} className="btn" style={{ background: "#F5C500", color: "#333", fontSize: 12, padding: "5px 8px" }}>Set</button>
                          </div>
                          {isAdmin && (
                            <div style={{ display: "flex", gap: 5 }}>
                              <button onClick={() => { setEditingTeam(team.id); setEditTmp({ name: team.name, icon: team.icon || "⭐", color: team.color, img: team.img || null }); }}
                                className="btn" style={{ background: "#f0ece6", color: "#555", flex: 1, fontSize: 13 }}>✏️</button>
                              <button onClick={() => setConfirmDelete({ type: "team", id: team.id, name: team.name })}
                                className="btn" style={{ background: "#fde8ec", color: "#E8295B", flex: 1, fontSize: 13 }}>🗑</button>
                            </div>
                          )}
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
              {isAdmin && <button onClick={() => setShowAddHistory(s => !s)} className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 13 }}>➕ Aggiungi anno</button>}
            </div>

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
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Logo edizione:</span>
                    {newHist.logo ? <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}><img src={newHist.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div> : <span style={{ fontSize: 13, color: "#ccc" }}>Nessun logo</span>}
                    <button onClick={() => newHistLogoRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 10px" }}>📷 Carica</button>
                    {newHist.logo && <button onClick={() => setNewHist(p => ({ ...p, logo: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 10px" }}>✕</button>}
                    <input ref={newHistLogoRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setNewHist(p => ({ ...p, logo: d })); } e.target.value = ""; }} />
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => {
                      if (!newHist.year.trim() || !newHist.winner.trim()) return;
                      const id = Date.now().toString();
                      fbSetHistory({ id, ...newHist });
                      writeLog("📅 Edizione aggiunta", `${newHist.year} - ${newHist.winner}`);
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
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#888", fontWeight: 600 }}>Logo:</span>
                        {editHistTmp.logo ? <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}><img src={editHistTmp.logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div> : <span style={{ fontSize: 13, color: "#ccc" }}>Nessun logo</span>}
                        <button onClick={() => editHistLogoRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 12, padding: "6px 10px" }}>📷 Carica</button>
                        {editHistTmp.logo && <button onClick={() => setEditHistTmp(p => ({ ...p, logo: null }))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12, padding: "6px 10px" }}>✕</button>}
                        <input ref={editHistLogoRef} type="file" accept="image/*" style={{ display: "none" }}
                          onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); setEditHistTmp(p => ({ ...p, logo: d })); } e.target.value = ""; }} />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { fbSetHistory({ ...entry, ...editHistTmp }); writeLog("✏️ Edizione modificata", editHistTmp.year); setEditingHistory(null); }}
                          className="btn" style={{ flex: 1, background: "#2ecc71", color: "white", padding: 9 }}>✓ Salva</button>
                        <button onClick={() => setEditingHistory(null)} className="btn" style={{ flex: 1, background: "#f0ece6", color: "#666", padding: 9 }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div className="hist-logo">
                        {entry.logo ? <img src={entry.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>{i === 0 ? "⭐" : "📌"}</span>}
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

        {/* ===== PROGRAMMA ===== */}
        {tab === "programma" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#F4631E" }}>🎮 Programma Giochi</div>
              {isAdmin && <button onClick={() => setShowAddSchedule(s => !s)} className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 13 }}>➕ Nuova settimana</button>}
            </div>

            {/* Form nuova settimana */}
            {isAdmin && showAddSchedule && (
              <div className="fade-in" style={{ background: "white", borderRadius: 18, padding: 18, border: "3px solid #F5C500", boxShadow: "0 4px 0 rgba(0,0,0,0.06)" }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color: "#F4631E", marginBottom: 12 }}>📅 Nuova Settimana</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input type="text" placeholder="Titolo (es. 10-17 Giugno)" value={newSchedule.title}
                    onChange={e => setNewSchedule(p => ({ ...p, title: e.target.value }))} style={{ width: "100%" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, color: "#666", fontWeight: 600 }}>Numero di giorni:</span>
                    {[3,4,5,6,7].map(n => (
                      <button key={n} onClick={() => setNewSchedule(p => ({ ...p, days: n }))} className="btn"
                        style={{ padding: "5px 12px", background: newSchedule.days === n ? "#F4631E" : "#f0ece6", color: newSchedule.days === n ? "white" : "#666", fontSize: 14 }}>{n}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Array.from({ length: newSchedule.days }, (_, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontFamily: "'Fredoka One',cursive", color: "#F5C500", minWidth: 60, fontSize: 13 }}>Giorno {i+1}</span>
                        <input type="text" placeholder={`Es. Lunedì 10 Giugno`}
                          value={newSchedule.dates[i] || ""}
                          onChange={e => setNewSchedule(p => { const d = [...(p.dates || [])]; d[i] = e.target.value; return { ...p, dates: d }; })}
                          style={{ flex: 1 }} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <button onClick={() => {
                      if (!newSchedule.title.trim()) return;
                      const id = Date.now().toString();
                      const days = Array.from({ length: newSchedule.days }, (_, i) => ({
                        label: newSchedule.dates[i] || `Giorno ${i+1}`, mattina: [], pomeriggio: []
                      }));
                      set(ref(db, `schedules/${id}`), { id, title: newSchedule.title, days, createdAt: Date.now() });
                      writeLog("🎮 Settimana creata", newSchedule.title);
                      setNewSchedule({ title: "", days: 7, dates: [] }); setShowAddSchedule(false);
                    }} className="btn" style={{ flex: 1, padding: 11, background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white", fontSize: 15 }}>Crea</button>
                    <button onClick={() => setShowAddSchedule(false)} className="btn" style={{ flex: 1, padding: 11, background: "#f0ece6", color: "#666", fontSize: 15 }}>Annulla</button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista settimane */}
            {schedules.length === 0 && !showAddSchedule && (
              <div style={{ textAlign: "center", color: "#ccc", padding: "40px 20px", fontFamily: "'Fredoka One',cursive", fontSize: 16 }}>
                Nessun programma ancora 🎮<br />
                <span style={{ fontSize: 13, fontFamily: "'Nunito',sans-serif" }}>{isAdmin ? "Aggiungine uno con il bottone!" : "Gli animatori aggiungeranno presto il programma!"}</span>
              </div>
            )}

            {schedules.map(sched => (
              <div key={sched.id} className="schedule-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 18, color: "#F4631E" }}>📅 {sched.title}</div>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => setEditingScheduleId(editingScheduleId === sched.id ? null : sched.id)}
                        className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 13, padding: "5px 10px" }}>
                        {editingScheduleId === sched.id ? "✕ Chiudi" : "✏️ Modifica"}
                      </button>
                      <button onClick={() => { remove(ref(db, `schedules/${sched.id}`)); writeLog("🗑️ Settimana eliminata", sched.title); }}
                        className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 13, padding: "5px 10px" }}>🗑</button>
                    </div>
                  )}
                </div>

                {/* Giorni */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(sched.days || []).map((day, di) => (
                    <div key={di} style={{ background: "#f9f5ef", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 14, color: "#F4631E", marginBottom: 10 }}>📆 {day.label}</div>

                      <div style={{ display: "flex", gap: 10 }}>
                        {/* MATTINA */}
                        <div style={{ flex: 1, background: "linear-gradient(135deg,#FFF8DC,#FFFBEA)", borderRadius: 10, padding: 10, border: "2px solid #F5C500" }}>
                          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: "#F5C500", marginBottom: 6 }}>☀️ Mattina</div>
                          {(day.mattina || []).length === 0 && <div style={{ fontSize: 11, color: "#ccc", fontStyle: "italic" }}>Nessun gioco</div>}
                          {(day.mattina || []).map((game, gi) => (
                            <div key={gi} className="game-item" style={{ borderLeftColor: "#F5C500" }}>
                              <span style={{ fontSize: 12 }}>{game}</span>
                              {isAdmin && editingScheduleId === sched.id && (
                                <button onClick={() => {
                                  const updated = JSON.parse(JSON.stringify(sched));
                                  updated.days[di].mattina = updated.days[di].mattina.filter((_, idx) => idx !== gi);
                                  set(ref(db, `schedules/${sched.id}`), updated);
                                }} style={{ background: "none", border: "none", color: "#E8295B", cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0 }}>✕</button>
                              )}
                            </div>
                          ))}
                          {isAdmin && editingScheduleId === sched.id && (
                            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                              <input type="text" placeholder="Aggiungi..."
                                value={newGameInput[`${sched.id}-${di}-m`] || ""}
                                onChange={e => setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-m`]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === "Enter") {
                                    const val = newGameInput[`${sched.id}-${di}-m`]?.trim();
                                    if (!val) return;
                                    const updated = JSON.parse(JSON.stringify(sched));
                                    if (!updated.days[di].mattina) updated.days[di].mattina = [];
                                    updated.days[di].mattina.push(val);
                                    set(ref(db, `schedules/${sched.id}`), updated);
                                    setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-m`]: "" }));
                                  }
                                }}
                                style={{ flex: 1, fontSize: 12, padding: "4px 8px" }} />
                              <button onClick={() => {
                                const val = newGameInput[`${sched.id}-${di}-m`]?.trim();
                                if (!val) return;
                                const updated = JSON.parse(JSON.stringify(sched));
                                if (!updated.days[di].mattina) updated.days[di].mattina = [];
                                updated.days[di].mattina.push(val);
                                set(ref(db, `schedules/${sched.id}`), updated);
                                setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-m`]: "" }));
                              }} className="btn" style={{ background: "#F5C500", color: "#333", fontSize: 14, padding: "4px 8px" }}>＋</button>
                            </div>
                          )}
                        </div>

                        {/* POMERIGGIO */}
                        <div style={{ flex: 1, background: "linear-gradient(135deg,#EBF8FF,#E8F4FD)", borderRadius: 10, padding: 10, border: "2px solid #29B8D8" }}>
                          <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 13, color: "#29B8D8", marginBottom: 6 }}>🌙 Pomeriggio</div>
                          {(day.pomeriggio || []).length === 0 && <div style={{ fontSize: 11, color: "#ccc", fontStyle: "italic" }}>Nessun gioco</div>}
                          {(day.pomeriggio || []).map((game, gi) => (
                            <div key={gi} className="game-item" style={{ borderLeftColor: "#29B8D8" }}>
                              <span style={{ fontSize: 12 }}>{game}</span>
                              {isAdmin && editingScheduleId === sched.id && (
                                <button onClick={() => {
                                  const updated = JSON.parse(JSON.stringify(sched));
                                  updated.days[di].pomeriggio = updated.days[di].pomeriggio.filter((_, idx) => idx !== gi);
                                  set(ref(db, `schedules/${sched.id}`), updated);
                                }} style={{ background: "none", border: "none", color: "#E8295B", cursor: "pointer", fontSize: 14, padding: 0, flexShrink: 0 }}>✕</button>
                              )}
                            </div>
                          ))}
                          {isAdmin && editingScheduleId === sched.id && (
                            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                              <input type="text" placeholder="Aggiungi..."
                                value={newGameInput[`${sched.id}-${di}-p`] || ""}
                                onChange={e => setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-p`]: e.target.value }))}
                                onKeyDown={e => {
                                  if (e.key === "Enter") {
                                    const val = newGameInput[`${sched.id}-${di}-p`]?.trim();
                                    if (!val) return;
                                    const updated = JSON.parse(JSON.stringify(sched));
                                    if (!updated.days[di].pomeriggio) updated.days[di].pomeriggio = [];
                                    updated.days[di].pomeriggio.push(val);
                                    set(ref(db, `schedules/${sched.id}`), updated);
                                    setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-p`]: "" }));
                                  }
                                }}
                                style={{ flex: 1, fontSize: 12, padding: "4px 8px" }} />
                              <button onClick={() => {
                                const val = newGameInput[`${sched.id}-${di}-p`]?.trim();
                                if (!val) return;
                                const updated = JSON.parse(JSON.stringify(sched));
                                if (!updated.days[di].pomeriggio) updated.days[di].pomeriggio = [];
                                updated.days[di].pomeriggio.push(val);
                                set(ref(db, `schedules/${sched.id}`), updated);
                                setNewGameInput(p => ({ ...p, [`${sched.id}-${di}-p`]: "" }));
                              }} className="btn" style={{ background: "#29B8D8", color: "white", fontSize: 14, padding: "4px 8px" }}>＋</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== IMPOSTAZIONI (admin) ===== */}
        {tab === "impostazioni" && isAdmin && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 4px 0 rgba(0,0,0,0.06)", border: "3px solid #F5C500" }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: "#F4631E", marginBottom: 12 }}>📝 Titolo scheda browser</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" value={siteTitleTmp || siteTitle} onChange={e => setSiteTitleTmp(e.target.value)} placeholder="Es. GREST 2026 - Bella Fra!" style={{ flex: 1 }} />
                <button onClick={() => { fbSetting("siteTitle", siteTitleTmp || siteTitle); writeLog("📝 Titolo cambiato", siteTitleTmp); setSiteTitleTmp(""); }}
                  className="btn" style={{ background: "linear-gradient(135deg,#F5C500,#F4631E)", color: "white" }}>Salva</button>
              </div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Attuale: <b>{siteTitle}</b></div>
            </div>
            <div style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 4px 0 rgba(0,0,0,0.06)", border: "3px solid #29B8D8" }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 17, color: "#29B8D8", marginBottom: 12 }}>🖼️ Icona scheda browser (favicon)</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {(favicon || logo)
                  ? <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", border: "2px solid #e5ddd0" }}><img src={favicon || logo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
                  : <div style={{ width: 56, height: 56, borderRadius: 10, background: "#f9f5ef", border: "2px solid #e5ddd0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🌟</div>
                }
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button onClick={() => faviconRef.current.click()} className="btn" style={{ background: "#f0ece6", color: "#555", fontSize: 13 }}>📷 Carica icona</button>
                  {favicon && <button onClick={() => fbSetting("favicon", null)} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 13 }}>✕ Usa logo</button>}
                </div>
                <input ref={faviconRef} type="file" accept="image/*" style={{ display: "none" }}
                  onChange={async (e) => { const f = e.target.files[0]; if (f) { const d = await readFile(f); fbSetting("favicon", d); writeLog("🖼️ Favicon cambiata", ""); } e.target.value = ""; }} />
              </div>
            </div>
          </div>
        )}

        {/* ===== LOG (solo super admin) ===== */}
        {tab === "log" && isSuper && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#8e44ad" }}>📋 Log Azioni</div>
              <button onClick={() => remove(ref(db, "logs"))} className="btn" style={{ background: "#fde8ec", color: "#E8295B", fontSize: 12 }}>🗑 Svuota</button>
            </div>
            {logs.length === 0 && <div style={{ textAlign: "center", color: "#ccc", padding: 40, fontFamily: "'Fredoka One',cursive" }}>Nessuna azione ancora 📋</div>}
            {logs.map((log, i) => (
              <div key={log.id} className="log-item" style={{ animationDelay: `${i * 0.04}s`, borderLeftColor: log.role === "Super Admin" ? "#8e44ad" : log.role === "Admin" ? "#F5C500" : "#29B8D8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#333" }}>{log.action}</div>
                    {log.detail && <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>{log.detail}</div>}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                    <div style={{ fontSize: 11, color: "#aaa" }}>{timeAgo(log.ts)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: log.role === "Super Admin" ? "#8e44ad" : log.role === "Admin" ? "#F4631E" : "#29B8D8", marginTop: 2 }}>{log.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== PASSWORD (solo super admin) ===== */}
        {tab === "password" && isSuper && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: "#8e44ad", marginBottom: 4 }}>🔑 Gestione Password</div>

            {[
              { key: "super", label: "👑 Super Admin", color: "#8e44ad", current: passwords.super },
              { key: "admin", label: "✅ Admin", color: "#F4631E", current: passwords.admin },
              { key: "semi", label: "⚡ Animatore", color: "#29B8D8", current: passwords.semi },
            ].map(({ key, label, color, current }) => (
              <div key={key} style={{ background: "white", borderRadius: 18, padding: 20, boxShadow: "0 4px 0 rgba(0,0,0,0.06)", border: `3px solid ${color}` }}>
                <div style={{ fontFamily: "'Fredoka One',cursive", fontSize: 16, color, marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>Password attuale: <b style={{ color: "#333" }}>{current || "—"}</b></div>
                <input type="password" placeholder="Nuova password..." value={pwEdit[key]}
                  onChange={e => setPwEdit(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: "100%" }} />
              </div>
            ))}

            <button onClick={savePasswords} className="btn" style={{ padding: 14, background: "linear-gradient(135deg,#8e44ad,#9b59b6)", color: "white", fontSize: 16, width: "100%" }}>
              {pwSaved ? "✅ Salvato!" : "💾 Salva password"}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa" }}>Lascia vuoto per non modificare una password</p>
          </div>
        )}

      </div>

      <div style={{ textAlign: "center", marginTop: 36, color: "#ccc", fontSize: 12, fontStyle: "italic" }}>
        ☀️ Bella Fra! · CRE Grest {grestYear}
      </div>
    </div>
  );
}