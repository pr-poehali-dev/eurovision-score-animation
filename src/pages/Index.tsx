import { useState, useRef, useCallback, useLayoutEffect } from "react";

// Порядок присвоения баллов: от 12 вниз до 1 (пропуская 9 и 11)
const POINTS_ORDER = [12, 10, 8, 7, 6, 5, 4, 3, 2, 1];

const flag = (cc: string) => `https://flagcdn.com/w40/${cc}.png`;

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
  rank: number;
  // which voter index last awarded points (flash until voter changes)
  flashedByVoter: number | null;
  lastPts: number | null;
};

type FlyBall = {
  id: number;
  pts: number;
  x1: number; y1: number;
  x2: number; y2: number;
};

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>(
    CONTESTANTS.map((c, i) => ({
      ...c, score: 0, rank: i + 1,
      flashedByVoter: null, lastPts: null,
    }))
  );
  // voterIdx indexes into VOTING_COUNTRIES
  const [voterIdx, setVoterIdx] = useState(0);
  // givenTo[voterIdx] = Set of contestant IDs already voted for
  const [givenTo, setGivenTo] = useState<Record<number, Set<string>>>({});
  // awardedPts[voterIdx] = number of points awarded so far (index into POINTS_ORDER)
  const [awardedCount, setAwardedCount] = useState<Record<number, number>>({});

  const [flyBalls, setFlyBalls] = useState<FlyBall[]>([]);
  const [ballId, setBallId] = useState(0);
  const [douze, setDouze] = useState(false);
  const [blocked, setBlocked] = useState(false); // prevent double-click during animation

  // For FLIP animation
  const prevPositions = useRef<Record<string, DOMRect>>({});
  const rowEls = useRef<Record<string, HTMLDivElement | null>>({});
  const flagEls = useRef<Record<string, HTMLDivElement | null>>({});
  const audioRef = useRef<AudioContext | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const voter = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const count = awardedCount[voterIdx] ?? 0;
  const nextPt = count < POINTS_ORDER.length ? POINTS_ORDER[count] : null;
  const voterGivenTo = givenTo[voterIdx] ?? new Set<string>();

  // ── Sound ──
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

  // ── FLIP: save positions before re-render, animate after ──
  const savePositions = useCallback(() => {
    prevPositions.current = {};
    Object.entries(rowEls.current).forEach(([id, el]) => {
      if (el) prevPositions.current[id] = el.getBoundingClientRect();
    });
  }, []);

  const animateFlip = useCallback(() => {
    Object.entries(rowEls.current).forEach(([id, el]) => {
      if (!el) return;
      const prev = prevPositions.current[id];
      if (!prev) return;
      const curr = el.getBoundingClientRect();
      const dy = prev.top - curr.top;
      if (Math.abs(dy) < 1) return;
      el.style.transform = `translateY(${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => {
        el.style.transform = "translateY(0)";
        el.style.transition = "transform 0.55s cubic-bezier(0.22,0.61,0.36,1)";
      });
    });
  }, []);

  // ── Click handler ──
  const handleClick = useCallback((targetId: string) => {
    if (blocked) return;
    if (!nextPt) return;
    // Can't vote for self
    if (targetId === voter.id) return;
    // Can't vote twice for same country this round
    if (voterGivenTo.has(targetId)) return;

    const flagEl = flagEls.current[targetId];
    if (!flagEl) return;

    const fRect = flagEl.getBoundingClientRect();
    const panelRect = panelRef.current?.getBoundingClientRect();
    const startX = (panelRect ? panelRect.left + panelRect.width / 2 : window.innerWidth / 2);
    const startY = (panelRect ? panelRect.top + panelRect.height / 2 : window.innerHeight - 80);

    const newBall: FlyBall = {
      id: ballId, pts: nextPt,
      x1: startX, y1: startY,
      x2: fRect.left + fRect.width / 2,
      y2: fRect.top + fRect.height / 2,
    };

    setBlocked(true);
    setBallId(b => b + 1);
    setFlyBalls(prev => [...prev, newBall]);
    if (nextPt === 12) setDouze(true);
    playSound(nextPt);

    // Update state immediately (before ball lands — optimistic)
    const pts = nextPt;
    const newCount = count + 1;
    setAwardedCount(prev => ({ ...prev, [voterIdx]: newCount }));
    setGivenTo(prev => {
      const s = new Set(prev[voterIdx] ?? new Set<string>());
      s.add(targetId);
      return { ...prev, [voterIdx]: s };
    });

    // Ball lands → update scores + FLIP animation
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== newBall.id));

      savePositions();

      setEntries(prev => {
        const updated = prev.map(e =>
          e.id === targetId
            ? { ...e, score: e.score + pts, flashedByVoter: voterIdx, lastPts: pts }
            : e
        );
        const sorted = [...updated].sort((a, b) =>
          b.score - a.score || a.name.localeCompare(b.name)
        );
        return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
      });

      // FLIP after DOM update
      requestAnimationFrame(() => {
        requestAnimationFrame(animateFlip);
      });

      if (pts === 12) setTimeout(() => setDouze(false), 2000);

      // All 10 points awarded → advance to next voter
      if (newCount >= POINTS_ORDER.length) {
        setTimeout(() => {
          // Clear flash for all entries that were flashed by this voter
          setEntries(prev => prev.map(e =>
            e.flashedByVoter === voterIdx ? { ...e, flashedByVoter: null, lastPts: null } : e
          ));
          setVoterIdx(v => v + 1);
        }, 1800);
      }

      setBlocked(false);
    }, 700);
  }, [blocked, nextPt, voter.id, voterGivenTo, ballId, count, voterIdx, playSound, savePositions, animateFlip]);

  // When voter changes → clear flash for previous voter immediately
  useLayoutEffect(() => {
    // nothing extra needed — flash cleared in timeout above
  }, [voterIdx]);

  const left  = entries.slice(0, Math.ceil(entries.length / 2));
  const right = entries.slice(Math.ceil(entries.length / 2));

  const RankBadge = ({ rank }: { rank: number }) =>
    rank <= 7 ? (
      <div style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: "30px", height: "26px",
        background: "linear-gradient(180deg, #1e5299 0%, #0d2d63 100%)",
        border: "1px solid rgba(90,160,255,0.6)",
        borderRadius: "4px",
        fontSize: "14px", fontWeight: 700,
        color: "#8fd4ff",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 4px rgba(0,0,0,0.5)",
        flexShrink: 0,
      }}>{rank}</div>
    ) : <div style={{ width: "30px", flexShrink: 0 }} />;

  // A row in one column
  const ScoreRow = ({ entry }: { entry: Entry }) => {
    const isFlash = entry.flashedByVoter !== null;
    const isVoter = entry.id === voter.id;
    const alreadyVoted = voterGivenTo.has(entry.id);
    const unclickable = isVoter || alreadyVoted || !nextPt;

    return (
      <div
        ref={el => { rowEls.current[entry.id] = el; }}
        onClick={() => !unclickable && handleClick(entry.id)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          padding: "0 8px",
          height: "46px",
          background: isFlash
            ? "linear-gradient(90deg, rgba(20,110,255,0.55) 0%, rgba(8,55,180,0.38) 55%, rgba(3,20,80,0.18) 100%)"
            : "transparent",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          cursor: unclickable ? "default" : "pointer",
          opacity: isVoter ? 0.55 : 1,
          transition: "background 0.3s ease, opacity 0.3s",
          position: "relative",
          userSelect: "none",
        }}
      >
        {/* Rank badge */}
        <div style={{ width: "36px", flexShrink: 0 }}>
          <RankBadge rank={entry.rank} />
        </div>

        {/* Flag — target for ball */}
        <div
          ref={el => { flagEls.current[entry.id] = el; }}
          style={{ width: "50px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
        >
          <img
            src={flag(entry.cc)}
            alt={entry.name}
            style={{
              width: "40px", height: "27px",
              objectFit: "cover",
              borderRadius: "2px",
              display: "block",
              boxShadow: "0 1px 5px rgba(0,0,0,0.55)",
            }}
          />
        </div>

        {/* Country name */}
        <div style={{
          flex: 1,
          fontSize: "15px",
          fontWeight: 500,
          letterSpacing: "0.07em",
          color: isFlash ? "#ffffff" : "rgba(185,220,255,0.92)",
          fontFamily: "'Montserrat', sans-serif",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          transition: "color 0.25s",
        }}>
          {entry.name}
        </div>

        {/* Score */}
        <div style={{
          width: "52px",
          textAlign: "right",
          flexShrink: 0,
          fontSize: isFlash ? "20px" : "17px",
          fontWeight: 700,
          color: isFlash ? "#FFD700" : "#72c4f0",
          fontFamily: "'Montserrat', sans-serif",
          transition: "font-size 0.2s, color 0.2s",
        }}>
          {entry.score}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #04091a 0%, #06102a 35%, #07152e 65%, #04091a 100%)",
      fontFamily: "'Montserrat', sans-serif",
      color: "#fff",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>

      {/* BG glow */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 160% 55% at 50% 115%, rgba(0,35,130,0.6) 0%, transparent 55%),
          radial-gradient(ellipse 70% 35% at 15% 75%, rgba(80,0,150,0.2) 0%, transparent 50%)
        `,
      }} />

      {/* Bottom waves */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "200px", zIndex: 0, pointerEvents: "none" }}>
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#40009a" stopOpacity="0.75"/>
              <stop offset="50%" stopColor="#6000bb" stopOpacity="0.65"/>
              <stop offset="100%" stopColor="#40009a" stopOpacity="0.75"/>
            </linearGradient>
            <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0028a0" stopOpacity="0.75"/>
              <stop offset="50%" stopColor="#0045cc" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#0028a0" stopOpacity="0.75"/>
            </linearGradient>
            <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#bb0088" stopOpacity="0.38"/>
              <stop offset="50%" stopColor="#dd00aa" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#bb0088" stopOpacity="0.38"/>
            </linearGradient>
          </defs>
          <path d="M0,130 C280,70 580,155 880,105 C1080,75 1300,118 1440,95 L1440,200 L0,200Z" fill="url(#wg3)"/>
          <path d="M0,150 C230,105 470,158 720,135 C970,112 1210,152 1440,135 L1440,200 L0,200Z" fill="url(#wg2)"/>
          <path d="M0,168 C350,148 710,172 1080,158 C1270,152 1370,164 1440,158 L1440,200 L0,200Z" fill="url(#wg1)"/>
        </svg>
      </div>

      {/* ── MAIN ── */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "960px",
        padding: "12px 16px 24px",
        flex: 1,
        display: "flex", flexDirection: "column",
      }}>

        {/* Title */}
        <div style={{
          textAlign: "center", marginBottom: "10px",
          fontSize: "11px", letterSpacing: "0.24em",
          color: "rgba(110,185,255,0.5)", fontWeight: 600, textTransform: "uppercase",
        }}>
          Eurovision Song Contest 2014 · Grand Final
        </div>

        {/* Scoreboard */}
        <div style={{
          background: "linear-gradient(180deg, rgba(3,12,40,0.97) 0%, rgba(5,16,50,0.95) 100%)",
          borderRadius: "6px 6px 0 0",
          border: "1px solid rgba(18,60,145,0.5)",
          borderBottom: "none",
          overflow: "hidden",
          boxShadow: "0 6px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(55,125,255,0.12)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(18,60,145,0.35)" }}>
              {left.map(e => <ScoreRow key={e.id} entry={e} />)}
            </div>
            <div>
              {right.map(e => <ScoreRow key={e.id} entry={e} />)}
            </div>
          </div>
        </div>

        {/* ── BOTTOM PANEL — directly attached ── */}
        <div ref={panelRef} style={{
          background: "linear-gradient(180deg, rgba(3,9,30,0.99) 0%, rgba(2,7,22,1) 100%)",
          borderRadius: "0 0 6px 6px",
          border: "1px solid rgba(18,60,145,0.5)",
          borderTop: "1px solid rgba(18,60,145,0.3)",
          padding: "8px 12px 10px",
        }}>

          {/* Voter row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
            paddingBottom: "7px",
            borderBottom: "1px solid rgba(25,70,160,0.25)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <img
                src={flag(voter.cc)} alt={voter.name}
                style={{ width: "36px", height: "24px", objectFit: "cover", borderRadius: "2px", boxShadow: "0 1px 5px rgba(0,0,0,0.55)" }}
              />
              <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "0.12em", color: "#a8d8ff" }}>
                {voter.name}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "0.1em", color: "rgba(110,175,255,0.5)" }}>
                {voterIdx + 1} OF {VOTING_COUNTRIES.length} COUNTRIES VOTING
              </span>
              <div style={{ width: "100px", height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(voterIdx / VOTING_COUNTRIES.length) * 100}%`,
                  background: "linear-gradient(90deg, #0070ff, #8820ff)",
                  borderRadius: "2px", transition: "width 0.5s ease",
                }}/>
              </div>
            </div>
          </div>

          {/* Points row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}>
            {POINTS_ORDER.map((pts, idx) => {
              const used   = awardedCount[voterIdx] !== undefined && idx < (awardedCount[voterIdx] ?? 0);
              const isNext = pts === nextPt;
              const isBig  = pts === 12 || pts === 10;

              return (
                <div key={pts} style={{
                  position: "relative",
                  width:  isBig ? "60px" : "50px",
                  height: isBig ? "54px" : "46px",
                  borderRadius: "7px",
                  background: used
                    ? "rgba(255,255,255,0.03)"
                    : isNext
                      ? "linear-gradient(160deg, #2370e0 0%, #0e3ea8 45%, #0a2c85 100%)"
                      : "linear-gradient(160deg, rgba(16,48,118,0.8) 0%, rgba(7,26,72,0.88) 100%)",
                  border: isNext
                    ? "1.5px solid rgba(100,180,255,0.8)"
                    : used
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(30,85,190,0.38)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isBig ? "20px" : "16px",
                  fontWeight: 800,
                  color: used ? "rgba(255,255,255,0.1)" : isNext ? "#ffffff" : "rgba(130,195,255,0.65)",
                  boxShadow: isNext
                    ? "0 0 16px rgba(0,110,255,0.65), 0 0 32px rgba(0,60,200,0.35), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(0,0,0,0.3)"
                    : "0 2px 6px rgba(0,0,0,0.5)",
                  transform: isNext ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.25s ease",
                  overflow: "hidden",
                  cursor: "default",
                }}>
                  {/* Crystal shine */}
                  {isNext && (
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: "45%", height: "44%",
                      background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 100%)",
                      borderRadius: "6px 0 0 0", pointerEvents: "none",
                    }}/>
                  )}
                  <span style={{ position: "relative", zIndex: 1, textDecoration: used ? "line-through" : "none", opacity: used ? 0.15 : 1 }}>
                    {pts}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
        {/* end bottom panel */}

      </div>

      {/* ── FLYING BALLS ── */}
      {flyBalls.map(ball => {
        const sz = ball.pts === 12 ? 52 : ball.pts === 10 ? 44 : 36;
        return (
          <div key={ball.id} style={{
            position: "fixed",
            left: ball.x1, top: ball.y1,
            width: 0, height: 0,
            zIndex: 500, pointerEvents: "none",
            "--dx": `${ball.x2 - ball.x1}px`,
            "--dy": `${ball.y2 - ball.y1}px`,
            animation: "escFly 0.7s cubic-bezier(0.4,0,0.55,1) forwards",
          } as React.CSSProperties & Record<string, string>}>
            <div style={{
              width: sz, height: sz, borderRadius: "50%",
              transform: "translate(-50%, -50%)",
              background: ball.pts === 12
                ? "radial-gradient(circle at 36% 30%, #fff7b0 0%, #FFD700 32%, #FF8800 75%, #cc4400 100%)"
                : ball.pts === 10
                  ? "radial-gradient(circle at 36% 30%, #ffffa0 0%, #FFCC00 38%, #FF9900 100%)"
                  : "radial-gradient(circle at 36% 30%, #cceeff 0%, #38aaff 38%, #0044cc 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: ball.pts >= 10 ? "20px" : "15px",
              color: "#fff",
              boxShadow: ball.pts === 12
                ? "0 0 24px rgba(255,180,0,1), 0 0 48px rgba(255,80,0,0.8)"
                : ball.pts === 10
                  ? "0 0 18px rgba(255,200,0,1), 0 0 36px rgba(255,140,0,0.6)"
                  : "0 0 14px rgba(30,140,255,1), 0 0 28px rgba(0,80,220,0.6)",
              textShadow: "0 1px 4px rgba(0,0,0,0.7)",
            }}>
              {ball.pts}
            </div>
          </div>
        );
      })}

      {/* ── DOUZE POINTS ── */}
      {douze && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(255,150,0,0.1) 0%, transparent 60%)",
        }}>
          <div style={{ animation: "escDouze 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards", textAlign: "center" }}>
            <div style={{
              fontSize: "clamp(50px,10vw,95px)",
              fontWeight: 900,
              letterSpacing: "0.04em",
              fontFamily: "'Montserrat', sans-serif",
              background: "linear-gradient(180deg, #fffbc0 0%, #FFD700 42%, #FF9300 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 30px rgba(255,185,0,0.95))",
              lineHeight: 1,
            }}>DOUZE POINTS!</div>
            <div style={{ fontSize: "16px", letterSpacing: "0.45em", color: "rgba(255,210,70,0.6)", marginTop: "12px" }}>
              ✦ ✦ ✦
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes escFly {
          0%   { transform: translate(0,0); opacity: 1; }
          75%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
        @keyframes escDouze {
          0%   { transform: scale(0.3) rotate(-3deg); opacity: 0; }
          65%  { transform: scale(1.08) rotate(1deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        div[style*="cursor: pointer"]:hover {
          filter: brightness(1.12);
        }
      `}</style>
    </div>
  );
}
