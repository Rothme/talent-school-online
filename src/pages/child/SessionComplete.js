import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodaySchedule, getSessionState } from '../../utils/sessionSchedule';
import './SessionComplete.css';

export default function SessionComplete() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const session = sessionStorage.getItem('childSession')
      || sessionStorage.getItem('parentPreview');
    if (!session) return navigate('/child/login');
    const c = JSON.parse(session);
    setChild(c);
    const sched = getTodaySchedule();
    setSchedule(sched);
    const state = getSessionState(c.id);
    setSessionData(state);
  }, [navigate]);

  if (!child || !schedule) return null;

  const NEXT_DAY = {
    1: 'Coding', 2: 'Chess', 3: 'Coding',
    4: 'Typing', 5: 'Challenge Saturday', 6: 'Rest day', 0: 'Chess',
  };
  const nextDay = NEXT_DAY[schedule.dayNum] || 'your next lesson';
  const isParentPreview = !!sessionStorage.getItem('parentPreview');

  return (
    <div className="complete-page">
      <div className="complete-card">
        <div className="complete-logo"><span className="c-dot" />Talent School Online</div>

        <div className="complete-confetti">🎉</div>
        <h1 className="complete-title">Session complete!</h1>
        <p className="complete-sub">
          Incredible work today, {child.name}! You are building skills that will
          last a lifetime.
        </p>

        <div className="complete-stats">
          <div className="complete-stat">
            <div className="cstat-val">+50</div>
            <div className="cstat-lbl">XP earned</div>
          </div>
          <div className="complete-stat">
            <div className="cstat-val">{sessionData?.warmupWpm || 0}</div>
            <div className="cstat-lbl">Typing WPM</div>
          </div>
          <div className="complete-stat">
            <div className="cstat-val">🔥 {(child.streak || 0) + 1}</div>
            <div className="cstat-lbl">Day streak</div>
          </div>
        </div>

        <div className="complete-summary">
          <div className="summary-row">
            <span>⌨️ Typing warm-up</span>
            <span className="summary-check">✅</span>
          </div>
          <div className="summary-row">
            <span>{schedule.emoji} {schedule.subject === 'chess' ? 'Chess'
              : schedule.subject === 'coding' ? 'Coding' : 'Typing'} lesson</span>
            <span className="summary-check">✅</span>
          </div>
        </div>

        <div className="complete-next">
          <span className="next-label">Come back tomorrow for</span>
          <span className="next-subject">{nextDay}</span>
        </div>

        <div className="complete-momo">
          <div className="c-momo-avatar">🎓</div>
          <div className="c-momo-text">
            Ms. Momo says: <em>"You did amazing today {child.name}!
            Your parent will be so proud. See you tomorrow!"</em>
          </div>
        </div>

        {isParentPreview ? (
          <button className="complete-btn"
            onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to parent dashboard
          </button>
        ) : (
          <button className="complete-btn" onClick={() => navigate('/child/today')}>
            Done for today ✓
          </button>
        )}
      </div>
    </div>
  );
}
