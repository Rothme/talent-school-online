/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Swords, Award, Clock, RotateCcw } from 'lucide-react';
import { Chess } from 'chess.js';
import { LESSON_1 } from '../../data/chessLesson1';
import { LESSON_2 } from '../../data/chessLesson2';
import { speakElevenLabs, stopSpeech, parseHighlights, unlockAudio } from '../../utils/elevenlabs';
import './ChessLessonView.css';

const FILES = ['a','b','c','d','e','f','g','h'];

function fill(text, name) {
  return (text || '').replace(/\{name\}/g, name);
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
  return boardFen || {};
}

// ─────────────────────────────────────────────────────
// Build square style overrides for neon highlights
// ─────────────────────────────────────────────────────
function buildSquareStyles({ neonFile, neonRank, neonSquares, clicked, wrong, targets }) {
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
  const [voiceFinished, setVoiceFinished] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
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

  // Repeat — replay current step's voice narration
  const currentVoiceText = useRef('');
  function handleRepeat() {
    unlockAudio();
    if (!voiceOn || !currentVoiceText.current) return;
    stopSpeech();
    speakElevenLabs(currentVoiceText.current, {
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
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

    if (['click-file', 'click-rank', 'click-square', 'piece-range'].includes(step?.taskType))
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
      setBoardFen(step.demoFen || 'start');
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
    }
  }, [phaseIdx, stepIdx]);

  // Auto-play voice
  useEffect(() => {
    if (isTest) return; // test accounts: gate already open
    if (!step?.voice) { setVoiceFinished(true); return; }

    if (!voiceOn) {
      // Voice disabled — use a reading-time fallback (~13 chars/sec, no cap)
      const ms = Math.max(2000, step.voice.length * 75);
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), ms);
      return () => clearTimeout(voiceFinishTimer.current);
    }

    if (voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice, childName);
    currentVoiceText.current = text;
    const t = setTimeout(() => {
      applyNeon(text);
      unlockAudio(); // unlock inside the timeout so gesture is still "fresh"
      const fallbackMs = Math.max(6000, text.length * 110) + 5000;
      voiceFinishTimer.current = setTimeout(() => setVoiceFinished(true), fallbackMs);
      speakElevenLabs(text, {
        onStart: () => { setIsPlaying(true); setAudioBlocked(false); },
        onEnd: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onError: () => { setIsPlaying(false); clearTimeout(voiceFinishTimer.current); setVoiceFinished(true); },
        onBlocked: () => {
          clearTimeout(voiceFinishTimer.current);
          setAudioBlocked(true);
        },
      });
    }, 300);
    return () => { clearTimeout(t); clearTimeout(voiceFinishTimer.current); };
  }, [phaseIdx, stepIdx, voiceOn, isTest]);

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

  const nextStep = useCallback(() => {
    stopSpeech(); clearNeon();
    const nsi = stepIdx + 1;
    if (nsi < steps.length) { setStepIdx(nsi); return; }
    const npi = phaseIdx + 1;
    if (npi < phases.length) { setPhaseIdx(npi); setStepIdx(0); return; }
    setLessonDone(true);
    confetti({ particleCount: 160, spread: 100 });
    speakElevenLabs(`Congratulations ${childName}! You have completed your first chess lesson! You are amazing!`);
    setTimeout(() => onComplete?.(), 4000);
  }, [stepIdx, steps.length, phaseIdx, phases.length, childName]);

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
          showFb(vm, 'success', vm, () => {
            const vm2 = fill((step.successVoice || 'Done!').replace('{score}', score + 1), childName);
            showFb(vm2, 'success', vm2, nextStep);
          });
        } else {
          showFb(vm, 'success', vm, () => {
            setIndepIdx(ni);
            setNeonSqs([tgts[ni]]);
            showFb(`Now find: ${tgts[ni].toUpperCase()}`, 'hint', `Now find ${tgts[ni]}`);
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
          setNeonSqs([next]);
          showFb(`${sq.toUpperCase()} correct - find ${next.toUpperCase()}!`, 'success');
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
    setNeonSqs([tgts[0]]);
    showFb(`Find ${tgts[0].toUpperCase()}!`, 'hint');
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
    unlockAudio();
    if (step?.taskType === 'speed-intro') { nextStep(); return; }
    if (step?.taskType === 'complete') { setLessonDone(true); confetti({ particleCount: 160, spread: 100 }); setTimeout(() => onComplete?.(), 1500); return; }
    nextStep();
  }

  const boardNeonSqs = [
    ...neonSqs,
    ...(step?.taskType === 'independent-squares' ? [step.targetSquares?.[indepIdx]].filter(Boolean) : []),
    ...(step?.taskType === 'colour-quiz' && quizState?.active ? [step.quizSquares?.[quizIdx]?.sq].filter(Boolean) : []),
    ...(step?.taskType === 'speed-round' && speedState?.active ? [speedState.currentTarget].filter(Boolean) : []),
    ...(['piece-letter-quiz', 'piece-spot-quiz'].includes(step?.taskType) ? [step.quizItems?.[pieceQuizIdx]?.square].filter(Boolean) : []),
  ];

  // Responsive board width
  const boardWrapRef = useRef(null);
  const [boardWidth, setBoardWidth] = useState(560);
  useEffect(() => {
    function measure() {
      if (boardWrapRef.current) {
        setBoardWidth(Math.floor(boardWrapRef.current.offsetWidth));
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const squareStyles = buildSquareStyles({
    neonFile, neonRank, neonSquares: boardNeonSqs, clicked, wrong: wrongSqs, targets: targetSqs,
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
              <p className="cl-dialogue-text">"{fill(step?.voice || '', childName)}"</p>

              <div className="cl-dialogue-actions">
                <button
                  className="cl-voice-btn"
                  onClick={() => {
                    unlockAudio();
                    const n = !voiceOn; setVoiceOn(n);
                    if (!n) stopSpeech();
                    else if (step?.voice) {
                      const t = fill(step.voice, childName); applyNeon(t);
                      speakElevenLabs(t, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
                    }
                  }}
                >
                  <Volume2 size={14} /> {voiceOn ? 'Voice on' : 'Voice off'}
                </button>
                {voiceOn && (
                  <button className="cl-repeat-btn" onClick={handleRepeat} title="Repeat Ms. Momo">
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
            <div className="cl-board-inner">
              <Chessboard
                id="tso-chess-lesson"
                position={resolveBoardPosition(boardFen, placedPieces)}
                boardWidth={Math.max(240, boardWidth - 28)}
                showAnimations={true}
                animationDuration={300}
                showBoardNotation={true}
                arePiecesDraggable={['notation-build', 'notation-puzzle-move'].includes(step?.taskType) && !moveDone}
                onPieceDrop={handlePieceDrop}
                customSquareStyles={squareStyles}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                onSquareClick={handleSquareClickArgs}
              />
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
