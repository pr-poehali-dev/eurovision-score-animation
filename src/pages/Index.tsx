import { useState, useRef, useCallback } from "react";

const POINTS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

const COUNTRIES = [
  { id: "AT", name: "Austria", flag: "🇦🇹" },
  { id: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { id: "AM", name: "Armenia", flag: "🇦🇲" },
  { id: "DK", name: "Denmark", flag: "🇩🇰" },
  { id: "NL", name: "Netherlands", flag: "🇳🇱" },
  { id: "HU", name: "Hungary", flag: "🇭🇺" },
  { id: "FI", name: "Finland", flag: "🇫🇮" },
  { id: "IL", name: "Israel", flag: "🇮🇱" },
  { id: "IS", name: "Iceland", flag: "🇮🇸" },
  { id: "EE", name: "Estonia", flag: "🇪🇪" },
  { id: "NO", name: "Norway", flag: "🇳🇴" },
  { id: "RU", name: "Russia", flag: "🇷🇺" },
  { id: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { id: "CH", name: "Switzerland", flag: "🇨🇭" },
  { id: "GR", name: "Greece", flag: "🇬🇷" },
  { id: "PT", name: "Portugal", flag: "🇵🇹" },
  { id: "SE", name: "Sweden", flag: "🇸🇪" },
  { id: "ES", name: "Spain", flag: "🇪🇸" },
  { id: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { id: "FR", name: "France", flag: "🇫🇷" },
  { id: "DE", name: "Germany", flag: "🇩🇪" },
  { id: "IT", name: "Italy", flag: "🇮🇹" },
  { id: "UA", name: "Ukraine", flag: "🇺🇦" },
  { id: "MT", name: "Malta", flag: "🇲🇹" },
  { id: "PL", name: "Poland", flag: "🇵🇱" },
  { id: "SI", name: "Slovenia", flag: "🇸🇮" },
];

const VOTING_COUNTRIES = [
  { id: "AL", name: "Albania", flag: "🇦🇱" },
  { id: "AT", name: "Austria", flag: "🇦🇹" },
  { id: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { id: "AM", name: "Armenia", flag: "🇦🇲" },
  { id: "BE", name: "Belgium", flag: "🇧🇪" },
  { id: "BY", name: "Belarus", flag: "🇧🇾" },
  { id: "DK", name: "Denmark", flag: "🇩🇰" },
  { id: "NL", name: "Netherlands", flag: "🇳🇱" },
  { id: "HU", name: "Hungary", flag: "🇭🇺" },
  { id: "FI", name: "Finland", flag: "🇫🇮" },
  { id: "IL", name: "Israel", flag: "🇮🇱" },
  { id: "IS", name: "Iceland", flag: "🇮🇸" },
  { id: "EE", name: "Estonia", flag: "🇪🇪" },
  { id: "NO", name: "Norway", flag: "🇳🇴" },
  { id: "RU", name: "Russia", flag: "🇷🇺" },
  { id: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { id: "CH", name: "Switzerland", flag: "🇨🇭" },
  { id: "GR", name: "Greece", flag: "🇬🇷" },
  { id: "PT", name: "Portugal", flag: "🇵🇹" },
  { id: "SE", name: "Sweden", flag: "🇸🇪" },
  { id: "ES", name: "Spain", flag: "🇪🇸" },
  { id: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { id: "FR", name: "France", flag: "🇫🇷" },
  { id: "DE", name: "Germany", flag: "🇩🇪" },
  { id: "IT", name: "Italy", flag: "🇮🇹" },
  { id: "UA", name: "Ukraine", flag: "🇺🇦" },
  { id: "MT", name: "Malta", flag: "🇲🇹" },
  { id: "PL", name: "Poland", flag: "🇵🇱" },
  { id: "SI", name: "Slovenia", flag: "🇸🇮" },
  { id: "SM", name: "San Marino", flag: "🇸🇲" },
  { id: "MK", name: "North Macedonia", flag: "🇲🇰" },
  { id: "MD", name: "Moldova", flag: "🇲🇩" },
  { id: "ME", name: "Montenegro", flag: "🇲🇪" },
  { id: "RO", name: "Romania", flag: "🇷🇴" },
  { id: "RS", name: "Serbia", flag: "🇷🇸" },
  { id: "HR", name: "Croatia", flag: "🇭🇷" },
  { id: "CY", name: "Cyprus", flag: "🇨🇾" },
  { id: "LT", name: "Lithuania", flag: "🇱🇹" },
  { id: "LV", name: "Latvia", flag: "🇱🇻" },
  { id: "MO", name: "Montenegro", flag: "🇲🇴" },
];

type ScoreEntry = {
  countryId: string;
  score: number;
  rank: number;
  animating: boolean;
  pointsReceived: number | null;
};

type FlyingPoint = {
  id: number;
  points: number;
  targetId: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  active: boolean;
};

export default function Index() {
  const [scores, setScores] = useState<ScoreEntry[]>(
    COUNTRIES.map((c, i) => ({
      countryId: c.id,
      score: 0,
      rank: i + 1,
      animating: false,
      pointsReceived: null,
    }))
  );

  const [currentVotingCountryIndex, setCurrentVotingCountryIndex] = useState(0);
  const [votingStarted, setVotingStarted] = useState(false);
  const [flyingPoints, setFlyingPoints] = useState<FlyingPoint[]>([]);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);
  const [showDouze, setShowDouze] = useState(false);
  const [flyCounter, setFlyCounter] = useState(0);
  const [givenPoints, setGivenPoints] = useState<Record<string, number[]>>({});

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scoreDisplayRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = "sine", vol = 0.3) => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch (_e) { /* AudioContext unavailable */ }
  }, []);

  const playPointSound = useCallback((pts: number) => {
    if (pts === 12) {
      playTone(880, 0.15, "sine", 0.4);
      setTimeout(() => playTone(1100, 0.15, "sine", 0.4), 150);
      setTimeout(() => playTone(1320, 0.4, "sine", 0.5), 300);
      setTimeout(() => playTone(1760, 0.6, "sine", 0.45), 600);
    } else if (pts === 10) {
      playTone(660, 0.12, "sine", 0.35);
      setTimeout(() => playTone(880, 0.12, "sine", 0.35), 120);
      setTimeout(() => playTone(1100, 0.35, "sine", 0.4), 250);
    } else if (pts >= 7) {
      playTone(550, 0.1, "sine", 0.3);
      setTimeout(() => playTone(770, 0.3, "sine", 0.35), 120);
    } else {
      playTone(440, 0.08, "triangle", 0.25);
      setTimeout(() => playTone(550, 0.2, "sine", 0.28), 100);
    }
  }, [playTone]);

  const playRankSound = useCallback(() => {
    playTone(880, 0.08, "sine", 0.15);
    setTimeout(() => playTone(1100, 0.12, "sine", 0.12), 80);
  }, [playTone]);

  const getCurrentVoter = () => VOTING_COUNTRIES[currentVotingCountryIndex];

  const awardPoints = useCallback((targetCountryId: string, points: number) => {
    const targetRow = rowRefs.current[targetCountryId];
    const targetScoreEl = scoreDisplayRefs.current[targetCountryId];

    if (!targetRow || !targetScoreEl) return;

    const targetRect = targetRow.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };

    const newFly: FlyingPoint = {
      id: flyCounter,
      points,
      targetId: targetCountryId,
      startX: window.innerWidth / 2 - containerRect.left,
      startY: -30,
      targetX: targetRect.left - containerRect.left + targetRect.width * 0.85,
      targetY: targetRect.top - containerRect.top + targetRect.height / 2,
      active: true,
    };

    setFlyCounter(c => c + 1);
    setFlyingPoints(prev => [...prev, newFly]);
    setHighlightedCountry(targetCountryId);
    playPointSound(points);

    if (points === 12) setShowDouze(true);

    setTimeout(() => {
      setFlyingPoints(prev => prev.filter(f => f.id !== newFly.id));

      setScores(prev => {
        const updated = prev.map(s =>
          s.countryId === targetCountryId
            ? { ...s, score: s.score + points, animating: true, pointsReceived: points }
            : s
        );
        const sorted = [...updated].sort((a, b) => b.score - a.score || a.countryId.localeCompare(b.countryId));
        playRankSound();
        return sorted.map((s, i) => ({ ...s, rank: i + 1 }));
      });

      setTimeout(() => {
        setScores(prev => prev.map(s =>
          s.countryId === targetCountryId ? { ...s, animating: false, pointsReceived: null } : s
        ));
        setHighlightedCountry(null);
        if (points === 12) setShowDouze(false);
      }, 1200);
    }, 900);
  }, [flyCounter, playPointSound, playRankSound]);

  const handleCountryClick = (countryId: string) => {
    if (!votingStarted) {
      setVotingStarted(true);
    }

    const voter = getCurrentVoter();
    const used = givenPoints[voter.id] || [];
    const remaining = POINTS_ORDER.filter(p => !used.includes(p));
    if (remaining.length === 0) return;

    const pts = remaining[remaining.length - 1];

    if (countryId === voter.id) return;
    if (scores.find(s => s.countryId === countryId) === undefined) return;

    const newUsed = [...used, pts];
    setGivenPoints(prev => ({ ...prev, [voter.id]: newUsed }));

    awardPoints(countryId, pts);

    if (newUsed.length >= POINTS_ORDER.length) {
      setTimeout(() => {
        setCurrentVotingCountryIndex(prev => {
          const next = (prev + 1) % VOTING_COUNTRIES.length;
          return next;
        });
      }, 1500);
    }
  };

  const currentVoter = getCurrentVoter();
  const usedPoints = givenPoints[currentVoter?.id] || [];
  const remainingPoints = POINTS_ORDER.filter(p => !usedPoints.includes(p));
  const nextPoint = remainingPoints.length > 0 ? remainingPoints[remainingPoints.length - 1] : null;

  return (
    <div
      ref={containerRef}
      className="esc-root"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 30%, #0f2850 60%, #0a1628 100%)",
        fontFamily: "'Montserrat', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background waves */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "260px", pointerEvents: "none", zIndex: 0 }}>
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1a3a7a" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#2a5aaa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1a3a7a" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c83399" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#e040a0" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#c83399" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="wave3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0099cc" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#00bbee" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0099cc" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path d="M0,180 C360,120 720,240 1080,160 C1260,120 1350,140 1440,160 L1440,260 L0,260 Z" fill="url(#wave1)" />
          <path d="M0,200 C240,150 480,220 720,190 C960,160 1200,220 1440,200 L1440,260 L0,260 Z" fill="url(#wave2)" />
          <path d="M0,220 C360,200 720,240 1080,215 C1260,205 1350,220 1440,215 L1440,260 L0,260 Z" fill="url(#wave3)" />
        </svg>
      </div>

      {/* Stars */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 0 }}>
        {[...Array(60)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: i % 5 === 0 ? "3px" : "2px",
            height: i % 5 === 0 ? "3px" : "2px",
            borderRadius: "50%",
            background: `rgba(255,255,255,${0.3 + Math.random() * 0.5})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
      </div>

      {/* Heart of Europe ornament */}
      <div style={{
        position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
        fontSize: "11px", letterSpacing: "0.3em", color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase", fontWeight: 600, zIndex: 10,
      }}>
        #JoinUs · Copenhagen · 2014
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: "980px", margin: "0 auto", padding: "28px 12px 120px" }}>

        {/* ESC Logo header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            display: "inline-flex", flexDirection: "column", alignItems: "center",
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px", padding: "16px 40px", backdropFilter: "blur(10px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "6px" }}>
              <div style={{
                width: "42px", height: "42px",
                background: "linear-gradient(135deg, #00a0e9 0%, #7b2fbe 100%)",
                borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 900, color: "#fff",
                boxShadow: "0 0 20px rgba(0,160,233,0.5)",
              }}>♪</div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "0.04em", lineHeight: 1 }}>
                  EUROVISION SONG CONTEST
                </div>
                <div style={{ fontSize: "13px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.6)", marginTop: "3px" }}>
                  GRAND FINAL · SCOREBOARD
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Voting panel */}
        <div style={{
          background: "linear-gradient(135deg, rgba(0,100,200,0.2) 0%, rgba(150,50,200,0.15) 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px", padding: "14px 20px", marginBottom: "20px",
          backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              background: "rgba(0,160,233,0.25)",
              border: "1px solid rgba(0,160,233,0.4)",
              borderRadius: "8px", padding: "8px 14px",
              fontSize: "13px", fontWeight: 700,
            }}>
              {currentVoter.flag} {currentVoter.name.toUpperCase()}
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
              is awarding points
            </div>
          </div>

          {/* Points bubbles */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
            {POINTS_ORDER.map(pts => {
              const used = usedPoints.includes(pts);
              const isNext = pts === nextPoint;
              return (
                <div key={pts} style={{
                  width: "32px", height: "32px",
                  borderRadius: "50%",
                  background: used
                    ? "rgba(255,255,255,0.08)"
                    : isNext
                      ? `radial-gradient(circle, ${pts === 12 ? "#FFD700" : pts === 10 ? "#FFC200" : "#5599CC"} 0%, ${pts === 12 ? "#FF8C00" : pts === 10 ? "#FF9900" : "#3377AA"} 100%)`
                      : "rgba(255,255,255,0.12)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: pts === 10 || pts === 12 ? "11px" : "12px",
                  fontWeight: 800,
                  color: used ? "rgba(255,255,255,0.2)" : isNext ? "#fff" : "rgba(255,255,255,0.5)",
                  border: isNext ? `2px solid ${pts === 12 ? "#FFD700" : "#5599CC"}` : "1px solid rgba(255,255,255,0.15)",
                  boxShadow: isNext ? `0 0 12px ${pts === 12 ? "rgba(255,215,0,0.6)" : "rgba(85,153,204,0.6)"}` : "none",
                  transition: "all 0.3s ease",
                  transform: isNext ? "scale(1.15)" : "scale(1)",
                  textDecoration: used ? "line-through" : "none",
                }}>
                  {pts}
                </div>
              );
            })}
          </div>

          {!votingStarted && (
            <div style={{
              fontSize: "12px", color: "rgba(255,255,255,0.5)",
              fontStyle: "italic",
            }}>
              Click a country to award {nextPoint} point{nextPoint !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Voter progress */}
        <div style={{
          marginBottom: "16px", fontSize: "11px", color: "rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", gap: "8px",
        }}>
          <span>Country {currentVotingCountryIndex + 1} of {VOTING_COUNTRIES.length}</span>
          <div style={{ flex: 1, height: "3px", background: "rgba(255,255,255,0.1)", borderRadius: "2px" }}>
            <div style={{
              height: "100%", background: "linear-gradient(90deg, #00a0e9, #7b2fbe)",
              borderRadius: "2px", width: `${(currentVotingCountryIndex / VOTING_COUNTRIES.length) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* Scoreboard header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "36px 28px 1fr 80px 50px",
          gap: "0 8px",
          padding: "6px 12px",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.35)",
          textTransform: "uppercase",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "4px",
        }}>
          <div>Rank</div>
          <div></div>
          <div>Country</div>
          <div style={{ textAlign: "right" }}>Score</div>
          <div style={{ textAlign: "right" }}>+Pts</div>
        </div>

        {/* Score rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {scores.map((entry, idx) => {
            const country = COUNTRIES.find(c => c.id === entry.countryId);
            if (!country) return null;
            const isHighlighted = highlightedCountry === entry.countryId;
            const isVoterCountry = currentVoter?.id === entry.countryId;

            return (
              <div
                key={entry.countryId}
                ref={el => { rowRefs.current[entry.countryId] = el; }}
                onClick={() => handleCountryClick(entry.countryId)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "36px 28px 1fr 80px 50px",
                  gap: "0 8px",
                  alignItems: "center",
                  padding: "7px 12px",
                  borderRadius: "7px",
                  background: isHighlighted
                    ? "linear-gradient(90deg, rgba(0,160,233,0.25) 0%, rgba(120,80,200,0.2) 100%)"
                    : isVoterCountry
                      ? "rgba(255,255,255,0.04)"
                      : idx % 2 === 0 ? "rgba(255,255,255,0.025)" : "transparent",
                  border: isHighlighted
                    ? "1px solid rgba(0,160,233,0.4)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: isHighlighted ? "scale(1.01)" : "scale(1)",
                  boxShadow: isHighlighted ? "0 0 20px rgba(0,160,233,0.2)" : "none",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {/* Rank */}
                <div style={{
                  fontWeight: 800,
                  fontSize: idx < 3 ? "16px" : "13px",
                  color: idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                }}>
                  {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : idx + 1}
                </div>

                {/* Flag */}
                <div style={{ fontSize: "20px", lineHeight: 1, textAlign: "center" }}>{country.flag}</div>

                {/* Name */}
                <div style={{
                  fontWeight: isHighlighted ? 700 : 500,
                  fontSize: "14px",
                  letterSpacing: "0.02em",
                  color: isHighlighted ? "#fff" : "rgba(255,255,255,0.85)",
                  transition: "all 0.3s ease",
                  textTransform: "uppercase",
                }}>
                  {country.name}
                </div>

                {/* Score */}
                <div style={{ textAlign: "right" }}>
                  <span
                    ref={el => { scoreDisplayRefs.current[entry.countryId] = el; }}
                    style={{
                      fontWeight: 900,
                      fontSize: isHighlighted ? "22px" : "18px",
                      color: isHighlighted ? "#FFD700" : "#fff",
                      transition: "all 0.4s ease",
                      display: "inline-block",
                      transform: entry.animating ? "scale(1.3)" : "scale(1)",
                      textShadow: isHighlighted ? "0 0 12px rgba(255,215,0,0.8)" : "none",
                    }}
                  >
                    {entry.score}
                  </span>
                </div>

                {/* Last points received */}
                <div style={{ textAlign: "right" }}>
                  {entry.pointsReceived && (
                    <span style={{
                      fontWeight: 800,
                      fontSize: "13px",
                      color: entry.pointsReceived === 12 ? "#FFD700" : entry.pointsReceived === 10 ? "#FFC200" : "#87CEEB",
                      background: entry.pointsReceived === 12
                        ? "rgba(255,215,0,0.15)"
                        : entry.pointsReceived === 10
                          ? "rgba(255,194,0,0.12)"
                          : "rgba(135,206,235,0.1)",
                      padding: "2px 7px",
                      borderRadius: "10px",
                      border: `1px solid ${entry.pointsReceived === 12 ? "rgba(255,215,0,0.4)" : "rgba(135,206,235,0.2)"}`,
                      animation: "pointBump 0.5s ease",
                    }}>
                      +{entry.pointsReceived}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Flying points */}
      {flyingPoints.map(fp => (
        <div
          key={fp.id}
          style={{
            position: "fixed",
            left: fp.startX,
            top: fp.startY,
            zIndex: 1000,
            pointerEvents: "none",
            animation: "flyToTarget 0.9s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
            "--tx": `${fp.targetX - fp.startX}px`,
            "--ty": `${fp.targetY - fp.startY}px`,
          } as React.CSSProperties & { "--tx": string; "--ty": string }}
        >
          <div style={{
            width: fp.points === 12 ? "52px" : fp.points === 10 ? "46px" : "38px",
            height: fp.points === 12 ? "52px" : fp.points === 10 ? "46px" : "38px",
            borderRadius: "50%",
            background: fp.points === 12
              ? "radial-gradient(circle, #FFE066 0%, #FF8C00 70%, #FF4400 100%)"
              : fp.points === 10
                ? "radial-gradient(circle, #FFD700 0%, #FFA500 100%)"
                : `radial-gradient(circle, #87CEEB 0%, #4488BB 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900,
            fontSize: fp.points === 12 ? "22px" : fp.points === 10 ? "18px" : "15px",
            color: "#fff",
            boxShadow: fp.points === 12
              ? "0 0 30px rgba(255,200,0,0.9), 0 0 60px rgba(255,100,0,0.5)"
              : fp.points === 10
                ? "0 0 20px rgba(255,200,0,0.7)"
                : "0 0 15px rgba(0,150,255,0.6)",
            textShadow: "0 1px 3px rgba(0,0,0,0.5)",
          }}>
            {fp.points}
          </div>
        </div>
      ))}

      {/* DOUZE POINTS overlay */}
      {showDouze && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2000, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, rgba(255,215,0,0.15) 0%, transparent 70%)",
        }}>
          <div style={{
            textAlign: "center",
            animation: "douzeIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards",
          }}>
            <div style={{
              fontSize: "clamp(48px, 10vw, 96px)",
              fontWeight: 900,
              background: "linear-gradient(135deg, #FFE066 0%, #FFD700 40%, #FF8C00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "0.04em",
              textShadow: "none",
              filter: "drop-shadow(0 0 20px rgba(255,200,0,0.8))",
              lineHeight: 1,
            }}>
              DOUZE POINTS!
            </div>
            <div style={{
              fontSize: "18px", color: "rgba(255,215,0,0.7)", marginTop: "8px",
              letterSpacing: "0.3em", fontWeight: 600,
            }}>
              ★ ★ ★ 12 ★ ★ ★
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes flyToTarget {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          60% { opacity: 1; transform: translate(calc(var(--tx) * 0.7), calc(var(--ty) * 0.7)) scale(0.9); }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 0; }
        }
        @keyframes pointBump {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes douzeIn {
          0% { transform: scale(0.3); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .esc-root * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}