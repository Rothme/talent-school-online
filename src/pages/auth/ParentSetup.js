import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Setup.css';

const AVATARS = ['👦','👧','🧒','👶','🧑'];
const COLORS  = ['#6c63ff','#1d9e75','#ba7517','#e24b4a','#185fa5'];
const SUBJECTS = [
  { id: 'chess',  label: 'Chess',  icon: '♟️', desc: 'Strategy & thinking' },
  { id: 'coding', label: 'Coding', icon: '💻', desc: 'Build real things' },
  { id: 'typing', label: 'Typing', icon: '⌨️', desc: 'Speed & accuracy' },
];

function PinInput({ value, onChange }) {
  const digits = value.split('');
  return (
    <div className="pin-input-row">
      {[0,1,2,3].map(i => (
        <input
          key={i} id={`pin-${i}`}
          className="pin-input-box"
          type="password" inputMode="numeric" maxLength={1}
          value={digits[i] || ''}
          onChange={e => {
            const val = e.target.value.replace(/\D/,'');
            const arr = value.split('');
            arr[i] = val;
            onChange(arr.join('').slice(0,4));
            if (val && i < 3) document.getElementById(`pin-${i+1}`)?.focus();
          }}
        />
      ))}
    </div>
  );
}

export default function ParentSetup() {
  const { currentUser, addChild, getChildren } = useAuth();
  const navigate = useNavigate();
  const [step, setStep]           = useState('loading');
  const [children, setChildren]   = useState([]);
  const [newStudentId, setNewStudentId] = useState('');

  const [childName, setChildName]     = useState('');
  const [childAge, setChildAge]       = useState('');
  const [avatar, setAvatar]           = useState('👧');
  const [avatarColor, setAvatarColor] = useState('#6c63ff');
  const [pin, setPin]                 = useState('');
  const [pinConfirm, setPinConfirm]   = useState('');
  const [prefs, setPrefs]             = useState({ chess: 34, coding: 33, typing: 33 });
  const [error, setError]             = useState('');
  const [saving, setSaving]           = useState(false);

  const checkChildren = useCallback(async () => {
    if (!currentUser) return navigate('/login');
    const kids = await getChildren(currentUser.uid);
    setChildren(kids);
    setStep(kids.length === 0 ? 'welcome' : 'done');
  }, [currentUser, getChildren, navigate]);

  useEffect(() => { checkChildren(); }, [checkChildren]);

  function resetForm() {
    setChildName(''); setChildAge(''); setAvatar('👧');
    setAvatarColor('#6c63ff'); setPin(''); setPinConfirm('');
    setPrefs({ chess: 34, coding: 33, typing: 33 });
    setError(''); setNewStudentId('');
  }

  function totalPrefs() { return prefs.chess + prefs.coding + prefs.typing; }

  function adjustPref(subject, delta) {
    setPrefs(p => {
      const newVal = Math.max(10, Math.min(80, p[subject] + delta));
      const others = SUBJECTS.filter(s => s.id !== subject).map(s => s.id);
      const remainder = 100 - newVal;
      const otherTotal = p[others[0]] + p[others[1]];
      const newPrefs = { ...p, [subject]: newVal };
      if (otherTotal > 0) {
        newPrefs[others[0]] = Math.max(10, Math.round(p[others[0]] / otherTotal * remainder));
        newPrefs[others[1]] = 100 - newVal - newPrefs[others[0]];
        if (newPrefs[others[1]] < 10) {
          newPrefs[others[1]] = 10;
          newPrefs[others[0]] = 100 - newVal - 10;
        }
      }
      return newPrefs;
    });
  }

  async function saveChild() {
    if (!childName.trim()) return setError("Please enter your child's name.");
    if (!childAge || childAge < 6 || childAge > 13) return setError('Age must be between 6 and 13.');
    if (pin.length !== 4) return setError('PIN must be exactly 4 digits.');
    if (pin !== pinConfirm) return setError('PINs do not match. Please try again.');
    if (totalPrefs() !== 100) return setError('Learning preferences must add up to 100%.');
    setError(''); setSaving(true);
    try {
      const result = await addChild(currentUser.uid, {
        name: childName.trim(), age: parseInt(childAge),
        avatar, avatarColor, pin, learningPrefs: prefs,
      });
      setNewStudentId(result.studentId);
      const updated = await getChildren(currentUser.uid);
      setChildren(updated);
      setStep('id-reveal');
    } catch (e) {
      setError('Could not save. Please try again.');
    }
    setSaving(false);
  }

  if (step === 'loading') return (
    <div className="setup-loading"><div className="setup-spinner" /></div>
  );

  if (step === 'welcome') return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="setup-welcome-icon">🎉</div>
        <h1 className="setup-title">Welcome! Let's set up your child's profile.</h1>
        <p className="setup-sub">
          You will create a profile for each child — including a unique Student ID,
          a 4-digit PIN, and a personalised learning schedule.
        </p>
        <button className="setup-btn-primary" onClick={() => setStep('child-info')}>
          Add my first child →
        </button>
      </div>
    </div>
  );

  if (step === 'child-info') return (
    <div className="setup-page">
      <div className="setup-card setup-card-wide">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="setup-progress">
          <div className="setup-prog-step setup-prog-active">1. Child info</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step">2. Set PIN</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step">3. Learning schedule</div>
        </div>
        <h2 className="setup-section-title">Tell us about your child</h2>
        {error && <div className="setup-error">{error}</div>}
        <div className="field">
          <label className="field-label">Child's first name</label>
          <input className="field-input" type="text" placeholder="e.g. Chidera"
            value={childName} onChange={e => setChildName(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Age</label>
          <input className="field-input" type="number" min="6" max="13"
            placeholder="Between 6 and 13"
            value={childAge} onChange={e => setChildAge(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Choose an avatar</label>
          <div className="avatar-picker">
            {AVATARS.map((av, i) => (
              <button key={av}
                className={`avatar-option ${avatar === av ? 'avatar-selected' : ''}`}
                style={avatar === av ? { background: COLORS[i], borderColor: COLORS[i] } : {}}
                onClick={() => { setAvatar(av); setAvatarColor(COLORS[i]); }}>
                {av}
              </button>
            ))}
          </div>
        </div>
        {childName && (
          <div className="setup-preview">
            <div className="setup-preview-avatar" style={{ background: avatarColor }}>{avatar}</div>
            <div className="setup-preview-name">{childName}, {childAge || '—'}</div>
          </div>
        )}
        <button className="setup-btn-primary" onClick={() => {
          if (!childName.trim()) return setError("Please enter your child's name.");
          if (!childAge || childAge < 6 || childAge > 13) return setError('Age must be between 6 and 13.');
          setError(''); setStep('pin');
        }}>Next — Set PIN →</button>
      </div>
    </div>
  );

  if (step === 'pin') return (
    <div className="setup-page">
      <div className="setup-card setup-card-wide">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="setup-progress">
          <div className="setup-prog-step setup-prog-done">1. Child info ✓</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step setup-prog-active">2. Set PIN</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step">3. Learning schedule</div>
        </div>
        <div className="pin-avatar-display" style={{ background: avatarColor }}>{avatar}</div>
        <h2 className="setup-section-title">Create {childName}'s 4-digit PIN</h2>
        <p className="setup-sub">Your child uses this PIN together with their Student ID to log in.</p>
        {error && <div className="setup-error">{error}</div>}
        <div className="field">
          <label className="field-label">Enter PIN</label>
          <PinInput value={pin} onChange={setPin} />
        </div>
        <div className="field" style={{ marginTop: 16 }}>
          <label className="field-label">Confirm PIN</label>
          <PinInput value={pinConfirm} onChange={setPinConfirm} />
        </div>
        <div className="setup-btn-row">
          <button className="setup-btn-secondary" onClick={() => setStep('child-info')}>← Back</button>
          <button className="setup-btn-primary" onClick={() => {
            if (pin.length !== 4) return setError('PIN must be exactly 4 digits.');
            if (pin !== pinConfirm) return setError('PINs do not match.');
            setError(''); setStep('prefs');
          }}>Next — Learning schedule →</button>
        </div>
      </div>
    </div>
  );

  if (step === 'prefs') return (
    <div className="setup-page">
      <div className="setup-card setup-card-wide">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="setup-progress">
          <div className="setup-prog-step setup-prog-done">1. Child info ✓</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step setup-prog-done">2. Set PIN ✓</div>
          <div className="setup-prog-divider" />
          <div className="setup-prog-step setup-prog-active">3. Learning schedule</div>
        </div>
        <h2 className="setup-section-title">How should {childName} spend their learning time?</h2>
        <p className="setup-sub">Adjust how much of each daily session goes to each skill. Must total 100%.</p>
        {error && <div className="setup-error">{error}</div>}
        <div className="prefs-list">
          {SUBJECTS.map(s => (
            <div key={s.id} className="pref-row">
              <div className="pref-icon">{s.icon}</div>
              <div className="pref-info">
                <div className="pref-name">{s.label}</div>
                <div className="pref-desc">{s.desc}</div>
                <div className="pref-track">
                  <div className="pref-fill" style={{
                    width: `${prefs[s.id]}%`,
                    background: s.id==='chess' ? '#1d9e75' : s.id==='coding' ? '#6c63ff' : '#ba7517'
                  }} />
                </div>
              </div>
              <div className="pref-controls">
                <button className="pref-btn" onClick={() => adjustPref(s.id, -5)}>−</button>
                <span className="pref-val">{prefs[s.id]}%</span>
                <button className="pref-btn" onClick={() => adjustPref(s.id, 5)}>+</button>
              </div>
            </div>
          ))}
        </div>
        <div className={`prefs-total ${totalPrefs()===100 ? 'prefs-total-ok' : 'prefs-total-err'}`}>
          Total: {totalPrefs()}% {totalPrefs()===100 ? '✓ Perfect' : '— must equal 100%'}
        </div>
        <div className="setup-btn-row">
          <button className="setup-btn-secondary" onClick={() => setStep('pin')}>← Back</button>
          <button className="setup-btn-primary" onClick={saveChild} disabled={saving}>
            {saving ? 'Saving...' : `Save ${childName}'s profile →`}
          </button>
        </div>
      </div>
    </div>
  );

  if (step === 'id-reveal') return (
    <div className="setup-page">
      <div className="setup-card setup-card-wide">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="id-reveal-icon">🎓</div>
        <h2 className="setup-section-title" style={{textAlign:'center'}}>
          {childName}'s Student ID is ready!
        </h2>
        <p className="setup-sub">
          Save this Student ID. Your child will use it together with their PIN to log in independently.
        </p>
        <div className="student-id-box">
          <div className="student-id-label">Student ID</div>
          <div className="student-id-value">{newStudentId}</div>
          <div className="student-id-hint">
            Share this with {childName} — they need it every time they log in
          </div>
        </div>
        <div className="id-instructions">
          <div className="id-instruction-row">
            <span className="id-step">1</span>
            Write down or save this Student ID
          </div>
          <div className="id-instruction-row">
            <span className="id-step">2</span>
            Give it to {childName} along with their PIN
          </div>
          <div className="id-instruction-row">
            <span className="id-step">3</span>
            {childName} can log in independently at any time from the home page
          </div>
        </div>
        <button className="setup-btn-primary" onClick={() => setStep('done')}>
          Got it — continue →
        </button>
      </div>
    </div>
  );

  if (step === 'done') return (
    <div className="setup-page">
      <div className="setup-card setup-card-wide">
        <div className="setup-logo"><span className="setup-dot" />Talent School Online</div>
        <div className="setup-welcome-icon">✅</div>
        <h1 className="setup-title">
          {children.length === 1
            ? `${children[0].name}'s profile is ready!`
            : `${children.length} profiles ready!`}
        </h1>
        <div className="children-summary">
          {children.map(c => (
            <div key={c.id} className="child-summary-row">
              <div className="child-sum-avatar" style={{ background: c.avatarColor || '#6c63ff' }}>
                {c.avatar}
              </div>
              <div className="child-sum-info">
                <div className="child-sum-name">{c.name}, age {c.age}</div>
                <div className="child-sum-id">Student ID: <strong>{c.studentId}</strong></div>
                <div className="child-sum-prefs">
                  Chess {c.learningPrefs?.chess}% · Coding {c.learningPrefs?.coding}% · Typing {c.learningPrefs?.typing}%
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="setup-btn-primary" onClick={() => navigate('/parent/dashboard')}>
          Go to dashboard →
        </button>
        <button className="setup-btn-secondary" style={{ marginTop: 10, width: '100%' }}
          onClick={() => { resetForm(); setStep('child-info'); }}>
          + Add another child
        </button>
      </div>
    </div>
  );
}
