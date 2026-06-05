/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodaySchedule, getSessionState, saveSessionState } from '../../utils/sessionSchedule';
import ChessLesson  from '../../components/chess/ChessLesson';
import TypingLesson from '../../components/typing/TypingLesson';
import CodingLesson from '../../components/coding/CodingLesson';
import './MainSession.css';

export default function MainSession() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [subject, setSubject] = useState(null);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [isParentPreview, setIsParentPreview] = useState(false);
  const [isTest, setIsTest] = useState(false);

  useEffect(() => {
    const childSession  = sessionStorage.getItem('childSession');
    const parentPreview = sessionStorage.getItem('parentPreview');
    const session = childSession || parentPreview;
    if (!session) return navigate('/child/login');

    const c = JSON.parse(session);
    setChild(c);
    setIsParentPreview(!!parentPreview);

    const test = c.studentId === 'TSO-0001-C' || c.studentId === 'TSO-0002-T';
    setIsTest(test);

    // Test mode: read subject from sessionStorage override
    const testSubject = sessionStorage.getItem('testSubject');
    const sched = getTodaySchedule();
    const activeSubject = testSubject || sched.subject;
    setSubject(activeSubject);

    // Check warmup is complete (skip check for parent preview)
    const state = getSessionState(c.id);
    if (!state?.warmupComplete && !parentPreview) {
      navigate('/child/session/warmup');
      return;
    }

    // Get lesson index from progress
    const subjectProgress = c.lessonsComplete?.[activeSubject] || 0;
    setLessonIndex(subjectProgress);
  }, [navigate]);

  function handleLessonComplete() {
    if (!child) return;
    const state = getSessionState(child.id) || {};
    saveSessionState(child.id, {
      ...state,
      mainComplete: true,
      completed: true,
      completedAt: Date.now(),
    });
    // Update child session with new progress
    const childSession = sessionStorage.getItem('childSession');
    if (childSession) {
      const c = JSON.parse(childSession);
      const newLessons = {
        ...c.lessonsComplete,
        [subject]: (c.lessonsComplete?.[subject] || 0) + 1,
      };
      const updated = { ...c, lessonsComplete: newLessons, totalXP: (c.totalXP || 0) + 50 };
      sessionStorage.setItem('childSession', JSON.stringify(updated));
    }
    // Clear test subject so next session uses the timetable
    if (!isTest) sessionStorage.removeItem('testSubject');
    navigate('/child/session/complete');
  }

  if (!child || !subject) return null;

  const subjectLabel = subject === 'chess' ? 'Chess' : subject === 'coding' ? 'Coding' : 'Typing';
  const subjectEmoji = subject === 'chess' ? '♟️' : subject === 'coding' ? '💻' : '⌨️';

  return (
    <div className="main-session">
      {isParentPreview && (
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
            <span className="msh-subject">{subjectEmoji} {subjectLabel} lesson</span>
            <span className="msh-child">
              {child.name}
              {isTest && <span className="msh-test-badge"> 🧪 test mode</span>}
            </span>
          </div>
        </div>
        <div className="msh-warmup-done">✅ Warm-up complete</div>
      </div>

      <div className="main-session-body">
        {subject === 'chess'  && <ChessLesson  lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />}
        {subject === 'coding' && <CodingLesson lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />}
        {subject === 'typing' && <TypingLesson lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />}
      </div>
    </div>
  );
}
