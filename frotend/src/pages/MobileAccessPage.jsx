import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, CloudOff, Zap, RefreshCw, Smartphone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MobileAccessPage.css';

function MobileAccessPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifyEmail, setNotifyEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setNotifyEmail('');
    }
  };

  return (
    <div className="app-container">
      {/* Navigation — same as Landing Page */}
      <nav className="navbar">
        <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2>BluePrint</h2>
        </div>
        <div className="nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="profile-avatar" onClick={() => navigate('/profile')} title={user.email}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-avatar-img" />
              ) : (
                (user.fullName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <button className="btn-primary-small" onClick={() => navigate('/auth')}>Login</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mobile-hero">
        <div className="mobile-hero-content">
          <span className="mobile-badge">MOBILE DEVELOPMENT LAB</span>
          <h1 className="mobile-hero-title">
            Mobile Access:<br />
            <span className="text-blue">Engineering in Your<br />Pocket.</span>
          </h1>
          <p className="mobile-hero-subtitle">
            We're building the future of STEM learning on the go. Real-time sync
            and offline access are coming soon.
          </p>
          
          <form className="mobile-notify-form" onSubmit={handleNotify}>
            <input 
              type="email" 
              placeholder="Enter your engineering email" 
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-notify">
              {submitted ? '✓ Subscribed!' : 'Notify Me'}
            </button>
          </form>
          
          {/* Feature Cards */}
          <div className="mobile-features">
            <div className="mobile-feature-card">
              <RefreshCw size={28} className="feature-icon" />
              <h3>Real-time Sync.</h3>
              <p>Your entire library, always up to date across all devices. Seamless transition from desktop to field.</p>
            </div>
            <div className="mobile-feature-card">
              <CloudOff size={28} className="feature-icon" />
              <h3>Offline Access.</h3>
              <p>Study anywhere, even without a connection. Download blueprints and notes for offline use in remote areas.</p>
            </div>
          </div>
        </div>

        {/* Phone Mockup */}
        <div className="mobile-hero-visual">
          <div className="phone-device">
            <div className="phone-notch"></div>
            <div className="phone-screen-content">
              <div className="phone-top-bar">
                <div className="phone-menu-icon">
                  <span></span><span></span><span></span>
                </div>
                <div className="phone-profile-dot"></div>
              </div>
              <div className="phone-search-bar"></div>
              <div className="phone-content-block">
                <div className="phone-card-shimmer"></div>
                <div className="phone-text-line w80"></div>
                <div className="phone-text-line w60"></div>
              </div>
              <div className="phone-bottom-cards">
                <div className="phone-card-blue"></div>
                <div className="phone-card-gray"></div>
              </div>
            </div>
          </div>
          <div className="sync-badge">
            <Zap size={16} className="zap-icon" />
            <div>
              <span className="sync-label">SYNC SPEED</span>
              <span className="sync-value">0.4s Latency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — same as Landing Page */}
      <footer className="footer">
        <div className="footer-logo">
          <h2>BluePrint</h2>
        </div>
        <div className="footer-links">
          <a href="#">DOCUMENTATION</a>
          <a href="#">SUPPORT</a>
        </div>
      </footer>
    </div>
  );
}

export default MobileAccessPage;
