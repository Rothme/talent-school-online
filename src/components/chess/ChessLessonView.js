/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';
import { ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Swords, Award, Clock, RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import { LESSON_1, LESSON_1_BONUS } from '../../data/chessLesson1';
import { LESSON_2, LESSON_2_BONUS } from '../../data/chessLesson2';
import { LESSON_3_BONUS } from '../../data/chessLesson3';
import { LESSON_4_BONUS } from '../../data/chessLesson4';
import { LESSON_5_BONUS } from '../../data/chessLesson5';
import { speakElevenLabs, stopSpeech, parseHighlights, unlockAudio, pendingAudioClear } from '../../utils/elevenlabs';
import './ChessLessonView.css';

// Piece SVGs imported so CRA bundles them with correct Content-Type (image/svg+xml).
// The files in public/chesspieces/wikipedia/ are the same cburnett SVGs but
// mis-named as .png, which causes browsers to reject them. These .svg copies
// are imported here so webpack resolves them to hashed asset URLs.
import wKSvg from '../../assets/pieces/wK.svg';
import wQSvg from '../../assets/pieces/wQ.svg';
import wRSvg from '../../assets/pieces/wR.svg';
import wBSvg from '../../assets/pieces/wB.svg';
import wNSvg from '../../assets/pieces/wN.svg';
import wPSvg from '../../assets/pieces/wP.svg';
import bKSvg from '../../assets/pieces/bK.svg';
import bQSvg from '../../assets/pieces/bQ.svg';
import bRSvg from '../../assets/pieces/bR.svg';
import bBSvg from '../../assets/pieces/bB.svg';
import bNSvg from '../../assets/pieces/bN.svg';
import bPSvg from '../../assets/pieces/bP.svg';
const PIECE_SVG_URLS = { wK:wKSvg, wQ:wQSvg, wR:wRSvg, wB:wBSvg, wN:wNSvg, wP:wPSvg, bK:bKSvg, bQ:bQSvg, bR:bRSvg, bB:bBSvg, bN:bNSvg, bP:bPSvg };

const FILES = ['a','b','c','d','e','f','g','h'];

function fill(text, name) {
  return (text || '').replace(/\{name\}/g, name);
}

// Convert a FEN string to a react-chessboard position object
// so position changes can be diffed and animated piece-by-piece
function fenToPositionObj(fen) {
  if (!fen || fen === 'start') {
    return 'start'; // react-chessboard handles 'start' natively
  }
  if (typeof fen === 'object') return fen; // already a position obj
  try {
    const c = new Chess();
    c.load(fen, { skipValidation: true });
    const board = c.board();
    const pos = {};
    const pieceMap = { k:'K', q:'Q', r:'R', b:'B', n:'N', p:'P' };
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = board[r][f];
        if (sq) {
          const sqName = 'abcdefgh'[f] + (8 - r);
          pos[sqName] = (sq.color === 'w' ? 'w' : 'b') + pieceMap[sq.type];
        }
      }
    }
    return pos;
  } catch(e) {
    return fen; // fallback to raw FEN if parsing fails
  }
}

// Convert browser clientX/Y into a board square name (white orientation).
// rect = boardInnerRef.current.getBoundingClientRect()
function coordsToSquare(clientX, clientY, rect) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const sqSize = rect.width / 8;
  const fileIdx = Math.min(7, Math.max(0, Math.floor(x / sqSize)));
  const rankIdx = Math.min(7, Math.max(0, Math.floor(y / sqSize)));
  return 'abcdefgh'[fileIdx] + (8 - rankIdx);
}

function resolveBoardPosition(boardFen, placedPieces) {
  if (boardFen === 'empty-custom') {
    // Convert placedPieces {square: {piece, color}} -> {square: 'wP'}
    const pos = {};
    Object.entries(placedPieces || {}).forEach(([sq, p]) => {
      pos[sq] = `${p.color}${p.piece}`;
    });
    return pos;
  }
  // Convert FEN to position object for smooth animation
  return fenToPositionObj(boardFen || 'start');
}

// ─────────────────────────────────────────────────────
// Build square style overrides for neon highlights
// ─────────────────────────────────────────────────────
function buildSquareStyles({ neonFile, neonRank, neonSquares, clicked, wrong, targets,
  colourQuizSq, glowPieces, boardPosition, borderOnlySquares, speedActive, pathSqs, extraRanks,
  guidedPieceSquare, narratedSquares, tickSquares, pathSquares }) {
  const styles = {};

  function setStyle(sq, style) {
    styles[sq] = { ...(styles[sq] || {}), ...style };
  }

  // STYLE 1 — Full fill: entire file column in subtle tint
  if (neonFile) {
    for (let r = 1; r <= 8; r++) {
      setStyle(`${neonFile}${r}`, { backgroundColor: 'rgba(255,210,0,0.55)' });
    }
  }

  // STYLE 1 — Full fill: primary rank row in subtle tint
  if (neonRank) {
    FILES.forEach(f => {
      setStyle(`${f}${neonRank}`, { backgroundColor: 'rgba(255,210,0,0.55)' });
    });
  }

  // STYLE 1 — Additional ranks (from highlightRanks array)
  (extraRanks || []).forEach(r => {
    FILES.forEach(f => {
      setStyle(`${f}${r}`, { backgroundColor: 'rgba(255,210,0,0.55)' });
    });
  });

  // STYLE 2 — Vivid orange spotlight: intersection square when both file AND rank active
  if (neonFile && neonRank) {
    setStyle(`${neonFile}${neonRank}`, {
      backgroundColor: 'rgba(249,115,22,0.92)',
      boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.9)',
      borderRadius: '4px',
    });
  }

  // Named squares from lesson data (e.g. step.highlights)
  (neonSquares || []).forEach(sq => {
    // In guided piece-range mode, the piece's home square must not be styled orange —
    // it is the piece's position, not a target, and would confuse the student.
    if (sq === guidedPieceSquare) return;
    if ((borderOnlySquares || []).includes(sq)) {
      // Colour-teaching blink — kept exactly as is
      setStyle(sq, { animation: 'cl-sq-blink-yellow 0.9s step-end infinite' });
    } else {
      // Vivid orange spotlight — unmissable for a child
      setStyle(sq, {
        backgroundColor: 'rgba(249,115,22,0.92)',
        boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.9)',
        borderRadius: '4px',
      });
    }
  });

  // Piece glow — orange border on squares containing the named piece
  if (glowPieces?.length && boardPosition) {
    Object.entries(boardPosition).forEach(([sq, piece]) => {
      if (glowPieces.includes(piece)) {
        setStyle(sq, {
          backgroundColor: 'rgba(249,115,22,0.4)',
          boxShadow: 'inset 0 0 0 3px rgba(249,115,22,0.95)',
        });
      }
    });
  }

  // Colour-quiz square — STYLE 2 border blink, true colour must show
  if (colourQuizSq) {
    setStyle(colourQuizSq, {
      backgroundColor: 'transparent',
      animation: 'cl-sq-blink 0.9s step-end infinite',
    });
  }

  // Task target squares (click-file, click-rank, click-square, piece-range)
  // NOT shown during speed round — student must find unaided
  if (!speedActive) {
    (targets || []).forEach(sq => {
      if (!(clicked || []).includes(sq)) {
        setStyle(sq, {
          backgroundColor: 'rgba(249,115,22,0.92)',
          boxShadow: 'inset 0 0 0 3px rgba(255,150,0,0.9)',
        });
      }
    });
  }

  // Movement path dots — yellow circle in centre of each path square
  // Shows the route the piece travels during demonstration
  (pathSqs || []).forEach(sq => {
    styles[sq] = {
      ...(styles[sq] || {}),
      background: `radial-gradient(circle, rgba(255,210,0,0.9) 0%, rgba(255,210,0,0.9) 22%, transparent 23%)`,
    };
  });

  // piece-intro-guided: L-shape path trace (yellow with white border, shown before destination)
  (pathSquares || []).forEach(sq => {
    setStyle(sq, {
      backgroundColor: 'rgba(255,220,0,0.85)',
      boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.9)',
    });
  });

  // piece-intro-guided: narrated squares (orange) then confirmed tick squares (green)
  (narratedSquares || []).forEach(sq => {
    if (!(tickSquares || []).includes(sq)) {
      setStyle(sq, {
        backgroundColor: 'rgba(249,115,22,0.92)',
        boxShadow: 'inset 0 0 0 3px rgba(255,150,0,0.9)',
      });
    }
  });
  (tickSquares || []).forEach(sq => {
    setStyle(sq, {
      backgroundColor: 'rgba(60,220,90,0.75)',
      boxShadow: 'inset 0 0 0 3px rgba(40,180,70,0.95)',
    });
  });

  (clicked || []).forEach(sq => setStyle(sq, { backgroundColor: 'rgba(29,158,117,0.65)' }));
  (wrong || []).forEach(sq => setStyle(sq, { backgroundColor: 'rgba(226,75,74,0.7)' }));

  return styles;
}

// ─────────────────────────────────────────────────────
// MAIN — Chess Lesson View (Lesson 1: board fundamentals)
// ─────────────────────────────────────────────────────
export default function ChessLessonView({ lessonData, childName = 'Student', childAge = 10, isTest = false, onComplete }) {

  const getAgeGroup = (age) => {
    if (age <= 8) return 'young';
    if (age <= 12) return 'mid';
    return 'teen';
  };

  const pickVoice = (step, field) => {
    const ageField = field + 'VoiceAge';
    if (step[ageField]) {
      const group = getAgeGroup(childAge);
      return step[ageField][group] || step[field] || '';
    }
    return step[field] || '';
  };

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [classStarted, setClassStarted] = useState(false);
  const [voiceFinished, setVoiceFinished] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [currentNarration, setCurrentNarration] = useState('');
  const voiceFinishTimer = useRef(null);

  // Timer — counts up from 0, shown as time elapsed / total lesson time
  const lessonStartTime = useRef(Date.now());
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const remainSecsRef = useRef(55 * 60); // always-current remaining seconds
  useEffect(() => {
    lessonStartTime.current = Date.now();
    const totalSecs = (lesson?.totalMinutes || 55) * 60;
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lessonStartTime.current) / 1000);
      setElapsedSecs(elapsed);
      remainSecsRef.current = Math.max(0, totalSecs - elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Repeat — replay current step's voice narration from the beginning
  // Special case: during file-name-quiz, repeats CURRENT question with glow
  const currentVoiceText = useRef('');
  function handleRepeat() {
    // file-name-quiz: repeat current question + re-glow current file
    if (step?.taskType === 'file-name-quiz' && fileQS?.active && fileQS?.current) {
      pendingAudioClear();
      // Re-glow the current file
      setNeonFile(null);
      setTimeout(() => setNeonFile(fileQS.current), 50);
      const repeatText = `Which file is this one glowing now?`;
      speakElevenLabs(repeatText, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
      return;
    }
    const text = currentVoiceText.current || fill(step?.voice || '', childName);
    if (!text) return;
    pendingAudioClear();
    pauseCharPos.current = 0;
    pausedRemainingText.current = text;
    setIsPlaying(false); setIsPaused(false);
    speakElevenLabs(text, {
      onStart: () => { setIsPlaying(true); setIsPaused(false); },
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
      onBoundary: (word) => {
        const noHighlight = ['independent-squares','speed-round'].includes(step?.taskType);
        if (!noHighlight) applyNeonWord(word);
      },
    });
  }

  // Pause / Resume Ms. Momo mid-sentence
  // Track character position so pause/resume works reliably
  // Chrome drops utterances on speechSynthesis.resume() — so we
  // instead stop speech and create a NEW utterance from the remaining text.
  const pauseCharPos = useRef(0);
  const pausedRemainingText = useRef('');

  function handlePauseResume() {
    unlockAudio();
    if (isPaused) {
      // RESUME — speak remaining text from where we paused
      const remaining = pausedRemainingText.current;
      if (!remaining?.trim()) {
        setIsPaused(false);
        return;
      }
      setIsPaused(false);
      speakElevenLabs(remaining, {
        onStart: () => { setIsPlaying(true); setIsPaused(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onBoundary: (word, charIdx) => {
          // Update remaining text as speech progresses
          pauseCharPos.current = charIdx;
          pausedRemainingText.current = remaining.slice(charIdx);
          const noHighlight = ['independent-squares','speed-round'].includes(step?.taskType);
          if (!noHighlight) applyNeonWord(word);
        },
      });
    } else {
      // PAUSE — stop speech, save remaining text from current position
      const fullText = currentVoiceText.current || '';
      const remaining = pauseCharPos.current > 0
        ? fullText.slice(pauseCharPos.current)
        : fullText;
      pausedRemainingText.current = remaining;
      window.speechSynthesis?.cancel();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }

  // Start Class — clicked by student on very first step
  function handleStartClass() {
    // Unlock Chrome's autoplay restriction with a silent utterance immediately
    // on the user gesture, before any async work or setState calls.
    const unlock = new SpeechSynthesisUtterance('');
    unlock.volume = 0;
    speechSynthesis.speak(unlock);
    speechSynthesis.cancel();

    if (step?.voice) {
      const text = fill(step.voice, childName);
      currentVoiceText.current = text;
      pauseCharPos.current = 0;
      pausedRemainingText.current = text;
      voiceRef.current = true;
      // SPEAK FIRST — before any setState calls
      const fallbackMs = Math.max(6000, text.length * 110) + 5000;
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
      speakElevenLabs(text, {
        onStart: () => { setIsPlaying(true); setIsPaused(false); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onBlocked: () => { clearTimeout(voiceFinishTimer.current); setAudioBlocked(true); },
        onBoundary: (word) => applyNeonWord(word),
      });
      // State updates AFTER speak() — these trigger re-renders but speak is already queued
      setCurrentNarration(text);
      applyNeon(text);
    }
    setClassStarted(true);
    setAudioBlocked(false);
  }

  const [neonFile, setNeonFile] = useState(null);
  const [neonRank, setNeonRank] = useState(null);
  const [neonSqs, setNeonSqs] = useState([]);
  const [glowPieces, setGlowPieces] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [wrongSqs, setWrongSqs] = useState([]);
  const [targetSqs, setTargetSqs] = useState([]);
  const [visitedGuidedSquares, setVisitedGuidedSquares] = useState([]);
  const [narratedSquares, setNarratedSquares] = useState([]);
  const [narrationComplete, setNarrationComplete] = useState(false);
  const [tickSquares, setTickSquares] = useState([]);
  const [pathSquares, setPathSquares] = useState([]);

  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [fbType, setFbType] = useState('info');

  const [indepIdx, setIndepIdx] = useState(0);
  const [quizState, setQuizState] = useState(null);
  const [quizIdx, setQuizIdx] = useState(0);
  const [fileQS, setFileQS] = useState(null);
  const [speedState, setSpeed] = useState(null);
  const [recapAnswer, setRecapAnswer] = useState(null);
  const [recapFeedbackDone, setRecapFeedbackDone] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);
  const [bonusActive, setBonusActive] = useState(false);

  const lesson = lessonData || LESSON_1;
  const lessonBonusMap = {
    'chess-lesson-1': LESSON_1_BONUS,
    'chess-lesson-2': LESSON_2_BONUS,
    'chess-lesson-3': LESSON_3_BONUS,
    'chess-lesson-4': LESSON_4_BONUS,
    'chess-lesson-5': LESSON_5_BONUS,
  };
  const activeBonus = lessonBonusMap[lesson?.id] || LESSON_1_BONUS;
  const phases = bonusActive ? (activeBonus?.phases || lesson.phases) : lesson.phases;
  const bonusTriggeredRef = useRef(false);

  // Timer expiry — launch bonus round when time hits 0, or end lesson if bonus already active
  useEffect(() => {
    const totalSecs = (lesson?.totalMinutes || 55) * 60;
    if (elapsedSecs < totalSecs) return;
    if (lessonDone || bonusTriggeredRef.current) return;
    bonusTriggeredRef.current = true;
    if (bonusActive) {
      // Bonus was running when time expired — end lesson
      setLessonDone(true);
      confetti({ particleCount: 200, spread: 120 });
      const voice = fill(lesson?.doneVoice || `Amazing work, {name}! Your lesson is complete!`, childName);
      speakElevenLabs(voice, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
      setTimeout(() => onComplete?.(), 4000);
    } else if (activeBonus?.phases?.length) {
      // Main lesson time expired — launch bonus immediately
      window.speechSynthesis?.cancel();
      pendingAudioClear();
      setBonusActive(true);
      setPhaseIdx(0); setStepIdx(0);
      setVoiceFinished(false);
      voiceRef.current = false;
      continueSpoke.current = false;
    } else {
      setLessonDone(true);
      confetti({ particleCount: 200, spread: 120 });
      setTimeout(() => onComplete?.(), 3000);
    }
  }, [elapsedSecs, bonusActive, lessonDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Piece-based interaction state (Lesson 2+)
  const [boardFen, setBoardFen] = useState('start');
  const [selectedSq, setSelectedSq] = useState(null);
  const [moveDone, setMoveDone] = useState(false);
  const [pieceQuizIdx, setPieceQuizIdx] = useState(0);
  const [pieceQuizAnswer, setPieceQuizAnswer] = useState(null);
  const [writeAnswer, setWriteAnswer] = useState(null);
  const [placedPieces, setPlacedPieces] = useState({}); // for notation-puzzle-setup and piece-placement
  const [pieceTrayOrder, setPieceTrayOrder] = useState([]); // shuffled tray order
  // notation-drag state
  const [notationDragIdx, setNotationDragIdx] = useState(0);
  const [notationDragTicks, setNotationDragTicks] = useState([]); // completed call ids
  // piece-placement state
  const [placementIdx, setPlacementIdx] = useState(0);
  const [selectedPalettePiece, setSelectedPalettePiece] = useState(null);
  const draggedPaletteItemRef = useRef(null);
  // piece letter overlay (FIX 6) — tracks which letters are currently displayed on pieces
  const [pieceLetterOverlays, setPieceLetterOverlays] = useState({});

  const speedRef = useRef(null);
  const voiceRef = useRef(false);
  const continueSpoke = useRef(false); // true when handleContinue already spoke this step
  const currentStepRef = useRef(null); // always points to current step — avoids stale closures in timers
  const [taskComplete, setTaskComplete] = useState(false);
  const [pathSqs, setPathSqs] = useState([]);
  const [speakingFb, setSpeakingFb] = useState(false);
  const [extraRanks, setExtraRanks] = useState([]);
  const [visibleLetterCards, setVisibleLetterCards] = useState([]); // progressive letter+piece reveal // true when a board task is done, shows Continue
  const neonTimer = useRef(null);
  const seqTimers = useRef([]);
  const narrationTimers = useRef([]);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step = steps[stepIdx];

  // FIX 6 (corrected) — customPieces for pieceletters phase.
  // Uses SVG piece images imported via webpack (correct Content-Type) so the
  // browser can render them. The previous attempt used /chesspieces/wikipedia/*.png
  // which are SVG files mis-named as .png; CRA serves them as image/png and
  // browsers reject the SVG content, producing a missing piece image.
  // By importing the same SVGs as .svg assets, webpack bundles them with the
  // correct type and the img tag renders them correctly.
  const _PIECE_LETTER_OVERLAY_MAP = { wK:'K', bK:'K', wQ:'Q', bQ:'Q', wR:'R', bR:'R', wB:'B', bB:'B', wN:'N', bN:'N' };
  const customPiecesForLetters = useMemo(() => {
    if (phase?.id !== 'pieceletters') return undefined;
    const overlays = pieceLetterOverlays;
    const pieces = {};
    ['wK','bK','wQ','bQ','wR','bR','wB','bB','wN','bN','wP','bP'].forEach(code => {
      const letter = _PIECE_LETTER_OVERLAY_MAP[code];
      pieces[code] = ({ squareWidth }) => (
        <div style={{ position: 'relative', width: squareWidth, height: squareWidth }}>
          <img
            src={PIECE_SVG_URLS[code]}
            alt=""
            width={squareWidth}
            height={squareWidth}
            style={{ display: 'block' }}
            draggable={false}
          />
          {letter && overlays[letter] && (
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8em',
              fontWeight: 'bold',
              color: '#FF6B00',
              textShadow: '0 0 4px #000, 0 0 8px #000',
              pointerEvents: 'none',
            }}>{letter}</div>
          )}
        </div>
      );
    });
    return pieces;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase?.id, pieceLetterOverlays]);

  // When lessonData changes (different lesson selected), set the board to the
  // first step's boardState immediately so pieces are visible before Start Class.
  // useEffect runs after every render where lessonData changes — unlike useState
  // which only uses its initial value once on mount.
  useEffect(() => {
    const firstSt = phases?.[0]?.steps?.[0];
    if (firstSt?.boardState && firstSt.boardState !== 'start' && firstSt.boardState !== 'empty') {
      setBoardFen(firstSt.boardState);
    } else {
      setBoardFen('start');
    }
  }, [lessonData]); // eslint-disable-line react-hooks/exhaustive-deps

  function applyNeon(text) {
    // Step-level static highlights (set from lesson data directly)
    if (step?.highlightFile) setNeonFile(step.highlightFile);
    if (step?.highlightRank) setNeonRank(String(step.highlightRank));
    // highlightRanks: array of rank numbers to glow simultaneously
    if (step?.highlightRanks?.length) {
      // Glow first rank immediately, others via word trigger
      setNeonRank(String(step.highlightRanks[0]));
    }
    if (step?.highlights?.length) setNeonSqs(step.highlights);
    // No auto-timeout — highlights persist until step changes or student completes task
  }

  // Progressive word highlighting — called per word boundary as Ms. Momo speaks.
  // Four highlight systems: files, ranks, squares, pieces.
  // Context windows stay open after keywords so sequences like
  // "1, 2, 3, 4, 5, 6, 7, 8" all glow after "rank" is spoken.
  // clear+set pattern forces React to re-render even for repeated same value.
  // All highlights suppressed during student exercises and tests.
  const lastSpokenWord = useRef('');
  const fileContextActive = useRef(false);
  const fileContextCount = useRef(0);
  const rankContextActive = useRef(false);
  const rankContextCount = useRef(0);
  // Separate timers per highlight type so they don't interfere with each other
  const fileNeonTimer = useRef(null);
  const rankNeonTimer = useRef(null);
  const sqNeonTimer = useRef(null);
  const pieceNeonTimer = useRef(null);

  // Piece name → piece codes for glowing on board
  const PIECE_CODES = {
    king:   ['wK','bK'],
    queen:  ['wQ','bQ'],
    rook:   ['wR','bR'],
    bishop: ['wB','bB'],
    knight: ['wN','bN'],
    pawn:   ['wP','bP'],
  };

  function applyNeonWord(word) {
    if (!word) return;

    // Suppress ALL highlights during student exercises and tests
    const suppressTypes = [
      'independent-squares', 'speed-round', 'colour-quiz',
      'piece-letter-quiz', 'piece-spot-quiz', 'recap-quiz',
      'click-file', 'click-rank', 'click-square', 'piece-range', 'piece-intro-guided',
      'file-name-quiz', 'true-or-false',
    ];
    if (suppressTypes.includes(step?.taskType)) {
      lastSpokenWord.current = word.toLowerCase();
      return;
    }

    const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!w) return;

    // ── Square coordinate e.g. "e4", "a1" ──
    // Style 2 (border only) — a specific square is being named.
    // Clear+set forces re-render on repeated mention.
    // After 3s, restore step's static highlights rather than clearing to []
    // so persistent highlights (step.highlights) are not wiped by word-trigger timers.
    if (/^[a-h][1-8]$/.test(w)) {
      setNeonSqs([]);
      clearTimeout(sqNeonTimer.current);
      setTimeout(() => {
        setNeonSqs([w]);
        sqNeonTimer.current = setTimeout(() => {
          // Use currentStepRef to get LIVE step highlights, not stale closed-over step
          const liveHighlights = currentStepRef.current?.highlights;
          setNeonSqs(liveHighlights?.length ? liveHighlights : []);
        }, 3000);
      }, 50);
      lastSpokenWord.current = w;
      return;
    }

    // ── "file" / "files" keyword — open file context window ──
    if (w === 'file' || w === 'files') {
      fileContextActive.current = true;
      fileContextCount.current = 0;
      lastSpokenWord.current = w;
      return;
    }

    // ── "rank" / "ranks" / "row" / "rows" keyword — open rank context window ──
    if (w === 'rank' || w === 'ranks' || w === 'row' || w === 'rows') {
      rankContextActive.current = true;
      rankContextCount.current = 0;
      lastSpokenWord.current = w;
      return;
    }

    // ── File letter a–h ──
    // Highlight within file context OR immediately after "file"
    if (/^[a-h]$/.test(w)) {
      if (fileContextActive.current || lastSpokenWord.current === 'file') {
        setNeonFile(null);
        clearTimeout(fileNeonTimer.current);
        setTimeout(() => {
          setNeonFile(w);
          fileNeonTimer.current = setTimeout(() => setNeonFile(null), 2500);
        }, 50);
        fileContextCount.current = 0; // reset counter — keeps window alive for sequences
      }
      lastSpokenWord.current = w;
      return;
    }

    // ── Rank number 1–8 ──
    // Highlight within rank context OR immediately after "rank"/"row"
    // Glow duration 2500ms. Clear+set forces re-render on repeated mention.
    if (/^[1-8]$/.test(w)) {
      if (rankContextActive.current || lastSpokenWord.current === 'rank' || lastSpokenWord.current === 'row') {
        setNeonRank(null);
        clearTimeout(rankNeonTimer.current);
        setTimeout(() => {
          setNeonRank(w);
          rankNeonTimer.current = setTimeout(() => setNeonRank(null), 2500);
        }, 50);
        rankContextCount.current = 0; // reset counter — keeps window alive for sequences
      }
      lastSpokenWord.current = w;
      return;
    }

    // ── Piece names ──
    // Glow all squares containing that piece type. Clear+set handles repeats.
    if (PIECE_CODES[w]) {
      setGlowPieces([]);
      clearTimeout(pieceNeonTimer.current);
      setTimeout(() => {
        setGlowPieces(PIECE_CODES[w]);
        pieceNeonTimer.current = setTimeout(() => setGlowPieces([]), 2500);
      }, 50);
      lastSpokenWord.current = w;

      // Progressive letter card reveal — when step has a letterMap,
      // show the piece+letter card on the right panel as it's named
      if (step?.letterMap?.[w]) {
        const card = step.letterMap[w];
        setVisibleLetterCards(prev =>
          prev.some(c => c.letter === card.letter) ? prev : [...prev, card]
        );
      }

      // FIX 6 — Piece letter overlay during pieceletters phase:
      // As Ms. Momo names each piece, its letter appears overlaid on the board.
      // Letters accumulate and stay until step changes.
      if (phase?.id === 'pieceletters') {
        const LETTER_MAP = { king:'K', queen:'Q', rook:'R', bishop:'B', knight:'N' };
        const letter = LETTER_MAP[w];
        if (letter) {
          setPieceLetterOverlays(prev => ({ ...prev, [letter]: true }));
        }
      }
      return;
    }

    // ── "Pawn(s)" with no letter — also trigger card for lessons mentioning it ──
    if (w === 'pawn' || w === 'pawns') {
      if (step?.letterMap?.pawn) {
        const card = step.letterMap.pawn;
        setVisibleLetterCards(prev =>
          prev.some(c => c.letter === card.letter) ? prev : [...prev, card]
        );
      }
    }

    // ── Count non-matching words — close context after 8 non-matching words ──
    if (fileContextActive.current) {
      fileContextCount.current++;
      if (fileContextCount.current > 8) fileContextActive.current = false;
    }
    if (rankContextActive.current) {
      rankContextCount.current++;
      if (rankContextCount.current > 8) rankContextActive.current = false;
    }

    lastSpokenWord.current = w;
  }

  // Speak a step's voice directly — called synchronously within click handlers
  // so the browser gesture window is still active when speak() fires.
  // IMPORTANT: Do NOT call stopSpeech() before this — Chrome treats cancel()
  // as ending the gesture window. speakBrowserPrimary handles cancel internally.
  // Store speakStep in a ref so useCallback closures always get the latest version
  const speakStepRef = useRef(null);

  function speakStep(targetStep) {
    if (!targetStep?.voice) { setVoiceFinished(true); return; }
    const text = fill(targetStep.voice, childName);
    currentVoiceText.current = text;
    pauseCharPos.current = 0;
    pausedRemainingText.current = text;
    clearTimeout(voiceFinishTimer.current);
    const fallbackMs = Math.max(6000, text.length * 110) + 5000;
    voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
    // SPEAK FIRST — before any setState calls to keep inside gesture window
    speakElevenLabs(text, {
      onStart: () => { setIsPlaying(true); setAudioBlocked(false); },
      onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
      onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
      onBlocked: () => { clearTimeout(voiceFinishTimer.current); setAudioBlocked(true); setVoiceFinished(true); },
      onBoundary: (word, charIdx) => {
        if (charIdx !== undefined) {
          pauseCharPos.current = charIdx;
          pausedRemainingText.current = text.slice(charIdx);
        }
        const noHighlight = ['independent-squares','speed-round'].includes(targetStep?.taskType);
        if (!noHighlight) applyNeonWord(word);
      },
    });
    // State updates after speak() — React re-renders don't affect already-queued speech
    setCurrentNarration(text);
    setVoiceFinished(false);
    setIsPaused(false);
    applyNeon(text);
  }

  // Keep ref always pointing to latest speakStep — rebuilt 2026-06-19 22:51:53
  speakStepRef.current = speakStep;

  function clearNeon() { setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]); }

  // Reset on step change
  useEffect(() => {
    currentStepRef.current = step; // always keep ref current — avoids stale closures
    voiceRef.current = false;
    // Force neonFile/neonRank to null first so React flushes the clear before applying new values
    setNeonFile(null); setNeonRank(null);
    // Explicitly reset all highlight and interaction states before applying new step values
    setClicked([]); setWrongSqs([]); setNeonSqs([]); setVisitedGuidedSquares([]);
    setNarratedSquares([]); setNarrationComplete(false); setTickSquares([]); setPathSquares([]);
    narrationTimers.current.forEach(t => clearTimeout(t)); narrationTimers.current = [];
    setFeedback(''); setFbType('info');
    setSpeed(null); setIndepIdx(0); clearNeon();
    setRecapAnswer(null); setRecapFeedbackDone(false);
    setTaskComplete(false);
    setPathSqs([]);
    setSpeakingFb(false);
    setExtraRanks([]);
    setVisibleLetterCards([]);
    fileContextCount.current = 0;
    rankContextActive.current = false;
    rankContextCount.current = 0;
    clearTimeout(fileNeonTimer.current);
    clearTimeout(rankNeonTimer.current);
    clearTimeout(sqNeonTimer.current);
    clearTimeout(pieceNeonTimer.current);
    clearTimeout(voiceFinishTimer.current);
    setVoiceFinished(false);

    if (step?.id === 's5') {
      console.log('[s5 debug] highlightFile:', step.highlightFile, '| highlightRank:', step.highlightRank);
    }

    // Apply new step's file/rank highlights on the next tick so the null-reset above flushes first
    setTimeout(() => {
      if (step?.highlightFile) setNeonFile(step.highlightFile);
      if (step?.highlightRank) setNeonRank(String(step.highlightRank));
      // highlightRanks: multiple ranks get Style 1 (full fill) via neonRank cycling
      if (step?.highlightRanks?.length) {
        setNeonRank(String(step.highlightRanks[0]));
        setExtraRanks(step.highlightRanks.slice(1).map(String));
      }
    }, 0);
    // We set neonSqs only for named squares (step.highlights) — Style 2
    if (step?.highlights?.length) setNeonSqs(step.highlights);
    // extraRanks reset (non-highlightRanks steps clear it synchronously)
    if (!step?.highlightRanks?.length) {
      setExtraRanks([]);
    }

    // Only pre-highlight targets for click-square (single target is fine)
    // click-file and click-rank: column glow (neonFile/neonRank) is enough
    // piece-range: no pre-highlighting — student finds squares from instruction
    if (['click-square'].includes(step?.taskType))
      setTargetSqs(step.targetSquares || []);
    else setTargetSqs([]);

    if (step?.taskType === 'colour-quiz') {
      setQuizState({ active: true }); setQuizIdx(0);
      const f = step.quizSquares?.[0]?.sq; if (f) setNeonSqs([f]);
    } else setQuizState(null);

    if (step?.taskType === 'file-name-quiz') startFileQuiz();
    else setFileQS(null);

    // Reset piece-interaction state
    setSelectedSq(null); setMoveDone(false);
    setPieceQuizIdx(0); setPieceQuizAnswer(null);
    setWriteAnswer(null);
    setNotationDragIdx(0); setNotationDragTicks([]);
    setPlacementIdx(0); setSelectedPalettePiece(null);
    setPieceLetterOverlays({});

    // Compute board FEN for this step
    if (step?.taskType === 'notation-demo') {
      // Show starting board, then animate piece moving after a short delay
      setBoardFen(step.boardState || 'start');
      setPathSqs([]);
      const demoTimer = setTimeout(() => {
        setBoardFen(step.demoFen || 'start');
        // Show path dots when piece arrives at destination
        if (step.path?.length) setPathSqs(step.path);
      }, 1200);
      // Clear path dots after student has seen the move
      const clearTimer = setTimeout(() => setPathSqs([]), 1200 + 3500);
      return () => { clearTimeout(demoTimer); clearTimeout(clearTimer); setPathSqs([]); };
    } else if (step?.demoSequence?.length) {
      // Sequential movement demo — plays each FEN in order
      // Each frame shows the piece in a new position with path dots
      const startFen = step.boardState || 'start';
      setBoardFen(startFen);
      setPathSqs([]);
      const timers = [];
      let cumDelay = 1800; // initial pause before first move
      // For recap-quiz steps, keep the piece on its final destination
      // so the student can reference it while answering — don't loop back
      const keepOnDestination = step?.taskType === 'recap-quiz';

      step.demoSequence.forEach((frame, i) => {
        const isLast = i === step.demoSequence.length - 1;
        // Show the move
        const t1 = setTimeout(() => {
          setBoardFen(frame.fen);
          setPathSqs(frame.path || []);
        }, cumDelay);
        timers.push(t1);
        cumDelay += (frame.delay || 2200);

        // Return to start between frames ONLY for multi-frame sequences.
        // Single-frame steps (circuit legs) keep the piece at destination —
        // the student must see where the piece landed before clicking Continue.
        // Also keep for recap-quiz last frame (student references while answering).
        const isSingleFrame = step.demoSequence.length === 1;
        const skipReturn = isSingleFrame || (keepOnDestination && isLast);
        if (!skipReturn) {
          const t2 = setTimeout(() => {
            setBoardFen(startFen);
            setPathSqs([]);
          }, cumDelay - 600);
          timers.push(t2);
        }
      });

      return () => {
        timers.forEach(t => clearTimeout(t));
        setPathSqs([]);
      };
    } else if (step?.demoFen) {
      // Single movement demo
      setBoardFen(step.boardState && step.boardState !== 'start' && step.boardState !== 'empty'
        ? step.boardState : 'start');
      const demoTimer = setTimeout(() => {
        setBoardFen(step.demoFen);
      }, step.demoDelay || 3000);
      return () => clearTimeout(demoTimer);
    } else if (step?.taskType === 'notation-build') {
      setBoardFen(step.fromFen || 'start');
    } else if (step?.taskType === 'write-notation') {
      setBoardFen(step.beforeFen || 'start');
    } else if (step?.taskType === 'piece-spot-quiz') {
      setBoardFen(step.quizItems?.[0]?.fen || 'start');
    } else if (step?.taskType === 'piece-letter-quiz') {
      setBoardFen('start');
    } else if (step?.taskType === 'notation-drag') {
      const firstCall = step.notationCalls?.[0];
      if (firstCall?.boardState) setBoardFen(firstCall.boardState);
      else setBoardFen('start');
    } else if (step?.taskType === 'piece-placement') {
      setBoardFen('empty-custom');
      setPlacedPieces({});
      setPlacementIdx(0);
    } else if (step?.taskType === 'notation-puzzle-setup') {
      setBoardFen('empty-custom');
      setPlacedPieces({});
      const shuffled = [...(step.targetPieces || [])].sort(() => Math.random() - 0.5);
      setPieceTrayOrder(shuffled);
    } else if (step?.taskType === 'notation-puzzle-move') {
      setBoardFen(step.puzzleFen || 'start');
    } else if (step?.taskType === 'piece-range') {
      setBoardFen(step.pieceRangeFen || step.boardState || 'start');
    } else if (step?.boardState === 'start') {
      setBoardFen('start');
    } else if (step?.boardState === 'empty') {
      setBoardFen('empty-custom');
    } else if (step?.boardState && step.boardState !== 'custom' && step.boardState !== 'start' && step.boardState !== 'empty') {
      // Literal FEN string — first step shows immediately, subsequent steps animate with brief delay
      if (phaseIdx === 0 && stepIdx === 0) {
        setBoardFen(step.boardState);
      } else {
        const t = setTimeout(() => setBoardFen(step.boardState), 200);
        return () => clearTimeout(t);
      }
    }
  }, [phaseIdx, stepIdx]);

  // piece-spot-quiz: update board to show the current quiz item's piece.
  // Depends on phaseIdx/stepIdx (not step?.taskType) so it fires on every step
  // change, including transitions between two piece-spot-quiz steps where taskType
  // doesn't change and pieceQuizIdx is already 0.
  useEffect(() => {
    if (step?.taskType !== 'piece-spot-quiz') return;
    const fen = step.quizItems?.[pieceQuizIdx]?.fen;
    if (fen) setBoardFen(fen);
  }, [phaseIdx, stepIdx, pieceQuizIdx]);

  // Auto-play voice — fires on step change.
  // Skipped if handleContinue already spoke (continueSpoke ref),
  // or if Start Class already spoke (voiceRef).
  // piece-intro-guided: skipped here — startNarration handles all speaking for that type.
  useEffect(() => {
    if (!classStarted) return;
    if (step?.taskType === 'piece-intro-guided') return;
    if (continueSpoke.current) {
      continueSpoke.current = false; // consume the flag, don't speak again
      return;
    }
    if (voiceRef.current) return;
    if (!step?.voice) { setVoiceFinished(true); return; }
    speakStepRef.current(step);
    voiceRef.current = true;
  }, [phaseIdx, stepIdx, isTest, classStarted]);

  // piece-intro-guided: start narration sequence after step loads
  useEffect(() => {
    if (step?.taskType !== 'piece-intro-guided') return;
    if (!classStarted) return;
    narrationTimers.current.forEach(t => clearTimeout(t));
    narrationTimers.current = [];
    startNarration(currentStepRef.current);
    return () => {
      narrationTimers.current.forEach(t => clearTimeout(t));
      narrationTimers.current = [];
    };
  }, [phaseIdx, stepIdx, classStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Highlight sequence — fires timed setNeonSqs calls for steps with highlightSequence
  useEffect(() => {
    seqTimers.current.forEach(t => clearTimeout(t));
    seqTimers.current = [];
    if (!step?.highlightSequence?.length || !classStarted) return;
    step.highlightSequence.forEach(({ delay, squares }) => {
      seqTimers.current.push(setTimeout(() => setNeonSqs(squares), delay));
    });
    return () => seqTimers.current.forEach(t => clearTimeout(t));
  }, [phaseIdx, stepIdx, classStarted]);

  // Auto-start speed round when entering a speed-round step
  useEffect(() => {
    if (step?.taskType !== 'speed-round') return;
    if (!step?.targetSquares?.length) return;
    const t = setTimeout(() => startSpeed(step), 900);
    return () => { clearTimeout(t); clearInterval(speedRef.current); };
  }, [phaseIdx, stepIdx]);

  // write-notation: reveal the "after" position once voice finishes
  useEffect(() => {
    if (step?.taskType !== 'write-notation') return;
    if (!voiceFinished) return;
    if (step.afterFen) setBoardFen(step.afterFen);
  }, [phaseIdx, stepIdx, voiceFinished]);

  const nextStep = useCallback((overridePhase, overrideStep) => {
    clearNeon();
    let npi = overridePhase !== undefined ? overridePhase : phaseIdx;
    let nsi = overrideStep !== undefined ? overrideStep : stepIdx + 1;
    if (overridePhase === undefined && nsi >= steps.length) {
      npi = phaseIdx + 1;
      nsi = 0;
    }
    if (npi >= phases.length) {
      setLessonDone(true);
      confetti({ particleCount: 160, spread: 100 });
      const doneText = `Congratulations ${childName}! You have completed this chess lesson! You are amazing!`;
      speakElevenLabs(doneText, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
      setTimeout(() => onComplete?.(), 4000);
      return;
    }
    // Get next step data BEFORE any state updates
    const nextPhase = phases[npi];
    const nextStepData = (nextPhase?.steps || [])[nsi];
    // SPEAK FIRST — must happen before setState calls which trigger
    // React re-renders that push speak() outside the gesture window
    voiceRef.current = true;
    speakStepRef.current(nextStepData);
    // Navigate AFTER speaking — state updates happen async anyway
    if (npi !== phaseIdx) { setPhaseIdx(npi); setStepIdx(0); }
    else { setStepIdx(nsi); }
  }, [stepIdx, steps, phaseIdx, phases, childName, isTest]);

  function showFb(msg, type, voice = '', afterVoice = null) {
    setFeedback(fill(msg, childName)); setFbType(type);
    if (voice) {
      const vt = fill(voice, childName); applyNeon(vt);
      let done = false;
      const fire = () => {
        if (done) return; done = true;
        setSpeakingFb(false);
        afterVoice?.();
      };
      setSpeakingFb(true);
      speakElevenLabs(vt, {
        onStart: () => setIsPlaying(true),
        onEnd: () => { setIsPlaying(false); fire(); },
        onError: () => { setIsPlaying(false); fire(); },
        onBlocked: () => fire(),
      });
      if (afterVoice) {
        const fallbackMs = Math.max(1800, vt.length * 110) + 1500;
        setTimeout(fire, fallbackMs);
      }
    } else if (afterVoice) {
      setTimeout(afterVoice, 1500);
    }
  }

  // piece-intro-guided: sequentially speaks intro voice then narrationSequence items,
  // lighting up squares one-by-one and finally setting narrationComplete + voiceFinished.
  // Uses currentStepRef.current throughout to guard against stale closures (Rule 14).
  function startNarration(s) {
    if (!s || s.taskType !== 'piece-intro-guided') return;
    narrationTimers.current.forEach(t => clearTimeout(t));
    narrationTimers.current = [];
    setVoiceFinished(false);

    function speakItem(idx) {
      if (currentStepRef.current?.id !== s.id) return;
      const seq = s.narrationSequence || [];
      if (idx >= seq.length) {
        setNarrationComplete(true);
        setVoiceFinished(true);
        return;
      }
      const item = seq[idx];
      const text = fill(item.voice || '', childName);
      let fired = false;
      const afterVoice = () => {
        if (fired) return;
        fired = true;
        if (currentStepRef.current?.id !== s.id) return;
        const squares = item.squares || [];
        const pSqs = item.pathSquares || [];
        const delay = item.squareDelay || 400;

        // Phase 1: trace L-shape path squares one by one (yellow)
        pSqs.forEach((sq, j) => {
          const t = setTimeout(() => {
            if (currentStepRef.current?.id !== s.id) return;
            setPathSquares(prev => [...prev, sq]);
          }, (j + 1) * delay);
          narrationTimers.current.push(t);
        });
        const pathPhaseEnd = pSqs.length > 0 ? pSqs.length * delay + 600 : 0;

        // Phase 2: fade out path squares after 600ms pause
        if (pSqs.length > 0) {
          const t = setTimeout(() => {
            if (currentStepRef.current?.id !== s.id) return;
            setPathSquares([]);
          }, pathPhaseEnd);
          narrationTimers.current.push(t);
        }

        // Phase 3: reveal destination squares as orange targets
        squares.forEach((sq, j) => {
          const t = setTimeout(() => {
            if (currentStepRef.current?.id !== s.id) return;
            setNarratedSquares(prev => [...prev, sq]);
          }, pathPhaseEnd + (j + 1) * delay);
          narrationTimers.current.push(t);
        });

        const totalDelay = pathPhaseEnd + (squares.length > 0 ? squares.length * delay + 300 : 300);
        const t = setTimeout(() => speakItem(idx + 1), totalDelay);
        narrationTimers.current.push(t);
      };
      if (text) {
        speakElevenLabs(text, {
          onStart: () => setIsPlaying(true),
          onEnd: () => { setIsPlaying(false); afterVoice(); },
          onError: () => { setIsPlaying(false); afterVoice(); },
          onBlocked: () => afterVoice(),
        });
        const fallbackMs = Math.max(2000, text.length * 110) + 2000;
        const ft = setTimeout(() => afterVoice(), fallbackMs);
        narrationTimers.current.push(ft);
      } else {
        afterVoice();
      }
    }

    if (s.voice) {
      const introText = fill(s.voice, childName);
      setCurrentNarration(introText);
      let introDone = false;
      const afterIntro = () => {
        if (introDone) return;
        introDone = true;
        speakItem(0);
      };
      speakElevenLabs(introText, {
        onStart: () => { setIsPlaying(true); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); afterIntro(); },
        onError: () => { setIsPlaying(false); afterIntro(); },
        onBlocked: () => { setAudioBlocked(true); afterIntro(); },
      });
      const fallbackMs = Math.max(3000, introText.length * 110) + 2000;
      const ft = setTimeout(() => afterIntro(), fallbackMs);
      narrationTimers.current.push(ft);
    } else {
      speakItem(0);
    }
  }

  // Called when a board task (click-file, piece-range etc.) is completed.
  // Plays the success feedback voice, then UNLOCKS the orange Continue button
  // instead of auto-advancing. The student's click on Continue then drives
  // the next step's voice within a real user gesture — the only reliable way
  // to satisfy the browser's audio gesture policy.
  function completeTask(successMsg, successVoice) {
    setTaskComplete(true);
    setFeedback(fill(successMsg, childName)); setFbType('success');
    if (successVoice) {
      const vt = fill(successVoice, childName); applyNeon(vt);
      setSpeakingFb(true);
      speakElevenLabs(vt, {
        onStart: () => setIsPlaying(true),
        onEnd: () => { setIsPlaying(false); setSpeakingFb(false); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); setSpeakingFb(false); setVoiceFinished(true); },
        onBlocked: () => { setSpeakingFb(false); setVoiceFinished(true); },
      });
      const fallbackMs = Math.max(1800, vt.length * 110) + 1500;
      setTimeout(() => { setSpeakingFb(false); setVoiceFinished(true); }, fallbackMs);
    } else {
      setVoiceFinished(true);
    }
  }

  function handlePieceDrop(sourceSquare, targetSquare, piece) {
    unlockAudio();
    if (!currentStepRef.current) return false;
    const tt = currentStepRef.current.taskType;

    if ((tt === 'notation-build' || tt === 'notation-puzzle-move') && !moveDone) {
      if (sourceSquare !== currentStepRef.current.moveFrom) {
        showFb('That is not the piece Ms. Momo described - look again!', 'error');
        return false;
      }
      const game = new Chess();
      if (boardFen !== 'start' && boardFen !== 'empty-custom') game.load(boardFen);

      if (targetSquare === currentStepRef.current.moveTo) {
        const result = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        if (result) {
          setBoardFen(game.fen());
          setMoveDone(true);
          setSelectedSq(null);
          setNeonSqs([]);
          setScore(s => s + 1); setTotal(t => t + 1); setStreak(s => s + 1);
          const notation = currentStepRef.current.correctNotation || result.san;
          completeTask(`${notation} - ${pickVoice(currentStepRef.current, 'success') ? '' : 'Correct!'}`.trim(), pickVoice(currentStepRef.current, 'success'));
          return true;
        }
        return false;
      } else {
        setWrongSqs([targetSquare]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb(pickVoice(currentStepRef.current, 'wrong') || 'Not quite - try again!', 'error', pickVoice(currentStepRef.current, 'wrong'));
        return false;
      }
    }

    // piece-range: drag piece to any reachable square to mark it as found
    // Piece always snaps back to starting square so student can continue dragging
    if (tt === 'piece-range') {
      const sq = targetSquare;
      if (currentStepRef.current.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq];
        setClicked(nc);
        if (currentStepRef.current?.guided) setVisitedGuidedSquares(v => [...v, sq]);
        setStreak(s => s + 1);
        if (nc.length === currentStepRef.current.targetSquares.length) {
          setScore(s => s + nc.length); setTotal(t => t + nc.length); setTargetSqs([]);
          completeTask(pickVoice(currentStepRef.current, 'success') || 'Complete!', pickVoice(currentStepRef.current, 'success'));
        } else {
          showFb(`${nc.length} of ${currentStepRef.current.targetSquares.length} found!`, 'hint');
        }
      } else if (currentStepRef.current.targetSquares?.includes(sq) && clicked.includes(sq)) {
        showFb('Already found that one!', 'hint');
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb('That square is not reachable — try dragging to a highlighted square!', 'error');
      }
      return false; // always return false so piece snaps back to origin
    }

    // notation-drag: student reads notation on right panel and drags piece to target square
    if (tt === 'notation-drag') {
      const calls = currentStepRef.current.notationCalls || [];
      const call = calls[notationDragIdx];
      if (!call) return false;
      if (sourceSquare !== call.pieceSquare) {
        showFb(`That is not the right piece — read the notation! Drag the ${call.notation[0] === 'N' ? 'Knight' : call.notation[0] === 'R' ? 'Rook' : call.notation[0] === 'B' ? 'Bishop' : call.notation[0] === 'Q' ? 'Queen' : 'piece'} from its square.`, 'error');
        return false;
      }
      if (targetSquare === call.targetSquare) {
        // Show green ✓ tick on destination square for 800ms, then snap back and advance
        setTickSquares([targetSquare]);
        setStreak(s => s + 1);
        setScore(s => s + 1); setTotal(t => t + 1);
        const newTicks = [...notationDragTicks, call.id];
        setNotationDragTicks(newTicks);
        const capturedStepId = currentStepRef.current?.id;
        const capturedIdx = notationDragIdx;
        setTimeout(() => {
          if (currentStepRef.current?.id !== capturedStepId) return;
          setTickSquares([]);
          const nextIdx = capturedIdx + 1;
          if (nextIdx >= calls.length) {
            completeTask(
              fill(currentStepRef.current?.successVoice || 'All moves complete!', childName),
              currentStepRef.current?.successVoice,
            );
          } else {
            const nextCall = calls[nextIdx];
            showFb(`✓ ${call.notation} — correct!`, 'success', fill(nextCall.voice || `Next: ${nextCall.notation}`, childName), () => {
              setNotationDragIdx(nextIdx);
              setBoardFen(nextCall.boardState || 'start');
            });
          }
        }, 800);
      } else {
        setWrongSqs([targetSquare]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        showFb(`Not quite — read the square in "${call.notation}". Drag to ${call.targetSquare.toUpperCase()}!`, 'error', 'Not quite — try again!');
      }
      return false; // piece always snaps back
    }

    // piece-intro-guided: narration must finish before student can drag
    if (tt === 'piece-intro-guided') {
      if (!narrationComplete) return false;
      const sq = targetSquare;
      const targets = currentStepRef.current.targetSquares || [];
      if (!targets.includes(sq)) return false;
      if (tickSquares.includes(sq)) return false; // already confirmed
      const newTicks = [...tickSquares, sq];
      setTickSquares(newTicks);
      setClicked(prev => [...prev, sq]);
      setStreak(s => s + 1);
      if (newTicks.length >= targets.length) {
        setScore(s => s + newTicks.length);
        setTotal(t => t + newTicks.length);
        setTargetSqs([]);
        completeTask(
          pickVoice(currentStepRef.current, 'success') || 'Complete!',
          pickVoice(currentStepRef.current, 'success'),
        );
      } else {
        showFb(`${newTicks.length} of ${targets.length} found!`, 'hint');
      }
      return false; // piece always snaps back
    }

    return false; // not a draggable taskType — snap back
  }

  // Handles a drop from the side palette onto a board square (piece-placement taskType).
  function handlePalettePieceDrop(sq, item) {
    if (!voiceFinished || speakingFb || isPlaying) return;
    const items = currentStepRef.current?.placementItems || [];
    const currentItem = items[placementIdx];
    if (!currentItem) return;

    // Only accept the called piece type/color
    if (item.piece !== currentItem.piece || item.color !== currentItem.color) {
      showFb(`Drag the highlighted ${currentItem.icon} first!`, 'hint');
      return;
    }
    if (placedPieces[sq]) {
      showFb('That square is already occupied!', 'hint');
      return;
    }

    if (sq === currentItem.square) {
      // Correct placement
      const np = { ...placedPieces, [currentItem.square]: { piece: currentItem.piece, color: currentItem.color } };
      setPlacedPieces(np);
      setScore(s => s + 1); setTotal(t => t + 1); setStreak(s => s + 1);
      setTickSquares([currentItem.square]);
      setTimeout(() => setTickSquares([]), 800);
      const nextIdx = placementIdx + 1;
      if (nextIdx >= items.length) {
        completeTask(
          fill(currentStepRef.current?.successVoice || 'All pieces placed!', childName),
          currentStepRef.current?.successVoice,
        );
      } else {
        const nextItem = items[nextIdx];
        showFb(`✓ ${currentItem.icon} on ${currentItem.square.toUpperCase()}!`, 'success',
          fill(nextItem.callVoice || `Drag the ${nextItem.icon} to ${nextItem.square.toUpperCase()}`, childName),
          () => setPlacementIdx(nextIdx));
      }
    } else {
      // Wrong square
      setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
      showFb(`Not quite — drag to ${currentItem.square.toUpperCase()}!`, 'error', 'Not quite — try again!');
    }
  }

  function handleSquareClickArgs(square) {
    unlockAudio();
    const sq = square;
    if (!step) return;
    // Block interaction until Ms. Momo has finished speaking — main voice OR feedback voice OR still playing
    if ((!voiceFinished || speakingFb || isPlaying) && !isTest) return;
    const tt = step.taskType;

    if (tt === 'click-file' || tt === 'click-rank' || tt === 'piece-range') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq]; setClicked(nc); setStreak(s => s + 1);
        if (nc.length === step.targetSquares.length) {
          setScore(s => s + nc.length); setTotal(t => t + nc.length); setTargetSqs([]);
          completeTask(pickVoice(step, 'success') || 'Complete!', pickVoice(step, 'success'));
        } else showFb(`${nc.length} of ${step.targetSquares.length} found!`, 'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        const msg = tt === 'piece-range'
          ? `Try dragging the piece to that square!`
          : `That square is not in this ${tt === 'click-file' ? 'file' : 'rank'} — try the glowing one!`;
        showFb(msg, 'error');
      }
      return;
    }

    if (tt === 'click-square') {
      setTotal(t => t + 1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s => s + 1); setStreak(s => s + 1); setTargetSqs([]);
        completeTask(pickVoice(step, 'success') || 'Correct!', pickVoice(step, 'success'));
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        showFb(pickVoice(step, 'wrong') || 'Not quite - try again!', 'error', pickVoice(step, 'wrong'));
      }
      return;
    }

    if (tt === 'independent-squares') {
      const tgts = step.targetSquares || [], curr = tgts[indepIdx];
      if (!curr) return;
      setTotal(t => t + 1);
      if (sq === curr) {
        setClicked(p => [...p, sq]); setScore(s => s + 1); setStreak(s => s + 1);
        const vm = fill(step.voiceCorrect?.[indepIdx] || 'Correct!', childName);
        const ni = indepIdx + 1;
        if (ni >= tgts.length) {
          const finalScore = score + 1;
          showFb(vm, 'success', vm, () => {
            const vm2 = fill((pickVoice(step, 'success') || 'Done!').replace('{score}', finalScore), childName);
            const threshold = step.retryThreshold || 0;
            if (threshold > 0 && finalScore < threshold) {
              // Below threshold — offer retry
              const retryVoice = fill(
                (step.retryVoice || `You scored {score} out of ${tgts.length}. Let me remind you how squares work, then try again!`)
                  .replace('{score}', finalScore), childName);
              showFb(vm2, 'hint', retryVoice, () => {
                // Reset for retry
                setScore(0); setTotal(0); setIndepIdx(0); setClicked([]);
                const hint = fill(step.retryHintVoice || `Remember — file letter first, then rank number. Let's try again! Find: ${tgts[0].toUpperCase()}!`, childName);
                showFb(hint, 'hint', hint);
              });
            } else {
              completeTask(vm2, vm2);
            }
          });
        } else {
          showFb(vm, 'success', vm, () => {
            setIndepIdx(ni);
            // Don't proactively glow the next target — student finds it from narration only
            const nextVoice = fill(`Now find: ${tgts[ni].toUpperCase()}`, childName);
            setCurrentNarration(nextVoice);
            showFb(`Find: ${tgts[ni].toUpperCase()}`, 'hint', nextVoice);
          });
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        const vm = fill((step.voiceWrong || `Not quite!`)
          .replace('{sq}', curr.toUpperCase())
          .replace('{file}', curr[0].toUpperCase())
          .replace('{fileNum}', String(curr.charCodeAt(0) - 96))
          .replace('{rank}', curr[1]), childName);
        showFb(vm, 'error', vm);
      }
      return;
    }

    if ((tt === 'notation-build' || tt === 'notation-puzzle-move') && !moveDone) {
      const game = new Chess();
      if (boardFen !== 'start' && boardFen !== 'empty-custom') game.load(boardFen);
      const piece = game.get(sq);

      if (!selectedSq) {
        // First click: must select the correct piece
        if (sq === step.moveFrom) {
          setSelectedSq(sq);
          setNeonSqs([sq]);
          showFb(`Now click ${step.moveTo.toUpperCase()} to complete the move.`, 'hint');
        } else if (piece) {
          showFb('That is not the piece Ms. Momo described - look again!', 'error');
        }
        return;
      }

      // Second click: must be the destination
      if (sq === step.moveTo) {
        const result = game.move({ from: selectedSq, to: sq, promotion: 'q' });
        if (result) {
          setBoardFen(game.fen());
          setMoveDone(true);
          setSelectedSq(null);
          setNeonSqs([]);
          setScore(s => s + 1); setTotal(t => t + 1); setStreak(s => s + 1);
          const notation = step.correctNotation || result.san;
          completeTask(`${notation} - ${pickVoice(step, 'success') ? '' : 'Correct!'}`.trim(), pickVoice(step, 'success'));
        }
      } else {
        setSelectedSq(null); setNeonSqs([]);
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb(pickVoice(step, 'wrong') || 'Not quite - try again!', 'error', pickVoice(step, 'wrong'));
      }
      return;
    }

    if (tt === 'piece-placement') {
      if (!selectedPalettePiece) {
        showFb('Click a piece in the palette first, then click its starting square!', 'hint');
        return;
      }
      const items = step.placementItems || [];
      const item = items[placementIdx];
      if (!item) return;
      if (sq === item.square) {
        const np = { ...placedPieces, [sq]: { piece: item.piece, color: item.color } };
        setPlacedPieces(np);
        setSelectedPalettePiece(null);
        setScore(s => s + 1); setTotal(t => t + 1); setStreak(s => s + 1);
        const nextIdx = placementIdx + 1;
        if (nextIdx >= items.length) {
          completeTask(
            fill(step.successVoice || 'All pieces placed!', childName),
            step.successVoice,
          );
        } else {
          const nextItem = items[nextIdx];
          showFb(`✓ ${item.icon} on ${item.square.toUpperCase()}!`, 'success',
            fill(nextItem.callVoice || `Place the ${nextItem.piece} on ${nextItem.square}`, childName),
            () => setPlacementIdx(nextIdx));
        }
      } else if (placedPieces[sq]) {
        showFb('That square is already occupied!', 'hint');
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        showFb(`Not quite — drag the ${item.icon} to ${item.square.toUpperCase()}!`, 'error');
        setSelectedPalettePiece(null);
      }
      return;
    }

    if (tt === 'notation-puzzle-setup') {
      if (placedPieces[sq]) return; // already occupied
      const next = pieceTrayOrder[0];
      if (!next) return;
      if (sq === next.square) {
        const np = { ...placedPieces, [sq]: { piece: next.piece, color: next.color } };
        setPlacedPieces(np);
        const rem = pieceTrayOrder.slice(1);
        setPieceTrayOrder(rem);
        setScore(s => s + 1); setStreak(s => s + 1);
        if (!rem.length) {
          setTotal(t => t + (step.targetPieces?.length || 0));
          setMoveDone(true);
          completeTask(pickVoice(step, 'success') || 'Setup complete!', pickVoice(step, 'success'));
        } else {
          showFb(`Placed! ${rem.length} piece${rem.length === 1 ? '' : 's'} left.`, 'hint');
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 500);
        showFb(`Not that square - look at the description again for where the next piece goes.`, 'error');
      }
      return;
    }

    if (tt === 'speed-round' && speedState?.active) {
      if (sq === speedState.currentTarget) {
        const nh = speedState.hits + 1;
        setClicked(p => [...p, sq]); setStreak(s => s + 1);
        const rem = speedState.targets.filter(t => !speedState.done.includes(t) && t !== sq);
        if (!rem.length) endSpeed(nh, step);
        else {
          const next = rem[0];
          setSpeed(p => ({ ...p, hits: nh, currentTarget: next, done: [...p.done, sq] }));
          const voiceMsg = `Find ${next.toUpperCase()}!`;
          setCurrentNarration(voiceMsg);
          showFb(`${sq.toUpperCase()} ✓`, 'success', voiceMsg);
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 400);
      }
    }
  }

  function startSpeed(roundStep) {
    // Use explicit targetSquares if provided, otherwise generate from targetCount
    let tgts = roundStep?.targetSquares || [];
    if (!tgts.length && roundStep?.targetCount) {
      const allSqs = [];
      'abcdefgh'.split('').forEach(f => { for(let r=1;r<=8;r++) allSqs.push(f+r); });
      // Shuffle and take targetCount
      const shuffled = allSqs.sort(() => Math.random() - 0.5);
      tgts = shuffled.slice(0, roundStep.targetCount);
    }
    if (!tgts.length) return;
    setClicked([]); setStreak(0);
    setSpeed({ active: true, targets: tgts, currentTarget: tgts[0], hits: 0, done: [], timeLeft: roundStep.timeLimitSecs || 75, totalTime: roundStep.timeLimitSecs || 75 });
    const startVoice = `Find ${tgts[0].toUpperCase()}!`;
    setCurrentNarration(startVoice);
    showFb(startVoice, 'hint', startVoice);
    speedRef.current = setInterval(() => {
      setSpeed(p => {
        if (!p) return p;
        const tl = p.timeLeft - 1;
        if (tl <= 0) { clearInterval(speedRef.current); endSpeed(p.hits, roundStep); return { ...p, timeLeft: 0, active: false }; }
        return { ...p, timeLeft: tl };
      });
    }, 1000);
  }

  function endSpeed(hits, roundStep) {
    const rs = roundStep || step;
    clearInterval(speedRef.current); setSpeed(p => p ? { ...p, active: false } : p); setNeonSqs([]);
    const tgt = rs.targetScore || 12; setScore(hits); setTotal((rs.targetSquares || []).length);
    if (hits >= tgt) confetti({ particleCount: 100, spread: 70 });
    let vm = hits >= tgt ? rs.successVoice : hits >= tgt * 0.7 ? rs.goodVoice : rs.tryAgainVoice;
    vm = fill((vm || `You scored ${hits}!`).replace('{score}', hits), childName);
    completeTask(vm, vm);
  }

  function handlePieceLetterAnswer(answer) {
    unlockAudio();
    if (pieceQuizAnswer !== null) return;
    const items = step.quizItems || [];
    const curr = items[pieceQuizIdx];
    if (!curr) return;
    setPieceQuizAnswer(answer);
    setTotal(t => t + 1);
    const correctValue = curr.correctLetter !== undefined ? curr.correctLetter
      : curr.correctIdx !== undefined ? curr.options[curr.correctIdx]
      : curr.piece !== undefined ? curr.piece
      : curr.pieceName;
    const correct = answer === correctValue;
    const ni = pieceQuizIdx + 1;

    const advance = () => {
      if (ni >= items.length) {
        completeTask(fill(pickVoice(step, 'success') || 'Done!', childName), pickVoice(step, 'success'));
      } else {
        setPieceQuizIdx(ni); setPieceQuizAnswer(null);
        setFeedback(''); setFbType('info');
      }
    };

    if (correct) {
      setScore(s => s + 1); setStreak(s => s + 1);
      const vm = correctValue === '(no letter)' ? 'Correct! Pawns get no letter!' : `Correct! ${correctValue} is right!`;
      showFb(vm, 'success', vm, advance);
    } else {
      setStreak(0);
      const vm = `Not quite. The answer was ${correctValue}.`;
      showFb(vm, 'error', vm, advance);
    }
  }

  function handleWriteNotationAnswer(answer) {
    unlockAudio();
    if (writeAnswer !== null) return;
    setWriteAnswer(answer);
    setTotal(t => t + 1);
    const correct = answer === step.correctNotation;
    if (correct) {
      setScore(s => s + 1); setStreak(s => s + 1);
      completeTask(`${step.correctNotation} is correct!`, pickVoice(step, 'success'));
    } else {
      setStreak(0);
      completeTask(`Not quite - the correct notation was ${step.correctNotation}.`, pickVoice(step, 'wrong'));
    }
  }

  function handleLightDark(answer) {
    unlockAudio();
    if (!quizState?.active) return;
    const qs = step.quizSquares || [], curr = qs[quizIdx];
    if (!curr) return;
    setTotal(t => t + 1);
    if (answer === curr.colour) {
      setScore(s => s + 1); setStreak(s => s + 1); setClicked(p => [...p, curr.sq]);
      const vm = (step.voiceCorrect || 'Correct!').replace('{sq}', curr.sq.toUpperCase()).replace('{colour}', curr.colour);
      const ni = quizIdx + 1;
      if (ni >= qs.length) {
        setQuizState({ active: false });
        showFb(vm, 'success', vm, () => {
          const vm2 = fill((pickVoice(step, 'success') || 'Done!').replace('{score}', score + 1), childName);
          completeTask(vm2, vm2);
        });
      } else {
        showFb(vm, 'success', vm, () => {
          setQuizIdx(ni); setNeonSqs([qs[ni].sq]);
          showFb(`Is ${qs[ni].sq.toUpperCase()} light or dark?`, 'hint');
        });
      }
    } else {
      setStreak(0); setWrongSqs([curr.sq]); setTimeout(() => setWrongSqs([]), 800);
      const vm = (step.voiceWrong || `${curr.sq} is ${curr.colour}!`).replace('{sq}', curr.sq.toUpperCase()).replace('{colour}', curr.colour);
      showFb(vm, 'error', vm);
    }
  }

  function startFileQuiz() {
    const shuffled = [...FILES].sort(() => Math.random() - 0.5).slice(0, 6);
    setFileQS({ active: true, remaining: shuffled.slice(1), current: shuffled[0] });
    // Glow stays persistent — no timeout. Student clicks answer to clear it.
    setNeonFile(shuffled[0]); setNeonRank(null); setNeonSqs([]);
  }

  function handleFileAnswer(answer) {
    unlockAudio();
    if (!fileQS?.active) return;
    const curr = fileQS.current; setTotal(t => t + 1);
    if (answer === curr) {
      setScore(s => s + 1); setStreak(s => s + 1);
      const vm = `Yes! File ${curr}!`;
      const rem = fileQS.remaining;
      if (!rem.length) {
        setFileQS({ active: false }); setNeonFile(null);
        completeTask(vm, vm);
      } else {
        showFb(vm, 'success', vm, () => {
          // Show next file — glow persists until answered
          setFileQS({ active: true, remaining: rem.slice(1), current: rem[0] });
          setNeonFile(null);
          setTimeout(() => setNeonFile(rem[0]), 80); // clear+set to force re-render
          showFb('Which file is this?', 'hint');
        });
      }
    } else {
      setStreak(0);
      const vm = `Not quite! That is file ${curr}!`;
      showFb(vm, 'error', vm);
      // Keep glow on after wrong answer so student can see correct file
    }
  }

  function handleRecapAnswer(idx) {
    unlockAudio();
    if (recapAnswer !== null) return;
    setRecapAnswer(idx);
    const correct = idx === step.recapCorrect;
    setTotal(t => t + 1);
    const unlock = () => setRecapFeedbackDone(true);
    if (correct) {
      setScore(s => s + 1); setStreak(s => s + 1);
      const vm = fill(step.recapCorrectVoice || 'Correct!', childName);
      showFb(vm, 'success', vm, unlock);
    } else {
      setStreak(0);
      const vm = fill(step.recapWrongVoice || 'Not quite!', childName);
      showFb(vm, 'error', vm, unlock);
    }
  }

  function handleContinue() {
    if (step?.taskType === 'complete') {
      // bonusActive flag is the definitive check — also fall back to phase-id inspection
      const isBonus = bonusActive || phases.some(p => p.id?.startsWith('bonus'));
      if (isBonus || remainSecsRef.current < 300) {
        // Bonus already active, or less than 5 min left — end the lesson
        setLessonDone(true);
        confetti({ particleCount: 200, spread: 120 });
        const closingVoice = fill(lesson?.doneVoice || `Amazing work, {name}! You have completed the lesson. You are a chess champion!`, childName);
        speakElevenLabs(closingVoice, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
        setTimeout(() => onComplete?.(), 4000);
      } else {
        // Main lesson complete with time remaining — activate bonus round!
        const bonus = activeBonus;
        if (bonus?.phases?.length && remainSecsRef.current > 300) {
          const bonusVoice = fill(`Incredible, {name}! You finished all the main content with time to spare. Let's play the bonus round!`, childName);
          speakElevenLabs(bonusVoice, {
            onStart: () => setIsPlaying(true),
            onEnd: () => setIsPlaying(false),
          });
          bonusTriggeredRef.current = true;
          setBonusActive(true);
          setPhaseIdx(0); setStepIdx(0);
          setVoiceFinished(false);
          voiceRef.current = false;
          continueSpoke.current = false;
        } else {
          setLessonDone(true);
          confetti({ particleCount: 200, spread: 120 });
          const closingVoice = fill(lesson?.doneVoice || `Amazing work, {name}! You have completed the lesson!`, childName);
          speakElevenLabs(closingVoice, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
          setTimeout(() => onComplete?.(), 4000);
        }
      }
      return;
    }
    // Compute next step
    let npi = phaseIdx;
    let nsi = stepIdx + 1;
    if (nsi >= steps.length) { npi = phaseIdx + 1; nsi = 0; }
    if (npi >= phases.length) {
      setLessonDone(true);
      confetti({ particleCount: 160, spread: 100 });
      setTimeout(() => onComplete?.(), 4000);
      return;
    }
    const nextPhase = phases[npi];
    const nextStepData = (nextPhase?.steps || [])[nsi];
    const text = nextStepData?.voice ? fill(nextStepData.voice, childName) : '';
    // Stop previous speech then speak new — both in same synchronous block
    // This is the ONLY place cancel() should be called before speak()
    window.speechSynthesis?.cancel();
    if (text) {
      continueSpoke.current = true; // tell useEffect not to speak again for this step
      currentVoiceText.current = text;
      pauseCharPos.current = 0;
      pausedRemainingText.current = text;
      voiceRef.current = true;
      clearTimeout(voiceFinishTimer.current);
      const fallbackMs = Math.max(6000, text.length * 110) + 5000;
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
      speakElevenLabs(text, {
        onStart: () => { setIsPlaying(true); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onBlocked: () => { clearTimeout(voiceFinishTimer.current); setAudioBlocked(true); setVoiceFinished(true); },
        onBoundary: (word, charIdx) => {
          if (charIdx !== undefined) {
            pauseCharPos.current = charIdx;
            pausedRemainingText.current = text.slice(charIdx);
          }
          const noHighlight = ['independent-squares','speed-round'].includes(nextStepData?.taskType);
          if (!noHighlight) applyNeonWord(word);
        },
      });
    } else {
      setVoiceFinished(true);
    }
    // State updates after speak()
    setCurrentNarration(text);
    setVoiceFinished(false);
    clearNeon();
    if (npi !== phaseIdx) { setPhaseIdx(npi); setStepIdx(0); }
    else { setStepIdx(nsi); }
  }

  const boardNeonSqs = [
    ...neonSqs,
    // independent-squares: only reveal target square AFTER a wrong answer
    ...(step?.taskType === 'independent-squares' && wrongSqs.length > 0
      ? [step.targetSquares?.[indepIdx]].filter(Boolean) : []),
    // Don't neon-highlight the colour-quiz square — the point of the
    // quiz is for the student to identify colour from the board's own
    // appearance. A bright yellow overlay makes dark squares look light.
    ...(step?.taskType === 'colour-quiz' && quizState?.active ? [] : []),
    // Speed-round squares are NOT highlighted — student must find them
    // independently. Highlighting would remove the challenge.
    // (neonSquares already handles regular teaching highlights above)
    ...(['piece-letter-quiz', 'piece-spot-quiz'].includes(step?.taskType) ? [step.quizItems?.[pieceQuizIdx]?.square].filter(Boolean) : []),
  ];

  // Responsive board width — measured from the div that directly wraps <Chessboard>
  // so the prop matches the actual rendered pixel width and drop coords are accurate.
  const boardWrapRef = useRef(null);
  const boardInnerRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(560);
  useEffect(() => {
    const el = boardInnerRef.current || boardWrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.floor(el.offsetWidth);
      console.log('[boardWidth] measured inner offsetWidth:', w, '| passed to Chessboard:', Math.max(200, w));
      setBoardWidth(w);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  // Border-only squares:
  // 1. Colour teaching steps (borderOnly flag or colour-quiz) — all neon squares
  // 2. Observe steps — highlights are always NAMED squares, so always border-only
  // During exercises, squares use green target fill (handled separately)
  const colourTeachingStep = step?.borderOnly || step?.taskType === 'colour-quiz';
  const observeNamedSquares = step?.taskType === 'observe' && step?.highlights?.length > 0;
  const borderOnlySquares = (colourTeachingStep || observeNamedSquares) ? boardNeonSqs : [];

  const currentBoardPos = resolveBoardPosition(boardFen, placedPieces);
  // For guided piece-range, determine the piece's current square from boardFen so it
  // can be excluded from orange highlighting in buildSquareStyles.
  const guidedPieceSquare = step?.taskType === 'piece-range' && step?.guided
    ? (Object.keys(currentBoardPos).find(sq => currentBoardPos[sq]) ?? null)
    : null;

  const squareStyles = buildSquareStyles({
    neonFile, neonRank,
    neonSquares: boardNeonSqs,
    clicked, wrong: wrongSqs,
    targets: targetSqs,
    colourQuizSq: step?.taskType === 'colour-quiz' && quizState?.active
      ? step.quizSquares?.[quizIdx]?.sq : null,
    glowPieces,
    boardPosition: currentBoardPos,
    borderOnlySquares,
    speedActive: speedState?.active,
    pathSqs,
    extraRanks,
    guidedPieceSquare,
    narratedSquares,
    tickSquares,
    pathSquares,
  });

  function handleAudioOverlayTap() {
    unlockAudio();
    setAudioBlocked(false);
    if (step?.voice) {
      const text = fill(step.voice, childName);
      const fallbackMs = Math.max(6000, text.length * 110) + 5000;
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
      speakElevenLabs(text, {
        onStart: () => { setIsPlaying(true); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
      });
    }
  }

  if (lessonDone) {
    const stars = score >= 20 ? 3 : score >= 10 ? 2 : score >= 1 ? 1 : 0;
    return (
      <div className="cl-done cl-done-animated">
        <div className="cl-done-card cl-done-card-animated">
          <div className="cl-done-burst">🎉</div>
          <Award size={56} className="cl-done-icon" />
          <h2 className="cl-done-title">{lesson.title || 'Lesson'} — Complete!</h2>
          <p className="cl-done-sub">{lesson.subtitle || ''}</p>
          <div className="cl-done-stars">
            {[0,1,2].map(i => (
              <span key={i} className={`cl-done-star${i < stars ? ' cl-done-star-earned' : ''}`}>⭐</span>
            ))}
          </div>
          <p className="cl-done-msg">
            Ms. Momo says: "Well done, {childName}! {lesson?.doneMsg || 'You have completed this chess lesson!'}"
          </p>
          <div className="cl-done-score">
            <span className="cl-done-n">{score}</span>
            <span className="cl-done-l">correct answers</span>
          </div>
          {onComplete && (
            <button className="cl-done-next" onClick={() => onComplete()}>
              Next Lesson →
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPP = step?.taskType === 'piece-placement' && !taskComplete;
  const pct = Math.round((phaseIdx / phases.length) * 100);
  const boardTaskTypes = ['independent-squares', 'click-square', 'click-file', 'click-rank', 'piece-range', 'piece-intro-guided', 'speed-round', 'file-name-quiz'];
  const contLabel = step?.taskType === 'speed-intro'
    ? 'Start speed challenge!'
    : step?.continueLabel
      || (boardTaskTypes.includes(step?.taskType) ? 'Next!' : 'Continue');
  const totalSecs = (lesson.totalMinutes || 55) * 60;
  const remainSecs = Math.max(0, totalSecs - elapsedSecs);
  const timerMins = Math.floor(remainSecs / 60);
  const timerSecs = remainSecs % 60;
  const timerStr = `${timerMins}:${String(timerSecs).padStart(2,'0')}`;
  const timerWarning = remainSecs < 300; // red when under 5 min

  return (
    <div className="cl-root">

      {/* Decorative dot stars */}
      {[
        { top: '5%',  left: '17%', size: 3, opacity: 0.65 },
        { top: '11%', left: '71%', size: 2, opacity: 0.5  },
        { top: '3%',  left: '47%', size: 4, opacity: 0.38 },
        { top: '8%',  left: '87%', size: 2, opacity: 0.58 },
        { top: '2%',  left: '32%', size: 3, opacity: 0.32 },
        { top: '7%',  left: '60%', size: 2, opacity: 0.52 },
      ].map((d, i) => (
        <span key={i} className="cl-dot-star" style={{ top: d.top, left: d.left, width: d.size, height: d.size, opacity: d.opacity }} />
      ))}

      {audioBlocked && !isTest && (
        <div className="cl-audio-overlay" onClick={handleAudioOverlayTap}>
          <div className="cl-audio-overlay-card">
            <span style={{fontSize:'32px'}}>🔊</span>
            <p>Tap anywhere to start Ms. Momo's voice</p>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="cl-topbar">
        <div className="cl-topbar-left">
          <div className="cl-lesson-badge">
            <span>📚</span>
            <span>{lesson.subtitle || 'Chess'}</span>
          </div>
        </div>
        <div className="cl-topbar-center">
          <h1 className="cl-lesson-title">{lesson.title}</h1>
        </div>
        <div className="cl-topbar-right">
          {isTest && (
            <select
              className="cl-test-jumper"
              value={phaseIdx}
              onChange={e => {
                const npi = parseInt(e.target.value);
                window.speechSynthesis?.cancel();
                setPhaseIdx(npi); setStepIdx(0);
                setClassStarted(true);
                setVoiceFinished(true);
                setTaskComplete(false);
                setClicked([]); setWrongSqs([]); setFeedback(''); setFbType('info');
                setSpeed(null); setIndepIdx(0);
                setRecapAnswer(null); setRecapFeedbackDone(false);
                voiceRef.current = false;
                continueSpoke.current = false;
                clearNeon();
              }}
            >
              {phases.map((p, i) => (
                <option key={p.id} value={i}>{i + 1}. {p.title}</option>
              ))}
            </select>
          )}
          <div className="cl-timer-pill">
            <span>⏱</span>
            <span>{timerStr}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="cl-progbar">
        <div className="cl-progbar-fill" style={{ width: `${Math.max(2, pct)}%` }}>
          <span className="cl-progbar-star">⭐</span>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="cl-columns">

        {/* LEFT — Ms. Momo + Phase Progress */}
        <div className="cl-col-left">

          <div className="cl-momo-card">
            <div className="cl-momo-avatar">🎓</div>
            <div className="cl-momo-name">Ms. Momo</div>
            <div className="cl-momo-sub">YOUR CHESS TUTOR</div>
            <div className="cl-momo-bubble">
              "{currentNarration || fill(step?.voice || '', childName)}"
            </div>
            <div className="cl-momo-controls">
              <button className="cl-ctrl-btn" onClick={handleRepeat} title="Replay from start">⏮</button>
              <button className="cl-ctrl-btn cl-ctrl-main" onClick={handlePauseResume} title={isPaused ? 'Resume Ms. Momo' : 'Pause Ms. Momo'}>
                {isPaused ? '▶' : '⏸'}
              </button>
            </div>
          </div>

          <div className="cl-phase-card">
            <div className="cl-phase-title">⚔️ YOUR QUEST</div>
            {phases.map((p, i) => (
              <div key={p.id} className={`cl-phase-row ${i < phaseIdx ? 'cl-phase-done' : i === phaseIdx ? 'cl-phase-active' : 'cl-phase-upcoming'}`}>
                <div className="cl-phase-icon">
                  {i < phaseIdx ? '✓' : i === phaseIdx ? '▶' : '·'}
                </div>
                <span className="cl-phase-name">{p.label || p.title || p.id}</span>
              </div>
            ))}
          </div>

        </div>

        {/* CENTER — Board */}
        <div className="cl-col-center">
          <div className="cl-battlefield-label">🏰 THE BATTLEFIELD</div>

          <div className="cl-board-wrap" ref={boardWrapRef}>
          {isPP && (() => {
            const items = step?.placementItems || [];
            const currentItem = items[placementIdx];
            const canDrag = voiceFinished && !speakingFb && !isPlaying;
            const TYPES = ['K','Q','R','B','N','P'];
            const buildSlots = (color) => TYPES.map(type => {
              const ofType = items.filter(i => i.color === color && i.piece === type);
              if (!ofType.length) return null;
              const remaining = ofType.length - ofType.filter(i => placedPieces[i.square]).length;
              const isCurrent = currentItem?.color === color && currentItem?.piece === type;
              return { type, color, remaining, isCurrent };
            }).filter(Boolean);
            const renderSlots = (slots) => slots.map(slot => (
              <div
                key={slot.type}
                className={`cl-pp-slot${slot.remaining === 0 ? ' cl-pp-slot-done' : ''}${slot.isCurrent ? ' cl-pp-slot-current' : ''}`}
                draggable={canDrag && slot.isCurrent && slot.remaining > 0}
                onDragStart={e => {
                  if (!canDrag || !slot.isCurrent || slot.remaining === 0) { e.preventDefault(); return; }
                  draggedPaletteItemRef.current = { piece: slot.type, color: slot.color };
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => { draggedPaletteItemRef.current = null; }}
                title={slot.isCurrent && slot.remaining > 0 ? `Drag to ${currentItem?.square?.toUpperCase()}` : ''}
              >
                <img src={PIECE_SVG_URLS[`${slot.color}${slot.type}`]} alt={slot.type} draggable={false} />
                {slot.remaining > 1 && <span className="cl-pp-slot-count">×{slot.remaining}</span>}
              </div>
            ));
            return (
              <>
                <div className="cl-pp-palette cl-pp-left">{renderSlots(buildSlots('w'))}</div>
                <div className="cl-pp-palette cl-pp-right">{renderSlots(buildSlots('b'))}</div>
              </>
            );
          })()}
            <div style={{position:'relative', width:'100%', paddingBottom:'100%'}}>
              <div style={{position:'absolute', inset:0}}>
            <div className="cl-board-frame-new">
              <div
                className="cl-board-inner"
                ref={boardInnerRef}
                style={{position:'relative'}}
                onDragOver={e => {
                  if (isPP && draggedPaletteItemRef.current) e.preventDefault();
                }}
                onDrop={e => {
                  if (!isPP || !draggedPaletteItemRef.current) return;
                  e.preventDefault();
                  const item = draggedPaletteItemRef.current;
                  draggedPaletteItemRef.current = null;
                  if (!boardInnerRef.current) return;
                  const sq = coordsToSquare(e.clientX, e.clientY, boardInnerRef.current.getBoundingClientRect());
                  handlePalettePieceDrop(sq, item);
                }}
              >
                <Chessboard
                  id="tso-chess-lesson"
                  position={resolveBoardPosition(boardFen, placedPieces)}
                  boardWidth={Math.max(200, boardWidth)}
                  boardOrientation="white"
                  snapToCursor={true}
                  showAnimations={true}
                  animationDuration={500}
                  showBoardNotation={true}
                  arePiecesDraggable={['notation-build', 'notation-puzzle-move', 'piece-range', 'piece-intro-guided', 'notation-drag'].includes(step?.taskType) && !moveDone && voiceFinished && !speakingFb && !isPlaying && !(step?.taskType === 'notation-drag' && tickSquares.length > 0)}
                  onPieceDrop={handlePieceDrop}
                  customSquareStyles={squareStyles}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                  customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                  customPieces={customPiecesForLetters}
                  onSquareClick={handleSquareClickArgs}
                  customSquare={(() => {
                    const isTeaching = ['click-square','observe'].includes(step?.taskType);
                    const labelSqs = isTeaching ? (neonSqs || []) : [];
                    const isGuided = currentStepRef.current?.guided === true && Array.isArray(currentStepRef.current?.targetSquares);
                    const isPIG = step?.taskType === 'piece-intro-guided';
                    const isUnguidedRange = step?.taskType === 'piece-range' && !isGuided;
                    const isNDrag = step?.taskType === 'notation-drag';
                    const isPPlacement = step?.taskType === 'piece-placement';
                    if (!isGuided && !labelSqs.length && !isPIG && !isUnguidedRange && !isNDrag && !isPPlacement) return 'div';
                    return ({ square, squareColor, style, children }) => {
                      if ((isNDrag || isPPlacement) && (tickSquares || []).includes(square)) {
                        return (
                          <div style={{
                            ...style,
                            backgroundColor: 'rgba(60,220,90,0.75)',
                            boxShadow: 'inset 0 0 0 3px rgba(40,180,70,0.95)',
                            position: 'relative',
                          }}>
                            {children}
                            <div style={{
                              position:'absolute', top:'50%', left:'50%',
                              transform:'translate(-50%,-50%)',
                              color:'#fff', fontSize:'20px', fontWeight:'bold',
                              lineHeight:1,
                              textShadow:'0 1px 3px rgba(0,0,0,0.5)',
                            }}>✓</div>
                          </div>
                        );
                      }
                      if (isPIG) {
                        const isTick = (tickSquares || []).includes(square);
                        const isNarrated = (narratedSquares || []).includes(square);
                        const isPath = (pathSquares || []).includes(square);
                        if (isTick) {
                          return (
                            <div style={{
                              ...style,
                              backgroundColor: 'rgba(60,220,90,0.75)',
                              boxShadow: 'inset 0 0 0 3px rgba(40,180,70,0.95)',
                              position: 'relative',
                            }}>
                              {children}
                              <div style={{
                                position:'absolute', top:'50%', left:'50%',
                                transform:'translate(-50%,-50%)',
                                color:'#fff', fontSize:'20px', fontWeight:'bold',
                                lineHeight:1,
                                textShadow:'0 1px 3px rgba(0,0,0,0.5)',
                              }}>✓</div>
                            </div>
                          );
                        }
                        if (isNarrated) {
                          return (
                            <div style={{
                              ...style,
                              backgroundColor: 'rgba(249,115,22,0.92)',
                              boxShadow: 'inset 0 0 0 3px rgba(255,150,0,0.9)',
                            }}>
                              {children}
                            </div>
                          );
                        }
                        if (isPath) {
                          return (
                            <div style={{
                              ...style,
                              backgroundColor: 'rgba(255,220,0,0.85)',
                              boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.9)',
                            }}>
                              {children}
                            </div>
                          );
                        }
                        return <div style={style}>{children}</div>;
                      }
                      if (isUnguidedRange && (clicked || []).includes(square)) {
                        return (
                          <div style={{
                            ...style,
                            backgroundColor: 'rgba(60,220,90,0.75)',
                            boxShadow: 'inset 0 0 0 3px rgba(40,180,70,0.95)',
                            position: 'relative',
                          }}>
                            {children}
                            <div style={{
                              position:'absolute', top:'50%', left:'50%',
                              transform:'translate(-50%,-50%)',
                              color:'#fff', fontSize:'20px', fontWeight:'bold',
                              lineHeight:1,
                              textShadow:'0 1px 3px rgba(0,0,0,0.5)',
                            }}>✓</div>
                          </div>
                        );
                      }
                      if (isGuided && currentStepRef.current?.targetSquares?.includes(square)) {
                        const isVisited = (clicked || []).includes(square);
                        if (isVisited) {
                          return (
                            <div style={{
                              ...style,
                              backgroundColor: 'rgba(60,220,90,0.75)',
                              boxShadow: 'inset 0 0 0 3px rgba(40,180,70,0.95)',
                            }}>
                              {children}
                            </div>
                          );
                        }
                        return (
                          <div style={{
                            ...style,
                            backgroundColor: 'rgba(249,115,22,0.92)',
                            boxShadow: 'inset 0 0 0 3px rgba(255,150,0,0.9)',
                          }}>
                            {children}
                          </div>
                        );
                      }

                      return (
                        <div style={{...style, position: 'relative'}}>
                          {children}
                          {labelSqs.includes(square) && (
                            <div style={{
                              position:'absolute', bottom:2, right:3,
                              fontSize: Math.max(9, (boardWidth - 56) / 8 * 0.28) + 'px',
                              fontWeight:900, color:'#fff',
                              textShadow:'0 1px 3px rgba(0,0,0,0.9)',
                              lineHeight:1,
                              fontFamily:'var(--font-main)',
                            }}>
                              {square.toUpperCase()}
                            </div>
                          )}
                        </div>
                      );
                    };
                  })()}
                />
                {!classStarted && (
                  <div className="cl-start-overlay" onClick={handleStartClass}>
                    <div className="cl-start-btn">
                      <span className="cl-start-icon">▶</span>
                      <span>Start Class</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
              </div>{/* absolute inset */}
            </div>{/* padding-bottom square hack */}
          </div>{/* cl-board-wrap */}

          {step?.task && (
            <div className="cl-taskbar">
              <span className="cl-taskbar-icon">🎯</span>
              <span className="cl-taskbar-text">{step.task}</span>
            </div>
          )}
        </div>

        {/* RIGHT — Score + Achievements + Exercise + Age Mode */}
        <div className="cl-col-right">

          {(() => {
            // Context-sensitive score label — Rule 26
            const isSquareFinding = ['independent-squares', 'speed-round'].includes(step?.taskType) ||
              phase?.type === 'warmup';
            const isPieceLetter = phase?.id === 'pieceletters' || phase?.id === 'letterquiz';
            const isNotation = phase?.id === 'readmove';
            const scoreLabel = isSquareFinding ? 'SQUARES FOUND'
              : isPieceLetter ? 'PIECES LEARNED'
              : isNotation ? 'MOVES READ'
              : 'SCORE';
            return (
              <div className="cl-score-card">
                <div className="cl-score-label">{scoreLabel}</div>
                <div className="cl-score-big">{score}</div>
                <div className="cl-score-sub">{total > 0 ? `of ${total} attempts` : "Let's go!"}</div>
                <div className="cl-star-row">
                  {score >= 5 ? '⭐' : '☆'}{score >= 10 ? '⭐' : '☆'}{score >= 20 ? '⭐' : '☆'}
                </div>
              </div>
            );
          })()}

          <div className="cl-achieve-card">
            <div className="cl-achieve-title">🏅 ACHIEVEMENTS</div>
            <div className="cl-badge-grid">
              {[
                { icon: '🎯', name: 'First Hit',  desc: 'Answered correctly on first try',     earned: score >= 1 },
                { icon: '🔥', name: 'On Fire',    desc: '3 correct answers in a row',           earned: streak >= 3 },
                { icon: '⚡', name: 'Speed Star', desc: 'Completed a drag or move challenge',   earned: ['notation-drag','piece-placement','piece-range'].includes(step?.taskType) && taskComplete },
                { icon: '🏆', name: 'Champion',   desc: 'Reached the final phase of the lesson', earned: phaseIdx >= phases.length - 1 && taskComplete },
              ].map((b, i) => (
                <div key={i} className={`cl-badge${b.earned ? ' cl-badge-earned' : ''}`}>
                  <span className="cl-badge-icon">{b.icon}</span>
                  <span className="cl-badge-name">{b.name}</span>
                  <span className="cl-badge-desc">{b.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="cl-exercise">

          {/* Pieces Placed counter — Rule 26: replaces letter panel for piece-placement */}
          {isPP && (() => {
            const items = step?.placementItems || [];
            const placed = Object.keys(placedPieces).length;
            const currentItem = items[placementIdx];
            return (
              <div className="cl-pp-counter">
                <div className="cl-pp-counter-label">PIECES PLACED</div>
                <div className="cl-pp-counter-num">{placed} / {items.length}</div>
                {currentItem && (
                  <div className="cl-pp-current-call">
                    <div className="cl-pp-current-icon">{currentItem.icon}</div>
                    <div className="cl-pp-current-sq">{currentItem.square.toUpperCase()}</div>
                  </div>
                )}
              </div>
            );
          })()}

          {visibleLetterCards.length > 0 && !isPP && (
            <div className="cl-letter-panel">
              <div className="cl-letter-panel-lbl">Piece Letters</div>
              <div className="cl-letter-grid">
                {visibleLetterCards.map(card => (
                  <div key={card.letter} className="cl-letter-card">
                    <div className="cl-letter-card-icon">{card.icon}</div>
                    <div className="cl-letter-card-letter">{card.letter}</div>
                    <div className="cl-letter-card-name">{card.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* placeholder — task is now shown in taskbar below board */}

          {/* Score */}
          {total > 0 && (
            <div className="cl-score-row">
              <div className="cl-score-box">
                <span className="cl-score-n">{score}</span>
                <span className="cl-score-d">/ {total}</span>
              </div>
              {streak >= 3 && <div className="cl-streak">{streak} in a row!</div>}
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div className={`cl-fb cl-fb-${fbType}`}>{feedback}</div>
          )}

          {/* Colour quiz */}
          {quizState?.active && (
            <div className="cl-col-btns">
              <button className="cl-light-btn"
                onClick={() => handleLightDark('light')}
                disabled={speakingFb}>
                Light square
              </button>
              <button className="cl-dark-btn"
                onClick={() => handleLightDark('dark')}
                disabled={speakingFb}>
                Dark square
              </button>
            </div>
          )}

          {/* File quiz */}
          {fileQS?.active && (
            <div className="cl-file-grid">
              {FILES.map(f => (
                <button key={f} className="cl-file-btn"
                  onClick={() => handleFileAnswer(f)}
                  disabled={speakingFb}
                  style={speakingFb ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Recap quiz */}
          {step?.taskType === 'recap-quiz' && voiceFinished && !speakingFb && !isPlaying && (
            <div className="cl-recap">
              <div className="cl-recap-q">{step.recapQuestion}</div>
              <div className="cl-recap-opts">
                {step.recapOptions.map((opt, i) => {
                  let cls = 'cl-recap-opt';
                  if (recapAnswer !== null) {
                    if (i === step.recapCorrect) cls += ' cl-recap-correct';
                    else if (i === recapAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleRecapAnswer(i)} disabled={recapAnswer !== null || speakingFb}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Name-the-square quiz */}
          {step?.taskType === 'name-the-square' && voiceFinished && !speakingFb && !isPlaying && (
            <div className="cl-recap">
              <div className="cl-recap-q">{step.task}</div>
              <div className="cl-recap-opts">
                {(step.options || []).map((opt, i) => {
                  const correctIdx = (step.options || []).indexOf(step.correct);
                  let cls = 'cl-recap-opt';
                  if (recapAnswer !== null) {
                    if (i === correctIdx) cls += ' cl-recap-correct';
                    else if (i === recapAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={i} className={cls}
                      onClick={() => {
                        if (recapAnswer !== null) return;
                        unlockAudio();
                        const correctIdx = (step.options || []).indexOf(step.correct);
                        setRecapAnswer(i);
                        setTotal(t => t + 1);
                        const correct = i === correctIdx;
                        const unlock = () => setRecapFeedbackDone(true);
                        if (correct) {
                          setScore(s => s + 1); setStreak(s => s + 1);
                          const vm = fill(pickVoice(step, 'success') || 'Correct!', childName);
                          showFb(vm, 'success', vm, unlock);
                        } else {
                          setStreak(0);
                          const vm = fill(pickVoice(step, 'wrong') || 'Not quite!', childName);
                          showFb(vm, 'error', vm, unlock);
                        }
                      }}
                      disabled={recapAnswer !== null || speakingFb}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* True-or-false quiz */}
          {step?.taskType === 'true-or-false' && voiceFinished && !speakingFb && !isPlaying && (
            <div className="cl-recap">
              <div className="cl-recap-q">{step.task}</div>
              <div className="cl-recap-opts cl-tof-opts">
                {[true, false].map(val => {
                  let cls = 'cl-recap-opt';
                  if (recapAnswer !== null) {
                    if (val === step.correct) cls += ' cl-recap-correct';
                    else if (val === recapAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={String(val)} className={cls}
                      onClick={() => {
                        if (recapAnswer !== null) return;
                        unlockAudio();
                        setRecapAnswer(val);
                        setTotal(t => t + 1);
                        const correct = val === step.correct;
                        const unlock = () => setRecapFeedbackDone(true);
                        if (correct) {
                          setScore(s => s + 1); setStreak(s => s + 1);
                          const vm = fill(pickVoice(step, 'success') || 'Correct!', childName);
                          showFb(vm, 'success', vm, unlock);
                        } else {
                          setStreak(0);
                          const vm = fill(pickVoice(step, 'wrong') || 'Not quite!', childName);
                          showFb(vm, 'error', vm, unlock);
                        }
                      }}
                      disabled={recapAnswer !== null || speakingFb}>
                      {val ? 'TRUE' : 'FALSE'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Piece letter quiz / piece spot quiz */}
          {['piece-letter-quiz', 'piece-spot-quiz'].includes(step?.taskType) && voiceFinished && !speakingFb && !isPlaying && step.quizItems?.[pieceQuizIdx] && (
            <div className="cl-recap">
              <div className="cl-recap-q">
                Item {pieceQuizIdx + 1} of {step.quizItems.length} — {step.taskType === 'piece-spot-quiz' ? 'which piece is highlighted?' : "what is this piece's letter?"}
              </div>
              <div className="cl-recap-opts">
                {step.quizItems[pieceQuizIdx].options.map((opt, i) => {
                  const curr = step.quizItems[pieceQuizIdx];
                  const correctValue = curr.correctLetter !== undefined ? curr.correctLetter
                    : curr.correctIdx !== undefined ? curr.options[curr.correctIdx]
                    : curr.pieceName;
                  let cls = 'cl-recap-opt';
                  if (pieceQuizAnswer !== null) {
                    if (opt === correctValue) cls += ' cl-recap-correct';
                    else if (opt === pieceQuizAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handlePieceLetterAnswer(opt)} disabled={pieceQuizAnswer !== null || speakingFb || isPlaying}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Write notation quiz */}
          {step?.taskType === 'write-notation' && voiceFinished && (
            <div className="cl-recap">
              <div className="cl-recap-q">{step.task}</div>
              <div className="cl-recap-opts">
                {step.options.map((opt, i) => {
                  let cls = 'cl-recap-opt cl-recap-mono';
                  if (writeAnswer !== null) {
                    if (opt === step.correctNotation) cls += ' cl-recap-correct';
                    else if (opt === writeAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handleWriteNotationAnswer(opt)} disabled={writeAnswer !== null}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notation puzzle setup — piece tray */}
          {step?.taskType === 'notation-puzzle-setup' && voiceFinished && pieceTrayOrder.length > 0 && (
            <div className="cl-tray">
              <div className="cl-tray-lbl">Next piece to place:</div>
              <div className="cl-tray-piece">
                <span className="cl-tray-piece-icon">
                  {pieceTrayOrder[0].color === 'w' ? '\u25CB' : '\u25CF'} {pieceTrayOrder[0].piece}
                </span>
                <span className="cl-tray-piece-sq">→ find its square on the board</span>
              </div>
            </div>
          )}

          {/* Piece-letter visual reference — shown when step.pieceLetterRef is set.
              Hidden during piece-placement (Rule 26 — counter replaces it). */}
          {step?.pieceLetterRef?.length > 0 && !isPP && (
            <div className="cl-letter-ref">
              <div className="cl-letter-ref-title">Piece Letters</div>
              <div className="cl-letter-ref-grid">
                {step.pieceLetterRef.map((item, i) => (
                  <div key={i} className="cl-letter-ref-card">
                    <span className="cl-letter-ref-icon">{item.icon}</span>
                    <span className="cl-letter-ref-letter">{item.letter}</span>
                    <span className="cl-letter-ref-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notation move display — shows the move text large and clear
              whenever a notation-demo step plays, e.g. "e4" or "Nf3" */}
          {step?.moveNotation && (
            <div className="cl-move-display">
              <div className="cl-move-label">The Move</div>
              <div className="cl-move-text">{step.moveNotation}</div>
              {step.moveExplain && <div className="cl-move-explain">{step.moveExplain}</div>}
            </div>
          )}

          {/* Independent squares — current target square shown large and bold */}
          {step?.taskType === 'independent-squares' && !taskComplete && (
            <div className="cl-indep-target">
              <div className="cl-indep-find">Find this square:</div>
              <div className="cl-indep-sq">
                {(step.targetSquares?.[indepIdx] || '').toUpperCase()}
              </div>
              <div className="cl-indep-hint">
                {step.targetSquares && `${indepIdx + 1} of ${step.targetSquares.length}`}
              </div>
            </div>
          )}

          {/* Notation drag — current call display */}
          {step?.taskType === 'notation-drag' && !taskComplete && (() => {
            const call = step.notationCalls?.[notationDragIdx];
            if (!call) return null;
            return (
              <div className="cl-notation-drag-panel">
                <div className="cl-nd-label">Drag the piece shown:</div>
                <div className="cl-nd-notation">{call.notation}</div>
                <div className="cl-nd-explain">{call.explain}</div>
                <div className="cl-nd-progress">{notationDragIdx + 1} of {step.notationCalls.length}</div>
              </div>
            );
          })()}

          {/* piece-placement palettes are now rendered beside the board — see cl-pp-palette */}

          {/* Speed round */}
          {speedState?.active && (
            <div className="cl-speed">
              <div className="cl-speed-find">Find this square:</div>
              <div className="cl-speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
              <div className="cl-speed-track"><div className="cl-speed-fill" style={{ width: `${(speedState.timeLeft / speedState.totalTime) * 100}%` }} /></div>
              <div className="cl-speed-meta"><span>{speedState.timeLeft}s left</span><span>{speedState.hits} correct</span></div>
            </div>
          )}

          {(() => {
            const ownControls = ['notation-build', 'notation-puzzle-move', 'notation-puzzle-setup', 'write-notation'].includes(step?.taskType);
            const boardTask = ['independent-squares', 'click-square', 'click-file', 'click-rank', 'piece-range', 'piece-intro-guided', 'speed-round', 'file-name-quiz', 'notation-drag', 'piece-placement'].includes(step?.taskType);

            if (speedState?.active || quizState?.active || fileQS?.active) return null;
            if (ownControls) return null;
            if (boardTask && !taskComplete) return null;
            if (['recap-quiz', 'name-the-square', 'true-or-false'].includes(step?.taskType) && (recapAnswer === null || !recapFeedbackDone)) return null;

            const isRecap = ['recap-quiz', 'name-the-square', 'true-or-false'].includes(step?.taskType);
            const locked = !voiceFinished || speakingFb || isPlaying
              || (isRecap && (recapAnswer === null || !recapFeedbackDone));
            return (
              <button
                className={`cl-continue ${locked ? 'cl-continue-locked' : 'cl-continue-ready'}`}
                onClick={locked ? undefined : handleContinue}
                disabled={locked}
              >
                {locked ? (
                  (isPlaying || speakingFb)
                    ? <><span className="cl-continue-listening">◉ Ms. Momo is speaking...</span></>
                    : <>{!voiceFinished ? 'Please wait...' : recapAnswer === null ? 'Answer the question first...' : 'Listen to Ms. Momo...'}</>
                ) : (
                  <>{contLabel} <ChevronRight size={16} /></>
                )}
              </button>
            );
          })()}

          </div>{/* end cl-exercise */}

          <div className="cl-agemode-card">
            {[
              { label: '6–8',  group: 'young' },
              { label: '9–12', group: 'mid'   },
              { label: '13+',  group: 'teen'  },
            ].map(a => (
              <button key={a.label} className={`cl-age-btn${getAgeGroup(childAge) === a.group ? ' cl-age-active' : ''}`}>
                {a.label}
              </button>
            ))}
          </div>

        </div>{/* end cl-col-right */}

      </div>{/* end cl-columns */}

      {/* Decorative castles */}
      <span className="cl-castle cl-castle-left">🏰</span>
      <span className="cl-castle cl-castle-right">🏰</span>

    </div>
  );
}
