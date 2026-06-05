/* eslint-disable */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TopNav from '../layout/TopNav';
import MsMomoBar from '../shared/MsMomoBar';
import { TYPING_LESSONS } from '../../data/curriculum';
import './TypingLesson.css';

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['SHIFT','Z','X','C','V','B','N','M','SHIFT'],
  ['SPACE'],
];
const HOME_KEYS = new Set(['A','S','D','F','G','H','J','K','L']);

export default function TypingLesson({ lessonIndex = 0, childName = 'Student', onComplete }) {
  const lesson = TYPING_LESSONS[lessonIndex] || TYPING_LESSONS[0];
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [errors, setErrors] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [lessonDone, setLessonDone] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const inputRef = useRef(null);

  const exercises = lesson.exercises || [];
  const currentExercise = exercises[exerciseIdx] || exercises[0];
  const target = currentExercise?.text || '';

  useEffect(() => {
    setExerciseIdx(0);
    setTyped(''); setErrors(new Set());
    setStartTime(null); setWpm(0); setAccuracy(100);
    setExerciseDone(false); setLessonDone(false);
  }, [lessonIndex]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [exerciseIdx, lessonIndex]);

  const nextChar = target[typed.length]?.toUpperCase() || null;

  function advanceExercise() {
    const next = exerciseIdx + 1;
    if (next >= exercises.length) {
      setLessonDone(true);
      setTimeout(() => onComplete && onComplete(), 2000);
    } else {
      setExerciseIdx(next);
      setTyped(''); setErrors(new Set());
      setStartTime(null); setExerciseDone(false);
    }
  }

  const handleKeyDown = useCallback((e) => {
    if (exerciseDone || lessonDone) return;
    const key = e.key;
    if (key === 'Backspace') { setTyped(t => t.slice(0,-1)); return; }
    if (key.length !== 1) return;
    if (!startTime) setStartTime(Date.now());

    const expected = target[typed.length];
    const newTyped = typed + key;
    setTyped(newTyped);
    setActiveKey(key.toUpperCase());
    setTimeout(() => setActiveKey(null), 150);

    if (key !== expected) setErrors(prev => new Set([...prev, typed.length]));

    const elapsed = startTime ? (Date.now() - startTime) / 60000 : 0.001;
    const words = newTyped.trim().split(/\s+/).length;
    setWpm(Math.round(words / Math.max(elapsed, 0.001)));
    const correct = newTyped.split('').filter((ch,i) => ch === target[i]).length;
    setAccuracy(Math.round((correct / newTyped.length) * 100) || 100);

    if (newTyped.length >= target.length) {
      setExerciseDone(true);
      setTimeout(() => advanceExercise(), 800);
    }
  }, [typed, target, startTime, exerciseDone, lessonDone, exerciseIdx, exercises.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  function renderText() {
    return target.split('').map((ch, i) => {
      let cls = 'ch-pending';
      if (i < typed.length) cls = errors.has(i) ? 'ch-wrong' : 'ch-correct';
      else if (i === typed.length) cls = 'ch-current';
      return <span key={i} className={cls}>{ch}</span>;
    });
  }

  function getKeyClass(key) {
    if (key === activeKey) return 'key key-active';
    if (nextChar === key) return 'key key-next';
    if (HOME_KEYS.has(key)) return 'key key-home';
    return 'key';
  }

  return (
    <div className="typing-lesson" onClick={() => inputRef.current?.focus()}>
      <TopNav childName={childName} streak={7} xp={40} backTo="/child/today" />

      <div className="lesson-title-bar">
        <div>
          <h1 className="lesson-main-title">{lesson.title}</h1>
          <p className="lesson-subtitle">{lesson.subtitle} · {lesson.levelName}</p>
        </div>
        <div className="step-badge-amber">
          Exercise {exerciseIdx + 1} of {exercises.length}
          {lessonDone && ' ✅'}
        </div>
      </div>

      <div className="lesson-prog-bar">
        <div className="lesson-prog-fill"
          style={{ width: `${((exerciseIdx + (exerciseDone ? 1 : typed.length / Math.max(target.length,1))) / exercises.length) * 100}%`, background: '#ba7517' }} />
      </div>

      <div className="story-section">
        <div className="story-header">
          <span className="story-chapter-label">
            {lesson.storyTitle || `${lesson.levelName} · Lesson ${lesson.step}`}
          </span>
          {lessonDone && <span className="story-done-badge">✅ Lesson complete!</span>}
          {exerciseDone && !lessonDone && <span className="story-done-badge">✓ Next exercise loading...</span>}
        </div>
        <div className="story-text-display" aria-label="Text to type">
          {renderText()}
          {!exerciseDone && <span className="typing-cursor" aria-hidden="true">|</span>}
        </div>
        <input ref={inputRef} className="typing-hidden-input" aria-label="Type here" readOnly value={typed} />
      </div>

      <div className="keyboard-section">
        <div className="keyboard-wrap">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="kbd-row">
              {row.map((key) => {
                const cls = key === 'SHIFT' ? 'key key-wide'
                  : key === 'SPACE' ? `key key-space ${activeKey === ' ' ? 'key-active' : ''}`
                  : getKeyClass(key);
                return (
                  <div key={key+ri} className={cls} aria-hidden="true">
                    {key === 'SPACE' ? '' : key === 'SHIFT' ? '⇧' : key}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="kbd-legend">
          <span className="legend-item"><span className="swatch swatch-home" /> Home row</span>
          <span className="legend-item"><span className="swatch swatch-next" /> Next key</span>
          <span className="legend-item"><span className="swatch swatch-active" /> Active key</span>
        </div>
      </div>

      <div className="typing-bottom-bar">
        <div className="typing-momo-section">
          <MsMomoBar instruction={lesson.tutorInstruction} color="#ba7517" nameColor="#fac775" />
        </div>
        <div className="typing-stats-mini">
          <div className="stat-mini">
            <div className="stat-mini-val">{wpm}</div>
            <div className="stat-mini-label">WPM</div>
          </div>
          <div className="stat-mini-divider" />
          <div className="stat-mini">
            <div className="stat-mini-val">{typed.length > 0 ? accuracy : 100}%</div>
            <div className="stat-mini-label">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  );
}
