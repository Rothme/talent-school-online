/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CHESS_LESSONS_EXPANDED } from '../../data/chessExpanded';
import './ChessLesson.css';

// ── Solid filled piece characters ───────────────
const WP = { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙' };
const BP = { K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' };
const PIECE_NAMES = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };
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

const ALL_PIECES_ORDER = ['K','Q','R','B','N','P'];

function emptyBoard() {
  return Array(8).fill(null).map(() => Array(8).fill(null));
}

function squareToRC(sq) {
  if (!sq || sq.length < 2) return null;
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1]);
  if (col < 0 || col > 7 || row < 0 || row > 7) return null;
  return [row, col];
}

function pieceSymbol(code) {
  if (!code || code.length < 2) return '';
  const color = code[0]; // 'w' or 'b'
  const type  = code[1]; // K Q R B N P
  return color === 'w' ? (WP[type] || '') : (BP[type] || '');
}

function isWhite(code) { return code && code[0] === 'w'; }

// ── Voice ───────────────────────────────────────
function speak(text, on) {
  if (!on || !text) return;
  window.speechSynthesis?.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9; u.pitch = 1.05; u.volume = 1;
  const voices = window.speechSynthesis?.getVoices() || [];
  const pref = voices.find(v => v.lang.startsWith('en') && /female|zira|samantha|victoria|karen/i.test(v.name))
    || voices.find(v => v.lang.startsWith('en')) || voices[0];
  if (pref) u.voice = pref;
  window.speechSynthesis?.speak(u);
}

// ── Build board from step momoBoard definition ──
function buildBoardFromDef(momoBoard) {
  if (!momoBoard) return emptyBoard();
  const { pieces } = momoBoard;
  if (pieces === 'FULL_START') return FULL_START.map(r => [...r]);
  const b = emptyBoard();
  if (Array.isArray(pieces)) {
    pieces.forEach(({ piece, square }) => {
      const rc = squareToRC(square);
      if (rc) b[rc[0]][rc[1]] = piece;
    });
  }
  return b;
}

// ── Which piece types are active this step ──────
function getActivePieces(step) {
  if (!step) return [];
  // Derive from targetPieces — whatever piece types appear
  const targets = step.targetPieces;
  if (!targets || targets === 'FULL_START') return ALL_PIECES_ORDER;
  if (!Array.isArray(targets)) return [];
  const types = [...new Set(targets.map(t => t.piece?.[1]).filter(Boolean))];
  return types;
}

// ── Highlights from step ────────────────────────
function getHighlights(step) {
  if (!step?.momoBoard?.highlights) return [];
  return step.momoBoard.highlights.map(sq => squareToRC(sq)).filter(Boolean);
}

// ── Check board matches target ──────────────────
function matchesTarget(board, targetPieces) {
  if (!targetPieces || targetPieces === 'FULL_START') {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if ((board[r][c] || null) !== (FULL_START[r][c] || null)) return false;
    return true;
  }
  if (!Array.isArray(targetPieces)) return false;
  return targetPieces.every(({ piece, square }) => {
    const rc = squareToRC(square);
    return rc && board[rc[0]][rc[1]] === piece;
  });
}

// ─────────────────────────────────────────────────
// CHESS BOARD — green squares, solid pieces, drag targets
// ─────────────────────────────────────────────────
function ChessBoard({
  board, highlights = [], targetSquares = [], onDrop, label, color, note,
  isDemoBoard = false, selectedPiece = null, onSquareClick
}) {
  function handleDragOver(e) { e.preventDefault(); }

  function handleDrop(e, r, c) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data && onDrop) onDrop(data, r, c);
  }

  return (
    <div className="cb-wrap">
      <div className="cb-owner-label" style={{ color }}>
        <span className="cb-owner-dot" style={{ background: color }} />
        {label}
      </div>
      <div className="cb-inner">
        <div className="cb-ranks">
          {RANKS.map(r => <div key={r} className="cb-coord-rank">{r}</div>)}
        </div>
        <div className="cb-col">
          <div className="cb-grid">
            {board.map((row, r) => row.map((piece, c) => {
              const light   = (r + c) % 2 === 0;
              const isHL    = highlights.some(h => h[0] === r && h[1] === c);
              const isTgt   = targetSquares.some(h => h[0] === r && h[1] === c);
              const isSel   = selectedPiece && selectedPiece[0] === r && selectedPiece[1] === c;
              let sqClass = `cb-sq ${light ? 'cb-lt' : 'cb-dk'}`;
              if (isHL) sqClass += ' cb-hl';
              if (isTgt) sqClass += ' cb-target';
              if (isSel) sqClass += ' cb-selected';

              return (
                <div
                  key={`${r}-${c}`}
                  className={sqClass}
                  onDragOver={!isDemoBoard ? handleDragOver : undefined}
                  onDrop={!isDemoBoard ? (e) => handleDrop(e, r, c) : undefined}
                  onClick={() => !isDemoBoard && onSquareClick && onSquareClick(r, c)}
                >
                  {piece && (
                    <span className={isWhite(piece) ? 'cb-piece-w' : 'cb-piece-b'}>
                      {pieceSymbol(piece)}
                    </span>
                  )}
                </div>
              );
            }))}
          </div>
          <div className="cb-files">
            {FILES.map(f => <div key={f} className="cb-coord-file">{f}</div>)}
          </div>
        </div>
      </div>
      {note && <div className="cb-note">{note}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────
// PIECE TRAY — draggable pieces below student board
// ─────────────────────────────────────────────────
function PieceTray({ activePieces, usedPieces = [], color = 'w' }) {
  function handleDragStart(e, pieceCode) {
    e.dataTransfer.setData('text/plain', pieceCode);
    e.dataTransfer.effectAllowed = 'copy';
  }

  return (
    <div className="tray-wrap">
      <div className="tray-label">Drag a piece onto the board ↑</div>
      <div className="tray-pieces">
        {ALL_PIECES_ORDER.map(type => {
          const code    = `${color}${type}`;
          const active  = activePieces.includes(type);
          const used    = usedPieces.includes(type);
          const sym     = color === 'w' ? WP[type] : BP[type];
          return (
            <div
              key={type}
              className={`tray-piece ${active && !used ? 'tray-active' : 'tray-inactive'}`}
              draggable={active && !used}
              onDragStart={active && !used ? (e) => handleDragStart(e, code) : undefined}
              title={active ? `Drag ${PIECE_NAMES[type]} onto the board` : `${PIECE_NAMES[type]} — not active this step`}
            >
              <span className={`tray-sym ${color === 'w' ? 'tray-sym-w' : 'tray-sym-b'}`}>
                {sym}
              </span>
              <span className="tray-name">{PIECE_NAMES[type]}</span>
              {active && !used && <span className="tray-active-dot" />}
            </div>
          );
        })}
      </div>
      {activePieces.length === 1 && (
        <div className="tray-hint">
          ☝ Only the <strong>{PIECE_NAMES[activePieces[0]]}</strong> is active this step
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// SESSION / STEP INDICATOR
// ─────────────────────────────────────────────────
function SessionBar({ session, stepIndex, total }) {
  const label = session === 1 ? 'Session 1 — Learn & Place' : 'Session 2 — Puzzles & Challenge';
  const color = session === 1 ? '#6c63ff' : '#1d9e75';
  return (
    <div className="sess-bar">
      <span className="sess-badge" style={{ background: color }}>{label}</span>
      <div className="sess-dots">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`sess-dot ${i === stepIndex ? 'sess-dot-active' : i < stepIndex ? 'sess-dot-done' : ''}`}
            style={i === stepIndex ? { background: color } : {}} />
        ))}
      </div>
      <span className="sess-count">Step {stepIndex + 1} of {total}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────
// TUTOR BAR
// ─────────────────────────────────────────────────
function TutorBar({ text, voiceOn, onToggle }) {
  return (
    <div className="tutor-bar">
      <div className="tutor-avatar">🎓</div>
      <div className="tutor-bubble">
        <div className="tutor-name">Ms. Momo {voiceOn && <span className="tutor-voice-badge">🔊 voice on</span>}</div>
        <p className="tutor-text">{text || 'Follow the instructions above.'}</p>
      </div>
      <button className={`tutor-voice-btn ${voiceOn ? 'tutor-voice-on' : ''}`} onClick={onToggle}
        title={voiceOn ? 'Mute voice' : 'Enable voice'}>
        {voiceOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────
// FEEDBACK
// ─────────────────────────────────────────────────
function Feedback({ type, text }) {
  if (!text) return null;
  const icons = { success: '✅', error: '❌', hint: '💡' };
  return <div className={`cl-fb cl-fb-${type}`}>{icons[type] || ''} {text}</div>;
}

// ─────────────────────────────────────────────────
// MAIN ChessLesson
// ─────────────────────────────────────────────────
export default function ChessLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {

  // ── Data guard ─────────────────────────────────
  if (!CHESS_LESSONS_EXPANDED?.length) {
    return <div className="chess-loading">Chess curriculum loading — please wait...</div>;
  }
  const lesson = CHESS_LESSONS_EXPANDED[Math.min(lessonIndex, CHESS_LESSONS_EXPANDED.length - 1)];
  if (!lesson?.session1?.steps?.length) {
    return <div className="chess-loading">Loading lesson {lessonIndex + 1}...</div>;
  }

  // ── State ──────────────────────────────────────
  const [sessionNum,    setSessionNum]    = useState(1);
  const [stepIndex,     setStepIndex]     = useState(0);
  const [studentBoard,  setStudentBoard]  = useState(emptyBoard);
  const [usedPieces,    setUsedPieces]    = useState([]);   // piece types placed this step
  const [feedback,      setFeedback]      = useState({ type:'', text:'' });
  const [stepDone,      setStepDone]      = useState(false);
  const [lessonDone,    setLessonDone]    = useState(false);
  const [voiceOn,       setVoiceOn]       = useState(true);
  const [selectedSq,    setSelectedSq]    = useState(null); // for click-to-move
  const voiceRef = useRef(false);

  const steps      = sessionNum === 1 ? lesson.session1.steps : (lesson.session2?.steps || []);
  const step       = steps[stepIndex] || steps[0];
  const totalSteps = steps.length;

  const momoBoard  = buildBoardFromDef(step?.momoBoard);
  const highlights = getHighlights(step);
  const activePieces = getActivePieces(step);

  // Target squares — where pieces should be placed
  const targetSquares = step?.targetPieces && Array.isArray(step.targetPieces)
    ? step.targetPieces.map(t => squareToRC(t.square)).filter(Boolean)
    : highlights;

  // ── Reset on step change ───────────────────────
  useEffect(() => {
    setStudentBoard(emptyBoard());
    setUsedPieces([]);
    setFeedback({ type:'', text:'' });
    setStepDone(false);
    setSelectedSq(null);
    voiceRef.current = false;
  }, [lessonIndex, sessionNum, stepIndex]);

  // ── Auto-voice ─────────────────────────────────
  useEffect(() => {
    if (voiceOn && step?.voice && !voiceRef.current) {
      voiceRef.current = true;
      const t = setTimeout(() => speak(step.voice, true), 500);
      return () => clearTimeout(t);
    }
  }, [stepIndex, sessionNum, lessonIndex, voiceOn]);

  // ── Advance step ───────────────────────────────
  const nextStep = useCallback(() => {
    const next = stepIndex + 1;
    if (next >= totalSteps) {
      if (sessionNum === 1 && lesson.session2?.steps?.length) {
        setSessionNum(2);
        setStepIndex(0);
        speak(`Well done! Session 1 is complete. Now for Session 2 — puzzles and challenge!`, voiceOn);
      } else {
        setLessonDone(true);
        speak(`Brilliant work ${childName}! Lesson ${lesson.step} complete — ${lesson.title}!`, voiceOn);
        setTimeout(() => onComplete?.(), 2500);
      }
    } else {
      setStepIndex(next);
    }
  }, [stepIndex, totalSteps, sessionNum, lesson, childName, voiceOn, onComplete]);

  // ── Mark done ──────────────────────────────────
  function markDone(msg) {
    setFeedback({ type:'success', text: msg });
    setStepDone(true);
    speak(msg, voiceOn);
    setTimeout(() => nextStep(), 2200);
  }

  // ── Drop handler from tray to board ───────────
  function handleDrop(pieceCode, r, c) {
    if (stepDone) return;

    // Free play — any drop counts
    if (step?.freePlay) { markDone(step.outputSuccess || 'Good move!'); return; }

    // Move piece — check destination
    if (step?.movePiece) {
      const [tr, tc] = step.movePiece.to;
      if (r === tr && c === tc) {
        const nb = studentBoard.map(row => [...row]);
        nb[r][c] = pieceCode;
        setStudentBoard(nb);
        markDone(step.outputSuccess || 'Correct move!');
      } else {
        setFeedback({ type:'error', text: step.outputWrong || 'Not the right square — check the highlighted destination.' });
        speak(step.outputWrong || 'Not quite — look for the highlighted square.', voiceOn);
      }
      return;
    }

    // Placement — check if this square is a target
    if (step?.targetPieces && Array.isArray(step.targetPieces)) {
      const match = step.targetPieces.find(tp => {
        const rc = squareToRC(tp.square);
        return rc && rc[0] === r && rc[1] === c && tp.piece === pieceCode;
      });

      if (match) {
        const nb = studentBoard.map(row => [...row]);
        nb[r][c] = pieceCode;
        setStudentBoard(nb);
        const type = pieceCode[1];
        setUsedPieces(prev => [...prev, type]);

        // Check if all targets placed
        if (matchesTarget(nb, step.targetPieces)) {
          markDone(step.outputSuccess || `Perfect! All pieces placed correctly!`);
        } else {
          const remaining = step.targetPieces.filter(tp => {
            const rc = squareToRC(tp.square);
            return rc && nb[rc[0]][rc[1]] !== tp.piece;
          }).length;
          setFeedback({ type:'hint', text: `Correct! ${remaining} more piece${remaining !== 1 ? 's' : ''} to place.` });
          speak(`Correct! ${remaining} more to go.`, voiceOn);
        }
      } else {
        // Right piece type but wrong square
        const rightSquare = step.targetPieces.find(tp => tp.piece === pieceCode);
        if (rightSquare) {
          setFeedback({ type:'error', text: step.outputWrong || `Not quite — look for the highlighted square.` });
        } else {
          setFeedback({ type:'error', text: `That is not the right piece for this step. Use the highlighted piece from the tray.` });
        }
        speak(step.outputWrong || 'Not quite — look for the highlighted square.', voiceOn);
      }
      return;
    }

    // Default — any drop advances
    markDone(step?.outputSuccess || 'Good!');
  }

  // ── Click to move (alternative to drag) ───────
  function handleSquareClick(r, c) {
    if (stepDone) return;

    // For move steps — two-click select then place
    if (step?.movePiece) {
      if (!selectedSq) {
        const [fr, fc] = step.movePiece.from;
        // Auto-populate the piece at starting position if not there
        const nb = studentBoard.map(row => [...row]);
        if (!nb[fr][fc]) {
          nb[fr][fc] = step.movePiece.piece || momoBoard[fr][fc];
          setStudentBoard(nb);
        }
        setSelectedSq([r, c]);
        setFeedback({ type:'hint', text: 'Now click the destination square.' });
        return;
      }
      const [tr, tc] = step.movePiece.to;
      if (r === tr && c === tc) {
        const nb = studentBoard.map(row => [...row]);
        const piece = nb[selectedSq[0]][selectedSq[1]] || momoBoard[step.movePiece.from[0]][step.movePiece.from[1]];
        nb[tr][tc] = piece;
        nb[selectedSq[0]][selectedSq[1]] = null;
        setStudentBoard(nb);
        setSelectedSq(null);
        markDone(step.outputSuccess || 'Correct move!');
      } else {
        setSelectedSq(null);
        setFeedback({ type:'error', text: step.outputWrong || 'Move to the highlighted destination square.' });
      }
      return;
    }

    // For instruction / free-play — click anywhere on board as confirmation
    if (step?.type === 'instruction' || step?.freePlay) {
      markDone(step.outputSuccess || 'Well done!');
    }
  }

  // ── Yes/No answer ──────────────────────────────
  function handleAnswer(answer) {
    if (stepDone) return;
    if (answer === step.correctAnswer) {
      markDone(step.outputSuccess || 'Correct!');
    } else {
      setFeedback({ type:'error', text: step.outputWrong || 'Not quite — think it through again.' });
      speak(step.outputWrong || 'Not quite.', voiceOn);
    }
  }

  // ── Voice toggle ───────────────────────────────
  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    if (!next) window.speechSynthesis?.cancel();
    else if (step?.voice) speak(step.voice, true);
  }

  // ── Lesson done screen ─────────────────────────
  if (lessonDone) {
    return (
      <div className="chess-done-screen">
        <div className="chess-done-card">
          <div className="chess-done-trophy">🏆</div>
          <h2 className="chess-done-h2">Lesson Complete!</h2>
          <div className="chess-done-title">{lesson.title}</div>
          <p className="chess-done-msg">
            Excellent work {childName}! You finished Lesson {lesson.step} of {lesson.totalSteps}.
            Every chess master started exactly where you are right now.
          </p>
          {lesson.concept && (
            <div className="chess-done-concept"><strong>What you learned:</strong> {lesson.concept}</div>
          )}
        </div>
      </div>
    );
  }

  const levelColor = '#1d9e75';

  return (
    <div className="chess-root">

      {/* ── Top bar ── */}
      <div className="chess-topbar">
        <div className="chess-topbar-left">
          <div className="chess-lesson-title">{lesson.title}</div>
          <div className="chess-lesson-sub">{lesson.subtitle} · <span style={{color:levelColor}}>{lesson.levelName}</span></div>
        </div>
        <div className="chess-prog-wrap">
          <div className="chess-prog-track">
            <div className="chess-prog-fill" style={{width:`${((lesson.step-1)/lesson.totalSteps)*100}%`}} />
          </div>
          <span className="chess-prog-lbl">Lesson {lesson.step}/{lesson.totalSteps}</span>
        </div>
      </div>

      {/* ── Session bar ── */}
      <SessionBar session={sessionNum} stepIndex={stepIndex} total={totalSteps} />

      {/* ── Three panels ── */}
      <div className="chess-panels">

        {/* LEFT — Ms. Momo demo board */}
        <div className="chess-panel chess-panel-momo">
          <div className="chess-panel-hdr" style={{background:'#6c63ff'}}>
            🎓 Ms. Momo's Board <span className="chess-demo-badge">DEMO</span>
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={momoBoard}
              highlights={highlights}
              targetSquares={[]}
              label="Ms. Momo demonstrates here"
              color="#6c63ff"
              isDemoBoard={true}
              note="Watch — then mirror on your board →"
            />
            {/* Momo tray — display only, all greyed */}
            <div className="tray-wrap tray-demo">
              <div class="tray-label">Ms. Momo's pieces (reference)</div>
              <div className="tray-pieces">
                {ALL_PIECES_ORDER.map(type => (
                  <div key={type} className="tray-piece tray-inactive">
                    <span className="tray-sym tray-sym-w">{WP[type]}</span>
                    <span className="tray-name">{PIECE_NAMES[type]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CENTRE — Student board + tray */}
        <div className="chess-panel chess-panel-student">
          <div className="chess-panel-hdr" style={{background:'#1a1a2e'}}>
            ✏️ {childName}'s Board <span className="chess-your-badge">YOUR TURN</span>
          </div>
          <div className="chess-panel-body">
            <ChessBoard
              board={studentBoard}
              highlights={stepDone ? [] : highlights}
              targetSquares={stepDone ? [] : targetSquares}
              onDrop={handleDrop}
              onSquareClick={handleSquareClick}
              selectedPiece={selectedSq}
              label={step?.studentTask || 'Complete the task'}
              color={levelColor}
              isDemoBoard={false}
              note={stepDone ? '✅ Moving to next step...' : 'Drag a piece from below onto the board'}
            />
            {/* Student piece tray — only active pieces draggable */}
            <PieceTray
              activePieces={activePieces}
              usedPieces={usedPieces}
              color="w"
            />
          </div>
        </div>

        {/* RIGHT — Result panel (compact) */}
        <div className="chess-panel chess-panel-result">
          <div className="chess-panel-hdr" style={{background:'#0d0d2b'}}>
            📋 Task & Result
          </div>
          <div className="chess-result-body">

            {/* Step type badge */}
            <div>
              {step?.type === 'instruction' && <span className="chess-badge chess-badge-instruction">📖 Instruction · {step.duration}</span>}
              {step?.type === 'exercise'    && <span className="chess-badge chess-badge-exercise">✏️ Exercise · {step.duration}</span>}
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
            <Feedback type={feedback.type} text={feedback.text} />

            {/* Yes/No buttons */}
            {step?.isYesNo && !stepDone && (
              <div className="chess-yesno">
                <button className="chess-yes-btn" onClick={() => handleAnswer(true)}>✓ Yes</button>
                <button className="chess-no-btn"  onClick={() => handleAnswer(false)}>✗ No</button>
              </div>
            )}

            {/* Instruction / free-play advance button */}
            {(step?.type === 'instruction' || step?.freePlay) && !stepDone && (
              <button className="chess-advance-btn" onClick={() => markDone(step.outputSuccess || 'Step complete!')}>
                {step?.type === 'instruction' ? 'I understand →' : 'Continue →'}
              </button>
            )}

            {/* Timed challenge info */}
            {step?.timed && !stepDone && (
              <div className="chess-timed-info">
                ⏱ Timed step — {step.timeLimit} seconds
              </div>
            )}

            {/* Next hint while waiting */}
            {stepDone && (
              <div className="chess-next-hint">
                Moving to next step...
                <button className="chess-skip-btn" onClick={nextStep}>Skip →</button>
              </div>
            )}

            {/* Active piece hint */}
            {activePieces.length === 1 && !stepDone && (
              <div className="chess-piece-hint">
                <span className="chess-piece-hint-sym">{WP[activePieces[0]]}</span>
                <span>Only the <strong>{PIECE_NAMES[activePieces[0]]}</strong> is active.<br/>Other pieces are locked this step.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tutor bar ── */}
      <TutorBar text={step?.voice || 'Follow the instructions above.'} voiceOn={voiceOn} onToggle={toggleVoice} />
    </div>
  );
}
