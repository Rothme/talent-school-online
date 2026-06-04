import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../../data/curriculum';
import './ChildDashboard.css';

const SUBJECT_EMOJIS = { coding:'💻', chess:'♟️', typing:'⌨️' };

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [isParentPreview, setIsParentPreview] = useState(false);

  useEffect(() => {
    // Check for child session (child logged in directly)
    const session = sessionStorage.getItem('childSession');
    if (session) {
      setChild(JSON.parse(session));
      setIsParentPreview(false);
      return;
    }
    // Check for parent preview mode
    const preview = sessionStorage.getItem('parentPreview');
    if (preview) {
      setChild(JSON.parse(preview));
      setIsParentPreview(true);
      return;
    }
    // No session — redirect
    navigate('/child/login');
  }, [navigate]);

  if (!child) return null;

  const prefs = child.learningPrefs || { chess:34, coding:33, typing:33 };
  const progress = child.progress || { coding:0, chess:0, typing:0 };
  const lessonsComplete = child.lessonsComplete || { coding:0, chess:0, typing:0 };

  function handleLogout() {
    sessionStorage.removeItem('childSession');
    navigate('/child/login');
  }

  function handleBackToDashboard() {
    sessionStorage.removeItem('parentPreview');
    navigate('/parent/dashboard');
  }

  return (
    <div className="child-dash">
      {isParentPreview && (
        <div className="preview-banner">
          <span>👀 You are previewing {child.name}'s learning environment</span>
          <button className="preview-back-btn" onClick={handleBackToDashboard}>
            ← Back to parent dashboard
          </button>
        </div>
      )}

      <header className="child-header">
        <div className="child-header-nav">
          <div className="header-logo">
            <span className="logo-dot" />
            Talent School Online
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div className="child-greeting-pill">
              <span style={{fontSize:20}}>{child.avatar}</span> Hi, {child.name}!
            </div>
            {!isParentPreview && (
              <button className="child-logout-btn" onClick={handleLogout}>Log out</button>
            )}
          </div>
        </div>

        <div className="child-hero">
          <h1 className="child-hero-title">What are we learning today?</h1>
          <p className="child-hero-sub">
            Ms. Momo is ready — pick a subject and let's go!
          </p>
        </div>

        <div className="child-streak-bar">
          <div className="streak-item">🔥 <strong>{child.streak || 0}</strong> day streak</div>
          <div className="streak-item">⭐ <strong>{child.totalXP || 0}</strong> XP total</div>
          <div className="streak-item">🆔 <strong>{child.studentId}</strong></div>
        </div>
      </header>

      <main className="subject-grid">
        {Object.values(SUBJECTS).map(subject => {
          const pct = prefs[subject.id] || 33;
          const done = lessonsComplete[subject.id] || 0;
          const total = subject.id === 'chess' ? 6 : subject.id === 'typing' ? 8 : 10;
          const progPct = Math.round((done / total) * 100);
          return (
            <button
              key={subject.id}
              className="subject-card"
              style={{'--subject-color': subject.color, '--subject-pale': subject.pale}}
              onClick={() => navigate(`/child/lesson/${subject.id}`)}
              aria-label={`Go to ${subject.name}`}
            >
              <div className="subject-emoji">{SUBJECT_EMOJIS[subject.id]}</div>
              <div className="subject-card-body">
                <h2 className="subject-card-title">{subject.name}</h2>
                <p className="subject-card-desc">{subject.description}</p>
                <div className="subject-pref-tag" style={{color: subject.color, background: subject.pale}}>
                  {pct}% of your daily time
                </div>
                <div className="subject-prog-wrap">
                  <div className="subject-prog-track">
                    <div className="subject-prog-fill" style={{width:`${progPct}%`}} />
                  </div>
                  <span className="subject-prog-label">{done}/{total} lessons</span>
                </div>
              </div>
              <div className="subject-card-arrow">→</div>
            </button>
          );
        })}
      </main>

      <section className="projects-preview">
        <h2 className="section-title">My projects</h2>
        <div className="projects-row">
          <div className="project-card-sm project-placeholder">
            <div className="proj-icon">🚀</div>
            <div className="proj-info">
              <div className="proj-name">Your first project is coming</div>
              <div className="proj-meta">Complete lessons to unlock your first project</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
