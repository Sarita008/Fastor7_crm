import React, { useState } from 'react';

// Best seller thumbnails from Homepage.png (food imagery matching the design)
const BEST_SELLERS = [
  { id: 1, img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&q=80', price: '$103.0', label: 'Full Stack MERN' },
  { id: 2, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80',   price: '$50.0',  label: 'Data Science & AI' },
  { id: 3, img: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&q=80', price: '$12.99', label: 'Cloud DevOps' },
  { id: 4, img: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&q=80', price: '$8.20',  label: 'UI/UX Design' },
];

const ITEM_IMGS = [
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80',
];

export default function HomeScreen({
  counselor, publicEnquiries, myEnquiries, fastorRestaurants,
  onClaimLead, onSelectLead, onSelectRestaurant, onOpenPublicForm,
  onRefresh, loading
}) {
  const [tab, setTab] = useState('public');
  const [dot, setDot] = useState(2);
  const [search, setSearch] = useState('');
  const [navTab, setNavTab] = useState('home');

  const filterLeads = (arr) => {
    if (!search.trim()) return arr;
    const q = search.toLowerCase();
    return arr.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.courseInterest || '').toLowerCase().includes(q)
    );
  };

  const pubLeads = filterLeads(publicEnquiries);
  const myLeads  = filterLeads(myEnquiries);

  return (
    <div className="home-screen anim-in" style={{position:'relative'}}>

      {/* ── Header (Homepage.png) ── */}
      <div className="home-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div className="location-label">Current Locations</div>
            <div className="location-name">Model Town, New Delhi</div>
          </div>
          <button
            onClick={onRefresh} title="Refresh data"
            style={{background:'#f3f4f6',border:'none',borderRadius:99,width:30,height:30,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#6b7280',marginTop:4}}
          >
            <svg className={loading ? 'spinning' : ''} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
        </div>

        {/* Search + Coral Call + Blue Wallet (Homepage.png) */}
        <div className="search-row">
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={counselor?.name?.split(' ')[0] || 'Search leads…'}
            />
          </div>
          {/* Coral Phone button (Homepage.png) */}
          <button className="action-btn coral" onClick={() => alert('Calling helpline…')} aria-label="Call">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.07 6.07l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </button>
          {/* Blue Wallet button (Homepage.png) */}
          <button className="action-btn blue" onClick={() => alert(`Active claimed leads: ${myEnquiries.length}`)} aria-label="Wallet">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 7H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM1 7V5a2 2 0 0 1 2-2h14l4 4H1z"/><circle cx="17" cy="14" r="1.5" fill="#fff"/></svg>
          </button>
        </div>
      </div>

      {/* ── Best Seller Horizontal Scroll (Homepage.png) ── */}
      <div style={{marginBottom:16, marginTop:4}}>
        <div className="section-header">
          <span className="section-title">Best Seller</span>
          <button className="see-all">See all</button>
        </div>
        <div className="best-seller-scroll">
          {BEST_SELLERS.map(item => (
            <div key={item.id} className="best-card" onClick={() => onSelectRestaurant({restaurant_name: item.label, logo: item.img, estimatedValue: parseFloat(item.price.replace('$',''))})}>
              <img src={item.img} alt={item.label} loading="lazy" />
              <div className="best-card-overlay" />
              <span className="price-badge">{item.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 30% OFF Banner (Homepage.png) ── */}
      <div className="banner-section" style={{marginBottom:4}}>
        <div className="banner" onClick={onOpenPublicForm}>
          <div className="banner-decor-1" />
          <div className="banner-decor-2" />
          <div className="banner-text">
            <span className="banner-sub">Experience our delicious new dish</span>
            <span className="banner-offer">30% OFF</span>
          </div>
          <div className="banner-img">
            <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80" alt="Pizza promo" loading="lazy" />
          </div>
        </div>
        {/* Carousel dots */}
        <div className="carousel-dots">
          {[0,1,2,3,4].map(i => (
            <button key={i} className={`dot${dot === i ? ' active' : ''}`} onClick={() => setDot(i)} />
          ))}
        </div>
      </div>

      {/* ── Popular Items / Leads section header ── */}
      <div style={{padding:'8px 18px 4px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <span className="section-title">Popular Items</span>
        <span style={{fontSize:11, color:'#6b7280'}}>Counselor: <strong style={{color:'#FF5200'}}>{counselor?.name?.split(' ')[0] || 'Karan'}</strong></span>
      </div>

      {/* ── CRM Tab Bar ── */}
      <div className="tab-bar-wrap">
        <div className="tab-bar">
          <button className={`tab-btn${tab === 'public' ? ' active' : ''}`} onClick={() => setTab('public')}>
            Public Leads <span className="count-pill">{publicEnquiries.length}</span>
          </button>
          <button className={`tab-btn${tab === 'claimed' ? ' active' : ''}`} onClick={() => setTab('claimed')}>
            My Claimed <span className="count-pill">{myEnquiries.length}</span>
          </button>
          <button className={`tab-btn${tab === 'fastor' ? ' active' : ''}`} onClick={() => setTab('fastor')}>
            Fastor API <span className="count-pill">{fastorRestaurants.length || '—'}</span>
          </button>
        </div>
      </div>

      {/* ── Item Lists (Homepage.png "Popular Items" card layout) ── */}

      {/* TAB 1: Public Enquiries */}
      {tab === 'public' && (
        <div className="item-list">
          {pubLeads.length === 0 ? (
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 8px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h4>No Unclaimed Public Enquiries</h4>
              <p>All leads have been claimed or none match your search.</p>
              <button className="pill-solid" onClick={onOpenPublicForm} style={{margin:'0 auto', display:'flex'}}>+ New Client Lead</button>
            </div>
          ) : pubLeads.map((lead, idx) => (
            <div key={lead._id} className="item-card">
              <div className="item-thumb" onClick={() => onSelectLead(lead)}>
                <img src={ITEM_IMGS[idx % ITEM_IMGS.length]} alt={lead.name} loading="lazy" />
                <span className="item-thumb-badge">NEW</span>
              </div>
              <div className="item-body">
                <div className="item-top-row">
                  <span className="item-title" onClick={() => onSelectLead(lead)}>{lead.name}</span>
                  <span className="item-price">₹{lead.estimatedValue || '20.00'}</span>
                </div>
                <div className="item-course">{lead.courseInterest}</div>
                <div className="item-meta">
                  <span>{new Date(lead.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}, {new Date(lead.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                  <span className="item-status unclaimed">Unclaimed Lead</span>
                </div>
                {/* Pill buttons — matching Homepage.png "Cancel Order" + "Track Driver" */}
                <div className="pill-row">
                  <button className="pill-solid" onClick={() => onClaimLead(lead._id)}>Claim Lead</button>
                  <button className="pill-outline" onClick={() => onSelectLead(lead)}>Track Lead</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: My Claimed */}
      {tab === 'claimed' && (
        <div className="item-list">
          {myLeads.length === 0 ? (
            <div className="empty-state">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 8px'}}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <h4>No Claimed Leads Yet</h4>
              <p>Go to "Public Leads" and click "Claim Lead" to exclusively assign enquiries to your account.</p>
              <button className="pill-solid" onClick={() => setTab('public')} style={{margin:'0 auto',display:'flex'}}>Browse Public Leads</button>
            </div>
          ) : myLeads.map((lead, idx) => (
            <div key={lead._id} className="item-card">
              <div className="item-thumb" onClick={() => onSelectLead(lead)}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80" alt={lead.name} loading="lazy" />
                <span className="item-thumb-badge green">CLAIMED</span>
              </div>
              <div className="item-body">
                <div className="item-top-row">
                  <span className="item-title" onClick={() => onSelectLead(lead)}>{lead.name}</span>
                  <span className="item-price">₹{lead.estimatedValue || '20.00'}</span>
                </div>
                <div className="item-course">{lead.courseInterest}</div>
                <div className="item-meta">
                  <span>{new Date(lead.claimedAt || lead.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}, {new Date(lead.claimedAt || lead.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                  <span className="item-status claimed">Private Lead</span>
                </div>
                <div className="pill-row">
                  <a href={`tel:${lead.phone}`} className="pill-solid" style={{textDecoration:'none'}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.07 6.07l1.09-1.09a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    Call Client
                  </a>
                  <button className="pill-outline" onClick={() => onSelectLead(lead)}>Manage Lead</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Fastor Live Catalog */}
      {tab === 'fastor' && (
        <div className="item-list">
          <div className="fastor-info-box">
            ⚡ Live from Fastor curl: <code>https://staging.fastor.ai/v1/m/restaurant?city_id=118</code>
          </div>
          {(fastorRestaurants.length === 0 ? [{restaurant_name:'VYB',restaurant_id:'75',logo:'',address_complete:'Model Town, Delhi'}] : fastorRestaurants).map((r, idx) => (
            <div key={r.restaurant_id || idx} className="item-card" style={{cursor:'pointer'}} onClick={() => onSelectRestaurant(r)}>
              <div className="item-thumb">
                <img
                  src={r.logo || ITEM_IMGS[idx % ITEM_IMGS.length]}
                  alt={r.restaurant_name}
                  loading="lazy"
                  onError={e => { e.target.src = ITEM_IMGS[idx % ITEM_IMGS.length]; }}
                />
              </div>
              <div className="item-body">
                <div className="item-top-row">
                  <span className="item-title">{r.restaurant_name}</span>
                  <span className="item-price">₹20.00</span>
                </div>
                <div className="item-course" style={{color:'#6b7280'}}>
                  {r.address_complete && r.address_complete !== 'null' ? r.address_complete : 'Fastor Partner, Delhi'}
                </div>
                <div className="item-meta">
                  <span>29 Nov, 01:20 pm</span>
                  <span className="item-status" style={{background:'#dbeafe',color:'#1d4ed8'}}>2 items</span>
                </div>
                <div className="pill-row">
                  <button className="pill-solid">View Menu</button>
                  <button className="pill-outline">Track Driver</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Bottom Nav Bar ── */}
      <div className="bottom-nav">
        {[
          { id:'home', label:'Home', icon:<><rect x="3" y="9" width="18" height="13" rx="2"/><polyline points="9 22 9 12 15 12 15 22"/><polyline points="3 9 12 3 21 9"/></> },
          { id:'leads', label:'Leads', icon:<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
          { id:'profile', label:'Profile', icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
          { id:'settings', label:'Settings', icon:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></> }
        ].map(n => (
          <button key={n.id} className={`nav-item${navTab===n.id?' active':''}`} onClick={()=>setNavTab(n.id)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
            {n.label}
            {navTab===n.id && <span className="nav-dot"/>}
          </button>
        ))}
      </div>
    </div>
  );
}
