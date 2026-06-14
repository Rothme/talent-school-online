/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTodaySchedule, getSessionState, saveSessionState, isTestAccount
} from '../../utils/sessionSchedule';
import ChessLesson      from '../../components/chess/ChessLesson';
import ChessLessonView  from '../../components/chess/ChessLessonView';
import { LESSON_1 } from '../../data/chessLesson1';
import { LESSON_2 } from '../../data/chessLesson2';
import TypingLesson from '../../components/typing/TypingLesson';
import CodingLesson from '../../components/coding/CodingLesson';
import './MainSession.css';

export default function MainSession() {
  const navigate = useNavigate();
  const [child,        setChild]        = useState(null);
  const [subject,      setSubject]      = useState(null);
  const [lessonIndex,  setLessonIndex]  = useState(0);
  const [isParentPrev, setIsParentPrev] = useState(false);
  const [isTest,       setIsTest]       = useState(false);

  useEffect(() => {
    const childSess   = sessionStorage.getItem('childSession');
    const parentPrev  = sessionStorage.getItem('parentPreview');
    const session     = childSess || parentPrev;
    if (!session) return navigate('/child/login');

    const c = JSON.parse(session);
    setChild(c);
    setIsParentPrev(!!parentPrev);
    setIsTest(isTestAccount(c));

    // Determine today's subject — test override takes priority
    const testSubject   = sessionStorage.getItem('testSubject');
    const sched         = getTodaySchedule();
    const activeSubject = testSubject || sched.subject;

    // Guard: if subject is rest/challenge, redirect home
    if (activeSubject === 'rest' || activeSubject === 'challenge') {
      return navigate('/child/today');
    }

    setSubject(activeSubject);

    // Guard: warmup must be complete (skip for parent preview)
    const state = getSessionState(c.id);
    if (!state?.warmupComplete && !parentPrev) {
      return navigate('/child/session/warmup');
    }

    // Set lesson index from progress
    const progress = c.lessonsComplete?.[activeSubject] || 0;
    setLessonIndex(progress);
  }, [navigate]);

  function handleLessonComplete() {
    if (!child || !subject) return;

    // Save session state
    const state = getSessionState(child.id) || {};
    saveSessionState(child.id, {
      ...state,
      mainComplete: true,
      completed: true,
      completedAt: Date.now(),
    });

    // Update child session progress
    const childSess = sessionStorage.getItem('childSession');
    if (childSess) {
      const c = JSON.parse(childSess);
      const updated = {
        ...c,
        lessonsComplete: { ...c.lessonsComplete, [subject]: (c.lessonsComplete?.[subject] || 0) + 1 },
        totalXP: (c.totalXP || 0) + 50,
      };
      sessionStorage.setItem('childSession', JSON.stringify(updated));
    }

    navigate('/child/session/complete');
  }

  if (!child || !subject) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',color:'#fff',fontSize:16,fontWeight:700}}>
      Loading your lesson...
    </div>
  );

  const subjectLabel = subject === 'chess' ? 'Chess' : subject === 'coding' ? 'Coding' : 'Typing';
  const subjectEmoji = subject === 'chess' ? '♟️'    : subject === 'coding' ? '💻'     : '⌨️';

  return (
    <div className="main-session">
      {isParentPrev && (
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
              {isTest && <span className="msh-test-badge"> 🧪 test</span>}
            </span>
          </div>
        </div>
        <div className="msh-warmup-done">✅ Warm-up complete</div>
        {isTest && subject === 'chess' && (
          <select
            className="msh-lesson-picker"
            value={lessonIndex}
            onChange={(e) => setLessonIndex(Number(e.target.value))}
          >
            <option value={0}>Lesson 1 — The Board</option>
            <option value={1}>Lesson 2 — Notation</option>
          </select>
        )}
      </div>

      <div className="main-session-body">
        {subject === 'chess'  && (lessonIndex === 0 || lessonIndex === 1)
          ? <ChessLessonView lessonData={lessonIndex === 0 ? LESSON_1 : LESSON_2} childName={child.name} isTest={isTest} onComplete={handleLessonComplete} />
          : subject === 'chess'
          ? <ChessLesson lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />
          : null}
        {subject === 'coding' && <CodingLesson lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />}
        {subject === 'typing' && <TypingLesson lessonIndex={lessonIndex} childName={child.name} onComplete={handleLessonComplete} />}
      </div>
    </div>
  );
}
