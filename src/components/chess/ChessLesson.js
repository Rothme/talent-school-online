import React, { useState, useEffect } from 'react';
import TopNav from '../layout/TopNav';
import MsMomoBar from '../shared/MsMomoBar';
import { CHESS_LESSONS } from '../../data/curriculum';
import './ChessLesson.css';

const PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};

const PIECE_NAMES = {
  K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn'
};

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

const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];

function buildStudentBoard(lessonId) {
  const board = FULL_START.map(r => [...r]);
  if (lessonId === 'chess-1') { board[7][4] = null; }
  if (lessonId === 'chess-2') { board[7][3] = null; }
  return board;
}

function ChessBoard({ position, highlights = [], selected = null, onSquareClick, label, ownerColor, note }) {
  return (
    <div className="chess-board-wrap">
      <div className="board-owner-label" style={{ color: ownerColor }}>
        <span className="owner-indicator" style={{ background: ownerColor }} />
        {label}
      </div>
      <div className="board-with-coords">
        <div className="rank-labels">
          {RANKS.map(r => <div key={r} className="coord-label">{r}</div>)}
        </div>
        <div className="board-col-wrap">
          <div className="chess-grid">
            {position.map((row, r) =>
              row.map((piece, c) => {
                const isLight = (r + c) % 2 === 0;
                const isHL = highlights.some(h => h[0] === r && h[1] === c);
                const isSel = selected && selected[0] === r && selected[1] === c;
                const isEmpty = !piece && isHL;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={[
                      'chess-sq',
                      isLight ? 'sq-light' : 'sq-dark',
                      isHL ? 'sq-hl' : '',
                      isSel ? 'sq-selected' : '',
                      isEmpty ? 'sq-empty-target' : '',
                    ].join(' ')}
                    onClick={() => onSquareClick && onSquareClick(r, c)}
                    role={onSquareClick ? 'button' : undefined}
                    aria-label={`${FILES[c]}${8 - r}${piece ? ' ' + piece : ''}`}
                  >
                    {piece && <span className="chess-piece">{PIECES[piece]}</span>}
                    {isEmpty && <span className="target-dot" />}
                  </div>
                );
              })
            )}
          </div>
          <div className="file-labels">
            {FILES.map(f => <div key={f} className="coord-label">{f}</div>)}
          </div>
        </div>
        <div className="rank-labels">
          {RANKS.map(r => <div key={r} className="coord-label">{r}</div>)}
        </div>
      </div>
      {note && <div className="board-note">{note}</div>}
    </div>
  );
}

export default function ChessLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {
  const lesson = CHESS_LESSONS[lessonIndex] || CHESS_LESSONS[0];
  const [studentBoard, setStudentBoard] = useState(() => buildStudentBoard(lesson.id));
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hintTarget, setHintTarget] = useState(null);

  useEffect(() => {
    setStudentBoard(buildStudentBoard(lesson.id));
    setSuccess(false);
    setShowHint(false);
    setHintTarget(null);
  }, [lessonIndex, lesson.id]);

  function handleStudentSquareClick(r, c) {
    if (success) return;
    if (!lesson.targetSquare) return;
    const [tr, tc] = lesson.targetSquare;
    if (r === tr && c === tc) {
      const newBoard = studentBoard.map(row => [...row]);
      newBoard[r][c] = `w${lesson.targetPiece}`;
      setStudentBoard(newBoard);
      setSuccess(true);
      setTimeout(() => onComplete && onComplete(), 2000);
    } else {
      setHintTarget([r, c]);
      setTimeout(() => setHintTarget(null), 600);
    }
  }

  const tutorHighlights = lesson.targetSquare ? [lesson.targetSquare] : [];
  const studentHighlights = lesson.targetSquare ? [lesson.targetSquare] : [];

  return (
    <div className="chess-lesson">
      <TopNav childName={childName} streak={7} xp={20} backTo="/child/dashboard" />

      <div className="lesson-title-bar">
        <div>
          <h1 className="lesson-main-title">{lesson.title}</h1>
          <p className="lesson-subtitle">{lesson.subtitle} &nbsp;·&nbsp; {lesson.stage}</p>
        </div>
        <div className="step-badge">Step {lesson.step} of {lesson.totalSteps}</div>
      </div>

      <div className="lesson-prog-bar">
        <div
          className="lesson-prog-fill"
          style={{ width: `${(lesson.step / lesson.totalSteps) * 100}%`, background: '#1d9e75' }}
        />
      </div>

      <div className="chess-main">
        <ChessBoard
          position={studentBoard}
          highlights={success ? [] : studentHighlights}
          onSquareClick={handleStudentSquareClick}
          label={`Your board — ${lesson.targetPiece ? `place the ${PIECE_NAMES[lesson.targetPiece]}` : 'make your move'}`}
          ownerColor="#1d9e75"
          note={success
            ? '✅ Correct! Well done!'
            : hintTarget
            ? '❌ Not quite — try the highlighted square!'
            : `Tap the highlighted square to place the ${lesson.targetPiece ? PIECE_NAMES[lesson.targetPiece] : 'piece'}`}
        />

        <div className="chess-divider" />

        <ChessBoard
          position={FULL_START}
          highlights={tutorHighlights}
          label="Ms. Momo's board — watch and copy"
          ownerColor="#6c63ff"
          note={lesson.rightPanelNote}
        />
      </div>

      {showHint && (
        <div className="hint-bar">
          <span>💡</span>
          <span>{lesson.tip}</span>
        </div>
      )}

      <div className="piece-legend-bar">
        {Object.entries(PIECE_NAMES).map(([sym, name]) => (
          <div key={sym} className="piece-legend-item">
            <span className="legend-piece">{PIECES[`w${sym}`]}</span>
            <span className="legend-name">{name}</span>
          </div>
        ))}
      </div>

      <MsMomoBar
        instruction={lesson.tutorInstruction}
        onHint={() => setShowHint(h => !h)}
        color="#1d9e75"
        nameColor="#5dcaa5"
      />
    </div>
  );
}
