import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Cpu, Settings, PenTool, Zap, Bot, ArrowRight, ExternalLink, Monitor, Triangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ExplorePage.css';

function ExplorePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    {
      id: 1,
      title: 'Computer Science (CSE)',
      description: 'Access structured curriculum and community for foundational and advanced computational theory.',
      modules: 42,
      icon: <Code size={20} className="icon-blue" />,
    },
    {
      id: 2,
      title: 'AI & Data Science',
      description: 'Master machine learning architectures and data pipeline engineering within our dedicated cloud labs.',
      modules: 28,
      icon: <Cpu size={20} className="icon-blue" />,
    },
    {
      id: 3,
      title: 'Mechanical Engineering',
      description: 'From thermodynamics to fluid mechanics, explore a technical archive of blueprints and CAD documentation.',
      modules: 35,
      icon: <Settings size={20} className="icon-blue" />,
    },
    {
      id: 4,
      title: 'Civil Engineering',
      description: 'Infrastructure analysis and structural modeling tools curated for professional development.',
      modules: 19,
      icon: <PenTool size={20} className="icon-blue" />,
    },
    {
      id: 5,
      title: 'Electrical Engineering',
      description: 'Deep dive into circuit theory, signal processing, and high-voltage power system management.',
      modules: 31,
      icon: <Zap size={20} className="icon-blue" />,
    },
    {
      id: 6,
      title: 'Robotics & Automation',
      description: 'Integrated systems engineering focusing on kinematics, control loops, and autonomous navigation.',
      modules: 24,
      icon: <Bot size={20} className="icon-blue" />,
    }
  ];

  return (
    <div className="explore-page">
      {/* Header */}
      <header className="explore-header">
        <div className="explore-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2>BluePrint</h2>
        </div>

        <nav className="explore-nav nav-links">
          <a href="#" className="active" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
        </nav>

        <div className="explore-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="search-icon" />
          </div>
          {user ? (
            <div className="profile-avatar" onClick={() => navigate('/profile')} title={user.email}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="profile-avatar-img" />
              ) : (
                (user.fullName || user.email || 'U').charAt(0).toUpperCase()
              )}
            </div>
          ) : (
            <button className="btn-primary-small" onClick={() => navigate('/auth')}>Sign In</button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="explore-main">
        {/* Hero */}
        <section className="explore-hero">
          <span className="badge-light">CURATED ARCHITECTURE</span>
          <h1>Technical Foundations for the Next Decade.</h1>
          <p>
            Browse our structured curriculum organized by core disciplines. Each<br />
            department offers a clinical approach to resource management and<br />
            community collaboration.
          </p>
        </section>

        {/* Grid */}
        <section className="departments-grid">
          {departments.map((dept) => (
            <div key={dept.id} className="dept-card">
              <div className="dept-icon-box">
                {dept.icon}
              </div>
              <h3 className="dept-title">{dept.title}</h3>
              <p className="dept-desc">{dept.description}</p>

              <div className="dept-footer">
                {/* <span className="dept-meta">MODULES: {dept.modules}</span> */}
                <a href="#" className="dept-link" onClick={(e) => { e.preventDefault(); navigate(`/department/${dept.id}`); }}>
                  Enter Portal <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </section>

        {/* Call to action section */}
        {/* <section className="cta-section">
          <div className="cta-content">
            <h2>Can't find a specific track?</h2>
            <p>
              Our open-source blueprint allows for community-driven<br />
              department proposals. Join our technical review board to<br />
              suggest new learning paths.
            </p>
            <div className="cta-buttons">
              <button className="btn-solid-dark" onClick={() => navigate('/auth')}>Propose Track</button>
              <button className="btn-outline">
                Documentation <ExternalLink size={14} />
              </button>
            </div>
          </div>
          <div className="cta-visual">
            <div className="cta-image-placeholder">
              <div className="grid-overlay-blue"></div>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <footer className="explore-footer">
        <div className="footer-left">
          <h3>BluePrint</h3>
        </div>
        <div className="footer-center">
          <a href="#">Technical Documentation</a>
          <a href="#">Contact</a>
        </div>
        <div className="footer-right">
          <Monitor size={16} />
          <Triangle size={16} />
          <Code size={16} />
        </div>
      </footer>
    </div>
  );
}

export default ExplorePage;
