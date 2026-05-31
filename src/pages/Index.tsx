import { useState, useRef, useCallback } from "react";

const POINTS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

// flagcdn.com country codes (ISO 3166-1 alpha-2, lowercase)
const flag = (code: string) =>
  `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

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

type CountryScore = {
  id: string;
  name: string;
  cc: string;
  score: number;
  rank: number;
  flash: boolean;
  lastPts: number | null;
};

type FlyBall = {
  id: number;
  pts: number;
  x1: number; y1: number;
  x2: number; y2: number;
};

// Key: voter index (unique per round), value: array of awarded points
const KEY = (voterIdx: number) => `v${voterIdx}`;

export default function Index() {
  const [scores, setScores] = useState<CountryScore[]>(
    CONTESTANTS.map((c, i) => ({ ...c, score: 0, rank: i + 1, flash: false, lastPts: null }))
  );
  const [voterIdx, setVoterIdx] = useState(0);
  const [givenPts, setGivenPts] = useState<Record<string, number[]>>({});
  const [flyBalls, setFlyBalls] = useState<FlyBall[]>([]);
  const [ballId, setBallId] = useState(0);
  const [douze, setDouze] = useState(false);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const flagCellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const audioRef = useRef<AudioContext | null>(null);

  const voter = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const vKey = KEY(voterIdx);
  const usedPts = givenPts[vKey] || [];
  const remainingPts = POINTS_ORDER.filter(p => !usedPts.includes(p));
  const nextPt = remainingPts.length > 0 ? remainingPts[remainingPts.length - 1] : null;

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
        play(523, 0, 0.1, 0.4); play(659, 0.1, 0.1, 0.45);
        play(784, 0.22, 0.12, 0.5); play(1047, 0.36, 0.5, 0.55);
        play(1319, 0.55, 0.65, 0.5);
      } else if (pts === 10) {
        play(523, 0, 0.1, 0.35); play(659, 0.12, 0.12, 0.4);
        play(784, 0.26, 0.4, 0.42);
      } else if (pts >= 7) {
        play(440, 0, 0.08, 0.3); play(659, 0.1, 0.3, 0.35);
      } else {
        play(440, 0, 0.06, 0.25); play(523, 0.07, 0.2, 0.28);
      }
    } catch (_e) { /* no audio */ }
  }, []);

  const handleRowClick = useCallback((targetId: string) => {
    if (!nextPt) return;
    // Can't vote for yourself
    if (targetId === voter.id) return;

    const targetRow = rowRefs.current[targetId];
    const flagCell = flagCellRefs.current[targetId];
    if (!targetRow || !flagCell) return;

    const fRect = flagCell.getBoundingClientRect();
    // Ball starts from active points button area (bottom center)
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight - 90;
    // Ball lands ON TOP of the flag cell
    const endX = fRect.left + fRect.width / 2;
    const endY = fRect.top + fRect.height / 2;

    const newBall: FlyBall = {
      id: ballId, pts: nextPt,
      x1: startX, y1: startY,
      x2: endX, y2: endY,
    };

    setBallId(b => b + 1);
    setFlyBalls(prev => [...prev, newBall]);
    if (nextPt === 12) setDouze(true);
    playSound(nextPt);

    const newUsed = [...usedPts, nextPt];
    setGivenPts(prev => ({ ...prev, [vKey]: newUsed }));

    // After ball arrives → flash row, update scores
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== newBall.id));

      setScores(prev => {
        const updated = prev.map(s =>
          s.id === targetId
            ? { ...s, score: s.score + nextPt, flash: true, lastPts: nextPt }
            : s
        );
        const sorted = [...updated].sort((a, b) =>
          b.score - a.score || a.name.localeCompare(b.name)
        );
        return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
      });

      // Remove flash after 1.4s
      setTimeout(() => {
        setScores(prev =>
          prev.map(s => s.id === targetId ? { ...s, flash: false, lastPts: null } : s)
        );
        if (nextPt === 12) setDouze(false);
      }, 1400);

      // All 10 points awarded → next voter
      if (newUsed.length >= POINTS_ORDER.length) {
        setTimeout(() => setVoterIdx(v => v + 1), 1800);
      }
    }, 750);
  }, [nextPt, voter.id, usedPts, ballId, vKey, playSound]);

  const left  = scores.slice(0, Math.ceil(scores.length / 2));
  const right = scores.slice(Math.ceil(scores.length / 2));

  const RankBadge = ({ rank }: { rank: number }) =>
    rank <= 7 ? (
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "26px", height: "22px",
        background: "linear-gradient(180deg, #1e5299 0%, #0d2d63 100%)",
        border: "1px solid rgba(90,160,255,0.55)",
        borderRadius: "4px",
        fontSize: "12px", fontWeight: 700,
        color: "#8fd4ff",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 4px rgba(0,0,0,0.5)",
        letterSpacing: 0,
      }}>{rank}</div>
    ) : <div style={{ width: "26px" }} />;

  const ScoreRow = ({ entry }: { entry: CountryScore }) => {
    const isFlash = entry.flash;
    return (
      <tr
        ref={el => { rowRefs.current[entry.id] = el; }}
        onClick={() => handleRowClick(entry.id)}
        style={{
          cursor: "pointer",
          background: isFlash
            ? "linear-gradient(90deg, rgba(30,120,255,0.55) 0%, rgba(10,60,180,0.35) 60%, rgba(5,30,100,0.2) 100%)"
            : "transparent",
          transition: "background 0.25s ease",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          userSelect: "none",
        }}
      >
        {/* Rank */}
        <td style={{ width: "34px", padding: "4px 2px 4px 8px", verticalAlign: "middle" }}>
          <RankBadge rank={entry.rank} />
        </td>

        {/* Flag — real image, with relative position so flying ball can overlap */}
        <td
          ref={el => { flagCellRefs.current[entry.id] = el; }}
          style={{ width: "44px", padding: "3px 4px", verticalAlign: "middle", position: "relative" }}
        >
          <img
            src={flag(entry.cc)}
            alt={entry.name}
            style={{
              width: "36px", height: "24px",
              objectFit: "cover",
              borderRadius: "2px",
              display: "block",
              boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
            }}
          />
        </td>

        {/* Name */}
        <td style={{
          padding: "4px 6px 4px 2px",
          verticalAlign: "middle",
          fontSize: "13.5px",
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: isFlash ? "#ffffff" : "rgba(190,225,255,0.92)",
          fontFamily: "'Montserrat', sans-serif",
          whiteSpace: "nowrap",
        }}>
          {entry.name}
        </td>

        {/* Score */}
        <td style={{
          width: "46px", padding: "4px 10px 4px 2px",
          textAlign: "right", verticalAlign: "middle",
          fontSize: isFlash ? "17px" : "15px",
          fontWeight: 700,
          color: isFlash ? "#FFD700" : "#72c4f0",
          fontFamily: "'Montserrat', sans-serif",
          transition: "font-size 0.2s, color 0.2s",
          whiteSpace: "nowrap",
        }}>
          {entry.score}
        </td>
      </tr>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04091a 0%, #06112a 35%, #081830 65%, #04091a 100%)",
      fontFamily: "'Montserrat', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>

      {/* ── BG: subtle globe glow ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 140% 60% at 50% 110%, rgba(0,40,140,0.55) 0%, transparent 55%),
          radial-gradient(ellipse 80% 40% at 20% 70%, rgba(80,0,160,0.18) 0%, transparent 50%)
        `,
      }} />

      {/* ── BG: bottom waves (purple/blue like original) ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "200px", zIndex: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#380080" stopOpacity="0.7"/>
              <stop offset="50%" stopColor="#5500aa" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#380080" stopOpacity="0.7"/>
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0030a0" stopOpacity="0.7"/>
              <stop offset="50%" stopColor="#0050cc" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#0030a0" stopOpacity="0.7"/>
            </linearGradient>
            <linearGradient id="g3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#c0008a" stopOpacity="0.35"/>
              <stop offset="50%" stopColor="#e000aa" stopOpacity="0.28"/>
              <stop offset="100%" stopColor="#c0008a" stopOpacity="0.35"/>
            </linearGradient>
          </defs>
          <path d="M0,140 C300,80 600,160 900,110 C1100,80 1300,120 1440,100 L1440,200 L0,200Z" fill="url(#g3)"/>
          <path d="M0,155 C240,110 480,165 720,140 C960,115 1200,158 1440,140 L1440,200 L0,200Z" fill="url(#g2)"/>
          <path d="M0,172 C360,150 720,178 1080,162 C1260,155 1360,168 1440,162 L1440,200 L0,200Z" fill="url(#g1)"/>
        </svg>
      </div>

      {/* ── MAIN: scoreboard ── */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "780px",
        padding: "10px 12px 0",
        flex: 1,
      }}>

        {/* Title */}
        <div style={{
          textAlign: "center", marginBottom: "8px",
          fontSize: "10px", letterSpacing: "0.22em",
          color: "rgba(120,190,255,0.5)", fontWeight: 600, textTransform: "uppercase",
        }}>
          Eurovision Song Contest 2014 · Grand Final
        </div>

        {/* Table box */}
        <div style={{
          background: "linear-gradient(180deg, rgba(4,14,42,0.96) 0%, rgba(6,18,52,0.94) 100%)",
          borderRadius: "5px",
          border: "1px solid rgba(20,65,150,0.45)",
          overflow: "hidden",
          boxShadow: "0 6px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(60,130,255,0.12)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(20,65,150,0.3)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>{left.map(e => <ScoreRow key={e.id} entry={e} />)}</tbody>
              </table>
            </div>
            <div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>{right.map(e => <ScoreRow key={e.id} entry={e} />)}</tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── BOTTOM PANEL (attached to table) ── */}
        <div style={{
          background: "linear-gradient(180deg, rgba(4,12,38,0.99) 0%, rgba(3,9,28,1) 100%)",
          borderRadius: "0 0 5px 5px",
          border: "1px solid rgba(20,65,150,0.45)",
          borderTop: "none",
          padding: "8px 10px 6px",
        }}>

          {/* Voter info */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "7px",
            paddingBottom: "6px",
            borderBottom: "1px solid rgba(30,80,160,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={flag(voter.cc)}
                alt={voter.name}
                style={{ width: "32px", height: "21px", objectFit: "cover", borderRadius: "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
              />
              <span style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.12em", color: "#a8d8ff" }}>
                {voter.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "rgba(120,180,255,0.5)" }}>
                {voterIdx + 1} OF {VOTING_COUNTRIES.length} COUNTRIES VOTING
              </span>
              <div style={{ width: "90px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
                <div style={{
                  height: "100%",
                  width: `${(voterIdx / VOTING_COUNTRIES.length) * 100}%`,
                  background: "linear-gradient(90deg, #0070ff, #9030ff)",
                  borderRadius: "2px", transition: "width 0.5s ease",
                }}/>
              </div>
            </div>
          </div>

          {/* Points bubbles */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            {POINTS_ORDER.map((pts) => {
              const used    = usedPts.includes(pts);
              const isNext  = pts === nextPt;
              const isBig   = pts === 10 || pts === 12;

              return (
                <div key={pts} style={{
                  position: "relative",
                  width:  isBig ? "56px" : "48px",
                  height: isBig ? "50px" : "43px",
                  borderRadius: "6px",
                  background: used
                    ? "rgba(255,255,255,0.03)"
                    : isNext
                      ? "linear-gradient(160deg, #2268d4 0%, #0e3d9e 45%, #092878 100%)"
                      : "linear-gradient(160deg, rgba(18,52,120,0.75) 0%, rgba(8,28,75,0.85) 100%)",
                  border: isNext
                    ? "1.5px solid rgba(100,175,255,0.75)"
                    : used
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(35,90,190,0.35)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isBig ? "19px" : "16px",
                  fontWeight: 800,
                  color: used ? "rgba(255,255,255,0.12)" : isNext ? "#ffffff" : "rgba(140,200,255,0.65)",
                  boxShadow: isNext
                    ? "0 0 14px rgba(0,100,255,0.6), 0 0 28px rgba(0,60,200,0.3), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.3)"
                    : "0 2px 6px rgba(0,0,0,0.45)",
                  transition: "all 0.25s ease",
                  transform: isNext ? "scale(1.1)" : "scale(1)",
                  cursor: "default",
                  overflow: "hidden",
                }}>
                  {/* Crystal shine top-left */}
                  {isNext && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: "45%", height: "45%",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 100%)",
                      borderRadius: "5px 0 0 0", pointerEvents: "none",
                    }}/>
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>{pts}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Spacer so content isn't hidden under fixed bar on mobile — not needed now since panel is inline */}
      <div style={{ height: "20px" }} />

      {/* ── FLYING BALLS ── */}
      {flyBalls.map(ball => {
        const size = ball.pts === 12 ? 48 : ball.pts === 10 ? 42 : 34;
        return (
          <div key={ball.id} style={{
            position: "fixed",
            left: ball.x1,
            top: ball.y1,
            width: 0, height: 0,
            zIndex: 500,
            pointerEvents: "none",
            "--dx": `${ball.x2 - ball.x1}px`,
            "--dy": `${ball.y2 - ball.y1}px`,
            animation: "esc-fly 0.75s cubic-bezier(0.4,0,0.6,1) forwards",
          } as React.CSSProperties & Record<string, string>}>
            <div style={{
              width: size, height: size,
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: ball.pts === 12
                ? "radial-gradient(circle at 38% 32%, #fff8c0 0%, #FFD700 35%, #FF8800 80%, #cc5500 100%)"
                : ball.pts === 10
                  ? "radial-gradient(circle at 38% 32%, #ffff99 0%, #FFD000 40%, #FF9900 100%)"
                  : "radial-gradient(circle at 38% 32%, #d0f0ff 0%, #40a8ff 40%, #0050cc 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: ball.pts >= 10 ? "19px" : "15px",
              color: "#fff",
              boxShadow: ball.pts === 12
                ? "0 0 22px rgba(255,180,0,1), 0 0 44px rgba(255,80,0,0.7)"
                : ball.pts === 10
                  ? "0 0 16px rgba(255,200,0,1), 0 0 32px rgba(255,140,0,0.5)"
                  : "0 0 14px rgba(0,140,255,0.9), 0 0 28px rgba(0,80,200,0.5)",
              textShadow: "0 1px 4px rgba(0,0,0,0.7)",
            }}>
              {ball.pts}
            </div>
          </div>
        );
      })}

      {/* ── DOUZE POINTS overlay ── */}
      {douze && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(255,160,0,0.1) 0%, transparent 60%)",
        }}>
          <div style={{ animation: "esc-douze 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards", textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(48px,10vw,92px)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              fontFamily: "'Montserrat', sans-serif",
              background: "linear-gradient(180deg, #fffbc0 0%, #FFD700 40%, #FF9500 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 28px rgba(255,190,0,0.9))",
              lineHeight: 1,
            }}>
              DOUZE POINTS!
            </div>
            <div style={{ fontSize: "15px", letterSpacing: "0.4em", color: "rgba(255,215,80,0.65)", marginTop: "10px" }}>
              ✦ ✦ ✦
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes esc-fly {
          0%   { transform: translate(0,0); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes esc-douze {
          0%   { transform: scale(0.35) rotate(-2deg); opacity: 0; }
          65%  { transform: scale(1.07) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        tr:hover > td {
          background: rgba(0,70,180,0.18) !important;
        }
      `}</style>
    </div>
  );
}
