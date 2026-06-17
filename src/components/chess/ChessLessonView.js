/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Swords, Award, Clock, RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import { LESSON_1 } from '../../data/chessLesson1';
import { LESSON_2 } from '../../data/chessLesson2';
import { speakElevenLabs, stopSpeech, parseHighlights, unlockAudio, pendingAudioClear } from '../../utils/elevenlabs';
import './ChessLessonView.css';

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
    const c = new Chess(fen);
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
function buildSquareStyles({ neonFile, neonRank, neonSquares, clicked, wrong, targets, colourQuizSq }) {
  const styles = {};

  function setStyle(sq, style) {
    styles[sq] = { ...(styles[sq] || {}), ...style };
  }

  if (neonFile) {
    for (let r = 1; r <= 8; r++) setStyle(`${neonFile}${r}`, { backgroundColor: 'rgba(255,210,0,0.55)' });
  }
  if (neonRank) {
    FILES.forEach(f => setStyle(`${f}${neonRank}`, { backgroundColor: 'rgba(255,210,0,0.55)' }));
  }
  (neonSquares || []).forEach(sq => setStyle(sq, {
    backgroundColor: 'rgba(255,210,0,0.85)',
    boxShadow: 'inset 0 0 0 3px rgba(255,210,0,1)',
  }));
  // Colour-quiz square: white blinking border ONLY — no yellow, no colour change at all
  if (colourQuizSq) {
    setStyle(colourQuizSq, {
      animation: 'cl-sq-blink 0.9s step-end infinite',
    });
  }
  (targets || []).forEach(sq => {
    if (!(clicked || []).includes(sq)) {
      setStyle(sq, { backgroundColor: 'rgba(60,220,90,0.55)', boxShadow: 'inset 0 0 0 3px rgba(50,210,80,0.95)' });
    }
  });
  (clicked || []).forEach(sq => setStyle(sq, { backgroundColor: 'rgba(29,158,117,0.65)' }));
  (wrong || []).forEach(sq => setStyle(sq, { backgroundColor: 'rgba(226,75,74,0.7)' }));

  return styles;
}

// ─────────────────────────────────────────────────────
// MAIN — Chess Lesson View (Lesson 1: board fundamentals)
// ─────────────────────────────────────────────────────
export default function ChessLessonView({ lessonData, childName = 'Student', isTest = false, onComplete }) {
  const lesson = lessonData || LESSON_1;
  const phases = lesson.phases;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
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
  useEffect(() => {
    lessonStartTime.current = Date.now();
    const id = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - lessonStartTime.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Repeat — replay current step's voice narration from the beginning
  const currentVoiceText = useRef('');
  function handleRepeat() {
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
    unlockAudio();
    setClassStarted(true);
    setAudioBlocked(false);
    if (step?.voice) {
      const text = fill(step.voice, childName);
      currentVoiceText.current = text;
      pauseCharPos.current = 0;
      pausedRemainingText.current = text;
      setCurrentNarration(text);
      applyNeon(text);
      voiceRef.current = true;
      const fallbackMs = Math.max(6000, text.length * 110) + 5000;
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
      speakElevenLabs(text, {
        onStart: () => { setIsPlaying(true); setIsPaused(false); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onBlocked: () => { clearTimeout(voiceFinishTimer.current); setAudioBlocked(true); },
        onBoundary: (word) => applyNeonWord(word),
      });
    }
  }

  const [neonFile, setNeonFile] = useState(null);
  const [neonRank, setNeonRank] = useState(null);
  const [neonSqs, setNeonSqs] = useState([]);
  const [glowPieces, setGlowPieces] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [wrongSqs, setWrongSqs] = useState([]);
  const [targetSqs, setTargetSqs] = useState([]);

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

  // Piece-based interaction state (Lesson 2+)
  const [boardFen, setBoardFen] = useState('start');
  const [selectedSq, setSelectedSq] = useState(null);
  const [moveDone, setMoveDone] = useState(false);
  const [pieceQuizIdx, setPieceQuizIdx] = useState(0);
  const [pieceQuizAnswer, setPieceQuizAnswer] = useState(null);
  const [writeAnswer, setWriteAnswer] = useState(null);
  const [placedPieces, setPlacedPieces] = useState({}); // for notation-puzzle-setup
  const [pieceTrayOrder, setPieceTrayOrder] = useState([]); // shuffled tray order

  const speedRef = useRef(null);
  const voiceRef = useRef(false);
  const neonTimer = useRef(null);
  const seqTimers = useRef([]);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step = steps[stepIdx];

  function applyNeon(text) {
    const m = parseHighlights(text);
    const sqs = [], files = [], ranks = [], pieces = [];
    m.forEach(x => {
      if (x.type === 'square') sqs.push(x.value);
      else if (x.type === 'file') files.push(x.value);
      else if (x.type === 'rank') ranks.push(x.value);
      else if (x.type === 'piece') pieces.push(x.value);
    });
    if (files.length) setNeonFile(files[0]);
    if (ranks.length) setNeonRank(ranks[0]);
    if (sqs.length) setNeonSqs(sqs);
    if (pieces.length) setGlowPieces(pieces);
    clearTimeout(neonTimer.current);
    neonTimer.current = setTimeout(() => {
      setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]);
    }, 9000);
  }

  // Progressive word highlighting — called per word boundary as Ms. Momo speaks.
  // Strict rules to prevent false highlights:
  // - Single letters only trigger file highlight when the PREVIOUS word was 'file'
  // - Rank numbers only trigger when the PREVIOUS word was 'rank'
  // - Square coordinates (e4, d5 etc) always highlight
  // - Suppressed entirely for test/challenge taskTypes
  const lastSpokenWord = useRef('');
  function applyNeonWord(word) {
    if (!word) return;
    // Suppress during test/challenge steps
    const suppressTypes = ['independent-squares', 'speed-round', 'colour-quiz',
                          'piece-letter-quiz', 'piece-spot-quiz', 'recap-quiz'];
    if (suppressTypes.includes(step?.taskType)) { lastSpokenWord.current = word.toLowerCase(); return; }

    const w = word.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Square: e.g. "e4", "a1" — always highlight
    if (/^[a-h][1-8]$/.test(w)) {
      setNeonSqs([w]);
      clearTimeout(neonTimer.current);
      neonTimer.current = setTimeout(() => setNeonSqs([]), 2500);
      lastSpokenWord.current = w;
      return;
    }

    // File letter: ONLY highlight when preceded by the word "file"
    // This prevents random file highlights when Ms. Momo says any letter
    if (/^[a-h]$/.test(w) && lastSpokenWord.current === 'file') {
      setNeonFile(w);
      clearTimeout(neonTimer.current);
      neonTimer.current = setTimeout(() => setNeonFile(null), 2000);
      lastSpokenWord.current = w;
      return;
    }

    // Rank number: ONLY highlight when preceded by "rank"
    if (/^[1-8]$/.test(w) && lastSpokenWord.current === 'rank') {
      setNeonRank(w);
      clearTimeout(neonTimer.current);
      neonTimer.current = setTimeout(() => setNeonRank(null), 2000);
      lastSpokenWord.current = w;
      return;
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
    // Test accounts: speak voice BUT also set voiceFinished immediately
    // so they can click through without waiting for narration to finish
    if (isTest) { setVoiceFinished(true); }
    if (!voiceOn) {
      const ms = Math.max(2000, targetStep.voice.length * 75);
      clearTimeout(voiceFinishTimer.current);
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), ms);
      return;
    }
    const text = fill(targetStep.voice, childName);
    currentVoiceText.current = text;
    pauseCharPos.current = 0;
    pausedRemainingText.current = text;
    setCurrentNarration(text);
    setVoiceFinished(false);
    setIsPlaying(false);
    setIsPaused(false);
    applyNeon(text);
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
        const noHighlight = ['independent-squares','speed-round'].includes(targetStep?.taskType);
        if (!noHighlight) applyNeonWord(word);
      },
    });
  }

  // Keep ref always pointing to latest speakStep
  speakStepRef.current = speakStep;

  function clearNeon() { setNeonFile(null); setNeonRank(null); setNeonSqs([]); setGlowPieces([]); }

  // Reset on step change
  useEffect(() => {
    voiceRef.current = false;
    setClicked([]); setWrongSqs([]); setFeedback(''); setFbType('info');
    setSpeed(null); setIndepIdx(0); clearNeon();
    setRecapAnswer(null); setRecapFeedbackDone(false);
    clearTimeout(voiceFinishTimer.current);
    setVoiceFinished(isTest); // test accounts: always unlocked

    if (step?.highlightFile) setNeonFile(step.highlightFile);
    if (step?.highlightRank) setNeonRank(String(step.highlightRank));
    if (step?.highlights?.length) setNeonSqs(step.highlights);

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

    // Compute board FEN for this step
    if (step?.taskType === 'notation-demo') {
      // Keep the PREVIOUS position briefly so player can see
      // where the piece starts before it slides to the new square.
      // The animation fires ~800ms after voice begins.
      const prevFen = boardFen;
      const demoTimer = setTimeout(() => {
        setBoardFen(step.demoFen || 'start');
      }, 800);
      return () => clearTimeout(demoTimer);
    } else if (step?.taskType === 'notation-build') {
      setBoardFen(step.fromFen || 'start');
    } else if (step?.taskType === 'write-notation') {
      setBoardFen(step.beforeFen || 'start');
    } else if (step?.taskType === 'piece-letter-quiz') {
      setBoardFen('start');
    } else if (step?.taskType === 'notation-puzzle-setup') {
      setBoardFen('empty-custom');
      setPlacedPieces({});
      const shuffled = [...(step.targetPieces || [])].sort(() => Math.random() - 0.5);
      setPieceTrayOrder(shuffled);
    } else if (step?.taskType === 'notation-puzzle-move') {
      setBoardFen(step.puzzleFen || 'start');
    } else if (step?.taskType === 'piece-range') {
      setBoardFen(step.pieceRangeFen || 'start');
    } else if (step?.boardState === 'start') {
      setBoardFen('start');
    } else if (step?.boardState === 'empty') {
      setBoardFen('empty-custom');
    } else if (step?.boardState && step.boardState !== 'custom' && step.boardState !== 'start' && step.boardState !== 'empty') {
      // Literal FEN string — animate the transition with a brief delay
      const t = setTimeout(() => setBoardFen(step.boardState), 200);
      return () => clearTimeout(t);
    }
  }, [phaseIdx, stepIdx]);

  // Auto-play voice — fires on step change.
  // If nextStep() already called speakStep() within the click gesture,
  // voiceRef.current will be true and we skip to avoid double-speak.
  useEffect(() => {
    if (!classStarted) return;
    if (isTest) setVoiceFinished(true); // test accounts can click through immediately
    if (voiceRef.current) return; // already handled by nextStep/handleStartClass
    if (!step?.voice) { setVoiceFinished(true); return; }
    speakStepRef.current(step);
    voiceRef.current = true;
  }, [phaseIdx, stepIdx, voiceOn, isTest, classStarted]);

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
    // Navigate to next step
    if (npi !== phaseIdx) { setPhaseIdx(npi); setStepIdx(0); }
    else { setStepIdx(nsi); }
    // Speak the next step's voice directly within this gesture
    const nextPhase = phases[npi];
    const nextStepData = (nextPhase?.steps || [])[nsi];
    voiceRef.current = true;
    speakStepRef.current(nextStepData);
  }, [stepIdx, steps, phaseIdx, phases, childName, voiceOn, isTest]);

  function showFb(msg, type, voice = '', afterVoice = null) {
    setFeedback(fill(msg, childName)); setFbType(type);
    if (voice && voiceOn) {
      const vt = fill(voice, childName); applyNeon(vt);
      let done = false;
      const fire = () => { if (done) return; done = true; afterVoice?.(); };
      speakElevenLabs(vt, {
        onStart: () => setIsPlaying(true),
        onEnd: () => { setIsPlaying(false); fire(); },
        onError: () => { setIsPlaying(false); fire(); },
        onBlocked: () => fire(),
      });
      // Safety net if onEnd never fires
      if (afterVoice) {
        const fallbackMs = Math.max(1800, vt.length * 110) + 1500;
        setTimeout(fire, fallbackMs);
      }
    } else if (afterVoice) {
      // No voice for this feedback — short pause is enough
      setTimeout(afterVoice, 1500);
    }
  }

  function handlePieceDrop(sourceSquare, targetSquare, piece) {
    unlockAudio();
    if (!step) return false;
    const tt = step.taskType;

    if ((tt === 'notation-build' || tt === 'notation-puzzle-move') && !moveDone) {
      if (sourceSquare !== step.moveFrom) {
        showFb('That is not the piece Ms. Momo described - look again!', 'error');
        return false;
      }
      const game = new Chess();
      if (boardFen !== 'start' && boardFen !== 'empty-custom') game.load(boardFen);

      if (targetSquare === step.moveTo) {
        const result = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
        if (result) {
          setBoardFen(game.fen());
          setMoveDone(true);
          setSelectedSq(null);
          setNeonSqs([]);
          setScore(s => s + 1); setTotal(t => t + 1); setStreak(s => s + 1);
          const notation = step.correctNotation || result.san;
          showFb(`${notation} - ${step.successVoice ? '' : 'Correct!'}`.trim(), 'success', step.successVoice, nextStep);
          return true;
        }
        return false;
      } else {
        setWrongSqs([targetSquare]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb(step.wrongVoice || 'Not quite - try again!', 'error', step.wrongVoice);
        return false;
      }
    }

    return false; // not a draggable taskType — snap back
  }

  function handleSquareClickArgs(square) {
    unlockAudio();
    const sq = square;
    if (!step) return;
    // Block interaction until Ms. Momo has finished her instructions
    if (!voiceFinished && !isTest) return;
    const tt = step.taskType;

    if (tt === 'click-file' || tt === 'click-rank' || tt === 'piece-range') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq]; setClicked(nc); setStreak(s => s + 1);
        if (nc.length === step.targetSquares.length) {
          setScore(s => s + nc.length); setTotal(t => t + nc.length); setTargetSqs([]);
          showFb(step.successVoice || 'Complete!', 'success', step.successVoice, nextStep);
        } else showFb(`${nc.length} of ${step.targetSquares.length} found!`, 'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        const msg = tt === 'piece-range'
          ? `That square is not reachable - try one of the glowing squares!`
          : `That square is not in this ${tt === 'click-file' ? 'file' : 'rank'} - try the glowing one!`;
        showFb(msg, 'error');
      }
      return;
    }

    if (tt === 'click-square') {
      setTotal(t => t + 1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s => s + 1); setStreak(s => s + 1); setTargetSqs([]);
        showFb(step.successVoice || 'Correct!', 'success', step.successVoice, nextStep);
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        showFb(step.wrongVoice || 'Not quite - try again!', 'error', step.wrongVoice);
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
            const vm2 = fill((step.successVoice || 'Done!').replace('{score}', finalScore), childName);
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
              showFb(vm2, 'success', vm2, nextStep);
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
          showFb(`${notation} - ${step.successVoice ? '' : 'Correct!'}`.trim(), 'success', step.successVoice, nextStep);
        }
      } else {
        setSelectedSq(null); setNeonSqs([]);
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb(step.wrongVoice || 'Not quite - try again!', 'error', step.wrongVoice);
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
          showFb(step.successVoice || 'Setup complete!', 'success', step.successVoice, nextStep);
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
    const tgts = roundStep?.targetSquares || [];
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
    showFb(vm, hits >= tgt ? 'success' : 'hint', vm, nextStep);
  }

  function handlePieceLetterAnswer(answer) {
    unlockAudio();
    if (pieceQuizAnswer !== null) return;
    const items = step.quizItems || [];
    const curr = items[pieceQuizIdx];
    if (!curr) return;
    setPieceQuizAnswer(answer);
    setTotal(t => t + 1);
    const correctValue = curr.correctLetter !== undefined ? curr.correctLetter : curr.pieceName;
    const correct = answer === correctValue;
    const ni = pieceQuizIdx + 1;

    const advance = () => {
      if (ni >= items.length) {
        showFb(fill(step.successVoice || 'Done!', childName), 'success', step.successVoice, nextStep);
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
      showFb(`${step.correctNotation} is correct!`, 'success', step.successVoice, nextStep);
    } else {
      setStreak(0);
      showFb(`Not quite - the correct notation was ${step.correctNotation}.`, 'error', step.wrongVoice, nextStep);
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
          const vm2 = fill((step.successVoice || 'Done!').replace('{score}', score + 1), childName);
          showFb(vm2, 'success', vm2, nextStep);
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
        showFb(vm, 'success', vm, nextStep);
      } else {
        showFb(vm, 'success', vm, () => {
          setFileQS({ active: true, remaining: rem.slice(1), current: rem[0] }); setNeonFile(rem[0]);
          showFb('Which file is this?', 'hint');
        });
      }
    } else {
      setStreak(0);
      const vm = `Not quite! That is file ${curr}!`;
      showFb(vm, 'error', vm);
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
    // Clear any pending/blocked audio from previous step
    // Don't call unlockAudio() - it might replay old speech and consume the gesture
    pendingAudioClear();
    if (step?.taskType === 'complete') {
      setLessonDone(true);
      confetti({ particleCount: 160, spread: 100 });
      setTimeout(() => onComplete?.(), 1500);
      return;
    }
    nextStep();
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

  // Responsive board width
  const boardWrapRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(560);
  useEffect(() => {
    const el = boardWrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = Math.floor(el.offsetWidth);
      const h = Math.floor(el.offsetHeight);
      // Board must be a square — use the smaller of width and height
      setBoardWidth(Math.min(w, h));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  const squareStyles = buildSquareStyles({
    neonFile, neonRank, neonSquares: boardNeonSqs, clicked, wrong: wrongSqs, targets: targetSqs,
    colourQuizSq: step?.taskType === 'colour-quiz' && quizState?.active ? step.quizSquares?.[quizIdx]?.sq : null,
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
    return (
      <div className="cl-done">
        <div className="cl-done-card">
          <Award size={56} className="cl-done-icon" />
          <h2>Lesson 1 complete!</h2>
          <p className="cl-done-sub">The board, the squares, and the chess army</p>
          <p className="cl-done-msg">
            Outstanding work {childName}! You know every square on the chess board, and you can recognise all six chess pieces. You are ready for Lesson 2 — the language of chess!
          </p>
          <div className="cl-done-score">
            <span className="cl-done-n">{score}</span>
            <span className="cl-done-l">correct answers</span>
          </div>
        </div>
      </div>
    );
  }

  const pct = Math.round((phaseIdx / phases.length) * 100);
  const contLabel = step?.taskType === 'speed-intro' ? 'Start speed challenge!' : step?.continueLabel || 'Continue';
  const totalSecs = (lesson.totalMinutes || 55) * 60;
  const remainSecs = Math.max(0, totalSecs - elapsedSecs);
  const timerMins = Math.floor(remainSecs / 60);
  const timerSecs = remainSecs % 60;
  const timerStr = `${timerMins}:${String(timerSecs).padStart(2,'0')}`;
  const timerWarning = remainSecs < 300; // red when under 5 min

  return (
    <div className="cl-root">

      {audioBlocked && !isTest && (
        <div className="cl-audio-overlay" onClick={handleAudioOverlayTap}>
          <div className="cl-audio-overlay-card">
            <Volume2 size={32} />
            <p>Tap anywhere to start Ms. Momo's voice</p>
          </div>
        </div>
      )}

      {/* Scope banner */}
      <div className="cl-banner">
        <div>
          <div className="cl-banner-tags">
            <span className="cl-pill">Talent School Interactive Chess</span>
            <span className="cl-banner-month">{lesson.subtitle}</span>
          </div>
          <h2 className="cl-banner-title">{lesson.title}</h2>
        </div>
        <div className="cl-banner-right">
          <div className={`cl-timer ${timerWarning ? 'cl-timer-warn' : ''}`}>
            <Clock size={13} />
            <span>{timerStr}</span>
          </div>
          <div className="cl-progress">
            <div className="cl-progress-track"><div className="cl-progress-fill" style={{ width: `${pct}%` }} /></div>
            <span className="cl-progress-label">{phase?.title} · {pct}%</span>
          </div>
        </div>
      </div>

      <div className="cl-grid">

        {/* COLUMN 1 — Compact tutor */}
        <div className="cl-tutor">
          <div className="cl-tutor-card">
            <div className="cl-tutor-head">
              <div className="cl-tutor-avatar">MM</div>
              <div>
                <div className="cl-tutor-name-row">
                  <span className="cl-tutor-name">Ms. Momo</span>
                  <span className="cl-tutor-role">Chess tutor</span>
                </div>
                <h4 className="cl-step-title">{phase?.title}</h4>
                <span className="cl-step-duration">{phase?.durationMins} minutes</span>
              </div>
            </div>

            <div className="cl-dialogue">
              <span className="cl-listen-label">
                {isPlaying ? 'Ms. Momo is speaking...' : 'Listen to Ms. Momo'}
              </span>
              <p className="cl-dialogue-text">"{currentNarration || fill(step?.voice || '', childName)}"</p>

              <div className="cl-dialogue-actions">
                <button
                  className="cl-voice-btn"
                  onClick={() => {
                    unlockAudio();
                    const n = !voiceOn; setVoiceOn(n);
                    if (!n) { stopSpeech(); setIsPlaying(false); setIsPaused(false); }
                    else handleRepeat();
                  }}
                >
                  <Volume2 size={14} /> {voiceOn ? 'Voice on' : 'Voice off'}
                </button>
                {voiceOn && (isPlaying || isPaused) && (
                  <button className="cl-pause-btn" onClick={handlePauseResume} title={isPaused ? 'Resume Ms. Momo' : 'Pause Ms. Momo'}>
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                )}
                {voiceOn && (
                  <button className="cl-repeat-btn" onClick={handleRepeat} title="Repeat from beginning">
                    <RotateCcw size={13} /> Repeat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 — Board */}
        <div className="cl-board-col">
          <div className="cl-board-frame" ref={boardWrapRef}>
            <div className="cl-board-inner" style={{position:'relative'}}>
              <Chessboard
                id="tso-chess-lesson"
                position={resolveBoardPosition(boardFen, placedPieces)}
                boardWidth={Math.max(200, boardWidth - 32)}
                showAnimations={true}
                animationDuration={500}
                showBoardNotation={true}
                arePiecesDraggable={['notation-build', 'notation-puzzle-move'].includes(step?.taskType) && !moveDone}
                onPieceDrop={handlePieceDrop}
                customSquareStyles={squareStyles}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                onSquareClick={handleSquareClickArgs}
                customSquareRenderer={(() => {
                  // Show square name label ONLY on highlighted teaching squares
                  // (guided examples during instruction — NOT during tests/quizzes)
                  const isTeaching = ['click-square','observe'].includes(step?.taskType);
                  const labelSqs = isTeaching ? (neonSqs || []) : [];
                  if (!labelSqs.length) return undefined;
                  return ({ square, squareColor, children }) => (
                    <div style={{position:'relative', width:'100%', height:'100%'}}>
                      {children}
                      {labelSqs.includes(square) && (
                        <div style={{
                          position:'absolute', bottom:2, right:3,
                          fontSize: Math.max(9, (boardWidth - 56) / 8 * 0.28) + 'px',
                          fontWeight:900, color:'#fff',
                          textShadow:'0 1px 3px rgba(0,0,0,0.9)',
                          pointerEvents:'none', lineHeight:1,
                          fontFamily:'var(--font-main)',
                        }}>
                          {square.toUpperCase()}
                        </div>
                      )}
                    </div>
                  );
                })()}
              />
              {/* Start Class button — shows until student clicks it */}
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
        </div>

        {/* COLUMN 3 — Exercise / practice engine */}
        <div className="cl-exercise">

          {/* Task card */}
          {step?.task && (
            <div className="cl-task-card">
              <div className="cl-task-lbl">Your task</div>
              <div className="cl-task-txt">{step.task}</div>
            </div>
          )}

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
              <button className="cl-light-btn" onClick={() => handleLightDark('light')}>Light square</button>
              <button className="cl-dark-btn" onClick={() => handleLightDark('dark')}>Dark square</button>
            </div>
          )}

          {/* File quiz */}
          {fileQS?.active && (
            <div className="cl-file-grid">
              {FILES.map(f => (
                <button key={f} className="cl-file-btn" onClick={() => handleFileAnswer(f)}>{f.toUpperCase()}</button>
              ))}
            </div>
          )}

          {/* Recap quiz */}
          {step?.taskType === 'recap-quiz' && voiceFinished && (
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
                    <button key={i} className={cls} onClick={() => handleRecapAnswer(i)} disabled={recapAnswer !== null}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Piece letter quiz / piece spot quiz */}
          {['piece-letter-quiz', 'piece-spot-quiz'].includes(step?.taskType) && voiceFinished && step.quizItems?.[pieceQuizIdx] && (
            <div className="cl-recap">
              <div className="cl-recap-q">
                Item {pieceQuizIdx + 1} of {step.quizItems.length} — {step.taskType === 'piece-spot-quiz' ? 'which piece is highlighted?' : "what is this piece's letter?"}
              </div>
              <div className="cl-recap-opts">
                {step.quizItems[pieceQuizIdx].options.map((opt, i) => {
                  const curr = step.quizItems[pieceQuizIdx];
                  const correctValue = curr.correctLetter !== undefined ? curr.correctLetter : curr.pieceName;
                  let cls = 'cl-recap-opt';
                  if (pieceQuizAnswer !== null) {
                    if (opt === correctValue) cls += ' cl-recap-correct';
                    else if (opt === pieceQuizAnswer) cls += ' cl-recap-wrong';
                  }
                  return (
                    <button key={i} className={cls} onClick={() => handlePieceLetterAnswer(opt)} disabled={pieceQuizAnswer !== null}>
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

          {/* Speed round */}
          {speedState?.active && (
            <div className="cl-speed">
              <div className="cl-speed-find">Find this square:</div>
              <div className="cl-speed-sq">{speedState.currentTarget?.toUpperCase()}</div>
              <div className="cl-speed-track"><div className="cl-speed-fill" style={{ width: `${(speedState.timeLeft / speedState.totalTime) * 100}%` }} /></div>
              <div className="cl-speed-meta"><span>{speedState.timeLeft}s left</span><span>{speedState.hits} correct</span></div>
            </div>
          )}

          {/* Continue */}
          {(() => {
            const selfAdvancing = ['notation-build', 'notation-puzzle-move', 'notation-puzzle-setup', 'piece-letter-quiz', 'piece-spot-quiz', 'write-notation', 'independent-squares', 'click-square', 'click-file', 'click-rank', 'piece-range'].includes(step?.taskType);
            if (speedState?.active || quizState?.active || fileQS?.active) return null;
            if (selfAdvancing) return null;
            if (step?.taskType === 'recap-quiz' && voiceFinished && recapAnswer === null) return null;

            const narrationLed = ['observe', 'speed-intro', 'complete', 'notation-demo'].includes(step?.taskType);
            const isRecap = step?.taskType === 'recap-quiz';
            const locked = (narrationLed && !voiceFinished && !isTest)
              || (isRecap && !isTest && (!voiceFinished || recapAnswer === null || !recapFeedbackDone));
            return (
              <button className="cl-continue" onClick={handleContinue} disabled={locked}>
                {locked ? (
                  <>{!voiceFinished ? 'Listen to Ms. Momo first...' : recapAnswer === null ? 'Answer the question first...' : 'Listen to Ms. Momo...'}</>
                ) : (
                  <>{contLabel} <ChevronRight size={16} /></>
                )}
              </button>
            );
          })()}

        </div>

      </div>
    </div>
  );
}
