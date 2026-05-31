import { useState, useRef, useCallback } from "react";
import EscBackground from "@/components/esc/EscBackground";
import BottomPanel from "@/components/esc/BottomPanel";
import { ScoreRow, FlyBalls } from "@/components/esc/ScoreRow";
import {
  POINTS_ORDER, CONTESTANTS, VOTING_COUNTRIES, SONGS,
  Entry, FlyBall, DouzeEvent, flagUrl,
} from "@/components/esc/types";

// ── Шаги анимации одного голосования ──
// "fly"      → шар летит к флагу (1.4s)
// "flash"    → строка меняет цвет (мгновенно после приземления)
// "countup"  → счётчик накручивается (1.2s)
// "sort"     → перестройка таблицы (1s)
const FLY_MS      = 1400;
const COUNTUP_MS  = 1200;
const SORT_DELAY  = 400;  // задержка после countup до перестройки
const NEXT_VOTER_DELAY = 2200;

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>(
    CONTESTANTS.map(c => ({
      ...c, score: 0,
      flashedByVoter: null, is12: false, coveredPts: null,
    }))
  );

  const [voterIdx, setVoterIdx]         = useState(0);
  const [givenTo, setGivenTo]           = useState<Record<number, Set<string>>>({});
  const [awardedCount, setAwardedCount] = useState<Record<number, number>>({});
  const [flyBalls, setFlyBalls]         = useState<FlyBall[]>([]);
  const [ballId, setBallId]             = useState(0);
  const [douzeEvent, setDouzeEvent]     = useState<DouzeEvent>(null);
  const [showTop3, setShowTop3]         = useState(false);
  const [blocked, setBlocked]           = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);

  const voter        = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const count        = awardedCount[voterIdx] ?? 0;
  const nextPt       = count < POINTS_ORDER.length ? POINTS_ORDER[count] : null;
  const voterGivenTo = givenTo[voterIdx] ?? new Set<string>();

  const maxScore  = Math.max(0, ...entries.map(e => e.score));
  const leaderIds = maxScore > 0
    ? new Set(entries.filter(e => e.score === maxScore).map(e => e.id))
    : new Set<string>();

  // ── FLIP — плавная перестройка строк ──
  const savePositions = useCallback((): Record<string, number> => {
    const pos: Record<string, number> = {};
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      pos[el.getAttribute("data-id")!] = el.getBoundingClientRect().top;
    });
    return pos;
  }, []);

  const runFlip = useCallback((old: Record<string, number>) => {
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      const id = el.getAttribute("data-id")!;
      const dy = (old[id] ?? 0) - el.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) return;
      // Поднимаем z-index движущейся строки поверх остальных
      el.style.zIndex    = "50";
      el.style.transform  = `translateY(${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform  = "translateY(0)";
        el.style.transition = "transform 1.2s cubic-bezier(0.22,0.61,0.36,1)";
        setTimeout(() => { el.style.zIndex = ""; }, 1300);
      }));
    });
  }, []);

  // ── CLICK ──
  const handleClick = useCallback((targetId: string) => {
    if (blocked || !nextPt)             return;
    if (targetId === voter.id)          return;
    if (voterGivenTo.has(targetId))     return;

    const flagEl = containerRef.current?.querySelector<HTMLElement>(`[data-flag="${targetId}"]`);
    if (!flagEl) return;
    const fr = flagEl.getBoundingClientRect();
    const pr = panelRef.current?.getBoundingClientRect();
    const sx = pr ? pr.left + pr.width  / 2 : window.innerWidth  / 2;
    const sy = pr ? pr.top  + pr.height / 2 : window.innerHeight - 80;

    const pts     = nextPt;
    const targetEntry = entries.find(e => e.id === targetId);
    const targetCc    = targetEntry?.cc ?? "un";

    const nb: FlyBall = {
      id: ballId, pts, targetCc,
      x1: sx, y1: sy,
      x2: fr.left + fr.width  / 2,
      y2: fr.top  + fr.height / 2,
    };

    setBlocked(true);
    setBallId(b => b + 1);
    setFlyBalls(prev => [...prev, nb]);

    const newCount = count + 1;
    const isLast   = newCount >= POINTS_ORDER.length;

    setAwardedCount(prev => ({ ...prev, [voterIdx]: newCount }));
    setGivenTo(prev => {
      const s = new Set(prev[voterIdx] ?? new Set<string>());
      s.add(targetId);
      return { ...prev, [voterIdx]: s };
    });

    // ① Шар долетел → флаг закрыт + строка подсвечивается
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== nb.id));

      // Обновляем флаг-cover и flash, но НЕ сортируем ещё
      setEntries(prev => prev.map(e =>
        e.id === targetId
          ? { ...e, score: e.score + pts, flashedByVoter: voterIdx, is12: pts === 12, coveredPts: pts }
          : e
      ));

      // ② 12 баллов → показать экран с песней
      if (pts === 12) {
        const song = SONGS[targetId];
        setDouzeEvent({
          receiverCc:   targetCc,
          receiverName: targetEntry?.name ?? targetId,
          voterName:    voter.name,
          songTitle:    song?.song    ?? "",
          artist:       song?.artist  ?? "",
          ytId:         song?.ytId    ?? "",
        });
      }

      // ③ После countup → сортировка + FLIP
      setTimeout(() => {
        const old = savePositions();
        setEntries(prev => {
          const sorted = [...prev].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
          return sorted;
        });
        requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));

        // ④ Последний балл → сброс flash через паузу
        if (isLast) {
          setTimeout(() => {
            setEntries(prev => prev.map(e =>
              e.flashedByVoter === voterIdx
                ? { ...e, flashedByVoter: null, is12: false, coveredPts: null }
                : e
            ));
            setVoterIdx(v => v + 1);
          }, NEXT_VOTER_DELAY);
        }

        setBlocked(false);
      }, COUNTUP_MS + SORT_DELAY);

    }, FLY_MS);
  }, [blocked, nextPt, voter.id, voter.name, voterGivenTo, ballId, count, voterIdx, entries, savePositions, runFlip]);

  const half  = Math.ceil(entries.length / 2);
  const left  = entries.slice(0, half);
  const right = entries.slice(half);

  const top3 = [...entries]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ── Экран 12 баллов ──
  if (douzeEvent) {
    const song = douzeEvent;
    return (
      <div style={{
        minHeight: "100vh", background: "#030817",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Montserrat',sans-serif", color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <EscBackground />
        <div style={{
          position: "relative", zIndex: 10, textAlign: "center",
          maxWidth: "760px", padding: "24px 20px",
          animation: "escDouze 0.6s cubic-bezier(0.34,1.2,0.64,1) forwards",
        }}>
          {/* Douze badge */}
          <div style={{
            fontSize: "clamp(44px,9vw,82px)", fontWeight: 900,
            letterSpacing: "0.04em",
            background: "linear-gradient(180deg,#fffbc0 0%,#FFD700 42%,#FF9200 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 0 34px rgba(255,185,0,0.97))",
            lineHeight: 1, marginBottom: "18px",
          }}>DOUZE POINTS!</div>

          {/* Flag big */}
          <img
            src={flagUrl(song.receiverCc)}
            alt={song.receiverName}
            style={{ width: "180px", height: "120px", objectFit: "cover", borderRadius: "6px",
              boxShadow: "0 0 40px rgba(255,180,0,0.6)", marginBottom: "14px", display: "block", margin: "0 auto 14px" }}
          />

          {/* Country name */}
          <div style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "0.12em", marginBottom: "6px" }}>
            {song.receiverName}
          </div>

          {/* Song info */}
          {song.songTitle && (
            <div style={{ fontSize: "16px", color: "rgba(200,230,255,0.8)", marginBottom: "4px" }}>
              «{song.songTitle}»
            </div>
          )}
          {song.artist && (
            <div style={{ fontSize: "14px", color: "rgba(150,200,255,0.6)", marginBottom: "18px" }}>
              {song.artist}
            </div>
          )}

          {/* YouTube embed */}
          {song.ytId && (
            <div style={{ marginBottom: "18px", borderRadius: "8px", overflow: "hidden",
              boxShadow: "0 4px 30px rgba(0,0,0,0.6)" }}>
              <iframe
                width="560" height="315"
                src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1&start=30`}
                title="ESC 2014"
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{ display: "block", maxWidth: "100%", border: "none" }}
              />
            </div>
          )}

          {/* Voter credit */}
          <div style={{ fontSize: "13px", color: "rgba(150,200,255,0.55)", marginBottom: "24px" }}>
            12 points from <strong style={{ color: "#a6d8ff" }}>{song.voterName}</strong>
          </div>

          {/* Continue button */}
          <button
            onClick={() => setDouzeEvent(null)}
            style={{
              background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
              border: "1.5px solid rgba(95,182,255,0.8)",
              borderRadius: "8px", padding: "12px 32px",
              color: "#fff", fontSize: "15px", fontWeight: 700,
              letterSpacing: "0.1em", cursor: "pointer",
              boxShadow: "0 0 20px rgba(0,120,255,0.5)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            CONTINUE VOTING
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Экран ТОП-3 ──
  if (showTop3) {
    return (
      <div style={{
        minHeight: "100vh", background: "#030817",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Montserrat',sans-serif", color: "#fff",
        position: "relative", overflow: "hidden",
      }}>
        <EscBackground />
        <div style={{
          position: "relative", zIndex: 10, textAlign: "center",
          maxWidth: "800px", padding: "24px 20px",
        }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.3em", color: "rgba(100,178,255,0.5)", marginBottom: "14px" }}>
            EUROVISION 2014 · CURRENT TOP 3
          </div>
          <div style={{ fontSize: "clamp(28px,6vw,52px)", fontWeight: 900, letterSpacing: "0.04em",
            background: "linear-gradient(180deg,#fffbc0 0%,#FFD700 60%,#FF9200 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(255,180,0,0.7))",
            marginBottom: "28px",
          }}>TOP 3 RESULTS</div>

          {top3.map((e, idx) => {
            const song = SONGS[e.id];
            const medals = ["🥇","🥈","🥉"];
            return (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: idx === 0
                  ? "linear-gradient(90deg,rgba(200,90,0,0.35) 0%,rgba(100,40,0,0.2) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: idx === 0 ? "1px solid rgba(255,180,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", padding: "14px 18px", marginBottom: "12px",
                textAlign: "left",
              }}>
                <div style={{ fontSize: "32px", flexShrink: 0 }}>{medals[idx]}</div>
                <img src={flagUrl(e.cc)} alt={e.name}
                  style={{ width: "52px", height: "34px", objectFit: "cover", borderRadius: "3px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.6)", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "0.07em" }}>{e.name}</div>
                  {song && (
                    <div style={{ fontSize: "13px", color: "rgba(180,218,255,0.7)", marginTop: "2px" }}>
                      «{song.song}» — {song.artist}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: idx === 0 ? "#FFD700" : "#70c2f0", flexShrink: 0 }}>
                  {e.score}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setShowTop3(false)}
            style={{
              marginTop: "16px",
              background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
              border: "1.5px solid rgba(95,182,255,0.8)",
              borderRadius: "8px", padding: "11px 28px",
              color: "#fff", fontSize: "14px", fontWeight: 700,
              letterSpacing: "0.1em", cursor: "pointer",
              boxShadow: "0 0 18px rgba(0,120,255,0.5)",
            }}
          >
            ← BACK TO SCOREBOARD
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Основная таблица ──
  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Montserrat',sans-serif",
      color: "#fff", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "#030817",
    }}>
      <EscBackground />

      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "1000px",
        padding: "12px 14px 22px",
        flex: 1, display: "flex", flexDirection: "column",
      }}>

        {/* Title + Top3 button */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "10px", gap: "16px" }}>
          <div style={{
            fontSize: "11px", letterSpacing: "0.26em",
            color: "rgba(100,178,255,0.44)", fontWeight: 600, textTransform: "uppercase",
          }}>
            Eurovision Song Contest 2014 · Grand Final
          </div>
          <button
            onClick={() => setShowTop3(true)}
            style={{
              background: "linear-gradient(158deg,rgba(13,44,115,0.9) 0%,rgba(5,22,70,0.95) 100%)",
              border: "1px solid rgba(60,130,255,0.4)",
              borderRadius: "6px", padding: "5px 14px",
              color: "rgba(140,200,255,0.85)", fontSize: "10px",
              fontWeight: 700, letterSpacing: "0.12em",
              cursor: "pointer", transition: "all 0.2s",
              fontFamily: "'Montserrat',sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(100,180,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(60,130,255,0.4)")}
          >
            TOP 3 ▶
          </button>
        </div>

        {/* Scoreboard */}
        <div style={{
          background: "linear-gradient(180deg,rgba(2,9,34,0.97) 0%,rgba(3,13,44,0.95) 100%)",
          borderRadius: "6px 6px 0 0",
          border: "1px solid rgba(14,56,138,0.58)", borderBottom: "none",
          overflow: "visible",
          boxShadow: "0 8px 55px rgba(0,0,0,0.78), inset 0 1px 0 rgba(45,115,255,0.13)",
          position: "relative",
        }}>
          <div ref={containerRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(14,56,138,0.38)" }}>
              {left.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={voterGivenTo.has(e.id)}
                  hasNext={!!nextPt}
                  onClick={handleClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
            <div>
              {right.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={voterGivenTo.has(e.id)}
                  hasNext={!!nextPt}
                  onClick={handleClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <BottomPanel
          voterIdx={voterIdx}
          count={count}
          nextPt={nextPt}
          panelRef={panelRef}
        />
      </div>

      <FlyBalls balls={flyBalls} />
      <EscStyles />
    </div>
  );
}

// ── Глобальные стили ──
function EscStyles() {
  return (
    <style>{`
      @keyframes escFly {
        0%   { transform:translate(0,0) scale(1); opacity:1; }
        70%  { opacity:1; }
        100% { transform:translate(var(--dx),var(--dy)) scale(0.85); opacity:0; }
      }
      @keyframes escDouze {
        0%   { transform:scale(0.3) rotate(-3deg); opacity:0; }
        65%  { transform:scale(1.08) rotate(1deg); opacity:1; }
        100% { transform:scale(1) rotate(0deg); opacity:1; }
      }
      @keyframes bgSweep {
        0%,100% { transform:translateX(-120%); }
        50%      { transform:translateX(120%); }
      }
      @keyframes orb1 {
        0%,100% { transform:translate(0,0) scale(1); opacity:.7; }
        50%      { transform:translate(55px,-38px) scale(1.14); opacity:1; }
      }
      @keyframes orb2 {
        0%,100% { transform:translate(0,0) scale(1); opacity:.6; }
        50%      { transform:translate(-45px,28px) scale(1.1); opacity:.9; }
      }
      @keyframes star {
        0%,100% { opacity:.25; transform:scale(1); }
        50%      { opacity:1;   transform:scale(1.9); }
      }
      @keyframes flagWave {
        0%   { transform:skewX(0deg) scaleX(1); }
        18%  { transform:skewX(2.5deg) scaleX(1.025); }
        38%  { transform:skewX(-2deg) scaleX(0.99); }
        58%  { transform:skewX(1.8deg) scaleX(1.015); }
        78%  { transform:skewX(-1.2deg) scaleX(1); }
        100% { transform:skewX(0deg) scaleX(1); }
      }
      .wave1 { animation: wm1 7s ease-in-out infinite; }
      .wave2 { animation: wm2 9s ease-in-out infinite; }
      .wave3 { animation: wm3 11s ease-in-out infinite; }
      @keyframes wm1 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-28px)} }
      @keyframes wm2 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(22px)} }
      @keyframes wm3 { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-16px)} }
      [data-id]:hover { filter:brightness(1.09); }
    `}</style>
  );
}