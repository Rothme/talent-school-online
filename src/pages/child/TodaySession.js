import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodaySchedule, getGreeting, getSubjectColor, getSubjectPale,
  getSessionState, saveSessionState, isSessionComplete,
  WARMUP_DURATION_MINS, MAIN_DURATION_MINS,
  CHALLENGE_DURATION_MINS, FRIDAY_TYPING_MINS,
} from '../../utils/sessionSchedule';
import './TodaySession.css';

export default function TodaySession() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem('childSession')
      || sessionStorage.getItem('parentPreview');
    if (!session) return navigate('/child/login');
    const c = JSON.parse(session);
    setChild(c);
    const sched = getTodaySchedule();
    setSchedule(sched);
    const existing = getSessionState(c.id);
    setSessionState(existing);
    setReady(true);
  }, [navigate]);

  function startSession() {
    const initial = {
      childId: child.id,
      date: new Date().toISOString().slice(0, 10),
      phase: 'warmup',
      warmupComplete: false,
      mainComplete: false,
      completed: false,
      startedAt: Date.now(),
    };
    saveSessionState(child.id, initial);
    setSessionState(initial);
    navigate('/child/session/warmup');
  }

  function continueSession() {
    if (!sessionState.warmupComplete) {
      navigate('/child/session/warmup');
    } else {
      navigate(`/child/session/main`);
    }
  }

  if (!ready || !child || !schedule) return null;

  const color = getSubjectColor(schedule.subject);
  const pale  = getSubjectPale(schedule.subject);
  const greeting = getGreeting();
  const isParentPreview = !!sessionStorage.getItem('parentPreview');
  const alreadyDone = isSessionComplete(child.id);
  const inProgress = sessionState && !alreadyDone;

  // Sunday rest day
  if (schedule.subject === 'rest') return (
    <div className="today-page" style={{ '--accent': color, '--pale': pale }}>
      <div className="today-card">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>
        <div className="today-rest-icon">😊</div>
        <h1 className="today-title">Today is your rest day!</h1>
        <p className="today-sub">
          You worked hard this week, {child.name}. Rest, play, and come back
          tomorrow refreshed for a new week of learning.
        </p>
        <div className="today-streak-row">
          <span className="streak-chip">🔥 {child.streak || 0} day streak</span>
          <span className="streak-chip">⭐ {child.totalXP || 0} XP</span>
        </div>
        {isParentPreview && (
          <button className="today-back-btn"
            onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to parent dashboard
          </button>
        )}
      </div>
    </div>
  );

  // Already completed today
  if (alreadyDone) return (
    <div className="today-page" style={{ '--accent': color, '--pale': pale }}>
      <div className="today-card">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>
        <div className="today-done-icon">✅</div>
        <h1 className="today-title">You've finished today's session!</h1>
        <p className="today-sub">
          Amazing work {child.name}. Come back tomorrow for{' '}
          <strong>{schedule.dayNum === 6 ? 'Monday Chess day' : 'your next lesson'}</strong>.
        </p>
        <div className="today-streak-row">
          <span className="streak-chip">🔥 {child.streak || 0} day streak</span>
          <span className="streak-chip">⭐ {child.totalXP || 0} XP</span>
        </div>
        {isParentPreview && (
          <button className="today-back-btn"
            onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to parent dashboard
          </button>
        )}
      </div>
    </div>
  );

  // Saturday challenge
  if (schedule.subject === 'challenge') return (
    <div className="today-page" style={{ '--accent': color, '--pale': pale }}>
      <div className="today-card today-card-challenge">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>
        <div className="today-challenge-header">
          <div className="today-challenge-icon">🏆</div>
          <h1 className="today-title">Challenge Saturday!</h1>
          <p className="today-sub">
            You've been learning all week {child.name} — now let's see what you've got!
          </p>
        </div>
        <div className="today-phases">
          <div className="today-phase">
            <div className="phase-time" style={{ background: '#faeeda', color: '#ba7517' }}>10 mins</div>
            <div className="phase-info">
              <div className="phase-label">⌨️ Typing warm-up</div>
              <div className="phase-desc">Warm up your fingers first</div>
            </div>
          </div>
          <div className="today-phase">
            <div className="phase-time" style={{ background: pale, color }}>30 mins</div>
            <div className="phase-info">
              <div className="phase-label">📝 Recall quiz</div>
              <div className="phase-desc">Test what you learned this week</div>
            </div>
          </div>
          <div className="today-phase">
            <div className="phase-time" style={{ background: pale, color }}>60 mins</div>
            <div className="phase-info">
              <div className="phase-label">⚡ Apply challenge</div>
              <div className="phase-desc">Use your skills in a new challenge</div>
            </div>
          </div>
          <div className="today-phase">
            <div className="phase-time" style={{ background: pale, color }}>20 mins</div>
            <div className="phase-info">
              <div className="phase-label">🌟 Showcase</div>
              <div className="phase-desc">Your best performance — shareable!</div>
            </div>
          </div>
        </div>
        <button className="today-start-btn" style={{ background: color }} onClick={startSession}>
          Start Challenge Saturday →
        </button>
        {isParentPreview && (
          <button className="today-back-btn"
            onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to parent dashboard
          </button>
        )}
      </div>
    </div>
  );

  // Normal weekday session
  const isFriday = schedule.dayNum === 5;
  const mainMins = isFriday ? FRIDAY_TYPING_MINS - WARMUP_DURATION_MINS : MAIN_DURATION_MINS;

  return (
    <div className="today-page" style={{ '--accent': color, '--pale': pale }}>
      {isParentPreview && (
        <div className="preview-banner-top">
          <span>👀 Previewing {child.name}'s experience</span>
          <button onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to dashboard
          </button>
        </div>
      )}
      <div className="today-card">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>

        <div className="today-greeting">
          <div className="today-avatar" style={{ background: child.avatarColor || '#6c63ff' }}>
            {child.avatar}
          </div>
          <div>
            <h1 className="today-title">{greeting}, {child.name}!</h1>
            <div className="today-day-badge" style={{ background: pale, color }}>
              📅 {schedule.day} · {schedule.label}
            </div>
          </div>
        </div>

        <div className="today-streak-row">
          <span className="streak-chip">🔥 {child.streak || 0} day streak</span>
          <span className="streak-chip">⭐ {child.totalXP || 0} XP</span>
          <span className="streak-chip">🆔 {child.studentId}</span>
        </div>

        <div className="today-schedule-card" style={{ borderColor: color }}>
          <div className="today-schedule-title" style={{ color }}>
            Today's session — 1 hour
          </div>
          <div className="today-phases">
            <div className="today-phase">
              <div className="phase-time phase-warmup">
                {WARMUP_DURATION_MINS} mins
              </div>
              <div className="phase-info">
                <div className="phase-label">⌨️ Typing warm-up</div>
                <div className="phase-desc">
                  {inProgress && sessionState?.warmupComplete
                    ? '✅ Complete!'
                    : 'Always first — every single day'}
                </div>
              </div>
              {inProgress && sessionState?.warmupComplete && (
                <div className="phase-done">✓</div>
              )}
            </div>

            <div className="phase-arrow">↓</div>

            <div className="today-phase">
              <div className="phase-time" style={{ background: pale, color }}>
                {mainMins} mins
              </div>
              <div className="phase-info">
                <div className="phase-label">
                  {schedule.emoji} {schedule.subject === 'chess' ? 'Chess lesson'
                    : schedule.subject === 'coding' ? 'Coding lesson'
                    : 'Typing lesson'}
                </div>
                <div className="phase-desc">
                  {inProgress && sessionState?.warmupComplete
                    ? 'Ready to start!'
                    : 'Unlocks after warm-up'}
                </div>
              </div>
              {!inProgress || !sessionState?.warmupComplete
                ? <div className="phase-locked">🔒</div>
                : null}
            </div>
          </div>
        </div>

        {inProgress ? (
          <button className="today-start-btn" style={{ background: color }} onClick={continueSession}>
            Continue today's session →
          </button>
        ) : (
          <button className="today-start-btn" style={{ background: color }} onClick={startSession}>
            Start today's session →
          </button>
        )}

        <p className="today-footer-note">
          Ms. Momo will guide you through every step 🎓
        </p>
      </div>
    </div>
  );
}
