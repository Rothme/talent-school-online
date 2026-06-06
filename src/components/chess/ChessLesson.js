/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CHESS_LESSONS_EXPANDED } from '../../data/chessExpanded';
import './ChessLesson.css';

// ── Piece symbols ───────────────────────────────
const PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];

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

const EMPTY_BOARD = () => Array(8).fill(null).map(() => Array(8).fill(null));

// ── Square name ↔ [row, col] ────────────────────
function squareToRC(sq) {
  if (!sq || sq.length < 2) return null;
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1]);
  return [row, col];
}

// ── Voice ───────────────────────────────────────
function speak(text, voiceOn) {
  if (!voiceOn || !text) return;
  window.speechSynthesis?.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9; u.pitch = 1.05; u.volume = 1;
  const voices = window.speechSynthesis?.getVoices() || [];
  const pref = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (pref) u.voice = pref;
  window.speechSynthesis?.speak(u);
}

// ── Build initial board from step definition ────
function buildBoard(step) {
  if (!step || !step.momoBoard) return EMPTY_BOARD();
  const { pieces } = step.momoBoard;
  if (pieces === 'FULL_START') return FULL_START.map(r => [...r]);
  const b = EMPTY_BOARD();
  if (Array.isArray(pieces)) {
    pieces.forEach(({ piece, square }) => {
      const rc = squareToRC(square);
      if (rc) b[rc[0]][rc[1]] = piece;
    });
  }
  return b;
}

// ── Get highlights from step ────────────────────
function getHighlights(step) {
  if (!step || !step.momoBoard) return [];
  return (step.momoBoard.highlights || []).map(sq => {
    const rc = squareToRC(sq);
    return rc;
  }).filter(Boolean);
}

// ── Check if student board matches targetPieces ─
function boardMatchesTarget(board, targetPieces) {
  if (!targetPieces || targetPieces === 'FULL_START') {
    // Check full starting position
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if ((board[r][c] || null) !== (FULL_START[r][c] || null)) return false;
    return true;
  }
  if (!Array.isArray(targetPieces)) return false;
  return targetPieces.every(({ piece, square }) => {
    const rc = squareToRC(square);
    if (!rc) return false;
    return board[rc[0]][rc[1]] === piece;
  });
}

// ── Chess Board Component ───────────────────────
function ChessBoard({ board, highlights = [], onSquareClick, label, color = '#1d9e75', interactive = false, note }) {
  return (
    <div className="cb-wrap">
      <div className="cb-label" style={{ color }}>
        <span className="cb-dot" style={{ background: color }} />
        {label}
      </div>
      <div className="cb-inner">
        <div className="cb-ranks">
          {RANKS.map(r => <div key={r} className="cb-coord">{r}</div>)}
        </div>
        <div className="cb-col">
          <div className="cb-grid">
            {board.map((row, r) => row.map((piece, c) => {
              const light   = (r + c) % 2 === 0;
              const isHL    = highlights.some(h => h[0] === r && h[1] === c);
              const canClick = interactive && (isHL || !highlights.length);
              return (
                <div
                  key={`${r}-${c}`}
                  className={`cb-sq ${light ? 'cb-light' : 'cb-dark'} ${isHL ? 'cb-hl' : ''} ${canClick ? 'cb-clickable' : ''}`}
                  onClick={() => canClick && onSquareClick && onSquareClick(r, c)}
                >
                  {piece && <span className="cb-piece">{PIECES[piece] || ''}</span>}
                </div>
              );
            }))}
          </div>
          <div className="cb-files">
            {FILES.map(f => <div key={f} className="cb-coord">{f}</div>)}
          </div>
        </div>
      </div>
      {note && <div className="cb-note">{note}</div>}
    </div>
  );
}

// ── Session/Step indicator ──────────────────────
function SessionIndicator({ session, stepIndex, total }) {
  const label = session === 1 ? 'Session 1 — Learn' : 'Session 2 — Practice';
  const color = session === 1 ? '#6c63ff' : '#1d9e75';
  return (
    <div className="cl-session-bar">
      <span className="cl-session-badge" style={{ background: color }}>
        {label}
      </span>
      <div className="cl-step-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`cl-step-dot ${i === stepIndex ? 'cl-step-dot-active' : i < stepIndex ? 'cl-step-dot-done' : ''}`}
            style={i === stepIndex ? { background: color } : {}} />
        ))}
      </div>
      <span className="cl-step-count">Step {stepIndex + 1} of {total}</span>
    </div>
  );
}

// ── Tutor bar ───────────────────────────────────
function TutorBar({ text, voiceOn, onToggle }) {
  return (
    <div className="cl-tutor-bar">
      <div className="cl-tutor-avatar">🎓</div>
      <div className="cl-tutor-bubble">
        <div className="cl-tutor-name">Ms. Momo</div>
        <p className="cl-tutor-text">{text}</p>
      </div>
      <button className={`cl-voice-btn ${voiceOn ? 'cl-voice-on' : ''}`} onClick={onToggle}>
        {voiceOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

// ── Feedback banner ─────────────────────────────
function Feedback({ type, text }) {
  if (!text) return null;
  return (
    <div className={`cl-feedback cl-feedback-${type}`}>
      {type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : '💡 '}
      {text}
    </div>
  );
}

// ── Main ChessLesson ────────────────────────────
export default function ChessLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {

  // Guard: check data exists
  if (!CHESS_LESSONS_EXPANDED || CHESS_LESSONS_EXPANDED.length === 0) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0f1117', color:'#fff', fontSize:16, fontWeight:700, padding:32, textAlign:'center' }}>
        Chess curriculum loading... If this persists, please refresh the page.
      </div>
    );
  }

  const lesson = CHESS_LESSONS_EXPANDED[lessonIndex] || CHESS_LESSONS_EXPANDED[0];

  // Guard: check lesson has expected shape
  if (!lesson || !lesson.session1 || !lesson.session1.steps) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', background:'#0f1117', color:'#fff', fontSize:16, fontWeight:700, padding:32, textAlign:'center' }}>
        Lesson {lessonIndex + 1} is loading. Please wait a moment.
      </div>
    );
  }

  // ── State ──────────────────────────────────────
  const [sessionNum,  setSessionNum]  = useState(1); // 1 or 2
  const [stepIndex,   setStepIndex]   = useState(0);
  const [studentBoard,setStudentBoard]= useState(() => EMPTY_BOARD());
  const [feedback,    setFeedback]    = useState({ type:'', text:'' });
  const [stepDone,    setStepDone]    = useState(false);
  const [lessonDone,  setLessonDone]  = useState(false);
  const [voiceOn,     setVoiceOn]     = useState(true);
  const [selectedPiece, setSelectedPiece] = useState(null); // for move-piece interactions
  const hasSpokeRef = useRef(false);

  // Current steps array
  const steps   = sessionNum === 1 ? lesson.session1.steps : lesson.session2.steps;
  const step    = steps[stepIndex] || steps[0];
  const totalSteps = steps.length;

  // Ms. Momo's demonstration board
  const momoBoard  = buildBoard(step);
  const highlights = getHighlights(step);

  // ── Reset on lesson or session change ─────────
  useEffect(() => {
    setStudentBoard(EMPTY_BOARD());
    setFeedback({ type:'', text:'' });
    setStepDone(false);
    setSelectedPiece(null);
    hasSpokeRef.current = false;
  }, [lessonIndex, sessionNum, stepIndex]);

  // ── Auto-play voice ────────────────────────────
  useEffect(() => {
    if (voiceOn && step?.voice && !hasSpokeRef.current) {
      hasSpokeRef.current = true;
      const t = setTimeout(() => speak(step.voice, true), 400);
      return () => clearTimeout(t);
    }
  }, [stepIndex, sessionNum, lessonIndex]);

  // ── Advance to next step ───────────────────────
  function nextStep() {
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      if (sessionNum === 1 && lesson.session2?.steps?.length > 0) {
        // Move to session 2
        setSessionNum(2);
        setStepIndex(0);
        setStepDone(false);
        setFeedback({ type:'', text:'' });
        speak("Great work! Session 1 is complete. Now let us move to Session 2 — puzzles and challenge.", voiceOn);
      } else {
        // Lesson complete
        setLessonDone(true);
        speak(`Brilliant work ${childName}! You have completed Lesson ${lesson.step} — ${lesson.title}. Well done!`, voiceOn);
        setTimeout(() => onComplete?.(), 2500);
      }
    } else {
      setStepIndex(next);
      setStepDone(false);
      setFeedback({ type:'', text:'' });
      setSelectedPiece(null);
    }
  }

  // ── Handle student board click ─────────────────
  function handleSquareClick(r, c) {
    if (stepDone) return;
    if (!step) return;

    const { type, targetPieces, movePiece, isYesNo, freePlay } = step;

    // Free play — any interaction counts
    if (freePlay) {
      markDone(step.outputSuccess || 'Well played! Free play complete.');
      return;
    }

    // Move piece interaction — two clicks: select then move
    if (movePiece) {
      const [fr, fc] = movePiece.from;
      const [tr, tc] = movePiece.to;

      if (!selectedPiece) {
        // First click — select the piece to move
        if (r === fr && c === fc) {
          setSelectedPiece([r, c]);
          setFeedback({ type:'hint', text:'Good — now click the destination square to move the piece.' });
        } else {
          // Put piece from momoBoard at the correct starting square
          const nb = studentBoard.map(row => [...row]);
          nb[fr][fc] = momoBoard[fr][fc]; // put it there for them
          setStudentBoard(nb);
          setFeedback({ type:'hint', text:'Click the highlighted piece first, then click where to move it.' });
        }
        return;
      }

      // Second click — move to destination
      if (r === tr && c === tc) {
        const nb = studentBoard.map(row => [...row]);
        const piece = nb[selectedPiece[0]][selectedPiece[1]] || momoBoard[fr][fc];
        nb[tr][tc] = piece;
        nb[fr][fc] = null;
        setStudentBoard(nb);
        setSelectedPiece(null);
        markDone(step.outputSuccess || 'Correct move!');
      } else {
        setSelectedPiece(null);
        setFeedback({ type:'error', text: step.outputWrong || 'Not quite — click the piece first, then the destination.' });
      }
      return;
    }

    // Placement interaction — click a square to place target piece
    if (targetPieces && !isYesNo) {
      const nb = studentBoard.map(row => [...row]);

      // Find which target piece should go here
      const match = Array.isArray(targetPieces)
        ? targetPieces.find(tp => {
            const rc = squareToRC(tp.square);
            return rc && rc[0] === r && rc[1] === c;
          })
        : null;

      if (match) {
        nb[r][c] = match.piece;
        setStudentBoard(nb);
        // Check if ALL target pieces are now placed
        const allPlaced = boardMatchesTarget(nb, targetPieces);
        if (allPlaced) {
          markDone(step.outputSuccess || 'All pieces placed correctly!');
        } else {
          const remaining = Array.isArray(targetPieces)
            ? targetPieces.filter(tp => {
                const rc = squareToRC(tp.square);
                return rc && nb[rc[0]][rc[1]] !== tp.piece;
              }).length
            : 0;
          setFeedback({ type:'hint', text: `Correct! ${remaining} more piece${remaining !== 1 ? 's' : ''} to place.` });
        }
      } else {
        setFeedback({ type:'error', text: step.outputWrong || 'That is not the right square. Look at the highlighted squares.' });
      }
      return;
    }

    // Default: any square click on non-interactive steps advances
    if (!targetPieces && !movePiece && !isYesNo) {
      markDone(step.outputSuccess || 'Good!');
    }
  }

  // ── Yes/No answer ──────────────────────────────
  function handleAnswer(answer) {
    if (stepDone) return;
    if (answer === step.correctAnswer) {
      markDone(step.outputSuccess || 'Correct!');
    } else {
      setFeedback({ type:'error', text: step.outputWrong || 'Not quite — think it through again.' });
      speak(step.outputWrong || 'Not quite — think it through again.', voiceOn);
    }
  }

  // ── Mark step done ─────────────────────────────
  function markDone(msg) {
    setFeedback({ type:'success', text: msg });
    setStepDone(true);
    speak(msg, voiceOn);
    setTimeout(() => nextStep(), 2000);
  }

  // ── Voice toggle ───────────────────────────────
  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) window.speechSynthesis?.cancel();
    else speak(step?.voice || '', true);
  }

  // ── Lesson done screen ─────────────────────────
  if (lessonDone) {
    return (
      <div className="chess-lesson-done-screen">
        <div className="chess-lesson-done-card">
          <div style={{ fontSize: 56 }}>🏆</div>
          <h2>Chess Lesson Complete!</h2>
          <p className="chess-done-title">{lesson.title}</p>
          <p className="chess-done-msg">
            Excellent work {childName}! You have finished Lesson {lesson.step} of {lesson.totalSteps}.
            Every chess master started exactly where you are right now.
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

  const levelColor = '#1d9e75';

  return (
    <div className="chess-lesson">

      {/* ── Header ── */}
      <div className="chess-lesson-header">
        <div>
          <div className="chess-lesson-title-text">{lesson.title}</div>
          <div className="chess-lesson-subtitle">{lesson.subtitle} · {lesson.levelName}</div>
        </div>
        <div className="chess-prog-bar-wrap">
          <div className="chess-prog-bar">
            <div className="chess-prog-fill"
              style={{ width: `${((lesson.step - 1) / lesson.totalSteps) * 100}%`, background: levelColor }} />
          </div>
          <span className="chess-prog-label">Lesson {lesson.step} of {lesson.totalSteps}</span>
        </div>
      </div>

      {/* ── Session indicator ── */}
      <SessionIndicator session={sessionNum} stepIndex={stepIndex} total={totalSteps} />

      {/* ── Three-panel body ── */}
      <div className="chess-panels">

        {/* LEFT — Ms. Momo's board */}
        <div className="chess-panel chess-panel-momo">
          <div className="chess-panel-header" style={{ background: '#6c63ff' }}>
            🎓 Ms. Momo's Board
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={momoBoard}
              highlights={highlights}
              label="Ms. Momo demonstrates here"
              color="#6c63ff"
              note={step?.type === 'instruction' ? 'Watch and mirror on your board →' : 'Reference position'}
            />
          </div>
        </div>

        {/* CENTRE — Student board */}
        <div className="chess-panel chess-panel-student">
          <div className="chess-panel-header" style={{ background: '#1a1a2e' }}>
            ✏️ Your Board — {childName}
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={studentBoard}
              highlights={stepDone ? [] : highlights}
              onSquareClick={handleSquareClick}
              interactive={!stepDone && !step?.isYesNo}
              label={step?.studentTask || 'Complete the task'}
              color={levelColor}
              note={stepDone ? '✅ Moving to next step...' : 'Click highlighted squares'}
            />
          </div>
        </div>

        {/* RIGHT — Output/Result */}
        <div className="chess-panel chess-panel-output">
          <div className="chess-panel-header" style={{ background: '#0d0d2b' }}>
            📋 Result
          </div>
          <div className="chess-panel-body chess-output-body">

            {/* Step type badge */}
            <div className="chess-step-type-badge">
              {step?.type === 'instruction' && <span className="chess-badge chess-badge-instruction">📖 Instruction · {step.duration}</span>}
              {step?.type === 'exercise'    && <span className="chess-badge chess-badge-exercise">✏️ Exercise · {step.duration}</span>}
              {step?.type === 'puzzle'      && <span className="chess-badge chess-badge-puzzle">🧩 Puzzle · {step.duration}</span>}
              {step?.type === 'review'      && <span className="chess-badge chess-badge-review">🔄 Review · {step.duration}</span>}
              {step?.type === 'challenge'   && <span className="chess-badge chess-badge-challenge">🏆 Challenge · {step.duration}</span>}
            </div>

            {/* Task description */}
            <div className="chess-task-box">
              <div className="chess-task-label">Your task</div>
              <div className="chess-task-text">{step?.studentTask}</div>
            </div>

            {/* Feedback */}
            <Feedback type={feedback.type} text={feedback.text} />

            {/* Yes/No buttons for puzzle steps */}
            {step?.isYesNo && !stepDone && (
              <div className="chess-yesno-wrap">
                <button className="chess-yes-btn" onClick={() => handleAnswer(true)}>
                  ✓ Yes
                </button>
                <button className="chess-no-btn" onClick={() => handleAnswer(false)}>
                  ✗ No
                </button>
              </div>
            )}

            {/* Free play / instruction — manual advance button */}
            {(step?.type === 'instruction' || step?.freePlay) && !stepDone && (
              <button
                className="chess-advance-btn"
                style={{ background: levelColor }}
                onClick={() => markDone(step.outputSuccess || 'Step complete!')}
              >
                {step?.type === 'instruction' ? 'I understand →' : 'Continue →'}
              </button>
            )}

            {/* Manual next if stuck */}
            {stepDone && (
              <div className="chess-next-hint">
                Moving to next step...
                <button className="chess-skip-link" onClick={nextStep}>Skip wait →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom tutor bar ── */}
      <TutorBar
        text={step?.voice || 'Follow the instructions above.'}
        voiceOn={voiceOn}
        onToggle={toggleVoice}
      />

    </div>
  );
}
