import React, { useState } from 'react';
import axios from 'axios';

const COURSES = [
  'Starter',
  'Main Course',
  'Desert',
  'Drinks & Bevrages',
  'Other'
];

const TIERS = [
  { label: 'Personal (4 Weeks)', price: 14.0 },
  { label: 'Medium (8 Weeks)', price: 20.0 },
  { label: 'Familiar (10 Weeks)', price: 25.0 },
  { label: 'Jumbo (12 Weeks)', price: 30.0 },
];

export default function PublicEnquiryModal({ isOpen, onClose, onEnquiryCreated }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(COURSES[0]);
  const [tier, setTier] = useState('Medium (8 Weeks)');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const reset = () => { setName(''); setEmail(''); setPhone(''); setMessage(''); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const selectedTier = TIERS.find(t => t.label === tier) || { price: 20 };
      const res = await axios.post('/api/enquiries/public', {
        name, email, phone, courseInterest: course,
        preferredTier: tier, estimatedValue: selectedTier.price, message
      });
      setSuccess(true);
      if (onEnquiryCreated) onEnquiryCreated(res.data.data);
      setTimeout(() => { setSuccess(false); reset(); onClose(); }, 2200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop anim-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {success ? (
          <div className="success-screen anim-in">
            <div className="success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <h3 className="success-title">Enquiry Submitted!</h3>
            <p className="success-desc">
              Thank you, <strong>{name}</strong>. Your enquiry has been captured in the CRM. A counselor will contact you shortly.
            </p>
            <span className="success-tag">⚡ Live in Public Leads pool</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <div className="modal-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
              </div>
              <div>
                <div className="modal-title">Client Enquiry Form</div>
                <div className="modal-sub">Public · No login required</div>
              </div>
            </div>

            {error && <div className="error-box" style={{ marginBottom: 12 }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input no-icon" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rahul Sharma" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input no-icon" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="rahul@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input no-icon" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Course of Interest *</label>
              <select className="form-input no-icon" value={course} onChange={e => setCourse(e.target.value)}>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Program Duration</label>
              <div className="tier-grid">
                {TIERS.map(t => (
                  <button key={t.label} type="button" className={`tier-btn${tier === t.label ? ' selected' : ''}`} onClick={() => setTier(t.label)}>
                    {t.label}
                    <div className="tier-price">Est: ₹{t.price}.00</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Questions / Career Goals</label>
              <textarea
                className="form-input no-icon"
                rows={2}
                style={{ resize: 'none', paddingTop: 10, paddingBottom: 10 }}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Previous background, preferred batch timing, etc."
              />
            </div>

            <button type="submit" className="big-orange-btn" disabled={loading}>
              {loading ? 'Submitting…' : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  Submit Public Enquiry
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
