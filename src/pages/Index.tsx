import { useState, useRef, useCallback, useEffect } from "react";
import EscBackground from "@/components/esc/EscBackground";
import BottomPanel from "@/components/esc/BottomPanel";
import { ScoreRow, FlyBalls } from "@/components/esc/ScoreRow";
import VoterIntro from "@/components/esc/VoterIntro";
import PreSelectionScreen from "@/components/esc/PreSelectionScreen";
import SetupMenu, { CountryDef } from "@/components/esc/SetupMenu";
import {
  HIGH_POINTS, SONGS,
  Entry, FlyBall, DouzeEvent, PreVote,
} from "@/components/esc/types";
import FlagSvg from "@/components/esc/flags";

const FLY_MS           = 1400;
const COUNTUP_MS       = 1200;
const SORT_DELAY       = 400;
const NEXT_VOTER_DELAY = 2400;

// ─── Фанфара победителя ───────────────────────────────────────────────────
function playWinnerFanfare() {
  try {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.32;
    master.connect(ctx.destination);
    const conv = ctx.createConvolver();
    const len  = ctx.sampleRate * 2.5;
    const buf  = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    }
    conv.buffer = buf;
    const wet = ctx.createGain(); wet.gain.value = 0.4;
    conv.connect(wet); wet.connect(master);

    const note = (f: number, t: number, d: number, v = 0.5, type: OscillatorType = "sawtooth") => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = f;
      o.connect(g); g.connect(master); g.connect(conv);
      g.gain.setValueAtTime(0, ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(v, ctx.currentTime + t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + d + 0.05);
    };
    // Торжественные фанфары
    note(392,0,0.2,0.5); note(523,0.18,0.2,0.5); note(659,0.34,0.2,0.55);
    note(784,0.50,0.25,0.6); note(1047,0.70,0.35,0.65);
    note(1319,0.95,0.8,0.6);
    // Аккорд
    [523,659,784,1047].forEach((f,i) => note(f, 1.0+i*0.04, 1.2, 0.3, "sine"));
    // Второй всплеск
    note(784,1.6,0.2,0.5); note(1047,1.8,0.2,0.55); note(1319,2.0,1.0,0.65);
    [659,784,1047,1319].forEach((f,i) => note(f, 2.05+i*0.03, 1.5, 0.28, "sine"));
  } catch (_e) { /* no audio */ }
}

// ─── Фанфара 12 баллов ────────────────────────────────────────────────────
function playDouzeSound() {
  try {
    const ctx = new AudioContext();
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
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      o.connect(g); g.connect(master); g.connect(conv);
      g.gain.setValueAtTime(0, ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + dur);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + dur + 0.05);
    };
    note(392,0,0.22,0.5); note(523,0.18,0.22,0.5);
    note(659,0.34,0.22,0.5); note(784,0.48,0.40,0.6);
    note(1047,0.62,0.60,0.55);
    note(523,0.62,0.80,0.25,"sine"); note(659,0.62,0.80,0.20,"sine"); note(784,0.62,0.80,0.20,"sine");
  } catch (_e) { /* no audio */ }
}

function playSongSnippet(countryId: string) {
  try {
    const ctx = new AudioContext();
    const master = ctx.createGain(); master.gain.value = 0.22;
    master.connect(ctx.destination);
    const melodies: Record<string, number[]> = {
      AT: [523,587,659,698,784,880,784,659], NL: [440,494,523,587,523,440,392,440],
      SE: [392,440,494,523,494,440,392,349], AM: [440,523,587,659,784,659,587,523],
      HU: [349,392,440,494,523,440,392,349], NO: [329,370,440,494,523,440,392,329],
      UA: [392,440,523,587,659,587,523,440], RU: [523,587,659,784,880,784,659,587],
    };
    const notes = melodies[countryId] ?? [440,494,523,587,659,587,523,494];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq;
      o.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, ctx.currentTime + i*0.22);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i*0.22 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.22 + 0.35);
      o.start(ctx.currentTime + i*0.22); o.stop(ctx.currentTime + i*0.22 + 0.4);
    });
  } catch (_e) { /* no audio */ }
}

function sortEntries(list: Entry[]): Entry[] {
  return [...list].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aR = a.recentPts.slice(-3).reduce((s,x) => s+x, 0);
    const bR = b.recentPts.slice(-3).reduce((s,x) => s+x, 0);
    if (bR !== aR) return bR - aR;
    return a.name.localeCompare(b.name);
  });
}

type Scene = "setup" | "intro" | "preselect" | "preconfirm" | "main" | "winner";

export default function Index() {
  // ── Состояние игры ─────────────────────────────────────────────────────
  const [scene, setScene]               = useState<Scene>("setup");
  const [contestants, setContestants]   = useState<CountryDef[]>([]);
  const [voters, setVoters]             = useState<CountryDef[]>([]);
  const [entries, setEntries]           = useState<Entry[]>([]);
  const [voterIdx, setVoterIdx]         = useState(0);
  const [tableVisible, setTableVisible] = useState(false);
  const [preVotes, setPreVotes]         = useState<Record<number, PreVote[]>>({});
  const [highHistory, setHighHistory]   = useState<Record<number, Array<{id: string; pts: number}>>>({});
  const [flyBalls, setFlyBalls]         = useState<FlyBall[]>([]);
  const [ballId, setBallId]             = useState(0);
  const [douzeEvent, setDouzeEvent]     = useState<DouzeEvent>(null);
  const [showTop5, setShowTop5]         = useState(false);
  const [blocked, setBlocked]           = useState(false);
  // Для анимации строки при 8/10/12: id строки которая сейчас "выдвигается"
  const [rowPushId, setRowPushId]       = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef     = useRef<HTMLDivElement>(null);

  const voter          = voters[voterIdx % Math.max(voters.length, 1)];
  const curHistory     = highHistory[voterIdx] ?? [];
  const curHighCount   = curHistory.length;
  const nextHighPt     = curHighCount < HIGH_POINTS.length ? HIGH_POINTS[curHighCount] : null;
  const curHighGivenTo = new Set(curHistory.map(h => h.id));

  const maxScore  = Math.max(0, ...entries.map(e => e.score));
  const leaderIds = maxScore > 0
    ? new Set(entries.filter(e => e.score === maxScore).map(e => e.id))
    : new Set<string>();

  // ── Старт игры из меню ────────────────────────────────────────────────
  const handleStart = useCallback((c: CountryDef[], v: CountryDef[]) => {
    setContestants(c);
    setVoters(v);
    setEntries(c.map(x => ({ ...x, score: 0, flashedByVoter: null, is12: false, coveredPts: null, recentPts: [] })));
    setVoterIdx(0);
    setScene("intro");
    setTableVisible(false);
  }, []);

  // ── Смена голосующего → сброс сцены ──────────────────────────────────
  useEffect(() => {
    if (scene === "setup" || scene === "winner") return;
    // Все проголосовали → финал
    if (voterIdx >= voters.length && voters.length > 0) {
      setScene("winner");
      setTimeout(() => playWinnerFanfare(), 600);
      return;
    }
    setScene("intro");
    setTableVisible(false);
  }, [voterIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIntroDone = useCallback(() => setScene("preselect"), []);

  // ── FLIP helpers ───────────────────────────────────────────────────────
  const savePositions = useCallback((): Record<string, DOMRect> => {
    const pos: Record<string, DOMRect> = {};
    containerRef.current?.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      pos[el.getAttribute("data-id")!] = el.getBoundingClientRect();
    });
    return pos;
  }, []);

  const runFlip = useCallback((old: Record<string, DOMRect>, duration = 1300) => {
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll<HTMLElement>("[data-id]").forEach(el => {
      const id = el.getAttribute("data-id")!;
      const o = old[id]; if (!o) return;
      const n = el.getBoundingClientRect();
      const dx = o.left - n.left, dy = o.top - n.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      // Строки с высокими баллами (coveredPts >= 8) летят поверх всей таблицы
      const coveredPts = parseInt(el.getAttribute("data-covered") ?? "0", 10);
      const flyZ = coveredPts >= 8 ? "500" : "200";
      el.style.position = "relative"; el.style.zIndex = flyZ;
      el.style.transform = `translate(${dx}px,${dy}px)`;
      el.style.transition = "none";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.transform = "translate(0,0)";
        el.style.transition = `transform ${duration}ms cubic-bezier(0.22,0.61,0.36,1)`;
        setTimeout(() => {
          el.style.zIndex = ""; el.style.position = "";
          el.style.transform = ""; el.style.transition = "";
        }, duration + 100);
      }));
    });
  }, []);

  // ── Подтверждение 1-7 ─────────────────────────────────────────────────
  const handlePreConfirm = useCallback((votes: PreVote[]) => {
    setPreVotes(prev => ({ ...prev, [voterIdx]: votes }));
    setScene("preconfirm");
  }, [voterIdx]);

  // ── Влёт баллов 1-7 ───────────────────────────────────────────────────
  const handleLaunchPreVotes = useCallback(() => {
    const votes = preVotes[voterIdx];
    if (!votes) return;
    setScene("main");
    setTableVisible(false);
    setTimeout(() => setTableVisible(true), 80);
    setTimeout(() => {
      const old = savePositions();
      setEntries(prev => {
        let upd = [...prev];
        votes.forEach(vote => {
          upd = upd.map(e => e.id === vote.countryId
            ? { ...e, score: e.score + vote.pts, flashedByVoter: voterIdx, coveredPts: vote.pts, recentPts: [...e.recentPts, vote.pts] }
            : e
          );
        });
        return sortEntries(upd);
      });
      requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old, 2200)));
    }, 600);
  }, [preVotes, voterIdx, savePositions, runFlip]);

  // ── Отмена HIGH балла ──────────────────────────────────────────────────
  const handleUndoHigh = useCallback(() => {
    if (blocked) return;
    const hist = highHistory[voterIdx] ?? [];
    if (hist.length === 0) return;
    const last = hist[hist.length - 1];
    const old  = savePositions();
    setEntries(prev => sortEntries(prev.map(e =>
      e.id === last.id
        ? { ...e, score: e.score - last.pts, flashedByVoter: null, is12: false, coveredPts: null, recentPts: e.recentPts.slice(0,-1) }
        : e
    )));
    requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));
    setHighHistory(prev => ({ ...prev, [voterIdx]: hist.slice(0,-1) }));
  }, [blocked, highHistory, voterIdx, savePositions, runFlip]);

  // ── Клик по строке (8/10/12) ──────────────────────────────────────────
  const handleMainClick = useCallback((targetId: string) => {
    if (blocked || !nextHighPt)       return;
    if (!voter || targetId===voter.id) return;
    if (curHighGivenTo.has(targetId)) return;

    const flagEl = containerRef.current?.querySelector<HTMLElement>(`[data-flag="${targetId}"]`);
    if (!flagEl) return;
    const fr = flagEl.getBoundingClientRect();
    const pr = panelRef.current?.getBoundingClientRect();
    const sx = pr ? pr.left + pr.width/2  : window.innerWidth/2;
    const sy = pr ? pr.top  + pr.height/2 : window.innerHeight - 80;

    const pts = nextHighPt;
    const targetEntry = entries.find(e => e.id === targetId);
    const targetCc    = targetEntry?.cc ?? "un";

    const nb: FlyBall = { id: ballId, pts, targetCc, x1: sx, y1: sy, x2: fr.left + fr.width/2, y2: fr.top + fr.height/2 };

    setBlocked(true);
    setBallId(b => b+1);
    setFlyBalls(prev => [...prev, nb]);

    const newHistory = [...(highHistory[voterIdx]??[]), { id: targetId, pts }];
    const isLast = newHistory.length >= HIGH_POINTS.length;
    setHighHistory(prev => ({ ...prev, [voterIdx]: newHistory }));

    // ① Шар летит (FLY_MS)
    setTimeout(() => {
      setFlyBalls(prev => prev.filter(b => b.id !== nb.id));

      // ② Строка выдвигается вперёд + окрашивается слева направо
      setRowPushId(targetId);
      setEntries(prev => prev.map(e =>
        e.id === targetId
          ? { ...e, score: e.score + pts, flashedByVoter: voterIdx, is12: pts===12, coveredPts: pts, recentPts: [...e.recentPts, pts] }
          : e
      ));

      if (pts === 12) { playDouzeSound(); playSongSnippet(targetId); }

      // ③ После выдвижения (800ms) → строка летит на новое место
      setTimeout(() => {
        setRowPushId(null);
        const old = savePositions();
        setEntries(prev => sortEntries(prev));
        requestAnimationFrame(() => requestAnimationFrame(() => runFlip(old)));

        if (pts === 12) {
          const song = SONGS[targetId];
          setTimeout(() => setDouzeEvent({
            receiverCc: targetCc, receiverName: targetEntry?.name ?? targetId,
            voterName: voter?.name ?? "", songTitle: song?.song ?? "", artist: song?.artist ?? "", ytId: song?.ytId ?? "",
          }), 400);
        }

        if (isLast) {
          setTimeout(() => {
            setEntries(prev => prev.map(e =>
              e.flashedByVoter === voterIdx ? { ...e, flashedByVoter: null, is12: false, coveredPts: null } : e
            ));
            setVoterIdx(v => v + 1);
          }, NEXT_VOTER_DELAY);
        }
        setBlocked(false);
      }, COUNTUP_MS + SORT_DELAY);

    }, FLY_MS);
  }, [blocked, nextHighPt, voter, curHighGivenTo, ballId, highHistory, voterIdx, entries, savePositions, runFlip]);

  const half  = Math.ceil(entries.length / 2);
  const left  = entries.slice(0, half);
  const right = entries.slice(half);
  const top5  = [...entries].sort((a,b) => b.score - a.score).slice(0, 5);
  const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];

  // ════════════════════════════════════════════════════════════════
  // СЦЕНЫ
  // ════════════════════════════════════════════════════════════════

  // ── Меню выбора стран ──────────────────────────────────────────
  if (scene === "setup") {
    return (
      <div style={{ minHeight:"100vh", position:"relative", overflow:"hidden", background:"#00063a" }}>
        <EscBackground />
        <SetupMenu onStart={handleStart} />
        <EscStyles />
      </div>
    );
  }

  // ── Финальный экран победителя ──────────────────────────────────
  if (scene === "winner") {
    const winner = top5[0];
    return (
      <div style={{ minHeight:"100vh", background:"#00063a", position:"relative", overflow:"hidden",
        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
        fontFamily:"'Montserrat',sans-serif", color:"#fff" }}>
        <EscBackground />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:"700px", padding:"28px 20px",
          animation:"tableSlideIn 0.7s cubic-bezier(0.34,1.2,0.64,1) both" }}>

          {/* Winner banner */}
          <div style={{ fontSize:"clamp(14px,3vw,20px)", letterSpacing:"0.3em",
            color:"rgba(255,220,80,0.7)", marginBottom:"10px" }}>
            🎉 EUROVISION SONG CONTEST · WINNER 🎉
          </div>
          <div style={{ position:"relative", display:"inline-block", marginBottom:"18px" }}>
            <div style={{ position:"absolute", inset:"-30px",
              background:"radial-gradient(circle,rgba(255,200,0,0.4) 0%,transparent 70%)",
              borderRadius:"50%", animation:"glow12 1.2s ease-in-out infinite alternate" }}/>
            <FlagSvg cc={winner?.cc ?? "eu"} width={220} height={146}
              style={{ borderRadius:"8px", boxShadow:"0 0 50px rgba(255,200,0,0.8),0 10px 40px rgba(0,0,0,0.7)",
                position:"relative", zIndex:1 }} />
          </div>
          <div style={{ fontSize:"clamp(28px,7vw,60px)", fontWeight:900, letterSpacing:"0.06em",
            background:"linear-gradient(180deg,#fffbe0 0%,#FFD700 40%,#FF9200 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            filter:"drop-shadow(0 0 30px rgba(255,185,0,0.9))", lineHeight:1, marginBottom:"8px" }}>
            {winner?.name}
          </div>
          {SONGS[winner?.id ?? ""] && (
            <div style={{ fontSize:"16px", color:"rgba(200,230,255,0.8)", marginBottom:"4px" }}>
              «{SONGS[winner.id].song}» — {SONGS[winner.id].artist}
            </div>
          )}
          <div style={{ fontSize:"22px", fontWeight:700, color:"#7df8ff", marginBottom:"24px" }}>
            {winner?.score} points
          </div>

          {/* Топ-5 */}
          <div style={{ marginBottom:"20px" }}>
            {top5.slice(1).map((e, idx) => {
              const song = SONGS[e.id];
              return (
                <div key={e.id} style={{ display:"flex", alignItems:"center", gap:"12px",
                  background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)",
                  borderRadius:"8px", padding:"10px 16px", marginBottom:"6px", textAlign:"left" }}>
                  <div style={{ fontSize:"22px", flexShrink:0 }}>{medals[idx+1]}</div>
                  <FlagSvg cc={e.cc} width={44} height={29} style={{ flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"14px", fontWeight:700, letterSpacing:"0.06em" }}>{e.name}</div>
                    {song && <div style={{ fontSize:"11px", color:"rgba(170,210,255,0.65)" }}>«{song.song}»</div>}
                  </div>
                  <div style={{ fontSize:"18px", fontWeight:700, color:"#70c2f0", flexShrink:0 }}>{e.score}</div>
                </div>
              );
            })}
          </div>

          <button onClick={() => setScene("setup")} style={{
            background:"linear-gradient(158deg,#FFD700 0%,#FF9200 100%)",
            border:"none", borderRadius:"8px", padding:"13px 36px",
            color:"#000", fontSize:"14px", fontWeight:900,
            letterSpacing:"0.14em", cursor:"pointer",
            fontFamily:"'Montserrat',sans-serif",
            boxShadow:"0 0 28px rgba(255,180,0,0.6)",
          }}>
            PLAY AGAIN ↺
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Экран 12 баллов ────────────────────────────────────────────
  if (douzeEvent) {
    const ev = douzeEvent;
    return (
      <div style={{ minHeight:"100vh", background:"#00063a", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", fontFamily:"'Montserrat',sans-serif", color:"#fff",
        position:"relative", overflow:"hidden" }}>
        <EscBackground />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:"600px", padding:"32px 24px",
          animation:"tableSlideIn 0.6s cubic-bezier(0.34,1.2,0.64,1) forwards" }}>
          <div style={{ position:"relative", display:"inline-block", marginBottom:"20px" }}>
            <div style={{ position:"absolute", inset:"-20px",
              background:"radial-gradient(circle,rgba(255,180,0,0.35) 0%,transparent 70%)",
              borderRadius:"50%", animation:"glow12 1.5s ease-in-out infinite alternate" }}/>
            <FlagSvg cc={ev.receiverCc} width={200} height={133}
              style={{ position:"relative", zIndex:1, borderRadius:"6px",
                boxShadow:"0 0 40px rgba(255,180,0,0.7),0 8px 30px rgba(0,0,0,0.6)" }} />
          </div>
          <div style={{ fontSize:"clamp(38px,8vw,76px)", fontWeight:900, letterSpacing:"0.04em",
            background:"linear-gradient(180deg,#fffbc0 0%,#FFD700 42%,#FF9200 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            filter:"drop-shadow(0 0 30px rgba(255,185,0,0.97))",
            lineHeight:1, marginBottom:"14px" }}>DOUZE POINTS!</div>
          <div style={{ fontSize:"26px", fontWeight:900, letterSpacing:"0.1em", marginBottom:"6px" }}>{ev.receiverName}</div>
          {ev.songTitle && <div style={{ fontSize:"16px", color:"rgba(200,230,255,0.8)", marginBottom:"4px" }}>«{ev.songTitle}»</div>}
          {ev.artist    && <div style={{ fontSize:"13px", color:"rgba(150,200,255,0.6)", marginBottom:"20px" }}>{ev.artist}</div>}
          <div style={{ fontSize:"12px", color:"rgba(150,200,255,0.5)", marginBottom:"28px", letterSpacing:"0.08em" }}>
            12 points from <strong style={{ color:"#a6d8ff" }}>{ev.voterName}</strong>
          </div>
          <button onClick={() => setDouzeEvent(null)} style={{
            background:"linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border:"1.5px solid rgba(95,182,255,0.8)", borderRadius:"8px",
            padding:"13px 36px", color:"#fff", fontSize:"14px", fontWeight:700,
            letterSpacing:"0.12em", cursor:"pointer",
            boxShadow:"0 0 22px rgba(0,120,255,0.5)",
            fontFamily:"'Montserrat',sans-serif", transition:"transform 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.transform="scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}>
            CONTINUE VOTING
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── ТОП-5 ──────────────────────────────────────────────────────
  if (showTop5) {
    return (
      <div style={{ minHeight:"100vh", background:"#00063a", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", fontFamily:"'Montserrat',sans-serif", color:"#fff",
        position:"relative", overflow:"hidden" }}>
        <EscBackground />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:"800px", padding:"24px 20px",
          animation:"tableSlideIn 0.5s ease both" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.3em", color:"rgba(100,178,255,0.5)", marginBottom:"12px" }}>
            CURRENT STANDINGS
          </div>
          <div style={{ fontSize:"clamp(28px,6vw,50px)", fontWeight:900, letterSpacing:"0.04em",
            background:"linear-gradient(180deg,#fffbc0 0%,#FFD700 60%,#FF9200 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            filter:"drop-shadow(0 0 18px rgba(255,180,0,0.7))", marginBottom:"26px" }}>TOP 5</div>
          {top5.map((e, idx) => {
            const song = SONGS[e.id];
            return (
              <div key={e.id} style={{
                display:"flex", alignItems:"center", gap:"16px",
                background: idx===0
                  ? "linear-gradient(90deg,rgba(200,90,0,0.35) 0%,rgba(100,40,0,0.2) 100%)"
                  : "rgba(255,255,255,0.04)",
                border: idx===0 ? "1px solid rgba(255,180,0,0.3)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius:"10px", padding:"14px 18px", marginBottom:"10px", textAlign:"left" }}>
                <div style={{ fontSize:"28px", flexShrink:0 }}>{medals[idx]}</div>
                <FlagSvg cc={e.cc} width={52} height={34} style={{ flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"16px", fontWeight:700, letterSpacing:"0.07em" }}>{e.name}</div>
                  {song && <div style={{ fontSize:"12px", color:"rgba(180,218,255,0.7)", marginTop:"2px" }}>«{song.song}» — {song.artist}</div>}
                </div>
                <div style={{ fontSize:"24px", fontWeight:900, color: idx===0?"#FFD700":"#70c2f0", flexShrink:0 }}>{e.score}</div>
              </div>
            );
          })}
          <button onClick={() => setShowTop5(false)} style={{
            marginTop:"14px", background:"linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border:"1.5px solid rgba(95,182,255,0.8)", borderRadius:"8px",
            padding:"11px 28px", color:"#fff", fontSize:"13px", fontWeight:700,
            letterSpacing:"0.1em", cursor:"pointer", fontFamily:"'Montserrat',sans-serif",
            boxShadow:"0 0 16px rgba(0,120,255,0.5)" }}>← BACK</button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── preconfirm ─────────────────────────────────────────────────
  if (scene === "preconfirm") {
    const votes = preVotes[voterIdx] ?? [];
    return (
      <div style={{ minHeight:"100vh", background:"#00063a", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", fontFamily:"'Montserrat',sans-serif", color:"#fff",
        position:"relative", overflow:"hidden" }}>
        <EscBackground />
        <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:"600px", padding:"28px 20px",
          animation:"tableSlideIn 0.5s ease both" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", marginBottom:"8px" }}>
            <FlagSvg cc={voter?.cc ?? "eu"} width={38} height={25} />
            <span style={{ fontSize:"16px", fontWeight:800, letterSpacing:"0.1em", color:"#a6d8ff" }}>{voter?.name}</span>
          </div>
          <div style={{ fontSize:"10px", letterSpacing:"0.22em", color:"rgba(100,178,255,0.45)", marginBottom:"22px" }}>
            POINTS 1 – 7 · READY TO ENTER THE SCOREBOARD
          </div>
          {[...votes].reverse().map(v => {
            const c = contestants.find(x => x.id === v.countryId);
            if (!c) return null;
            return (
              <div key={v.countryId} style={{ display:"flex", alignItems:"center", gap:"14px",
                background:"rgba(15,105,255,0.12)", border:"1px solid rgba(40,100,255,0.2)",
                borderRadius:"8px", padding:"10px 16px", marginBottom:"8px",
                animation:"tableSlideIn 0.4s ease both" }}>
                <div style={{ width:"36px", height:"36px", borderRadius:"50%", flexShrink:0,
                  background:"radial-gradient(circle at 35% 28%,#c8eeff 0%,#38aaff 38%,#0044cc 100%)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:900, fontSize:"16px", color:"#fff",
                  boxShadow:"0 0 10px rgba(40,140,255,0.6)" }}>{v.pts}</div>
                <FlagSvg cc={c.cc} width={44} height={29} style={{ flexShrink:0 }} />
                <div style={{ flex:1, textAlign:"left", fontSize:"15px", fontWeight:600, letterSpacing:"0.06em" }}>{c.name}</div>
              </div>
            );
          })}
          <button onClick={handleLaunchPreVotes} style={{
            marginTop:"18px", background:"linear-gradient(158deg,#2a7aec 0%,#104ab8 100%)",
            border:"1.5px solid rgba(95,182,255,0.8)", borderRadius:"8px",
            padding:"14px 40px", color:"#fff", fontSize:"15px", fontWeight:700,
            letterSpacing:"0.12em", cursor:"pointer",
            boxShadow:"0 0 22px rgba(0,120,255,0.5)", fontFamily:"'Montserrat',sans-serif" }}>
            ENTER SCOREBOARD →
          </button>
        </div>
        <EscStyles />
      </div>
    );
  }

  // ── Основная таблица / карта / выбор ───────────────────────────
  return (
    <div style={{ minHeight:"100vh", fontFamily:"'Montserrat',sans-serif", color:"#fff",
      position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", alignItems:"center",
      background:"#00063a" }}>
      <EscBackground />

      {scene === "intro" && voter && (
        <VoterIntro voterCc={voter.cc} voterName={voter.name}
          voterIdx={voterIdx} total={voters.length} onDone={handleIntroDone} />
      )}

      {scene === "preselect" && voter && (
        <PreSelectionScreen voterCc={voter.cc} voterName={voter.name}
          voterCountryId={voter.id} contestants={contestants} onConfirm={handlePreConfirm} />
      )}

      {/* Основная таблица */}
      <div style={{
        position:"relative", zIndex:10, width:"100%", maxWidth:"1000px",
        padding:"12px 14px 22px", flex:1, display:"flex", flexDirection:"column",
        opacity:    (scene==="main" && tableVisible) ? 1 : 0,
        transform:  (scene==="main" && tableVisible) ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 0.55s ease, transform 0.55s ease",
        pointerEvents: scene==="main" ? "auto" : "none",
      }}>

        {/* Title row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:"10px", gap:"12px", flexWrap:"wrap" }}>
          <div style={{ fontSize:"11px", letterSpacing:"0.26em",
            color:"rgba(100,178,255,0.44)", fontWeight:600, textTransform:"uppercase" }}>
            Eurovision Song Contest · Grand Final
          </div>
          <button onClick={() => setShowTop5(true)} style={{
            background:"linear-gradient(158deg,rgba(13,44,115,0.9) 0%,rgba(5,22,70,0.95) 100%)",
            border:"1px solid rgba(60,130,255,0.4)", borderRadius:"6px",
            padding:"5px 12px", color:"rgba(140,200,255,0.85)",
            fontSize:"10px", fontWeight:700, letterSpacing:"0.12em",
            cursor:"pointer", fontFamily:"'Montserrat',sans-serif", transition:"border-color 0.2s" }}>
            TOP 5 ▶
          </button>
          {curHighCount > 0 && !blocked && (
            <button onClick={handleUndoHigh} style={{
              background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,80,80,0.35)",
              borderRadius:"6px", padding:"5px 12px", color:"rgba(255,120,120,0.85)",
              fontSize:"10px", fontWeight:700, letterSpacing:"0.1em",
              cursor:"pointer", fontFamily:"'Montserrat',sans-serif", transition:"all 0.2s" }}>
              ↩ UNDO
            </button>
          )}
        </div>

        {/* Scoreboard */}
        <div style={{
          background:"linear-gradient(180deg,rgba(0,4,24,0.97) 0%,rgba(0,6,32,0.95) 100%)",
          borderRadius:"6px 6px 0 0",
          border:"1px solid rgba(30,80,200,0.5)", borderBottom:"none",
          overflow:"visible", position:"relative",
          boxShadow:"0 8px 55px rgba(0,0,0,0.8),inset 0 1px 0 rgba(80,160,255,0.15)",
        }}>
          <div ref={containerRef} style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
            <div style={{ borderRight:"1px solid rgba(30,80,200,0.3)" }}>
              {left.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={!!voter && e.id===voter.id}
                  alreadyVoted={curHighGivenTo.has(e.id)}
                  hasNext={!!nextHighPt}
                  onClick={handleMainClick}
                  isLeader={leaderIds.has(e.id)}
                  isPushed={rowPushId === e.id}
                />
              ))}
            </div>
            <div>
              {right.map(e => (
                <ScoreRow key={e.id} entry={e}
                  isVoter={!!voter && e.id===voter.id}
                  alreadyVoted={curHighGivenTo.has(e.id)}
                  hasNext={!!nextHighPt}
                  onClick={handleMainClick}
                  isLeader={leaderIds.has(e.id)}
                  isPushed={rowPushId === e.id}
                />
              ))}
            </div>
          </div>
        </div>

        {voter && (
          <BottomPanel voterIdx={voterIdx} highCount={curHighCount} nextPt={nextHighPt} panelRef={panelRef} />
        )}
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
        0%   { transform:translate(0,0) scale(1); opacity:1; }
        72%  { opacity:1; }
        100% { transform:translate(var(--dx),var(--dy)) scale(0.85); opacity:0; }
      }
      @keyframes tableSlideIn {
        from { opacity:0; transform:translateY(20px) scale(0.98); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes glow12 {
        from { opacity:0.5; transform:scale(0.9); }
        to   { opacity:1;   transform:scale(1.1); }
      }
      @keyframes rowPush {
        0%   { transform:scale(1) translateX(0); box-shadow:none; }
        30%  { transform:scale(1.035) translateX(4px); box-shadow:4px 0 20px rgba(0,120,255,0.4); }
        100% { transform:scale(1.035) translateX(4px); box-shadow:4px 0 20px rgba(0,120,255,0.4); }
      }
      @keyframes fillLR {
        from { clip-path: inset(0 100% 0 0); }
        to   { clip-path: inset(0 0% 0 0); }
      }
      @keyframes bgSweep {
        0%,100% { transform:translateX(-120%); }
        50%      { transform:translateX(120%); }
      }
      @keyframes bgSweep2 {
        0%,100% { transform:translateX(120%); }
        50%      { transform:translateX(-120%); }
      }
      @keyframes orb1 {
        0%,100% { transform:translate(0,0) scale(1); opacity:.8; }
        50%      { transform:translate(60px,-40px) scale(1.18); opacity:1; }
      }
      @keyframes orb2 {
        0%,100% { transform:translate(0,0) scale(1); opacity:.7; }
        50%      { transform:translate(-50px,30px) scale(1.12); opacity:.95; }
      }
      @keyframes orb3 {
        0%,100% { transform:translateX(-50%) scale(1); opacity:.6; }
        50%      { transform:translateX(-50%) scale(1.3); opacity:1; }
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
      @keyframes shoot1 {
        0%   { transform:translateX(0) translateY(0) rotate(15deg); opacity:0; }
        5%   { opacity:1; }
        30%  { transform:translateX(110vw) translateY(20px) rotate(15deg); opacity:0; }
        100% { transform:translateX(110vw) translateY(20px) rotate(15deg); opacity:0; }
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