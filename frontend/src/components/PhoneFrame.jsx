import React from 'react';

/* Mini SVG icons (no external lib needed) */
const Signal = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
    <rect x="0" y="6" width="3" height="6" rx="1"/>
    <rect x="4.5" y="4" width="3" height="8" rx="1"/>
    <rect x="9" y="2" width="3" height="10" rx="1"/>
    <rect x="13.5" y="0" width="3" height="12" rx="1" opacity=".3"/>
  </svg>
);
const Wifi = () => (
  <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 6C6 1.5 18 1.5 22.5 6"/>
    <path d="M5 10.5c3.5-3.5 10.5-3.5 14 0"/>
    <path d="M9 14.5c1.5-1.5 5-1.5 6.5 0"/>
    <circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const Battery = () => (
  <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
    <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="2" y="2" width="16" height="8" rx="2" fill="currentColor"/>
    <path d="M23 4v4a2 2 0 0 0 0-4z" fill="currentColor" opacity=".4"/>
  </svg>
);

export default function PhoneFrame({
  children, counselor, onSwitchCounselor, onOpenPublicForm, onLogout,
  isFrameMode, setIsFrameMode
}) {
  return (
    <div className="app-shell">
      {/* ── Controller Bar ── */}
      <div className="ctrl-bar">
        <div className="ctrl-brand">
          <div className="ctrl-logo">F</div>
          <div>
            <div className="ctrl-title">
              Fastor CRM <span className="badge-v">v1.0</span>
            </div>
            <div className="ctrl-sub">Mobile-First Lead Claiming System</div>
          </div>
        </div>

        <div className="ctrl-actions">
          {counselor ? (
            <div className="session-pill">
              <span className="session-dot" />
              <span style={{color:'#94a3b8',fontSize:11}}>Counselor:</span>
              <span className="session-name">{counselor.name}</span>
              <span className="session-email">({counselor.email})</span>
              <button className="logout-btn" onClick={onLogout} title="Logout">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <span className="not-logged-pill">Not Logged In</span>
          )}

          <button className="btn-sm btn-orange" onClick={onOpenPublicForm}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Public Enquiry Form
          </button>

          {counselor && (
            <button className="btn-sm btn-slate" onClick={onSwitchCounselor} title="Switch between demo counselors to test lead exclusivity">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Switch Counselor
            </button>
          )}

          <button className="btn-sm btn-dark" onClick={() => setIsFrameMode(!isFrameMode)}>
            {isFrameMode ? (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>Expanded</>
            ) : (
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>Phone Frame</>
            )}
          </button>
        </div>
      </div>

      {/* ── Phone Frame ── */}
      <div className="frame-outer">
        <div className={`phone-chassis${isFrameMode ? '' : ' expanded'}`}>
          {/* Status Bar */}
          <div className="status-bar">
            <span>9:41</span>
            <div className="status-icons">
              <Signal /><Wifi /><Battery />
            </div>
          </div>

          {/* Screen */}
          <div className="screen-content">
            {children}
          </div>

          {/* Home Bar */}
          {isFrameMode && (
            <div className="home-indicator"><div className="home-bar" /></div>
          )}
        </div>
      </div>
    </div>
  );
}
