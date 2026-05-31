import { useState, useRef, useCallback, useEffect } from "react";

const POINTS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const CONTESTANTS = [
  { id: "AT", name: "AUSTRIA", flag: "🇦🇹" },
  { id: "AZ", name: "AZERBAIJAN", flag: "🇦🇿" },
  { id: "AM", name: "ARMENIA", flag: "🇦🇲" },
  { id: "DK", name: "DENMARK", flag: "🇩🇰" },
  { id: "NL", name: "THE NETHERLANDS", flag: "🇳🇱" },
  { id: "HU", name: "HUNGARY", flag: "🇭🇺" },
  { id: "FI", name: "FINLAND", flag: "🇫🇮" },
  { id: "IL", name: "ISRAEL", flag: "🇮🇱" },
  { id: "IS", name: "ICELAND", flag: "🇮🇸" },
  { id: "EE", name: "ESTONIA", flag: "🇪🇪" },
  { id: "NO", name: "NORWAY", flag: "🇳🇴" },
  { id: "RU", name: "RUSSIA", flag: "🇷🇺" },
  { id: "BG", name: "BULGARIA", flag: "🇧🇬" },
  { id: "CH", name: "SWITZERLAND", flag: "🇨🇭" },
  { id: "GR", name: "GREECE", flag: "🇬🇷" },
  { id: "PT", name: "PORTUGAL", flag: "🇵🇹" },
  { id: "SE", name: "SWEDEN", flag: "🇸🇪" },
  { id: "ES", name: "SPAIN", flag: "🇪🇸" },
  { id: "GB", name: "UNITED KINGDOM", flag: "🇬🇧" },
  { id: "FR", name: "FRANCE", flag: "🇫🇷" },
  { id: "DE", name: "GERMANY", flag: "🇩🇪" },
  { id: "IT", name: "ITALY", flag: "🇮🇹" },
  { id: "UA", name: "UKRAINE", flag: "🇺🇦" },
  { id: "MT", name: "MALTA", flag: "🇲🇹" },
  { id: "PL", name: "POLAND", flag: "🇵🇱" },
  { id: "SI", name: "SLOVENIA", flag: "🇸🇮" },
];

const VOTING_COUNTRIES = [
  { id: "AL", name: "ALBANIA", flag: "🇦🇱" },
  { id: "AM2", name: "ARMENIA", flag: "🇦🇲" },
  { id: "AT2", name: "AUSTRIA", flag: "🇦🇹" },
  { id: "AZ2", name: "AZERBAIJAN", flag: "🇦🇿" },
  { id: "BY", name: "BELARUS", flag: "🇧🇾" },
  { id: "BE", name: "BELGIUM", flag: "🇧🇪" },
  { id: "BG2", name: "BULGARIA", flag: "🇧🇬" },
  { id: "HR", name: "CROATIA", flag: "🇭🇷" },
  { id: "CY", name: "CYPRUS", flag: "🇨🇾" },
  { id: "DK2", name: "DENMARK", flag: "🇩🇰" },
  { id: "EE2", name: "ESTONIA", flag: "🇪🇪" },
  { id: "FI2", name: "FINLAND", flag: "🇫🇮" },
  { id: "FR2", name: "FRANCE", flag: "🇫🇷" },
  { id: "DE2", name: "GERMANY", flag: "🇩🇪" },
  { id: "GR2", name: "GREECE", flag: "🇬🇷" },
  { id: "HU2", name: "HUNGARY", flag: "🇭🇺" },
  { id: "IS2", name: "ICELAND", flag: "🇮🇸" },
  { id: "IL2", name: "ISRAEL", flag: "🇮🇱" },
  { id: "IT2", name: "ITALY", flag: "🇮🇹" },
  { id: "LV", name: "LATVIA", flag: "🇱🇻" },
  { id: "LT", name: "LITHUANIA", flag: "🇱🇹" },
  { id: "MT2", name: "MALTA", flag: "🇲🇹" },
  { id: "MD", name: "MOLDOVA", flag: "🇲🇩" },
  { id: "ME", name: "MONTENEGRO", flag: "🇲🇪" },
  { id: "NL2", name: "THE NETHERLANDS", flag: "🇳🇱" },
  { id: "NO2", name: "NORWAY", flag: "🇳🇴" },
  { id: "PL2", name: "POLAND", flag: "🇵🇱" },
  { id: "PT2", name: "PORTUGAL", flag: "🇵🇹" },
  { id: "RO", name: "ROMANIA", flag: "🇷🇴" },
  { id: "RU2", name: "RUSSIA", flag: "🇷🇺" },
  { id: "SM", name: "SAN MARINO", flag: "🇸🇲" },
  { id: "RS", name: "SERBIA", flag: "🇷🇸" },
  { id: "SI2", name: "SLOVENIA", flag: "🇸🇮" },
  { id: "ES2", name: "SPAIN", flag: "🇪🇸" },
  { id: "SE2", name: "SWEDEN", flag: "🇸🇪" },
  { id: "CH2", name: "SWITZERLAND", flag: "🇨🇭" },
  { id: "UA2", name: "UKRAINE", flag: "🇺🇦" },
];

type CountryScore = {
  id: string;
  name: string;
  flag: string;
  score: number;
  rank: number;
  flash: boolean;
  lastPts: number | null;
};

type FlyBall = {
  id: number;
  pts: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export default function Index() {
  const [scores, setScores] = useState<CountryScore[]>(
    CONTESTANTS.map((c, i) => ({ ...c, score: 0, rank: i + 1, flash: false, lastPts: null }))
  );
  const [voterIdx, setVoterIdx] = useState(0);
  const [givenPts, setGivenPts] = useState<Record<string, number[]>>({});
  const [flyBalls, setFlyBalls] = useState<FlyBall[]>([]);
  const [ballId, setBallId] = useState(0);
  const [douze, setDouze] = useState(false);
  const [activePtIdx, setActivePtIdx] = useState(9); // starts at 12 (index 9), goes down

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const tableRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const voter = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const usedPts = givenPts[voter.id] || [];
  const remainingPts = POINTS_ORDER.filter(p => !usedPts.includes(p));
  const nextPt = remainingPts.length > 0 ? remainingPts[remainingPts.length - 1] : null;
  const nextPtIdx = nextPt !== null ? POINTS_ORDER.indexOf(nextPt) : -1;

  const playSound = useCallback((pts: number) => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const play = (f: number, t: number, d: number, v = 0.3) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = "sine";
        g.gain.setValueAtTime(v, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
        o.start(ctx.currentTime + t);
        o.stop(ctx.currentTime + t + d + 0.05);
      };
      if (pts === 12) {
        play(523, 0, 0.1, 0.4); play(659, 0.1, 0.1, 0.4);
        play(784, 0.2, 0.12, 0.45); play(1047, 0.32, 0.5, 0.5);
        play(1319, 0.5, 0.6, 0.45);
      } else if (pts === 10) {
        play(523, 0, 0.1, 0.35); play(659, 0.1, 0.12, 0.4);
        play(784, 0.22, 0.4, 0.4);
      } else if (pts >= 7) {
        play(440, 0, 0.08, 0.3); play(659, 0.08, 0.3, 0.35);
      } else {
        play(440, 0, 0.06, 0.25); play(523, 0.06, 0.18, 0.28);
      }
    } catch (_e) { /* no audio */ }
  }, []);

  const handleRowClick = useCallback((targetId: string) => {
    if (!nextPt) return;
    if (targetId === voter.id.replace(/\d+$/, "")) return;

    const targetRow = rowRefs.current[targetId];
    const tableEl = tableRef.current;
    if (!targetRow || !tableEl) return;

    const tRect = targetRow.getBoundingClientRect();
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight - 120;

    const newBall: FlyBall = {
      id: ballId,
      pts: nextPt,
      x1: startX, y1: startY,
      x2: tRect.left + tRect.width - 60,
      y2: tRect.top + tRect.height / 2,
    };

    setBallId(b => b + 1);
    setFlyBalls(prev => [...prev, newBall]);
    if (nextPt === 12) setDouze(true);
    playSound(nextPt);

    const newUsed = [...usedPts, nextPt];
    setGivenPts(prev => ({ ...prev, [voter.id]: newUsed }));

    // Update active point index (going from 12 down to 1)
    const newRemaining = POINTS_ORDER.filter(p => !newUsed.includes(p));
    if (newRemaining.length > 0) {
      setActivePtIdx(POINTS_ORDER.indexOf(newRemaining[newRemaining.length - 1]));
    }

    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== newBall.id));

      setScores(prev => {
        const updated = prev.map(s =>
          s.id === targetId ? { ...s, score: s.score + nextPt, flash: true, lastPts: nextPt } : s
        );
        const sorted = [...updated].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
        return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
      });

      setTimeout(() => {
        setScores(prev => prev.map(s => s.id === targetId ? { ...s, flash: false, lastPts: null } : s));
        if (nextPt === 12) setDouze(false);
      }, 1400);

      if (newUsed.length >= POINTS_ORDER.length) {
        setTimeout(() => {
          setVoterIdx(v => v + 1);
          setActivePtIdx(9);
        }, 1800);
      }
    }, 800);
  }, [nextPt, voter.id, usedPts, ballId, playSound]);

  // Split scores into two columns
  const left = scores.slice(0, Math.ceil(scores.length / 2));
  const right = scores.slice(Math.ceil(scores.length / 2));

  const topRankBadge = (rank: number) => {
    if (rank > 7) return null;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "28px", height: "24px",
        background: "linear-gradient(135deg, #1a4a8a 0%, #0d2d5e 100%)",
        border: "1px solid rgba(100,180,255,0.5)",
        borderRadius: "5px",
        fontSize: "13px", fontWeight: 700,
        color: "#7ec8f0",
        flexShrink: 0,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
      }}>{rank}</span>
    );
  };

  const ScoreRow = ({ entry }: { entry: CountryScore }) => (
    <tr
      ref={el => { rowRefs.current[entry.id] = el; }}
      onClick={() => handleRowClick(entry.id)}
      style={{
        cursor: "pointer",
        background: entry.flash
          ? "linear-gradient(90deg, rgba(0,160,255,0.35) 0%, rgba(0,100,200,0.2) 100%)"
          : "transparent",
        transition: "background 0.3s ease",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Rank badge or spacer */}
      <td style={{ width: "36px", padding: "5px 3px 5px 6px", verticalAlign: "middle" }}>
        {topRankBadge(entry.rank)}
      </td>
      {/* Flag */}
      <td style={{ width: "36px", padding: "5px 4px", verticalAlign: "middle" }}>
        <span style={{ fontSize: "22px", lineHeight: 1, display: "block" }}>{entry.flag}</span>
      </td>
      {/* Name */}
      <td style={{
        padding: "5px 4px", verticalAlign: "middle",
        fontSize: "13px", fontWeight: 500,
        letterSpacing: "0.05em",
        color: entry.flash ? "#ffffff" : "rgba(200,230,255,0.9)",
        fontFamily: "'Montserrat', sans-serif",
        whiteSpace: "nowrap",
      }}>
        {entry.name}
      </td>
      {/* Score */}
      <td style={{
        width: "42px", padding: "5px 8px 5px 4px",
        textAlign: "right", verticalAlign: "middle",
        fontSize: "15px", fontWeight: 700,
        color: entry.flash ? "#FFD700" : "#7ec8f0",
        fontFamily: "'Montserrat', sans-serif",
        transition: "color 0.3s, transform 0.3s",
        transform: entry.flash ? "scale(1.15)" : "scale(1)",
      }}>
        {entry.score}
      </td>
    </tr>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #050d1f 0%, #081528 40%, #0a1a35 70%, #060e20 100%)",
      fontFamily: "'Montserrat', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ===== BACKGROUND ===== */}
      {/* Globe/map subtle texture */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: `radial-gradient(ellipse 120% 80% at 30% 60%, rgba(0,80,180,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 80% 60% at 70% 40%, rgba(60,0,120,0.1) 0%, transparent 50%)`,
        pointerEvents: "none",
      }} />

      {/* Bottom waves */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "220px", zIndex: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="wv1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1a0a4a" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#3a0a7a" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#1a0a4a" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="wv2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0a1a6a" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#1a3a9a" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0a1a6a" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="wv3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2a0a6a" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#6a10aa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2a0a6a" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {/* Pink/purple deep layer */}
          <path d="M0,160 C200,100 400,180 600,140 C800,100 1000,160 1200,130 C1320,115 1380,130 1440,120 L1440,220 L0,220 Z" fill="url(#wv3)" />
          {/* Blue mid layer */}
          <path d="M0,175 C240,130 480,185 720,160 C960,135 1200,175 1440,158 L1440,220 L0,220 Z" fill="url(#wv2)" />
          {/* Dark bottom */}
          <path d="M0,195 C360,175 720,200 1080,185 C1260,178 1350,190 1440,185 L1440,220 L0,220 Z" fill="url(#wv1)" />
        </svg>
      </div>

      {/* Glowing horizon line */}
      <div style={{
        position: "fixed", bottom: "200px", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent 0%, rgba(0,150,255,0.4) 20%, rgba(150,50,255,0.5) 50%, rgba(0,150,255,0.4) 80%, transparent 100%)",
        zIndex: 1, filter: "blur(1px)", pointerEvents: "none",
      }} />

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ position: "relative", zIndex: 10, flex: 1, padding: "12px 16px 150px", maxWidth: "820px", margin: "0 auto", width: "100%" }}>

        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: "12px",
          fontSize: "11px", letterSpacing: "0.25em",
          color: "rgba(140,200,255,0.6)", fontWeight: 600,
          textTransform: "uppercase",
        }}>
          Eurovision Song Contest 2014 — Grand Final
        </div>

        {/* ===== SCOREBOARD TABLE ===== */}
        <div style={{
          background: "linear-gradient(180deg, rgba(5,20,55,0.92) 0%, rgba(8,25,65,0.88) 100%)",
          borderRadius: "6px",
          border: "1px solid rgba(30,80,160,0.4)",
          overflow: "hidden",
          boxShadow: "0 4px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(80,160,255,0.1)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>

            {/* LEFT COLUMN */}
            <div style={{ borderRight: "1px solid rgba(30,80,160,0.3)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {left.map(entry => <ScoreRow key={entry.id} entry={entry} />)}
                </tbody>
              </table>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {right.map(entry => <ScoreRow key={entry.id} entry={entry} />)}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

      {/* ===== BOTTOM PANEL ===== */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 20,
      }}>
        {/* Voter info bar */}
        <div style={{
          background: "linear-gradient(90deg, rgba(5,15,45,0.97) 0%, rgba(10,25,65,0.95) 50%, rgba(5,15,45,0.97) 100%)",
          borderTop: "1px solid rgba(30,80,180,0.4)",
          padding: "8px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "14px", letterSpacing: "0.15em", fontWeight: 700, color: "#b0d8ff" }}>
              {voter.name}
            </span>
            <span style={{ fontSize: "20px" }}>{voter.flag}</span>
          </div>
          <div style={{ fontSize: "11px", letterSpacing: "0.12em", color: "rgba(140,200,255,0.55)" }}>
            {voterIdx + 1} OF {VOTING_COUNTRIES.length} COUNTRIES VOTING
          </div>
          {/* Progress bar */}
          <div style={{ width: "120px", height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${((voterIdx) / VOTING_COUNTRIES.length) * 100}%`,
              background: "linear-gradient(90deg, #0080ff, #a040ff)",
              borderRadius: "2px",
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>

        {/* Points bubbles row */}
        <div style={{
          background: "linear-gradient(180deg, rgba(5,12,38,0.98) 0%, rgba(8,18,50,0.99) 100%)",
          borderTop: "1px solid rgba(20,60,140,0.5)",
          padding: "10px 20px 14px",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
        }}>
          {POINTS_ORDER.map((pts, idx) => {
            const used = usedPts.includes(pts);
            const isNext = pts === nextPt;
            const is10or12 = pts === 10 || pts === 12;

            return (
              <div key={pts} style={{
                width: is10or12 ? "58px" : "50px",
                height: is10or12 ? "52px" : "46px",
                borderRadius: "8px",
                position: "relative",
                background: used
                  ? "rgba(255,255,255,0.04)"
                  : isNext
                    ? is10or12
                      ? "linear-gradient(135deg, #1060c0 0%, #0840a0 40%, #062880 100%)"
                      : "linear-gradient(135deg, #1a5abf 0%, #0d3a8a 50%, #0a2560 100%)"
                    : "linear-gradient(135deg, rgba(20,60,130,0.7) 0%, rgba(10,35,85,0.8) 100%)",
                border: isNext
                  ? `1px solid rgba(80,160,255,${is10or12 ? "0.8" : "0.6"})`
                  : used
                    ? "1px solid rgba(255,255,255,0.05)"
                    : "1px solid rgba(40,100,200,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: is10or12 ? "20px" : "17px",
                fontWeight: 800,
                color: used ? "rgba(255,255,255,0.15)" : isNext ? "#ffffff" : "rgba(160,210,255,0.7)",
                boxShadow: isNext
                  ? is10or12
                    ? "0 0 18px rgba(0,120,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(0,0,0,0.5)"
                    : "0 0 12px rgba(0,100,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 2px 6px rgba(0,0,0,0.4)",
                cursor: isNext ? "default" : "default",
                transition: "all 0.3s ease",
                transform: isNext ? "scale(1.08)" : "scale(1)",
                // 3D crystal effect for active
                backgroundImage: isNext && is10or12
                  ? "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(255,255,255,0.05) 100%), linear-gradient(135deg, #1060c0 0%, #0840a0 40%, #062880 100%)"
                  : undefined,
              }}>
                {!used && <span style={{ position: "relative", zIndex: 1 }}>{pts}</span>}
                {used && <span style={{ fontSize: "10px", opacity: 0.2 }}>{pts}</span>}
                {/* Crystal shine overlay */}
                {isNext && (
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: "50%", bottom: "50%",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                    borderRadius: "6px 6px 0 0",
                    pointerEvents: "none",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FLYING BALLS ===== */}
      {flyBalls.map(ball => (
        <div key={ball.id} style={{
          position: "fixed",
          left: ball.x1,
          top: ball.y1,
          zIndex: 100,
          pointerEvents: "none",
          "--dx": `${ball.x2 - ball.x1}px`,
          "--dy": `${ball.y2 - ball.y1}px`,
          animation: "esc-fly 0.8s cubic-bezier(0.3,0,0.7,1) forwards",
        } as React.CSSProperties & Record<string, string>}>
          <div style={{
            width: ball.pts === 12 ? "50px" : ball.pts === 10 ? "44px" : "36px",
            height: ball.pts === 12 ? "50px" : ball.pts === 10 ? "44px" : "36px",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            background: ball.pts === 12
              ? "radial-gradient(circle at 35% 35%, #fff8c0 0%, #FFD700 40%, #FF8800 100%)"
              : ball.pts === 10
                ? "radial-gradient(circle at 35% 35%, #ffffaa 0%, #FFD000 50%, #FF9900 100%)"
                : "radial-gradient(circle at 35% 35%, #d0eeff 0%, #4da8ff 50%, #0055cc 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900,
            fontSize: ball.pts >= 10 ? "20px" : "16px",
            color: "#fff",
            boxShadow: ball.pts === 12
              ? "0 0 25px rgba(255,200,0,1), 0 0 50px rgba(255,120,0,0.6)"
              : ball.pts === 10
                ? "0 0 18px rgba(255,200,0,0.9)"
                : "0 0 14px rgba(0,120,255,0.8)",
            textShadow: "0 1px 3px rgba(0,0,0,0.6)",
          }}>{ball.pts}</div>
        </div>
      ))}

      {/* ===== DOUZE POINTS ===== */}
      {douze && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(255,180,0,0.12) 0%, transparent 60%)",
        }}>
          <div style={{ animation: "esc-douze 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards", textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(52px, 11vw, 100px)",
              fontWeight: 900,
              letterSpacing: "0.03em",
              fontFamily: "'Montserrat', sans-serif",
              background: "linear-gradient(180deg, #fff8c0 0%, #FFD700 40%, #FF9900 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(255,200,0,0.9))",
              lineHeight: 1,
            }}>DOUZE POINTS!</div>
            <div style={{ fontSize: "16px", color: "rgba(255,220,80,0.7)", letterSpacing: "0.4em", marginTop: "8px", fontWeight: 600 }}>
              ✦ ✦ ✦
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes esc-fly {
          0%   { transform: translate(0,0); opacity: 1; }
          80%  { opacity: 1; transform: translate(calc(var(--dx)*0.85), calc(var(--dy)*0.85)); }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes esc-douze {
          0%   { transform: scale(0.4) rotate(-3deg); opacity: 0; }
          70%  { transform: scale(1.08) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        tr:hover td { background: rgba(0,80,180,0.15) !important; }
      `}</style>
    </div>
  );
}
