/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LESSON_1 } from '../../data/chessLesson1';
import { speakElevenLabs, stopSpeech, parseHighlights } from '../../utils/elevenlabs';
import './ChessBoardLesson.css';

// ── Import npm packages ─────────────────────────────
import $ from 'jquery';
import { Chess } from 'chess.js';
// chessboard.js needs jQuery on window before it loads
window.$ = $;
window.jQuery = $;
// Now we can require chessboard.js
const Chessboard = require('@chrisoakman/chessboardjs/dist/chessboard-1.0.0.js');
// Import chessboard CSS
import '@chrisoakman/chessboardjs/dist/chessboard-1.0.0.min.css';

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES      = ['a','b','c','d','e','f','g','h'];
const RANKS      = ['8','7','6','5','4','3','2','1'];
const PIECE_NAMES = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };
const PIECE_DISPLAY = ['K','Q','R','R','B','B','N','N'];
const BOARD_SIZE = 400;
const SQ = BOARD_SIZE / 8;

// Piece image base — from npm package public folder
const PIECE_BASE = process.env.PUBLIC_URL + '/chesspieces/wikipedia';

// ─────────────────────────────────────────────────────
// CHESSBOARD COMPONENT
// Uses chessboard.js for rendering + canvas for neon overlays
// ─────────────────────────────────────────────────────
function ChessboardWidget({
  position    = 'empty',
  neonFile    = null,
  neonRank    = null,
  neonSquares = [],
  clickedSquares = [],
  wrongSquares   = [],
  targetSquares  = [],
  onSquareClick,
}) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const cbRef     = useRef(null);

  // Build chessboard.js once
  useEffect(() => {
    if (!wrapRef.current) return;
    const id = 'cb-board-' + Math.random().toString(36).slice(2);
    wrapRef.current.id = id;

    try {
      cbRef.current = Chessboard(id, {
        position: 'empty',
        showNotation: true,
        pieceTheme: (piece) =>
          `${process.env.PUBLIC_URL}/chesspieces/wikipedia/${piece}.png`,
        draggable: false,
      });
    } catch(e) {
      console.error('Chessboard init error:', e);
    }

    return () => {
      try { cbRef.current?.destroy?.(); } catch(e) {}
    };
  }, []);

  // Update position
  useEffect(() => {
    try { cbRef.current?.position?.(position, false); } catch(e) {}
  }, [position]);

  // Draw neon canvas overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = BOARD_SIZE;
    canvas.height = BOARD_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    function sqXY(sq) {
      const fi = FILES.indexOf(sq[0]);
      const ri = 8 - parseInt(sq[1]);
      return { x: fi * SQ, y: ri * SQ };
    }

    // Neon file column
    if (neonFile) {
      const fi = FILES.indexOf(neonFile);
      if (fi >= 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,210,0,0.14)';
        ctx.fillRect(fi * SQ, 0, SQ, BOARD_SIZE);
        ctx.strokeStyle = 'rgba(255,210,0,0.92)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(255,210,0,0.75)';
        ctx.shadowBlur  = 14;
        ctx.strokeRect(fi * SQ + 2, 2, SQ - 4, BOARD_SIZE - 4);
        ctx.restore();
      }
    }

    // Neon rank row
    if (neonRank) {
      const ri = 8 - parseInt(neonRank);
      if (ri >= 0 && ri < 8) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,210,0,0.14)';
        ctx.fillRect(0, ri * SQ, BOARD_SIZE, SQ);
        ctx.strokeStyle = 'rgba(255,210,0,0.92)';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(255,210,0,0.75)';
        ctx.shadowBlur  = 14;
        ctx.strokeRect(2, ri * SQ + 2, BOARD_SIZE - 4, SQ - 4);
        ctx.restore();
      }
    }

    // Neon individual squares
    neonSquares.forEach(sq => {
      const { x, y } = sqXY(sq);
      ctx.save();
      ctx.fillStyle   = 'rgba(255,210,0,0.18)';
      ctx.strokeStyle = 'rgba(255,210,0,0.95)';
      ctx.lineWidth   = 3;
      ctx.shadowColor = 'rgba(255,210,0,0.85)';
      ctx.shadowBlur  = 18;
      ctx.fillRect(x+2, y+2, SQ-4, SQ-4);
      ctx.strokeRect(x+3, y+3, SQ-6, SQ-6);
      ctx.restore();
    });

    // Target squares — green pulse ring
    targetSquares.forEach(sq => {
      if (clickedSquares.includes(sq)) return;
      const { x, y } = sqXY(sq);
      ctx.save();
      ctx.fillStyle   = 'rgba(50,210,80,0.2)';
      ctx.strokeStyle = 'rgba(50,210,80,0.9)';
      ctx.lineWidth   = 3;
      ctx.shadowColor = 'rgba(50,210,80,0.6)';
      ctx.shadowBlur  = 10;
      ctx.fillRect(x+2, y+2, SQ-4, SQ-4);
      ctx.strokeRect(x+3, y+3, SQ-6, SQ-6);
      ctx.restore();
    });

    // Clicked squares — green tick
    clickedSquares.forEach(sq => {
      const { x, y } = sqXY(sq);
      ctx.save();
      ctx.fillStyle = 'rgba(29,158,117,0.52)';
      ctx.fillRect(x, y, SQ, SQ);
      ctx.font      = `bold ${Math.round(SQ * 0.58)}px Arial`;
      ctx.fillStyle = 'rgba(255,255,255,0.96)';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor  = 'rgba(0,0,0,0.9)';
      ctx.shadowBlur   = 6;
      ctx.fillText('✓', x + SQ/2, y + SQ/2);
      ctx.restore();
    });

    // Wrong squares — red flash
    wrongSquares.forEach(sq => {
      const { x, y } = sqXY(sq);
      ctx.save();
      ctx.fillStyle = 'rgba(226,75,74,0.68)';
      ctx.fillRect(x, y, SQ, SQ);
      ctx.restore();
    });

  }, [neonFile, neonRank, neonSquares, targetSquares, clickedSquares, wrongSquares]);

  // Square click via jQuery event delegation
  useEffect(() => {
    if (!onSquareClick || !wrapRef.current) return;
    const handler = function(e) {
      const sq = $(e.target).closest('[data-square]').data('square')
                 || $(e.target).closest('.square-55d63').data('square');
      if (sq) onSquareClick(sq);
    };
    $(wrapRef.current).on('click', handler);
    return () => $(wrapRef.current).off('click', handler);
  }, [onSquareClick]);

  return (
    <div style={{ position:'relative', width:BOARD_SIZE, height:BOARD_SIZE }}>
      <div ref={wrapRef} style={{ width:BOARD_SIZE }} />
      <canvas
        ref={canvasRef}
        style={{ position:'absolute', top:0, left:0, pointerEvents:'none', zIndex:10 }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PIECE TRAY
// Uses same Wikipedia piece images as chessboard.js
// ─────────────────────────────────────────────────────
function PieceTray({ color, glowPieces = [], label }) {
  const prefix = color === 'w' ? 'w' : 'b';

  return (
    <div className="tray-outer">
      <div className="tray-label">{label}</div>
      <div className="tray-row">
        {PIECE_DISPLAY.map((t, i) => {
          const name    = PIECE_NAMES[t];
          const glowing = glowPieces.includes(name.toLowerCase())
                       || glowPieces.includes(t.toLowerCase());
          return (
            <div key={`${t}-${i}`} className={`tray-piece ${glowing ? 'tray-glow' : ''}`}>
              <img
                src={`${process.env.PUBLIC_URL}/chesspieces/wikipedia/${prefix}${t}.png`}
                alt={name}
                className="tray-img"
                onError={e => { e.target.style.display='none'; }}
              />
              <span className="tray-name">{name}</span>
            </div>
          );
        })}
        <div className={`tray-piece ${glowPieces.includes('pawn') ? 'tray-glow' : ''}`}>
          <div className="tray-pawn-wrap">
            <img
              src={`${process.env.PUBLIC_URL}/chesspieces/wikipedia/${prefix}P.png`}
              alt="Pawn" className="tray-img-sm"
              onError={e => { e.target.style.display='none'; }}
            />
            <span className="tray-pawn-x">×8</span>
          </div>
          <span className="tray-name">Pawns</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SESSION PROGRESS BAR
// ─────────────────────────────────────────────────────
function SessionBar({ phaseIdx, phases }) {
  const pct = Math.round((phaseIdx / phases.length) * 100);
  const phase = phases[phaseIdx];
  return (
    <div className="sess-bar">
      <span className="sess-badge">Session 1 — Learn</span>
      <div className="sess-dots">
        {phases.map((_, i) => (
          <span key={i} className={`sess-dot ${i===phaseIdx?'s-active':i<phaseIdx?'s-done':''}`} />
        ))}
      </div>
      <span className="sess-info">{phase?.title} · {pct}%</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// RESULT PANEL
// ─────────────────────────────────────────────────────
function ResultPanel({
  phase, step, score, total, streak,
  feedback, fbType,
  onContinue, continueLabel,
  speedState, quizState, onLightDark,
  fileQuizState, onFileAnswer, isPlaying,
}) {
  return (
    <div className="result-panel">
      <div className="phase-chip">
        <span className="phase-icon">
          {phase?.type==='story'?'📖':phase?.type==='files'?'📊':
           phase?.type==='ranks'?'📈':phase?.type==='squares'?'🎯':
           phase?.type==='colours'?'🎨':phase?.type==='speed'?'⚡':'✅'}
        </span>
        <span className="phase-name">{phase?.title}</span>
        <span className="phase-mins">{phase?.durationMins}m</span>
      </div>

      {step?.task && (
        <div className="task-card">
          <div className="task-lbl">Your task</div>
          <div className="task-txt">{step.task}</div>
        </div>
      )}

      {isPlaying && (
        <div className="playing-row">
          <span className="playing-dot" />
          Ms. Momo is speaking...
        </div>
      )}

      {total > 0 && (
        <div className="score-row">
          <div className="score-box">
            <span className="score-n">{score}</span>
            <span className="score-d">/{total}</span>
          </div>
          {streak >= 3 && <div className="streak">🔥 {streak} streak!</div>}
        </div>
      )}

      {feedback && (
        <div className={`fb fb-${fbType}`}>
          {fbType==='success'?'✅ ':fbType==='error'?'❌ ':'💡 '}{feedback}
        </div>
      )}

      {quizState?.active && (
        <div className="colour-btns">
          <button className="btn-light" onClick={()=>onLightDark('light')}>☀️ Light Square</button>
          <button className="btn-dark"  onClick={()=>onLightDark('dark')}>🌑 Dark Square</button>
        </div>
      )}

      {fileQuizState?.active && (
        <div className="file-grid">
          {FILES.map(f => (
            <button key={f} className="file-btn" onClick={()=>onFileAnswer(f)}>
              File {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {speedState?.active && (
        <div className="speed-box">
          <div className="speed-find">Find this square:</div>
          <div className="speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
          <div className="speed-track">
            <div className="speed-fill"
              style={{width:`${(speedState.timeLeft/speedState.totalTime)*100}%`}}/>
          </div>
          <div className="speed-meta">
            <span>⏱ {speedState.timeLeft}s</span>
            <span>✓ {speedState.hits} correct</span>
          </div>
        </div>
      )}

      {!speedState?.active && !quizState?.active && !fileQuizState?.active && (
        <button className="continue-btn" onClick={onContinue}>
          {continueLabel || 'Continue →'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN ChessBoardLesson
// ─────────────────────────────────────────────────────
export default function ChessBoardLesson({ childName = 'Student', onComplete }) {
  const lesson = LESSON_1;
  const phases = lesson.phases;

  const [phaseIdx,  setPhaseIdx]  = useState(0);
  const [stepIdx,   setStepIdx]   = useState(0);
  const [voiceOn,   setVoiceOn]   = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const [boardPos,   setBoardPos]   = useState('empty');
  const [neonFile,   setNeonFile]   = useState(null);
  const [neonRank,   setNeonRank]   = useState(null);
  const [neonSqs,    setNeonSqs]    = useState([]);
  const [glowPieces, setGlowPieces] = useState([]);
  const [clicked,    setClicked]    = useState([]);
  const [wrongSqs,   setWrongSqs]   = useState([]);
  const [targetSqs,  setTargetSqs]  = useState([]);

  const [score,    setScore]    = useState(0);
  const [total,    setTotal]    = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fbType,   setFbType]   = useState('info');

  const [indepIdx, setIndepIdx]  = useState(0);
  const [quizState, setQuizState]   = useState(null);
  const [quizIdx,   setQuizIdx]     = useState(0);
  const [fileQS,    setFileQS]      = useState(null);
  const [speedState,setSpeedState]  = useState(null);
  const [lessonDone,setLessonDone]  = useState(false);

  const speedRef  = useRef(null);
  const voiceRef  = useRef(false);
  const neonTimer = useRef(null);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step  = steps[stepIdx];

  const fill = (t) => (t||'').replace(/\{name\}/g, childName);

  // ── Neon from voice text ────────────────────
  function applyNeon(text) {
    const m = parseHighlights(text);
    const sqs=[], files=[], ranks=[], pieces=[];
    m.forEach(x => {
      if (x.type==='square') sqs.push(x.value);
      else if (x.type==='file') files.push(x.value);
      else if (x.type==='rank') ranks.push(x.value);
      else if (x.type==='piece') pieces.push(x.value);
    });
    if (files.length)  setNeonFile(files[0]);
    if (ranks.length)  setNeonRank(ranks[0]);
    if (sqs.length)    setNeonSqs(sqs);
    if (pieces.length) setGlowPieces(pieces);
    clearTimeout(neonTimer.current);
    neonTimer.current = setTimeout(()=>{
      setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    }, 9000);
  }

  // ── Reset on step change ────────────────────
  useEffect(() => {
    voiceRef.current = false;
    setClicked([]); setWrongSqs([]);
    setFeedback(''); setFbType('info');
    setSpeedState(null); setIndepIdx(0);
    setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);

    if (step?.highlightFile) setNeonFile(step.highlightFile);
    if (step?.highlightRank) setNeonRank(String(step.highlightRank));
    if (step?.highlights?.length) setNeonSqs(step.highlights);

    if (['click-file','click-rank','click-square'].includes(step?.taskType)) {
      setTargetSqs(step.targetSquares||[]);
    } else setTargetSqs([]);

    if (step?.taskType==='colour-quiz') {
      setQuizState({active:true}); setQuizIdx(0);
      const f = step.quizSquares?.[0]?.sq;
      if (f) setNeonSqs([f]);
    } else setQuizState(null);

    if (step?.taskType==='file-name-quiz') startFileQuiz();
    else setFileQS(null);

    setBoardPos(step?.boardState==='start'?'start':'empty');
  }, [phaseIdx, stepIdx]);

  // ── Auto-play voice ─────────────────────────
  useEffect(() => {
    if (!voiceOn || !step?.voice || voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice);
    const t = setTimeout(() => {
      applyNeon(text);
      speakElevenLabs(text, {
        onStart: () => setIsPlaying(true),
        onEnd:   () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }, 500);
    return () => clearTimeout(t);
  }, [phaseIdx, stepIdx, voiceOn]);

  // ── Advance ─────────────────────────────────
  const nextStep = useCallback(() => {
    stopSpeech();
    setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    const nsi = stepIdx + 1;
    if (nsi < steps.length) { setStepIdx(nsi); return; }
    const npi = phaseIdx + 1;
    if (npi < phases.length) { setPhaseIdx(npi); setStepIdx(0); return; }
    setLessonDone(true);
    speakElevenLabs(`Congratulations ${childName}! You have completed your first chess lesson! You are a star!`);
    setTimeout(() => onComplete?.(), 4000);
  }, [stepIdx, steps.length, phaseIdx, phases.length, childName]);

  function showFb(msg, type, voice='') {
    setFeedback(fill(msg)); setFbType(type);
    if (voice && voiceOn) {
      const vt = fill(voice);
      applyNeon(vt);
      speakElevenLabs(vt, { onStart:()=>setIsPlaying(true), onEnd:()=>setIsPlaying(false) });
    }
  }

  // ── Square clicks ────────────────────────────
  function handleSquareClick(sq) {
    if (!step) return;
    const tt = step.taskType;

    if (tt==='click-file'||tt==='click-rank') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc=[...clicked,sq]; setClicked(nc); setStreak(s=>s+1);
        if (nc.length===step.targetSquares.length) {
          setScore(s=>s+nc.length); setTotal(t=>t+nc.length); setTargetSqs([]);
          showFb(step.successVoice||'Complete!','success',step.successVoice);
          setTimeout(nextStep,1900);
        } else showFb(`✓ ${nc.length} of ${step.targetSquares.length}!`,'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),600);
        showFb(`That square is not in this ${tt==='click-file'?'file':'rank'}!`,'error');
      }
      return;
    }

    if (tt==='click-square') {
      setTotal(t=>t+1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s=>s+1); setStreak(s=>s+1); setTargetSqs([]);
        showFb(step.successVoice||'Correct!','success',step.successVoice);
        setTimeout(nextStep,1900);
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),700);
        showFb(step.wrongVoice||'Not quite — try again!','error',step.wrongVoice);
      }
      return;
    }

    if (tt==='independent-squares') {
      const tgts=step.targetSquares||[], curr=tgts[indepIdx];
      if (!curr) return;
      setTotal(t=>t+1);
      if (sq===curr) {
        setClicked(p=>[...p,sq]); setScore(s=>s+1); setStreak(s=>s+1);
        const vm=(step.voiceCorrect?.[indepIdx]||'Correct!').replace(/\{name\}/g,childName);
        showFb(vm,'success');
        if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
        const ni=indepIdx+1;
        if (ni>=tgts.length) {
          setTimeout(()=>showFb((step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName),'success'),500);
          setTimeout(nextStep,2600);
        } else {
          setIndepIdx(ni);
          setTimeout(()=>{
            setNeonSqs([tgts[ni]]);
            showFb(`Now find: ${tgts[ni].toUpperCase()}`,'hint');
            if(voiceOn) speakElevenLabs(`Now find ${tgts[ni]}`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
          },700);
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),700);
        const vm=(step.voiceWrong||`Not quite! Look for ${curr.toUpperCase()}!`)
          .replace('{sq}',curr.toUpperCase()).replace('{file}',curr[0].toUpperCase())
          .replace('{fileNum}',String(curr.charCodeAt(0)-96)).replace('{rank}',curr[1])
          .replace(/\{name\}/g,childName);
        showFb(vm,'error');
        if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      }
      return;
    }

    if (tt==='speed-round' && speedState?.active) {
      if (sq===speedState.currentTarget) {
        const nh=speedState.hits+1;
        setClicked(p=>[...p,sq]); setStreak(s=>s+1);
        const rem=speedState.targets.filter(t=>!speedState.done.includes(t)&&t!==sq);
        if (!rem.length) endSpeedRound(nh);
        else {
          const next=rem[0];
          setSpeedState(p=>({...p,hits:nh,currentTarget:next,done:[...p.done,sq]}));
          setNeonSqs([next]);
          showFb(`✓ ${sq.toUpperCase()} — now find ${next.toUpperCase()}!`,'success');
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),400);
      }
    }
  }

  // ── Speed round ──────────────────────────────
  function startSpeedRound() {
    const tgts=step.targetSquares||[];
    setClicked([]); setStreak(0);
    setSpeedState({active:true,targets:tgts,currentTarget:tgts[0],hits:0,done:[],
      timeLeft:step.timeLimitSecs||75,totalTime:step.timeLimitSecs||75});
    setNeonSqs([tgts[0]]);
    showFb(`Find ${tgts[0].toUpperCase()}!`,'hint');
    if(voiceOn) speakElevenLabs(`Go! Find ${tgts[0]}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    speedRef.current=setInterval(()=>{
      setSpeedState(p=>{
        if(!p) return p;
        const tl=p.timeLeft-1;
        if(tl<=0){clearInterval(speedRef.current);endSpeedRound(p.hits);return{...p,timeLeft:0,active:false};}
        return{...p,timeLeft:tl};
      });
    },1000);
  }

  function endSpeedRound(hits) {
    clearInterval(speedRef.current);
    setSpeedState(p=>p?{...p,active:false}:p); setNeonSqs([]);
    const tgt=step.targetScore||12, tot=(step.targetSquares||[]).length;
    setScore(hits); setTotal(tot);
    let vm=hits>=tgt?step.successVoice:hits>=tgt*0.7?step.goodVoice:step.tryAgainVoice;
    vm=(vm||`You scored ${hits}!`).replace('{score}',hits).replace(/\{name\}/g,childName);
    showFb(vm,hits>=tgt?'success':'hint',vm);
    setTimeout(nextStep,3200);
  }

  // ── Colour quiz ──────────────────────────────
  function handleLightDark(answer) {
    if(!quizState?.active) return;
    const qs=step.quizSquares||[], curr=qs[quizIdx];
    if(!curr) return;
    setTotal(t=>t+1);
    if(answer===curr.colour) {
      setScore(s=>s+1); setStreak(s=>s+1); setClicked(p=>[...p,curr.sq]);
      const vm=(step.voiceCorrect||'Correct!').replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'success');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const ni=quizIdx+1;
      if(ni>=qs.length){
        setQuizState({active:false});
        const vm2=(step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName);
        setTimeout(()=>showFb(vm2,'success'),500); setTimeout(nextStep,2600);
      } else {
        setQuizIdx(ni); setNeonSqs([qs[ni].sq]);
        setTimeout(()=>showFb(`Is ${qs[ni].sq.toUpperCase()} light or dark?`,'hint'),700);
      }
    } else {
      setStreak(0); setWrongSqs([curr.sq]); setTimeout(()=>setWrongSqs([]),800);
      const vm=(step.voiceWrong||`${curr.sq} is ${curr.colour}!`).replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'error');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  // ── File quiz ────────────────────────────────
  function startFileQuiz() {
    const shuffled=[...FILES].sort(()=>Math.random()-0.5).slice(0,6);
    setFileQS({active:true,remaining:shuffled.slice(1),current:shuffled[0]});
    setNeonFile(shuffled[0]); setNeonRank(null); setNeonSqs([]);
  }

  function handleFileAnswer(answer) {
    if(!fileQS?.active) return;
    const curr=fileQS.current; setTotal(t=>t+1);
    if(answer===curr){
      setScore(s=>s+1); setStreak(s=>s+1);
      showFb(`Correct! That was file ${curr.toUpperCase()}!`,'success');
      if(voiceOn) speakElevenLabs(`Yes! File ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const rem=fileQS.remaining;
      if(!rem.length){setFileQS({active:false});setNeonFile(null);setTimeout(nextStep,1800);}
      else setTimeout(()=>{ setFileQS({active:true,remaining:rem.slice(1),current:rem[0]}); setNeonFile(rem[0]); showFb('Which file is this?','hint'); },900);
    } else {
      setStreak(0);
      showFb(`Not quite — that was file ${curr.toUpperCase()}!`,'error');
      if(voiceOn) speakElevenLabs(`Not quite! That is file ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  function handleContinue() {
    if(step?.taskType==='speed-intro'){startSpeedRound();return;}
    if(step?.taskType==='complete'){setLessonDone(true);setTimeout(()=>onComplete?.(),1500);return;}
    nextStep();
  }

  // ── Derived board neons ──────────────────────
  const boardNeonSqs = [
    ...neonSqs,
    ...(step?.taskType==='independent-squares'?[step.targetSquares?.[indepIdx]].filter(Boolean):[]),
    ...(step?.taskType==='colour-quiz'&&quizState?.active?[step.quizSquares?.[quizIdx]?.sq].filter(Boolean):[]),
    ...(step?.taskType==='speed-round'&&speedState?.active?[speedState.currentTarget].filter(Boolean):[]),
  ];

  if(lessonDone) return (
    <div className="lesson-done">
      <div className="done-card">
        <div style={{fontSize:60,marginBottom:14}}>🏆</div>
        <h2>Lesson 1 Complete!</h2>
        <p className="done-sub">The Board — Files, Ranks and Squares</p>
        <p className="done-msg">Outstanding work {childName}! You know every square on the chess board. You are ready for Lesson 2!</p>
        <div className="done-score"><span className="done-n">{score}</span><span className="done-lbl"> correct answers</span></div>
      </div>
    </div>
  );

  const contLabel = step?.taskType==='speed-intro'?'⚡ Start Speed Challenge!':step?.continueLabel||'Continue →';

  return (
    <div className="bl-root">
      <div className="bl-topbar">
        <div>
          <div className="bl-title">{lesson.title}</div>
          <div className="bl-sub">{lesson.subtitle}</div>
        </div>
        <SessionBar phaseIdx={phaseIdx} phases={phases} />
      </div>

      <div className="bl-main">
        <div className="board-col">
          <PieceTray color="b" glowPieces={glowPieces} label="Black's pieces" />
          <ChessboardWidget
            position={boardPos}
            neonFile={neonFile}
            neonRank={neonRank}
            neonSquares={boardNeonSqs}
            clickedSquares={clicked}
            wrongSquares={wrongSqs}
            targetSquares={targetSqs}
            onSquareClick={handleSquareClick}
          />
          <PieceTray color="w" glowPieces={glowPieces} label="White's pieces" />
        </div>

        <ResultPanel
          phase={phase} step={step}
          score={score} total={total} streak={streak}
          feedback={feedback} fbType={fbType}
          onContinue={handleContinue} continueLabel={contLabel}
          speedState={speedState?.active?speedState:null}
          quizState={quizState?.active?quizState:null}
          onLightDark={handleLightDark}
          fileQuizState={fileQS?.active?fileQS:null}
          onFileAnswer={handleFileAnswer}
          isPlaying={isPlaying}
        />
      </div>

      <div className="bl-tutor-bar">
        <div className="tutor-av">🎓</div>
        <div className="tutor-bubble">
          <div className="tutor-name">
            Ms. Momo
            {voiceOn&&<span className="voice-pill">{isPlaying?'🔊 speaking...':'🔊 ElevenLabs on'}</span>}
          </div>
          <p className="tutor-txt">{fill(step?.voice||'')}</p>
        </div>
        <button className={`voice-btn ${voiceOn?'voice-on':''}`}
          onClick={()=>{
            const n=!voiceOn; setVoiceOn(n);
            if(!n) stopSpeech();
            else if(step?.voice){const t=fill(step.voice);applyNeon(t);speakElevenLabs(t,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});}
          }}>
          {voiceOn?'🔊':'🔇'}
        </button>
      </div>
    </div>
  );
}
