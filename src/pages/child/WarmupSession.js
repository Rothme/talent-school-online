/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSessionState, saveSessionState, getTodaySchedule, isTestAccount
} from '../../utils/sessionSchedule';
import { WARMUP_PASSAGES } from '../../data/curriculum';
import './WarmupSession.css';

const WARMUP_SECS = 10 * 60;

export default function WarmupSession() {
  const navigate = useNavigate();
  const [child, setChild]           = useState(null);
  const [schedule, setSchedule]     = useState(null);
  const [isTest, setIsTest]         = useState(false);
  const [passageIdx, setPassageIdx] = useState(() => Math.floor(Math.random() * WARMUP_PASSAGES.length));
  const [typed, setTyped]           = useState('');
  const [errors, setErrors]         = useState(new Set());
  const [startTime, setStartTime]   = useState(null);
  const [wpm, setWpm]               = useState(0);
  const [accuracy, setAccuracy]     = useState(100);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(WARMUP_SECS);
  const [phase, setPhase]           = useState('ready'); // ready | active | complete
  const timerRef  = useRef(null);
  const inputRef  = useRef(null);
  const hasNavigated = useRef(false);

  const passage  = WARMUP_PASSAGES[passageIdx];
  const fullText = passage.text;

  useEffect(() => {
    const session = sessionStorage.getItem('childSession') || sessionStorage.getItem('parentPreview');
    if (!session) return navigate('/child/login');
    const c = JSON.parse(session);
    setChild(c);
    setIsTest(isTestAccount(c));
    setSchedule(getTodaySchedule());
  }, [navigate]);

  // ── Mark warmup complete and navigate to main ──
  const completeWarmupAndNavigate = useCallback((w = wpm, a = accuracy, words = wordsTyped) => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    clearInterval(timerRef.current);
    setPhase('complete');

    const childData = JSON.parse(
      sessionStorage.getItem('childSession') || sessionStorage.getItem('parentPreview') || '{}'
    );
    const state = getSessionState(childData.id) || {};
    saveSessionState(childData.id, {
      ...state,
      warmupComplete: true,
      warmupWpm: w,
      warmupAccuracy: a,
      warmupWordsTyped: words,
      phase: 'main',
    });

    // Navigate after brief celebration
    setTimeout(() => navigate('/child/session/main'), 1200);
  }, [navigate, wpm, accuracy, wordsTyped]);

  // ── Timer ──
  useEffect(() => {
    if (phase !== 'active') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          completeWarmupAndNavigate();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, completeWarmupAndNavigate]);

  // ── Load next passage when current one finishes ──
  function loadNextPassage() {
    setPassageIdx(i => (i + 1) % WARMUP_PASSAGES.length);
    setTyped('');
    setErrors(new Set());
  }

  // ── Typing handler ──
  const handleKeyDown = useCallback((e) => {
    if (phase !== 'active') return;
    const key = e.key;
    if (key === 'Backspace') { setTyped(t => t.slice(0, -1)); return; }
    if (key.length !== 1) return;
    if (!startTime) setStartTime(Date.now());

    const expected = fullText[typed.length];
    const newTyped = typed + key;
    setTyped(newTyped);
    if (key !== expected) setErrors(prev => new Set([...prev, typed.length]));

    const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0.001;
    const words   = newTyped.trim().split(/\s+/).length;
    const newWpm  = Math.round(words / Math.max(elapsed, 0.001));
    setWpm(newWpm);
    setWordsTyped(words);
    const correct = newTyped.split('').filter((ch, i) => ch === fullText[i]).length;
    setAccuracy(Math.round((correct / newTyped.length) * 100) || 100);

    if (newTyped.length >= fullText.length) {
      setTimeout(() => loadNextPassage(), 300);
    }
  }, [phase, typed, fullText, startTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ── Skip for test accounts ──
  function skipWarmup() {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    clearInterval(timerRef.current);
    const c = JSON.parse(
      sessionStorage.getItem('childSession') || sessionStorage.getItem('parentPreview') || '{}'
    );
    const state = getSessionState(c.id) || {};
    saveSessionState(c.id, {
      ...state,
      warmupComplete: true,
      warmupWpm: 0,
      warmupAccuracy: 0,
      warmupWordsTyped: 0,
      skipped: true,
      phase: 'main',
    });
    navigate('/child/session/main');
  }

  function startWarmup() {
    setPhase('active');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  const mins        = Math.floor(timeLeft / 60);
  const secs        = timeLeft % 60;
  const progressPct = ((WARMUP_SECS - timeLeft) / WARMUP_SECS) * 100;
  const timerColor  = timeLeft > 120 ? '#ba7517' : '#e24b4a';

  const activeSubject = sessionStorage.getItem('testSubject') || schedule?.subject;
  const subjectLabel  = activeSubject === 'chess' ? 'Chess' : activeSubject === 'coding' ? 'Coding' : 'Typing';
  const subjectEmoji  = activeSubject === 'chess' ? '♟️'    : activeSubject === 'coding' ? '💻'     : '⌨️';

  if (!child || !schedule) return null;

  return (
    <div className="warmup-page" onClick={() => phase === 'active' && inputRef.current?.focus()}>

      <div className="warmup-topbar">
        <div className="warmup-logo"><span className="wu-dot" />Talent School Online</div>
        <div className="warmup-phase-label">⌨️ Typing Warm-up</div>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          {isTest && phase !== 'complete' && (
            <button className="wu-skip-btn" onClick={skipWarmup}>
              ⚡ Skip warm-up (test mode)
            </button>
          )}
          {phase === 'active' && (
            <div className="warmup-timer" style={{ background: timerColor }}>
              {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
            </div>
          )}
        </div>
      </div>

      <div className="warmup-progress-bar">
        <div className="warmup-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* READY */}
      {phase === 'ready' && (
        <div className="warmup-center">
          <div className="warmup-ready-card">
            <div className="warmup-ready-icon">⌨️</div>
            <h2 className="warmup-ready-title">Time to warm up your fingers!</h2>
            <p className="warmup-ready-sub">
              Every session begins with 10 minutes of typing practice.
              Today's main lesson is {subjectEmoji} <strong>{subjectLabel}</strong> — but first, let's type!
            </p>
            <div className="warmup-stats-row">
              <div className="warmup-stat"><span>⏱</span> 10 minutes</div>
              <div className="warmup-stat"><span>📖</span> Nigerian story</div>
              <div className="warmup-stat"><span>🎯</span> Speed + accuracy</div>
            </div>
            <p style={{fontSize:12,color:'var(--text-muted)',marginBottom:16,lineHeight:1.6}}>
              If you finish the passage before 10 minutes is up, the next story loads automatically.
              The timer is the gate — not the passage.
            </p>
            <button className="warmup-start-btn" onClick={startWarmup}>Start warm-up →</button>
            {isTest && (
              <button className="wu-skip-btn-lg" onClick={skipWarmup}>
                ⚡ Skip and go straight to {subjectLabel} (test mode only)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE */}
      {phase === 'active' && (
        <div className="warmup-active">
          <div className="warmup-momo-bar">
            <div className="wu-avatar">🎓</div>
            <div className="wu-speech">
              <div className="wu-name">Ms. Lola</div>
              <div className="wu-text">
                Keep typing! Eyes on the screen — not your hands.
                Return your fingers to the home row after every keystroke.
                {timeLeft <= 120 && <strong style={{color:'#fac775'}}> Almost there — keep going!</strong>}
              </div>
            </div>
            <div className="wu-live-stats">
              <div className="wu-stat-item"><div className="wu-stat-val">{wpm}</div><div className="wu-stat-lbl">WPM</div></div>
              <div className="wu-stat-item"><div className="wu-stat-val">{typed.length > 0 ? accuracy : 100}%</div><div className="wu-stat-lbl">Accuracy</div></div>
              <div className="wu-stat-item"><div className="wu-stat-val">{wordsTyped}</div><div className="wu-stat-lbl">Words</div></div>
            </div>
          </div>

          <div className="warmup-text-area">
            <div className="warmup-passage-title">{passage.title}</div>
            <div className="warmup-passage">
              {fullText.split('').map((ch, i) => {
                let cls = 'ch-pending';
                if (i < typed.length) cls = errors.has(i) ? 'ch-wrong' : 'ch-correct';
                else if (i === typed.length) cls = 'ch-cursor';
                return <span key={i} className={cls}>{ch}</span>;
              })}
            </div>
          </div>
          <input ref={inputRef} className="warmup-hidden-input" readOnly value={typed} aria-label="Type here" />
        </div>
      )}

      {/* COMPLETE — auto-navigates after 1.2s */}
      {phase === 'complete' && (
        <div className="warmup-center">
          <div className="warmup-complete-card">
            <div className="wu-complete-icon">🎉</div>
            <h2 className="warmup-ready-title">Warm-up complete!</h2>
            <p className="warmup-ready-sub">
              Well done {child.name}! Taking you to your {subjectLabel} lesson now...
            </p>
            <div className="wu-results">
              <div className="wu-result-item"><div className="wu-result-val">{wpm}</div><div className="wu-result-lbl">Words per minute</div></div>
              <div className="wu-result-item"><div className="wu-result-val">{accuracy}%</div><div className="wu-result-lbl">Accuracy</div></div>
              <div className="wu-result-item"><div className="wu-result-val">{wordsTyped}</div><div className="wu-result-lbl">Total words</div></div>
            </div>
            <div className="wu-loading-bar"><div className="wu-loading-fill" /></div>
          </div>
        </div>
      )}

    </div>
  );
}
