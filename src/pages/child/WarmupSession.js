import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionState, saveSessionState, getTodaySchedule } from '../../utils/sessionSchedule';
import './WarmupSession.css';

const WARMUP_TEXTS = [
  'The kingdom of Ile-Ife was the birthplace of the Yoruba people. Great kings ruled the land with wisdom.',
  'A small tortoise lived near a wide river. She had a hard shell and a very fast mind.',
  'Amina of Zaria was a great warrior queen. She built walls around every city she conquered.',
  'The fishermen of Lagos sailed out before dawn. They knew the water like they knew their own names.',
  'Sango was the Yoruba god of thunder and lightning. He rode his horse across the sky with great power.',
];

const WARMUP_SECS = 10 * 60; // 10 minutes

export default function WarmupSession() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [text] = useState(() => WARMUP_TEXTS[Math.floor(Math.random() * WARMUP_TEXTS.length)]);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(WARMUP_SECS);
  const [phase, setPhase] = useState('ready'); // ready | active | complete
  const timerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const session = sessionStorage.getItem('childSession')
      || sessionStorage.getItem('parentPreview');
    if (!session) return navigate('/child/login');
    setChild(JSON.parse(session));
    setSchedule(getTodaySchedule());
  }, [navigate]);

  const finishWarmup = useCallback(() => {
    clearInterval(timerRef.current);
    setPhase('complete');
    if (child) {
      const state = getSessionState(child.id) || {};
      saveSessionState(child.id, {
        ...state,
        warmupComplete: true,
        warmupWpm: wpm,
        warmupAccuracy: accuracy,
        phase: 'main',
      });
    }
  }, [child, wpm, accuracy]);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { finishWarmup(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, finishWarmup]);

  const handleKeyDown = useCallback((e) => {
    if (phase !== 'active') return;
    const key = e.key;
    if (key === 'Backspace') {
      setTyped(t => t.slice(0, -1));
      return;
    }
    if (key.length !== 1) return;
    if (!startTime) setStartTime(Date.now());
    const expected = text[typed.length];
    const newTyped = typed + key;
    setTyped(newTyped);
    if (key !== expected) setErrors(prev => new Set([...prev, typed.length]));
    const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0.001;
    const words = newTyped.trim().split(/\s+/).length;
    setWpm(Math.round(words / Math.max(elapsed, 0.001)));
    const correct = newTyped.split('').filter((ch, i) => ch === text[i]).length;
    setAccuracy(Math.round((correct / newTyped.length) * 100) || 100);
    if (newTyped.length >= text.length) finishWarmup();
  }, [phase, typed, text, startTime, finishWarmup]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function startWarmup() {
    setPhase('active');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function goToMain() {
    navigate('/child/session/main');
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progressPct = ((WARMUP_SECS - timeLeft) / WARMUP_SECS) * 100;

  if (!child || !schedule) return null;

  return (
    <div className="warmup-page" onClick={() => phase === 'active' && inputRef.current?.focus()}>
      <div className="warmup-topbar">
        <div className="warmup-logo"><span className="wu-dot" />Talent School Online</div>
        <div className="warmup-phase-label">⌨️ Typing Warm-up</div>
        {phase === 'active' && (
          <div className="warmup-timer">
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
        )}
      </div>

      <div className="warmup-progress-bar">
        <div className="warmup-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {phase === 'ready' && (
        <div className="warmup-center">
          <div className="warmup-ready-card">
            <div className="warmup-ready-icon">⌨️</div>
            <h2 className="warmup-ready-title">Time to warm up your fingers!</h2>
            <p className="warmup-ready-sub">
              Every session starts with 10 minutes of typing practice.
              Today's main lesson is {schedule.emoji} <strong>
                {schedule.subject === 'chess' ? 'Chess' :
                 schedule.subject === 'coding' ? 'Coding' : 'Typing'}
              </strong> — but first, let's type!
            </p>
            <div className="warmup-stats-row">
              <div className="warmup-stat"><span>⏱</span> 10 minutes</div>
              <div className="warmup-stat"><span>📖</span> Nigerian story passage</div>
              <div className="warmup-stat"><span>🎯</span> Speed + accuracy</div>
            </div>
            <button className="warmup-start-btn" onClick={startWarmup}>
              Start warm-up →
            </button>
          </div>
        </div>
      )}

      {phase === 'active' && (
        <div className="warmup-active">
          <div className="warmup-momo-bar">
            <div className="wu-avatar">🎓</div>
            <div className="wu-speech">
              <div className="wu-name">Ms. Momo</div>
              <div className="wu-text">
                Type the story below. Keep your fingers on the home row —
                A S D F on the left, J K L on the right. Don't look at your hands!
              </div>
            </div>
            <div className="wu-live-stats">
              <div className="wu-stat-item">
                <div className="wu-stat-val">{wpm}</div>
                <div className="wu-stat-lbl">WPM</div>
              </div>
              <div className="wu-stat-item">
                <div className="wu-stat-val">{typed.length > 0 ? accuracy : 100}%</div>
                <div className="wu-stat-lbl">Accuracy</div>
              </div>
            </div>
          </div>

          <div className="warmup-text-area">
            <div className="warmup-passage">
              {text.split('').map((ch, i) => {
                let cls = 'ch-pending';
                if (i < typed.length) cls = errors.has(i) ? 'ch-wrong' : 'ch-correct';
                else if (i === typed.length) cls = 'ch-cursor';
                return <span key={i} className={cls}>{ch}</span>;
              })}
            </div>
          </div>

          <input ref={inputRef} className="warmup-hidden-input"
            readOnly value={typed} aria-label="Type here" />
        </div>
      )}

      {phase === 'complete' && (
        <div className="warmup-center">
          <div className="warmup-complete-card">
            <div className="wu-complete-icon">🎉</div>
            <h2 className="warmup-ready-title">Warm-up complete!</h2>
            <p className="warmup-ready-sub">
              Great work {child.name}! Your fingers are warmed up and ready.
            </p>
            <div className="wu-results">
              <div className="wu-result-item">
                <div className="wu-result-val">{wpm}</div>
                <div className="wu-result-lbl">Words per minute</div>
              </div>
              <div className="wu-result-item">
                <div className="wu-result-val">{accuracy}%</div>
                <div className="wu-result-lbl">Accuracy</div>
              </div>
            </div>
            <div className="wu-next-label">
              Now let's get to today's main lesson:
            </div>
            <button className="warmup-start-btn wu-next-btn" onClick={goToMain}>
              {schedule.emoji} Start {schedule.subject === 'chess' ? 'Chess' :
                schedule.subject === 'coding' ? 'Coding' : 'Typing'} lesson →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
