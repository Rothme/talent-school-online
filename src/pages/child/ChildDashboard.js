import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../../data/curriculum';
import './ChildDashboard.css';

const SUBJECT_EMOJIS = { coding: '💻', chess: '♟️', typing: '⌨️' };

export default function ChildDashboard({ childName = 'Student', progress = {} }) {
  const navigate = useNavigate();

  return (
    <div className="child-dash">
      <header className="child-header">
        <div className="child-header-nav">
          <div className="header-logo">
            <span className="logo-dot" />
            Talent School Online
          </div>
          <div className="child-greeting-pill">Hi, {childName}! 👋</div>
        </div>
        <div className="child-hero">
          <h1 className="child-hero-title">What are we learning today?</h1>
          <p className="child-hero-sub">Pick a subject and Ms. Momo will guide you through every step</p>
        </div>
        <div className="child-streak-bar">
          <div className="streak-item">🔥 <strong>7</strong> day streak</div>
          <div className="streak-item">⭐ <strong>420</strong> XP total</div>
          <div className="streak-item">🏆 <strong>3</strong> badges earned</div>
        </div>
      </header>

      <main className="subject-grid">
        {Object.values(SUBJECTS).map((subject) => {
          const prog = progress[subject.id] || { lessonsComplete: 0, totalLessons: 6, lastActivity: null };
          const pct = Math.round((prog.lessonsComplete / prog.totalLessons) * 100);
          return (
            <button
              key={subject.id}
              className="subject-card"
              style={{ '--subject-color': subject.color, '--subject-pale': subject.pale }}
              onClick={() => navigate(`/child/lesson/${subject.id}`)}
              aria-label={`Go to ${subject.name}`}
            >
              <div className="subject-emoji">{SUBJECT_EMOJIS[subject.id]}</div>
              <div className="subject-card-body">
                <h2 className="subject-card-title">{subject.name}</h2>
                <p className="subject-card-desc">{subject.description}</p>
                <div className="subject-prog-wrap">
                  <div className="subject-prog-track">
                    <div className="subject-prog-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="subject-prog-label">
                    {prog.lessonsComplete}/{prog.totalLessons} lessons
                  </span>
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
          <div className="project-card-sm">
            <div className="proj-icon">🎮</div>
            <div className="proj-info">
              <div className="proj-name">Guessing Game</div>
              <div className="proj-meta">Coding · 3 weeks ago</div>
            </div>
            <button className="proj-share-btn">Share</button>
          </div>
          <div className="project-card-sm project-placeholder">
            <div className="proj-icon">➕</div>
            <div className="proj-info">
              <div className="proj-name">Your next project</div>
              <div className="proj-meta">Keep learning to unlock</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
