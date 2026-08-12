import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./kingsdomino-theme.css";

const catalog = [
  { icon: "♛", name: "الدومينو الملكي", meta: "2–4 لاعبين • مباشر", badge: "الأصل", live: true },
  { icon: "⚡", name: "أولمبس الرعد", meta: "أركيد سريع • نقاط", badge: "جديد" },
  { icon: "🎯", name: "ملك الخمسة", meta: "تحديات مهارة", badge: "مميز" },
  { icon: "🏆", name: "بطولة الملوك", meta: "منافسات أسبوعية", badge: "بطولة" },
  { icon: "💎", name: "جوهرة الصحراء", meta: "ميني جيم", badge: "جديد" },
  { icon: "🌩️", name: "عرش العاصفة", meta: "مراحل ومهام", badge: "حدث" },
  { icon: "🛡️", name: "ساحة الفرسان", meta: "مبارزات نقاط", badge: "قريبًا" },
  { icon: "🪙", name: "كنز الملوك", meta: "مكافآت مجانية", badge: "يومي" },
];

const leaderboard = [
  ["👑", "ملك الدومينو", "9,840"],
  ["🦅", "الفارس الذهبي", "8,920"],
  ["🐺", "ذئب الليل", "8,410"],
];

export default function App() {
  const [games, setGames] = useState([]);
  const [balance, setBalance] = useState(12500);
  const [tab, setTab] = useState("home");
  const [room, setRoom] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(null);
  const [code, setCode] = useState("");
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    api.get("/games").then((res) => setGames(res.data)).catch(() => setGames([]));
  }, []);

  const hand = useMemo(() => room?.gameState?.hands?.["2"] || [], [room]);
  const current = room?.gameState?.currentPlayer;

  const createRoom = async (demoMode = false) => {
    setBusy(true);
    try {
      const { data } = await api.post("/rooms", { name: "ملوك الدومينو", players: 4, host: "Player" });
      const joined = await api.post(`/rooms/${data.code}/join`, { playerId: 2, name: "محمد" });
      setRoom(joined.data);
      setDemo(demoMode);
      setNotice(`الغرفة ${data.code} جاهزة. ${demoMode ? "سيتم إدخال لاعب تجريبي لتشغيل الطاولة فورًا." : "شارك الكود مع لاعب آخر."}`);
      if (demoMode) await joinDemo(data.code);
    } catch (e) {
      setNotice("الخادم غير متاح حاليًا. الواجهة تعمل، شغّل NestJS على المنفذ 3000 لربط اللعب الحقيقي.");
    } finally { setBusy(false); }
  };

  const joinDemo = async (roomCode = room?.code) => {
    if (!roomCode) return;
    try {
      const { data } = await api.post(`/rooms/${roomCode}/join`, { playerId: 3, name: "الفارس الذهبي" });
      const started = await api.post(`/rooms/${roomCode}/start`);
      setRoom(started.data || data);
      setNotice("⚡ الطاولة بدأت! اللاعب 2 يبدأ الدور.");
    } catch { setNotice("أضف لاعبًا ثانيًا ثم ابدأ المباراة."); }
  };

  const startRoom = async () => {
    if (!room?.code) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/rooms/${room.code}/start`);
      setRoom(data);
      setNotice("🔥 بدأت المباراة الملكية!");
    } catch { setNotice("لازم يكون في لاعبين على الأقل قبل البداية."); }
    finally { setBusy(false); }
  };

  const joinRoom = async () => {
    if (!code.trim()) return setNotice("اكتب كود الغرفة أولًا.");
    setBusy(true);
    try {
      const { data } = await api.post(`/rooms/${code.trim().toUpperCase()}/join`, { playerId: 2, name: "محمد" });
      setRoom(data);
      setNotice("تم الدخول للغرفة.");
    } catch { setNotice("كود الغرفة غير صحيح أو الغرفة ممتلئة."); }
    finally { setBusy(false); }
  };

  const demoPlay = (index) => {
    if (!room?.gameState?.started || current !== 2) return setNotice("ليس دورك الآن.");
    const tile = hand[index];
    if (!tile) return;
    setRoom((prev) => ({ ...prev, gameState: { ...prev.gameState, board: [...(prev.gameState.board || []), tile], hands: { ...prev.gameState.hands, "2": hand.filter((_, i) => i !== index) }, currentPlayer: 3 } }));
    setNotice(`وضعت ${tile.left}-${tile.right} على الطاولة. دور اللاعب الآخر.`);
  };

  return (
    <div className="kd-app" dir="rtl">
      <main className="kd-shell">
        <header className="kd-top">
          <div className="kd-brand"><div className="kd-crown">👑</div><div><div className="kd-title">ملوك الدومينو</div><div className="kd-sub">KINGSDOMINO • THE ROYAL ARCADE</div></div></div>
          <div className="kd-wallet"><span className="kd-coin">🪙</span><b>{balance.toLocaleString("ar-EG")}</b><button className="kd-add" onClick={() => setTab("wallet")}>+</button></div>
        </header>

        <section className="kd-hero">
          <div className="kd-kicker">⚡ الموسم الملكي • تجربة جديدة</div>
          <h1>ادخل الطاولة.<br />اترك بصمتك.</h1>
          <p>دومينو مباشر، بطولات، ألعاب أركيد أصلية، شخصيات، مؤثرات وحركة — كل شيء بهوية ملوك الدومينو.</p>
          <div className="kd-actions"><button className="kd-btn kd-primary" onClick={() => createRoom(true)} disabled={busy}>▶ العب الآن</button><button className="kd-btn kd-secondary" onClick={() => setTab("games")}>🎮 كل الألعاب</button></div>
          <div className="kd-stats"><span>🟢 الخادم <b>متصل</b></span><span>👥 لاعبين <b>2,481</b></span><span>🏆 بطولات <b>18</b></span></div>
        </section>

        <section className="kd-section">
          <div className="kd-section-head"><h2>🔥 عالم الملوك</h2><span className="kd-more">تحديثات مستمرة</span></div>
          <div className="kd-grid">{catalog.map((g) => <article key={g.name} className={`kd-game ${g.live ? "kd-featured" : ""}`} onClick={() => setSelected(g)}><span className="kd-badge">{g.badge}</span><div className="kd-game-icon">{g.icon}</div><h3>{g.name}</h3><span>{g.meta}</span></article>)}</div>
        </section>

        <section className="kd-section kd-row">
          <div className="kd-panel"><div className="kd-section-head"><h2>🏆 المتصدرون</h2><span className="kd-more">هذا الأسبوع</span></div><div className="kd-list">{leaderboard.map(([avatar,name,score],i)=><div className="kd-item" key={name}><div className="kd-person"><div className="kd-avatar">{avatar}</div><div><b>{i+1}. {name}</b><div className="kd-muted">مستوى {40-i*6}</div></div></div><strong>{score}</strong></div>)}</div></div>
          <div className="kd-panel"><div className="kd-section-head"><h2>🎁 مكافأة اليوم</h2><span className="kd-more">مجانية</span></div><div className="kd-item"><div><b>صندوق الملك</b><div className="kd-muted">مكافأة يومية داخل اللعبة</div></div><span>💰 500</span></div><button className="kd-btn kd-primary" style={{marginTop:12,width:"100%"}} onClick={() => { setBalance((v) => v + 500); setNotice("🎁 تمت إضافة مكافأة تجريبية للرصيد المحلي."); }}>استلام المكافأة</button></div>
        </section>

        <section className="kd-section kd-panel kd-room-panel">
          <div className="kd-section-head"><h2>⚔️ غرفة الدومينو المباشرة</h2><span className="kd-more">2–4 لاعبين</span></div>
          <div className="kd-room-actions"><button className="kd-btn kd-primary" onClick={() => createRoom(false)} disabled={busy}>إنشاء غرفة</button><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="كود الغرفة" maxLength={6} /><button className="kd-btn kd-secondary" onClick={joinRoom} disabled={busy}>دخول</button></div>
          {room && <div className="kd-room-card"><div><b>الغرفة: {room.code}</b><div className="kd-muted">اللاعبون: {(room.players || []).join(" • ") || "لا يوجد"}</div></div><div className="kd-actions"><button className="kd-btn kd-primary" onClick={startRoom} disabled={room.started}>ابدأ المباراة</button>{demo && <button className="kd-btn kd-secondary" onClick={() => joinDemo(room.code)}>إعادة التجربة</button>}</div></div>}
          {room?.gameState?.started && <div className="kd-table"><div className="kd-turn">الدور: <b>Player {current}</b></div><div className="kd-board">{(room.gameState.board || []).map((t,i)=><div className="domino" key={i}><span>{t.left}</span><i></i><span>{t.right}</span></div>)}{!(room.gameState.board || []).length && <span className="kd-muted">ضع أول قطعة لتبدأ المعركة 👑</span>}</div><div className="kd-hand">{hand.map((t,i)=><button key={i} className="domino hand-tile" onClick={() => demoPlay(i)}><span>{t.left}</span><i></i><span>{t.right}</span></button>)}</div></div>}
          {notice && <div className="kd-notice">{notice}</div>}
        </section>

        <section className="kd-section kd-panel"><div className="kd-section-head"><h2>🎲 حالة النظام</h2><span className="kd-more">{games.length ? "API OK" : "واجهة جاهزة"}</span></div><div className="kd-muted">{games.length ? `تم تحميل ${games.length} لعبة من الخادم.` : "شغّل NestJS على 3000 لربط الغرف والألعاب مباشرة."}</div></section>
      </main>

      <nav className="kd-bottom"><div className="kd-nav">{[["home","⌂","الرئيسية"],["games","🎮","الألعاب"],["events","🏆","البطولات"],["wallet","💰","المحفظة"],["profile","👤","حسابي"]].map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><i>{icon}</i>{label}</button>)}</div></nav>

      {selected && <div className="kd-modal-backdrop" onClick={() => setSelected(null)}><div className="kd-modal" onClick={(e) => e.stopPropagation()}><div className="kd-modal-icon">{selected.icon}</div><h2>{selected.name}</h2><p>{selected.meta}</p><div className="kd-modal-actions"><button className="kd-btn kd-primary" onClick={() => { setSelected(null); selected.live ? createRoom(true) : setNotice(`🚀 ${selected.name} دخل قائمة التطوير — سيتم إطلاقه بنسخة أصلية خاصة بملوك الدومينو.`); }}>دخول اللعبة</button><button className="kd-btn kd-secondary" onClick={() => setSelected(null)}>رجوع</button></div></div></div>}
    </div>
  );
}
