import React from 'react';

const KEYS = [
  { num: '1', letters: '' },
  { num: '2', letters: 'ABC' },
  { num: '3', letters: 'DEF' },
  { num: '4', letters: 'GHI' },
  { num: '5', letters: 'JKL' },
  { num: '6', letters: 'MNO' },
  { num: '7', letters: 'PQRS' },
  { num: '8', letters: 'TUV' },
  { num: '9', letters: 'WXYZ' },
  null, // blank
  { num: '0', letters: '' },
  'back'
];

export default function Keypad({ onKey, onDelete }) {
  return (
    <div className="keypad">
      <div className="keypad-grid">
        {KEYS.map((k, i) => {
          if (k === null) return <div key={i} className="key blank" />;
          if (k === 'back') return (
            <button key={i} type="button" className="key backspace" onClick={onDelete} aria-label="backspace">
              {/* backspace icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            </button>
          );
          return (
            <button key={i} type="button" className="key" onClick={() => onKey(k.num)}>
              <span className="key-num">{k.num}</span>
              {k.letters && <span className="key-letters">{k.letters}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
