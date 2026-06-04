import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ParentDashboard.css';

const DAYS = ['M','T','W','T','F','S','S'];
const ACTIVE_DAYS = [0,1,2,4];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState('chidera');
  const [shareVisible, setShareVisible] = useState(false);

  const children = {
    chidera: {
      name: 'Chidera', age: 10, avatar: '👧',
      color: '#6c63ff', pale: '#eeedfe',
      streak: 7, totalXP: 420, daysActive: 5,
      timeThisWeek: '3.2h', lastSeen: 'Today',
      alert: { type: 'absence', message: "Chidera hasn't opened Chess in 4 days. A little nudge could help her get back on track." },
      subjects: [
        { name: 'Coding', icon: '💻', color: '#6c63ff', progress: 35, detail: 'Lesson 3 of 10 · Beginner' },
        { name: 'Chess', icon: '♟️', color: '#1d9e75', progress: 20, detail: 'Lesson 2 of 6 · Beginner' },
        { name: 'Typing', icon: '⌨️', color: '#ba7517', progress: 75, detail: '42 WPM · 96% accuracy' },
      ],
      latestProject: {
        title: 'Number Guessing Game',
        subject: 'Coding',
        desc: 'Chidera built a fully working Python game that picks a secret number and lets the player guess. This took 4 weeks of consistent effort — a huge achievement.',
        date: '2 days ago',
        url: 'talent-school-online.pages.dev/projects/chidera/guessing-game',
      },
      recommendation: "Chidera is excelling at Typing — 42 WPM this week, a new personal best! Encourage her to spend 10 extra minutes on Chess this weekend.",
    },
    temi: {
      name: 'Temi', age: 8, avatar: '👦',
      color: '#1d9e75', pale: '#e1f5ee',
      streak: 3, totalXP: 180, daysActive: 3,
      timeThisWeek: '1.8h', lastSeen: 'Yesterday',
      alert: null,
      subjects: [
        { name: 'Coding', icon: '💻', color: '#6c63ff', progress: 10, detail: 'Lesson 1 of 10 · Beginner' },
        { name: 'Chess', icon: '♟️', color: '#1d9e75', progress: 15, detail: 'Lesson 1 of 6 · Beginner' },
        { name: 'Typing', icon: '⌨️', color: '#ba7517', progress: 20, detail: '18 WPM · 88% accuracy' },
      ],
      latestProject: null,
      recommendation: "Temi is just getting started — great consistency this week! Keep encouraging short daily sessions rather than long ones.",
    },
  };

  const child = children[activeChild];

  return (
    <div className="parent-dash">
      <nav className="parent-nav">
        <div className="parent-nav-logo">
          <span className="nav-dot" />
          Talent School Online
        </div>
        <div className="parent-nav-links">
          <span className="nav-link nav-link-active">Dashboard</span>
          <span className="nav-link" onClick={() => navigate('/child/dashboard')}>Child view</span>
          <span className="nav-link">Reports</span>
          <span className="nav-link">Account</span>
        </div>
      </nav>

      <div className="parent-body">
        <div className="parent-greeting">
          <div>
            <h1 className="greeting-title">Good morning! 👋</h1>
            <p className="greeting-sub">Here's how your children are doing this week</p>
          </div>
        </div>

        <div className="child-tabs">
          {Object.entries(children).map(([key, c]) => (
            <button
              key={key}
              className={`child-tab ${activeChild === key ? 'child-tab-active' : ''}`}
              style={activeChild === key ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => setActiveChild(key)}
            >
              <span>{c.avatar}</span>
              {c.name}
              {c.alert && <span className="tab-alert-dot" />}
            </button>
          ))}
        </div>

        {child.alert && (
          <div className="alert-card">
            <div className="alert-icon">🔔</div>
            <div className="alert-body">
              <div className="alert-text">{child.alert.message}</div>
              <button className="alert-btn">Send {child.name} a message</button>
            </div>
          </div>
        )}

        <div className="metrics-row">
          {[
            { label: 'Days active', value: child.daysActive, sub: 'this week' },
            { label: 'Time learning', value: child.timeThisWeek, sub: 'this week' },
            { label: 'Day streak', value: `🔥 ${child.streak}`, sub: 'consecutive days' },
            { label: 'Total XP', value: `⭐ ${child.totalXP}`, sub: 'points earned' },
          ].map((m, i) => (
            <div key={i} className="metric-card">
              <div className="metric-label">{m.label}</div>
              <div className="metric-val">{m.value}</div>
              <div className="metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          <div className="dash-card">
            <h3 className="dash-card-title">📊 Subject progress</h3>
            {child.subjects.map((s, i) => (
              <div key={i} className="subject-row">
                <div className="subject-icon">{s.icon}</div>
                <div className="subject-info">
                  <div className="subject-name">{s.name}</div>
                  <div className="subject-detail">{s.detail}</div>
                  <div className="subject-track">
                    <div className="subject-fill" style={{ width: `${s.progress}%`, background: s.color }} />
                  </div>
                </div>
                <div className="subject-pct" style={{ color: s.color }}>{s.progress}%</div>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">📅 This week's activity</h3>
            <div className="day-row">
              {DAYS.map((d, i) => (
                <div key={i}
                  className={`day-chip ${ACTIVE_DAYS.includes(i) ? 'day-chip-active' : ''} ${i === 4 ? 'day-chip-today' : ''}`}
                  style={ACTIVE_DAYS.includes(i) ? { background: child.color, color: '#fff' } : {}}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="recommendation-box">
              <div className="rec-label">Ms. Momo recommends</div>
              <div className="rec-text">{child.recommendation}</div>
            </div>
          </div>
        </div>

        {child.latestProject && (
          <div className="project-achievement-card">
            <div className="project-ach-header">
              <div className="project-ach-title">
                🏆 Latest achievement — share with family
              </div>
              <span className="new-badge">New</span>
            </div>
            <div className="project-ach-body">
              <div className="project-ach-name">{child.latestProject.title}</div>
              <div className="project-ach-desc">{child.latestProject.desc}</div>
              <div className="project-ach-actions">
                <button className="pach-btn pach-btn-primary"
                  onClick={() => setShareVisible(true)}>
                  📱 Share to WhatsApp
                </button>
                <button className="pach-btn">📄 Download certificate</button>
                <button className="pach-btn"
                  onClick={() => window.open(`https://${child.latestProject.url}`)}>
                  👁️ View project
                </button>
              </div>
            </div>
          </div>
        )}

        {shareVisible && (
          <div className="share-modal-backdrop" onClick={() => setShareVisible(false)}>
            <div className="share-modal" onClick={e => e.stopPropagation()}>
              <div className="share-card-preview">
                <div className="sc-header-row">
                  <span className="sc-dot" />
                  <span className="sc-brand">Talent School Online</span>
                </div>
                <div className="sc-avatar-big">{child.avatar}</div>
                <div className="sc-child-name">{child.name} Olawale</div>
                <div className="sc-child-meta">Age {child.age} · Lagos, Nigeria</div>
                <div className="sc-achievement-box">
                  <div className="sc-ach-tag">Achievement unlocked</div>
                  <div className="sc-ach-title">{child.latestProject?.title}</div>
                  <div className="sc-ach-desc">{child.latestProject?.desc}</div>
                </div>
                <div className="sc-stats-row">
                  <div className="sc-stat"><div className="sc-stat-val">42</div><div className="sc-stat-lbl">WPM</div></div>
                  <div className="sc-stat"><div className="sc-stat-val">{child.streak}</div><div className="sc-stat-lbl">Streak</div></div>
                  <div className="sc-stat"><div className="sc-stat-val">3</div><div className="sc-stat-lbl">Skills</div></div>
                </div>
                <div className="sc-footer-row">
                  <span className="sc-url">talentschoolonline.com</span>
                  <span className="sc-cert-badge">Certified</span>
                </div>
              </div>
              <div className="share-modal-actions">
                <button className="share-wa-btn">📱 Open in WhatsApp</button>
                <button className="share-copy-btn" onClick={() => setShareVisible(false)}>✕ Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
