import { useEffect, useState } from "react";
import { api } from "./api";
import "./kingsdomino-theme.css";

const featured = [
  { icon: "♛", name: "الدومينو الملكي", meta: "لعب مباشر • 2–4 لاعبين", badge: "الأصل", featured: true },
  { icon: "⚡", name: "أولمبس الرعد", meta: "مغامرة حظ سريعة", badge: "جديد" },
  { icon: "🎯", name: "ملك الخمسة", meta: "تحديات نقاط", badge: "مميز" },
  { icon: "🏆", name: "بطولة الملوك", meta: "منافسات أسبوعية", badge: "بطولة" },
  { icon: "💎", name: "جوهرة الصحراء", meta: "ميني جيم", badge: "جديد" },
  { icon: "🎰", name: "كنز الملوك", meta: "مكافآت يومية", badge: "حدث" },
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

  useEffect(() => {
    api.get("/games").then((res) => setGames(res.data)).catch(() => setGames([]));
  }, []);

  const start = () => window.alert("🎮 تجهيز طاولة الدومينو الملكية...\\nسيتم ربطها بالغرفة المباشرة في المرحلة التالية.");
  const wallet = () => setBalance((v) => v + 500);

  return (
    <div className="kd-app" dir="rtl">
      <main className="kd-shell">
        <header className="kd-top">
          <div className="kd-brand">
            <div className="kd-crown">👑</div>
            <div><div className="kd-title">ملوك الدومينو</div><div className="kd-sub">KINGSDOMINO • العب بمهارة</div></div>
          </div>
          <div className="kd-wallet"><span className="kd-coin">🪙</span><b>{balance.toLocaleString("ar-EG")}</b><button className="kd-add" onClick={wallet}>+</button></div>
        </header>

        <section className="kd-hero">
          <div className="kd-kicker">👑 الموسم الملكي الجديد</div>
          <h1>ملك الطاولة يبدأ من هنا.</h1>
          <p>تجربة دومينو أونلاين سريعة وفاخرة، غرف مباشرة، بطولات، شخصيات، ومؤثرات مصممة خصيصًا لملوك الدومينو.</p>
          <div className="kd-actions"><button className="kd-btn kd-primary" onClick={start}>▶ العب الآن</button><button className="kd-btn kd-secondary" onClick={() => setTab("games")}>🎮 كل الألعاب</button></div>
        </section>

        <section className="kd-section">
          <div className="kd-section-head"><h2>🔥 الألعاب المميزة</h2><span className="kd-more">عرض الكل ←</span></div>
          <div className="kd-grid">{featured.map((g) => <article key={g.name} className={`kd-game ${g.featured ? "kd-featured" : ""}`} onClick={g.featured ? start : undefined}><span className="kd-badge">{g.badge}</span><div className="kd-game-icon">{g.icon}</div><h3>{g.name}</h3><span>{g.meta}</span></article>)}</div>
        </section>

        <section className="kd-section kd-row">
          <div className="kd-panel"><div className="kd-section-head"><h2>🏆 المتصدرون</h2><span className="kd-more">هذا الأسبوع</span></div><div className="kd-list">{leaderboard.map(([avatar,name,score],i)=><div className="kd-item" key={name}><div className="kd-person"><div className="kd-avatar">{avatar}</div><div><b>{i+1}. {name}</b><div className="kd-muted">مستوى {40-i*6}</div></div></div><strong>{score}</strong></div>)}</div></div>
          <div className="kd-panel"><div className="kd-section-head"><h2>🎁 مكافأة اليوم</h2></div><div className="kd-item"><div><b>صندوق الملك</b><div className="kd-muted">سجّل دخولك واحصل على المكافأة</div></div><span>💰 500</span></div><button className="kd-btn kd-primary" style={{marginTop:12,width:"100%"}} onClick={wallet}>استلام المكافأة</button></div>
        </section>

        <section className="kd-section kd-panel"><div className="kd-section-head"><h2>🎲 حالة النظام</h2><span className="kd-more">متصل</span></div><div className="kd-muted">{games.length ? `تم تحميل ${games.length} لعبة من الخادم.` : "الخادم جاهز — واجهة الألعاب تعمل محليًا حتى يتم ربط الكتالوج الكامل."}</div></section>
      </main>
      <nav className="kd-bottom"><div className="kd-nav">{[["home","⌂","الرئيسية"],["games","🎮","الألعاب"],["events","🏆","البطولات"],["wallet","💰","المحفظة"],["profile","👤","حسابي"]].map(([id,icon,label])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><i>{icon}</i>{label}</button>)}</div></nav>
    </div>
  );
}
