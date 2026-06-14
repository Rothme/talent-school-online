/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodaySchedule, getGreeting, getSubjectColor, getSubjectPale,
  getSessionState, saveSessionState,
} from '../../utils/sessionSchedule';
import { unlockAudio } from '../../utils/elevenlabs';
import './TodaySession.css';

const TEST_SUBJECTS = [
  { id: 'chess',  label: 'Chess',  emoji: '♟️', color: '#1d9e75', pale: '#e1f5ee', desc: 'Strategy & thinking' },
  { id: 'coding', label: 'Coding', emoji: '💻', color: '#6c63ff', pale: '#eeedfe', desc: 'Build real programs' },
  { id: 'typing', label: 'Typing', emoji: '⌨️', color: '#ba7517', pale: '#faeeda', desc: 'Speed & accuracy' },
];

export default function TodaySession() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const [ready, setReady] = useState(false);
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem('childSession')
      || sessionStorage.getItem('parentPreview');
    if (!session) return navigate('/child/login');
    const c = JSON.parse(session);
    setChild(c);

    // Detect test account
    const test = c.studentId === 'TSO-0001-C' || c.studentId === 'TSO-0002-T';
    setIsTest(test);

    const sched = getTodaySchedule();
    setSchedule(sched);
    const existing = getSessionState(c.id);
    setSessionState(existing);
    setReady(true);
  }, [navigate]);

  function startSubject(subjectId) {
    unlockAudio();
    if (!child) return;
    const initial = {
      childId: child.id,
      date: new Date().toISOString().slice(0, 10),
      phase: 'warmup',
      warmupComplete: false,
      mainComplete: false,
      completed: false,
      testMode: true,
      selectedSubject: subjectId,
      startedAt: Date.now(),
    };
    saveSessionState(child.id, initial);
    sessionStorage.setItem('testSubject', subjectId);
    navigate('/child/session/warmup');
  }

  function startNormalSession() {
    unlockAudio();
    if (!child || !schedule) return;
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
    unlockAudio();
    if (!sessionState) return;
    if (!sessionState.warmupComplete) navigate('/child/session/warmup');
    else navigate('/child/session/main');
  }

  if (!ready || !child || !schedule) return null;

  const color = getSubjectColor(schedule.subject);
  const pale  = getSubjectPale(schedule.subject);
  const greeting = getGreeting();
  const isParentPreview = !!sessionStorage.getItem('parentPreview');
  const alreadyDone = !isTest && sessionState?.completed === true;
  const inProgress = sessionState && !alreadyDone && !sessionState.completed;

  // ── TEST ACCOUNT VIEW ──────────────────────
  if (isTest) return (
    <div className="today-page" style={{'--accent':'#6c63ff','--pale':'#eeedfe'}}>
      {isParentPreview && (
        <div className="preview-banner-top">
          <span>👀 Previewing {child.name}'s experience</span>
          <button onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to dashboard
          </button>
        </div>
      )}
      <div className="today-card today-card-test">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>

        <div className="test-mode-banner">
          🧪 Test Mode — All subjects unlocked
        </div>

        <div className="today-greeting">
          <div className="today-avatar" style={{background: child.avatarColor || '#6c63ff'}}>
            {child.avatar}
          </div>
          <div>
            <h1 className="today-title">{greeting}, {child.name}!</h1>
            <p className="today-day-badge" style={{background:'#eeedfe', color:'#6c63ff', display:'inline-block', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700}}>
              🧪 Test account · Choose any subject
            </p>
          </div>
        </div>

        <div className="today-streak-row">
          <span className="streak-chip">🔥 {child.streak || 0} day streak</span>
          <span className="streak-chip">⭐ {child.totalXP || 0} XP</span>
          <span className="streak-chip">🆔 {child.studentId}</span>
        </div>

        <div className="test-subject-grid">
          {TEST_SUBJECTS.map(s => (
            <button
              key={s.id}
              className="test-subject-btn"
              style={{'--sbtn-color': s.color, '--sbtn-pale': s.pale}}
              onClick={() => startSubject(s.id)}
            >
              <div className="tsb-emoji">{s.emoji}</div>
              <div className="tsb-info">
                <div className="tsb-name">{s.label}</div>
                <div className="tsb-desc">{s.desc}</div>
              </div>
              <div className="tsb-arrow" style={{color: s.color}}>→</div>
            </button>
          ))}
        </div>

        <div className="test-note">
          In the live app children are taken directly to today's scheduled subject.<br/>
          Test mode lets you access all subjects freely for review.
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

  // ── SUNDAY REST DAY ──────────────────────
  if (schedule.subject === 'rest') return (
    <div className="today-page" style={{'--accent':color,'--pale':pale}}>
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

  // ── SESSION ALREADY DONE TODAY ──────────
  if (alreadyDone) return (
    <div className="today-page" style={{'--accent':color,'--pale':pale}}>
      <div className="today-card">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>
        <div className="today-done-icon">✅</div>
        <h1 className="today-title">You have finished today's session!</h1>
        <p className="today-sub">
          Amazing work {child.name}. Come back tomorrow for your next lesson.
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

  // ── SATURDAY CHALLENGE ──────────────────
  if (schedule.subject === 'challenge') return (
    <div className="today-page" style={{'--accent':color,'--pale':pale}}>
      <div className="today-card today-card-challenge">
        <div className="today-logo"><span className="today-dot" />Talent School Online</div>
        <div className="today-challenge-header">
          <div className="today-challenge-icon">🏆</div>
          <h1 className="today-title">Challenge Saturday!</h1>
          <p className="today-sub">
            You have been learning all week {child.name} — now let us see what you have got!
          </p>
        </div>
        <div className="today-phases">
          {[
            { time:'10 mins', bg:'#faeeda', color:'#ba7517', label:'⌨️ Typing warm-up', desc:'Warm up your fingers first' },
            { time:'30 mins', bg:pale, color, label:'📝 Recall quiz', desc:'Test what you learned this week' },
            { time:'60 mins', bg:pale, color, label:'⚡ Apply challenge', desc:'Use your skills in a new challenge' },
            { time:'20 mins', bg:pale, color, label:'🌟 Showcase', desc:'Your best performance — shareable!' },
          ].map((p,i) => (
            <div key={i} className="today-phase">
              <div className="phase-time" style={{background:p.bg, color:p.color}}>{p.time}</div>
              <div className="phase-info">
                <div className="phase-label">{p.label}</div>
                <div className="phase-desc">{p.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="today-start-btn" style={{background:color}} onClick={startNormalSession}>
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

  // ── NORMAL WEEKDAY SESSION ──────────────
  const isFriday = schedule.dayNum === 5;
  const mainMins = isFriday ? 50 : 50;

  return (
    <div className="today-page" style={{'--accent':color,'--pale':pale}}>
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
          <div className="today-avatar" style={{background: child.avatarColor || '#6c63ff'}}>
            {child.avatar}
          </div>
          <div>
            <h1 className="today-title">{greeting}, {child.name}!</h1>
            <div className="today-day-badge" style={{background:pale, color}}>
              📅 {schedule.day} · {schedule.label}
            </div>
          </div>
        </div>

        <div className="today-streak-row">
          <span className="streak-chip">🔥 {child.streak || 0} day streak</span>
          <span className="streak-chip">⭐ {child.totalXP || 0} XP</span>
          <span className="streak-chip">🆔 {child.studentId}</span>
        </div>

        <div className="today-schedule-card" style={{borderColor:color}}>
          <div className="today-schedule-title" style={{color}}>Today's session — 1 hour</div>
          <div className="today-phases">
            <div className="today-phase">
              <div className="phase-time phase-warmup">10 mins</div>
              <div className="phase-info">
                <div className="phase-label">⌨️ Typing warm-up</div>
                <div className="phase-desc">
                  {inProgress && sessionState?.warmupComplete ? '✅ Complete!' : 'Always first — every session'}
                </div>
              </div>
              {inProgress && sessionState?.warmupComplete && <div className="phase-done">✓</div>}
            </div>
            <div className="phase-arrow">↓</div>
            <div className="today-phase">
              <div className="phase-time" style={{background:pale, color}}>{mainMins} mins</div>
              <div className="phase-info">
                <div className="phase-label">{schedule.emoji} {
                  schedule.subject === 'chess' ? 'Chess lesson' :
                  schedule.subject === 'coding' ? 'Coding lesson' : 'Typing lesson'
                }</div>
                <div className="phase-desc">
                  {inProgress && sessionState?.warmupComplete ? 'Ready to start!' : 'Unlocks after warm-up'}
                </div>
              </div>
              {(!inProgress || !sessionState?.warmupComplete) && <div className="phase-locked">🔒</div>}
            </div>
          </div>
        </div>

        {inProgress ? (
          <button className="today-start-btn" style={{background:color}} onClick={continueSession}>
            Continue today's session →
          </button>
        ) : (
          <button className="today-start-btn" style={{background:color}} onClick={startNormalSession}>
            Start today's session →
          </button>
        )}

        <p className="today-footer-note">Ms. Momo will guide you through every step 🎓</p>
      </div>
    </div>
  );
}
