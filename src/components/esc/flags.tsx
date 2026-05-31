// Встроенные SVG-флаги — полностью автономны, без интернета
// Каждый флаг — точная миниатюра государственного флага

import React from "react";

type FlagProps = {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  className?: string;
};

// ── Компонент-обёртка ──────────────────────────────────────────────────────
function Flag({ children, width = 40, height = 27, style, className }: FlagProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 40 27"
      width={width}
      height={height}
      style={{ borderRadius: "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.5)", display: "block", flexShrink: 0, ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  );
}

// ── Австрия (AT) — красный/белый/красный ──────────────────────────────────
export const AT = (p: FlagProps) => <Flag {...p}><rect width="40" height="27" fill="#ED2939"/><rect y="9" width="40" height="9" fill="#fff"/></Flag>;

// ── Азербайджан (AZ) ──────────────────────────────────────────────────────
export const AZ = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#0092BC"/>
  <rect y="9" width="40" height="9" fill="#E8192C"/>
  <rect y="18" width="40" height="9" fill="#00B050"/>
  <circle cx="19" cy="13.5" r="3.5" fill="#fff"/>
  <circle cx="20" cy="13.5" r="2.8" fill="#E8192C"/>
  <polygon points="22,10.5 22.8,12.5 25,12.5 23.3,13.8 24,16 22,14.8 20,16 20.7,13.8 19,12.5 21.2,12.5" fill="#fff" transform="translate(-1,0) scale(0.7)" />
</Flag>;

// ── Армения (AM) — красный/синий/оранжевый ───────────────────────────────
export const AM = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#D90012"/>
  <rect y="9" width="40" height="9" fill="#0033A0"/>
  <rect y="18" width="40" height="9" fill="#F2A800"/>
</Flag>;

// ── Дания (DK) ───────────────────────────────────────────────────────────
export const DK = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#C60C30"/>
  <rect x="13" width="5" height="27" fill="#fff"/>
  <rect y="11" width="40" height="5" fill="#fff"/>
</Flag>;

// ── Нидерланды (NL) ──────────────────────────────────────────────────────
export const NL = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#AE1C28"/>
  <rect y="9" width="40" height="9" fill="#fff"/>
  <rect y="18" width="40" height="9" fill="#21468B"/>
</Flag>;

// ── Венгрия (HU) ─────────────────────────────────────────────────────────
export const HU = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#CE2939"/>
  <rect y="9" width="40" height="9" fill="#fff"/>
  <rect y="18" width="40" height="9" fill="#477050"/>
</Flag>;

// ── Финляндия (FI) ───────────────────────────────────────────────────────
export const FI = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#fff"/>
  <rect x="10" width="7" height="27" fill="#003580"/>
  <rect y="10" width="40" height="7" fill="#003580"/>
</Flag>;

// ── Израиль (IL) ─────────────────────────────────────────────────────────
export const IL = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#fff"/>
  <rect y="4" width="40" height="3.5" fill="#0038A8"/>
  <rect y="19.5" width="40" height="3.5" fill="#0038A8"/>
  <polygon points="20,9 23.5,15.5 16.5,15.5" fill="none" stroke="#0038A8" strokeWidth="1.2"/>
  <polygon points="20,18 16.5,11.5 23.5,11.5" fill="none" stroke="#0038A8" strokeWidth="1.2"/>
</Flag>;

// ── Исландия (IS) ─────────────────────────────────────────────────────────
export const IS = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#003897"/>
  <rect x="11" width="7" height="27" fill="#fff"/>
  <rect y="10" width="40" height="7" fill="#fff"/>
  <rect x="13" width="3" height="27" fill="#D72828"/>
  <rect y="12" width="40" height="3" fill="#D72828"/>
</Flag>;

// ── Эстония (EE) ─────────────────────────────────────────────────────────
export const EE = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#0072CE"/>
  <rect y="9" width="40" height="9" fill="#000"/>
  <rect y="18" width="40" height="9" fill="#fff"/>
</Flag>;

// ── Норвегия (NO) ─────────────────────────────────────────────────────────
export const NO = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#EF2B2D"/>
  <rect x="11" width="7" height="27" fill="#fff"/>
  <rect y="10" width="40" height="7" fill="#fff"/>
  <rect x="13" width="3" height="27" fill="#002868"/>
  <rect y="12" width="40" height="3" fill="#002868"/>
</Flag>;

// ── Россия (RU) ──────────────────────────────────────────────────────────
export const RU = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#fff"/>
  <rect y="9" width="40" height="9" fill="#0039A6"/>
  <rect y="18" width="40" height="9" fill="#D52B1E"/>
</Flag>;

// ── Болгария (BG) ─────────────────────────────────────────────────────────
export const BG = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#fff"/>
  <rect y="9" width="40" height="9" fill="#00966E"/>
  <rect y="18" width="40" height="9" fill="#D62612"/>
</Flag>;

// ── Швейцария (CH) ────────────────────────────────────────────────────────
export const CH = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#FF0000"/>
  <rect x="17" y="6" width="6" height="15" fill="#fff"/>
  <rect x="11.5" y="10.5" width="17" height="6" fill="#fff"/>
</Flag>;

// ── Греция (GR) ──────────────────────────────────────────────────────────
export const GR = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#0D5EAF"/>
  <rect y="0" width="40" height="3" fill="#fff"/>
  <rect y="6" width="40" height="3" fill="#fff"/>
  <rect y="12" width="40" height="3" fill="#fff"/>
  <rect y="18" width="40" height="3" fill="#fff"/>
  <rect y="24" width="40" height="3" fill="#fff"/>
  <rect width="15" height="15" fill="#0D5EAF"/>
  <rect x="6" y="0" width="3" height="15" fill="#fff"/>
  <rect x="0" y="6" width="15" height="3" fill="#fff"/>
</Flag>;

// ── Португалия (PT) ───────────────────────────────────────────────────────
export const PT = (p: FlagProps) => <Flag {...p}>
  <rect width="16" height="27" fill="#006600"/>
  <rect x="16" width="24" height="27" fill="#FF0000"/>
  <circle cx="16" cy="13.5" r="5" fill="#FFD700" stroke="#006600" strokeWidth="0.5"/>
  <circle cx="16" cy="13.5" r="3.5" fill="#fff"/>
  <circle cx="16" cy="13.5" r="2" fill="#0033A0"/>
</Flag>;

// ── Швеция (SE) ───────────────────────────────────────────────────────────
export const SE = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#006AA7"/>
  <rect x="13" width="5" height="27" fill="#FECC02"/>
  <rect y="11" width="40" height="5" fill="#FECC02"/>
</Flag>;

// ── Испания (ES) ─────────────────────────────────────────────────────────
export const ES = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#AA151B"/>
  <rect y="6.75" width="40" height="13.5" fill="#F1BF00"/>
  <rect x="9" y="9" width="5" height="9" fill="#AA151B" opacity="0.6"/>
</Flag>;

// ── Великобритания (GB) ───────────────────────────────────────────────────
export const GB = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#012169"/>
  <line x1="0" y1="0" x2="40" y2="27" stroke="#fff" strokeWidth="5.4"/>
  <line x1="40" y1="0" x2="0" y2="27" stroke="#fff" strokeWidth="5.4"/>
  <line x1="0" y1="0" x2="40" y2="27" stroke="#C8102E" strokeWidth="3"/>
  <line x1="40" y1="0" x2="0" y2="27" stroke="#C8102E" strokeWidth="3"/>
  <rect x="16" width="8" height="27" fill="#fff"/>
  <rect y="9.5" width="40" height="8" fill="#fff"/>
  <rect x="17.5" width="5" height="27" fill="#C8102E"/>
  <rect y="11" width="40" height="5" fill="#C8102E"/>
</Flag>;

// ── Франция (FR) ─────────────────────────────────────────────────────────
export const FR = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#002395"/>
  <rect x="13.3" width="13.4" height="27" fill="#fff"/>
  <rect x="26.7" width="13.3" height="27" fill="#ED2939"/>
</Flag>;

// ── Германия (DE) ─────────────────────────────────────────────────────────
export const DE = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#000"/>
  <rect y="9" width="40" height="9" fill="#DD0000"/>
  <rect y="18" width="40" height="9" fill="#FFCE00"/>
</Flag>;

// ── Италия (IT) ───────────────────────────────────────────────────────────
export const IT = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#009246"/>
  <rect x="13.3" width="13.4" height="27" fill="#fff"/>
  <rect x="26.7" width="13.3" height="27" fill="#CE2B37"/>
</Flag>;

// ── Украина (UA) ─────────────────────────────────────────────────────────
export const UA = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="13.5" fill="#005BBB"/>
  <rect y="13.5" width="40" height="13.5" fill="#FFD500"/>
</Flag>;

// ── Мальта (MT) ──────────────────────────────────────────────────────────
export const MT = (p: FlagProps) => <Flag {...p}>
  <rect width="20" height="27" fill="#fff"/>
  <rect x="20" width="20" height="27" fill="#CF142B"/>
  <rect x="3" y="3" width="9" height="9" fill="#999" opacity="0.4"/>
  <rect x="4" y="4" width="7" height="7" fill="#ccc"/>
  <line x1="3" y1="3" x2="12" y2="12" stroke="#999" strokeWidth="1"/>
  <line x1="12" y1="3" x2="3" y2="12" stroke="#999" strokeWidth="1"/>
</Flag>;

// ── Польша (PL) ──────────────────────────────────────────────────────────
export const PL = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="13.5" fill="#fff"/>
  <rect y="13.5" width="40" height="13.5" fill="#DC143C"/>
</Flag>;

// ── Словения (SI) ─────────────────────────────────────────────────────────
export const SI = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#fff"/>
  <rect y="9" width="40" height="9" fill="#003DA5"/>
  <rect y="18" width="40" height="9" fill="#E8192C"/>
  <path d="M5,6 L8,14 L11,6 Z" fill="#003DA5"/>
  <path d="M6,9 L10,9" stroke="#FFD700" strokeWidth="1.5"/>
  <circle cx="8" cy="8" r="1.5" fill="#FFD700"/>
</Flag>;

// ── Албания (AL) ─────────────────────────────────────────────────────────
export const AL = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#E41E20"/>
  <text x="20" y="20" textAnchor="middle" fontSize="16" fill="#000">🦅</text>
</Flag>;

// ── Беларусь (BY) ─────────────────────────────────────────────────────────
export const BY = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#CF101A"/>
  <rect y="17" width="40" height="10" fill="#007228"/>
  <rect width="6" height="27" fill="#fff"/>
  <rect width="5" height="27" fill="#CF101A" opacity="0.4"/>
</Flag>;

// ── Бельгия (BE) ─────────────────────────────────────────────────────────
export const BE = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#000"/>
  <rect x="13.3" width="13.4" height="27" fill="#FAE042"/>
  <rect x="26.7" width="13.3" height="27" fill="#EF3340"/>
</Flag>;

// ── Хорватия (HR) ─────────────────────────────────────────────────────────
export const HR = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#FF0000"/>
  <rect y="9" width="40" height="9" fill="#fff"/>
  <rect y="18" width="40" height="9" fill="#0000CC"/>
  <rect x="16" y="4" width="8" height="10" fill="#fff" stroke="#FF0000" strokeWidth="0.5"/>
  <rect x="16" y="4" width="4" height="5" fill="#FF0000" opacity="0.6"/>
  <rect x="20" y="9" width="4" height="5" fill="#FF0000" opacity="0.6"/>
</Flag>;

// ── Кипр (CY) ─────────────────────────────────────────────────────────────
export const CY = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#fff"/>
  <ellipse cx="20" cy="12" rx="8" ry="5" fill="#FF8C00" opacity="0.85"/>
  <path d="M14,18 Q20,22 26,18" stroke="#00703C" strokeWidth="1.5" fill="none"/>
  <path d="M16,19 Q20,23 24,19" stroke="#00703C" strokeWidth="1.2" fill="none"/>
</Flag>;

// ── Латвия (LV) ──────────────────────────────────────────────────────────
export const LV = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#9E3039"/>
  <rect y="9.9" width="40" height="7.2" fill="#fff"/>
</Flag>;

// ── Литва (LT) ───────────────────────────────────────────────────────────
export const LT = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#FDB913"/>
  <rect y="9" width="40" height="9" fill="#006A44"/>
  <rect y="18" width="40" height="9" fill="#C1272D"/>
</Flag>;

// ── Молдова (MD) ─────────────────────────────────────────────────────────
export const MD = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#003DA5"/>
  <rect x="13.3" width="13.4" height="27" fill="#FFD100"/>
  <rect x="26.7" width="13.3" height="27" fill="#CC0001"/>
  <circle cx="20" cy="13.5" r="4" fill="#003DA5" opacity="0.7"/>
</Flag>;

// ── Черногория (ME) ───────────────────────────────────────────────────────
export const ME = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#D4AF37"/>
  <rect x="1.5" y="1.5" width="37" height="24" fill="#D4AF37" stroke="#D4003F" strokeWidth="2"/>
  <rect x="3" y="3" width="34" height="21" fill="#D4003F"/>
  <circle cx="20" cy="13.5" r="5" fill="#D4AF37"/>
</Flag>;

// ── Румыния (RO) ─────────────────────────────────────────────────────────
export const RO = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#002B7F"/>
  <rect x="13.3" width="13.4" height="27" fill="#FCD116"/>
  <rect x="26.7" width="13.3" height="27" fill="#CE1126"/>
</Flag>;

// ── Сан-Марино (SM) ───────────────────────────────────────────────────────
export const SM = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="13.5" fill="#5EB6E4"/>
  <rect y="13.5" width="40" height="13.5" fill="#fff"/>
  <circle cx="20" cy="13.5" r="5" fill="#5EB6E4" opacity="0.7"/>
  <rect x="18" y="9" width="4" height="9" fill="#5EB6E4"/>
  <rect x="16" y="17" width="8" height="1.5" fill="#5EB6E4"/>
</Flag>;

// ── Сербия (RS) ───────────────────────────────────────────────────────────
export const RS = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#C6363C"/>
  <rect y="9" width="40" height="9" fill="#0C4076"/>
  <rect y="18" width="40" height="9" fill="#fff"/>
  <circle cx="12" cy="13.5" r="4.5" fill="#C6363C" stroke="#FFD700" strokeWidth="0.8"/>
  <text x="12" y="16.5" textAnchor="middle" fontSize="6" fill="#FFD700">⚜</text>
</Flag>;

// ── Дополнительные страны ESC ─────────────────────────────────────────────

// Андорра (AD)
export const AD = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#003DA5"/>
  <rect x="13.3" width="13.4" height="27" fill="#FFD700"/>
  <rect x="26.7" width="13.3" height="27" fill="#C60B1E"/>
</Flag>;

// Австралия (AU)
export const AU = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#00008B"/>
  <rect x="0" y="0" width="20" height="13.5" fill="#00008B"/>
  <line x1="0" y1="0" x2="20" y2="13.5" stroke="#fff" strokeWidth="4"/>
  <line x1="20" y1="0" x2="0" y2="13.5" stroke="#fff" strokeWidth="4"/>
  <line x1="0" y1="0" x2="20" y2="13.5" stroke="#C8102E" strokeWidth="2.5"/>
  <line x1="20" y1="0" x2="0" y2="13.5" stroke="#C8102E" strokeWidth="2.5"/>
  <rect x="8" y="0" width="4" height="13.5" fill="#fff"/>
  <rect x="0" y="4.75" width="20" height="4" fill="#fff"/>
  <rect x="9" y="0" width="2" height="13.5" fill="#C8102E"/>
  <rect x="0" y="5.75" width="20" height="2" fill="#C8102E"/>
  <circle cx="30" cy="18" r="2" fill="#fff"/>
  <circle cx="35" cy="13" r="1.5" fill="#fff"/>
  <circle cx="37" cy="20" r="1.5" fill="#fff"/>
  <circle cx="32" cy="23" r="1.5" fill="#fff"/>
</Flag>;

// Босния и Герцеговина (BA)
export const BA = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#003DA5"/>
  <polygon points="10,0 32,0 32,27" fill="#FFD700"/>
  {[0,1,2,3,4,5,6,7].map(i => (
    <circle key={i} cx={12 + i*2.8} cy={i*3.2} r="1.2" fill="#fff"/>
  ))}
</Flag>;

// Чехия (CZ)
export const CZ = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="13.5" fill="#fff"/>
  <rect y="13.5" width="40" height="13.5" fill="#D7141A"/>
  <polygon points="0,0 20,13.5 0,27" fill="#11457E"/>
</Flag>;

// Грузия (GE)
export const GE = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#fff"/>
  <rect x="17" y="0" width="6" height="27" fill="#FF0000"/>
  <rect x="0" y="10.5" width="40" height="6" fill="#FF0000"/>
  <rect x="3" y="2" width="5" height="5" fill="#FF0000" opacity="0.7"/>
  <rect x="32" y="2" width="5" height="5" fill="#FF0000" opacity="0.7"/>
  <rect x="3" y="20" width="5" height="5" fill="#FF0000" opacity="0.7"/>
  <rect x="32" y="20" width="5" height="5" fill="#FF0000" opacity="0.7"/>
</Flag>;

// Ирландия (IE)
export const IE = (p: FlagProps) => <Flag {...p}>
  <rect width="13.3" height="27" fill="#169B62"/>
  <rect x="13.3" width="13.4" height="27" fill="#fff"/>
  <rect x="26.7" width="13.3" height="27" fill="#FF883E"/>
</Flag>;

// Люксембург (LU)
export const LU = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="9" fill="#EF3340"/>
  <rect y="9" width="40" height="9" fill="#fff"/>
  <rect y="18" width="40" height="9" fill="#00A3E0"/>
</Flag>;

// Монако (MC)
export const MC = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="13.5" fill="#CE1126"/>
  <rect y="13.5" width="40" height="13.5" fill="#fff"/>
</Flag>;

// Северная Македония (MK)
export const MK = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#CE2028"/>
  <circle cx="20" cy="13.5" r="5" fill="#FFD100"/>
  <line x1="0" y1="0" x2="40" y2="27" stroke="#FFD100" strokeWidth="3"/>
  <line x1="40" y1="0" x2="0" y2="27" stroke="#FFD100" strokeWidth="3"/>
  <line x1="20" y1="0" x2="20" y2="27" stroke="#FFD100" strokeWidth="3"/>
  <line x1="0" y1="13.5" x2="40" y2="13.5" stroke="#FFD100" strokeWidth="3"/>
  <circle cx="20" cy="13.5" r="5" fill="#FFD100"/>
  <circle cx="20" cy="13.5" r="3" fill="#CE2028"/>
</Flag>;

// Турция (TR)
export const TR = (p: FlagProps) => <Flag {...p}>
  <rect width="40" height="27" fill="#E30A17"/>
  <circle cx="17" cy="13.5" r="5.5" fill="#fff"/>
  <circle cx="18.8" cy="13.5" r="4.2" fill="#E30A17"/>
  <polygon points="24,13.5 27,12 26,14.5 27.5,16.5 25,15.5" fill="#fff"/>
</Flag>;

// ── Карта: cc → компонент ─────────────────────────────────────────────────
const FLAGS: Record<string, React.FC<FlagProps>> = {
  at: AT, az: AZ, am: AM, dk: DK, nl: NL, hu: HU,
  fi: FI, il: IL, is: IS, ee: EE, no: NO, ru: RU,
  bg: BG, ch: CH, gr: GR, pt: PT, se: SE, es: ES,
  gb: GB, fr: FR, de: DE, it: IT, ua: UA, mt: MT,
  pl: PL, si: SI, al: AL, by: BY, be: BE, hr: HR,
  cy: CY, lv: LV, lt: LT, md: MD, me: ME, ro: RO,
  sm: SM, rs: RS, mk: MK,
  // Дополнительные
  ad: AD, au: AU, ba: BA, cz: CZ, ge: GE, ie: IE,
  lu: LU, mc: MC, tr: TR,
};

// ── Главный компонент ─────────────────────────────────────────────────────
export function FlagSvg({ cc, width = 40, height = 27, style, className }: FlagProps & { cc: string }) {
  const code = cc.toLowerCase();
  const FlagComponent = FLAGS[code];
  if (!FlagComponent) {
    // Fallback — цветной прямоугольник с кодом
    return (
      <svg viewBox="0 0 40 27" width={width} height={height}
        style={{ borderRadius: "2px", display: "block", ...style }}
        className={className}>
        <rect width="40" height="27" fill="#334"/>
        <text x="20" y="17" textAnchor="middle" fontSize="9" fill="#aaa">{cc.toUpperCase()}</text>
      </svg>
    );
  }
  return <FlagComponent width={width} height={height} style={style} className={className} />;
}

export default FlagSvg;