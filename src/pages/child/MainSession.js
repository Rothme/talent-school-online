import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodaySchedule, getSessionState, saveSessionState,
} from '../../utils/sessionSchedule';
import ChessLesson from '../../components/chess/ChessLesson';
import TypingLesson from '../../components/typing/TypingLesson';
import CodingLesson from '../../components/coding/CodingLesson';
import './MainSession.css';

export default function MainSession() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [isParentPreview, setIsParentPreview] = useState(false);

  useEffect(() => {
    const childSession = sessionStorage.getItem('childSession');
    const parentPreview = sessionStorage.getItem('parentPreview');
    const session = childSession || parentPreview;
    if (!session) return navigate('/child/login');
    const c = JSON.parse(session);
    setChild(c);
    setIsParentPreview(!!parentPreview);

    const sched = getTodaySchedule();
    setSchedule(sched);

    // Check warmup is complete
    const state = getSessionState(c.id);
    if (!state?.warmupComplete && !parentPreview) {
      navigate('/child/session/warmup');
      return;
    }

    // Get lesson index from progress
    const subjectProgress = c.lessonsComplete?.[sched.subject] || 0;
    setLessonIndex(subjectProgress);
  }, [navigate]);

  function handleLessonComplete() {
    if (!child) return;
    // Update session state
    const state = getSessionState(child.id) || {};
    saveSessionState(child.id, {
      ...state,
      mainComplete: true,
      completed: true,
      completedAt: Date.now(),
    });
    // Update child session with new progress
    const session = sessionStorage.getItem('childSession');
    if (session) {
      const c = JSON.parse(session);
      const newProgress = {
        ...c.lessonsComplete,
        [schedule.subject]: (c.lessonsComplete?.[schedule.subject] || 0) + 1,
      };
      const updated = { ...c, lessonsComplete: newProgress, totalXP: (c.totalXP || 0) + 50 };
      sessionStorage.setItem('childSession', JSON.stringify(updated));
    }
    navigate('/child/session/complete');
  }

  if (!child || !schedule) return null;

  const isParent = isParentPreview;

  return (
    <div className="main-session">
      {isParent && (
        <div className="main-preview-banner">
          <span>👀 Previewing {child.name}'s experience</span>
          <button onClick={() => { sessionStorage.removeItem('parentPreview'); navigate('/parent/dashboard'); }}>
            ← Back to dashboard
          </button>
        </div>
      )}

      <div className="main-session-header">
        <div className="msh-left">
          <button className="msh-back" onClick={() => navigate('/child/today')}>←</button>
          <div className="msh-info">
            <span className="msh-subject">
              {schedule.emoji} {schedule.subject === 'chess' ? 'Chess' :
               schedule.subject === 'coding' ? 'Coding' : 'Typing'} lesson
            </span>
            <span className="msh-child">{child.name}</span>
          </div>
        </div>
        <div className="msh-warmup-done">✅ Warm-up complete</div>
      </div>

      <div className="main-session-body">
        {schedule.subject === 'chess' && (
          <ChessLesson
            lessonIndex={lessonIndex}
            childName={child.name}
            onComplete={handleLessonComplete}
          />
        )}
        {schedule.subject === 'coding' && (
          <CodingLesson
            lessonIndex={lessonIndex}
            childName={child.name}
            onComplete={handleLessonComplete}
          />
        )}
        {schedule.subject === 'typing' && (
          <TypingLesson
            lessonIndex={lessonIndex}
            childName={child.name}
            onComplete={handleLessonComplete}
          />
        )}
      </div>
    </div>
  );
}
