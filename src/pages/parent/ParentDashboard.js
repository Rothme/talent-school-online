import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ParentDashboard.css';

const DAYS = ['M','T','W','T','F','S','S'];
const ACTIVE_DAYS = [0,1,2,4];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile, getChildren, logout } = useAuth();
  const [children, setChildren] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadChildren = useCallback(async () => {
    if (!currentUser) return navigate('/login');
    const kids = await getChildren(currentUser.uid);
    setChildren(kids);
    setLoading(false);
    if (kids.length === 0) navigate('/parent/setup');
  }, [currentUser, getChildren, navigate]);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function handleChildView(child) {
    sessionStorage.setItem('parentPreview', JSON.stringify({
      id: child.id, name: child.name, avatar: child.avatar,
      avatarColor: child.avatarColor, studentId: child.studentId,
      learningPrefs: child.learningPrefs, progress: child.progress,
      streak: child.streak, totalXP: child.totalXP,
      lessonsComplete: child.lessonsComplete,
    }));
    navigate('/child/dashboard');
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#1a1a2e',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{width:40,height:40,borderRadius:'50%',border:'3px solid rgba(108,99,255,0.2)',borderTopColor:'#6c63ff',animation:'spin 0.8s linear infinite'}} />
    </div>
  );

  if (children.length === 0) return null;

  const child = children[activeIdx] || children[0];
  const prefs = child.learningPrefs || { chess:34, coding:33, typing:33 };
  const subjects = [
    { name:'Chess',  icon:'♟️', color:'#1d9e75', progress: child.progress?.chess  || 0, detail:`${prefs.chess}% of daily time` },
    { name:'Coding', icon:'💻', color:'#6c63ff', progress: child.progress?.coding || 0, detail:`${prefs.coding}% of daily time` },
    { name:'Typing', icon:'⌨️', color:'#ba7517', progress: child.progress?.typing || 0, detail:`${prefs.typing}% of daily time` },
  ];

  return (
    <div className="parent-dash">
      <nav className="parent-nav">
        <div className="parent-nav-logo"><span className="nav-dot" />Talent School Online</div>
        <div className="parent-nav-links">
          <span className="nav-link nav-link-active">Dashboard</span>
          <span className="nav-link" onClick={() => handleChildView(child)}>
            👁 Child view
          </span>
          <span className="nav-link" onClick={() => navigate('/parent/setup')}>+ Add child</span>
          <span className="nav-link" onClick={handleLogout}>Log out</span>
        </div>
      </nav>

      <div className="parent-body">
        <div className="parent-greeting">
          <h1 className="greeting-title">
            Welcome, {userProfile?.displayName?.split(' ')[0] || 'Parent'} 👋
          </h1>
          <p className="greeting-sub">
            Here is how your {children.length > 1 ? 'children are' : 'child is'} doing
          </p>
        </div>

        {children.length > 1 && (
          <div className="child-tabs">
            {children.map((c, i) => (
              <button key={c.id}
                className={`child-tab ${activeIdx===i ? 'child-tab-active' : ''}`}
                style={activeIdx===i ? {borderColor: c.avatarColor||'#6c63ff', color: c.avatarColor||'#6c63ff'} : {}}
                onClick={() => setActiveIdx(i)}>
                <span style={{fontSize:18}}>{c.avatar}</span> {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="student-id-display">
          <div className="sid-avatar" style={{background: child.avatarColor||'#6c63ff'}}>{child.avatar}</div>
          <div className="sid-info">
            <div className="sid-name">{child.name}, age {child.age}</div>
            <div className="sid-row">
              <span className="sid-label">Student ID:</span>
              <strong className="sid-value">{child.studentId}</strong>
            </div>
            <div className="sid-hint">Share this ID with {child.name} so they can log in independently</div>
          </div>
          <button className="sid-preview-btn" onClick={() => handleChildView(child)}>
            👁 Preview {child.name}'s view
          </button>
        </div>

        <div className="metrics-row">
          {[
            { label:'Day streak',   value:`🔥 ${child.streak||0}`,   sub:'consecutive days' },
            { label:'Total XP',     value:`⭐ ${child.totalXP||0}`,  sub:'points earned' },
            { label:'Age',          value: child.age,                 sub:'years old' },
            { label:'Subjects',     value: 3,                         sub:'active skills' },
          ].map((m,i) => (
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
            {subjects.map((s,i) => (
              <div key={i} className="subject-row">
                <div className="subject-icon">{s.icon}</div>
                <div className="subject-info">
                  <div className="subject-name">{s.name}</div>
                  <div className="subject-detail">{s.detail}</div>
                  <div className="subject-track">
                    <div className="subject-fill" style={{width:`${Math.max(s.progress,2)}%`, background:s.color}} />
                  </div>
                </div>
                <div className="subject-pct" style={{color:s.color}}>{s.progress}%</div>
              </div>
            ))}
          </div>

          <div className="dash-card">
            <h3 className="dash-card-title">📅 This week's activity</h3>
            <div className="day-row">
              {DAYS.map((d,i) => (
                <div key={i}
                  className={`day-chip ${ACTIVE_DAYS.includes(i)?'day-chip-active':''}`}
                  style={ACTIVE_DAYS.includes(i)?{background:child.avatarColor||'#6c63ff',color:'#fff'}:{}}>
                  {d}
                </div>
              ))}
            </div>
            <div className="recommendation-box">
              <div className="rec-label">Learning schedule</div>
              <div className="rec-text">
                Chess {prefs.chess}% · Coding {prefs.coding}% · Typing {prefs.typing}%
              </div>
              <button className="rec-edit-btn" onClick={() => navigate('/parent/setup')}>
                Edit preferences
              </button>
            </div>
          </div>
        </div>

        <div className="empty-projects-card">
          <div className="empty-proj-icon">🏆</div>
          <div className="empty-proj-text">
            <strong>{child.name}'s first achievement is on the way.</strong><br />
            When {child.name} completes a major project, you will be able to share it here.
          </div>
          <button className="pach-btn pach-btn-primary" onClick={() => handleChildView(child)}>
            Start learning now →
          </button>
        </div>
      </div>
    </div>
  );
}
