/* eslint-disable */
import React, { useState, useEffect, useCallback } from 'react';
import { CHESS_LESSONS_EXPANDED } from '../../data/chessExpanded';
import MsMomoBar from '../shared/MsMomoBar';
import './ChessLesson.css';

// ── Constants ──────────────────────────────────
const PIECES = {
  wK:'♔',wQ:'♕',wR:'♖',wB:'♗',wN:'♘',wP:'♙',
  bK:'♚',bQ:'♛',bR:'♜',bB:'♝',bN:'♞',bP:'♟',
};
const PIECE_NAMES = {K:'King',Q:'Queen',R:'Rook',B:'Bishop',N:'Knight',P:'Pawn'};
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

const EMPTY_BOARD = Array(8).fill(null).map(() => Array(8).fill(null));

// ── Knight moves from a square ──────────────────
function knightMoves(r, c) {
  const deltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  return deltas.map(([dr,dc]) => [r+dr, c+dc]).filter(([nr,nc]) => nr>=0&&nr<8&&nc>=0&&nc<8);
}

// ── Rook moves from a square ────────────────────
function rookMoves(r, c, board) {
  const moves = [];
  for (let dir of [[-1,0],[1,0],[0,-1],[0,1]]) {
    let nr = r+dir[0], nc = c+dir[1];
    while (nr>=0&&nr<8&&nc>=0&&nc<8) {
      moves.push([nr,nc]);
      if (board[nr][nc]) break;
      nr+=dir[0]; nc+=dir[1];
    }
  }
  return moves;
}

// ── Bishop moves ────────────────────────────────
function bishopMoves(r, c, board) {
  const moves = [];
  for (let dir of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
    let nr = r+dir[0], nc = c+dir[1];
    while (nr>=0&&nr<8&&nc>=0&&nc<8) {
      moves.push([nr,nc]);
      if (board[nr][nc]) break;
      nr+=dir[0]; nc+=dir[1];
    }
  }
  return moves;
}

// ── Queen moves ─────────────────────────────────
function queenMoves(r, c, board) {
  return [...rookMoves(r,c,board), ...bishopMoves(r,c,board)];
}

// ── King moves ──────────────────────────────────
function kingMoves(r, c) {
  const moves = [];
  for (let dr=-1; dr<=1; dr++) for (let dc=-1; dc<=1; dc++) {
    if (dr===0&&dc===0) continue;
    const nr=r+dr, nc=c+dc;
    if (nr>=0&&nr<8&&nc>=0&&nc<8) moves.push([nr,nc]);
  }
  return moves;
}

// ── Build board from exercise definition ────────
function buildBoardForExercise(ex, lessonId) {
  const b = EMPTY_BOARD.map(r => [...r]);
  if (!ex) return b;

  if (ex.type === 'placement' || ex.type === 'verify-colour' || ex.type === 'move-test' || ex.type === 'capture-test') {
    // Place the piece being demonstrated on a relevant square
    if (ex.from) b[ex.from[0]][ex.from[1]] = `w${ex.piece || 'P'}`;
  }
  if (ex.type === 'show-moves' && ex.from) {
    b[ex.from[0]][ex.from[1]] = `w${ex.piece}`;
  }
  if (ex.type === 'multi-placement') {
    // Show demo board with pieces already placed correctly (reference)
    ex.pieces?.forEach(p => {
      const color = p.piece === p.piece.toUpperCase() ? 'w' : 'b';
      b[p.square[0]][p.square[1]] = `${color}${p.piece.toUpperCase()}`;
    });
  }
  if (ex.type === 'pawn-placement' || ex.type === 'pawn-row') {
    for (let c=0; c<8; c++) b[ex.row ?? 6][c] = 'wP';
  }
  if (ex.type === 'full-row') {
    const row = ex.row ?? 7;
    const pieces = ['R','N','B','Q','K','B','N','R'];
    const color = ex.color === 'black' ? 'b' : 'w';
    pieces.forEach((p,i) => b[row][i] = `${color}${p}`);
  }
  if (ex.type === 'full-setup' || ex.type === 'timed-setup') {
    return FULL_START.map(r => [...r]);
  }
  if (ex.type === 'guided-move' && ex.from) {
    // Show starting position with relevant pieces
    const ref = FULL_START.map(r => [...r]);
    return ref;
  }
  if (ex.type === 'free-play') {
    return FULL_START.map(r => [...r]);
  }
  return b;
}

// ── Compute highlights for an exercise ──────────
function getHighlights(ex, board) {
  if (!ex) return [];
  if (ex.type === 'placement' || ex.type === 'timed-placement') {
    return ex.square ? [ex.square] : (ex.squares?.map(s => {
      const file = s.charCodeAt(0) - 97;
      const rank = 8 - parseInt(s[1]);
      return [rank, file];
    }) || []);
  }
  if (ex.type === 'show-moves' && ex.from) {
    const [r,c] = ex.from;
    const p = ex.piece;
    if (p === 'N') return knightMoves(r,c);
    if (p === 'R') return rookMoves(r,c,board);
    if (p === 'B') return bishopMoves(r,c,board);
    if (p === 'Q') return queenMoves(r,c,board);
    if (p === 'K') return kingMoves(r,c);
    if (p === 'P') return [[r-1,c],[r-2,c]].filter(([nr])=>nr>=0); // simplified
  }
  if (ex.type === 'guided-move') {
    return ex.from ? [ex.from, ex.to].filter(Boolean) : [];
  }
  if (ex.type === 'multi-placement') {
    return ex.pieces?.map(p => p.square) || [];
  }
  return [];
}

// ── Chess Board Component ────────────────────────
function ChessBoard({ board, highlights=[], onSquareClick, label, color='#1d9e75', note, interactive=false }) {
  return (
    <div className="chess-board-wrap">
      <div className="board-owner-label" style={{color}}>
        <span className="owner-indicator" style={{background:color}}/>
        {label}
      </div>
      <div className="board-with-coords">
        <div className="rank-labels">
          {RANKS.map(r=><div key={r} className="coord-label">{r}</div>)}
        </div>
        <div className="board-col-wrap">
          <div className="chess-grid">
            {board.map((row,r)=>row.map((piece,c)=>{
              const light=(r+c)%2===0;
              const hl=highlights.some(h=>h[0]===r&&h[1]===c);
              return (
                <div key={`${r}-${c}`}
                  className={`sq ${light?'sq-light':'sq-dark'} ${hl?'sq-hl':''} ${interactive&&hl?'sq-clickable':''}`}
                  onClick={() => interactive && onSquareClick && onSquareClick(r,c)}>
                  {piece && <span className="piece">{PIECES[piece]||''}</span>}
                </div>
              );
            }))}
          </div>
          <div className="file-labels">
            {FILES.map(f=><div key={f} className="coord-label">{f}</div>)}
          </div>
        </div>
      </div>
      {note && <div className="board-note">{note}</div>}
    </div>
  );
}

// ── Part indicator ───────────────────────────────
function PartIndicator({ parts, currentPart }) {
  const labels = { instruction:'Instruction', exercises:'Exercises', challenge:'Challenge' };
  const colors  = { instruction:'#6c63ff', exercises:'#1d9e75', challenge:'#ba7517' };
  return (
    <div className="part-indicator">
      {parts.map((p,i) => (
        <div key={i} className={`part-pip ${p.part===currentPart?'part-pip-active':''}`}
          style={p.part===currentPart?{background:colors[p.part],borderColor:colors[p.part]}:{}}>
          <span className="part-pip-dot" />
          <span className="part-pip-label">{labels[p.part]}</span>
          <span className="part-pip-time">{p.duration}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main ChessLesson component ───────────────────
export default function ChessLesson({ lessonIndex=0, childName='Student', onComplete }) {
  const lesson = CHESS_LESSONS_EXPANDED[lessonIndex] || CHESS_LESSONS_EXPANDED[0];
  const parts  = lesson.parts || [];

  const [partIdx,      setPartIdx]      = useState(0);
  const [exerciseIdx,  setExerciseIdx]  = useState(0);
  const [studentBoard, setStudentBoard] = useState(null);
  const [feedback,     setFeedback]     = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // success | error | hint
  const [exerciseDone, setExerciseDone] = useState(false);
  const [partDone,     setPartDone]     = useState(false);
  const [lessonDone,   setLessonDone]   = useState(false);
  const [showHint,     setShowHint]     = useState(false);
  const [hintUsed,     setHintUsed]     = useState(0);

  const currentPart = parts[partIdx] || parts[0];
  const exercises   = currentPart?.exercises || [];
  const currentEx   = exercises[exerciseIdx];

  // Rebuild board when part or exercise changes
  useEffect(() => {
    const board = buildBoardForExercise(currentEx, lesson.id);
    setStudentBoard(board);
    setFeedback('');
    setFeedbackType('');
    setExerciseDone(false);
    setShowHint(false);
  }, [partIdx, exerciseIdx, lessonIndex]);

  const highlights = getHighlights(currentEx, studentBoard || EMPTY_BOARD);

  // ── Handle square click on student board ──────
  function handleSquareClick(r, c) {
    if (exerciseDone || !currentEx) return;
    const ex = currentEx;

    if (ex.type === 'placement' || ex.type === 'timed-placement') {
      const target = ex.square;
      if (!target) return;
      if (r === target[0] && c === target[1]) {
        const nb = studentBoard.map(row => [...row]);
        nb[r][c] = `w${ex.piece || 'K'}`;
        setStudentBoard(nb);
        markExerciseDone('✅ Correct! Well placed!');
      } else {
        setFeedback(`Not quite. Try again — look for the highlighted square.`);
        setFeedbackType('error');
      }
      return;
    }

    if (ex.type === 'identify') {
      const piece = studentBoard[r][c];
      if (piece && piece.includes(ex.piece)) {
        markExerciseDone('✅ Correct! That is the ' + PIECE_NAMES[ex.piece] + '!');
      } else {
        setFeedback('That is not the ' + PIECE_NAMES[ex.piece] + '. Look for the right piece!');
        setFeedbackType('error');
      }
      return;
    }

    if (ex.type === 'show-moves') {
      const isHL = highlights.some(h => h[0]===r && h[1]===c);
      if (isHL) {
        const nb = studentBoard.map(row => [...row]);
        nb[r][c] = nb[r][c] ? null : 'wX'; // mark visited
        setStudentBoard(nb);
        // Count how many highlights have been clicked
        const visited = nb.flat().filter(p => p==='wX').length;
        if (visited >= Math.min(highlights.length, 3)) {
          markExerciseDone('✅ Great! You found the moves!');
        } else {
          setFeedback(`Good! Keep finding the squares — ${highlights.length - visited} more to go.`);
          setFeedbackType('hint');
        }
      } else {
        setFeedback('That square is not reachable from here. Try a highlighted square.');
        setFeedbackType('error');
      }
      return;
    }

    if (ex.type === 'guided-move' && ex.from) {
      const nb = studentBoard.map(row => [...row]);
      if (r===ex.from[0] && c===ex.from[1]) {
        setFeedback('Good — now click where you want to move it.');
        setFeedbackType('hint');
        return;
      }
      if (ex.to && r===ex.to[0] && c===ex.to[1]) {
        const piece = nb[ex.from[0]][ex.from[1]];
        nb[ex.to[0]][ex.to[1]] = piece;
        nb[ex.from[0]][ex.from[1]] = null;
        setStudentBoard(nb);
        markExerciseDone('✅ Perfect move!');
        return;
      }
      setFeedback('Move the highlighted piece to the highlighted destination.');
      setFeedbackType('error');
      return;
    }

    // move-test / capture-test — click anywhere to answer yes/no
    if (ex.type === 'move-test' || ex.type === 'capture-test') {
      markExerciseDone(ex.answer
        ? '✅ Yes it can! ' + (ex.tip || '')
        : '❌ No it cannot! ' + (ex.tip || ''));
      return;
    }
  }

  function markExerciseDone(msg) {
    setFeedback(msg);
    setFeedbackType('success');
    setExerciseDone(true);
    setTimeout(() => advanceExercise(), 1800);
  }

  function advanceExercise() {
    const nextEx = exerciseIdx + 1;
    if (nextEx >= exercises.length) {
      setPartDone(true);
    } else {
      setExerciseIdx(nextEx);
      setExerciseDone(false);
      setFeedback('');
    }
  }

  function advancePart() {
    const nextPart = partIdx + 1;
    if (nextPart >= parts.length) {
      setLessonDone(true);
      setTimeout(() => onComplete && onComplete(), 2000);
    } else {
      setPartIdx(nextPart);
      setExerciseIdx(0);
      setPartDone(false);
      setFeedback('');
    }
  }

  function useHint() {
    setShowHint(true);
    setHintUsed(h => h + 1);
  }

  if (!lesson || !currentPart) return null;

  const color = '#1d9e75';
  const pale  = '#e1f5ee';

  // ── LESSON DONE ──────────────────────────────
  if (lessonDone) return (
    <div className="chess-lesson">
      <div className="chess-lesson-done">
        <div style={{fontSize:64}}>🏆</div>
        <h2>Chess Lesson Complete!</h2>
        <p>{lesson.title} — well done {childName}!</p>
        <p className="chess-done-tip">{lesson.tip}</p>
      </div>
    </div>
  );

  // ── PART DONE — transition screen ─────────────
  if (partDone) return (
    <div className="chess-lesson">
      <div className="chess-part-done">
        <div style={{fontSize:52}}>✅</div>
        <h2>{currentPart.part === 'instruction' ? 'Instruction complete!'
            : currentPart.part === 'exercises'   ? 'Exercises complete!'
            : 'Challenge complete!'}</h2>
        <p style={{marginBottom:24, color:'#555', lineHeight:1.7}}>
          {currentPart.part === 'instruction'
            ? 'You have learned the concept. Now let\'s practise it!'
            : currentPart.part === 'exercises'
            ? 'Great work! Now for the challenge round!'
            : 'Excellent! You have completed this lesson!'}
        </p>
        <button className="chess-advance-btn" style={{background:color}} onClick={advancePart}>
          {currentPart.part === 'instruction' ? 'Start exercises →'
           : currentPart.part === 'exercises'  ? 'Take the challenge →'
           : 'Finish lesson →'}
        </button>
      </div>
    </div>
  );

  // ── INSTRUCTION PART ─────────────────────────
  if (currentPart.part === 'instruction') return (
    <div className="chess-lesson">
      <div className="chess-lesson-header">
        <div className="chess-lesson-meta">
          <h1 className="chess-lesson-title">{lesson.title}</h1>
          <p className="chess-lesson-sub">{lesson.subtitle} · {lesson.levelName}</p>
        </div>
        <div className="chess-step-badge" style={{background:pale, color}}>
          Lesson {lesson.step} of {lesson.totalSteps}
        </div>
      </div>

      <div className="chess-prog-bar">
        <div className="chess-prog-fill" style={{width:`${(lesson.step/lesson.totalSteps)*100}%`, background:color}} />
      </div>

      <PartIndicator parts={parts} currentPart={currentPart.part} />

      <div className="chess-instruction-body">
        <div className="chess-instruction-left">
          <div className="chess-part-badge" style={{background:'#eeedfe', color:'#6c63ff'}}>
            📖 {currentPart.title} · {currentPart.duration}
          </div>
          <div className="chess-momo-instruction">
            <div className="chess-momo-avatar">🎓</div>
            <div className="chess-momo-bubble">
              <div className="chess-momo-name">Ms. Momo</div>
              <p className="chess-momo-text">{currentPart.content}</p>
            </div>
          </div>
          {lesson.tip && (
            <div className="chess-tip-box">
              <span className="chess-tip-icon">💡</span>
              <span>{lesson.tip}</span>
            </div>
          )}
          <button className="chess-advance-btn" style={{background:color}} onClick={advancePart}>
            I understand — start exercises →
          </button>
        </div>

        <div className="chess-instruction-right">
          <ChessBoard
            board={FULL_START}
            highlights={lesson.targetSquare ? [lesson.targetSquare] : []}
            label="Ms. Momo's board"
            color="#6c63ff"
            note={lesson.rightPanelNote || 'Study this position carefully'}
          />
        </div>
      </div>
    </div>
  );

  // ── EXERCISES PART ────────────────────────────
  if (currentPart.part === 'exercises') return (
    <div className="chess-lesson">
      <div className="chess-lesson-header">
        <div className="chess-lesson-meta">
          <h1 className="chess-lesson-title">{lesson.title}</h1>
          <p className="chess-lesson-sub">{lesson.subtitle} · {lesson.levelName}</p>
        </div>
        <div className="chess-step-badge" style={{background:pale, color}}>
          Exercise {exerciseIdx+1} of {exercises.length}
        </div>
      </div>

      <div className="chess-prog-bar">
        <div className="chess-prog-fill"
          style={{width:`${((exerciseIdx+(exerciseDone?1:0))/exercises.length)*100}%`, background:color}} />
      </div>

      <PartIndicator parts={parts} currentPart={currentPart.part} />

      <div className="chess-exercise-body">
        <div className="chess-exercise-left">
          <div className="chess-part-badge" style={{background:pale, color}}>
            ✏️ {currentPart.title} · {currentPart.duration}
          </div>

          <div className="chess-exercise-instruction">
            <div className="chess-ex-num" style={{background:color}}>{exerciseIdx+1}</div>
            <p className="chess-ex-text">{currentEx?.instruction}</p>
          </div>

          {feedback && (
            <div className={`chess-feedback chess-feedback-${feedbackType}`}>
              {feedback}
            </div>
          )}

          {showHint && currentEx?.tip && (
            <div className="chess-hint">
              💡 {currentEx.tip}
            </div>
          )}

          <div className="chess-exercise-actions">
            {!exerciseDone && !showHint && hintUsed < 3 && (
              <button className="chess-hint-btn" onClick={useHint}>💡 Show hint</button>
            )}
            {exerciseDone && (
              <button className="chess-advance-btn" style={{background:color}} onClick={advanceExercise}>
                Next exercise →
              </button>
            )}
          </div>

          {/* Yes/No buttons for move-test type */}
          {(currentEx?.type === 'move-test' || currentEx?.type === 'capture-test') && !exerciseDone && (
            <div className="chess-yesno">
              <button className="chess-yes-btn" onClick={() => {
                if (currentEx.answer === true) markExerciseDone('✅ Correct! ' + (currentEx.tip||''));
                else { setFeedback('Not quite. ' + (currentEx.tip||'')); setFeedbackType('error'); }
              }}>Yes it can ✓</button>
              <button className="chess-no-btn" onClick={() => {
                if (currentEx.answer === false) markExerciseDone('✅ Correct! ' + (currentEx.tip||''));
                else { setFeedback('Not quite. ' + (currentEx.tip||'')); setFeedbackType('error'); }
              }}>No it cannot ✗</button>
            </div>
          )}
        </div>

        <div className="chess-exercise-right">
          <ChessBoard
            board={studentBoard || EMPTY_BOARD}
            highlights={exerciseDone ? [] : highlights}
            onSquareClick={handleSquareClick}
            interactive={!exerciseDone}
            label={`Your board — ${currentEx?.type === 'show-moves' ? 'click the highlighted squares' : 'interact here'}`}
            color={color}
            note={exerciseDone ? '✅ Done! Loading next exercise...' : 'Click the highlighted squares'}
          />
        </div>
      </div>
    </div>
  );

  // ── CHALLENGE PART ────────────────────────────
  return (
    <div className="chess-lesson">
      <div className="chess-lesson-header">
        <div className="chess-lesson-meta">
          <h1 className="chess-lesson-title">{lesson.title}</h1>
          <p className="chess-lesson-sub">{lesson.subtitle} · {lesson.levelName}</p>
        </div>
        <div className="chess-step-badge" style={{background:'#faeeda', color:'#ba7517'}}>
          🏆 Challenge · {currentPart.duration}
        </div>
      </div>

      <div className="chess-prog-bar">
        <div className="chess-prog-fill" style={{width:'95%', background:'#ba7517'}} />
      </div>

      <PartIndicator parts={parts} currentPart={currentPart.part} />

      <div className="chess-challenge-body">
        <div className="chess-momo-instruction" style={{marginBottom:20}}>
          <div className="chess-momo-avatar">🎓</div>
          <div className="chess-momo-bubble">
            <div className="chess-momo-name">Ms. Momo</div>
            <p className="chess-momo-text">{currentPart.description}</p>
          </div>
        </div>

        <div className="chess-challenge-boards">
          <ChessBoard
            board={FULL_START}
            highlights={lesson.targetSquare ? [lesson.targetSquare] : []}
            label="Challenge board"
            color="#ba7517"
            note={currentPart.tip}
          />
        </div>

        <div className="chess-challenge-actions">
          <button className="chess-advance-btn" style={{background:'#ba7517'}} onClick={advancePart}>
            Complete challenge →
          </button>
        </div>
      </div>
    </div>
  );
}
