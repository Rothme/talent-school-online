import React, { useState, useEffect, useRef } from 'react';
import TopNav from '../layout/TopNav';
import MsMomoBar from '../shared/MsMomoBar';
import { CHESS_LESSONS } from '../../data/curriculum';
import './ChessLesson.css';

const PIECES = {
  wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
  bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟',
};

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

function buildStudentBoard(lessonId) {
  const board = FULL_START.map(r => [...r]);
  if (lessonId === 'chess-1') board[7][4] = null;
  if (lessonId === 'chess-2') board[7][3] = null;
  return board;
}

function ChessBoard({ position, highlights=[], onSquareClick, label, ownerColor, note, sqSize }) {
  const sz = sqSize || 52;
  return (
    <div className="chess-board-wrap" style={{'--sq-size': `${sz}px`}}>
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
                const isHL = highlights.some(h => h[0]===r && h[1]===c);
                const isEmpty = !piece && isHL;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={['chess-sq',
                      isLight ? 'sq-light' : 'sq-dark',
                      isHL ? 'sq-hl' : '',
                      isEmpty ? 'sq-empty-target' : '',
                    ].join(' ')}
                    onClick={() => onSquareClick && onSquareClick(r, c)}
                    role={onSquareClick ? 'button' : undefined}
                    aria-label={`${FILES[c]}${8-r}${piece?' '+piece:''}`}
                  >
                    {piece && <span className="chess-piece" style={{fontSize: `${sz*0.58}px`}}>{PIECES[piece]}</span>}
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

export default function ChessLesson({ lessonIndex=0, childName='Student', onComplete }) {
  const lesson = CHESS_LESSONS[lessonIndex] || CHESS_LESSONS[0];
  const [studentBoard, setStudentBoard] = useState(() => buildStudentBoard(lesson.id));
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [sqSize, setSqSize] = useState(52);
  const mainRef = useRef(null);

  // Dynamically calculate square size to fill available space
  useEffect(() => {
    function calcSize() {
      if (!mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const availH = rect.height - 80; // reserve space for labels/notes
      const availW = (rect.width / 2) - 60; // half width minus coords
      const byHeight = Math.floor(availH / 8);
      const byWidth = Math.floor(availW / 8);
      const size = Math.min(byHeight, byWidth, 70); // cap at 70px
      setSqSize(Math.max(size, 36)); // min 36px
    }
    calcSize();
    window.addEventListener('resize', calcSize);
    return () => window.removeEventListener('resize', calcSize);
  }, []);

  useEffect(() => {
    setStudentBoard(buildStudentBoard(lesson.id));
    setSuccess(false);
    setShowHint(false);
  }, [lessonIndex, lesson.id]);

  function handleSquareClick(r, c) {
    if (success || !lesson.targetSquare) return;
    const [tr, tc] = lesson.targetSquare;
    if (r === tr && c === tc) {
      const nb = studentBoard.map(row => [...row]);
      nb[r][c] = `w${lesson.targetPiece}`;
      setStudentBoard(nb);
      setSuccess(true);
      setTimeout(() => onComplete && onComplete(), 2000);
    }
  }

  const highlights = lesson.targetSquare ? [lesson.targetSquare] : [];

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
        <div className="lesson-prog-fill"
          style={{ width: `${(lesson.step/lesson.totalSteps)*100}%`, background: '#1d9e75' }} />
      </div>

      <div className="chess-main" ref={mainRef}>
        <ChessBoard
          position={studentBoard}
          highlights={success ? [] : highlights}
          onSquareClick={handleSquareClick}
          label={`Your board — place the ${lesson.targetPiece ? PIECE_NAMES[lesson.targetPiece] : 'piece'}`}
          ownerColor="#1d9e75"
          note={success ? '✅ Correct! Well done!' : `Tap the highlighted square to place the ${lesson.targetPiece ? PIECE_NAMES[lesson.targetPiece] : 'piece'}`}
          sqSize={sqSize}
        />
        <div className="chess-divider" />
        <ChessBoard
          position={FULL_START}
          highlights={highlights}
          label="Ms. Momo's board — watch and copy"
          ownerColor="#6c63ff"
          note={lesson.rightPanelNote}
          sqSize={sqSize}
        />
      </div>

      {showHint && (
        <div className="hint-bar">💡 {lesson.tip}</div>
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
