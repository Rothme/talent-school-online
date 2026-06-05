/* eslint-disable */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { isTestParentLogin, TEST_PARENT, TEST_CHILDREN } from '../../utils/testAccounts';
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

    // Test account bypass
    if (isTestParentLogin(email, password)) {
      sessionStorage.setItem('testParent', JSON.stringify(TEST_PARENT));
      sessionStorage.setItem('testChildren', JSON.stringify(TEST_CHILDREN));
      setLoading(false);
      navigate('/parent/dashboard');
      return;
    }

    try {
      await login(email, password);
      navigate('/parent/setup');
    } catch (err) {
      if (err.code === 'auth/email-not-verified')
        setError('Please verify your email first. Check your inbox for the verification link.');
      else
        setError('Incorrect email or password. Please try again.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><span className="auth-logo-dot" />Talent School Online</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Log in to see your child's progress</p>

        {/* Test access notice */}
        <div className="test-access-box">
          <div className="test-access-label">🧪 Test access</div>
          <div className="test-access-creds">
            Email: <strong>test@talentschool.com</strong><br />
            Password: <strong>test1234</strong>
          </div>
        </div>

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
