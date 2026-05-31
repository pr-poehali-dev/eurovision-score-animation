export default function EscBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Base dark gradient */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#030818 0%,#050d24 40%,#060f2a 70%,#030814 100%)" }} />

      {/* Slow sweep highlight */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(112deg, transparent 25%, rgba(0,70,200,0.07) 50%, transparent 75%)",
        animation: "bgSweep 9s ease-in-out infinite",
      }} />

      {/* Pulsing blue orb left */}
      <div style={{
        position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,55,190,0.2) 0%, transparent 68%)",
        left: "-8%", top: "15%",
        animation: "orb1 13s ease-in-out infinite",
      }} />

      {/* Pulsing purple orb right */}
      <div style={{
        position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(90,0,175,0.17) 0%, transparent 68%)",
        right: "-6%", top: "5%",
        animation: "orb2 17s ease-in-out infinite",
      }} />

      {/* Grid lines globe effect */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,80,200,0.04) 60px),
          repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,80,200,0.04) 60px)
        `,
      }} />

      {/* Stars */}
      {Array.from({ length: 55 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width:  i % 8 === 0 ? "2.5px" : "1.5px",
          height: i % 8 === 0 ? "2.5px" : "1.5px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.75)",
          left: `${(i * 41.3 + 5) % 100}%`,
          top:  `${(i * 23.7 + 3) % 62}%`,
          animation: `star ${2.2 + (i % 5) * 0.5}s ease-in-out ${(i * 0.27) % 3}s infinite`,
        }} />
      ))}

      {/* Bottom waves */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "230px" }}>
        <svg viewBox="0 0 1440 230" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3a0092" stopOpacity="0.85"/>
              <stop offset="50%" stopColor="#5800bb" stopOpacity="0.75"/>
              <stop offset="100%" stopColor="#3a0092" stopOpacity="0.85"/>
            </linearGradient>
            <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0022a0" stopOpacity="0.82"/>
              <stop offset="50%" stopColor="#0040cc" stopOpacity="0.68"/>
              <stop offset="100%" stopColor="#0022a0" stopOpacity="0.82"/>
            </linearGradient>
            <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#cc0088" stopOpacity="0.45"/>
              <stop offset="50%" stopColor="#ee00aa" stopOpacity="0.38"/>
              <stop offset="100%" stopColor="#cc0088" stopOpacity="0.45"/>
            </linearGradient>
          </defs>
          <path className="wave3" d="M0,135 C280,72 580,158 880,108 C1080,77 1300,120 1440,97 L1440,230 L0,230Z" fill="url(#wg3)"/>
          <path className="wave2" d="M0,153 C235,108 472,160 720,138 C970,115 1212,155 1440,138 L1440,230 L0,230Z" fill="url(#wg2)"/>
          <path className="wave1" d="M0,170 C352,150 712,175 1082,160 C1272,154 1372,166 1440,160 L1440,230 L0,230Z" fill="url(#wg1)"/>
        </svg>
      </div>

      {/* Glowing horizon */}
      <div style={{
        position: "absolute", bottom: "205px", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg,transparent 0%,rgba(0,130,255,0.55) 18%,rgba(150,40,255,0.65) 50%,rgba(0,130,255,0.55) 82%,transparent 100%)",
        filter: "blur(1.5px)",
      }} />
    </div>
  );
}
