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
  entry, isVoter, alreadyVoted, hasNext, onClick, isLeader, isPushed,
}: {
  entry:        Entry;
  isVoter:      boolean;
  alreadyVoted: boolean;
  hasNext:      boolean;
  onClick:      (id: string) => void;
  isLeader:     boolean;
  isPushed?:    boolean;
}) {
  const displayScore = useCountUp(entry.score, 1200);
  const isFlash      = entry.flashedByVoter !== null;
  const is12         = entry.is12;
  const isHighPts    = (entry.coveredPts ?? 0) >= 8; // получила 8/10/12 — всегда поверх
  const unclickable  = isVoter || alreadyVoted || !hasNext;

  // Цвет заливки слева направо при isPushed
  const pushBg = is12
    ? "rgba(230,100,0,0.88)"
    : (entry.coveredPts ?? 0) === 10
      ? "rgba(220,130,0,0.82)"
      : "rgba(0,100,255,0.78)";

  return (
    <div
      data-id={entry.id}
      data-covered={entry.coveredPts ?? 0}
      onClick={() => !unclickable && onClick(entry.id)}
      style={{
        display: "flex", alignItems: "center",
        height: "46px", padding: "0 10px 0 8px",
        background: is12
          ? "linear-gradient(90deg,rgba(220,90,0,0.72) 0%,rgba(180,55,0,0.55) 50%,rgba(80,18,0,0.22) 100%)"
          : isFlash && isHighPts
            ? "linear-gradient(90deg,rgba(0,120,255,0.65) 0%,rgba(0,70,200,0.48) 52%,rgba(0,20,90,0.2) 100%)"
            : isFlash
              ? "linear-gradient(90deg,rgba(15,105,255,0.52) 0%,rgba(6,52,180,0.36) 52%,rgba(2,18,75,0.14) 100%)"
              : "transparent",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        cursor:     unclickable ? "default" : "pointer",
        opacity:    isVoter ? 0.42 : 1,
        transition: "background 0.4s ease, opacity 0.3s, transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.45s ease",
        position:   "relative",
        userSelect: "none",
        boxSizing:  "border-box",
        // isPushed — сильное выдвижение при получении балла
        // isHighPts (без push) — умеренное постоянное выдвижение пока держится балл
        transform: isPushed
          ? "scale(1.07) translateX(16px)"
          : isHighPts
            ? "scale(1.025) translateX(6px)"
            : "scale(1) translateX(0)",
        zIndex: isPushed
          ? 500                   // поверх ВСЕГО при выдвижении
          : isHighPts
            ? 100                 // поверх таблицы пока держится высокий балл
            : "auto" as unknown as number,
        boxShadow: isPushed
          ? is12
            ? "10px 0 40px rgba(255,140,0,0.8), 0 4px 30px rgba(200,60,0,0.6), -4px 0 20px rgba(255,80,0,0.4)"
            : "10px 0 40px rgba(0,140,255,0.75), 0 4px 30px rgba(0,80,220,0.55), -4px 0 20px rgba(0,100,255,0.35)"
          : isHighPts
            ? is12
              ? "6px 0 22px rgba(255,120,0,0.55), 0 2px 12px rgba(0,0,0,0.5)"
              : "6px 0 20px rgba(0,100,255,0.5), 0 2px 10px rgba(0,0,0,0.4)"
            : "none",
        overflow: "hidden",
      }}
    >
      {/* Заливка слева направо при isPushed */}
      {isPushed && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
          background: pushBg,
          animation: "fillLR 0.65s cubic-bezier(0.25,0.46,0.45,0.94) forwards",
        }} />
      )}
      {/* FLAG + cover */}
      <div
        data-flag={entry.id}
        style={{
          width: "58px", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", height: "100%",
          zIndex: 2,
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

        {/* Балл — прямоугольник точно по размеру флага, полностью перекрывает */}
        {entry.coveredPts !== null && (
          <div style={{
            position: "absolute",
            // точно совпадает с размером FlagSvg (42×28)
            width: "42px", height: "28px",
            borderRadius: "2px",
            zIndex: 5,
            background: entry.coveredPts === 12
              ? "linear-gradient(135deg,#FFE066 0%,#FFD700 40%,#FF8800 100%)"
              : entry.coveredPts === 10
                ? "linear-gradient(135deg,#FFE566 0%,#FFC800 45%,#FF9900 100%)"
                : entry.coveredPts === 8
                  ? "linear-gradient(135deg,#6abaff 0%,#4488ff 45%,#0044cc 100%)"
                  : "linear-gradient(135deg,#3a6fcc 0%,#1a4aaa 50%,#0a2880 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 900,
            fontSize: entry.coveredPts >= 10 ? "16px" : entry.coveredPts >= 8 ? "15px" : "13px",
            color: "#fff",
            boxShadow: entry.coveredPts === 12
              ? "0 0 12px rgba(255,180,0,0.9), 0 0 4px rgba(0,0,0,0.4)"
              : entry.coveredPts >= 8
                ? "0 0 10px rgba(40,120,255,0.7), 0 0 4px rgba(0,0,0,0.4)"
                : "0 0 4px rgba(0,0,0,0.5)",
            textShadow: "0 1px 3px rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}>
            {entry.coveredPts}
          </div>
        )}
      </div>

      {/* NAME */}
      <div style={{
        flex: 1, fontSize: "15px", fontWeight: 500,
        letterSpacing: "0.07em",
        color:      (isFlash || isPushed) ? "#ffffff" : "rgba(180,218,255,0.92)",
        fontFamily: "'Montserrat',sans-serif",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        transition: "color 0.25s",
        position: "relative", zIndex: 2,
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
        position: "relative", zIndex: 2,
      }}>
        {displayScore > 0 ? displayScore : ""}
      </div>
    </div>
  );
}

// ── Летящие шары — прямоугольник как флаг ──
export function FlyBalls({ balls }: { balls: FlyBall[] }) {
  return (
    <>
      {balls.map(ball => {
        // Размер совпадает с cover-прямоугольником на флаге (42×28), масштабируем для видимости
        const w = ball.pts === 12 ? 70 : ball.pts === 10 ? 63 : ball.pts === 8 ? 63 : 56;
        const h = Math.round(w * (28 / 42)); // сохраняем пропорции флага
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
            {/* Прямоугольник — пропорции флага */}
            <div style={{
              width:  `${w}px`,
              height: `${h}px`,
              transform: "translate(-50%,-50%)",
              borderRadius: "3px",
              background: isGold
                ? "linear-gradient(135deg,#FFE066 0%,#FFD700 40%,#FF8800 100%)"
                : isMid
                  ? "linear-gradient(135deg,#6abaff 0%,#4488ff 45%,#0044cc 100%)"
                  : "linear-gradient(135deg,#3a6fcc 0%,#1a4aaa 50%,#0a2880 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Montserrat',sans-serif",
              fontWeight: 900,
              fontSize: ball.pts >= 10 ? "24px" : ball.pts === 8 ? "22px" : "18px",
              color: "#fff",
              boxShadow: isGold
                ? "0 0 28px rgba(255,200,0,1), 0 0 52px rgba(255,100,0,0.7)"
                : isMid
                  ? "0 0 22px rgba(40,140,255,0.9), 0 0 40px rgba(0,80,200,0.6)"
                  : "0 0 18px rgba(40,100,255,0.8), 0 0 32px rgba(0,60,180,0.5)",
              textShadow: "0 1px 5px rgba(0,0,0,0.8)",
              border: "1px solid rgba(255,255,255,0.25)",
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