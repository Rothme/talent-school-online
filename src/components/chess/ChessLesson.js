/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CHESS_LESSONS_EXPANDED } from '../../data/chessExpanded';
import './ChessLesson.css';

// ─────────────────────────────────────────────────────
// SVG PIECE PATHS — solid filled, bold, child-friendly
// ─────────────────────────────────────────────────────
function PieceSVG({ type, color, size = 32 }) {
  const s   = size;
  const col = color === 'w' ? '#ffffff' : '#1a1a1a';
  const str = color === 'w' ? '#111111' : '#666666';
  const sw  = color === 'w' ? 1.5 : 1.2;
  const sc  = `scale(${s / 45})`;

  const shapes = {
    K: (
      <g transform={sc}>
        <polygon points="22.5,11 11,11 8.5,4 16,7.5 22.5,2 29,7.5 36.5,4 34,11 22.5,11"
          fill={col} stroke={str} strokeWidth={sw} strokeLinejoin="round"/>
        <path d="M11,11 Q8.5,35 8.5,40 L36.5,40 Q36.5,35 34,11 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="20" y="2" width="5" height="10" rx="1.5" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="17" y="5" width="11" height="3.5" rx="1.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M8.5,40 Q8.5,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    Q: (
      <g transform={sc}>
        <circle cx="6"    cy="12" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="15"   cy="9"  r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="22.5" cy="8"  r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="30"   cy="9"  r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="39"   cy="12" r="3.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M6,12 Q7,27 9,30 L36,30 Q38,27 39,12 Q30,21 22.5,15 Q15,21 6,12Z"
          fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="9"  y="30" width="27" height="10" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    R: (
      <g transform={sc}>
        <rect x="9"  y="7" width="6" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="20" y="7" width="5" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="30" y="7" width="6" height="8" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="9"  y="13" width="27" height="5" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <rect x="11" y="18" width="23" height="18" rx="1" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    B: (
      <g transform={sc}>
        <circle cx="22.5" cy="9" r="4" fill={col} stroke={str} strokeWidth={sw}/>
        <circle cx="22.5" cy="9" r="1.5" fill={str}/>
        <ellipse cx="22.5" cy="26" rx="9" ry="15" fill={col} stroke={str} strokeWidth={sw}/>
        <ellipse cx="22.5" cy="26" rx="4.5" ry="9" fill={str}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 Q22.5,36 9,40 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    N: (
      <g transform={sc}>
        <path d="M22,10 Q13,10 10,17 Q9,22 10,26 Q11.5,28 14.5,28.5 Q12,32 11,36 L34,36 Q33,31 32,29 Q35.5,27 36.5,23 Q37,15 30,11.5 Q27,9.5 22,10 Z"
          fill={col} stroke={str} strokeWidth={sw} strokeLinejoin="round"/>
        <circle cx="17" cy="18" r="2.5" fill={str}/>
        <path d="M10,26 Q14,25 16.5,27 Q14,29.5 12,33 Q10,30 10,26 Z" fill={str}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L11,40 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
    P: (
      <g transform={sc}>
        <circle cx="22.5" cy="12" r="6.5" fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M14,23 Q14,34 16,36 L29,36 Q31,34 31,23 Q27,26.5 22.5,26.5 Q18,26.5 14,23 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
        <path d="M9,40 Q9,43.5 12,43.5 L33,43.5 Q36.5,43.5 36.5,40 L16,36 L29,36 Z"
          fill={col} stroke={str} strokeWidth={sw}/>
      </g>
    ),
  };

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display:'block' }}>
      {shapes[type]}
    </svg>
  );
}

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];
const PIECE_ORDER = ['K','Q','R','B','N','P'];
const PIECE_NAMES = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };
const SQ = 42; // square size in px

const FULL_START = [
  ['bR','bN','bB','bQ','bK','bB','bN','bR'],
  ['bP','bP','bP','bP','bP','bP','bP','bP'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['wP','wP','wP','wP','wP','wP','wP','wP'],
  ['wR','wN','wB','wQ','wK','wB','wN','wR'],
];

function emptyBoard() {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

function sqToRC(sq) {
  if (!sq || sq.length < 2) return null;
  const c = sq.charCodeAt(0) - 97;
  const r = 8 - parseInt(sq[1]);
  return (c >= 0 && c <= 7 && r >= 0 && r <= 7) ? [r, c] : null;
}

// ─────────────────────────────────────────────────────
// VOICE
// ─────────────────────────────────────────────────────
function speak(text, on) {
  if (!on || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.88; u.pitch = 1.1; u.volume = 1;
    const voices = window.speechSynthesis.getVoices() || [];
    const v = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|victoria|karen|google/i.test(v.name))
      || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch(e) {}
}

// ─────────────────────────────────────────────────────
// BUILD BOARD FROM STEP DEFINITION
// ─────────────────────────────────────────────────────
function boardFromDef(momoBoard) {
  if (!momoBoard) return emptyBoard();
  const { pieces } = momoBoard;
  if (pieces === 'FULL_START') return FULL_START.map(r => [...r]);
  const b = emptyBoard();
  if (Array.isArray(pieces)) {
    pieces.forEach(({ piece, square }) => {
      const rc = sqToRC(square);
      if (rc) b[rc[0]][rc[1]] = piece;
    });
  }
  return b;
}

// ─────────────────────────────────────────────────────
// GREEN CHESS BOARD — SVG rendered React component
// ─────────────────────────────────────────────────────
function ChessBoard({ board, highlights = [], targets = [], selected = null,
  onSquareDrop, onSquareClick, interactive = false, label, labelColor }) {

  const size = SQ * 8;

  function handleDragOver(e) { e.preventDefault(); }
  function handleDrop(e, r, c) {
    e.preventDefault();
    const piece = e.dataTransfer.getData('text/plain');
    if (piece && onSquareDrop) onSquareDrop(piece, r, c);
  }

  return (
    <div className="cb-container">
      <div className="cb-owner" style={{ color: labelColor }}>
        <span className="cb-owner-dot" style={{ background: labelColor }} />
        {label}
      </div>
      <div className="cb-inner">
        {/* Rank labels */}
        <div className="cb-ranks">
          {RANKS.map(r => (
            <div key={r} className="cb-rank-lbl" style={{ height: SQ }}>{r}</div>
          ))}
        </div>
        <div className="cb-right">
          {/* Board */}
          <div
            className="cb-board"
            style={{ width: size, height: size }}
            onDragOver={interactive ? handleDragOver : undefined}
          >
            {board.map((row, r) => row.map((piece, c) => {
              const light   = (r + c) % 2 === 0;
              const isHL    = highlights.some(h => h[0] === r && h[1] === c);
              const isTgt   = targets.some(h => h[0] === r && h[1] === c);
              const isSel   = selected && selected[0] === r && selected[1] === c;

              let bg = light ? '#eef6eb' : '#4a7c59';
              if (isSel) bg = 'rgba(108,99,255,0.75)';
              else if (isTgt && !piece) bg = 'rgba(60,220,90,0.82)';
              else if (isHL) bg = 'rgba(255,206,0,0.78)';

              return (
                <div
                  key={`${r}-${c}`}
                  className={`cb-sq ${isTgt && interactive && !piece ? 'cb-sq-pulse' : ''} ${interactive ? 'cb-sq-interactive' : ''}`}
                  style={{ width: SQ, height: SQ, background: bg, left: c * SQ, top: r * SQ }}
                  onDrop={interactive ? (e) => handleDrop(e, r, c) : undefined}
                  onDragOver={interactive ? handleDragOver : undefined}
                  onClick={interactive ? () => onSquareClick && onSquareClick(r, c) : undefined}
                >
                  {/* Target ring */}
                  {isTgt && !piece && interactive && (
                    <div className="cb-target-ring" />
                  )}
                  {/* Piece */}
                  {piece && (
                    <div className="cb-piece-wrap">
                      <PieceSVG type={piece[1]} color={piece[0]} size={SQ - 4} />
                    </div>
                  )}
                </div>
              );
            }))}
          </div>
          {/* File labels */}
          <div className="cb-files">
            {FILES.map(f => (
              <div key={f} className="cb-file-lbl" style={{ width: SQ }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PIECE TRAY
// ─────────────────────────────────────────────────────
function PieceTray({ activePieces, placedTypes = [], demo = false }) {
  function dragStart(e, code) {
    e.dataTransfer.setData('text/plain', code);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div className="tray-wrap">
      <div className="tray-label">
        {demo ? 'Ms. Momo\'s pieces' : 'Your pieces — drag the glowing one'}
      </div>
      <div className="tray-row">
        {PIECE_ORDER.map(type => {
          const code    = `w${type}`;
          const active  = !demo && activePieces.includes(type);
          const placed  = placedTypes.includes(type);
          const draggable = active && !placed;
          return (
            <div
              key={type}
              className={`tray-piece ${draggable ? 'tray-active' : 'tray-locked'}`}
              draggable={draggable}
              onDragStart={draggable ? (e) => dragStart(e, code) : undefined}
              title={draggable ? `Drag ${PIECE_NAMES[type]} to the board` : PIECE_NAMES[type]}
            >
              <PieceSVG type={type} color="w" size={30} />
              <span className="tray-piece-name">{PIECE_NAMES[type]}</span>
              {draggable && <span className="tray-active-glow" />}
            </div>
          );
        })}
      </div>
      {!demo && activePieces.length === 1 && (
        <div className="tray-hint">
          ☝ Only the <strong>{PIECE_NAMES[activePieces[0]]}</strong> is active this step
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// SESSION DOTS
// ─────────────────────────────────────────────────────
function SessionBar({ session, stepIdx, total }) {
  const color = session === 1 ? '#6c63ff' : '#1d9e75';
  const label = session === 1 ? 'Session 1 — Learn' : 'Session 2 — Challenge';
  return (
    <div className="sess-bar">
      <span className="sess-badge" style={{ background: color }}>{label}</span>
      <div className="sess-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i}
            className={`sess-dot ${i === stepIdx ? 'active' : i < stepIdx ? 'done' : ''}`}
            style={i === stepIdx ? { background: color } : {}} />
        ))}
      </div>
      <span className="sess-count">Step {stepIdx + 1} / {total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN ChessLesson
// ─────────────────────────────────────────────────────
export default function ChessLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {

  // Data guard
  if (!CHESS_LESSONS_EXPANDED?.length) {
    return <div className="chess-loading">Loading chess curriculum...</div>;
  }
  const lesson = CHESS_LESSONS_EXPANDED[Math.min(lessonIndex, CHESS_LESSONS_EXPANDED.length - 1)];
  if (!lesson?.session1?.steps?.length) {
    return <div className="chess-loading">Loading lesson {lessonIndex + 1}...</div>;
  }

  // ── State ────────────────────────────────────────
  const [sessionNum,  setSessionNum]  = useState(1);
  const [stepIdx,     setStepIdx]     = useState(0);
  const [board,       setBoard]       = useState(() => emptyBoard());
  const [placedTypes, setPlacedTypes] = useState([]);
  const [selected,    setSelected]    = useState(null);
  const [feedback,    setFeedback]    = useState({ type:'', text:'' });
  const [stepDone,    setStepDone]    = useState(false);
  const [lessonDone,  setLessonDone]  = useState(false);
  const [voiceOn,     setVoiceOn]     = useState(true);
  const voiceRef = useRef(false);

  const steps      = sessionNum === 1 ? lesson.session1.steps : (lesson.session2?.steps || []);
  const step       = steps[stepIdx] || steps[0];
  const totalSteps = steps.length;

  // Derived from step
  const momoBoard   = boardFromDef(step?.momoBoard);
  const hlRC        = (step?.momoBoard?.highlights || []).map(sq => sqToRC(sq)).filter(Boolean);
  const targetRC    = step?.targetPieces && Array.isArray(step.targetPieces)
    ? step.targetPieces.map(t => sqToRC(t.square)).filter(Boolean)
    : hlRC;

  // Which piece types are active this step (from targetPieces)
  const activePieces = step?.targetPieces && Array.isArray(step.targetPieces)
    ? [...new Set(step.targetPieces.map(t => t.piece?.[1]).filter(Boolean))]
    : [];

  // ── Reset on step change ─────────────────────────
  useEffect(() => {
    // Carry board state forward — do NOT reset board so movement is continuous
    setPlacedTypes([]);
    setSelected(null);
    setFeedback({ type:'', text:'' });
    setStepDone(false);
    voiceRef.current = false;
  }, [lessonIndex, sessionNum, stepIdx]);

  // Pre-populate board for move steps (piece must already be on board)
  useEffect(() => {
    if (step?.movePiece) {
      const rc = sqToRC(step.movePiece.from);
      if (rc) {
        setBoard(prev => {
          const nb = prev.map(r => [...r]);
          if (!nb[rc[0]][rc[1]]) {
            nb[rc[0]][rc[1]] = step.movePiece.piece || `w${activePieces[0] || 'K'}`;
          }
          return nb;
        });
      }
    }
  }, [stepIdx, sessionNum]);

  // ── Voice auto-play ──────────────────────────────
  useEffect(() => {
    if (voiceOn && step?.voice && !voiceRef.current) {
      voiceRef.current = true;
      const t = setTimeout(() => speak(step.voice, true), 500);
      return () => clearTimeout(t);
    }
  }, [stepIdx, sessionNum, lessonIndex, voiceOn]);

  // ── Advance ──────────────────────────────────────
  const nextStep = useCallback(() => {
    const next = stepIdx + 1;
    if (next >= totalSteps) {
      if (sessionNum === 1 && lesson.session2?.steps?.length) {
        setSessionNum(2);
        setStepIdx(0);
        speak(`Amazing work ${childName}! Session 1 is done. Now for Session 2 — puzzles and challenge!`, voiceOn);
      } else {
        setLessonDone(true);
        speak(`Fantastic ${childName}! You finished Lesson ${lesson.step} — ${lesson.title}! You are becoming a real chess player!`, voiceOn);
        setTimeout(() => onComplete?.(), 2800);
      }
    } else {
      setStepIdx(next);
    }
  }, [stepIdx, totalSteps, sessionNum, lesson, childName, voiceOn, onComplete]);

  function markDone(msg) {
    setFeedback({ type:'success', text: msg });
    setStepDone(true);
    speak(msg, voiceOn);
    setTimeout(() => nextStep(), 2400);
  }

  // ── Drop from tray ───────────────────────────────
  function handleDrop(pieceCode, r, c) {
    if (stepDone) return;
    if (step?.movePiece) {
      setFeedback({ type:'error', text: 'For this step, click the piece on the board first, then click where to move it!' });
      return;
    }
    if (!step?.targetPieces) { markDone(step?.outputSuccess || 'Good!'); return; }

    const match = Array.isArray(step.targetPieces) && step.targetPieces.find(tp => {
      const rc = sqToRC(tp.square);
      return rc && rc[0] === r && rc[1] === c && tp.piece === pieceCode;
    });

    if (match) {
      const nb = board.map(row => [...row]);
      nb[r][c] = pieceCode;
      setBoard(nb);
      const type = pieceCode[1];
      const newPlaced = [...placedTypes, type];
      setPlacedTypes(newPlaced);

      // Check all targets filled
      const allDone = step.targetPieces.every(tp => {
        const rc = sqToRC(tp.square);
        return rc && nb[rc[0]][rc[1]] === tp.piece;
      });
      if (allDone) {
        markDone(step.outputSuccess || `Correct! Well done ${childName}!`);
      } else {
        const rem = step.targetPieces.filter(tp => {
          const rc = sqToRC(tp.square);
          return rc && nb[rc[0]][rc[1]] !== tp.piece;
        }).length;
        setFeedback({ type:'hint', text: `Correct! ${rem} more piece${rem !== 1 ? 's' : ''} to place.` });
        speak(`Correct! Keep going — ${rem} more to place!`, voiceOn);
      }
    } else {
      const rightSquares = Array.isArray(step.targetPieces)
        ? step.targetPieces.filter(tp => tp.piece === pieceCode)
        : [];
      if (rightSquares.length) {
        setFeedback({ type:'error', text: step.outputWrong || `Not quite! Look for the glowing green square.` });
        speak('Not quite! Try the glowing green square.', voiceOn);
      } else {
        setFeedback({ type:'error', text: `That is not the right piece this step. Use the one with the green glow!` });
        speak('Use the glowing piece from the tray.', voiceOn);
      }
    }
  }

  // ── Click on student board ───────────────────────
  function handleSquareClick(r, c) {
    if (stepDone) return;

    // Move step — two-click: select then move
    if (step?.movePiece) {
      const fromRC = sqToRC(step.movePiece.from);
      const toRC   = sqToRC(step.movePiece.to);

      if (!selected) {
        // First click — must click the piece to move
        if (board[r][c]) {
          setSelected([r, c]);
          setFeedback({ type:'hint', text: `Good! Now click the green square to move there.` });
          speak('Good! Now click the green square.', voiceOn);
        } else {
          setFeedback({ type:'error', text: `Click on the ${PIECE_NAMES[activePieces[0]] || 'piece'} first!` });
        }
        return;
      }

      // Second click — move to destination
      if (toRC && r === toRC[0] && c === toRC[1]) {
        const nb = board.map(row => [...row]);
        const piece = nb[selected[0]][selected[1]];
        nb[toRC[0]][toRC[1]] = piece;
        nb[selected[0]][selected[1]] = null;
        setBoard(nb);
        setSelected(null);
        markDone(step.outputSuccess || `Perfect move!`);
      } else {
        setSelected(null);
        setFeedback({ type:'error', text: step.outputWrong || `Move to the glowing green square!` });
        speak('Move to the green glowing square!', voiceOn);
      }
      return;
    }

    // Instruction / free-play — click anywhere advances
    if (step?.type === 'instruction' || step?.freePlay) {
      markDone(step?.outputSuccess || 'Well done!');
    }
  }

  // ── Yes/No ───────────────────────────────────────
  function handleAnswer(ans) {
    if (stepDone) return;
    if (ans === step.correctAnswer) {
      markDone(step.outputSuccess || 'Correct!');
    } else {
      setFeedback({ type:'error', text: step.outputWrong || 'Not quite — think again!' });
      speak(step.outputWrong || 'Not quite!', voiceOn);
    }
  }

  // ── Lesson done ──────────────────────────────────
  if (lessonDone) {
    return (
      <div className="chess-done-screen">
        <div className="chess-done-card">
          <div className="chess-done-trophy">🏆</div>
          <h2>Lesson Complete!</h2>
          <p className="chess-done-subtitle">{lesson.title}</p>
          <p className="chess-done-msg">
            Incredible work {childName}! You finished Lesson {lesson.step} of {lesson.totalSteps}.
            You are on your way to becoming a real chess player!
          </p>
          {lesson.concept && (
            <div className="chess-done-concept">
              <strong>What you learned:</strong> {lesson.concept}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chess-root">

      {/* ── Top bar ── */}
      <div className="chess-topbar">
        <div className="chess-topbar-left">
          <div className="chess-title">{lesson.title}</div>
          <div className="chess-subtitle">{lesson.subtitle} · <span style={{color:'#5dcaa5'}}>{lesson.levelName}</span></div>
        </div>
        <div className="chess-prog-wrap">
          <div className="chess-prog-track">
            <div className="chess-prog-fill" style={{ width:`${((lesson.step-1)/lesson.totalSteps)*100}%` }} />
          </div>
          <span className="chess-prog-lbl">Lesson {lesson.step}/{lesson.totalSteps}</span>
        </div>
      </div>

      {/* ── Session bar ── */}
      <SessionBar session={sessionNum} stepIdx={stepIdx} total={totalSteps} />

      {/* ── Three panels ── */}
      <div className="chess-panels">

        {/* LEFT — Ms. Momo demo board */}
        <div className="chess-panel chess-panel-momo">
          <div className="chess-panel-hdr" style={{ background:'#6c63ff' }}>
            🎓 Ms. Momo's board — watch me
            <span className="hdr-badge">DEMO</span>
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={momoBoard}
              highlights={hlRC}
              targets={[]}
              interactive={false}
              label="Ms. Momo demonstrates here"
              labelColor="#a78bfa"
            />
            <PieceTray activePieces={[]} demo={true} />
          </div>
        </div>

        {/* CENTRE — Student board */}
        <div className="chess-panel chess-panel-student">
          <div className="chess-panel-hdr" style={{ background:'#1d6b4e' }}>
            ✏️ {childName}'s board — your turn
            <span className="hdr-badge hdr-badge-green">YOUR TURN</span>
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={board}
              highlights={[]}
              targets={stepDone ? [] : targetRC}
              selected={selected}
              onSquareDrop={handleDrop}
              onSquareClick={handleSquareClick}
              interactive={!stepDone}
              label={step?.studentTask || 'Complete the task'}
              labelColor="#5dcaa5"
            />
            <PieceTray
              activePieces={activePieces}
              placedTypes={placedTypes}
              demo={false}
            />
          </div>
        </div>

        {/* RIGHT — Compact result panel */}
        <div className="chess-panel chess-panel-result">
          <div className="chess-panel-hdr" style={{ background:'#0d0d2b' }}>
            📋 Task &amp; Result
          </div>
          <div className="chess-result-body">

            {/* Step type */}
            <div>
              {step?.type === 'instruction' && <span className="chess-badge chess-badge-inst">📖 Instruction · {step.duration}</span>}
              {step?.type === 'exercise'    && <span className="chess-badge chess-badge-ex">✏️ Exercise · {step.duration}</span>}
              {step?.type === 'puzzle'      && <span className="chess-badge chess-badge-puzzle">🧩 Puzzle · {step.duration}</span>}
              {step?.type === 'review'      && <span className="chess-badge chess-badge-review">🔄 Review · {step.duration}</span>}
              {step?.type === 'challenge'   && <span className="chess-badge chess-badge-challenge">🏆 Challenge · {step.duration}</span>}
            </div>

            {/* Task */}
            <div className="chess-task-box">
              <div className="chess-task-lbl">Your task</div>
              <div className="chess-task-text">{step?.studentTask}</div>
            </div>

            {/* Feedback */}
            {feedback.text && (
              <div className={`chess-fb chess-fb-${feedback.type}`}>
                {feedback.type === 'success' ? '✅ ' : feedback.type === 'error' ? '❌ ' : '💡 '}
                {feedback.text}
              </div>
            )}

            {/* Yes/No for puzzle steps */}
            {step?.isYesNo && !stepDone && (
              <div className="chess-yesno">
                <button className="chess-yes-btn" onClick={() => handleAnswer(true)}>✓ Yes</button>
                <button className="chess-no-btn"  onClick={() => handleAnswer(false)}>✗ No</button>
              </div>
            )}

            {/* Instruction advance button */}
            {step?.type === 'instruction' && !stepDone && (
              <button className="chess-adv-btn" onClick={() => markDone(step.outputSuccess || 'Got it!')}>
                I understand — let me try →
              </button>
            )}

            {/* Free play advance */}
            {step?.freePlay && !stepDone && (
              <button className="chess-adv-btn" onClick={() => markDone(step.outputSuccess || 'Well played!')}>
                Continue →
              </button>
            )}

            {/* Waiting / skip */}
            {stepDone && (
              <div className="chess-next-row">
                <span>Moving to next step...</span>
                <button className="chess-skip-btn" onClick={nextStep}>Skip →</button>
              </div>
            )}

            {/* Active piece reminder */}
            {activePieces.length === 1 && !stepDone && (
              <div className="chess-piece-reminder">
                <PieceSVG type={activePieces[0]} color="w" size={28} />
                <span>
                  Only the <strong>{PIECE_NAMES[activePieces[0]]}</strong> is active.<br/>
                  Other pieces unlock in later lessons.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tutor bar ── */}
      <div className="chess-tutor-bar">
        <div className="tutor-av">🎓</div>
        <div className="tutor-bubble">
          <div className="tutor-name">
            Ms. Momo
            {voiceOn && <span className="tutor-voice-pill">🔊 voice on</span>}
          </div>
          <p className="tutor-speech">{step?.voice || 'Follow the instructions above.'}</p>
        </div>
        <button
          className={`tutor-voice-btn ${voiceOn ? 'voice-on' : ''}`}
          onClick={() => {
            const next = !voiceOn;
            setVoiceOn(next);
            if (!next) { try { window.speechSynthesis.cancel(); } catch(e){} }
            else if (step?.voice) speak(step.voice, true);
          }}
        >
          {voiceOn ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
