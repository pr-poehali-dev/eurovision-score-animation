import { useState, useRef, useEffect } from "react";
import { Entry, FlyBall } from "./types";
import FlagSvg from "./flags";

// ── Анимированный счётчик ──
export function useCountUp(target: number, duration = 1200): number {
  const [display, setDisplay] = useState(target);
  const prev   = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = prev.current;
    if (from === target) { setDisplay(target); return; }
    prev.current = target;
    const start = performance.now();
    const tick  = (now: number) => {
      const t      = Math.min((now - start) / duration, 1);
      const eased  = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else        setDisplay(target);
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

// ── Строка таблицы ──
export function ScoreRow({
  entry, isVoter, alreadyVoted, hasNext, onClick, isLeader,
}: {
  entry:        Entry;
  isVoter:      boolean;
  alreadyVoted: boolean;
  hasNext:      boolean;
  onClick:      (id: string) => void;
  isLeader:     boolean;
}) {
  const displayScore = useCountUp(entry.score, 1200);
  const isFlash      = entry.flashedByVoter !== null;
  const is12         = entry.is12;
  const unclickable  = isVoter || alreadyVoted || !hasNext;

  return (
    <div
      data-id={entry.id}
      onClick={() => !unclickable && onClick(entry.id)}
      style={{
        display: "flex", alignItems: "center",
        height: "46px", padding: "0 10px 0 8px",
        background: is12
          ? "linear-gradient(90deg,rgba(200,90,0,0.6) 0%,rgba(160,55,0,0.42) 50%,rgba(60,18,0,0.15) 100%)"
          : isFlash
            ? "linear-gradient(90deg,rgba(15,105,255,0.52) 0%,rgba(6,52,180,0.36) 52%,rgba(2,18,75,0.14) 100%)"
            : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        cursor:     unclickable ? "default" : "pointer",
        opacity:    isVoter ? 0.42 : 1,
        transition: "background 0.4s ease, opacity 0.3s",
        position:   "relative",
        userSelect: "none",
        boxSizing:  "border-box",
      }}
    >
      {/* FLAG + cover */}
      <div
        data-flag={entry.id}
        style={{
          width: "58px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", height: "100%",
        }}
      >
        {/* SVG флаг */}
        <FlagSvg
          cc={entry.cc}
          width={42} height={28}
          style={{
            animation:       isLeader ? "flagWave 2.2s ease-in-out infinite" : "none",
            transformOrigin: "left center",
            opacity: isVoter ? 0.5 : 1,
          }}
        />

        {/* Балл закрывает флаг до конца раунда */}
        {entry.coveredPts !== null && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5,
          }}>
            <div style={{
              width: "38px", height: "28px",
              borderRadius: "4px",
              background: entry.coveredPts === 12
                ? "linear-gradient(135deg,#FFD700,#FF8800)"
                : entry.coveredPts === 10
                  ? "linear-gradient(135deg,#FFC800,#FF9900)"
                  : entry.coveredPts >= 8
                    ? "linear-gradient(135deg,#4488ff,#0044cc)"
                    : "linear-gradient(135deg,rgba(10,40,120,0.92),rgba(5,20,70,0.95))",
              border: entry.coveredPts >= 8
                ? "1px solid rgba(255,255,255,0.35)"
                : "1px solid rgba(80,140,255,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize:   entry.coveredPts >= 10 ? "15px" : "13px",
              color:      "#fff",
              boxShadow: entry.coveredPts === 12
                ? "0 0 10px rgba(255,160,0,0.8)"
                : entry.coveredPts >= 8
                  ? "0 0 8px rgba(40,100,255,0.6)"
                  : "none",
              textShadow: "0 1px 3px rgba(0,0,0,0.8)",
            }}>
              {entry.coveredPts}
            </div>
          </div>
        )}
      </div>

      {/* NAME */}
      <div style={{
        flex: 1, fontSize: "15px", fontWeight: 500,
        letterSpacing: "0.07em",
        color:      isFlash ? "#ffffff" : "rgba(180,218,255,0.92)",
        fontFamily: "'Montserrat',sans-serif",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        transition: "color 0.25s",
      }}>
        {entry.name}
      </div>

      {/* SCORE */}
      <div style={{
        width: "56px", textAlign: "right", flexShrink: 0,
        fontSize:   isFlash ? "22px" : "18px",
        fontWeight: 700,
        color:      is12 ? "#FFD700" : isFlash ? "#7df8ff" : "#70c2f0",
        fontFamily: "'Montserrat',sans-serif",
        transition: "font-size 0.22s, color 0.22s",
      }}>
        {displayScore > 0 ? displayScore : ""}
      </div>
    </div>
  );
}

// ── Летящие шары (emoji вместо img) ──
export function FlyBalls({ balls }: { balls: FlyBall[] }) {
  return (
    <>
      {balls.map(ball => {
        const sz = ball.pts === 12 ? 52 : ball.pts === 10 ? 46 : 40;
        const isGold = ball.pts >= 10;
        const isMid  = ball.pts === 8;
        return (
          <div key={ball.id} style={{
            position: "fixed", left: ball.x1, top: ball.y1,
            width: 0, height: 0, zIndex: 500, pointerEvents: "none",
            "--dx": `${ball.x2 - ball.x1}px`,
            "--dy": `${ball.y2 - ball.y1}px`,
            animation: "escFly 1.4s cubic-bezier(0.25,0.1,0.25,1) forwards",
          } as React.CSSProperties & Record<string, string>}>
            <div style={{
              width:  `${sz}px`,
              height: `${sz}px`,
              transform: "translate(-50%,-50%)",
              borderRadius: "50%",
              background: isGold
                ? "radial-gradient(circle at 35% 30%, #fff5a0 0%, #FFD700 35%, #FF8800 100%)"
                : isMid
                  ? "radial-gradient(circle at 35% 30%, #aad4ff 0%, #4488ff 40%, #0044cc 100%)"
                  : "radial-gradient(circle at 35% 30%, #c8e8ff 0%, #3399ee 40%, #0033aa 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: ball.pts >= 10 ? "22px" : "17px",
              color: "#fff",
              boxShadow: isGold
                ? "0 0 24px rgba(255,200,0,1), 0 0 48px rgba(255,100,0,0.7)"
                : "0 0 18px rgba(40,120,255,0.9), 0 0 36px rgba(0,80,200,0.5)",
              textShadow: "0 1px 4px rgba(0,0,0,0.7)",
            }}>
              {ball.pts}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── DOUZE POINTS overlay ──
export function DouzeOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
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
        <div style={{ fontSize: "16px", letterSpacing: "0.4em", color: "rgba(255,210,70,0.65)", marginTop: "10px" }}>
          ✦ ✦ ✦
        </div>
      </div>
    </div>
  );
}