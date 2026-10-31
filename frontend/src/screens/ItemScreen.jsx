import React, { useState } from 'react';

const PORTIONS = [
  { label: 'Personal (4 Slides)',  price: '$0.00'  },
  { label: 'Medium (8 Slides)',   price: '$3.00'  },
  { label: 'Familiar (10 Slides)',price: '$6.00'  },
  { label: 'Jumbo (12 Slides)',   price: '$10.00' },
];

export default function ItemScreen({ item, counselor, onBack, onClaimLead, onUpdateStatus, loading }) {
  const [qty, setQty] = useState(3);
  const [portion, setPortion] = useState('Jumbo (12 Slides)');
  const [note, setNote] = useState('');

  if (!item) return null;

  const isEnquiry     = 'courseInterest' in item || 'claimedBy' in item;
  const isClaimedByMe = isEnquiry && item.claimedBy &&
    (item.claimedBy === counselor?._id || item.claimedBy?._id === counselor?._id || item.claimedByEmail === counselor?.email);
  const isUnclaimed   = isEnquiry && !item.claimedBy;

  const heroImg = item?.logo ||
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80';

  const title = isEnquiry ? item.courseInterest : (item?.restaurant_name || 'Lorem ipsum dolor sit amet');
  const desc  = isEnquiry
    ? (item.message || 'Prospective student enquiry captured via the online form. The student is eager to learn about the syllabus, mentorship, and career placement opportunities.')
    : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.';

  const badgeClass = isClaimedByMe ? 'my-claimed' : (isUnclaimed ? 'unclaimed' : 'private');
  const badgeLabel = isClaimedByMe ? '✓ Claimed by You' : (isUnclaimed ? 'Unclaimed Lead' : 'Claimed (Private)');

  const ctaLabel = isUnclaimed
    ? 'Claim Lead Exclusively'
    : isClaimedByMe
    ? 'Update Lead & Mark Contacted'
    : isEnquiry
    ? 'Lead Already Claimed'
    : 'Add to cart';

  const ctaDisabled = loading || (isEnquiry && !isUnclaimed && !isClaimedByMe);

  const handleCta = () => {
    if (isUnclaimed) onClaimLead(item._id);
    else if (isClaimedByMe) { onUpdateStatus(item._id, 'contacted', note); setNote(''); }
    else if (!isEnquiry) alert(`Added ${qty} × ${title} (${portion}) to cart!`);
  };

  return (
    <div className="detail-screen anim-in">
      {/* Hero Image (itempage.png — rounded bottom, back button overlay) */}
      <div className="detail-hero">
        <img
          src={heroImg} alt={title} loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80'; }}
        />
        <div className="hero-gradient" />
        <button className="hero-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {isEnquiry && (
          <span className={`hero-badge ${badgeClass}`}>{badgeLabel}</span>
        )}
      </div>

      {/* Body */}
      <div className="detail-body">
        {/* Price + Stepper (itempage.png) */}
        <div className="price-stepper-row">
          <span className="detail-price">₹{item?.estimatedValue || '14.00'}</span>
          <div className="stepper">
            <button className="step-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="decrease">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
            <span className="step-count">{qty}</span>
            <button className="step-btn" onClick={() => setQty(qty + 1)} aria-label="increase">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>

        {/* Title & Desc (itempage.png) */}
        <h2 className="detail-title">{title}</h2>
        <p  className="detail-desc">{desc}</p>

        {/* Client Contact Info (only for enquiries) */}
        {isEnquiry && (
          <div className="client-card">
            <div className="client-card-title">Prospective Student</div>
            <div className="client-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <strong>{item.name}</strong>
            </div>
            <div className="client-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href={`mailto:${item.email}`}>{item.email}</a>
            </div>
            <div className="client-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.07 6.07l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <a href={`tel:${item.phone}`} style={{fontFamily:'monospace'}}>{item.phone}</a>
            </div>
            <div className="client-row" style={{color:'#9ca3af',fontSize:11}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* "Personal portion" section (itempage.png) */}
        <h3 className="portion-section-title">Personal portion</h3>
        <div className="portion-list">
          {PORTIONS.map(p => (
            <div key={p.label} className="portion-row" onClick={() => setPortion(p.label)}>
              <span className="portion-label">{p.label}</span>
              <span className="portion-dots" />
              <span className="portion-price">{p.price}</span>
              <div className={`radio-outer${portion === p.label ? ' selected' : ''}`}>
                {portion === p.label && <div className="radio-inner" />}
              </div>
            </div>
          ))}
        </div>

        {/* Counselor note input (if claimed by me) */}
        {isClaimedByMe && (
          <div className="note-box">
            <label>Add Progress Note</label>
            <div className="note-row">
              <input
                className="note-input" type="text" value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Called client, interested in Monday batch…"
              />
              <button className="note-save" onClick={() => { if (note.trim()) { onUpdateStatus(item._id, item.status, note); setNote(''); } }}>
                Save
              </button>
            </div>
            {item.notes?.length > 0 && (
              <div className="notes-history">
                {item.notes.map((n, i) => (
                  <div key={i} className="note-item"><strong>{n.author}:</strong> {n.note}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sticky "Add to cart" / "Claim Lead" CTA (itempage.png) */}
      <div className="sticky-cta">
        <button className="big-orange-btn" onClick={handleCta} disabled={ctaDisabled}>
          {loading ? 'Processing…' : ctaLabel}
        </button>
      </div>
    </div>
  );
}
