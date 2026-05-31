import { POINTS_ORDER, VOTING_COUNTRIES, flagUrl } from "./types";

type Props = {
  voterIdx:  number;
  count:     number;
  nextPt:    number | null;
  panelRef:  React.RefObject<HTMLDivElement>;
};

export default function BottomPanel({ voterIdx, count, nextPt, panelRef }: Props) {
  const voter = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];

  return (
    <div ref={panelRef} style={{
      background: "linear-gradient(180deg,rgba(1,6,22,0.99) 0%,rgba(1,4,15,1) 100%)",
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
          <img
            src={flagUrl(voter.cc)} alt={voter.name}
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

      {/* Points buttons 1 → 12 */}
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
                  ? "linear-gradient(158deg,#2a7aec 0%,#104ab8 44%,#0b3292 100%)"
                  : "linear-gradient(158deg,rgba(13,44,115,0.85) 0%,rgba(5,22,70,0.92) 100%)",
              border: isNext
                ? "1.5px solid rgba(95,182,255,0.88)"
                : used
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "1px solid rgba(26,80,188,0.42)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize:   isBig ? "21px" : "17px",
              fontWeight: 800,
              color: used ? "rgba(255,255,255,0.08)" : isNext ? "#fff" : "rgba(120,192,255,0.65)",
              boxShadow: isNext
                ? "0 0 20px rgba(0,120,255,0.72),0 0 40px rgba(0,70,225,0.42),inset 0 1px 0 rgba(255,255,255,0.28),inset 0 -1px 0 rgba(0,0,0,0.35)"
                : "0 2px 7px rgba(0,0,0,0.55)",
              transform:  isNext ? "scale(1.13)" : "scale(1)",
              transition: "all 0.25s ease",
              cursor: "default",
            }}>
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
  );
}
