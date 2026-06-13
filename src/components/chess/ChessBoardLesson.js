/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LESSON_1 } from '../../data/chessLesson1';
import { speakElevenLabs, stopSpeech, parseHighlights } from '../../utils/elevenlabs';
import './ChessBoardLesson.css';

// ─────────────────────────────────────────────────────
// SVG PIECES — Wikipedia style, solid and bold
// Same pieces as lichess/chess.com
// ─────────────────────────────────────────────────────
const PIECES_SVG = {
  wK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-linejoin="miter"/>
      <path d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/>
    </g></svg>`,
  wQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/>
      <circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/>
      <path d="M9 26c8.5-8.5 15.5-4 22.5 0l3.5-13.5-7 9.5-3.5-10-4 10.5-3.5-10.5-4 10.5-7-9.5L9 26z"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5 4 3.5 6.5 1 16.5 1 23 0 3.5-1 5-2 4-3.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5 1.5-18.5 1.5-24 0z"/>
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0M13 37c4-1 15-1 19 0" fill="none"/>
    </g></svg>`,
  wR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
    </g></svg>`,
  wB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#fff" stroke="#000" stroke-linecap="butt">
        <path d="M9 36c3.39-1 16.11 1 13.5-1C9 35 32.61 35 36 36c0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-16.61.53-27-.5-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none"/>
    </g></svg>`,
  wN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-12.5 8-18"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-1.04.05-3.04-2-3-.963 0 .15 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 0 1 1-1 0 .5 1.5 0 0 1 1 0z" fill="#000" transform="matrix(.866.5-.5.866 9.69-5.17)"/>
    </g></svg>`,
  wP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C15.83 16.5 14.5 18.59 14.5 21c0 2.03.94 3.84 2.41 5.03C13.91 27.09 11.5 31.58 11.5 38h22c0-6.42-2.41-10.91-5.41-11.97C29.56 24.84 30.5 23.03 30.5 21c0-2.41-1.33-4.5-3.28-5.62C27.71 14.71 28 13.89 28 13c0-2.21-1.79-4-4-4h-2z" 
    fill="#fff" stroke="#000" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  bK: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke="#fff" stroke-linejoin="miter"/>
      <path d="M22.5 25c0 0 4.5-7.5 3-10.5 0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
      <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"/>
      <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none" stroke="#fff"/>
    </g></svg>`,
  bQ: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2.75" stroke="#fff"/><circle cx="14" cy="9" r="2.75" stroke="#fff"/>
      <circle cx="22.5" cy="8" r="2.75" stroke="#fff"/><circle cx="31" cy="9" r="2.75" stroke="#fff"/><circle cx="39" cy="12" r="2.75" stroke="#fff"/>
      <path d="M9 26c8.5-8.5 15.5-4 22.5 0l3.5-13.5-7 9.5-3.5-10-4 10.5-3.5-10.5-4 10.5-7-9.5L9 26z" stroke="#fff"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5 4 3.5 6.5 1 16.5 1 23 0 3.5-1 5-2 4-3.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5 1.5-18.5 1.5-24 0z" stroke="#fff"/>
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0M13 37c4-1 15-1 19 0" fill="none" stroke="#fff"/>
    </g></svg>`,
  bR: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" stroke="#fff"/>
      <path d="M34 14l-3 3H14l-3-3" stroke="#fff"/>
      <path d="M31 17v12.5H14V17" stroke="#fff"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5" stroke="#fff"/>
      <path d="M11 14h23" fill="none" stroke="#fff"/>
    </g></svg>`,
  bB: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="#fff" stroke-linecap="butt">
        <path d="M9 36c3.39-1 16.11 1 13.5-1C9 35 32.61 35 36 36c0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-16.61.53-27-.5-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
        <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
        <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
      </g>
      <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5" fill="none" stroke="#fff"/>
    </g></svg>`,
  bN: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <g fill="#000" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-12.5 8-18" stroke="#fff"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-1.04.05-3.04-2-3-.963 0 .15 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3" stroke="#fff"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 0 1 1-1 0 .5 1.5 0 0 1 1 0z" fill="#fff" stroke="#fff" transform="matrix(.866.5-.5.866 9.69-5.17)"/>
    </g></svg>`,
  bP: `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C15.83 16.5 14.5 18.59 14.5 21c0 2.03.94 3.84 2.41 5.03C13.91 27.09 11.5 31.58 11.5 38h22c0-6.42-2.41-10.91-5.41-11.97C29.56 24.84 30.5 23.03 30.5 21c0-2.41-1.33-4.5-3.28-5.62C27.71 14.71 28 13.89 28 13c0-2.21-1.79-4-4-4h-2z"
    fill="#000" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function PieceSVG({ code, size = 56 }) {
  const svg = PIECES_SVG[code];
  if (!svg) return null;
  return (
    <div
      style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: svg.replace('viewBox', `width="${size}" height="${size}" viewBox`) }}
    />
  );
}

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES       = ['a','b','c','d','e','f','g','h'];
const RANKS_TOP   = ['8','7','6','5','4','3','2','1'];
const PIECE_NAMES = { K:'King', Q:'Queen', R:'Rook', B:'Bishop', N:'Knight', P:'Pawn' };

// ─────────────────────────────────────────────────────
// LARGE CHESS BOARD — fills the screen like lichess
// ─────────────────────────────────────────────────────
function ChessBoard({
  neonFile=null, neonRank=null, neonSquares=[],
  clickedSquares=[], wrongSquares=[], targetSquares=[],
  onSquareClick, boardPieces={},
}) {
  return (
    <div className="cbl-board-wrap">
      {/* Rank labels */}
      <div className="cbl-ranks">
        {RANKS_TOP.map(r => (
          <div key={r} className={`cbl-rank-lbl ${neonRank===r?'neon-coord':''}`}>{r}</div>
        ))}
      </div>

      {/* Board grid */}
      <div className="cbl-grid-col">
        <div className="cbl-grid">
          {RANKS_TOP.map((rankLabel, ri) => {
            const rankNum = parseInt(rankLabel);
            return FILES.map((file, fi) => {
              const sq = `${file}${rankNum}`;
              const isLight = (fi + (8-rankNum)) % 2 !== 0;
              const isNeonSq   = neonSquares.includes(sq);
              const isNeonFile = neonFile === file;
              const isNeonRank = neonRank === rankLabel;
              const isClicked  = clickedSquares.includes(sq);
              const isWrong    = wrongSquares.includes(sq);
              const isTarget   = targetSquares.includes(sq) && !isClicked;
              const piece      = boardPieces[sq];

              let extraClass = '';
              if (isWrong)                    extraClass = 'sq-wrong';
              else if (isClicked)             extraClass = 'sq-clicked';
              else if (isNeonSq || isNeonFile || isNeonRank) extraClass = 'sq-neon';
              else if (isTarget)              extraClass = 'sq-target';

              return (
                <div
                  key={sq}
                  className={`cbl-sq ${isLight?'sq-light':'sq-dark'} ${extraClass}`}
                  onClick={() => onSquareClick?.(sq)}
                >
                  {isClicked && <span className="sq-tick">✓</span>}
                  {isTarget && <span className="sq-ring" />}
                  {(isNeonSq||isNeonFile||isNeonRank) && <span className="sq-neon-ring" />}
                  {piece && (
                    <div className="sq-piece">
                      <PieceSVG code={piece} size={52} />
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>

        {/* File labels */}
        <div className="cbl-files">
          {FILES.map(f => (
            <div key={f} className={`cbl-file-lbl ${neonFile===f?'neon-coord':''}`}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PIECE TRAY — outside the board, above and below
// ─────────────────────────────────────────────────────
const TRAY_ORDER = ['K','Q','R','R','B','B','N','N'];

function PieceTray({ color, glowPieces=[], label }) {
  return (
    <div className="cbl-tray">
      <div className="cbl-tray-label">{label}</div>
      <div className="cbl-tray-row">
        {TRAY_ORDER.map((t, i) => {
          const name = PIECE_NAMES[t];
          const code = `${color}${t}`;
          const glow = glowPieces.includes(name.toLowerCase()) || glowPieces.includes(t.toLowerCase());
          return (
            <div key={`${t}-${i}`} className={`cbl-tray-piece ${glow?'tray-neon':''}`}>
              <PieceSVG code={code} size={40} />
              <span className="cbl-tray-name">{name}</span>
            </div>
          );
        })}
        {/* Pawns */}
        <div className={`cbl-tray-piece cbl-tray-pawns ${glowPieces.includes('pawn')?'tray-neon':''}`}>
          <div style={{display:'flex',alignItems:'center',gap:2}}>
            <PieceSVG code={`${color}P`} size={34} />
            <span className="cbl-pawn-x">×8</span>
          </div>
          <span className="cbl-tray-name">Pawns</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// RIGHT SIDEBAR — task, score, feedback, buttons
// ─────────────────────────────────────────────────────
function Sidebar({
  phase, step, score, total, streak,
  feedback, fbType, isPlaying,
  onContinue, continueLabel,
  speedState, quizState, onLightDark,
  fileQuizState, onFileAnswer,
}) {
  return (
    <div className="cbl-sidebar">

      {/* Phase indicator */}
      <div className="cbl-phase-chip">
        <span className="cbl-phase-icon">
          {phase?.type==='story'?'📖':phase?.type==='files'?'📊':
           phase?.type==='ranks'?'📈':phase?.type==='squares'?'🎯':
           phase?.type==='colours'?'🎨':phase?.type==='speed'?'⚡':'✅'}
        </span>
        <div>
          <div className="cbl-phase-name">{phase?.title}</div>
          <div className="cbl-phase-time">{phase?.durationMins} minutes</div>
        </div>
      </div>

      {/* Task */}
      {step?.task && (
        <div className="cbl-task-box">
          <div className="cbl-task-lbl">Your task</div>
          <div className="cbl-task-txt">{step.task}</div>
        </div>
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="cbl-playing">
          <span className="cbl-playing-dot" />
          Ms. Momo is speaking...
        </div>
      )}

      {/* Score */}
      {total > 0 && (
        <div className="cbl-score-row">
          <div className="cbl-score-box">
            <span className="cbl-score-n">{score}</span>
            <span className="cbl-score-d"> / {total}</span>
          </div>
          {streak >= 3 && <div className="cbl-streak">🔥 {streak} in a row!</div>}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`cbl-fb cbl-fb-${fbType}`}>
          {fbType==='success'?'✅ ':fbType==='error'?'❌ ':'💡 '}{feedback}
        </div>
      )}

      {/* Colour quiz */}
      {quizState?.active && (
        <div className="cbl-colour-btns">
          <button className="cbl-btn-light" onClick={()=>onLightDark('light')}>☀️ Light Square</button>
          <button className="cbl-btn-dark"  onClick={()=>onLightDark('dark')}>🌑 Dark Square</button>
        </div>
      )}

      {/* File quiz */}
      {fileQuizState?.active && (
        <div className="cbl-file-grid">
          {FILES.map(f=>(
            <button key={f} className="cbl-file-btn" onClick={()=>onFileAnswer(f)}>
              File {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Speed round */}
      {speedState?.active && (
        <div className="cbl-speed-box">
          <div className="cbl-speed-label">Find this square:</div>
          <div className="cbl-speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
          <div className="cbl-speed-track">
            <div className="cbl-speed-fill" style={{width:`${(speedState.timeLeft/speedState.totalTime)*100}%`}}/>
          </div>
          <div className="cbl-speed-meta">
            <span>⏱ {speedState.timeLeft}s</span>
            <span>✓ {speedState.hits} correct</span>
          </div>
        </div>
      )}

      {/* Continue */}
      {!speedState?.active && !quizState?.active && !fileQuizState?.active && (
        <button className="cbl-continue" onClick={onContinue}>
          {continueLabel || 'Continue →'}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// TUTOR BAR — Ms. Momo at the bottom
// ─────────────────────────────────────────────────────
function TutorBar({ text, voiceOn, onToggle, isPlaying }) {
  return (
    <div className="cbl-tutor-bar">
      <div className="cbl-tutor-av">🎓</div>
      <div className="cbl-tutor-bubble">
        <div className="cbl-tutor-name">
          Ms. Momo
          {voiceOn && (
            <span className="cbl-voice-pill">
              {isPlaying ? '🔊 speaking...' : '🔊 ElevenLabs'}
            </span>
          )}
        </div>
        <p className="cbl-tutor-text">{text}</p>
      </div>
      <button className={`cbl-voice-btn ${voiceOn?'cbl-voice-on':''}`} onClick={onToggle}>
        {voiceOn ? '🔊' : '🔇'}
      </button>
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

  const [neonFile,   setNeonFile]   = useState(null);
  const [neonRank,   setNeonRank]   = useState(null);
  const [neonSqs,    setNeonSqs]    = useState([]);
  const [glowPieces, setGlowPieces] = useState([]);
  const [clicked,    setClicked]    = useState([]);
  const [wrongSqs,   setWrongSqs]   = useState([]);
  const [targetSqs,  setTargetSqs]  = useState([]);
  const [boardPieces,setBoardPieces]= useState({});

  const [score,    setScore]    = useState(0);
  const [total,    setTotal]    = useState(0);
  const [streak,   setStreak]   = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fbType,   setFbType]   = useState('info');
  const [indepIdx, setIndepIdx] = useState(0);

  const [quizState,  setQuizState]  = useState(null);
  const [quizIdx,    setQuizIdx]    = useState(0);
  const [fileQS,     setFileQS]     = useState(null);
  const [speedState, setSpeedState] = useState(null);
  const [lessonDone, setLessonDone] = useState(false);

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
    m.forEach(x=>{
      if(x.type==='square') sqs.push(x.value);
      else if(x.type==='file') files.push(x.value);
      else if(x.type==='rank') ranks.push(x.value);
      else if(x.type==='piece') pieces.push(x.value);
    });
    if(files.length)  setNeonFile(files[0]);
    if(ranks.length)  setNeonRank(ranks[0]);
    if(sqs.length)    setNeonSqs(sqs);
    if(pieces.length) setGlowPieces(pieces);
    clearTimeout(neonTimer.current);
    neonTimer.current = setTimeout(()=>{
      setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    }, 10000);
  }

  useEffect(()=>{
    voiceRef.current = false;
    setClicked([]); setWrongSqs([]);
    setFeedback(''); setFbType('info');
    setSpeedState(null); setIndepIdx(0);
    setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    if(step?.highlightFile) setNeonFile(step.highlightFile);
    if(step?.highlightRank) setNeonRank(String(step.highlightRank));
    if(step?.highlights?.length) setNeonSqs(step.highlights);
    if(['click-file','click-rank','click-square'].includes(step?.taskType))
      setTargetSqs(step.targetSquares||[]);
    else setTargetSqs([]);
    if(step?.taskType==='colour-quiz'){
      setQuizState({active:true}); setQuizIdx(0);
      const f=step.quizSquares?.[0]?.sq; if(f) setNeonSqs([f]);
    } else setQuizState(null);
    if(step?.taskType==='file-name-quiz') startFileQuiz();
    else setFileQS(null);
  },[phaseIdx, stepIdx]);

  useEffect(()=>{
    if(!voiceOn||!step?.voice||voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice);
    const t = setTimeout(()=>{
      applyNeon(text);
      speakElevenLabs(text,{
        onStart:()=>setIsPlaying(true),
        onEnd:()=>setIsPlaying(false),
        onError:()=>setIsPlaying(false),
      });
    }, 500);
    return ()=>clearTimeout(t);
  },[phaseIdx, stepIdx, voiceOn]);

  const nextStep = useCallback(()=>{
    stopSpeech();
    setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    const nsi=stepIdx+1;
    if(nsi<steps.length){ setStepIdx(nsi); return; }
    const npi=phaseIdx+1;
    if(npi<phases.length){ setPhaseIdx(npi); setStepIdx(0); return; }
    setLessonDone(true);
    speakElevenLabs(`Congratulations ${childName}! You have completed your very first chess lesson! You are absolutely brilliant!`);
    setTimeout(()=>onComplete?.(), 4000);
  },[stepIdx, steps.length, phaseIdx, phases.length, childName]);

  function showFb(msg, type, voice=''){
    setFeedback(fill(msg)); setFbType(type);
    if(voice&&voiceOn){
      const vt=fill(voice); applyNeon(vt);
      speakElevenLabs(vt,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  function handleSquareClick(sq){
    if(!step) return;
    const tt=step.taskType;

    if(tt==='click-file'||tt==='click-rank'){
      if(step.targetSquares?.includes(sq)&&!clicked.includes(sq)){
        const nc=[...clicked,sq]; setClicked(nc); setStreak(s=>s+1);
        if(nc.length===step.targetSquares.length){
          setScore(s=>s+nc.length); setTotal(t=>t+nc.length); setTargetSqs([]);
          showFb(step.successVoice||'Complete!','success',step.successVoice);
          setTimeout(nextStep,1900);
        } else showFb(`✓ ${nc.length} of ${step.targetSquares.length}!`,'hint');
      } else if(!step.targetSquares?.includes(sq)){
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),600);
        showFb(`That square is not in this ${tt==='click-file'?'file':'rank'}!`,'error');
      }
      return;
    }

    if(tt==='click-square'){
      setTotal(t=>t+1);
      if(step.targetSquares?.includes(sq)){
        setClicked([sq]); setScore(s=>s+1); setStreak(s=>s+1); setTargetSqs([]);
        showFb(step.successVoice||'Correct!','success',step.successVoice);
        setTimeout(nextStep,1900);
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),700);
        showFb(step.wrongVoice||'Not quite — try again!','error',step.wrongVoice);
      }
      return;
    }

    if(tt==='independent-squares'){
      const tgts=step.targetSquares||[], curr=tgts[indepIdx];
      if(!curr) return;
      setTotal(t=>t+1);
      if(sq===curr){
        setClicked(p=>[...p,sq]); setScore(s=>s+1); setStreak(s=>s+1);
        const vm=(step.voiceCorrect?.[indepIdx]||'Correct!').replace(/\{name\}/g,childName);
        showFb(vm,'success');
        if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
        const ni=indepIdx+1;
        if(ni>=tgts.length){
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
        const vm=(step.voiceWrong||`Not quite! Find ${(step.targetSquares?.[indepIdx]||'').toUpperCase()}!`)
          .replace('{sq}',(step.targetSquares?.[indepIdx]||'').toUpperCase())
          .replace('{file}',(step.targetSquares?.[indepIdx]||'')[0]?.toUpperCase()||'')
          .replace('{fileNum}',String((step.targetSquares?.[indepIdx]||'a').charCodeAt(0)-96))
          .replace('{rank}',(step.targetSquares?.[indepIdx]||'')[1]||'')
          .replace(/\{name\}/g,childName);
        showFb(vm,'error');
        if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      }
      return;
    }

    if(tt==='speed-round'&&speedState?.active){
      if(sq===speedState.currentTarget){
        const nh=speedState.hits+1;
        setClicked(p=>[...p,sq]); setStreak(s=>s+1);
        const rem=speedState.targets.filter(t=>!speedState.done.includes(t)&&t!==sq);
        if(!rem.length) endSpeedRound(nh);
        else {
          const next=rem[0];
          setSpeedState(p=>({...p,hits:nh,currentTarget:next,done:[...p.done,sq]}));
          setNeonSqs([next]);
          showFb(`✓ ${sq.toUpperCase()} — find ${next.toUpperCase()}!`,'success');
        }
      } else { setWrongSqs([sq]); setStreak(0); setTimeout(()=>setWrongSqs([]),400); }
    }
  }

  function startSpeedRound(){
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

  function endSpeedRound(hits){
    clearInterval(speedRef.current);
    setSpeedState(p=>p?{...p,active:false}:p); setNeonSqs([]);
    const tgt=step.targetScore||12, tot=(step.targetSquares||[]).length;
    setScore(hits); setTotal(tot);
    let vm=hits>=tgt?step.successVoice:hits>=tgt*0.7?step.goodVoice:step.tryAgainVoice;
    vm=(vm||`You scored ${hits}!`).replace('{score}',hits).replace(/\{name\}/g,childName);
    showFb(vm,hits>=tgt?'success':'hint',vm);
    setTimeout(nextStep,3200);
  }

  function handleLightDark(answer){
    if(!quizState?.active) return;
    const qs=step.quizSquares||[], curr=qs[quizIdx];
    if(!curr) return;
    setTotal(t=>t+1);
    if(answer===curr.colour){
      setScore(s=>s+1); setStreak(s=>s+1); setClicked(p=>[...p,curr.sq]);
      const vm=(step.voiceCorrect||'Correct!').replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'success');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
      const ni=quizIdx+1;
      if(ni>=qs.length){
        setQuizState({active:false});
        setTimeout(()=>showFb((step.successVoice||'Done!').replace('{score}',score+1).replace(/\{name\}/g,childName),'success'),500);
        setTimeout(nextStep,2600);
      } else { setQuizIdx(ni); setNeonSqs([qs[ni].sq]); setTimeout(()=>showFb(`Is ${qs[ni].sq.toUpperCase()} light or dark?`,'hint'),700); }
    } else {
      setStreak(0); setWrongSqs([curr.sq]); setTimeout(()=>setWrongSqs([]),800);
      const vm=(step.voiceWrong||`${curr.sq} is ${curr.colour}!`).replace('{sq}',curr.sq.toUpperCase()).replace('{colour}',curr.colour);
      showFb(vm,'error');
      if(voiceOn) speakElevenLabs(vm,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});
    }
  }

  function startFileQuiz(){
    const shuffled=[...FILES].sort(()=>Math.random()-0.5).slice(0,6);
    setFileQS({active:true,remaining:shuffled.slice(1),current:shuffled[0]});
    setNeonFile(shuffled[0]); setNeonRank(null); setNeonSqs([]);
  }

  function handleFileAnswer(answer){
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

  function handleContinue(){
    if(step?.taskType==='speed-intro'){ startSpeedRound(); return; }
    if(step?.taskType==='complete'){ setLessonDone(true); setTimeout(()=>onComplete?.(),1500); return; }
    nextStep();
  }

  const boardNeonSqs = [
    ...neonSqs,
    ...(step?.taskType==='independent-squares'?[step.targetSquares?.[indepIdx]].filter(Boolean):[]),
    ...(step?.taskType==='colour-quiz'&&quizState?.active?[step.quizSquares?.[quizIdx]?.sq].filter(Boolean):[]),
    ...(step?.taskType==='speed-round'&&speedState?.active?[speedState.currentTarget].filter(Boolean):[]),
  ];

  const pct = Math.round((phaseIdx/phases.length)*100);
  const contLabel = step?.taskType==='speed-intro'?'⚡ Start Speed Challenge!':step?.continueLabel||'Continue →';

  if(lessonDone) return (
    <div className="cbl-done">
      <div className="cbl-done-card">
        <div style={{fontSize:64,marginBottom:16}}>🏆</div>
        <h2>Lesson 1 Complete!</h2>
        <p className="cbl-done-sub">The Board — Files, Ranks and Squares</p>
        <p className="cbl-done-msg">Outstanding work {childName}! You know every single square on the chess board. You are ready for Lesson 2!</p>
        <div className="cbl-done-score"><span className="cbl-done-n">{score}</span><span className="cbl-done-lbl"> correct answers</span></div>
      </div>
    </div>
  );

  return (
    <div className="cbl-root">

      {/* ── Top bar ── */}
      <div className="cbl-topbar">
        <div className="cbl-topbar-left">
          <span className="cbl-lesson-title">{lesson.title}</span>
          <span className="cbl-lesson-sub">{lesson.subtitle}</span>
        </div>
        <div className="cbl-progress">
          <div className="cbl-prog-track">
            <div className="cbl-prog-fill" style={{width:`${pct}%`}} />
          </div>
          <span className="cbl-prog-phase">{phase?.title}</span>
          <span className="cbl-prog-pct">{pct}%</span>
        </div>
      </div>

      {/* ── Main: board (large) + sidebar (narrow) ── */}
      <div className="cbl-main">

        {/* Board area: tray + board + tray stacked */}
        <div className="cbl-board-area">
          <PieceTray color="b" glowPieces={glowPieces} label="Black's pieces" />

          <ChessBoard
            neonFile={neonFile}
            neonRank={neonRank}
            neonSquares={boardNeonSqs}
            clickedSquares={clicked}
            wrongSquares={wrongSqs}
            targetSquares={targetSqs}
            onSquareClick={handleSquareClick}
            boardPieces={boardPieces}
          />

          <PieceTray color="w" glowPieces={glowPieces} label="White's pieces" />
        </div>

        {/* Sidebar */}
        <Sidebar
          phase={phase} step={step}
          score={score} total={total} streak={streak}
          feedback={feedback} fbType={fbType} isPlaying={isPlaying}
          onContinue={handleContinue} continueLabel={contLabel}
          speedState={speedState?.active?speedState:null}
          quizState={quizState?.active?quizState:null}
          onLightDark={handleLightDark}
          fileQuizState={fileQS?.active?fileQS:null}
          onFileAnswer={handleFileAnswer}
        />
      </div>

      {/* ── Tutor bar ── */}
      <TutorBar
        text={fill(step?.voice||'')}
        voiceOn={voiceOn}
        isPlaying={isPlaying}
        onToggle={()=>{
          const n=!voiceOn; setVoiceOn(n);
          if(!n) stopSpeech();
          else if(step?.voice){const t=fill(step.voice);applyNeon(t);speakElevenLabs(t,{onStart:()=>setIsPlaying(true),onEnd:()=>setIsPlaying(false)});}
        }}
      />
    </div>
  );
}
