/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LESSON_1 } from '../../data/chessLesson1';
import './ChessBoardLesson.css';

// ─────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────
const FILES = ['a','b','c','d','e','f','g','h'];
const RANKS = ['8','7','6','5','4','3','2','1'];
const SQ    = 52; // px per square — larger than before

function sqColour(sq) {
  const fileIdx = sq.charCodeAt(0) - 97; // a=0, h=7
  const rankIdx = parseInt(sq[1]) - 1;   // 1=0, 8=7
  return (fileIdx + rankIdx) % 2 === 0 ? 'dark' : 'light';
}

function sqToFileRank(sq) {
  return { file: sq[0], rank: parseInt(sq[1]) };
}

// ─────────────────────────────────────────────────────
// VOICE
// ─────────────────────────────────────────────────────
function speak(text, on, childName = '') {
  if (!on || !text) return;
  try {
    window.speechSynthesis.cancel();
    const filled = text.replace(/\{name\}/g, childName);
    const u = new SpeechSynthesisUtterance(filled);
    u.rate = 0.86; u.pitch = 1.12; u.volume = 1;
    const voices = window.speechSynthesis.getVoices() || [];
    const v = voices.find(v => v.lang.startsWith('en') &&
      /female|zira|samantha|victoria|karen|google.*female/i.test(v.name))
      || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch(e) {}
}

// ─────────────────────────────────────────────────────
// THE CHESS BOARD — large, green, no pieces
// ─────────────────────────────────────────────────────
function BoardGrid({
  highlights = [],
  targetSquares = [],
  clickedSquares = [],
  wrongSquares = [],
  showColours = false,
  onSquareClick,
  flashSquare = null,
  activeFile = null,
  activeRank = null,
}) {
  const size = SQ * 8;

  function getSquareBg(file, rankNum) {
    const sq   = `${file}${rankNum}`;
    const col  = sqColour(sq);
    const isHL = highlights.includes(sq);
    const isTgt = targetSquares.includes(sq);
    const isClicked = clickedSquares.includes(sq);
    const isWrong = wrongSquares.includes(sq);
    const isFlash = flashSquare === sq;
    const inActiveFile = activeFile && file === activeFile;
    const inActiveRank = activeRank && rankNum === parseInt(activeRank);

    if (isFlash)   return '#ff4444';
    if (isWrong)   return 'rgba(226,75,74,0.85)';
    if (isClicked) return 'rgba(29,158,117,0.9)';
    if (isTgt)     return col === 'light' ? '#a8f0c0' : '#2d7a4f';
    if (isHL)      return 'rgba(255,210,0,0.82)';
    if (inActiveFile || inActiveRank) return col === 'light' ? '#c8f0d8' : '#3a6644';
    if (showColours) return col === 'light' ? '#eef6eb' : '#4a7c59';
    return col === 'light' ? '#eef6eb' : '#4a7c59';
  }

  return (
    <div className="bl-board-outer">
      {/* Rank labels left */}
      <div className="bl-rank-labels">
        {RANKS.map((r, i) => (
          <div key={r} className="bl-rank-lbl"
            style={{ height: SQ, color: activeRank === r ? '#5dcaa5' : 'rgba(255,255,255,.45)' }}>
            {r}
          </div>
        ))}
      </div>
      <div className="bl-board-col">
        {/* Board */}
        <div className="bl-board" style={{ width: size, height: size }}>
          {RANKS.map((rankLabel, ri) => {
            const rankNum = 8 - ri;
            return FILES.map((file, fi) => {
              const sq = `${file}${rankNum}`;
              const bg = getSquareBg(file, rankNum);
              const isClicked = clickedSquares.includes(sq);
              const isTgt = targetSquares.includes(sq) && !isClicked;
              return (
                <div
                  key={sq}
                  className={`bl-sq ${isTgt ? 'bl-sq-pulse' : ''}`}
                  style={{
                    left: fi * SQ, top: ri * SQ,
                    width: SQ, height: SQ,
                    background: bg,
                  }}
                  onClick={() => onSquareClick && onSquareClick(sq)}
                >
                  {isClicked && <span className="bl-sq-check">✓</span>}
                  {isTgt && <span className="bl-sq-ring" />}
                </div>
              );
            });
          })}
        </div>
        {/* File labels bottom */}
        <div className="bl-file-labels">
          {FILES.map(f => (
            <div key={f} className="bl-file-lbl"
              style={{ width: SQ, color: activeFile === f ? '#5dcaa5' : 'rgba(255,255,255,.45)' }}>
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────
function ProgressBar({ phaseIdx, phases }) {
  const pct = Math.round(((phaseIdx) / phases.length) * 100);
  const phase = phases[phaseIdx];
  return (
    <div className="bl-progress">
      <div className="bl-progress-track">
        <div className="bl-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bl-progress-lbl">{phase?.title || ''}</span>
      <span className="bl-progress-time">{pct}% complete</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// TUTOR BAR
// ─────────────────────────────────────────────────────
function TutorBar({ text, voiceOn, onToggle, childName }) {
  const display = (text || '').replace(/\{name\}/g, childName);
  return (
    <div className="bl-tutor-bar">
      <div className="bl-tutor-av">🎓</div>
      <div className="bl-tutor-bubble">
        <div className="bl-tutor-name">
          Ms. Momo
          {voiceOn && <span className="bl-voice-pill">🔊 voice on</span>}
        </div>
        <p className="bl-tutor-text">{display}</p>
      </div>
      <button className={`bl-voice-btn ${voiceOn ? 'bl-voice-on' : ''}`} onClick={onToggle}>
        {voiceOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// RIGHT PANEL — task + feedback + score
// ─────────────────────────────────────────────────────
function ResultPanel({
  step, phase, score, total, streak,
  feedback, feedbackType,
  onContinue, continueLabel,
  speedState, onStartSpeed,
  quizState, onLightDark,
  fileQuizState, onFileAnswer,
}) {
  return (
    <div className="bl-result-panel">

      {/* Phase badge */}
      <div className="bl-phase-badge">
        <span className="bl-pb-icon">
          {phase?.type === 'story' ? '📖' :
           phase?.type === 'files' ? '📊' :
           phase?.type === 'ranks' ? '📈' :
           phase?.type === 'squares' ? '🎯' :
           phase?.type === 'colours' ? '🎨' :
           phase?.type === 'speed' ? '⚡' : '✅'}
        </span>
        <span className="bl-pb-title">{phase?.title}</span>
        <span className="bl-pb-time">{phase?.durationMins} mins</span>
      </div>

      {/* Task box */}
      {step?.task && (
        <div className="bl-task-box">
          <div className="bl-task-lbl">Your task</div>
          <div className="bl-task-txt">{step.task}</div>
        </div>
      )}

      {/* Score */}
      {total > 0 && (
        <div className="bl-score-row">
          <div className="bl-score-box">
            <span className="bl-score-num">{score}</span>
            <span className="bl-score-den">/ {total}</span>
          </div>
          {streak > 2 && (
            <div className="bl-streak">🔥 {streak} in a row!</div>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`bl-feedback bl-fb-${feedbackType}`}>
          {feedbackType === 'success' ? '✅ ' : feedbackType === 'error' ? '❌ ' : 'ℹ️ '}
          {feedback}
        </div>
      )}

      {/* Light / Dark quiz buttons */}
      {quizState?.active && (
        <div className="bl-colour-btns">
          <button className="bl-light-btn" onClick={() => onLightDark('light')}>
            ☀️ Light Square
          </button>
          <button className="bl-dark-btn" onClick={() => onLightDark('dark')}>
            🌑 Dark Square
          </button>
        </div>
      )}

      {/* File name quiz buttons */}
      {fileQuizState?.active && (
        <div className="bl-file-btns">
          {FILES.map(f => (
            <button key={f} className="bl-file-answer-btn"
              onClick={() => onFileAnswer(f)}>
              File {f.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Speed round display */}
      {speedState?.active && (
        <div className="bl-speed-display">
          <div className="bl-speed-target">
            Find: <strong>{speedState.currentTarget}</strong>
          </div>
          <div className="bl-speed-bar">
            <div className="bl-speed-fill"
              style={{ width: `${(speedState.timeLeft / speedState.totalTime) * 100}%` }} />
          </div>
          <div className="bl-speed-stats">
            <span>⏱ {speedState.timeLeft}s</span>
            <span>✓ {speedState.hits} correct</span>
          </div>
        </div>
      )}

      {/* Continue / Start button */}
      {!speedState?.active && !quizState?.active && !fileQuizState?.active && (
        <button className="bl-continue-btn" onClick={onContinue}>
          {continueLabel || 'Continue →'}
        </button>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN ChessBoardLesson
// ─────────────────────────────────────────────────────
export default function ChessBoardLesson({ childName = 'Student', onComplete }) {
  const lesson = LESSON_1;
  const phases = lesson.phases;

  // ── State ──────────────────────────────────────────
  const [phaseIdx,    setPhaseIdx]    = useState(0);
  const [stepIdx,     setStepIdx]     = useState(0);
  const [voiceOn,     setVoiceOn]     = useState(true);
  const [clicked,     setClicked]     = useState([]); // squares clicked this step
  const [wrongSqs,    setWrongSqs]    = useState([]);
  const [flashSq,     setFlashSq]     = useState(null);
  const [score,       setScore]       = useState(0);
  const [total,       setTotal]       = useState(0);
  const [streak,      setStreak]      = useState(0);
  const [feedback,    setFeedback]    = useState('');
  const [fbType,      setFbType]      = useState('info');
  const [lessonDone,  setLessonDone]  = useState(false);

  // Speed round state
  const [speedState,  setSpeedState]  = useState(null);
  const speedRef = useRef(null);

  // Colour quiz state
  const [quizState,   setQuizState]   = useState(null);
  const [quizIdx,     setQuizIdx]     = useState(0);

  // File quiz state
  const [fileQuizState, setFileQuizState] = useState(null);
  const [fileQuizIdx,   setFileQuizIdx]   = useState(0);
  const [fileQuizFile,  setFileQuizFile]  = useState(null);

  // Independent squares state
  const [indepIdx,    setIndepIdx]    = useState(0);

  const voiceRef = useRef(false);

  const phase = phases[phaseIdx];
  const steps = phase?.steps || [];
  const step  = steps[stepIdx];

  // ── Auto voice ─────────────────────────────────────
  useEffect(() => {
    voiceRef.current = false;
    setClicked([]);
    setWrongSqs([]);
    setFlashSq(null);
    setFeedback('');
    setFbType('info');
    setSpeedState(null);
    setQuizState(null);
    setFileQuizState(null);
    setQuizIdx(0);
    setFileQuizIdx(0);
    setIndepIdx(0);

    if (step?.taskType === 'colour-quiz') {
      setQuizState({ active: true });
      setQuizIdx(0);
    }
    if (step?.taskType === 'file-name-quiz') {
      startFileQuiz();
    }
  }, [phaseIdx, stepIdx]);

  useEffect(() => {
    if (voiceOn && step?.voice && !voiceRef.current) {
      voiceRef.current = true;
      const t = setTimeout(() => speak(step.voice, true, childName), 500);
      return () => clearTimeout(t);
    }
  }, [phaseIdx, stepIdx, voiceOn]);

  // ── Advance ────────────────────────────────────────
  function nextStep() {
    const nextSI = stepIdx + 1;
    if (nextSI < steps.length) {
      setStepIdx(nextSI);
    } else {
      const nextPI = phaseIdx + 1;
      if (nextPI < phases.length) {
        setPhaseIdx(nextPI);
        setStepIdx(0);
      } else {
        setLessonDone(true);
        speak(`Congratulations ${childName}! You have completed your very first chess lesson! You know the entire board! See you next time!`, true, '');
        setTimeout(() => onComplete?.(), 3000);
      }
    }
  }

  function showFeedback(msg, type, voice = '') {
    setFeedback(msg.replace(/\{name\}/g, childName));
    setFbType(type);
    if (voice && voiceOn) speak(voice, true, childName);
  }

  // ── Square click handler ───────────────────────────
  function handleSquareClick(sq) {
    if (!step) return;
    const { taskType } = step;

    // Click-file — click all squares in a file
    if (taskType === 'click-file') {
      const targets = step.targetSquares || [];
      if (targets.includes(sq) && !clicked.includes(sq)) {
        const newClicked = [...clicked, sq];
        setClicked(newClicked);
        setStreak(s => s + 1);
        if (newClicked.length === targets.length) {
          setScore(s => s + targets.length);
          setTotal(t => t + targets.length);
          showFeedback(
            (step.successVoice || 'File complete!').replace(/\{name\}/g, childName),
            'success', step.successVoice
          );
          setTimeout(() => nextStep(), 1800);
        } else {
          showFeedback(`✓ Found ${newClicked.length} of ${targets.length} squares`, 'hint');
        }
      } else if (!targets.includes(sq)) {
        setWrongSqs([sq]);
        setStreak(0);
        setTimeout(() => setWrongSqs([]), 600);
        showFeedback('That square is not in this file — look at the glowing column!', 'error');
      }
      return;
    }

    // Click-rank — click all squares in a rank
    if (taskType === 'click-rank') {
      const targets = step.targetSquares || [];
      if (targets.includes(sq) && !clicked.includes(sq)) {
        const newClicked = [...clicked, sq];
        setClicked(newClicked);
        setStreak(s => s + 1);
        if (newClicked.length === targets.length) {
          setScore(s => s + targets.length);
          setTotal(t => t + targets.length);
          showFeedback(
            (step.successVoice || 'Rank complete!').replace(/\{name\}/g, childName),
            'success', step.successVoice
          );
          setTimeout(() => nextStep(), 1800);
        } else {
          showFeedback(`✓ Found ${newClicked.length} of ${targets.length} squares`, 'hint');
        }
      } else if (!targets.includes(sq)) {
        setWrongSqs([sq]);
        setStreak(0);
        setTimeout(() => setWrongSqs([]), 600);
        showFeedback('That square is not in this rank — look at the glowing row!', 'error');
      }
      return;
    }

    // Click single square (guided)
    if (taskType === 'click-square') {
      const targets = step.targetSquares || [];
      if (targets.includes(sq)) {
        setClicked([sq]);
        setScore(s => s + 1);
        setTotal(t => t + 1);
        setStreak(s => s + 1);
        const msg = (step.successVoice || 'Correct!').replace(/\{name\}/g, childName);
        showFeedback(msg, 'success', step.successVoice);
        setTimeout(() => nextStep(), 1800);
      } else {
        setWrongSqs([sq]);
        setStreak(0);
        setTotal(t => t + 1);
        setTimeout(() => setWrongSqs([]), 700);
        const msg = (step.wrongVoice || 'Not quite — try again!').replace(/\{name\}/g, childName);
        showFeedback(msg, 'error');
        if (voiceOn) speak(step.wrongVoice || 'Not quite!', true, childName);
      }
      return;
    }

    // Independent squares
    if (taskType === 'independent-squares') {
      const targets = step.targetSquares || [];
      const current = targets[indepIdx];
      if (!current) return;
      if (sq === current) {
        const newIdx = indepIdx + 1;
        setClicked(prev => [...prev, sq]);
        setScore(s => s + 1);
        setTotal(t => t + 1);
        setStreak(s => s + 1);
        const vm = (step.voiceCorrect?.[indepIdx] || 'Correct!').replace(/\{name\}/g, childName);
        showFeedback(vm, 'success');
        if (voiceOn) speak(vm, true, childName);
        if (newIdx >= targets.length) {
          const sc2 = score + 1;
          const vm2 = (step.successVoice || `${sc2} found!`).replace('{score}', sc2).replace(/\{name\}/g, childName);
          setTimeout(() => { showFeedback(vm2, 'success', step.successVoice); }, 500);
          setTimeout(() => nextStep(), 2500);
        } else {
          setIndepIdx(newIdx);
          const nextSq = targets[newIdx];
          setTimeout(() => {
            showFeedback(`Now find: ${nextSq.toUpperCase()}`, 'hint');
            if (voiceOn) speak(`Now find ${nextSq}`, true, childName);
          }, 600);
        }
      } else {
        setWrongSqs([sq]);
        setStreak(0);
        setTotal(t => t + 1);
        setTimeout(() => setWrongSqs([]), 700);
        const vm = (step.voiceWrong || 'Not quite!')
          .replace('{sq}', current.toUpperCase())
          .replace('{file}', current[0].toUpperCase())
          .replace('{fileNum}', String(current.charCodeAt(0) - 96))
          .replace('{rank}', current[1])
          .replace(/\{name\}/g, childName);
        showFeedback(vm, 'error');
      }
      return;
    }

    // Speed round
    if (taskType === 'speed-round' && speedState?.active) {
      const current = speedState.currentTarget;
      if (sq === current) {
        const newHits = speedState.hits + 1;
        setClicked(prev => [...prev, sq]);
        setStreak(s => s + 1);
        const remaining = speedState.targets.filter(t => t !== current && !speedState.done.includes(t));
        if (remaining.length === 0) {
          endSpeedRound(newHits);
        } else {
          const next = remaining[0];
          setSpeedState(prev => ({ ...prev, hits: newHits, currentTarget: next, done: [...prev.done, current] }));
          showFeedback(`✓ ${sq.toUpperCase()} — now find ${next.toUpperCase()}!`, 'success');
        }
      } else {
        setWrongSqs([sq]);
        setStreak(0);
        setTimeout(() => setWrongSqs([]), 500);
      }
      return;
    }
  }

  // ── Speed round management ─────────────────────────
  function startSpeedRound() {
    const targets = step.targetSquares || [];
    const first   = targets[0];
    setClicked([]);
    setSpeedState({
      active: true,
      targets,
      currentTarget: first,
      hits: 0,
      done: [],
      timeLeft: step.timeLimitSecs || 75,
      totalTime: step.timeLimitSecs || 75,
    });
    showFeedback(`Find: ${first.toUpperCase()}!`, 'hint');
    if (voiceOn) speak(`Go! Find ${first}!`, true, childName);

    speedRef.current = setInterval(() => {
      setSpeedState(prev => {
        if (!prev) return prev;
        const tl = prev.timeLeft - 1;
        if (tl <= 0) {
          clearInterval(speedRef.current);
          endSpeedRound(prev.hits);
          return { ...prev, timeLeft: 0, active: false };
        }
        return { ...prev, timeLeft: tl };
      });
    }, 1000);
  }

  function endSpeedRound(hits) {
    clearInterval(speedRef.current);
    const targetScore = step.targetScore || 12;
    const total15 = (step.targetSquares || []).length;
    setSpeedState(prev => prev ? { ...prev, active: false } : prev);
    setScore(hits);
    setTotal(total15);

    let vm;
    if (hits >= targetScore) vm = step.successVoice || `${hits} correct — amazing!`;
    else if (hits >= targetScore * 0.7) vm = step.goodVoice || `${hits} correct — well done!`;
    else vm = step.tryAgainVoice || `${hits} correct — keep practising!`;
    vm = vm.replace('{score}', hits).replace('{time}', '').replace(/\{name\}/g, childName);
    showFeedback(vm, hits >= targetScore ? 'success' : 'hint', vm);
    setTimeout(() => nextStep(), 3000);
  }

  // ── Colour quiz ────────────────────────────────────
  function handleLightDark(answer) {
    if (!quizState?.active) return;
    const quizSquares = step.quizSquares || [];
    const current     = quizSquares[quizIdx];
    if (!current) return;
    setTotal(t => t + 1);
    if (answer === current.colour) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setClicked(prev => [...prev, current.sq]);
      const vm = (step.voiceCorrect || 'Correct!')
        .replace('{sq}', current.sq.toUpperCase())
        .replace('{colour}', current.colour);
      showFeedback(vm, 'success');
      if (voiceOn) speak(vm, true, childName);
      const next = quizIdx + 1;
      if (next >= quizSquares.length) {
        setQuizState({ active: false });
        const sc2 = score + 1;
        const vm2 = (step.successVoice || `${sc2} correct!`)
          .replace('{score}', sc2).replace(/\{name\}/g, childName);
        setTimeout(() => { showFeedback(vm2, 'success'); if(voiceOn) speak(vm2, true, childName); }, 600);
        setTimeout(() => nextStep(), 2500);
      } else {
        setQuizIdx(next);
        const nxt = quizSquares[next];
        setClicked(prev => [...prev, current.sq]);
        setTimeout(() => {
          if (voiceOn) speak(`Is ${nxt.sq} light or dark?`, true, childName);
          showFeedback(`Now: is ${nxt.sq.toUpperCase()} light or dark?`, 'hint');
        }, 700);
      }
    } else {
      setStreak(0);
      setWrongSqs([current.sq]);
      setTimeout(() => setWrongSqs([]), 800);
      const vm = (step.voiceWrong || `${current.sq} is ${current.colour}!`)
        .replace('{sq}', current.sq.toUpperCase())
        .replace('{colour}', current.colour);
      showFeedback(vm, 'error');
      if (voiceOn) speak(vm, true, childName);
    }
  }

  // ── File quiz ──────────────────────────────────────
  function startFileQuiz() {
    const allFiles = [...FILES];
    const shuffled = allFiles.sort(() => Math.random() - 0.5);
    const chosen   = shuffled.slice(0, 6);
    const first    = chosen[0];
    setFileQuizState({ active: true, remaining: chosen.slice(1), current: first });
    setFileQuizFile(first);
    setFileQuizIdx(0);
  }

  function handleFileAnswer(answer) {
    if (!fileQuizState?.active) return;
    const current = fileQuizState.current;
    setTotal(t => t + 1);
    if (answer === current) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      showFeedback(`Correct! That was file ${current.toUpperCase()}!`, 'success');
      if (voiceOn) speak(`Yes! File ${current}!`, true, childName);
      const remaining = fileQuizState.remaining;
      if (remaining.length === 0) {
        setFileQuizState({ active: false });
        setTimeout(() => { showFeedback('You know all your files!', 'success'); }, 500);
        setTimeout(() => nextStep(), 2000);
      } else {
        const next = remaining[0];
        setTimeout(() => {
          setFileQuizState({ active: true, remaining: remaining.slice(1), current: next });
          setFileQuizFile(next);
          showFeedback(`Which file is highlighted now?`, 'hint');
          if (voiceOn) speak(`Which file is this?`, true, childName);
        }, 800);
      }
    } else {
      setStreak(0);
      showFeedback(`Not quite — that was file ${current.toUpperCase()}, not ${answer.toUpperCase()}!`, 'error');
      if (voiceOn) speak(`Not quite! That was file ${current}!`, true, childName);
    }
  }

  // ── Continue button ────────────────────────────────
  function handleContinue() {
    if (step?.taskType === 'speed-intro') { startSpeedRound(); return; }
    if (step?.taskType === 'complete') { setLessonDone(true); setTimeout(() => onComplete?.(), 1500); return; }
    nextStep();
  }

  // ── Lesson done ────────────────────────────────────
  if (lessonDone) {
    return (
      <div className="bl-done-screen">
        <div className="bl-done-card">
          <div style={{ fontSize:56, marginBottom:14 }}>🏆</div>
          <h2>Lesson 1 Complete!</h2>
          <p className="bl-done-subtitle">The Board — Files, Ranks and Squares</p>
          <p className="bl-done-msg">
            Outstanding work {childName}! You have learned the entire chess board —
            all 64 squares, all 8 files, all 8 ranks, and the light and dark square rule.
            You are ready for Lesson 2!
          </p>
          <div className="bl-done-score">
            <span className="bl-done-score-num">{score}</span>
            <span className="bl-done-score-lbl">squares found correctly</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Determine board display ────────────────────────
  const highlights         = step?.highlights || [];
  const activeFile         = step?.highlightFile || (fileQuizState?.active ? fileQuizState.current : null);
  const activeRank         = step?.highlightRank ? String(step.highlightRank) : null;
  const showColours        = step?.boardState === 'coloured' || step?.type === 'colour-quiz';
  const targetSquaresShow  = step?.taskType === 'independent-squares'
    ? [step.targetSquares?.[indepIdx]].filter(Boolean)
    : step?.taskType === 'colour-quiz' && quizState?.active
    ? [step.quizSquares?.[quizIdx]?.sq].filter(Boolean)
    : step?.taskType === 'speed-round' && speedState?.active
    ? [speedState.currentTarget].filter(Boolean)
    : step?.taskType === 'click-square'
    ? (step.targetSquares || [])
    : [];

  // Continue label
  const contLabel = speedState?.active ? null
    : step?.taskType === 'speed-intro' ? 'START CHALLENGE! →'
    : step?.taskType === 'colour-quiz' && quizState?.active ? null
    : step?.taskType === 'file-name-quiz' && fileQuizState?.active ? null
    : step?.continueLabel || 'Continue →';

  return (
    <div className="bl-root">

      {/* Top bar */}
      <div className="bl-topbar">
        <div className="bl-topbar-left">
          <div className="bl-title">{lesson.title}</div>
          <div className="bl-subtitle">{lesson.subtitle}</div>
        </div>
        <ProgressBar phaseIdx={phaseIdx} phases={phases} />
      </div>

      {/* Main area: board + result panel */}
      <div className="bl-main">

        {/* Large board — takes most of the space */}
        <div className="bl-board-section">
          <BoardGrid
            highlights={highlights}
            targetSquares={targetSquaresShow}
            clickedSquares={clicked}
            wrongSquares={wrongSqs}
            flashSquare={flashSq}
            showColours={showColours}
            activeFile={activeFile}
            activeRank={activeRank}
            onSquareClick={handleSquareClick}
          />
        </div>

        {/* Narrow result panel */}
        <ResultPanel
          step={step}
          phase={phase}
          score={score}
          total={total}
          streak={streak}
          feedback={feedback}
          feedbackType={fbType}
          onContinue={handleContinue}
          continueLabel={contLabel}
          speedState={speedState?.active ? speedState : null}
          onStartSpeed={startSpeedRound}
          quizState={quizState?.active ? quizState : null}
          onLightDark={handleLightDark}
          fileQuizState={fileQuizState?.active ? fileQuizState : null}
          onFileAnswer={handleFileAnswer}
        />
      </div>

      {/* Tutor bar */}
      <TutorBar
        text={step?.voice || ''}
        voiceOn={voiceOn}
        childName={childName}
        onToggle={() => {
          const next = !voiceOn;
          setVoiceOn(next);
          if (!next) { try { window.speechSynthesis.cancel(); } catch(e){} }
          else if (step?.voice) speak(step.voice, true, childName);
        }}
      />
    </div>
  );
}
