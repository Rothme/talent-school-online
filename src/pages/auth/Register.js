import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { registerParent } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) return setError('Please fill in all fields.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError(''); setLoading(true);
    try {
      await registerParent(email, password, name);
      setDone(true);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use')
        setError('This email is already registered. Please log in.');
      else setError('Could not create account. Please try again.');
    }
    setLoading(false);
  }

  if (done) return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" />Talent School Online</div>
        <div className="verify-icon">📧</div>
        <h1 className="auth-title">Check your email</h1>
        <p className="auth-sub">
          We sent a verification link to <strong>{email}</strong>.<br />
          Click the link in that email to activate your account.
        </p>
        <div className="verify-steps">
          <div className="verify-step"><span className="vstep-num">1</span>Open your email inbox</div>
          <div className="verify-step"><span className="vstep-num">2</span>Find the email from Talent School Online</div>
          <div className="verify-step"><span className="vstep-num">3</span>Click the verification link</div>
          <div className="verify-step"><span className="vstep-num">4</span>Return here and log in</div>
        </div>
        <button className="auth-btn" onClick={() => navigate('/login')}>
          Go to login →
        </button>
        <div className="auth-switch" style={{marginTop: 16}}>
          Didn't receive it? Check your spam folder or{' '}
          <span className="auth-link" onClick={() => setDone(false)}>try again</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" />Talent School Online</div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Start your child's learning journey today</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Your full name</label>
            <input className="field-input" type="text" placeholder="Mrs. Olawale"
              value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="At least 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login" className="auth-link">Log in</Link>
        </div>
        <div className="auth-features">
          <div className="auth-feature">✅ Chess, Coding &amp; Typing</div>
          <div className="auth-feature">✅ Ms. Momo AI Tutor</div>
          <div className="auth-feature">✅ Weekly progress reports</div>
        </div>
      </div>
    </div>
  );
}
