import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const DEMO_CHILDREN = [
  { id: '1', name: 'Chidera', avatar: '👧', color: '#6c63ff' },
  { id: '2', name: 'Temi', avatar: '👦', color: '#1d9e75' },
  { id: '3', name: 'Adaeze', avatar: '👧', color: '#ba7517' },
];

export default function ChildLogin() {
  const [pin, setPin] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChildSelect(child) {
    setSelected(child);
    setPin('');
    setError('');
  }

  function handlePinDigit(digit) {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          navigate('/child/dashboard');
        }, 300);
      }
    }
  }

  function handleDelete() {
    setPin(p => p.slice(0, -1));
  }

  return (
    <div className="auth-page child-login-page">
      <div className="child-login-card">
        <div className="auth-logo" style={{ justifyContent: 'center' }}>
          <span className="auth-logo-dot" />
          Talent School Online
        </div>

        {!selected ? (
          <>
            <h1 className="child-login-title">Who is learning today?</h1>
            <div className="child-avatars">
              {DEMO_CHILDREN.map(child => (
                <button
                  key={child.id}
                  className="child-avatar-btn"
                  style={{ '--child-color': child.color }}
                  onClick={() => handleChildSelect(child)}
                >
                  <div className="child-avatar-circle">{child.avatar}</div>
                  <div className="child-avatar-name">{child.name}</div>
                </button>
              ))}
            </div>
            <button className="back-to-parent" onClick={() => navigate('/login')}>
              ← Parent login
            </button>
          </>
        ) : (
          <>
            <div className="pin-avatar" style={{ background: selected.color }}>
              {selected.avatar}
            </div>
            <h1 className="child-login-title">Hi {selected.name}! 👋</h1>
            <p className="pin-label">Enter your 4-digit PIN</p>

            <div className="pin-dots">
              {[0,1,2,3].map(i => (
                <div key={i} className={`pin-dot ${i < pin.length ? 'pin-dot-filled' : ''}`}
                  style={{ background: i < pin.length ? selected.color : undefined }} />
              ))}
            </div>

            {error && <div className="auth-error">{error}</div>}

            <div className="pin-pad">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
                <button
                  key={i}
                  className={`pin-key ${key === '' ? 'pin-key-empty' : ''}`}
                  onClick={() => key === '⌫' ? handleDelete() : key !== '' ? handlePinDigit(key) : null}
                  disabled={key === ''}
                >
                  {key}
                </button>
              ))}
            </div>

            <button className="back-to-parent" onClick={() => setSelected(null)}>
              ← Not me
            </button>
          </>
        )}
      </div>
    </div>
  );
}
