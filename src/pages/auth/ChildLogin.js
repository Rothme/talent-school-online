/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { findTestChild } from '../../utils/testAccounts';
import './Auth.css';

export default function ChildLogin() {
  const { loginChild } = useAuth();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('id');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleIdSubmit(e) {
    e.preventDefault();
    if (!studentId.trim()) return setError('Please enter your Student ID.');
    const clean = studentId.toUpperCase().trim();
    setStudentId(clean);
    setError('');
    setStep('pin');
  }

  async function handlePinSubmitWithPin(p) {
    setError(''); setLoading(true);
    try {
      // Check test accounts first
      const testChild = findTestChild(studentId, p);
      if (testChild) {
        sessionStorage.setItem('childSession', JSON.stringify(testChild));
        navigate('/child/today');
        setLoading(false);
        return;
      }
      // Real Firebase login
      const child = await loginChild(studentId, p);
      sessionStorage.setItem('childSession', JSON.stringify({
        id: child.id, name: child.name, avatar: child.avatar,
        avatarColor: child.avatarColor, studentId: child.studentId,
        learningPrefs: child.learningPrefs, progress: child.progress,
        streak: child.streak, totalXP: child.totalXP,
        lessonsComplete: child.lessonsComplete,
      }));
      navigate('/child/today');
    } catch (err) {
      setPin('');
      if (err.code === 'child/not-found')
        setError('Student ID not found. Check with your parent.');
      else if (err.code === 'child/wrong-pin')
        setError('Wrong PIN. Please try again.');
      else
        setError('Could not log in. Please try again.');
    }
    setLoading(false);
  }

  function handlePinDigit(digit) {
    if (loading) return;
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => handlePinSubmitWithPin(newPin), 300);
      }
    }
  }

  function handleDelete() { setPin(p => p.slice(0, -1)); }

  if (step === 'id') return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" />Talent School Online</div>
        <div style={{fontSize:52, textAlign:'center', marginBottom:16}}>🎓</div>
        <h1 className="auth-title">Student login</h1>
        <p className="auth-sub">Enter the Student ID your parent gave you</p>

        {/* Test access notice */}
        <div className="test-access-box">
          <div className="test-access-label">🧪 Test children</div>
          <div className="test-access-creds">
            Chidera: <strong>TSO-0001-C</strong> PIN <strong>1234</strong><br/>
            Temi: <strong>TSO-0002-T</strong> PIN <strong>5678</strong>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleIdSubmit}>
          <div className="field">
            <label className="field-label">Your Student ID</label>
            <input className="field-input student-id-input" type="text"
              placeholder="TSO-0000-A"
              value={studentId}
              onChange={e => setStudentId(e.target.value.toUpperCase())}
              autoCapitalize="characters" required />
            <div className="field-hint">Your Student ID looks like: TSO-4829-C</div>
          </div>
          <button className="auth-btn" type="submit">Next →</button>
        </form>

        <div className="auth-switch">
          Parent? <span className="auth-link" onClick={() => navigate('/login')}>Parent login here</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="child-login-card" style={{background:'#fff',borderRadius:24,padding:'36px 28px',width:'100%',maxWidth:400,textAlign:'center',boxShadow:'0 8px 40px rgba(108,99,255,0.16)'}}>
        <div className="auth-logo" style={{justifyContent:'center'}}>
          <span className="auth-logo-dot" />Talent School Online
        </div>
        <div style={{fontSize:52, marginBottom:12}}>🔐</div>
        <h1 className="auth-title">Enter your PIN</h1>
        <p style={{fontSize:14, color:'#5a5a7a', marginBottom:8}}>
          Student ID: <strong style={{color:'#6c63ff'}}>{studentId}</strong>
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="pin-dots" style={{marginBottom:24, marginTop:16}}>
          {[0,1,2,3].map(i => (
            <div key={i} className={`pin-dot ${i < pin.length ? 'pin-dot-filled' : ''}`}
              style={i < pin.length ? {background:'#6c63ff', borderColor:'#6c63ff'} : {}} />
          ))}
        </div>

        {loading ? (
          <div style={{padding:20, color:'#5a5a7a', fontSize:14}}>Checking PIN...</div>
        ) : (
          <div className="pin-pad">
            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
              <button key={i}
                className={`pin-key ${key==='' ? 'pin-key-empty' : ''}`}
                onClick={() => key==='⌫' ? handleDelete() : key!=='' ? handlePinDigit(key) : null}
                disabled={key===''}>
                {key}
              </button>
            ))}
          </div>
        )}

        <button className="back-to-parent" onClick={() => { setStep('id'); setPin(''); setError(''); }}>
          ← Change Student ID
        </button>
      </div>
    </div>
  );
}
