/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LESSON_1 } from '../../data/chessLesson1';
import { speakElevenLabs, stopSpeech, parseHighlights } from '../../utils/elevenlabs';
import './ChessBoardLesson.css';

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS_DISPLAY = ['8','7','6','5','4','3','2','1']; // top to bottom display
const SQ = 58; // large squares

const PIECE_ORDER = ['K','Q','R','R','B','B','N','N','P','P','P','P','P','P','P','P'];
const PIECE_LABELS = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };
const PIECE_NAMES_FULL = ['King','Queen','Rook','Rook','Bishop','Bishop','Knight','Knight',
  'Pawn','Pawn','Pawn','Pawn','Pawn','Pawn','Pawn','Pawn'];

// SVG piece renderer — solid filled, bold
function PieceSVG({ type, color, size = 36 }) {
  const s   = size;
  const col = color === 'w' ? '#ffffff' : '#1a1a1a';
  const str = color === 'w' ? '#111111' : '#777777';
  const sw  = color === 'w' ? 1.5 : 1.2;
  const sc  = `scale(${s / 45})`;
  const shapes = {
    K:(
      <g transform={sc}>
        <polygon points="22.5,11 11,11 8.5,4 16,7.5 22.5,2 29,7.5 36.5,4 34,11 22.5,11"
          fill={col} stroke={str} strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M11,11 Q8.5,35 8.5,40 L36.5,40 Q36.5,35 34,11 Z" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="20" y="2" width="5" height="10" rx="1.5" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="17" y="5" width="11" height="3.5" rx="1.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M8.5,40 Q8.5,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    Q:(
      <g transform={sc}>
        <circle cx="6" cy="12" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="15" cy="9" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="22.5" cy="8" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="30" cy="9" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="39" cy="12" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M6,12 Q7,27 9,30 L36,30 Q38,27 39,12 Q30,21 22.5,15 Q15,21 6,12Z" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="9" y="30" width="27" height="10" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    R:(
      <g transform={sc}>
        <rect x="9" y="7" width="6" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="20" y="7" width="5" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="30" y="7" width="6" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="9" y="13" width="27" height="5" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="11" y="18" width="23" height="18" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    B:(
      <g transform={sc}>
        <circle cx="22.5" cy="9" r="4" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="22.5" cy="9" r="1.5" fill={str}/>
        <ellipse cx="22.5" cy="26" rx="9" ry="15" fill={col} stroke={str} strokeWidth={sw}/>
        <ellipse cx="22.5" cy="26" rx="4.5" ry="9" fill={str}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Q22.5,36 9,40 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    N:(
      <g transform={sc}>
        <path d="M22,10 Q13,10 10,17 Q9,22 10,26 Q11.5,28 14.5,28.5 Q12,32 11,36 L34,36 Q33,31 32,29 Q35.5,27 36.5,23 Q37,15 30,11.5 Q27,9.5 22,10 Z"
          fill={col} stroke={str} strokeWidth={sw} strokeLinejoin="round"/>
        <circle cx="17" cy="18" r="2.5" fill={str}/>
        <path d="M10,26 Q14,25 16.5,27 Q14,29.5 12,33 Q10,30 10,26 Z" fill={str}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    P:(
      <g transform={sc}>
        <circle cx="22.5" cy="12" r="6.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M14,23 Q14,34 16,36 L29,36 Q31,34 31,23 Q27,26.5 22.5,26.5 Q18,26.5 14,23 Z" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L16,36 L29,36 Z" fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
  };
  return <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:'block'}}>{shapes[type]}</svg>;
}

// ─────────────────────────────────────────────────────
// PIECE TRAY — outside the board, top or bottom
// ─────────────────────────────────────────────────────
function PieceTray({ color, glowPieces = [], label }) {
  const pieces = color === 'w'
    ? ['K','Q','R','R','B','B','N','N','P','P','P','P','P','P','P','P']
    : ['k','q','r','r','b','b','n','n','p','p','p','p','p','p','p','p'];

  const displayPieces = color === 'w'
    ? ['K','Q','R','R','B','B','N','N']  // show main pieces + indicate pawns
    : ['k','q','r','r','b','b','n','n'];

  return (
    <div className="bl-tray-outer">
      <div className="bl-tray-label">{label}</div>
      <div className="bl-tray-row">
        {/* Main pieces */}
        {displayPieces.map((p, i) => {
          const type = p.toUpperCase();
          const glowing = glowPieces.includes(PIECE_LABELS[type]?.toLowerCase()) ||
                          glowPieces.includes(type.toLowerCase());
          return (
            <div key={`${p}-${i}`}
              className={`bl-tray-piece ${glowing ? 'bl-tray-piece-glow' : ''}`}>
              <PieceSVG type={type} color={color} size={38} />
              <span className="bl-tray-piece-lbl">{PIECE_LABELS[type]}</span>
            </div>
          );
        })}
        {/* Pawns as a group */}
        <div className={`bl-tray-piece bl-tray-pawns ${glowPieces.includes('pawn') ? 'bl-tray-piece-glow' : ''}`}>
          <div className="bl-pawns-stack">
            <PieceSVG type="P" color={color} size={32} />
            <span className="bl-pawns-count">×8</span>
          </div>
          <span className="bl-tray-piece-lbl">Pawns</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// LARGE CHESS BOARD — clean, green, no pieces on it
// ─────────────────────────────────────────────────────
function ChessBoard({
  neonSquares = [],   // squares glowing neon yellow
  neonFiles   = [],   // entire files glowing
  neonRanks   = [],   // entire ranks glowing
  clickedSquares = [],
  wrongSquares   = [],
  targetSquares  = [],
  showColours    = false,
  onSquareClick,
}) {
  const size = SQ * 8;

  function getBg(file, rankNum) {
    const sq     = `${file}${rankNum}`;
    const fi     = FILES.indexOf(file);
    const ri     = rankNum - 1;
    const isLight = (fi + ri) % 2 !== 0;
    const baseLight = '#eef6eb';
    const baseDark  = '#4a7c59';

    const isNeonSq   = neonSquares.includes(sq);
    const isNeonFile = neonFiles.includes(file);
    const isNeonRank = neonRanks.includes(String(rankNum));
    const isClicked  = clickedSquares.includes(sq);
    const isWrong    = wrongSquares.includes(sq);
    const isTgt      = targetSquares.includes(sq) && !isClicked;

    if (isWrong)   return 'rgba(226,75,74,0.85)';
    if (isClicked) return 'rgba(29,158,117,0.88)';
    if (isNeonSq || isNeonFile || isNeonRank) return 'rgba(255,230,0,0.9)';
    if (isTgt)     return isLight ? 'rgba(80,230,120,0.8)' : 'rgba(30,160,70,0.85)';
    return isLight ? baseLight : baseDark;
  }

  return (
    <div className="bl-board-wrap">
      <div className="bl-ranks-col">
        {RANKS_DISPLAY.map(r => (
          <div key={r} className={`bl-rank-lbl ${neonRanks.includes(r) ? 'bl-coord-neon' : ''}`}
            style={{ height: SQ }}>{r}</div>
        ))}
      </div>
      <div>
        <div className="bl-board" style={{ width: size, height: size }}>
          {RANKS_DISPLAY.map((rankLabel, ri) => {
            const rankNum = parseInt(rankLabel);
            return FILES.map((file, fi) => {
              const sq      = `${file}${rankNum}`;
              const bg      = getBg(file, rankNum);
              const isClicked = clickedSquares.includes(sq);
              const isTgt   = targetSquares.includes(sq) && !isClicked;
              const isNeon  = neonSquares.includes(sq) ||
                              neonFiles.includes(file) ||
                              neonRanks.includes(String(rankNum));
              return (
                <div key={sq}
                  className={`bl-sq ${isTgt ? 'bl-sq-target' : ''} ${isNeon ? 'bl-sq-neon' : ''} ${onSquareClick ? 'bl-sq-clickable' : ''}`}
                  style={{ left: fi*SQ, top: ri*SQ, width:SQ, height:SQ, background:bg }}
                  onClick={() => onSquareClick?.(sq)}
                >
                  {isClicked && <span className="bl-sq-tick">✓</span>}
                  {isTgt && !isClicked && <span className="bl-sq-ring" />}
                  {isNeon && <span className="bl-sq-neon-ring" />}
                </div>
              );
            });
          })}
        </div>
        <div className="bl-files-row">
          {FILES.map(f => (
            <div key={f} className={`bl-file-lbl ${neonFiles.includes(f) ? 'bl-coord-neon' : ''}`}
              style={{ width: SQ }}>{f}</div>
          ))}
        </div>
      </div>
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
  speedState,
  quizState, onLightDark,
  fileQuizState, onFileAnswer,
  isPlaying,
}) {
  return (
    <div className="bl-result">
      <div className="bl-phase-chip">
        <span className="bl-phase-icon">
          {phase?.type==='story'?'📖':phase?.type==='files'?'📊':
           phase?.type==='ranks'?'📈':phase?.type==='squares'?'🎯':
           phase?.type==='colours'?'🎨':phase?.type==='speed'?'⚡':'✅'}
        </span>
        <span className="bl-phase-name">{phase?.title}</span>
        <span className="bl-phase-mins">{phase?.durationMins}m</span>
      </div>

      {step?.task && (
        <div className="bl-task-card">
          <div className="bl-task-lbl">Your task</div>
          <div className="bl-task-txt">{step.task}</div>
        </div>
      )}

      {isPlaying && (
        <div className="bl-playing-indicator">
          <span className="bl-wave">▶</span>
          <span>Ms. Momo is speaking...</span>
        </div>
      )}

      {total > 0 && (
        <div className="bl-score-row">
          <div className="bl-score-box">
            <span className="bl-score-n">{score}</span>
            <span className="bl-score-d">/{total}</span>
          </div>
          {streak >= 3 && <div className="bl-streak">🔥 {streak} streak!</div>}
        </div>
      )}

      {feedback && (
        <div className={`bl-fb bl-fb-${fbType}`}>
          {fbType==='success'?'✅ ':fbType==='error'?'❌ ':'💡 '}{feedback}
        </div>
      )}

      {quizState?.active && (
        <div className="bl-colour-btns">
          <button className="bl-btn-light" onClick={()=>onLightDark('light')}>☀️ Light Square</button>
          <button className="bl-btn-dark"  onClick={()=>onLightDark('dark')}>🌑 Dark Square</button>
        </div>
      )}

      {fileQuizState?.active && (
        <div className="bl-file-grid">
          {FILES.map(f=>(
            <button key={f} className="bl-file-btn" onClick={()=>onFileAnswer(f)}>
              File {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {speedState?.active && (
        <div className="bl-speed-box">
          <div className="bl-speed-find">Find this square:</div>
          <div className="bl-speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
          <div className="bl-speed-bar-track">
            <div className="bl-speed-bar-fill"
              style={{width:`${(speedState.timeLeft/speedState.totalTime)*100}%`}}/>
          </div>
          <div className="bl-speed-meta">
            <span>⏱ {speedState.timeLeft}s left</span>
            <span>✓ {speedState.hits} correct</span>
          </div>
        </div>
      )}

      {!speedState?.active && !quizState?.active && !fileQuizState?.active && (
        <button className="bl-continue-btn" onClick={onContinue}>
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

  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [stepIdx,    setStepIdx]    = useState(0);
  const [voiceOn,    setVoiceOn]    = useState(true);
  const [isPlaying,  setIsPlaying]  = useState(false);

  // Board interaction state
  const [clicked,    setClicked]    = useState([]);
  const [wrongSqs,   setWrongSqs]   = useState([]);
  const [score,      setScore]      = useState(0);
  const [total,      setTotal]      = useState(0);
  const [streak,     setStreak]     = useState(0);
  const [feedback,   setFeedback]   = useState('');
  const [fbType,     setFbType]     = useState('info');

  // Neon highlight state (driven by voice parsing)
  const [neonSqs,    setNeonSqs]    = useState([]);
  const [neonFiles,  setNeonFiles]  = useState([]);
  const [neonRanks,  setNeonRanks]  = useState([]);
  const [glowPieces, setGlowPieces] = useState([]); // piece names to glow in tray

  // Lesson flow state
  const [indepIdx,   setIndepIdx]   = useState(0);
  const [quizState,  setQuizState]  = useState(null);
  const [quizIdx,    setQuizIdx]    = useState(0);
  const [fileQuizState, setFileQuizState] = useState(null);
  const [speedState, setSpeedState] = useState(null);
  const [lessonDone, setLessonDone] = useState(false);

  const speedRef = useRef(null);
  const voiceRef = useRef(false);
  const neonTimer = useRef(null);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step  = steps[stepIdx];

  // ── Fill name placeholder ─────────────────────────
  function fill(text) {
    return (text || '').replace(/\{name\}/g, childName);
  }

  // ── Neon highlight from voice text ───────────────
  function applyNeonFromText(text) {
    const mentions = parseHighlights(text);
    const sqs = [], files = [], ranks = [], pieces = [];
    mentions.forEach(m => {
      if (m.type === 'square') sqs.push(m.value);
      else if (m.type === 'file') files.push(m.value);
      else if (m.type === 'rank') ranks.push(m.value);
      else if (m.type === 'piece') pieces.push(m.value);
    });
    if (sqs.length)    setNeonSqs(sqs);
    if (files.length)  setNeonFiles(files);
    if (ranks.length)  setNeonRanks(ranks);
    if (pieces.length) setGlowPieces(pieces);

    // Clear after 8 seconds
    clearTimeout(neonTimer.current);
    neonTimer.current = setTimeout(() => {
      setNeonSqs([]); setNeonFiles([]); setNeonRanks([]); setGlowPieces([]);
    }, 8000);
  }

  // ── Reset on step change ──────────────────────────
  useEffect(() => {
    voiceRef.current = false;
    setClicked([]); setWrongSqs([]);
    setFeedback(''); setFbType('info');
    setSpeedState(null);
    setNeonSqs([]); setNeonFiles([]); setNeonRanks([]); setGlowPieces([]);
    setIndepIdx(0);

    if (step?.taskType === 'colour-quiz') {
      setQuizState({ active:true }); setQuizIdx(0);
    } else { setQuizState(null); }

    if (step?.taskType === 'file-name-quiz') { startFileQuiz(); }
    else { setFileQuizState(null); }
  }, [phaseIdx, stepIdx]);

  // ── Auto-play voice ───────────────────────────────
  useEffect(() => {
    if (!voiceOn || !step?.voice || voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice);
    const t = setTimeout(() => {
      applyNeonFromText(text);
      speakElevenLabs(text, {
        onStart: () => setIsPlaying(true),
        onEnd:   () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [phaseIdx, stepIdx, voiceOn]);

  // ── Advance ───────────────────────────────────────
  function nextStep() {
    stopSpeech();
    setNeonSqs([]); setNeonFiles([]); setNeonRanks([]); setGlowPieces([]);
    const next = stepIdx + 1;
    if (next < steps.length) {
      setStepIdx(next);
    } else {
      const nextP = phaseIdx + 1;
      if (nextP < phases.length) {
        setPhaseIdx(nextP); setStepIdx(0);
      } else {
        setLessonDone(true);
        speakElevenLabs(`Congratulations ${childName}! You have completed your very first chess lesson! You are amazing!`);
        setTimeout(() => onComplete?.(), 3500);
      }
    }
  }

  function showFb(msg, type, voice = '') {
    setFeedback(fill(msg));
    setFbType(type);
    if (voice && voiceOn) {
      const vt = fill(voice);
      applyNeonFromText(vt);
      speakElevenLabs(vt, { onStart:()=>setIsPlaying(true), onEnd:()=>setIsPlaying(false) });
    }
  }

  // ── Square click ──────────────────────────────────
  function handleSquareClick(sq) {
    if (!step) return;
    const { taskType } = step;

    if (taskType === 'click-file') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq];
        setClicked(nc); setStreak(s=>s+1);
        if (nc.length === step.targetSquares.length) {
          setScore(s=>s+nc.length); setTotal(t=>t+nc.length);
          showFb(step.successVoice||'File complete!', 'success', step.successVoice);
          setTimeout(()=>nextStep(), 1800);
        } else showFb(`✓ ${nc.length} of ${step.targetSquares.length} — keep clicking!`, 'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0);
        setTimeout(()=>setWrongSqs([]),600);
        showFb('That square is not in this file — click inside the glowing column!','error');
      }
      return;
    }

    if (taskType === 'click-rank') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq];
        setClicked(nc); setStreak(s=>s+1);
        if (nc.length === step.targetSquares.length) {
          setScore(s=>s+nc.length); setTotal(t=>t+nc.length);
          showFb(step.successVoice||'Rank complete!','success',step.successVoice);
          setTimeout(()=>nextStep(),1800);
        } else showFb(`✓ ${nc.length} of ${step.targetSquares.length} — keep going!`,'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0);
        setTimeout(()=>setWrongSqs([]),600);
        showFb('That square is not in this rank — click along the glowing row!','error');
      }
      return;
    }

    if (taskType === 'click-square') {
      setTotal(t=>t+1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s=>s+1); setStreak(s=>s+1);
        showFb(step.successVoice||'Correct!','success',step.successVoice);
        setTimeout(()=>nextStep(),1800);
      } else {
        setWrongSqs([sq]); setStreak(0);
        setTimeout(()=>setWrongSqs([]),700);
        showFb(step.wrongVoice||'Not quite — try again!','error',step.wrongVoice);
      }
      return;
    }

    if (taskType === 'independent-squares') {
      const tgts = step.targetSquares || [];
      const curr = tgts[indepIdx];
      if (!curr) return;
      setTotal(t=>t+1);
      if (sq === curr) {
        setClicked(p=>[...p,sq]); setScore(s=>s+1); setStreak(s=>s+1);
        const vm = (step.voiceCorrect?.[indepIdx]||'Correct!').replace(/\{name\}/g,childName);
        showFb(vm,'success');
        if (voiceOn) { applyNeonFromText(vm); speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)}); }
        const ni = indepIdx+1;
        if (ni >= tgts.length) {
          const vm2=(step.successVoice||`Well done!`).replace('{score}',score+1).replace(/\{name\}/g,childName);
          setTimeout(()=>{ showFb(vm2,'success'); },500);
          setTimeout(()=>nextStep(),2500);
        } else {
          setIndepIdx(ni);
          const nextSq=tgts[ni];
          setTimeout(()=>{
            const hintMsg=`Now find ${nextSq.toUpperCase()}`;
            showFb(hintMsg,'hint');
            setNeonSqs([]); // clear old
            if(voiceOn) speakElevenLabs(`Now find ${nextSq}`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
          },700);
        }
      } else {
        setWrongSqs([sq]); setStreak(0);
        setTimeout(()=>setWrongSqs([]),700);
        const vm=(step.voiceWrong||`Look for ${curr}!`)
          .replace('{sq}',curr.toUpperCase())
          .replace('{file}',curr[0].toUpperCase())
          .replace('{fileNum}',String(curr.charCodeAt(0)-96))
          .replace('{rank}',curr[1])
          .replace(/\{name\}/g,childName);
        showFb(vm,'error');
        if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      }
      return;
    }

    if (taskType==='speed-round' && speedState?.active) {
      if (sq===speedState.currentTarget) {
        const nh=speedState.hits+1;
        setClicked(p=>[...p,sq]); setStreak(s=>s+1);
        const rem=speedState.targets.filter(t=>t!==sq&&!speedState.done.includes(t));
        if(rem.length===0){endSpeedRound(nh);}
        else{
          const next=rem[0];
          setSpeedState(p=>({...p,hits:nh,currentTarget:next,done:[...p.done,sq]}));
          setNeonSqs([next]);
          showFb(`✓ ${sq.toUpperCase()} — now find ${next.toUpperCase()}!`,'success');
        }
      } else {
        setWrongSqs([sq]); setStreak(0);
        setTimeout(()=>setWrongSqs([]),400);
      }
    }
  }

  // ── Speed round ───────────────────────────────────
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
    setSpeedState(p=>p?{...p,active:false}:p);
    setNeonSqs([]);
    const tgt=step.targetScore||12, tot=(step.targetSquares||[]).length;
    setScore(hits); setTotal(tot);
    let vm = hits>=tgt ? step.successVoice : hits>=tgt*0.7 ? step.goodVoice : step.tryAgainVoice;
    vm=(vm||`You scored ${hits}!`).replace('{score}',hits).replace(/\{name\}/g,childName);
    showFb(vm,hits>=tgt?'success':'hint',vm);
    setTimeout(()=>nextStep(),3000);
  }

  // ── Colour quiz ───────────────────────────────────
  function handleLightDark(answer) {
    if(!quizState?.active) return;
    const qs=step.quizSquares||[], curr=qs[quizIdx];
    if(!curr) return;
    setTotal(t=>t+1);
    if(answer===curr.colour){
      setScore(s=>s+1); setStreak(s=>s+1);
      setClicked(p=>[...p,curr.sq]);
      const vm=(step.voiceCorrect||'Correct!').replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'success');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const ni=quizIdx+1;
      if(ni>=qs.length){setQuizState({active:false});setTimeout(()=>{const vm2=(step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName);showFb(vm2,'success');},500);setTimeout(()=>nextStep(),2500);}
      else{setQuizIdx(ni);const nxt=qs[ni];setNeonSqs([nxt.sq]);setTimeout(()=>showFb(`Is ${nxt.sq.toUpperCase()} light or dark?`,'hint'),700);}
    } else {
      setStreak(0);setWrongSqs([curr.sq]);setTimeout(()=>setWrongSqs([]),800);
      const vm=(step.voiceWrong||`${curr.sq} is ${curr.colour}!`).replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'error');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  // ── File quiz ─────────────────────────────────────
  function startFileQuiz() {
    const shuffled=[...FILES].sort(()=>Math.random()-0.5).slice(0,6);
    setFileQuizState({active:true,remaining:shuffled.slice(1),current:shuffled[0]});
    setNeonFiles([shuffled[0]]);
  }

  function handleFileAnswer(answer) {
    if(!fileQuizState?.active) return;
    const curr=fileQuizState.current;
    setTotal(t=>t+1);
    if(answer===curr){
      setScore(s=>s+1); setStreak(s=>s+1);
      showFb(`Correct! That was file ${curr.toUpperCase()}!`,'success');
      if(voiceOn) speakElevenLabs(`Yes! File ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const rem=fileQuizState.remaining;
      if(rem.length===0){setFileQuizState({active:false});setNeonFiles([]);setTimeout(()=>nextStep(),1800);}
      else{setTimeout(()=>{setFileQuizState({active:true,remaining:rem.slice(1),current:rem[0]});setNeonFiles([rem[0]]);showFb('Which file is this?','hint');},900);}
    } else {
      setStreak(0);
      showFb(`Not quite — that was file ${curr.toUpperCase()}!`,'error');
      if(voiceOn) speakElevenLabs(`Not quite! That is file ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  // ── Continue handler ──────────────────────────────
  function handleContinue() {
    if(step?.taskType==='speed-intro'){startSpeedRound();return;}
    if(step?.taskType==='complete'){setLessonDone(true);setTimeout(()=>onComplete?.(),1500);return;}
    nextStep();
  }

  // ── Target squares for current step ──────────────
  const targetSqs = step?.taskType==='independent-squares'
    ? [step.targetSquares?.[indepIdx]].filter(Boolean)
    : step?.taskType==='colour-quiz'&&quizState?.active
    ? [step.quizSquares?.[quizIdx]?.sq].filter(Boolean)
    : step?.taskType==='speed-round'&&speedState?.active
    ? [] // neon handles it
    : step?.taskType==='click-square' ? (step.targetSquares||[])
    : [];

  // ── Neon from step definition ─────────────────────
  const stepNeonSqs   = [...neonSqs,   ...(step?.highlights||[])];
  const stepNeonFiles = [...neonFiles, step?.highlightFile ? [step.highlightFile] : []].flat();
  const stepNeonRanks = [...neonRanks, step?.highlightRank ? [String(step.highlightRank)] : []].flat();

  if(lessonDone) return (
    <div className="bl-done">
      <div className="bl-done-card">
        <div style={{fontSize:60,marginBottom:14}}>🏆</div>
        <h2>Lesson 1 Complete!</h2>
        <p className="bl-done-sub">The Board — Files, Ranks and Squares</p>
        <p className="bl-done-msg">Outstanding work {childName}! You know the entire chess board. You are ready for Lesson 2!</p>
        <div className="bl-done-score">
          <span className="bl-done-n">{score}</span>
          <span className="bl-done-lbl"> squares found correctly</span>
        </div>
      </div>
    </div>
  );

  const pct = Math.round((phaseIdx/phases.length)*100);
  const contLabel = step?.taskType==='speed-intro' ? '⚡ Start Speed Challenge!' : step?.continueLabel||'Continue →';

  return (
    <div className="bl-root">

      {/* Top bar */}
      <div className="bl-topbar">
        <div>
          <div className="bl-title">{lesson.title}</div>
          <div className="bl-sub">{lesson.subtitle}</div>
        </div>
        <div className="bl-prog-wrap">
          <div className="bl-prog-track"><div className="bl-prog-fill" style={{width:`${pct}%`}}/></div>
          <span className="bl-prog-phase">{phase?.title}</span>
          <span className="bl-prog-pct">{pct}%</span>
        </div>
      </div>

      {/* Main layout: tray-board-tray | result */}
      <div className="bl-main">

        {/* Left: board column with piece trays */}
        <div className="bl-board-col">

          {/* BLACK pieces tray — above the board */}
          <PieceTray color="b" glowPieces={glowPieces} label="Black's pieces" />

          {/* The board */}
          <div className="bl-board-section">
            <ChessBoard
              neonSquares={stepNeonSqs}
              neonFiles={stepNeonFiles}
              neonRanks={stepNeonRanks}
              clickedSquares={clicked}
              wrongSquares={wrongSqs}
              targetSquares={targetSqs}
              showColours={step?.boardState==='coloured'}
              onSquareClick={handleSquareClick}
            />
          </div>

          {/* WHITE pieces tray — below the board */}
          <PieceTray color="w" glowPieces={glowPieces} label="White's pieces" />

        </div>

        {/* Right: result panel */}
        <ResultPanel
          phase={phase} step={step}
          score={score} total={total} streak={streak}
          feedback={feedback} fbType={fbType}
          onContinue={handleContinue} continueLabel={contLabel}
          speedState={speedState?.active?speedState:null}
          quizState={quizState?.active?quizState:null}
          onLightDark={handleLightDark}
          fileQuizState={fileQuizState?.active?fileQuizState:null}
          onFileAnswer={handleFileAnswer}
          isPlaying={isPlaying}
        />
      </div>

      {/* Tutor bar */}
      <div className="bl-tutor-bar">
        <div className="bl-tutor-av">🎓</div>
        <div className="bl-tutor-bubble">
          <div className="bl-tutor-name">
            Ms. Momo
            {voiceOn&&<span className="bl-voice-pill">{isPlaying?'🔊 speaking...':'🔊 voice on'}</span>}
          </div>
          <p className="bl-tutor-txt">{fill(step?.voice||'')}</p>
        </div>
        <button className={`bl-voice-btn ${voiceOn?'bl-voc-on':''}`} onClick={()=>{
          const n=!voiceOn; setVoiceOn(n);
          if(!n) stopSpeech();
          else if(step?.voice){ const t=fill(step.voice); applyNeonFromText(t); speakElevenLabs(t,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)}); }
        }}>{voiceOn?'🔊':'🔇'}</button>
      </div>
    </div>
  );
}
