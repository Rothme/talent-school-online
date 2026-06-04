import React, { useState, useEffect } from 'react';
import TopNav from '../layout/TopNav';
import MsMomoBar from '../shared/MsMomoBar';
import { CHESS_LESSONS } from '../../data/curriculum';
import './ChessLesson.css';

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

function buildStudentBoard(lessonId) {
  const b = FULL_START.map(r=>[...r]);
  if (lessonId==='chess-1') b[7][4]=null;
  if (lessonId==='chess-2') b[7][3]=null;
  return b;
}

function ChessBoard({ position, highlights=[], onSquareClick, label, ownerColor, note }) {
  return (
    <div className="chess-board-wrap">
      <div className="board-owner-label" style={{color:ownerColor}}>
        <span className="owner-indicator" style={{background:ownerColor}}/>
        {label}
      </div>
      <div className="board-with-coords">
        <div className="rank-labels">
          {RANKS.map(r=><div key={r} className="coord-label">{r}</div>)}
        </div>
        <div className="board-col-wrap">
          <div className="chess-grid">
            {position.map((row,r)=>row.map((piece,c)=>{
              const light=(r+c)%2===0;
              const hl=highlights.some(h=>h[0]===r&&h[1]===c);
              const empty=!piece&&hl;
              return (
                <div
                  key={`${r}-${c}`}
                  className={['chess-sq',light?'sq-light':'sq-dark',hl?'sq-hl':'',empty?'sq-empty-target':''].join(' ')}
                  onClick={()=>onSquareClick&&onSquareClick(r,c)}
                  role={onSquareClick?'button':undefined}
                  aria-label={`${FILES[c]}${8-r}`}
                >
                  {piece && <span className="chess-piece">{PIECES[piece]}</span>}
                  {empty && <span className="target-dot"/>}
                </div>
              );
            }))}
          </div>
          <div className="file-labels">
            {FILES.map(f=><div key={f} className="coord-label">{f}</div>)}
          </div>
        </div>
        <div className="rank-labels">
          {RANKS.map(r=><div key={r} className="coord-label">{r}</div>)}
        </div>
      </div>
      {note && <div className="board-note">{note}</div>}
    </div>
  );
}

export default function ChessLesson({ lessonIndex=0, childName='Student', onComplete }) {
  const lesson = CHESS_LESSONS[lessonIndex]||CHESS_LESSONS[0];
  const [studentBoard, setStudentBoard] = useState(()=>buildStudentBoard(lesson.id));
  const [showHint, setShowHint] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(()=>{
    setStudentBoard(buildStudentBoard(lesson.id));
    setSuccess(false);
    setShowHint(false);
  },[lessonIndex,lesson.id]);

  function handleClick(r,c) {
    if (success||!lesson.targetSquare) return;
    const [tr,tc]=lesson.targetSquare;
    if (r===tr&&c===tc) {
      const nb=studentBoard.map(row=>[...row]);
      nb[r][c]=`w${lesson.targetPiece}`;
      setStudentBoard(nb);
      setSuccess(true);
      setTimeout(()=>onComplete&&onComplete(),2000);
    }
  }

  const highlights = lesson.targetSquare?[lesson.targetSquare]:[];

  return (
    <div className="chess-lesson">
      <TopNav childName={childName} streak={7} xp={20} backTo="/child/dashboard"/>
      <div className="lesson-title-bar">
        <div>
          <h1 className="lesson-main-title">{lesson.title}</h1>
          <p className="lesson-subtitle">{lesson.subtitle}&nbsp;·&nbsp;{lesson.stage}</p>
        </div>
        <div className="step-badge">Step {lesson.step} of {lesson.totalSteps}</div>
      </div>
      <div className="lesson-prog-bar">
        <div className="lesson-prog-fill"
          style={{width:`${(lesson.step/lesson.totalSteps)*100}%`,background:'#1d9e75'}}/>
      </div>

      <div className="chess-main">
        <ChessBoard
          position={studentBoard}
          highlights={success?[]:highlights}
          onSquareClick={handleClick}
          label={`Your board — place the ${lesson.targetPiece?PIECE_NAMES[lesson.targetPiece]:'piece'}`}
          ownerColor="#1d9e75"
          note={success?'✅ Correct! Well done!':'Tap the highlighted square'}
        />
        <div className="chess-divider"/>
        <ChessBoard
          position={FULL_START}
          highlights={highlights}
          label="Ms. Momo's board — watch and copy"
          ownerColor="#6c63ff"
          note={lesson.rightPanelNote}
        />
      </div>

      {showHint&&<div className="hint-bar">💡 {lesson.tip}</div>}

      <div className="piece-legend-bar">
        {Object.entries(PIECE_NAMES).map(([sym,name])=>(
          <div key={sym} className="piece-legend-item">
            <span className="legend-piece">{PIECES[`w${sym}`]}</span>
            <span className="legend-name">{name}</span>
          </div>
        ))}
      </div>

      <MsMomoBar
        instruction={lesson.tutorInstruction}
        onHint={()=>setShowHint(h=>!h)}
        color="#1d9e75"
        nameColor="#5dcaa5"
      />
    </div>
  );
}
