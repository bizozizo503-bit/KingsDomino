import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import "./kingsdomino-theme.css";

const catalog = [
  { icon: "♛", name: "الدومينو الملكي", meta: "2–4 لاعبين • مباشر", badge: "الأصل", live: true },
  { icon: "⚡", name: "أولمبس الرعد", meta: "أركيد سريع • نقاط", badge: "جديد" },
  { icon: "🎯", name: "ملك الخمسة", meta: "تحديات مهارة", badge: "مميز" },
  { icon: "🏆", name: "بطولة الملوك", meta: "منافسات أسبوعية", badge: "بطولة" },
  { icon: "💎", name: "جوهرة الصحراء", meta: "ميني جيم • مطابقة", badge: "جديد" },
  { icon: "🌩️", name: "عرش العاصفة", meta: "مراحل ومهام", badge: "حدث" },
  { icon: "🛡️", name: "ساحة الفرسان", meta: "مبارزات نقاط", badge: "قريبًا" },
  { icon: "🪙", name: "كنز الملوك", meta: "مكافآت يومية", badge: "يومي" },
  { icon: "🔥", name: "بركان الذهب", meta: "تحدي سرعة", badge: "جديد" },
  { icon: "🌙", name: "ليلة الصحراء", meta: "مراحل هادئة", badge: "مميز" },
  { icon: "🧿", name: "عين الملك", meta: "ذاكرة وتركيز", badge: "مهارة" },
  { icon: "🚀", name: "سباق النجوم", meta: "توقيت ورد فعل", badge: "أركيد" },
  { icon: "⚔️", name: "ملحمة الفرسان", meta: "مبارزات فردية", badge: "قريبًا" },
  { icon: "👑", name: "تاج الملوك", meta: "تحدي أسبوعي", badge: "VIP" },
  { icon: "🌪️", name: "دوامة العرش", meta: "مراحل سريعة", badge: "حدث" },
  { icon: "🎁", name: "صندوق الأسرار", meta: "جائزة مجانية", badge: "يومي" },
];

const leaderboard = [
  ["👑", "ملك الدومينو", "9,840"],
  ["🦅", "الفارس الذهبي", "8,920"],
  ["🐺", "ذئب الليل", "8,410"],
  ["🦂", "حارس الصحراء", "7,980"],
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
  const [xp, setXp] = useState(68);
  const [dailyClaimed, setDailyClaimed] = useState(false);

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
    } catch {
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
    setXp((v) => Math.min(100, v + 4));
    setNotice(`وضعت ${tile.left}-${tile.right} على الطاولة. دور اللاعب الآخر.`);
  };

  const claimDaily = () => {
    if (dailyClaimed) return setNotice("استلمت مكافأة اليوم بالفعل. ارجع غدًا 👑");
    setDailyClaimed(true);
    setBalance((v) => v + 500);
    setXp((v) => Math.min(100, v + 10));
    setNotice("🎁 تمت إضافة 500 عملة تجريبية و+10 XP.");
  };

  const openGame = (g) => {
    setSelected(null);
    if (g.live) createRoom(true);
    else {
      setTab("games");
      setNotice(`🚀 ${g.name} أصبحت ضمن مركز الألعاب. النسخة الكاملة تُبنى بهوية KingsDomino الأصلية.`);
    }
  };

  const renderHome = () => (
    <>
      <section className="kd-hero">
        <div className="kd-kicker">⚡ الموسم الملكي • تجربة جديدة</div>
        <h1>ادخل الطاولة.<br />اترك بصمتك.</h1>
        <p>دومينو مباشر، بطولات، ألعاب أركيد أصلية، شخصيات، مؤثرات وحركة — كل شيء بهوية ملوك الدومينو.</p>
        <div className="kd-actions"><button className="kd-btn kd-primary" onClick={() => createRoom(true)} disabled={busy}>▶ العب الآن</button><button className="kd-btn kd-secondary" onClick={() => setTab("games")}>🎮 كل الألعاب</button></div>
        <div className="kd-stats"><span>🟢 الخادم <b>متصل</b></span><span>👥 لاعبين <b>2,481</b></span><span>🏆 بطولات <b>18</b></span><span>🎮 ألعاب <b>{catalog.length}</b></span></div>
      </section>
      <section className="kd-section"><div className="kd-section-head"><h2>🔥 عالم الملوك</h2><button className="kd-more kd-link" onClick={() => setTab("games")}>عرض الكل</button></div><div className="kd-grid">{catalog.slice(0, 8).map((g) => <GameCard key={g.name} game={g} onClick={() => setSelected(g)} />)}</div></section>
      <section className="kd-section kd-row">
        <div className="kd-panel"><div className="kd-section-head"><h2>🏆 المتصدرون</h2><button className="kd-more kd-link" onClick={() => setTab("events")}>هذا الأسبوع</button></div><div className="kd-list">{leaderboard.map(([avatar,name,score],i)=><div className="kd-item" key={name}><div className="kd-person"><div className="kd-avatar">{avatar}</div><div><b>{i+1}. {name}</b><div className="kd-muted">مستوى {40-i*6}</div></div></div><strong>{score}</strong></div>)}</div></div>
        <DailyReward claimed={dailyClaimed} onClaim={claimDaily} />
      </section>
    </>
  );

  const renderGames = () => (
    <section className="kd-section kd-page-panel"><div className="kd-section-head"><div><h2>🎮 مركز الألعاب</h2><div className="kd-muted">ألعاب KingsDomino الأصلية — الكتالوج يكبر باستمرار</div></div><span className="kd-more">{catalog.length} ألعاب</span></div><div className="kd-grid kd-games-large">{catalog.map((g) => <GameCard key={g.name} game={g} onClick={() => setSelected(g)} />)}</div></section>
  );

  const renderEvents = () => (
    <section className="kd-section kd-page-panel"><div className="kd-section-head"><div><h2>🏆 البطولات والمواسم</h2><div className="kd-muted">تحديات تنافسية وجوائز داخل اللعبة</div></div></div><div className="kd-event-grid"><div className="kd-event kd-event-main"><span>👑</span><b>كأس الملوك الكبرى</b><small>بطولة أسبوعية • 2–4 لاعبين</small><strong>🏆 50,000 نقطة</strong><button className="kd-btn kd-primary" onClick={() => { setTab("home"); setNotice("تم تسجيلك في البطولة التجريبية."); }}>انضم الآن</button></div><div className="kd-event"><span>⚡</span><b>سباق الرعد</b><small>تحديات سرعة لمدة 24 ساعة</small><strong>💎 2,500</strong></div><div className="kd-event"><span>🔥</span><b>سلسلة الفرسان</b><small>اربح 5 مباريات متتالية</small><strong>🎁 صندوق ملكي</strong></div></div><div className="kd-section"><div className="kd-section-head"><h2>المتصدرون</h2></div><div className="kd-list">{leaderboard.map(([avatar,name,score],i)=><div className="kd-item" key={name}><div className="kd-person"><div className="kd-avatar">{avatar}</div><b>#{i+1} {name}</b></div><strong>{score}</strong></div>)}</div></div></section>
  );

  const renderWallet = () => (
    <section className="kd-section kd-page-panel"><div className="kd-section-head"><div><h2>💰 محفظة الملوك</h2><div className="kd-muted">رصيد تجريبي محلي — الدفع الحقيقي يُضاف لاحقًا عبر مزود معتمد</div></div></div><div className="kd-balance-hero"><span>الرصيد الحالي</span><strong>🪙 {balance.toLocaleString("ar-EG")}</strong><div className="kd-actions"><button className="kd-btn kd-primary" onClick={() => { setBalance((v) => v + 1000); setNotice("تمت إضافة 1,000 عملة تجريبية."); }}>+ شحن تجريبي</button><button className="kd-btn kd-secondary" onClick={() => setNotice("التحويلات الحقيقية غير مفعلة في النسخة التجريبية.")}>تحويل</button></div></div><div className="kd-wallet-grid"><div className="kd-wallet-card"><span>🎁</span><b>المكافآت</b><small>جوائز يومية ومواسم</small></div><div className="kd-wallet-card"><span>🛡️</span><b>الأمان</b><small>عمليات الخادم فقط</small></div><div className="kd-wallet-card"><span>📊</span><b>السجل</b><small>كل العمليات قابلة للتتبع</small></div></div></section>
  );

  const renderProfile = () => (
    <section className="kd-section kd-page-panel"><div className="kd-profile-head"><div className="kd-profile-avatar">👑</div><div><h2>محمد</h2><div className="kd-muted">ملك الدومينو • المستوى 42</div></div></div><div className="kd-xp"><div><span>التقدم للمستوى التالي</span><b>{xp}%</b></div><div className="kd-xp-track"><i style={{width:`${xp}%`}} /></div></div><div className="kd-profile-grid"><div><b>18</b><small>بطولة</small></div><div><b>126</b><small>مباراة</small></div><div><b>73%</b><small>فوز</small></div><div><b>12</b><small>إنجاز</small></div></div><button className="kd-btn kd-primary" onClick={() => setNotice("ملف اللاعب جاهز للتخصيص في الإصدار القادم.")}>تخصيص الشخصية</button></section>
  );

  const renderRoom = () => (
    <section className="kd-section kd-panel kd-room-panel">
      <div className="kd-section-head"><h2>⚔️ غرفة الدومينو المباشرة</h2><span className="kd-more">2–4 لاعبين</span></div>
      <div className="kd-room-actions"><button className="kd-btn kd-primary" onClick={() => createRoom(false)} disabled={busy}>إنشاء غرفة</button><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="كود الغرفة" maxLength={6} /><button className="kd-btn kd-secondary" onClick={joinRoom} disabled={busy}>دخول</button></div>
      {room && <div className="kd-room-card"><div><b>الغرفة: {room.code}</b><div className="kd-muted">اللاعبون: {(room.players || []).join(" • ") || "لا يوجد"}</div></div><div className="kd-actions"><button className="kd-btn kd-primary" onClick={startRoom} disabled={room.started}>ابدأ المباراة</button>{demo && <button className="kd-btn kd-secondary" onClick={() => joinDemo(room.code)}>إعادة التجربة</button>}</div></div>}
      {room?.gameState?.started && <div className="kd-table"><div className="kd-turn">الدور: <b>Player {current}</b></div><div className="kd-board">{(room.gameState.board || []).map((t,i)=><div className="domino" key={i}><span>{t.left}</span><i></i><span>{t.right}</span></div>)}{!(room.gameState.board || []).length && <span className="kd-muted">ضع أول قطعة لتبدأ المعركة 👑</span>}</div><div className="kd-hand">{hand.map((t,i)=><button key={i} className="domino hand-tile" onClick={() => demoPlay(i)}><span>{t.left}</span><i></i><span>{t.right}</span></button>)}</div></div>}
      {notice && <div className="kd-notice">{notice}</div>}
    </section>
  );

  return (
    <div className="kd-app" dir="rtl">
      <main className="kd-shell">
        <header className="kd-top"><div className="kd-brand"><div className="kd-crown">👑</div><div><div className="kd-title">ملوك الدومينو</div><div className="kd-sub">KINGSDOMINO • THE ROYAL ARCADE</div></div></div><button className="kd-wallet" onClick={() => setTab("wallet")}><span className="kd-coin">🪙</span><b>{balance.toLocaleString("ar-EG")}</b><span className="kd-add">+</span></button></header>
        {tab === "home" && renderHome()}
        {tab === "games" && renderGames()}
        {tab === "events" && renderEvents()}
        {tab === "wallet" && renderWallet()}
        {tab === "profile" && renderProfile()}
        {tab === "home" && renderRoom()}
      </main>
      <nav className="kd-bottom"><div className="kd-nav">{[["home","⌂","الرئيسية"],["games","🎮","الألعاب"],["events","🏆","البطولات"],["wallet","💰","المحفظة"],["profile","👤","حسابي"]].map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><i>{icon}</i>{label}</button>)}</div></nav>
      {selected && <div className="kd-modal-backdrop" onClick={() => setSelected(null)}><div className="kd-modal" onClick={(e) => e.stopPropagation()}><div className="kd-modal-icon">{selected.icon}</div><h2>{selected.name}</h2><p>{selected.meta}</p><div className="kd-modal-actions"><button className="kd-btn kd-primary" onClick={() => openGame(selected)}>دخول اللعبة</button><button className="kd-btn kd-secondary" onClick={() => setSelected(null)}>رجوع</button></div></div></div>}
    </div>
  );
}

function GameCard({ game, onClick }) {
  return <article className={`kd-game ${game.live ? "kd-featured" : ""}`} onClick={onClick}><span className="kd-badge">{game.badge}</span><div className="kd-game-icon">{game.icon}</div><h3>{game.name}</h3><span>{game.meta}</span></article>;
}

function DailyReward({ claimed, onClaim }) {
  return <div className="kd-panel"><div className="kd-section-head"><h2>🎁 مكافأة اليوم</h2><span className="kd-more">{claimed ? "تم الاستلام" : "مجانية"}</span></div><div className="kd-item"><div><b>صندوق الملك</b><div className="kd-muted">مكافأة يومية داخل اللعبة</div></div><span>💰 500</span></div><button className="kd-btn kd-primary" style={{marginTop:12,width:"100%"}} onClick={onClaim}>{claimed ? "ارجع غدًا" : "استلام المكافأة"}</button></div>;
}
