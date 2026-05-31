export const POINTS_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12];

export const flagUrl = (cc: string) => `https://flagcdn.com/w80/${cc}.png`;

export const CONTESTANTS = [
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

export const VOTING_COUNTRIES = [
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

// Песни ESC 2014 для топ-3 и экрана 12 баллов
export const SONGS: Record<string, { song: string; artist: string; ytId: string }> = {
  AT: { song: "Rise Like a Phoenix",   artist: "Conchita Wurst",       ytId: "SaolVEJkjGo" },
  NL: { song: "Calm After the Storm",  artist: "The Common Linnets",   ytId: "jVkdW9bVNxM" },
  SE: { song: "Undo",                  artist: "Sanna Nielsen",        ytId: "3BbMhHPKJMo" },
  AM: { song: "Not Alone",             artist: "Aram MP3",             ytId: "vPNqg7GKPo0" },
  HU: { song: "Running",              artist: "András Kállay-Saunders",ytId: "iODGnBsxRzM" },
  NO: { song: "Silent Storm",          artist: "Carl Espen",           ytId: "I0xdRkSJwkw" },
  UA: { song: "Tick-Tock",             artist: "Mariya Yaremchuk",     ytId: "p4fj2JrKLuo" },
  RU: { song: "Shine",                 artist: "Tolmachevy Sisters",   ytId: "E-AGWpx4GMk" },
  CH: { song: "Hunter of Stars",       artist: "Sebalter",             ytId: "tpvdNRiDkFE" },
  IT: { song: "La mia città",          artist: "Emma",                 ytId: "4FcNzJV6JO0" },
  IS: { song: "No Prejudice",          artist: "Pollapönk",            ytId: "HKMNOEMCb4M" },
  ES: { song: "Say Yay!",              artist: "Ruth Lorenzo",         ytId: "2Jlt_dFYEeM" },
  AZ: { song: "Start a Fire",          artist: "Dilnoza Yusupova",     ytId: "9mzGRHGaEgk" },
  GB: { song: "Children of the Universe", artist: "Molly",            ytId: "7cHNImtZRR0" },
  DK: { song: "Cliché Love Song",      artist: "Basim",                ytId: "H3N3dBMdOas" },
  MT: { song: "Coming Home",           artist: "Firelight",            ytId: "E1N0jLq3tOQ" },
  DE: { song: "Is It Right",           artist: "Elaiza",               ytId: "EzPw1YjrQOM" },
  FR: { song: "Moustache",             artist: "Twin Twin",            ytId: "vFNi1XDFYcc" },
  GR: { song: "Rise Up",               artist: "Freaky Fortune ft. RiskyKidd", ytId: "CDNgc9XNM7w" },
  SI: { song: "Round and Round",       artist: "Tinkara Kovač",        ytId: "F8g5s5-LXQY" },
  SM: { song: "Maybe (Forse)",         artist: "Valentina Monetta",    ytId: "zZ5wy9TlB1M" },
  ME: { song: "Moj svijet",            artist: "Sergej Ćetković",      ytId: "0DGV0oqNLTs" },
  PL: { song: "My Słowianie – We Are Slavic", artist: "Donatan & Cleo", ytId: "KoqdePVlhOA" },
  FI: { song: "Something Better",      artist: "Softengine",           ytId: "n2vvkCpAQ3Q" },
  BG: { song: "Кажи ми защо",          artist: "Виктория Георгиева",   ytId: "G_M7WK-XVMw" },
  PT: { song: "Quero ser tua",         artist: "Suzy",                 ytId: "rJSjY5NHF0E" },
  IL: { song: "Same Heart",            artist: "Mei Finegold",         ytId: "xqOZHyFmAvQ" },
  EE: { song: "Amazing",              artist: "Tanja",                ytId: "OinoFVqYmSw" },
};

export type Entry = {
  id: string;
  name: string;
  cc: string;
  score: number;
  flashedByVoter: number | null;
  is12: boolean;
  coveredPts: number | null;
};

export type FlyBall = {
  id: number;
  pts: number;
  targetCc: string;
  x1: number; y1: number;
  x2: number; y2: number;
};

export type DouzeEvent = {
  receiverCc: string;
  receiverName: string;
  voterName: string;
  songTitle: string;
  artist: string;
  ytId: string;
} | null;