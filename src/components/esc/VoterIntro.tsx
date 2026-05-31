import { useEffect, useState } from "react";
import FlagSvg from "./flags";

// Координаты стран на карте Европы (SVG viewBox 0 0 900 600)
const COUNTRY_COORDS: Record<string, { x: number; y: number }> = {
  AL: { x: 530, y: 340 }, AM: { x: 720, y: 290 }, AT: { x: 480, y: 245 },
  AZ: { x: 740, y: 280 }, BY: { x: 580, y: 175 }, BE: { x: 405, y: 215 },
  BG: { x: 570, y: 305 }, HR: { x: 500, y: 275 }, CY: { x: 630, y: 380 },
  DK: { x: 455, y: 165 }, EE: { x: 570, y: 145 }, FI: { x: 570, y: 110 },
  FR: { x: 400, y: 265 }, DE: { x: 455, y: 215 }, GR: { x: 545, y: 355 },
  HU: { x: 520, y: 255 }, IS: { x: 270, y: 95  }, IL: { x: 655, y: 375 },
  IT: { x: 470, y: 310 }, LV: { x: 565, y: 160 }, LT: { x: 555, y: 170 },
  MT: { x: 470, y: 370 }, MD: { x: 590, y: 255 }, ME: { x: 520, y: 315 },
  NL: { x: 415, y: 205 }, NO: { x: 450, y: 130 }, PL: { x: 515, y: 200 },
  PT: { x: 355, y: 315 }, RO: { x: 570, y: 265 }, RU: { x: 660, y: 155 },
  SM: { x: 470, y: 295 }, RS: { x: 530, y: 290 }, SI: { x: 490, y: 265 },
  ES: { x: 375, y: 300 }, SE: { x: 490, y: 130 }, CH: { x: 440, y: 260 },
  UA: { x: 600, y: 230 },
};

type Props = {
  voterCc: string;
  voterName: string;
  voterIdx: number;
  total: number;
  onDone: () => void;
};

export default function VoterIntro({ voterCc, voterName, voterIdx, total, onDone }: Props) {
  const [phase, setPhase] = useState<"map" | "fadeout">("map");
  const coord = COUNTRY_COORDS[voterCc.toUpperCase()] ?? { x: 500, y: 250 };

  useEffect(() => {
    // 2.8s показываем карту, потом fade-out 0.5s, потом вызываем onDone
    const t1 = setTimeout(() => setPhase("fadeout"), 2800);
    const t2 = setTimeout(() => onDone(), 3300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg,#030818 0%,#050d24 50%,#030814 100%)",
      opacity: phase === "fadeout" ? 0 : 1,
      transition: "opacity 0.5s ease",
      pointerEvents: phase === "fadeout" ? "none" : "all",
    }}>

      {/* MAP SVG — упрощённая контурная карта Европы */}
      <div style={{
        position: "relative",
        width: "min(780px, 94vw)",
        animation: "mapFadeIn 0.6s ease forwards",
      }}>
        <svg
          viewBox="0 0 900 520"
          style={{ width: "100%", display: "block" }}
          fill="none"
        >
          {/* ── Океан / море ── */}
          <rect width="900" height="520" fill="rgba(0,20,70,0.6)" rx="12"/>

          {/* ── Сетка ── */}
          {[100,200,300,400,500].map(y => (
            <line key={`h${y}`} x1="0" y1={y} x2="900" y2={y}
              stroke="rgba(0,80,200,0.08)" strokeWidth="1"/>
          ))}
          {[150,300,450,600,750].map(x => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="520"
              stroke="rgba(0,80,200,0.08)" strokeWidth="1"/>
          ))}

          {/* ── Контуры континентов (упрощённые) ── */}
          {/* Европа */}
          <path d="
            M270,95 L300,80 L340,75 L380,80 L420,70 L460,65 L500,60
            L540,58 L580,60 L620,70 L660,80 L700,90 L740,100 L770,120
            L790,150 L800,180 L810,210 L800,240 L790,265 L780,285
            L760,295 L740,290 L720,295 L710,310 L700,330 L690,350
            L670,365 L655,375 L640,380 L630,385 L620,380 L600,370
            L580,360 L565,350 L550,355 L545,355 L535,345 L525,340
            L515,345 L510,360 L500,370 L485,375 L475,370 L470,355
            L460,345 L450,340 L440,345 L435,330 L430,315 L420,305
            L410,295 L405,280 L395,270 L385,260 L375,265 L365,275
            L360,290 L355,310 L350,325 L345,340 L355,350 L370,355
            L380,360 L390,355 L400,345 L405,335 L410,330 L415,335
            L408,345 L400,355 L395,365 L385,370 L375,365 L360,360
            L345,360 L335,355 L325,345 L315,335 L310,320 L308,300
            L305,280 L300,260 L295,245 L285,235 L275,225 L268,215
            L260,205 L258,190 L260,175 L265,160 L268,140 L270,120 Z
          " fill="rgba(0,45,120,0.55)" stroke="rgba(40,120,255,0.3)" strokeWidth="1"/>

          {/* Скандинавия */}
          <path d="
            M430,65 L440,50 L450,40 L460,35 L475,38 L490,45
            L500,55 L510,48 L525,38 L545,30 L565,25 L580,30
            L590,45 L585,65 L575,80 L560,90 L545,100 L530,108
            L515,112 L500,108 L490,100 L480,95 L468,95 L455,100
            L445,108 L440,120 L432,130 L428,115 L425,98 L428,80 Z
          " fill="rgba(0,45,120,0.55)" stroke="rgba(40,120,255,0.3)" strokeWidth="1"/>

          {/* Великобритания */}
          <path d="
            M355,145 L365,135 L375,130 L385,135 L390,150
            L385,168 L375,178 L360,182 L350,175 L345,160 Z
          " fill="rgba(0,45,120,0.55)" stroke="rgba(40,120,255,0.3)" strokeWidth="1"/>

          {/* Исландия */}
          <path d="
            M255,88 L270,82 L288,80 L302,85 L308,95
            L300,108 L282,115 L265,112 L255,102 Z
          " fill="rgba(0,45,120,0.55)" stroke="rgba(40,120,255,0.3)" strokeWidth="1"/>

          {/* ── Все остальные страны как точки ── */}
          {Object.entries(COUNTRY_COORDS).map(([cc, pos]) => {
            const isVoter = cc === voterCc.toUpperCase();
            return (
              <g key={cc}>
                {/* пульсирующий круг для голосующей страны */}
                {isVoter && (
                  <>
                    <circle cx={pos.x} cy={pos.y} r="28"
                      fill="rgba(0,160,255,0.12)"
                      style={{ animation: "mapPing 1s ease-out infinite" }}/>
                    <circle cx={pos.x} cy={pos.y} r="18"
                      fill="rgba(0,180,255,0.18)"
                      style={{ animation: "mapPing 1s ease-out 0.3s infinite" }}/>
                  </>
                )}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isVoter ? 7 : 4}
                  fill={isVoter ? "#00d4ff" : "rgba(80,160,255,0.55)"}
                  stroke={isVoter ? "rgba(255,255,255,0.9)" : "rgba(40,120,255,0.4)"}
                  strokeWidth={isVoter ? 2 : 1}
                />
              </g>
            );
          })}

          {/* ── Линия-луч от страны вверх к названию ── */}
          <line
            x1={coord.x} y1={coord.y - 8}
            x2={coord.x} y2={coord.y - 55}
            stroke="rgba(0,210,255,0.6)" strokeWidth="1.5"
            strokeDasharray="4 3"
            style={{ animation: "lineDash 0.8s linear infinite" }}
          />
        </svg>

        {/* ── Всплывающая карточка с флагом ── */}
        <div style={{
          position: "absolute",
          left: `${(coord.x / 900) * 100}%`,
          top:  `${((coord.y - 65) / 520) * 100}%`,
          transform: "translate(-50%, -100%)",
          background: "linear-gradient(135deg,rgba(5,20,60,0.97) 0%,rgba(8,30,80,0.95) 100%)",
          border: "1px solid rgba(0,180,255,0.6)",
          borderRadius: "8px",
          padding: "8px 14px",
          display: "flex", alignItems: "center", gap: "10px",
          whiteSpace: "nowrap",
          boxShadow: "0 0 24px rgba(0,160,255,0.4), 0 4px 20px rgba(0,0,0,0.6)",
          animation: "cardPop 0.4s cubic-bezier(0.34,1.4,0.64,1) 0.2s both",
          zIndex: 10,
        }}>
          <FlagSvg cc={voterCc.toLowerCase()} width={36} height={24} style={{ flexShrink: 0 }} />
          <div>
            <div style={{
              fontSize: "14px", fontWeight: 800,
              letterSpacing: "0.1em", color: "#ffffff",
              fontFamily: "'Montserrat',sans-serif",
            }}>
              {voterName}
            </div>
            <div style={{
              fontSize: "10px", color: "rgba(0,210,255,0.75)",
              letterSpacing: "0.12em", fontFamily: "'Montserrat',sans-serif",
            }}>
              IS VOTING
            </div>
          </div>
          {/* Треугольник вниз */}
          <div style={{
            position: "absolute", bottom: "-7px", left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "7px solid rgba(0,180,255,0.6)",
          }}/>
        </div>
      </div>

      {/* ── Прогресс ── */}
      <div style={{
        marginTop: "20px",
        fontSize: "11px", letterSpacing: "0.2em",
        color: "rgba(100,170,255,0.45)",
        fontFamily: "'Montserrat',sans-serif",
        animation: "mapFadeIn 0.6s ease 0.3s both",
      }}>
        {voterIdx + 1} OF {total} COUNTRIES VOTING
      </div>

      <style>{`
        @keyframes mapFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes cardPop {
          from { opacity: 0; transform: translate(-50%,-100%) scale(0.7); }
          to   { opacity: 1; transform: translate(-50%,-100%) scale(1); }
        }
        @keyframes mapPing {
          0%   { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes lineDash {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -14; }
        }
      `}</style>
    </div>
  );
}