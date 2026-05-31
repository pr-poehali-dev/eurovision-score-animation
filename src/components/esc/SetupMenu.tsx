import { useState } from "react";
import FlagSvg from "./flags";

// Все страны, когда-либо участвовавшие в ESC (существующие геополитически)
export const ALL_ESC_COUNTRIES = [
  { id: "AL", name: "ALBANIA",         cc: "al" },
  { id: "AD", name: "ANDORRA",         cc: "ad" },
  { id: "AM", name: "ARMENIA",         cc: "am" },
  { id: "AU", name: "AUSTRALIA",       cc: "au" },
  { id: "AT", name: "AUSTRIA",         cc: "at" },
  { id: "AZ", name: "AZERBAIJAN",      cc: "az" },
  { id: "BY", name: "BELARUS",         cc: "by" },
  { id: "BE", name: "BELGIUM",         cc: "be" },
  { id: "BA", name: "BOSNIA & HERZ.",  cc: "ba" },
  { id: "BG", name: "BULGARIA",        cc: "bg" },
  { id: "HR", name: "CROATIA",         cc: "hr" },
  { id: "CY", name: "CYPRUS",          cc: "cy" },
  { id: "CZ", name: "CZECH REPUBLIC",  cc: "cz" },
  { id: "DK", name: "DENMARK",         cc: "dk" },
  { id: "EE", name: "ESTONIA",         cc: "ee" },
  { id: "FI", name: "FINLAND",         cc: "fi" },
  { id: "FR", name: "FRANCE",          cc: "fr" },
  { id: "GE", name: "GEORGIA",         cc: "ge" },
  { id: "DE", name: "GERMANY",         cc: "de" },
  { id: "GR", name: "GREECE",          cc: "gr" },
  { id: "HU", name: "HUNGARY",         cc: "hu" },
  { id: "IS", name: "ICELAND",         cc: "is" },
  { id: "IE", name: "IRELAND",         cc: "ie" },
  { id: "IL", name: "ISRAEL",          cc: "il" },
  { id: "IT", name: "ITALY",           cc: "it" },
  { id: "LV", name: "LATVIA",          cc: "lv" },
  { id: "LT", name: "LITHUANIA",       cc: "lt" },
  { id: "LU", name: "LUXEMBOURG",      cc: "lu" },
  { id: "MT", name: "MALTA",           cc: "mt" },
  { id: "MD", name: "MOLDOVA",         cc: "md" },
  { id: "MC", name: "MONACO",          cc: "mc" },
  { id: "ME", name: "MONTENEGRO",      cc: "me" },
  { id: "NL", name: "THE NETHERLANDS", cc: "nl" },
  { id: "MK", name: "NORTH MACEDONIA", cc: "mk" },
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
  { id: "TR", name: "TURKEY",          cc: "tr" },
  { id: "UA", name: "UKRAINE",         cc: "ua" },
  { id: "GB", name: "UNITED KINGDOM",  cc: "gb" },
];

export type CountryDef = { id: string; name: string; cc: string };

type Props = {
  onStart: (contestants: CountryDef[], voters: CountryDef[]) => void;
};

const MIN_CONTESTANTS = 6;
const MAX_CONTESTANTS = 26;

export default function SetupMenu({ onStart }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(ALL_ESC_COUNTRIES.slice(0, 26).map(c => c.id))
  );
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setError("");
  };

  const selectAll  = () => setSelected(new Set(ALL_ESC_COUNTRIES.map(c => c.id)));
  const clearAll   = () => setSelected(new Set());

  const filtered = ALL_ESC_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = () => {
    const contestants = ALL_ESC_COUNTRIES.filter(c => selected.has(c.id));
    if (contestants.length < MIN_CONTESTANTS) {
      setError(`Выбери минимум ${MIN_CONTESTANTS} стран`);
      return;
    }
    if (contestants.length > MAX_CONTESTANTS) {
      setError(`Максимум ${MAX_CONTESTANTS} стран`);
      return;
    }
    // Голосующие = все страны ESC
    const voters = ALL_ESC_COUNTRIES.filter(c => selected.has(c.id));
    onStart(contestants, voters);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Montserrat',sans-serif", color: "#fff",
      padding: "20px 16px",
      position: "relative", zIndex: 10,
    }}>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{
          fontSize: "clamp(22px,5vw,42px)", fontWeight: 900,
          letterSpacing: "0.06em",
          background: "linear-gradient(180deg,#fffbe0 0%,#FFD700 40%,#FF9500 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          filter: "drop-shadow(0 0 20px rgba(255,180,0,0.6))",
          lineHeight: 1.1, marginBottom: "8px",
        }}>
          EUROVISION SONG CONTEST
        </div>
        <div style={{ fontSize: "13px", letterSpacing: "0.25em", color: "rgba(140,200,255,0.6)" }}>
          SETUP · SELECT PARTICIPATING COUNTRIES
        </div>
      </div>

      <div style={{
        width: "100%", maxWidth: "860px",
        background: "rgba(2,8,32,0.92)",
        border: "1px solid rgba(30,80,200,0.45)",
        borderRadius: "12px",
        boxShadow: "0 8px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(60,140,255,0.12)",
        overflow: "hidden",
      }}>

        {/* Controls row */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          flexWrap: "wrap",
          padding: "14px 16px",
          borderBottom: "1px solid rgba(30,80,200,0.25)",
          background: "rgba(0,20,70,0.5)",
        }}>
          {/* Search */}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search country..."
            style={{
              flex: 1, minWidth: "160px",
              background: "rgba(0,20,80,0.8)",
              border: "1px solid rgba(60,120,255,0.4)",
              borderRadius: "6px", padding: "7px 12px",
              color: "#fff", fontSize: "13px",
              fontFamily: "'Montserrat',sans-serif",
              outline: "none",
            }}
          />
          <span style={{ fontSize: "12px", color: "rgba(140,200,255,0.55)", whiteSpace: "nowrap" }}>
            Selected: <strong style={{ color: "#7df8ff" }}>{selected.size}</strong> / {MIN_CONTESTANTS}–{MAX_CONTESTANTS}
          </span>
          <button onClick={selectAll} style={btnStyle("#0055cc","rgba(0,100,255,0.5)")}>ALL</button>
          <button onClick={clearAll}  style={btnStyle("#660000","rgba(200,0,0,0.4)")}>CLEAR</button>
        </div>

        {/* Country grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))",
          gap: "2px",
          maxHeight: "52vh",
          overflowY: "auto",
          padding: "4px",
        }}>
          {filtered.map(c => {
            const isOn = selected.has(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "7px 10px",
                  borderRadius: "6px",
                  background: isOn
                    ? "linear-gradient(90deg,rgba(0,80,220,0.45) 0%,rgba(0,50,160,0.3) 100%)"
                    : "rgba(255,255,255,0.02)",
                  border: isOn
                    ? "1px solid rgba(80,160,255,0.5)"
                    : "1px solid rgba(255,255,255,0.04)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  userSelect: "none",
                }}
              >
                <FlagSvg cc={c.cc} width={36} height={24} />
                <span style={{
                  fontSize: "12px", fontWeight: isOn ? 700 : 400,
                  letterSpacing: "0.05em",
                  color: isOn ? "#fff" : "rgba(160,210,255,0.65)",
                  flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {c.name}
                </span>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "4px",
                  border: isOn ? "2px solid #4af" : "1px solid rgba(100,150,255,0.3)",
                  background: isOn ? "rgba(0,120,255,0.7)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontSize: "11px", color: "#fff",
                }}>
                  {isOn ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: "14px 16px",
          borderTop: "1px solid rgba(30,80,200,0.25)",
          background: "rgba(0,20,70,0.5)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "10px",
        }}>
          {error && (
            <span style={{ fontSize: "12px", color: "#ff6666" }}>{error}</span>
          )}
          {!error && (
            <span style={{ fontSize: "11px", color: "rgba(100,180,255,0.4)", letterSpacing: "0.08em" }}>
              {selected.size < MIN_CONTESTANTS
                ? `Нужно ещё ${MIN_CONTESTANTS - selected.size} стран`
                : `Готово! Можно начинать.`}
            </span>
          )}
          <button
            onClick={handleStart}
            disabled={selected.size < MIN_CONTESTANTS || selected.size > MAX_CONTESTANTS}
            style={{
              background: selected.size >= MIN_CONTESTANTS && selected.size <= MAX_CONTESTANTS
                ? "linear-gradient(158deg,#FFD700 0%,#FF9200 100%)"
                : "rgba(80,80,80,0.4)",
              border: "none", borderRadius: "8px",
              padding: "12px 36px",
              color: selected.size >= MIN_CONTESTANTS ? "#000" : "rgba(255,255,255,0.3)",
              fontSize: "15px", fontWeight: 900,
              letterSpacing: "0.14em", cursor: selected.size >= MIN_CONTESTANTS ? "pointer" : "default",
              fontFamily: "'Montserrat',sans-serif",
              boxShadow: selected.size >= MIN_CONTESTANTS ? "0 0 24px rgba(255,180,0,0.5)" : "none",
              transition: "all 0.2s",
            }}
          >
            START VOTING ▶
          </button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(bg: string, border: string): React.CSSProperties {
  return {
    background: bg, border: `1px solid ${border}`,
    borderRadius: "6px", padding: "7px 14px",
    color: "#fff", fontSize: "11px", fontWeight: 700,
    letterSpacing: "0.1em", cursor: "pointer",
    fontFamily: "'Montserrat',sans-serif",
    whiteSpace: "nowrap" as const,
  };
}
