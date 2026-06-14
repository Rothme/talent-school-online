/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import confetti from 'canvas-confetti';
import { Volume2, ChevronRight, ChevronLeft, CheckCircle2, BookOpen, Swords, Award } from 'lucide-react';
import { LESSON_1 } from '../../data/chessLesson1';
import { speakElevenLabs, stopSpeech, parseHighlights, unlockAudio } from '../../utils/elevenlabs';
import './ChessLessonView.css';

const FILES = ['a','b','c','d','e','f','g','h'];

function fill(text, name) {
  return (text || '').replace(/\{name\}/g, name);
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
export default function ChessLessonView({ childName = 'Student', onComplete }) {
  const lesson = LESSON_1;
  const phases = lesson.phases;

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [voiceOn, setVoiceOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

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
  const [lessonDone, setLessonDone] = useState(false);

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

    if (step?.highlightFile) setNeonFile(step.highlightFile);
    if (step?.highlightRank) setNeonRank(String(step.highlightRank));
    if (step?.highlights?.length) setNeonSqs(step.highlights);

    if (['click-file', 'click-rank', 'click-square'].includes(step?.taskType))
      setTargetSqs(step.targetSquares || []);
    else setTargetSqs([]);

    if (step?.taskType === 'colour-quiz') {
      setQuizState({ active: true }); setQuizIdx(0);
      const f = step.quizSquares?.[0]?.sq; if (f) setNeonSqs([f]);
    } else setQuizState(null);

    if (step?.taskType === 'file-name-quiz') startFileQuiz();
    else setFileQS(null);
  }, [phaseIdx, stepIdx]);

  // Auto-play voice
  useEffect(() => {
    if (!voiceOn || !step?.voice || voiceRef.current) return;
    voiceRef.current = true;
    const text = fill(step.voice, childName);
    const t = setTimeout(() => {
      applyNeon(text);
      speakElevenLabs(text, {
        onStart: () => setIsPlaying(true),
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    }, 400);
    return () => clearTimeout(t);
  }, [phaseIdx, stepIdx, voiceOn]);

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

  function showFb(msg, type, voice = '') {
    setFeedback(fill(msg, childName)); setFbType(type);
    if (voice && voiceOn) {
      const vt = fill(voice, childName); applyNeon(vt);
      speakElevenLabs(vt, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
    }
  }

  function handleSquareClickArgs(square) {
    unlockAudio();
    const sq = square;
    if (!step) return;
    const tt = step.taskType;

    if (tt === 'click-file' || tt === 'click-rank') {
      if (step.targetSquares?.includes(sq) && !clicked.includes(sq)) {
        const nc = [...clicked, sq]; setClicked(nc); setStreak(s => s + 1);
        if (nc.length === step.targetSquares.length) {
          setScore(s => s + nc.length); setTotal(t => t + nc.length); setTargetSqs([]);
          showFb(step.successVoice || 'Complete!', 'success', step.successVoice);
          setTimeout(nextStep, 1800);
        } else showFb(`${nc.length} of ${step.targetSquares.length} found!`, 'hint');
      } else if (!step.targetSquares?.includes(sq)) {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 600);
        showFb(`That square is not in this ${tt === 'click-file' ? 'file' : 'rank'} - try the glowing one!`, 'error');
      }
      return;
    }

    if (tt === 'click-square') {
      setTotal(t => t + 1);
      if (step.targetSquares?.includes(sq)) {
        setClicked([sq]); setScore(s => s + 1); setStreak(s => s + 1); setTargetSqs([]);
        showFb(step.successVoice || 'Correct!', 'success', step.successVoice);
        setTimeout(nextStep, 1800);
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
        showFb(vm, 'success');
        if (voiceOn) speakElevenLabs(vm, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
        const ni = indepIdx + 1;
        if (ni >= tgts.length) {
          setTimeout(() => showFb(fill((step.successVoice || 'Done!').replace('{score}', score + 1), childName), 'success'), 500);
          setTimeout(nextStep, 2500);
        } else {
          setIndepIdx(ni);
          setTimeout(() => {
            setNeonSqs([tgts[ni]]);
            showFb(`Now find: ${tgts[ni].toUpperCase()}`, 'hint');
            if (voiceOn) speakElevenLabs(`Now find ${tgts[ni]}`, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
          }, 700);
        }
      } else {
        setWrongSqs([sq]); setStreak(0); setTimeout(() => setWrongSqs([]), 700);
        const vm = fill((step.voiceWrong || `Not quite!`)
          .replace('{sq}', curr.toUpperCase())
          .replace('{file}', curr[0].toUpperCase())
          .replace('{fileNum}', String(curr.charCodeAt(0) - 96))
          .replace('{rank}', curr[1]), childName);
        showFb(vm, 'error');
        if (voiceOn) speakElevenLabs(vm, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
      }
      return;
    }

    if (tt === 'speed-round' && speedState?.active) {
      if (sq === speedState.currentTarget) {
        const nh = speedState.hits + 1;
        setClicked(p => [...p, sq]); setStreak(s => s + 1);
        const rem = speedState.targets.filter(t => !speedState.done.includes(t) && t !== sq);
        if (!rem.length) endSpeed(nh);
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

  function startSpeed() {
    const tgts = step.targetSquares || [];
    setClicked([]); setStreak(0);
    setSpeed({ active: true, targets: tgts, currentTarget: tgts[0], hits: 0, done: [], timeLeft: step.timeLimitSecs || 75, totalTime: step.timeLimitSecs || 75 });
    setNeonSqs([tgts[0]]);
    showFb(`Find ${tgts[0].toUpperCase()}!`, 'hint');
    if (voiceOn) speakElevenLabs(`Go! Find ${tgts[0]}!`, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
    speedRef.current = setInterval(() => {
      setSpeed(p => {
        if (!p) return p;
        const tl = p.timeLeft - 1;
        if (tl <= 0) { clearInterval(speedRef.current); endSpeed(p.hits); return { ...p, timeLeft: 0, active: false }; }
        return { ...p, timeLeft: tl };
      });
    }, 1000);
  }

  function endSpeed(hits) {
    clearInterval(speedRef.current); setSpeed(p => p ? { ...p, active: false } : p); setNeonSqs([]);
    const tgt = step.targetScore || 12; setScore(hits); setTotal((step.targetSquares || []).length);
    if (hits >= tgt) confetti({ particleCount: 100, spread: 70 });
    let vm = hits >= tgt ? step.successVoice : hits >= tgt * 0.7 ? step.goodVoice : step.tryAgainVoice;
    vm = fill((vm || `You scored ${hits}!`).replace('{score}', hits), childName);
    showFb(vm, hits >= tgt ? 'success' : 'hint', vm);
    setTimeout(nextStep, 3200);
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
      showFb(vm, 'success');
      if (voiceOn) speakElevenLabs(vm, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
      const ni = quizIdx + 1;
      if (ni >= qs.length) {
        setQuizState({ active: false });
        const vm2 = fill((step.successVoice || 'Done!').replace('{score}', score + 1), childName);
        setTimeout(() => showFb(vm2, 'success'), 500); setTimeout(nextStep, 2500);
      } else {
        setQuizIdx(ni); setNeonSqs([qs[ni].sq]);
        setTimeout(() => showFb(`Is ${qs[ni].sq.toUpperCase()} light or dark?`, 'hint'), 700);
      }
    } else {
      setStreak(0); setWrongSqs([curr.sq]); setTimeout(() => setWrongSqs([]), 800);
      const vm = (step.voiceWrong || `${curr.sq} is ${curr.colour}!`).replace('{sq}', curr.sq.toUpperCase()).replace('{colour}', curr.colour);
      showFb(vm, 'error');
      if (voiceOn) speakElevenLabs(vm, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
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
      showFb(`Correct! File ${curr.toUpperCase()}!`, 'success');
      if (voiceOn) speakElevenLabs(`Yes! File ${curr}!`, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
      const rem = fileQS.remaining;
      if (!rem.length) { setFileQS({ active: false }); setNeonFile(null); setTimeout(nextStep, 1800); }
      else setTimeout(() => { setFileQS({ active: true, remaining: rem.slice(1), current: rem[0] }); setNeonFile(rem[0]); showFb('Which file is this?', 'hint'); }, 900);
    } else {
      setStreak(0);
      showFb(`Not quite - that was file ${curr.toUpperCase()}!`, 'error');
      if (voiceOn) speakElevenLabs(`Not quite! That is file ${curr}!`, { onStart: () => setIsPlaying(true), onEnd: () => setIsPlaying(false) });
    }
  }

  function handleContinue() {
    unlockAudio();
    if (step?.taskType === 'speed-intro') { startSpeed(); return; }
    if (step?.taskType === 'complete') { setLessonDone(true); confetti({ particleCount: 160, spread: 100 }); setTimeout(() => onComplete?.(), 1500); return; }
    nextStep();
  }

  const boardNeonSqs = [
    ...neonSqs,
    ...(step?.taskType === 'independent-squares' ? [step.targetSquares?.[indepIdx]].filter(Boolean) : []),
    ...(step?.taskType === 'colour-quiz' && quizState?.active ? [step.quizSquares?.[quizIdx]?.sq].filter(Boolean) : []),
    ...(step?.taskType === 'speed-round' && speedState?.active ? [speedState.currentTarget].filter(Boolean) : []),
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

  if (lessonDone) {
    return (
      <div className="cl-done">
        <div className="cl-done-card">
          <Award size={56} className="cl-done-icon" />
          <h2>Lesson 1 complete!</h2>
          <p className="cl-done-sub">The board - files, ranks and squares</p>
          <p className="cl-done-msg">
            Outstanding work {childName}! You know every square on the chess board. You are ready for Lesson 2!
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

  return (
    <div className="cl-root">

      {/* Scope banner */}
      <div className="cl-banner">
        <div>
          <div className="cl-banner-tags">
            <span className="cl-pill">Talent School Interactive Chess</span>
            <span className="cl-banner-month">{lesson.subtitle}</span>
          </div>
          <h2 className="cl-banner-title">{lesson.title}</h2>
        </div>
        <div className="cl-progress">
          <div className="cl-progress-track"><div className="cl-progress-fill" style={{ width: `${pct}%` }} /></div>
          <span className="cl-progress-label">{phase?.title} · {pct}%</span>
        </div>
      </div>

      <div className="cl-grid">

        {/* LEFT — Tutor column */}
        <div className="cl-left">

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
              </div>
            </div>
          </div>

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
          {!speedState?.active && !quizState?.active && !fileQS?.active && (
            <button className="cl-continue" onClick={handleContinue}>
              {contLabel} <ChevronRight size={16} />
            </button>
          )}

        </div>

        {/* RIGHT — Board */}
        <div className="cl-right">
          <div className="cl-board-frame" ref={boardWrapRef}>
            <div className="cl-board-inner">
              <Chessboard
                id="tso-chess-lesson-1"
                position={{}}
                boardWidth={Math.max(240, boardWidth - 28)}
                showAnimations={false}
                showBoardNotation={true}
                arePiecesDraggable={false}
                customSquareStyles={squareStyles}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customDarkSquareStyle={{ backgroundColor: '#b58863' }}
                onSquareClick={handleSquareClickArgs}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
