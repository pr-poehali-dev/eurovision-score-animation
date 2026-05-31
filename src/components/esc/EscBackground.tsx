export default function EscBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>

      {/* Base — средне-синий, не тёмный */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(160deg, #0c1e6e 0%, #102480 25%, #152e96 50%, #0e2278 100%)",
      }} />

      {/* Светлый центральный блик сверху */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 90% 55% at 50% 10%, rgba(100,160,255,0.35) 0%, transparent 60%)",
      }} />

      {/* Aurora top-left — голубой */}
      <div style={{
        position: "absolute", width: "900px", height: "900px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(60,140,255,0.42) 0%, rgba(30,90,220,0.2) 45%, transparent 70%)",
        left: "-18%", top: "-20%",
        animation: "orb1 11s ease-in-out infinite",
        filter: "blur(6px)",
      }} />

      {/* Aurora right — фиолетово-розовый */}
      <div style={{
        position: "absolute", width: "700px", height: "700px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(160,80,255,0.36) 0%, rgba(100,40,220,0.18) 45%, transparent 70%)",
        right: "-12%", top: "-10%",
        animation: "orb2 15s ease-in-out infinite",
        filter: "blur(8px)",
      }} />

      {/* Centre light pulse */}
      <div style={{
        position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(100,160,255,0.22) 0%, transparent 65%)",
        left: "50%", top: "35%",
        transform: "translateX(-50%)",
        animation: "orb3 8s ease-in-out infinite",
        filter: "blur(12px)",
      }} />

      {/* Bright sweep beam */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, transparent 20%, rgba(0,120,255,0.13) 45%, rgba(120,0,255,0.1) 55%, transparent 80%)",
        animation: "bgSweep 7s ease-in-out infinite",
      }} />

      {/* Second sweep opposite direction */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(260deg, transparent 25%, rgba(200,0,255,0.07) 50%, transparent 75%)",
        animation: "bgSweep2 12s ease-in-out infinite",
      }} />

      {/* Grid lines — ярче */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,100,255,0.07) 60px),
          repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,100,255,0.07) 60px)
        `,
      }} />

      {/* Bright stars — больше и ярче */}
      {Array.from({ length: 80 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width:  i % 6 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1.5px",
          height: i % 6 === 0 ? "3px" : i % 3 === 0 ? "2px" : "1.5px",
          borderRadius: "50%",
          background: i % 6 === 0
            ? "rgba(255,220,100,0.95)"
            : "rgba(255,255,255,0.85)",
          left: `${(i * 37.3 + 7) % 100}%`,
          top:  `${(i * 21.7 + 5) % 65}%`,
          animation: `star ${1.8 + (i % 5) * 0.6}s ease-in-out ${(i * 0.23) % 3}s infinite`,
          boxShadow: i % 6 === 0 ? "0 0 4px rgba(255,220,100,0.8)" : "none",
        }} />
      ))}

      {/* Shooting star 1 */}
      <div style={{
        position: "absolute", width: "120px", height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
        top: "18%", left: "-5%",
        animation: "shoot1 9s linear 2s infinite",
        borderRadius: "1px",
        filter: "blur(0.5px)",
      }} />

      {/* Shooting star 2 */}
      <div style={{
        position: "absolute", width: "80px", height: "1.5px",
        background: "linear-gradient(90deg, transparent, rgba(180,140,255,0.9), transparent)",
        top: "42%", left: "-5%",
        animation: "shoot1 13s linear 6s infinite",
        borderRadius: "1px",
      }} />

      {/* Bottom waves — ярче */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "260px" }}>
        <svg viewBox="0 0 1440 260" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="wg1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4400bb" stopOpacity="0.95"/>
              <stop offset="50%" stopColor="#6600ee" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#4400bb" stopOpacity="0.95"/>
            </linearGradient>
            <linearGradient id="wg2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0033cc" stopOpacity="0.9"/>
              <stop offset="50%" stopColor="#0055ff" stopOpacity="0.78"/>
              <stop offset="100%" stopColor="#0033cc" stopOpacity="0.9"/>
            </linearGradient>
            <linearGradient id="wg3" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#cc0099" stopOpacity="0.65"/>
              <stop offset="50%" stopColor="#ee00bb" stopOpacity="0.55"/>
              <stop offset="100%" stopColor="#cc0099" stopOpacity="0.65"/>
            </linearGradient>
          </defs>
          <path className="wave3" d="M0,140 C280,75 580,165 880,112 C1080,80 1300,125 1440,100 L1440,260 L0,260Z" fill="url(#wg3)"/>
          <path className="wave2" d="M0,160 C235,112 472,168 720,144 C970,120 1212,162 1440,145 L1440,260 L0,260Z" fill="url(#wg2)"/>
          <path className="wave1" d="M0,180 C352,158 712,185 1082,168 C1272,162 1372,175 1440,168 L1440,260 L0,260Z" fill="url(#wg1)"/>
        </svg>
      </div>

      {/* Bright glowing horizon */}
      <div style={{
        position: "absolute", bottom: "232px", left: 0, right: 0, height: "3px",
        background: "linear-gradient(90deg,transparent 0%,rgba(0,160,255,0.8) 15%,rgba(180,50,255,0.9) 50%,rgba(0,160,255,0.8) 85%,transparent 100%)",
        filter: "blur(2px)",
        boxShadow: "0 0 20px rgba(100,100,255,0.5)",
      }} />

      {/* Extra glow line */}
      <div style={{
        position: "absolute", bottom: "232px", left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)",
        filter: "blur(0.5px)",
      }} />

      <style>{`
        @keyframes orb3 {
          0%,100% { transform: translateX(-50%) scale(1); opacity:0.7; }
          50%      { transform: translateX(-50%) scale(1.3); opacity:1; }
        }
        @keyframes bgSweep2 {
          0%,100% { transform: translateX(120%); }
          50%      { transform: translateX(-120%); }
        }
        @keyframes shoot1 {
          0%   { transform: translateX(0) translateY(0) rotate(15deg); opacity:0; }
          5%   { opacity:1; }
          30%  { transform: translateX(110vw) translateY(20px) rotate(15deg); opacity:0; }
          100% { transform: translateX(110vw) translateY(20px) rotate(15deg); opacity:0; }
        }
      `}</style>
    </div>
  );
}