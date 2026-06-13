/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LESSON_1 } from '../../data/chessLesson1';
import { speakElevenLabs, stopSpeech, parseHighlights, unlockAudio } from '../../utils/elevenlabs';
import './ChessBoardLesson.css';

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS_TOP_TO_BOT = ['8','7','6','5','4','3','2','1'];
const PIECE_NAMES = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };

// ─────────────────────────────────────────────────────
// SVG CHESS PIECES — solid, bold, professional
// Inline React SVG — zero external dependencies
// ─────────────────────────────────────────────────────
function PieceSVG({ type, color, size = 52 }) {
  const w = color === 'w' ? '#FFFFFF' : '#1a1a1a';
  const s = color === 'w' ? '#000000' : '#888888';
  const sw = 1.5;
  const sc = `scale(${size / 45})`;

  const shapes = {
    K: <g transform={sc}>
      <polygon points="22.5,11 11,11 8.5,4 16,7.5 22.5,2 29,7.5 36.5,4 34,11 22.5,11" fill={w} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>
      <path d="M11,11 Q8.5,35 8.5,40 L36.5,40 Q36.5,35 34,11Z" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="20" y="2" width="5" height="10" rx="1.5" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="17" y="5" width="11" height="3.5" rx="1.5" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M8.5,40 Q8.5,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
    Q: <g transform={sc}>
      <circle cx="6" cy="12" r="3.5" fill={w} stroke={s} strokeWidth={sw}/>
      <circle cx="15" cy="9" r="3.5" fill={w} stroke={s} strokeWidth={sw}/>
      <circle cx="22.5" cy="8" r="3.5" fill={w} stroke={s} strokeWidth={sw}/>
      <circle cx="30" cy="9" r="3.5" fill={w} stroke={s} strokeWidth={sw}/>
      <circle cx="39" cy="12" r="3.5" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M6,12 Q7,27 9,30 L36,30 Q38,27 39,12 Q30,21 22.5,15 Q15,21 6,12Z" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="9" y="30" width="27" height="10" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
    R: <g transform={sc}>
      <rect x="9"  y="7" width="6" height="8" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="20" y="7" width="5" height="8" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="30" y="7" width="6" height="8" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="9" y="13" width="27" height="5" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <rect x="11" y="18" width="23" height="18" rx="1" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
    B: <g transform={sc}>
      <circle cx="22.5" cy="9" r="4" fill={w} stroke={s} strokeWidth={sw}/>
      <ellipse cx="22.5" cy="26" rx="9" ry="15" fill={w} stroke={s} strokeWidth={sw}/>
      <ellipse cx="22.5" cy="26" rx="4.5" ry="9" fill={s}/>
      <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Q22.5,36 9,40Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
    N: <g transform={sc}>
      <path d="M22,10 Q13,10 10,17 Q9,22 10,26 Q11.5,28 14.5,28.5 Q12,32 11,36 L34,36 Q33,31 32,29 Q35.5,27 36.5,23 Q37,15 30,11.5 Q27,9.5 22,10Z" fill={w} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>
      <circle cx="17" cy="18" r="2.5" fill={s}/>
      <path d="M10,26 Q14,25 16.5,27 Q14,29.5 12,33 Q10,30 10,26Z" fill={s}/>
      <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
    P: <g transform={sc}>
      <circle cx="22.5" cy="12" r="6.5" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M14,23 Q14,34 16,36 L29,36 Q31,34 31,23 Q27,26.5 22.5,26.5 Q18,26.5 14,23Z" fill={w} stroke={s} strokeWidth={sw}/>
      <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L16,36 L29,36Z" fill={w} stroke={s} strokeWidth={sw}/>
    </g>,
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', filter: color==='w' ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}>
      {shapes[type]}
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// FULL-SCREEN CHESS BOARD
// Like lichess — takes up most of the viewport
// ─────────────────────────────────────────────────────
function ChessBoard({
  neonFile = null, neonRank = null, neonSquares = [],
  clickedSquares = [], wrongSquares = [], targetSquares = [],
  onSquareClick,
}) {
  const boardRef = useRef(null);
  const [sqSize, setSqSize] = useState(70);

  // Responsive square size based on container
  useEffect(() => {
    function measure() {
      if (!boardRef.current) return;
      const available = Math.min(
        boardRef.current.parentElement?.clientHeight - 20 || 560,
        boardRef.current.parentElement?.clientWidth - 20 || 560,
        580
      );
      setSqSize(Math.floor(available / 8));
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  function getBg(file, rankNum) {
    const fi  = FILES.indexOf(file);
    const ri  = rankNum - 1;
    const sq  = `${file}${rankNum}`;
    const isLight = (fi + ri) % 2 !== 0;

    if (wrongSquares.includes(sq))   return '#e24b4a';
    if (clickedSquares.includes(sq)) return '#1d9e75';
    if (neonSquares.includes(sq))    return 'rgba(255,220,0,0.92)';
    if (neonFile === file)           return isLight ? '#f5e87a' : '#c8b800';
    if (neonRank === String(rankNum)) return isLight ? '#f5e87a' : '#c8b800';
    if (targetSquares.includes(sq) && !clickedSquares.includes(sq))
      return isLight ? 'rgba(80,220,100,0.85)' : 'rgba(30,140,60,0.9)';
    return isLight ? '#f0d9b5' : '#b58863';
  }

  const boardPx = sqSize * 8;

  return (
    <div ref={boardRef} className="board-outer">
      {/* Rank labels left */}
      <div className="board-ranks">
        {RANKS_TOP_TO_BOT.map(r => (
          <div key={r} className={`board-rank-lbl ${neonRank===r?'coord-neon':''}`}
            style={{ height: sqSize, lineHeight: `${sqSize}px`, fontSize: Math.max(12, sqSize*0.22) }}>
            {r}
          </div>
        ))}
      </div>

      <div>
        {/* The board grid */}
        <div className="board-grid" style={{ width: boardPx, height: boardPx }}>
          {RANKS_TOP_TO_BOT.map((rankLabel, ri) => {
            const rankNum = parseInt(rankLabel);
            return FILES.map((file, fi) => {
              const sq = `${file}${rankNum}`;
              const bg = getBg(file, rankNum);
              const isClicked = clickedSquares.includes(sq);
              const isTgt = targetSquares.includes(sq) && !isClicked;
              const isNeon = neonSquares.includes(sq) || neonFile===file || neonRank===String(rankNum);
              const isWrong = wrongSquares.includes(sq);

              return (
                <div key={sq}
                  className={`board-sq ${onSquareClick?'board-sq-click':''}`}
                  style={{ width: sqSize, height: sqSize, background: bg, left: fi*sqSize, top: ri*sqSize }}
                  onClick={() => onSquareClick?.(sq)}
                >
                  {/* Green target ring */}
                  {isTgt && (
                    <div className="sq-target-ring"
                      style={{ inset: sqSize*0.08, borderWidth: sqSize*0.06, borderRadius: sqSize*0.08 }} />
                  )}
                  {/* Neon ring */}
                  {isNeon && !isTgt && (
                    <div className="sq-neon-ring"
                      style={{ inset: sqSize*0.05, borderWidth: sqSize*0.055, borderRadius: sqSize*0.07 }} />
                  )}
                  {/* Tick for clicked */}
                  {isClicked && (
                    <span className="sq-tick" style={{ fontSize: sqSize * 0.55 }}>✓</span>
                  )}
                  {/* Error X */}
                  {isWrong && (
                    <span className="sq-tick" style={{ fontSize: sqSize * 0.5 }}>✗</span>
                  )}
                  {/* Coordinate labels on edge squares */}
                  {ri === 7 && (
                    <span className="sq-file-label" style={{ fontSize: sqSize*0.2, bottom: sqSize*0.04, right: sqSize*0.05 }}>
                      {file}
                    </span>
                  )}
                  {fi === 0 && (
                    <span className="sq-rank-label" style={{ fontSize: sqSize*0.2, top: sqSize*0.04, left: sqSize*0.05 }}>
                      {rankNum}
                    </span>
                  )}
                </div>
              );
            });
          })}
        </div>

        {/* File labels bottom */}
        <div className="board-files" style={{ paddingLeft: 0 }}>
          {FILES.map(f => (
            <div key={f} className={`board-file-lbl ${neonFile===f?'coord-neon':''}`}
              style={{ width: sqSize, fontSize: Math.max(11, sqSize*0.2) }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PIECE TRAY — horizontal strip, above and below board
// ─────────────────────────────────────────────────────
function PieceTray({ color, glowPieces = [], label, sqSize = 70 }) {
  const pieceSize = Math.max(32, sqSize * 0.52);
  const types = ['K','Q','R','R','B','B','N','N'];

  return (
    <div className="tray-strip">
      <div className="tray-strip-label">{label}</div>
      <div className="tray-strip-row">
        {types.map((t, i) => {
          const nm = PIECE_NAMES[t];
          const glow = glowPieces.includes(nm.toLowerCase()) || glowPieces.includes(t.toLowerCase());
          return (
            <div key={`${t}-${i}`} className={`tray-strip-piece ${glow?'tray-piece-glow':''}`}
              style={{ padding: pieceSize * 0.1 }}>
              <PieceSVG type={t} color={color} size={pieceSize} />
              <span className="tray-piece-nm" style={{ fontSize: Math.max(8, pieceSize*0.22) }}>{nm}</span>
            </div>
          );
        })}
        {/* Pawns */}
        <div className={`tray-strip-piece tray-pawns-piece ${glowPieces.includes('pawn')?'tray-piece-glow':''}`}
          style={{ padding: pieceSize * 0.1 }}>
          <div className="tray-pawn-cluster">
            <PieceSVG type="P" color={color} size={pieceSize * 0.8} />
            <span className="tray-pawn-x" style={{ fontSize: Math.max(11, pieceSize*0.28) }}>×8</span>
          </div>
          <span className="tray-piece-nm" style={{ fontSize: Math.max(8, pieceSize*0.22) }}>Pawns</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// RIGHT PANEL — task, score, buttons
// ─────────────────────────────────────────────────────
function RightPanel({
  phase, step, score, total, streak,
  feedback, fbType,
  onContinue, continueLabel,
  speedState, quizState, onLightDark,
  fileQuizState, onFileAnswer, isPlaying,
}) {
  return (
    <div className="right-panel">

      <div className="rp-phase-chip">
        <span className="rp-phase-icon">
          {phase?.type==='story'?'📖':phase?.type==='files'?'📊':
           phase?.type==='ranks'?'📈':phase?.type==='squares'?'🎯':
           phase?.type==='colours'?'🎨':phase?.type==='speed'?'⚡':'✅'}
        </span>
        <div>
          <div className="rp-phase-name">{phase?.title}</div>
          <div className="rp-phase-mins">{phase?.durationMins} minutes</div>
        </div>
      </div>

      {step?.task && (
        <div className="rp-task">
          <div className="rp-task-lbl">Your task</div>
          <div className="rp-task-txt">{step.task}</div>
        </div>
      )}

      {isPlaying && (
        <div className="rp-speaking">
          <div className="rp-speaking-dot" />
          <span>Ms. Momo is speaking...</span>
        </div>
      )}

      {total > 0 && (
        <div className="rp-score-row">
          <div className="rp-score">
            <span className="rp-score-n">{score}</span>
            <span className="rp-score-d"> / {total}</span>
          </div>
          {streak >= 3 && <div className="rp-streak">🔥 {streak} in a row!</div>}
        </div>
      )}

      {feedback && (
        <div className={`rp-fb rp-fb-${fbType}`}>
          {fbType==='success'?'✅ ':fbType==='error'?'❌ ':'💡 '}{feedback}
        </div>
      )}

      {quizState?.active && (
        <div className="rp-col-btns">
          <button className="rp-light-btn" onClick={()=>onLightDark('light')}>☀️ Light Square</button>
          <button className="rp-dark-btn"  onClick={()=>onLightDark('dark')}>🌑 Dark Square</button>
        </div>
      )}

      {fileQuizState?.active && (
        <div className="rp-file-grid">
          {FILES.map(f => (
            <button key={f} className="rp-file-btn" onClick={()=>onFileAnswer(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {speedState?.active && (
        <div className="rp-speed">
          <div className="rp-speed-label">Find this square:</div>
          <div className="rp-speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
          <div className="rp-speed-track">
            <div className="rp-speed-fill"
              style={{width:`${(speedState.timeLeft/speedState.totalTime)*100}%`}}/>
          </div>
          <div className="rp-speed-meta">
            <span>⏱ {speedState.timeLeft}s</span>
            <span>✓ {speedState.hits} correct</span>
          </div>
        </div>
      )}

      {!speedState?.active && !quizState?.active && !fileQuizState?.active && (
        <button className="rp-continue" onClick={onContinue}>
          {continueLabel || 'Continue →'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────
export default function ChessBoardLesson({ childName = 'Student', onComplete }) {
  const lesson = LESSON_1;
  const phases = lesson.phases;

  const [phaseIdx,   setPhaseIdx]   = useState(0);
  const [stepIdx,    setStepIdx]    = useState(0);
  const [voiceOn,    setVoiceOn]    = useState(true);
  const [isPlaying,  setIsPlaying]  = useState(false);

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

  const [indepIdx,   setIndepIdx]  = useState(0);
  const [quizState,  setQuizState] = useState(null);
  const [quizIdx,    setQuizIdx]   = useState(0);
  const [fileQS,     setFileQS]    = useState(null);
  const [speedState, setSpeed]     = useState(null);
  const [lessonDone, setLessonDone]= useState(false);

  const speedRef  = useRef(null);
  const voiceRef  = useRef(false);
  const neonTimer = useRef(null);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step  = steps[stepIdx];

  const fill = t => (t||'').replace(/\{name\}/g, childName);

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
    neonTimer.current = setTimeout(()=>{ setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]); }, 9000);
  }

  function clearNeon() { setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]); }

  useEffect(() => {
    voiceRef.current = false;
    setClicked([]); setWrongSqs([]); setFeedback(''); setFbType('info');
    setSpeed(null); setIndepIdx(0); clearNeon();

    if (step?.highlightFile)    setNeonFile(step.highlightFile);
    if (step?.highlightRank)    setNeonRank(String(step.highlightRank));
    if (step?.highlights?.length) setNeonSqs(step.highlights);

    if (['click-file','click-rank','click-square'].includes(step?.taskType))
      setTargetSqs(step.targetSquares||[]);
    else setTargetSqs([]);

    if (step?.taskType==='colour-quiz') {
      setQuizState({active:true}); setQuizIdx(0);
      const f=step.quizSquares?.[0]?.sq; if(f) setNeonSqs([f]);
    } else setQuizState(null);

    if (step?.taskType==='file-name-quiz') startFileQuiz();
    else setFileQS(null);
  }, [phaseIdx, stepIdx]);

  useEffect(() => {
    if (!voiceOn || !step?.voice || voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice);
    const t = setTimeout(() => {
      applyNeon(text);
      speakElevenLabs(text, {
        onStart: ()=>setIsPlaying(true),
        onEnd:   ()=>setIsPlaying(false),
        onError: ()=>setIsPlaying(false),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [phaseIdx, stepIdx, voiceOn]);

  const nextStep = useCallback(() => {
    stopSpeech(); clearNeon();
    const nsi = stepIdx+1;
    if (nsi < steps.length) { setStepIdx(nsi); return; }
    const npi = phaseIdx+1;
    if (npi < phases.length) { setPhaseIdx(npi); setStepIdx(0); return; }
    setLessonDone(true);
    speakElevenLabs(`Congratulations ${childName}! You have completed your first chess lesson! You are amazing!`);
    setTimeout(()=>onComplete?.(), 4000);
  }, [stepIdx, steps.length, phaseIdx, phases.length, childName]);

  function showFb(msg, type, voice='') {
    setFeedback(fill(msg)); setFbType(type);
    if (voice && voiceOn) {
      const vt=fill(voice); applyNeon(vt);
      speakElevenLabs(vt, {onStart:()=>setIsPlaying(true), onEnd:()=>setIsPlaying(false)});
    }
  }

  function handleSquareClick(sq) {
    unlockAudio();
    if (!step) return;
    const tt = step.taskType;

    if (tt==='click-file'||tt==='click-rank') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc=[...clicked,sq]; setClicked(nc); setStreak(s=>s+1);
        if (nc.length===step.targetSquares.length) {
          setScore(s=>s+nc.length); setTotal(t=>t+nc.length); setTargetSqs([]);
          showFb(step.successVoice||'Complete!','success',step.successVoice);
          setTimeout(nextStep, 1800);
        } else showFb(`✓ ${nc.length} of ${step.targetSquares.length}!`,'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),700);
        showFb(`That square is not in this ${tt==='click-file'?'file':'rank'}!`,'error');
      }
      return;
    }

    if (tt==='click-square') {
      setTotal(t=>t+1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s=>s+1); setStreak(s=>s+1); setTargetSqs([]);
        showFb(step.successVoice||'Correct!','success',step.successVoice);
        setTimeout(nextStep, 1800);
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
        if (voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
        const ni=indepIdx+1;
        if (ni>=tgts.length) {
          setTimeout(()=>showFb((step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName),'success'),500);
          setTimeout(nextStep,2500);
        } else {
          setIndepIdx(ni);
          setTimeout(()=>{ setNeonSqs([tgts[ni]]); showFb(`Now find: ${tgts[ni].toUpperCase()}`,'hint');
            if(voiceOn) speakElevenLabs(`Now find ${tgts[ni]}`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
          },700);
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),700);
        const vm=(step.voiceWrong||`Not quite!`).replace('{sq}',curr.toUpperCase()).replace('{file}',curr[0].toUpperCase()).replace('{fileNum}',String(curr.charCodeAt(0)-96)).replace('{rank}',curr[1]).replace(/\{name\}/g,childName);
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
        if (!rem.length) endSpeed(nh);
        else { const next=rem[0]; setSpeed(p=>({...p,hits:nh,currentTarget:next,done:[...p.done,sq]})); setNeonSqs([next]); showFb(`✓ ${sq.toUpperCase()} — find ${next.toUpperCase()}!`,'success'); }
      } else { setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),400); }
    }
  }

  function startSpeed() {
    const tgts=step.targetSquares||[];
    setClicked([]); setStreak(0);
    setSpeed({active:true,targets:tgts,currentTarget:tgts[0],hits:0,done:[],timeLeft:step.timeLimitSecs||75,totalTime:step.timeLimitSecs||75});
    setNeonSqs([tgts[0]]);
    showFb(`Find ${tgts[0].toUpperCase()}!`,'hint');
    if(voiceOn) speakElevenLabs(`Go! Find ${tgts[0]}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    speedRef.current=setInterval(()=>{
      setSpeed(p=>{ if(!p) return p; const tl=p.timeLeft-1; if(tl<=0){clearInterval(speedRef.current);endSpeed(p.hits);return{...p,timeLeft:0,active:false};} return{...p,timeLeft:tl}; });
    },1000);
  }

  function endSpeed(hits) {
    clearInterval(speedRef.current); setSpeed(p=>p?{...p,active:false}:p); setNeonSqs([]);
    const tgt=step.targetScore||12; setScore(hits); setTotal((step.targetSquares||[]).length);
    let vm=hits>=tgt?step.successVoice:hits>=tgt*0.7?step.goodVoice:step.tryAgainVoice;
    vm=(vm||`You scored ${hits}!`).replace('{score}',hits).replace(/\{name\}/g,childName);
    showFb(vm,hits>=tgt?'success':'hint',vm); setTimeout(nextStep,3200);
  }

  function handleLightDark(answer) {
    unlockAudio();
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
      if(ni>=qs.length){setQuizState({active:false});const vm2=(step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName);setTimeout(()=>showFb(vm2,'success'),500);setTimeout(nextStep,2500);}
      else{setQuizIdx(ni);setNeonSqs([qs[ni].sq]);setTimeout(()=>showFb(`Is ${qs[ni].sq.toUpperCase()} light or dark?`,'hint'),700);}
    } else {
      setStreak(0); setWrongSqs([curr.sq]); setTimeout(()=>setWrongSqs([]),800);
      const vm=(step.voiceWrong||`${curr.sq} is ${curr.colour}!`).replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'error');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  function startFileQuiz() {
    const shuffled=[...FILES].sort(()=>Math.random()-0.5).slice(0,6);
    setFileQS({active:true,remaining:shuffled.slice(1),current:shuffled[0]});
    setNeonFile(shuffled[0]); setNeonRank(null); setNeonSqs([]);
  }

  function handleFileAnswer(answer) {
    unlockAudio();
    if(!fileQS?.active) return;
    const curr=fileQS.current; setTotal(t=>t+1);
    if(answer===curr){
      setScore(s=>s+1); setStreak(s=>s+1);
      showFb(`Correct! File ${curr.toUpperCase()}!`,'success');
      if(voiceOn) speakElevenLabs(`Yes! File ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const rem=fileQS.remaining;
      if(!rem.length){setFileQS({active:false});setNeonFile(null);setTimeout(nextStep,1800);}
      else setTimeout(()=>{setFileQS({active:true,remaining:rem.slice(1),current:rem[0]});setNeonFile(rem[0]);showFb('Which file is this?','hint');},900);
    } else {
      setStreak(0);
      showFb(`Not quite — that was file ${curr.toUpperCase()}!`,'error');
      if(voiceOn) speakElevenLabs(`Not quite! That is file ${curr}!`,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  function handleContinue() {
    unlockAudio();
    if(step?.taskType==='speed-intro'){startSpeed();return;}
    if(step?.taskType==='complete'){setLessonDone(true);setTimeout(()=>onComplete?.(),1500);return;}
    nextStep();
  }

  const boardNeonSqs = [
    ...neonSqs,
    ...(step?.taskType==='independent-squares'?[step.targetSquares?.[indepIdx]].filter(Boolean):[]),
    ...(step?.taskType==='colour-quiz'&&quizState?.active?[step.quizSquares?.[quizIdx]?.sq].filter(Boolean):[]),
    ...(step?.taskType==='speed-round'&&speedState?.active?[speedState.currentTarget].filter(Boolean):[]),
  ];

  const pct = Math.round((phaseIdx/phases.length)*100);

  if (lessonDone) return (
    <div className="lesson-done">
      <div className="done-card">
        <div style={{fontSize:64,marginBottom:16}}>🏆</div>
        <h2>Lesson 1 Complete!</h2>
        <p className="done-sub">The Board — Files, Ranks and Squares</p>
        <p className="done-msg">Outstanding work {childName}! You know every square on the chess board. You are ready for Lesson 2!</p>
        <div className="done-score-box"><span className="done-n">{score}</span><span className="done-l"> correct answers</span></div>
      </div>
    </div>
  );

  return (
    <div className="bl-root">
      {/* ── Top bar ── */}
      <div className="bl-topbar">
        <div className="bl-topbar-left">
          <span className="bl-lesson-title">{lesson.title}</span>
          <span className="bl-lesson-sub">{lesson.subtitle}</span>
        </div>
        <div className="bl-prog-wrap">
          <div className="bl-prog-phases">
            {phases.map((ph,i)=>(
              <div key={i} className={`bl-prog-phase-dot ${i===phaseIdx?'pp-active':i<phaseIdx?'pp-done':''}`}
                title={ph.title} />
            ))}
          </div>
          <span className="bl-prog-label">{phase?.title} · {pct}%</span>
        </div>
        <button className={`bl-voice-toggle ${voiceOn?'vt-on':''}`}
          onClick={()=>{
            unlockAudio();
            const n=!voiceOn; setVoiceOn(n);
            if(!n) stopSpeech();
            else if(step?.voice){const t=fill(step.voice);applyNeon(t);speakElevenLabs(t,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});}
          }}>
          {voiceOn?'🔊':'🔇'}
        </button>
      </div>

      {/* ── Main: board fills left, panel on right ── */}
      <div className="bl-main">

        {/* Board area — takes all available space */}
        <div className="bl-board-area">
          <PieceTray color="b" glowPieces={glowPieces} label="Black's pieces" />
          <ChessBoard
            neonFile={neonFile} neonRank={neonRank} neonSquares={boardNeonSqs}
            clickedSquares={clicked} wrongSquares={wrongSqs} targetSquares={targetSqs}
            onSquareClick={handleSquareClick}
          />
          <PieceTray color="w" glowPieces={glowPieces} label="White's pieces" />
        </div>

        {/* Right panel — narrow, scrollable */}
        <RightPanel
          phase={phase} step={step}
          score={score} total={total} streak={streak}
          feedback={feedback} fbType={fbType}
          onContinue={handleContinue}
          continueLabel={step?.taskType==='speed-intro'?'⚡ Start Challenge!':step?.continueLabel||'Continue →'}
          speedState={speedState?.active?speedState:null}
          quizState={quizState?.active?quizState:null} onLightDark={handleLightDark}
          fileQuizState={fileQS?.active?fileQS:null} onFileAnswer={handleFileAnswer}
          isPlaying={isPlaying}
        />
      </div>

      {/* ── Tutor bar ── */}
      <div className="bl-tutor-bar">
        <div className="tutor-av">🎓</div>
        <div className="tutor-bub">
          <div className="tutor-nm">
            Ms. Momo
            {voiceOn&&<span className="tutor-voice-badge">{isPlaying?'🔊 speaking...':'🔊 ElevenLabs'}</span>}
          </div>
          <p className="tutor-txt">{fill(step?.voice||'')}</p>
        </div>
      </div>
    </div>
  );
}
