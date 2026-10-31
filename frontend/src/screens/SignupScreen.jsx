import React, { useState } from 'react';
import Keypad from '../components/Keypad';

export default function SignupScreen({ phone, setPhone, onGetOtp, onEmailLogin, onEmailRegister, loading, error }) {
  const [mode, setMode] = useState('phone'); // 'phone' | 'email'
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('Karan Sharma');
  const [email, setEmail] = useState('karan@fastor.com');
  const [password, setPassword] = useState('password123');

  const handleKey = (d) => { if (phone.length < 10) setPhone(phone + d); };
  const handleDel = () => setPhone(phone.slice(0, -1));

  const handlePhoneSubmit = (e) => {
    e && e.preventDefault();
    if (phone.length < 10) return alert('Please enter a valid 10-digit mobile number');
    onGetOtp(phone);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (isRegister) onEmailRegister(name, email, password, phone);
    else onEmailLogin(email, password);
  };

  return (
    <div className="signup-screen anim-in">
      <div className="signup-top">
        {/* Back + Mode Switcher Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <button type="button" className="back-btn" onClick={() => setPhone('')} aria-label="Back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div className="mode-switcher">
            <button type="button" className={`mode-tab${mode === 'phone' ? ' active' : ''}`} onClick={() => setMode('phone')}>Phone OTP</button>
            <button type="button" className={`mode-tab${mode === 'email' ? ' active' : ''}`} onClick={() => setMode('email')}>Email Login</button>
          </div>
        </div>

        {mode === 'phone' ? (
          /* ── Phone OTP flow (matches Signup.png exactly) ── */
          <>
            <h1 className="screen-title">Sign Up to Fastor</h1>
            <p className="screen-sub">Let us know your mobile number and we will send you an OTP for verification.</p>

            {/* Phone input matching Signup.png */}
            <div className="phone-input-row">
              <span className="dial-code">+91</span>
              <span className="dial-divider" />
              <input
                className="phone-field"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="- 00000"
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="button" className="big-orange-btn" onClick={handlePhoneSubmit} disabled={loading}>
              {loading ? 'Sending OTP…' : 'Get OTP'}
            </button>

            <p className="terms-text">
              By clicking, I accept the <strong>Terms &amp; Conditions</strong> and <strong>Privacy Policy</strong>
            </p>
          </>
        ) : (
          /* ── Email login / register flow ── */
          <form onSubmit={handleEmailSubmit}>
            <h1 className="screen-title" style={{ fontSize: 22 }}>{isRegister ? 'Register Counselor' : 'Counselor Login'}</h1>
            <p className="screen-sub">{isRegister ? 'Create an employee account with your company email.' : 'Access your private leads & client enquiries.'}</p>

            {error && <div className="error-box">{error}</div>}

            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-row">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  <input className="form-input" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Karan Sharma" />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Company Email</label>
              <div className="input-icon-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <input className="form-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="counselor@fastor.com" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-row">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <input className="form-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="big-orange-btn" disabled={loading}>
              {loading ? 'Processing…' : isRegister ? 'Create Account' : 'Sign In as Counselor'}
            </button>

            <div className="switch-mode-link" style={{ marginTop: 12 }}>
              <button type="button" onClick={() => setIsRegister(!isRegister)}>
                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </button>
            </div>

            <div className="demo-creds" style={{ marginTop: 12 }}>
              Demo: <code>karan@fastor.com</code> / <code>password123</code>
            </div>
          </form>
        )}
      </div>

      {/* Virtual Keypad (only in phone OTP mode, matching Signup.png) */}
      {mode === 'phone' && <Keypad onKey={handleKey} onDelete={handleDel} />}
    </div>
  );
}
