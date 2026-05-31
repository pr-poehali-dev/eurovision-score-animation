import { useState, useRef, useCallback, useEffect } from "react";

// Баллы от меньшего к большему — как в оригинале ESC
const POINTS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const flag = (cc: string) => `https://flagcdn.com/w80/${cc}.png`;

const CONTESTANTS = [
  { id: "AT", name: "AUSTRIA",         cc: "at" },
  { id: "AZ", name: "AZERBAIJAN",      cc: "az" },
  { id: "AM", name: "ARMENIA",         cc: "am" },
  { id: "DK", name: "DENMARK",         cc: "dk" },
  { id: "NL", name: "THE NETHERLANDS", cc: "nl" },
  { id: "HU", name: "HUNGARY",         cc: "hu" },
  { id: "FI", name: "FINLAND",         cc: "fi" },
  { id: "IL", name: "ISRAEL",          cc: "il" },
  { id: "IS", name: "ICELAND",         cc: "is" },
  { id: "EE", name: "ESTONIA",         cc: "ee" },
  { id: "NO", name: "NORWAY",          cc: "no" },
  { id: "RU", name: "RUSSIA",          cc: "ru" },
  { id: "BG", name: "BULGARIA",        cc: "bg" },
  { id: "CH", name: "SWITZERLAND",     cc: "ch" },
  { id: "GR", name: "GREECE",          cc: "gr" },
  { id: "PT", name: "PORTUGAL",        cc: "pt" },
  { id: "SE", name: "SWEDEN",          cc: "se" },
  { id: "ES", name: "SPAIN",           cc: "es" },
  { id: "GB", name: "UNITED KINGDOM",  cc: "gb" },
  { id: "FR", name: "FRANCE",          cc: "fr" },
  { id: "DE", name: "GERMANY",         cc: "de" },
  { id: "IT", name: "ITALY",           cc: "it" },
  { id: "UA", name: "UKRAINE",         cc: "ua" },
  { id: "MT", name: "MALTA",           cc: "mt" },
  { id: "PL", name: "POLAND",          cc: "pl" },
  { id: "SI", name: "SLOVENIA",        cc: "si" },
];

const VOTING_COUNTRIES = [
  { id: "AL", name: "ALBANIA",         cc: "al" },
  { id: "AM", name: "ARMENIA",         cc: "am" },
  { id: "AT", name: "AUSTRIA",         cc: "at" },
  { id: "AZ", name: "AZERBAIJAN",      cc: "az" },
  { id: "BY", name: "BELARUS",         cc: "by" },
  { id: "BE", name: "BELGIUM",         cc: "be" },
  { id: "BG", name: "BULGARIA",        cc: "bg" },
  { id: "HR", name: "CROATIA",         cc: "hr" },
  { id: "CY", name: "CYPRUS",          cc: "cy" },
  { id: "DK", name: "DENMARK",         cc: "dk" },
  { id: "EE", name: "ESTONIA",         cc: "ee" },
  { id: "FI", name: "FINLAND",         cc: "fi" },
  { id: "FR", name: "FRANCE",          cc: "fr" },
  { id: "DE", name: "GERMANY",         cc: "de" },
  { id: "GR", name: "GREECE",          cc: "gr" },
  { id: "HU", name: "HUNGARY",         cc: "hu" },
  { id: "IS", name: "ICELAND",         cc: "is" },
  { id: "IL", name: "ISRAEL",          cc: "il" },
  { id: "IT", name: "ITALY",           cc: "it" },
  { id: "LV", name: "LATVIA",          cc: "lv" },
  { id: "LT", name: "LITHUANIA",       cc: "lt" },
  { id: "MT", name: "MALTA",           cc: "mt" },
  { id: "MD", name: "MOLDOVA",         cc: "md" },
  { id: "ME", name: "MONTENEGRO",      cc: "me" },
  { id: "NL", name: "THE NETHERLANDS", cc: "nl" },
  { id: "NO", name: "NORWAY",          cc: "no" },
  { id: "PL", name: "POLAND",          cc: "pl" },
  { id: "PT", name: "PORTUGAL",        cc: "pt" },
  { id: "RO", name: "ROMANIA",         cc: "ro" },
  { id: "RU", name: "RUSSIA",          cc: "ru" },
  { id: "SM", name: "SAN MARINO",      cc: "sm" },
  { id: "RS", name: "SERBIA",          cc: "rs" },
  { id: "SI", name: "SLOVENIA",        cc: "si" },
  { id: "ES", name: "SPAIN",           cc: "es" },
  { id: "SE", name: "SWEDEN",          cc: "se" },
  { id: "CH", name: "SWITZERLAND",     cc: "ch" },
  { id: "UA", name: "UKRAINE",         cc: "ua" },
];

type Entry = {
  id: string;
  name: string;
  cc: string;
  score: number;
  flashedByVoter: number | null;
  is12: boolean;
  coveredPts: number | null; // балл, закрывающий флаг
};

type FlyBall = {
  id: number;
  pts: number;
  x1: number; y1: number;
  x2: number; y2: number;
};

// Хук анимированного счётчика
function useCountUp(target: number, duration = 700): number {
  const [display, setDisplay] = useState(target);
  const prev = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    if (from === target) { setDisplay(target); return; }
    prev.current = target;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else setDisplay(target);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

// Строка счёта
function ScoreRow({
  entry, isVoter, alreadyVoted, hasNext, onClick, isLeader,
}: {
  entry: Entry;
  isVoter: boolean;
  alreadyVoted: boolean;
  hasNext: boolean;
  onClick: (id: string) => void;
  isLeader: boolean;
}) {
  const displayScore = useCountUp(entry.score, 750);
  const isFlash = entry.flashedByVoter !== null;
  const is12 = entry.is12;
  const unclickable = isVoter || alreadyVoted || !hasNext;

  return (
    <div
      data-id={entry.id}
      onClick={() => !unclickable && onClick(entry.id)}
      style={{
        display: "flex",
        alignItems: "center",
        height: "46px",
        padding: "0 10px 0 8px",
        // 12 баллов = оранжево-золотой, обычный flash = синий
        background: is12
          ? "linear-gradient(90deg, rgba(200,90,0,0.6) 0%, rgba(160,55,0,0.42) 50%, rgba(60,18,0,0.15) 100%)"
          : isFlash
            ? "linear-gradient(90deg, rgba(15,105,255,0.52) 0%, rgba(6,52,180,0.36) 52%, rgba(2,18,75,0.14) 100%)"
            : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        cursor: unclickable ? "default" : "pointer",
        opacity: isVoter ? 0.42 : 1,
        transition: "background 0.4s ease, opacity 0.3s",
        position: "relative",
        userSelect: "none",
        boxSizing: "border-box",
      }}
    >
      {/* FLAG CELL */}
      <div
        data-flag={entry.id}
        style={{
          width: "58px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", height: "100%",
        }}
      >
        <img
          src={flag(entry.cc)}
          alt={entry.name}
          style={{
            width: "44px", height: "29px",
            objectFit: "cover",
            borderRadius: "2px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.65)",
            display: "block",
            animation: isLeader ? "flagWave 2.2s ease-in-out infinite" : "none",
            transformOrigin: "left center",
          }}
        />
        {/* Шар закрывает флаг до конца голосования */}
        {entry.coveredPts !== null && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5,
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              background: entry.coveredPts === 12
                ? "radial-gradient(circle at 35% 28%, #fff5a0 0%, #FFD700 30%, #FF8500 72%, #cc4000 100%)"
                : entry.coveredPts === 10
                  ? "radial-gradient(circle at 35% 28%, #ffff90 0%, #FFC800 36%, #FF9500 100%)"
                  : "radial-gradient(circle at 35% 28%, #c8eeff 0%, #35a8ff 36%, #0040cc 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: entry.coveredPts >= 10 ? "17px" : "14px",
              color: "#fff",
              boxShadow: entry.coveredPts === 12
                ? "0 0 16px rgba(255,160,0,0.95), 0 0 28px rgba(255,80,0,0.5)"
                : "0 0 12px rgba(30,140,255,0.85)",
              textShadow: "0 1px 3px rgba(0,0,0,0.75)",
            }}>
              {entry.coveredPts}
            </div>
          </div>
        )}
      </div>

      {/* NAME */}
      <div style={{
        flex: 1,
        fontSize: "15px",
        fontWeight: 500,
        letterSpacing: "0.07em",
        color: isFlash ? "#ffffff" : "rgba(180,218,255,0.92)",
        fontFamily: "'Montserrat', sans-serif",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        transition: "color 0.25s",
      }}>
        {entry.name}
      </div>

      {/* SCORE */}
      <div style={{
        width: "56px",
        textAlign: "right",
        flexShrink: 0,
        fontSize: isFlash ? "22px" : "18px",
        fontWeight: 700,
        color: is12 ? "#FFD700" : isFlash ? "#7df8ff" : "#70c2f0",
        fontFamily: "'Montserrat', sans-serif",
        transition: "font-size 0.22s, color 0.22s",
      }}>
        {displayScore > 0 ? displayScore : ""}
      </div>
    </div>
  );
}

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>(
    CONTESTANTS.map(c => ({
      ...c, score: 0,
      flashedByVoter: null, is12: false, coveredPts: null,
    }))
  );

  const [voterIdx, setVoterIdx] = useState(0);
  const [givenTo, setGivenTo]   = useState<Record<number, Set<string>>>({});
  const [awardedCount, setAwardedCount] = useState<Record<number, number>>({});
  const [flyBalls, setFlyBalls] = useState<FlyBall[]>([]);
  const [ballId, setBallId]     = useState(0);
  const [douze, setDouze]       = useState(false);
  const [blocked, setBlocked]   = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);
  const audioRef     = useRef<AudioContext | null>(null);

  const voter        = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const count        = awardedCount[voterIdx] ?? 0;
  const nextPt       = count < POINTS_ORDER.length ? POINTS_ORDER[count] : null;
  const voterGivenTo = givenTo[voterIdx] ?? new Set<string>();

  // Лидеры
  const maxScore  = Math.max(0, ...entries.map(e => e.score));
  const leaderIds = maxScore > 0
    ? new Set(entries.filter(e => e.score === maxScore).map(e => e.id))
    : new Set<string>();

  // ── FLIP ──
  const savePositions = useCallback((): Record<string, number> => {
    const pos: Record<string, number> = {};
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      pos[el.getAttribute("data-id")!] = el.getBoundingClientRect().top;
    });
    return pos;
  }, []);

  const runFlip = useCallback((old: Record<string, number>) => {
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      const id  = el.getAttribute("data-id")!;
      const dy  = (old[id] ?? 0) - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) return;
      el.style.transform  = `translateY(${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform  = "translateY(0)";
        el.style.transition = "transform 1s cubic-bezier(0.22,0.61,0.36,1)";
      }));
    });
  }, []);

  // ── SOUND ──
  const playSound = useCallback((pts: number) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const tone = (f: number, t: number, d: number, v = 0.3) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(v, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + d + 0.05);
      };
      if (pts === 12) {
        tone(523,0,0.1,0.4); tone(659,0.1,0.1,0.45);
        tone(784,0.22,0.12,0.5); tone(1047,0.36,0.5,0.55);
        tone(1319,0.55,0.65,0.5);
      } else if (pts === 10) {
        tone(523,0,0.1,0.35); tone(659,0.12,0.12,0.4); tone(784,0.26,0.4,0.42);
      } else if (pts >= 7) {
        tone(440,0,0.08,0.3); tone(659,0.1,0.3,0.35);
      } else {
        tone(440,0,0.06,0.25); tone(523,0.07,0.2,0.28);
      }
    } catch (_e) { /* no audio ctx */ }
  }, []);

  // ── CLICK ──
  const handleClick = useCallback((targetId: string) => {
    if (blocked || !nextPt) return;
    if (targetId === voter.id) return;
    if (voterGivenTo.has(targetId)) return;

    // Координаты флага цели
    const flagEl = containerRef.current?.querySelector<HTMLElement>(`[data-flag="${targetId}"]`);
    if (!flagEl) return;
    const fr = flagEl.getBoundingClientRect();
    const pr = panelRef.current?.getBoundingClientRect();
    const sx = pr ? pr.left + pr.width / 2 : window.innerWidth / 2;
    const sy = pr ? pr.top  + pr.height / 2 : window.innerHeight - 80;

    const pts = nextPt;
    const nb: FlyBall = {
      id: ballId, pts,
      x1: sx, y1: sy,
      x2: fr.left + fr.width  / 2,
      y2: fr.top  + fr.height / 2,
    };

    setBlocked(true);
    setBallId(b => b + 1);
    setFlyBalls(prev => [...prev, nb]);
    if (pts === 12) setDouze(true);
    playSound(pts);

    const newCount = count + 1;
    const isLast   = newCount >= POINTS_ORDER.length;

    setAwardedCount(prev => ({ ...prev, [voterIdx]: newCount }));
    setGivenTo(prev => {
      const s = new Set(prev[voterIdx] ?? new Set<string>());
      s.add(targetId);
      return { ...prev, [voterIdx]: s };
    });

    // Шар долетает → флаг закрыт + обновить счёт + FLIP
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== nb.id));

      const old = savePositions();

      setEntries(prev => {
        const updated = prev.map(e =>
          e.id === targetId
            ? { ...e, score: e.score + pts, flashedByVoter: voterIdx, is12: pts === 12, coveredPts: pts }
            : e
        );
        // Сортировка по убыванию счёта
        return [...updated].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      });

      requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));

      if (pts === 12) setTimeout(() => setDouze(false), 2500);

      // Последний балл → через паузу сбросить подсветку и перейти к следующему
      if (isLast) {
        setTimeout(() => {
          setEntries(prev => prev.map(e =>
            e.flashedByVoter === voterIdx
              ? { ...e, flashedByVoter: null, is12: false, coveredPts: null }
              : e
          ));
          setVoterIdx(v => v + 1);
        }, 2200);
      }

      setBlocked(false);
    }, 680);
  }, [blocked, nextPt, voter.id, voterGivenTo, ballId, count, voterIdx, playSound, savePositions, runFlip]);

  // Делим на два столбца
  const half  = Math.ceil(entries.length / 2);
  const left  = entries.slice(0, half);
  const right = entries.slice(half);

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Montserrat', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "#030817",
    }}>

      {/* ══════ ANIMATED BACKGROUND ══════ */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Base dark */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#030818 0%,#050d24 40%,#060f2a 70%,#030814 100%)" }} />

        {/* Slow sweep highlight */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(112deg, transparent 25%, rgba(0,70,200,0.07) 50%, transparent 75%)",
          animation: "bgSweep 9s ease-in-out infinite",
        }} />

        {/* Pulsing blue orb left */}
        <div style={{
          position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,55,190,0.2) 0%, transparent 68%)",
          left: "-8%", top: "15%",
          animation: "orb1 13s ease-in-out infinite",
        }} />
        {/* Pulsing purple orb right */}
        <div style={{
          position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90,0,175,0.17) 0%, transparent 68%)",
          right: "-6%", top: "5%",
          animation: "orb2 17s ease-in-out infinite",
        }} />

        {/* Grid lines (globe effect) */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,80,200,0.04) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,80,200,0.04) 60px)
          `,
        }} />

        {/* Stars */}
        {Array.from({ length: 55 }).map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width:  i % 8 === 0 ? "2.5px" : "1.5px",
            height: i % 8 === 0 ? "2.5px" : "1.5px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.75)",
            left: `${(i * 41.3 + 5) % 100}%`,
            top:  `${(i * 23.7 + 3) % 62}%`,
            animation: `star ${2.2 + (i % 5) * 0.5}s ease-in-out ${(i * 0.27) % 3}s infinite`,
          }} />
        ))}

        {/* Bottom waves */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "230px" }}>
          <svg viewBox="0 0 1440 230" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
            <defs>
              <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3a0092" stopOpacity="0.85"/>
                <stop offset="50%" stopColor="#5800bb" stopOpacity="0.75"/>
                <stop offset="100%" stopColor="#3a0092" stopOpacity="0.85"/>
              </linearGradient>
              <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0022a0" stopOpacity="0.82"/>
                <stop offset="50%" stopColor="#0040cc" stopOpacity="0.68"/>
                <stop offset="100%" stopColor="#0022a0" stopOpacity="0.82"/>
              </linearGradient>
              <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#cc0088" stopOpacity="0.45"/>
                <stop offset="50%" stopColor="#ee00aa" stopOpacity="0.38"/>
                <stop offset="100%" stopColor="#cc0088" stopOpacity="0.45"/>
              </linearGradient>
            </defs>
            <path className="wave3" d="M0,135 C280,72 580,158 880,108 C1080,77 1300,120 1440,97 L1440,230 L0,230Z" fill="url(#wg3)"/>
            <path className="wave2" d="M0,153 C235,108 472,160 720,138 C970,115 1212,155 1440,138 L1440,230 L0,230Z" fill="url(#wg2)"/>
            <path className="wave1" d="M0,170 C352,150 712,175 1082,160 C1272,154 1372,166 1440,160 L1440,230 L0,230Z" fill="url(#wg1)"/>
          </svg>
        </div>

        {/* Glowing horizon */}
        <div style={{
          position: "absolute", bottom: "205px", left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg,transparent 0%,rgba(0,130,255,0.55) 18%,rgba(150,40,255,0.65) 50%,rgba(0,130,255,0.55) 82%,transparent 100%)",
          filter: "blur(1.5px)",
        }} />
      </div>

      {/* ══════ CONTENT ══════ */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "1000px",
        padding: "12px 14px 22px",
        flex: 1, display: "flex", flexDirection: "column",
      }}>

        {/* Title */}
        <div style={{
          textAlign: "center", marginBottom: "10px",
          fontSize: "11px", letterSpacing: "0.26em",
          color: "rgba(100,178,255,0.44)", fontWeight: 600,
          textTransform: "uppercase",
        }}>
          Eurovision Song Contest 2014 · Grand Final
        </div>

        {/* ── SCOREBOARD ── */}
        <div style={{
          background: "linear-gradient(180deg, rgba(2,9,34,0.97) 0%, rgba(3,13,44,0.95) 100%)",
          borderRadius: "6px 6px 0 0",
          border: "1px solid rgba(14,56,138,0.58)",
          borderBottom: "none",
          overflow: "hidden",
          boxShadow: "0 8px 55px rgba(0,0,0,0.78), inset 0 1px 0 rgba(45,115,255,0.13)",
        }}>
          <div ref={containerRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(14,56,138,0.38)" }}>
              {left.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={voterGivenTo.has(e.id)}
                  hasNext={!!nextPt}
                  onClick={handleClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
            <div>
              {right.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={voterGivenTo.has(e.id)}
                  hasNext={!!nextPt}
                  onClick={handleClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── BOTTOM PANEL ── */}
        <div ref={panelRef} style={{
          background: "linear-gradient(180deg, rgba(1,6,22,0.99) 0%, rgba(1,4,15,1) 100%)",
          borderRadius: "0 0 6px 6px",
          border: "1px solid rgba(14,56,138,0.58)",
          borderTop: "1px solid rgba(14,56,138,0.32)",
          padding: "8px 14px 10px",
        }}>

          {/* Voter row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px", paddingBottom: "7px",
            borderBottom: "1px solid rgba(20,60,150,0.3)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src={flag(voter.cc)} alt={voter.name}
                style={{ width: "38px", height: "25px", objectFit: "cover", borderRadius: "2px", boxShadow: "0 1px 5px rgba(0,0,0,0.6)" }}
              />
              <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.13em", color: "#a6d8ff" }}>
                {voter.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "10.5px", letterSpacing: "0.1em", color: "rgba(95,168,255,0.5)" }}>
                {voterIdx + 1} OF {VOTING_COUNTRIES.length} COUNTRIES VOTING
              </span>
              <div style={{ width: "100px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(voterIdx / VOTING_COUNTRIES.length) * 100}%`,
                  background: "linear-gradient(90deg,#0070ff,#8820ff)",
                  borderRadius: "2px", transition: "width 0.5s ease",
                }} />
              </div>
            </div>
          </div>

          {/* Points buttons 1→12 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
            {POINTS_ORDER.map((pts, idx) => {
              const used   = idx < count;
              const isNext = pts === nextPt;
              const isBig  = pts === 12 || pts === 10;
              return (
                <div key={pts} style={{
                  position: "relative",
                  width:  isBig ? "62px" : "52px",
                  height: isBig ? "56px" : "47px",
                  borderRadius: "7px",
                  overflow: "hidden",
                  background: used
                    ? "rgba(255,255,255,0.03)"
                    : isNext
                      ? "linear-gradient(158deg,#2a7aec 0%,#104ab8 44%,#0b32920 100%)"
                      : "linear-gradient(158deg,rgba(13,44,115,0.85) 0%,rgba(5,22,70,0.92) 100%)",
                  border: isNext
                    ? "1.5px solid rgba(95,182,255,0.88)"
                    : used
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(26,80,188,0.42)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isBig ? "21px" : "17px",
                  fontWeight: 800,
                  color: used ? "rgba(255,255,255,0.08)" : isNext ? "#fff" : "rgba(120,192,255,0.65)",
                  boxShadow: isNext
                    ? "0 0 20px rgba(0,120,255,0.72),0 0 40px rgba(0,70,225,0.42),inset 0 1px 0 rgba(255,255,255,0.28),inset 0 -1px 0 rgba(0,0,0,0.35)"
                    : "0 2px 7px rgba(0,0,0,0.55)",
                  transform: isNext ? "scale(1.13)" : "scale(1)",
                  transition: "all 0.25s ease",
                  cursor: "default",
                }}>
                  {/* Crystal shine */}
                  {isNext && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: "44%", height: "44%",
                      background: "linear-gradient(138deg,rgba(255,255,255,0.3) 0%,transparent 100%)",
                      pointerEvents: "none",
                    }} />
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>
                    {used ? "" : pts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════ FLYING BALLS ══════ */}
      {flyBalls.map(ball => {
        const sz = ball.pts === 12 ? 54 : ball.pts === 10 ? 46 : 38;
        return (
          <div key={ball.id} style={{
            position: "fixed", left: ball.x1, top: ball.y1,
            width: 0, height: 0, zIndex: 500, pointerEvents: "none",
            "--dx": `${ball.x2 - ball.x1}px`,
            "--dy": `${ball.y2 - ball.y1}px`,
            animation: "escFly 0.68s cubic-bezier(0.38,0,0.56,1) forwards",
          } as React.CSSProperties & Record<string, string>}>
            <div style={{
              width: sz, height: sz, borderRadius: "50%",
              transform: "translate(-50%,-50%)",
              background: ball.pts === 12
                ? "radial-gradient(circle at 35% 28%,#fff5a0 0%,#FFD700 30%,#FF8500 72%,#cc4000 100%)"
                : ball.pts === 10
                  ? "radial-gradient(circle at 35% 28%,#ffff90 0%,#FFC800 35%,#FF9500 100%)"
                  : "radial-gradient(circle at 35% 28%,#c8eeff 0%,#35a8ff 35%,#0040cc 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: ball.pts >= 10 ? "21px" : "16px",
              color: "#fff",
              boxShadow: ball.pts === 12
                ? "0 0 28px rgba(255,180,0,1),0 0 56px rgba(255,80,0,0.8)"
                : ball.pts === 10
                  ? "0 0 22px rgba(255,200,0,1),0 0 44px rgba(255,130,0,0.6)"
                  : "0 0 18px rgba(30,145,255,1),0 0 36px rgba(0,80,225,0.6)",
              textShadow: "0 1px 4px rgba(0,0,0,0.75)",
            }}>{ball.pts}</div>
          </div>
        );
      })}

      {/* ══════ DOUZE POINTS ══════ */}
      {douze && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center,rgba(255,140,0,0.13) 0%,transparent 62%)",
        }}>
          <div style={{ animation: "escDouze 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards", textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(52px,11vw,100px)",
              fontWeight: 900, letterSpacing: "0.04em",
              fontFamily: "'Montserrat',sans-serif",
              background: "linear-gradient(180deg,#fffbc0 0%,#FFD700 42%,#FF9200 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              filter: "drop-shadow(0 0 34px rgba(255,185,0,0.97))",
              lineHeight: 1,
            }}>DOUZE POINTS!</div>
            <div style={{ fontSize: "16px", letterSpacing: "0.45em", color: "rgba(255,210,70,0.62)", marginTop: "12px" }}>✦ ✦ ✦</div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes escFly {
          0%   { transform:translate(0,0); opacity:1; }
          72%  { opacity:1; }
          100% { transform:translate(var(--dx),var(--dy)); opacity:0; }
        }
        @keyframes escDouze {
          0%   { transform:scale(0.3) rotate(-3deg); opacity:0; }
          65%  { transform:scale(1.08) rotate(1deg); opacity:1; }
          100% { transform:scale(1) rotate(0deg); opacity:1; }
        }
        @keyframes bgSweep {
          0%,100% { transform:translateX(-120%); }
          50%      { transform:translateX(120%); }
        }
        @keyframes orb1 {
          0%,100% { transform:translate(0,0) scale(1); opacity:.7; }
          50%      { transform:translate(55px,-38px) scale(1.14); opacity:1; }
        }
        @keyframes orb2 {
          0%,100% { transform:translate(0,0) scale(1); opacity:.6; }
          50%      { transform:translate(-45px,28px) scale(1.1); opacity:.9; }
        }
        @keyframes star {
          0%,100% { opacity:.25; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.9); }
        }
        @keyframes flagWave {
          0%   { transform:skewX(0deg) scaleX(1); }
          18%  { transform:skewX(2.5deg) scaleX(1.025); }
          38%  { transform:skewX(-2deg) scaleX(0.99); }
          58%  { transform:skewX(1.8deg) scaleX(1.015); }
          78%  { transform:skewX(-1.2deg) scaleX(1); }
          100% { transform:skewX(0deg) scaleX(1); }
        }
        .wave1 { animation: wm1 7s ease-in-out infinite; }
        .wave2 { animation: wm2 9s ease-in-out infinite; }
        .wave3 { animation: wm3 11s ease-in-out infinite; }
        @keyframes wm1 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-28px)} }
        @keyframes wm2 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(22px)} }
        @keyframes wm3 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-16px)} }
        [data-id]:hover { filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
