import { useState, useRef, useEffect } from "react";
import { Entry, FlyBall, flagUrl } from "./types";

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
        <img
          src={flagUrl(entry.cc)}
          alt={entry.name}
          style={{
            width: "44px", height: "29px",
            objectFit: "cover", borderRadius: "2px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.65)",
            display: "block",
            animation:       isLeader ? "flagWave 2.2s ease-in-out infinite" : "none",
            transformOrigin: "left center",
          }}
        />
        {/* Флаг закрыт изображением флага с цифрой балла */}
        {entry.coveredPts !== null && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 5,
          }}>
            <div style={{ position: "relative", width: "44px", height: "29px" }}>
              <img
                src={flagUrl(entry.cc)}
                alt=""
                style={{
                  width: "44px", height: "29px",
                  objectFit: "cover", borderRadius: "2px",
                  display: "block",
                  filter: "brightness(0.35) saturate(0.5)",
                }}
              />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize:   entry.coveredPts >= 10 ? "16px" : "14px",
                color:      "#fff",
                textShadow: "0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)",
              }}>
                {entry.coveredPts}
              </div>
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

// ── Летящие шары ──
export function FlyBalls({ balls }: { balls: FlyBall[] }) {
  return (
    <>
      {balls.map(ball => {
        const sz = ball.pts === 12 ? 54 : ball.pts === 10 ? 46 : 44;
        return (
          <div key={ball.id} style={{
            position: "fixed", left: ball.x1, top: ball.y1,
            width: 0, height: 0, zIndex: 500, pointerEvents: "none",
            "--dx": `${ball.x2 - ball.x1}px`,
            "--dy": `${ball.y2 - ball.y1}px`,
            animation: "escFly 1.4s cubic-bezier(0.25,0.1,0.25,1) forwards",
          } as React.CSSProperties & Record<string, string>}>
            {/* Флаг-форма шара — прямоугольный как флаг */}
            <div style={{
              width:  `${sz * 1.5}px`,
              height: `${sz}px`,
              transform: "translate(-50%,-50%)",
              position: "relative",
              borderRadius: "3px",
              overflow: "hidden",
              boxShadow: ball.pts === 12
                ? "0 0 28px rgba(255,180,0,1), 0 0 56px rgba(255,80,0,0.8)"
                : ball.pts === 10
                  ? "0 0 22px rgba(255,200,0,1), 0 0 44px rgba(255,130,0,0.6)"
                  : "0 0 18px rgba(30,145,255,1), 0 0 36px rgba(0,80,225,0.6)",
            }}>
              {/* Фоновый флаг затемнённый */}
              <img
                src={`https://flagcdn.com/w80/${ball.targetCc}.png`}
                alt=""
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.35) saturate(0.5)",
                }}
              />
              {/* Цифра поверх */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Montserrat',sans-serif",
                fontWeight: 900,
                fontSize: ball.pts >= 10 ? "22px" : "17px",
                color: "#fff",
                textShadow: "0 1px 5px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)",
              }}>
                {ball.pts}
              </div>
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
        <div style={{ fontSize: "16px", letterSpacing: "0.45em", color: "rgba(255,210,70,0.62)", marginTop: "12px" }}>
          ✦ ✦ ✦
        </div>
      </div>
    </div>
  );
}
