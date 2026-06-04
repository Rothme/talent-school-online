import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

export default function TopNav({ childName, streak = 0, xp = 0, backTo = '/' }) {
  const navigate = useNavigate();
  return (
    <nav className="topnav">
      <div className="topnav-left">
        <button className="topnav-back" onClick={() => navigate(backTo)} aria-label="Go back">
          &#8592;
        </button>
        <div className="topnav-logo">
          <span className="topnav-dot" aria-hidden="true" />
          Talent School Online
        </div>
      </div>
      <div className="topnav-right">
        {streak > 0 && (
          <span className="topnav-pill topnav-streak">
            🔥 {streak} day streak
          </span>
        )}
        {xp > 0 && (
          <span className="topnav-pill topnav-xp">
            ⭐ {xp} XP
          </span>
        )}
        {childName && (
          <span className="topnav-pill topnav-name">{childName}</span>
        )}
      </div>
    </nav>
  );
}
