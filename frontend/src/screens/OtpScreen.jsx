import React, { useState, useEffect } from 'react';
import Keypad from '../components/Keypad';

export default function OtpScreen({ phone, onVerifyOtp, onBack, onResendOtp, loading, error }) {
  const [otp, setOtp] = useState('123456');
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const handleKey = (d) => { if (otp.length < 6) setOtp(otp + d); };
  const handleDel = () => setOtp(otp.slice(0, -1));

  const handleContinue = () => {
    if (otp.length !== 6) return alert('Enter all 6 digits (default: 123456)');
    onVerifyOtp(otp);
  };

  const timerStr = `(00:${timer < 10 ? '0' + timer : timer})`;

  // Render 6 boxes (3 + dash + 3) matching OTP page.png
  const renderBoxes = (indices) => indices.map(idx => {
    const digit = otp[idx] || '';
    const isCurrent = otp.length === idx;
    return (
      <div
        key={idx}
        className={`otp-box${isCurrent ? ' active' : ''}`}
      >
        {digit ? digit : isCurrent ? <span className="otp-cursor" /> : ''}
      </div>
    );
  });

  return (
    <div className="otp-screen anim-in">
      <div className="otp-top">
        <button type="button" className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <h1 className="otp-title">6-digit code</h1>
        <p className="otp-sub">Please enter the code we've sent to</p>
        <p className="otp-phone">+91 {phone || '85330 68839'}</p>

        {/* OTP boxes — 3 dash 3 (matching OTP page.png) */}
        <div className="otp-boxes">
          {renderBoxes([0,1,2])}
          <span className="otp-dash">-</span>
          {renderBoxes([3,4,5])}
        </div>

        <div className="resend-row">
          <button type="button" className="resend-btn" onClick={() => { if (timer === 0) { setTimer(30); onResendOtp(); } }}>
            I didn't receive a code <span className="resend-timer">{timerStr}</span>
          </button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <button type="button" className="big-orange-btn" onClick={handleContinue} disabled={loading}>
          {loading ? 'Verifying…' : 'Continue'}
        </button>

        <p style={{textAlign:'center',fontSize:11,color:'#9ca3af',marginTop:10}}>
          Default staging OTP: <strong style={{color:'#374151',fontFamily:'monospace'}}>123456</strong>
        </p>
      </div>

      {/* Keypad matching OTP page.png */}
      <Keypad onKey={handleKey} onDelete={handleDel} />
    </div>
  );
}
