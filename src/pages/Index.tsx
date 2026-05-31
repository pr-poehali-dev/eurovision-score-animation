import { useState, useRef, useCallback, useEffect } from "react";
import EscBackground from "@/components/esc/EscBackground";
import BottomPanel from "@/components/esc/BottomPanel";
import { ScoreRow, FlyBalls } from "@/components/esc/ScoreRow";
import VoterIntro from "@/components/esc/VoterIntro";
import PreSelectionScreen from "@/components/esc/PreSelectionScreen";
import {
  HIGH_POINTS, CONTESTANTS, VOTING_COUNTRIES, SONGS,
  Entry, FlyBall, DouzeEvent, PreVote, flagUrl,
} from "@/components/esc/types";

const FLY_MS           = 1400;
const COUNTUP_MS       = 1200;
const SORT_DELAY       = 400;
const NEXT_VOTER_DELAY = 2400;

// ─── Звуки ───────────────────────────────────────────────────────────────────

// Фанфара для 12 баллов
function playDouzeSound() {
  try {
    const ctx    = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * 1.5;
    const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    conv.buffer = buf;
    const wetG = ctx.createGain(); wetG.gain.value = 0.35;
    conv.connect(wetG); wetG.connect(master);
    const note = (freq: number, t: number, dur: number, vol = 0.5, type: OscillatorType = "sawtooth") => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      o.connect(g); g.connect(master); g.connect(conv);
      g.gain.setValueAtTime(0, ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + dur + 0.05);
    };
    note(392, 0.00, 0.22, 0.5); note(523, 0.18, 0.22, 0.5);
    note(659, 0.34, 0.22, 0.5); note(784, 0.48, 0.40, 0.6);
    note(1047, 0.62, 0.60, 0.55);
    note(523, 0.62, 0.80, 0.25, "sine");
    note(659, 0.62, 0.80, 0.20, "sine");
    note(784, 0.62, 0.80, 0.20, "sine");
  } catch (_e) { /* no audio */ }
}

// Воспроизвести фрагмент песни через YouTube IFrame Audio API — fallback: синтез мелодии
// Поскольку прямой MP3 недоступен, генерируем характерную мелодическую фразу
function playSongSnippet(countryId: string) {
  try {
    const ctx    = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * 2;
    const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
    conv.buffer = buf;
    const wetG = ctx.createGain(); wetG.gain.value = 0.4;
    conv.connect(wetG); wetG.connect(master);

    // Уникальные мелодические фразы для каждой страны (частоты нот)
    const melodies: Record<string, number[]> = {
      AT: [523,587,659,698,784,880,784,659],  // Rise Like a Phoenix — торжественно
      NL: [440,494,523,587,523,440,392,440],  // Calm After the Storm — меланхолично
      SE: [392,440,494,523,494,440,392,349],  // Undo — лирично
      AM: [440,523,587,659,784,659,587,523],  // Not Alone
      HU: [349,392,440,494,523,440,392,349],  // Running
      NO: [329,370,440,494,523,440,392,329],  // Silent Storm
      UA: [392,440,523,587,659,587,523,440],  // Tick-Tock
      RU: [523,587,659,784,880,784,659,587],  // Shine
      CH: [392,494,587,659,784,659,587,494],  // Hunter of Stars
      IT: [440,523,659,784,880,784,659,523],  // La mia città
    };
    const defaultMelody = [440,494,523,587,659,587,523,494];
    const notes = melodies[countryId] ?? defaultMelody;

    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      o.connect(g); g.connect(master); g.connect(conv);
      const t   = i * 0.22;
      const dur = 0.35;
      g.gain.setValueAtTime(0, ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + dur + 0.05);
    });
  } catch (_e) { /* no audio */ }
}

// ─── Сортировка с tiebreak ───────────────────────────────────────────────────
// При одинаковой сумме — смотрим сумму последних 3 полученных баллов
function sortEntries(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aRecent = a.recentPts.slice(-3).reduce((s, x) => s + x, 0);
    const bRecent = b.recentPts.slice(-3).reduce((s, x) => s + x, 0);
    if (bRecent !== aRecent) return bRecent - aRecent;
    return a.name.localeCompare(b.name);
  });
}

// ─── Вспомогательный тип сцены ───────────────────────────────────────────────
type Scene =
  | "intro"          // карта страны
  | "preselect"      // выбор стран для баллов 1-7
  | "preconfirm"     // показ итоговой таблицы 1-7 перед "влётом" в основную
  | "main";          // основная таблица (8, 10, 12)

export default function Index() {
  const [entries, setEntries] = useState<Entry[]>(
    CONTESTANTS.map(c => ({
      ...c, score: 0,
      flashedByVoter: null, is12: false, coveredPts: null,
      recentPts: [],
    }))
  );

  const [voterIdx, setVoterIdx]         = useState(0);
  const [scene, setScene]               = useState<Scene>("intro");
  const [tableVisible, setTableVisible] = useState(false);

  // preVotes[voterIdx] = подтверждённые голоса 1-7
  const [preVotes, setPreVotes]         = useState<Record<number, PreVote[]>>({});
  // highHistory[voterIdx] = [{countryId, pts}, ...] — история HIGH-баллов для отмены
  const [highHistory, setHighHistory]   = useState<Record<number, Array<{id: string; pts: number}>>>({});

  const [flyBalls, setFlyBalls]         = useState<FlyBall[]>([]);
  const [ballId, setBallId]             = useState(0);
  const [douzeEvent, setDouzeEvent]     = useState<DouzeEvent>(null);
  const [showTop3, setShowTop3]         = useState(false);
  const [blocked, setBlocked]           = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);

  const voter          = VOTING_COUNTRIES[voterIdx % VOTING_COUNTRIES.length];
  const curHistory     = highHistory[voterIdx] ?? [];
  const curHighCount   = curHistory.length;
  const nextHighPt     = curHighCount < HIGH_POINTS.length ? HIGH_POINTS[curHighCount] : null;
  const curHighGivenTo = new Set(curHistory.map(h => h.id));

  const maxScore  = Math.max(0, ...entries.map(e => e.score));
  const leaderIds = maxScore > 0
    ? new Set(entries.filter(e => e.score === maxScore).map(e => e.id))
    : new Set<string>();

  // ── Смена голосующего → сброс сцены
  useEffect(() => {
    setScene("intro");
    setTableVisible(false);
  }, [voterIdx]);

  // ── Карта завершена → переходим к preselect
  const handleIntroDone = useCallback(() => {
    setScene("preselect");
  }, []);

  // ── FLIP helpers ──────────────────────────────────────────────────────────
  const savePositions = useCallback((): Record<string, DOMRect> => {
    const pos: Record<string, DOMRect> = {};
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      pos[el.getAttribute("data-id")!] = el.getBoundingClientRect();
    });
    return pos;
  }, []);

  const runFlip = useCallback((old: Record<string, DOMRect>) => {
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      const id = el.getAttribute("data-id")!;
      const o  = old[id]; if (!o) return;
      const n  = el.getBoundingClientRect();
      const dx = o.left - n.left;
      const dy = o.top  - n.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el.style.position   = "relative";
      el.style.zIndex     = "200";
      el.style.transform  = `translate(${dx}px,${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform  = "translate(0,0)";
        el.style.transition = "transform 1.3s cubic-bezier(0.22,0.61,0.36,1)";
        setTimeout(() => {
          el.style.zIndex = ""; el.style.position = "";
          el.style.transform = ""; el.style.transition = "";
        }, 1400);
      }));
    });
  }, []);

  // ── Подтверждение выбора 1-7 ──────────────────────────────────────────────
  // После confirm → показываем "preconfirm" экран со сводкой, потом анимируем влёт
  const handlePreConfirm = useCallback((votes: PreVote[]) => {
    setPreVotes(prev => ({ ...prev, [voterIdx]: votes }));
    setScene("preconfirm");
  }, [voterIdx]);

  // ── Анимация влёта баллов 1-7 в основную таблицу ─────────────────────────
  const handleLaunchPreVotes = useCallback(() => {
    const votes = preVotes[voterIdx];
    if (!votes) return;
    setScene("main");
    setTableVisible(false);
    setTimeout(() => setTableVisible(true), 80);

    // Применяем баллы 1-7 один за другим с задержкой
    votes.forEach((vote, i) => {
      setTimeout(() => {
        const old = savePositions();
        setEntries(prev => {
          const updated = prev.map(e =>
            e.id === vote.countryId
              ? {
                  ...e,
                  score: e.score + vote.pts,
                  flashedByVoter: voterIdx,
                  is12: false,
                  coveredPts: vote.pts,
                  recentPts: [...e.recentPts, vote.pts],
                }
              : e
          );
          return sortEntries(updated);
        });
        requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));
        // Сбросить подсветку через 1.5s
        setTimeout(() => {
          setEntries(prev => prev.map(e =>
            e.id === vote.countryId && e.flashedByVoter === voterIdx
              ? { ...e, flashedByVoter: null, coveredPts: vote.pts } // coveredPts остаётся до конца
              : e
          ));
        }, 1500);
      }, i * 700); // каждые 700ms — один балл влетает
    });
  }, [preVotes, voterIdx, savePositions, runFlip]);

  // ── Отмена последнего голоса HIGH (8/10/12) ───────────────────────────────
  const handleUndoHigh = useCallback(() => {
    if (blocked) return;
    const hist = highHistory[voterIdx] ?? [];
    if (hist.length === 0) return;

    const last   = hist[hist.length - 1]; // {id, pts}
    const old    = savePositions();

    setEntries(prev => {
      const updated = prev.map(e =>
        e.id === last.id
          ? {
              ...e,
              score: e.score - last.pts,
              flashedByVoter: null,
              is12: false,
              coveredPts: null,
              recentPts: e.recentPts.slice(0, -1),
            }
          : e
      );
      return sortEntries(updated);
    });
    requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));

    setHighHistory(prev => ({ ...prev, [voterIdx]: hist.slice(0, -1) }));
  }, [blocked, highHistory, voterIdx, savePositions, runFlip]);

  // ── Клик по строке основной таблицы (баллы 8/10/12) ──────────────────────
  const handleMainClick = useCallback((targetId: string) => {
    if (blocked || !nextHighPt)            return;
    if (targetId === voter.id)             return;
    if (curHighGivenTo.has(targetId))      return;

    const flagEl = containerRef.current?.querySelector<HTMLElement>(`[data-flag="${targetId}"]`);
    if (!flagEl) return;
    const fr = flagEl.getBoundingClientRect();
    const pr = panelRef.current?.getBoundingClientRect();
    const sx = pr ? pr.left + pr.width  / 2 : window.innerWidth  / 2;
    const sy = pr ? pr.top  + pr.height / 2 : window.innerHeight - 80;

    const pts         = nextHighPt;
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

    const newHistory = [...(highHistory[voterIdx] ?? []), { id: targetId, pts }];
    const isLast     = newHistory.length >= HIGH_POINTS.length;
    setHighHistory(prev => ({ ...prev, [voterIdx]: newHistory }));

    // ① Шар летит и приземляется
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== nb.id));
      setEntries(prev => prev.map(e =>
        e.id === targetId
          ? {
              ...e,
              score: e.score + pts,
              flashedByVoter: voterIdx,
              is12: pts === 12,
              coveredPts: pts,
              recentPts: [...e.recentPts, pts],
            }
          : e
      ));

      // 12 баллов → экран + мелодия
      if (pts === 12) {
        playDouzeSound();
        playSongSnippet(targetId);
        const song = SONGS[targetId];
        setDouzeEvent({
          receiverCc:   targetCc,
          receiverName: targetEntry?.name ?? targetId,
          voterName:    voter.name,
          songTitle:    song?.song   ?? "",
          artist:       song?.artist ?? "",
          ytId:         song?.ytId   ?? "",
        });
      }

      // ② После countup → sort + FLIP
      setTimeout(() => {
        const old = savePositions();
        setEntries(prev => sortEntries(prev));
        requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));

        // ③ Последний высокий балл → сброс + следующий
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
  }, [
    blocked, nextHighPt, voter.id, voter.name, curHighGivenTo,
    ballId, highHistory, voterIdx, entries, savePositions, runFlip,
  ]);

  const half  = Math.ceil(entries.length / 2);
  const left  = entries.slice(0, half);
  const right = entries.slice(half);
  const top3  = [...entries].sort((a, b) => b.score - a.score).slice(0, 3);

  // ── Экран 12 баллов ───────────────────────────────────────────────────────
  if (douzeEvent) {
    const ev = douzeEvent;
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
          maxWidth: "600px", padding: "32px 24px",
          animation: "tableSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) forwards",
        }}>
          <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
            <div style={{
              position: "absolute", inset: "-20px",
              background: "radial-gradient(circle,rgba(255,180,0,0.35) 0%,transparent 70%)",
              borderRadius: "50%", animation: "glow12 1.5s ease-in-out infinite alternate",
            }}/>
            <img src={flagUrl(ev.receiverCc)} alt={ev.receiverName}
              style={{ width: "200px", height: "133px", objectFit: "cover", borderRadius: "6px",
                boxShadow: "0 0 40px rgba(255,180,0,0.7),0 8px 30px rgba(0,0,0,0.6)",
                display: "block", position: "relative", zIndex: 1 }}/>
          </div>
          <div style={{
            fontSize: "clamp(38px,8vw,76px)", fontWeight: 900, letterSpacing: "0.04em",
            background: "linear-gradient(180deg,#fffbc0 0%,#FFD700 42%,#FF9200 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 0 30px rgba(255,185,0,0.97))",
            lineHeight: 1, marginBottom: "14px",
          }}>DOUZE POINTS!</div>
          <div style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "0.1em", marginBottom: "6px" }}>{ev.receiverName}</div>
          {ev.songTitle && <div style={{ fontSize: "16px", color: "rgba(200,230,255,0.8)", marginBottom: "4px" }}>«{ev.songTitle}»</div>}
          {ev.artist    && <div style={{ fontSize: "13px", color: "rgba(150,200,255,0.6)", marginBottom: "20px" }}>{ev.artist}</div>}
          <div style={{ fontSize: "12px", color: "rgba(150,200,255,0.5)", marginBottom: "28px", letterSpacing: "0.08em" }}>
            12 points from <strong style={{ color: "#a6d8ff" }}>{ev.voterName}</strong>
          </div>
          <button onClick={() => setDouzeEvent(null)} style={{
            background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border: "1.5px solid rgba(95,182,255,0.8)", borderRadius: "8px",
            padding: "13px 36px", color: "#fff", fontSize: "14px", fontWeight: 700,
            letterSpacing: "0.12em", cursor: "pointer",
            boxShadow: "0 0 22px rgba(0,120,255,0.5)",
            fontFamily: "'Montserrat',sans-serif", transition: "transform 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
            CONTINUE VOTING
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── TOP 3 ─────────────────────────────────────────────────────────────────
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
          animation: "tableSlideIn 0.5s ease both",
        }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.3em", color: "rgba(100,178,255,0.5)", marginBottom: "12px" }}>
            EUROVISION 2014 · CURRENT TOP 3
          </div>
          <div style={{
            fontSize: "clamp(28px,6vw,50px)", fontWeight: 900, letterSpacing: "0.04em",
            background: "linear-gradient(180deg,#fffbc0 0%,#FFD700 60%,#FF9200 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 0 18px rgba(255,180,0,0.7))", marginBottom: "26px",
          }}>TOP 3 RESULTS</div>
          {top3.map((e, idx) => {
            const song = SONGS[e.id]; const medals = ["🥇","🥈","🥉"];
            return (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", gap: "16px",
                background: idx === 0 ? "linear-gradient(90deg,rgba(200,90,0,0.35) 0%,rgba(100,40,0,0.2) 100%)" : "rgba(255,255,255,0.04)",
                border: idx === 0 ? "1px solid rgba(255,180,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px", padding: "14px 18px", marginBottom: "10px", textAlign: "left",
              }}>
                <div style={{ fontSize: "30px", flexShrink: 0 }}>{medals[idx]}</div>
                <img src={flagUrl(e.cc)} alt={e.name} style={{ width: "52px", height: "34px", objectFit: "cover", borderRadius: "3px", boxShadow: "0 1px 6px rgba(0,0,0,0.6)", flexShrink: 0 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.07em" }}>{e.name}</div>
                  {song && <div style={{ fontSize: "12px", color: "rgba(180,218,255,0.7)", marginTop: "2px" }}>«{song.song}» — {song.artist}</div>}
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: idx === 0 ? "#FFD700" : "#70c2f0", flexShrink: 0 }}>{e.score}</div>
              </div>
            );
          })}
          <button onClick={() => setShowTop3(false)} style={{
            marginTop: "14px", background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border: "1.5px solid rgba(95,182,255,0.8)", borderRadius: "8px",
            padding: "11px 28px", color: "#fff", fontSize: "13px", fontWeight: 700,
            letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Montserrat',sans-serif",
            boxShadow: "0 0 16px rgba(0,120,255,0.5)",
          }}>← BACK TO SCOREBOARD</button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Экран preconfirm: сводка 1-7 перед влётом ────────────────────────────
  if (scene === "preconfirm") {
    const votes = preVotes[voterIdx] ?? [];
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
          maxWidth: "600px", padding: "28px 20px",
          animation: "tableSlideIn 0.5s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <img src={flagUrl(voter.cc)} alt={voter.name}
              style={{ width: "38px", height: "25px", objectFit: "cover", borderRadius: "2px" }}/>
            <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "0.1em", color: "#a6d8ff" }}>{voter.name}</span>
          </div>
          <div style={{ fontSize: "10px", letterSpacing: "0.22em", color: "rgba(100,178,255,0.45)", marginBottom: "22px" }}>
            POINTS 1 – 7 · READY TO ENTER THE SCOREBOARD
          </div>
          {/* Список 7 стран с баллами — в порядке 7→1 */}
          {[...votes].reverse().map(v => {
            const c = CONTESTANTS.find(x => x.id === v.countryId);
            if (!c) return null;
            return (
              <div key={v.countryId} style={{
                display: "flex", alignItems: "center", gap: "14px",
                background: "rgba(15,105,255,0.12)",
                border: "1px solid rgba(40,100,255,0.2)",
                borderRadius: "8px", padding: "10px 16px", marginBottom: "8px",
                animation: "tableSlideIn 0.4s ease both",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                  background: "radial-gradient(circle at 35% 28%,#c8eeff 0%,#38aaff 38%,#0044cc 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "16px", color: "#fff",
                  boxShadow: "0 0 10px rgba(40,140,255,0.6)",
                }}>{v.pts}</div>
                <img src={flagUrl(c.cc)} alt={c.name}
                  style={{ width: "44px", height: "29px", objectFit: "cover", borderRadius: "3px", flexShrink: 0, boxShadow: "0 1px 5px rgba(0,0,0,0.5)" }}/>
                <div style={{ flex: 1, textAlign: "left", fontSize: "15px", fontWeight: 600, letterSpacing: "0.06em" }}>{c.name}</div>
              </div>
            );
          })}
          <button onClick={handleLaunchPreVotes} style={{
            marginTop: "18px",
            background: "linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border: "1.5px solid rgba(95,182,255,0.8)", borderRadius: "8px",
            padding: "14px 40px", color: "#fff", fontSize: "15px", fontWeight: 700,
            letterSpacing: "0.12em", cursor: "pointer",
            boxShadow: "0 0 22px rgba(0,120,255,0.5)",
            fontFamily: "'Montserrat',sans-serif",
          }}>
            ENTER SCOREBOARD →
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Карта / preselect / основная таблица ──────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", fontFamily: "'Montserrat',sans-serif",
      color: "#fff", position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column", alignItems: "center",
      background: "#030817",
    }}>
      <EscBackground />

      {/* Карта */}
      {scene === "intro" && (
        <VoterIntro
          voterCc={voter.cc} voterName={voter.name}
          voterIdx={voterIdx} total={VOTING_COUNTRIES.length}
          onDone={handleIntroDone}
        />
      )}

      {/* Выбор стран для 1-7 */}
      {scene === "preselect" && (
        <PreSelectionScreen
          voterCc={voter.cc}
          voterName={voter.name}
          voterCountryId={voter.id}
          onConfirm={handlePreConfirm}
        />
      )}

      {/* Основная таблица (видна только в main) */}
      <div style={{
        position: "relative", zIndex: 10,
        width: "100%", maxWidth: "1000px",
        padding: "12px 14px 22px",
        flex: 1, display: "flex", flexDirection: "column",
        opacity:    (scene === "main" && tableVisible) ? 1 : 0,
        transform:  (scene === "main" && tableVisible) ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
        pointerEvents: scene === "main" ? "auto" : "none",
      }}>
        {/* Title + TOP3 + UNDO */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "10px", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.26em",
            color: "rgba(100,178,255,0.44)", fontWeight: 600, textTransform: "uppercase" }}>
            Eurovision Song Contest 2014 · Grand Final
          </div>
          <button onClick={() => setShowTop3(true)} style={{
            background: "linear-gradient(158deg,rgba(13,44,115,0.9) 0%,rgba(5,22,70,0.95) 100%)",
            border: "1px solid rgba(60,130,255,0.4)", borderRadius: "6px",
            padding: "5px 12px", color: "rgba(140,200,255,0.85)",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em",
            cursor: "pointer", fontFamily: "'Montserrat',sans-serif",
            transition: "border-color 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(100,180,255,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(60,130,255,0.4)")}>
            TOP 3 ▶
          </button>
          {/* Кнопка отмены последнего HIGH балла */}
          {curHighCount > 0 && !blocked && (
            <button onClick={handleUndoHigh} style={{
              background: "rgba(255,80,80,0.12)",
              border: "1px solid rgba(255,80,80,0.35)", borderRadius: "6px",
              padding: "5px 12px", color: "rgba(255,120,120,0.85)",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
              cursor: "pointer", fontFamily: "'Montserrat',sans-serif",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.22)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,80,80,0.12)")}>
              ↩ UNDO LAST
            </button>
          )}
        </div>

        {/* Scoreboard */}
        <div style={{
          background: "linear-gradient(180deg,rgba(2,9,34,0.97) 0%,rgba(3,13,44,0.95) 100%)",
          borderRadius: "6px 6px 0 0",
          border: "1px solid rgba(14,56,138,0.58)", borderBottom: "none",
          overflow: "visible", position: "relative",
          boxShadow: "0 8px 55px rgba(0,0,0,0.78),inset 0 1px 0 rgba(45,115,255,0.13)",
        }}>
          <div ref={containerRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ borderRight: "1px solid rgba(14,56,138,0.38)" }}>
              {left.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={curHighGivenTo.has(e.id)}
                  hasNext={!!nextHighPt}
                  onClick={handleMainClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
            <div>
              {right.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={e.id === voter.id}
                  alreadyVoted={curHighGivenTo.has(e.id)}
                  hasNext={!!nextHighPt}
                  onClick={handleMainClick}
                  isLeader={leaderIds.has(e.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <BottomPanel voterIdx={voterIdx} highCount={curHighCount} nextPt={nextHighPt} panelRef={panelRef} />
      </div>

      <FlyBalls balls={flyBalls} />
      <EscStyles />
    </div>
  );
}

function EscStyles() {
  return (
    <style>{`
      @keyframes escFly {
        0%   { transform:translate(0,0) scale(1);    opacity:1; }
        72%  { opacity:1; }
        100% { transform:translate(var(--dx),var(--dy)) scale(0.85); opacity:0; }
      }
      @keyframes tableSlideIn {
        from { opacity:0; transform:translateY(20px) scale(0.98); }
        to   { opacity:1; transform:translateY(0)    scale(1); }
      }
      @keyframes glow12 {
        from { opacity:0.5; transform:scale(0.9); }
        to   { opacity:1;   transform:scale(1.1); }
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