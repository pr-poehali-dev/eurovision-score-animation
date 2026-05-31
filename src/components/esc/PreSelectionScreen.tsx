import { useState } from "react";
import { CONTESTANTS, flagEmoji, PreVote } from "./types";

// Низкие баллы в порядке назначения: 1→7 (от меньшего к большему)
const LOW_PTS = [1, 2, 3, 4, 5, 6, 7];

type Props = {
  voterCc: string;
  voterName: string;
  voterCountryId: string;        // ID голосующей страны (нельзя голосовать за неё)
  onConfirm: (votes: PreVote[]) => void;
};

export default function PreSelectionScreen({ voterCc, voterName, voterCountryId, onConfirm }: Props) {
  // selections[i] = id страны, которой назначен LOW_PTS[i], или null
  const [selections, setSelections] = useState<(string | null)[]>(Array(7).fill(null));
  // Какой балл сейчас выбираем (индекс в LOW_PTS, -1 = подтверждение)
  const [activePtsIdx, setActivePtsIdx] = useState(0);

  // Страны доступные для выбора (не голосующая, не уже выбранная)
  const usedIds = new Set(selections.filter(Boolean) as string[]);
  const nextPts = activePtsIdx < LOW_PTS.length ? LOW_PTS[activePtsIdx] : null;
  const allDone = activePtsIdx >= LOW_PTS.length;

  const handleSelect = (countryId: string) => {
    if (allDone) return;
    if (countryId === voterCountryId) return;
    if (usedIds.has(countryId)) return;

    const newSel = [...selections];
    newSel[activePtsIdx] = countryId;
    setSelections(newSel);
    setActivePtsIdx(i => i + 1);
  };

  // Отмена последнего выбора
  const handleUndo = () => {
    if (activePtsIdx === 0) return;
    const newSel = [...selections];
    newSel[activePtsIdx - 1] = null;
    setSelections(newSel);
    setActivePtsIdx(i => i - 1);
  };

  const handleConfirm = () => {
    if (!allDone) return;
    const votes: PreVote[] = selections.map((id, i) => ({
      countryId: id!,
      pts: LOW_PTS[i],
    }));
    onConfirm(votes);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 800,
      background: "linear-gradient(180deg,#030818 0%,#050d24 50%,#030814 100%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Montserrat',sans-serif", color: "#fff",
      overflowY: "auto", padding: "16px 12px 24px",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "16px", maxWidth: "700px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "28px", lineHeight: 1 }}>{flagEmoji(voterCc)}</span>
          <span style={{ fontSize: "17px", fontWeight: 800, letterSpacing: "0.1em", color: "#a6d8ff" }}>
            {voterName}
          </span>
        </div>
        <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(100,178,255,0.45)", textTransform: "uppercase" }}>
          Select countries for points 1 – 7
        </div>
      </div>

      {/* Points bar — выбранные слева направо 1..7 */}
      <div style={{
        display: "flex", gap: "7px", marginBottom: "18px",
        background: "rgba(2,9,34,0.9)", borderRadius: "10px",
        padding: "10px 14px", border: "1px solid rgba(14,56,138,0.5)",
        flexWrap: "wrap", justifyContent: "center",
      }}>
        {LOW_PTS.map((pts, idx) => {
          const selId   = selections[idx];
          const selEntry = CONTESTANTS.find(c => c.id === selId);
          const isActive = idx === activePtsIdx;
          const isDone   = selId !== null;
          return (
            <div key={pts} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
              opacity: idx > activePtsIdx ? 0.35 : 1,
              transition: "opacity 0.25s",
            }}>
              {/* Флаг выбранной страны или пустой слот */}
              <div style={{
                width: "44px", height: "29px",
                borderRadius: "3px", overflow: "hidden",
                border: isActive ? "2px solid #00d4ff" : "1px solid rgba(40,100,200,0.4)",
                boxShadow: isActive ? "0 0 10px rgba(0,200,255,0.5)" : "none",
                background: "rgba(0,20,60,0.8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                position: "relative",
              }}>
                {selEntry && (
                  <span style={{ fontSize: "20px", lineHeight: 1 }}>{flagEmoji(selEntry.cc)}</span>
                )}
                {isDone && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.5)",
                    fontSize: "13px", fontWeight: 900, color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                  }}>{pts}</div>
                )}
              </div>
              {/* Балл */}
              <div style={{
                fontSize: "12px", fontWeight: 700,
                color: isActive ? "#00d4ff" : isDone ? "#70c2f0" : "rgba(120,180,255,0.4)",
              }}>{pts}</div>
            </div>
          );
        })}

        {/* Кнопка отмены последнего */}
        <div style={{ display: "flex", alignItems: "center", marginLeft: "6px" }}>
          <button
            onClick={handleUndo}
            disabled={activePtsIdx === 0}
            style={{
              background: "rgba(255,80,80,0.15)",
              border: "1px solid rgba(255,80,80,0.35)",
              borderRadius: "6px", padding: "6px 10px",
              color: activePtsIdx === 0 ? "rgba(255,100,100,0.25)" : "rgba(255,120,120,0.85)",
              fontSize: "11px", fontWeight: 700, cursor: activePtsIdx === 0 ? "default" : "pointer",
              fontFamily: "'Montserrat',sans-serif",
              transition: "all 0.2s",
            }}
          >↩ UNDO</button>
        </div>
      </div>

      {/* Инструкция */}
      {!allDone && nextPts !== null && (
        <div style={{
          marginBottom: "12px", fontSize: "12px",
          color: "rgba(0,210,255,0.7)", letterSpacing: "0.1em",
          textAlign: "center",
        }}>
          Click a country to award&nbsp;
          <span style={{ fontWeight: 900, fontSize: "15px", color: "#00d4ff" }}>{nextPts}</span>
          &nbsp;point{nextPts !== 1 ? "s" : ""}
        </div>
      )}

      {/* Список стран — 2 колонки */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "2px", width: "100%", maxWidth: "700px",
        background: "linear-gradient(180deg,rgba(2,9,34,0.97) 0%,rgba(3,13,44,0.95) 100%)",
        borderRadius: "6px",
        border: "1px solid rgba(14,56,138,0.55)",
        overflow: "hidden",
        boxShadow: "0 6px 40px rgba(0,0,0,0.7)",
      }}>
        {CONTESTANTS.map((c, idx) => {
          const isVoter   = c.id === voterCountryId;
          const isSelected = usedIds.has(c.id);
          const selPts    = selections.findIndex(s => s === c.id);
          const pts       = selPts >= 0 ? LOW_PTS[selPts] : null;
          const clickable = !isVoter && !isSelected && !allDone;
          const isLeft    = idx % 2 === 0;

          return (
            <div
              key={c.id}
              onClick={() => clickable && handleSelect(c.id)}
              style={{
                display: "flex", alignItems: "center",
                height: "44px", padding: "0 10px 0 8px",
                background: isSelected
                  ? "linear-gradient(90deg,rgba(15,105,255,0.45) 0%,rgba(6,52,180,0.28) 100%)"
                  : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                borderRight: isLeft ? "1px solid rgba(14,56,138,0.3)" : "none",
                cursor: clickable ? "pointer" : "default",
                opacity: isVoter ? 0.35 : isSelected || clickable ? 1 : 0.5,
                transition: "background 0.25s",
                userSelect: "none",
              }}
            >
              {/* Flag */}
              <div style={{
                width: "52px", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}>
                <span style={{ fontSize: "24px", lineHeight: 1 }}>{flagEmoji(c.cc)}</span>
                {pts !== null && (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 3,
                  }}>
                    <div style={{
                      width: "32px", height: "22px", borderRadius: "3px",
                      background: "rgba(0,10,40,0.75)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: "13px", color: "#fff",
                      textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      border: "1px solid rgba(80,140,255,0.3)",
                    }}>{pts}</div>
                  </div>
                )}
              </div>
              {/* Name */}
              <div style={{
                flex: 1, fontSize: "14px", fontWeight: 500,
                letterSpacing: "0.06em",
                color: isSelected ? "#fff" : "rgba(180,218,255,0.88)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>{c.name}</div>
            </div>
          );
        })}
      </div>

      {/* Кнопка подтверждения */}
      {allDone && (
        <button
          onClick={handleConfirm}
          style={{
            marginTop: "20px",
            background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border: "1.5px solid rgba(95,182,255,0.8)",
            borderRadius: "8px", padding: "14px 40px",
            color: "#fff", fontSize: "15px", fontWeight: 700,
            letterSpacing: "0.12em", cursor: "pointer",
            boxShadow: "0 0 22px rgba(0,120,255,0.5)",
            fontFamily: "'Montserrat',sans-serif",
            animation: "confirmPop 0.4s cubic-bezier(0.34,1.4,0.64,1) both",
          }}
        >
          CONFIRM — PROCEED TO 8 · 10 · 12
        </button>
      )}

      <style>{`
        @keyframes confirmPop {
          from { transform: scale(0.8); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}