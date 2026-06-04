import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/parent/setup');
    } catch (err) {
      if (err.code === 'auth/email-not-verified')
        setError('Please verify your email first. Check your inbox for the verification link.');
      else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password')
        setError('Incorrect email or password. Please try again.');
      else setError('Could not log in. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" />Talent School Online</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to see your child's progress</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Email address</label>
            <input className="field-input" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="Your password"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="auth-switch">
          New here? <Link to="/register" className="auth-link">Create an account</Link>
        </div>
        <div className="auth-divider">or</div>
        <button className="child-login-btn" onClick={() => navigate('/child/login')}>
          👧 I am a student — child login
        </button>
      </div>
    </div>
  );
}
