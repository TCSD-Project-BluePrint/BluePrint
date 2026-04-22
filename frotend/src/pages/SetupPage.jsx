import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserSquare, Database, UploadCloud, Rocket, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SetupPage.css';

function SetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const authState = location.state || {};

  const [topics, setTopics] = useState({
    sa: false,
    ml: false,
    ci: false,
    ui: false,
    cs: false
  });

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    organization: '',
    email: '',
    mobile: ''
  });

  const [verificationFile, setVerificationFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  const handleProfilePicture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      // Resize to 150x150 for avatar use (keeps localStorage small)
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 150;
          canvas.height = 150;
          const ctx = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);
          setProfilePreview(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTopic = (key) => {
    setTopics(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('organization', formData.organization);
    data.append('email', formData.email);
    data.append('mobile', formData.mobile);
    data.append('topics', JSON.stringify(topics));
    data.append('password', authState.password || '');
    if (verificationFile) data.append('verificationFile', verificationFile);
    if (profilePicture) data.append('profilePicture', profilePicture);

    // Try saving to backend (best-effort)
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/register-student`, {
        method: 'POST',
        body: data
      });
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch(e) {}
        alert(errData.error || 'Registration failed');
        return;
      }
      
      // Login and navigate ON SUCCESS
      login({ email: formData.email || authState.email, role: 'student', fullName: formData.fullName, profilePicture: profilePreview || null });
      navigate('/explore');
    } catch (err) {
      console.warn('Backend unavailable:', err);
      alert('Could not connect to the server. Registration failed.');
    }
  };

  return (
    <div className="setup-page">
      <div className="bg-grid-overlay"></div>

      {/* Header */}
      <header className="setup-header">
        <div className="setup-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2>BluePrint</h2>
        </div>

        <nav className="setup-nav nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
        </nav>

        <div className="setup-actions">
           <span className="edition-badge">Technical Curator Edition</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="setup-main">
        {/* Page Title Area */}
        <div className="setup-title-area">
          <span className="badge-light">SYSTEM INITIALIZATION</span>
          <h1>Set Configuration</h1>
          <p>
            Welcome to the BluePrint ecosystem. Complete your technical profile<br/>
            to access your personalized curriculum and deployment environments.
          </p>
        </div>

        <div className="setup-content-grid">
          {/* Left Column: Form Card */}
          <div className="setup-form-card">
            
            <section className="form-section">
              <h3 className="section-title">
                <UserSquare size={16} className="icon-blue" />
                CORE IDENTITY
              </h3>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>FULL NAME *</label>
                  <input type="text" placeholder="e.g. Alan Turing" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                  <label>USERNAME *</label>
                  <input type="text" placeholder="curator_01" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>ORGANIZATION NAME *</label>
                <input type="text" placeholder="University or Technical Institute" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} />
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title">
                <Database size={16} className="icon-blue" />
                TECHNICAL METADATA
              </h3>
              <div className="form-row">
                <div className="form-group flex-1">
                  <label>EMAIL ADDRESS</label>
                  <input type="email" placeholder="contact@blueprint.io" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group flex-1">
                  <label>MOBILE NUMBER</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title-plain">INTERESTED TOPICS</h3>
              <div className="topics-container">
                 <button className={`topic-badge ${topics.sa ? 'active' : ''}`} onClick={() => toggleTopic('sa')}>Systems Architecture</button>
                 <button className={`topic-badge ${topics.ml ? 'active' : ''}`} onClick={() => toggleTopic('ml')}>Machine Learning</button>
                 <button className={`topic-badge ${topics.ci ? 'active' : ''}`} onClick={() => toggleTopic('ci')}>Cloud Infrastructure</button>
                 <button className={`topic-badge ${topics.ui ? 'active' : ''}`} onClick={() => toggleTopic('ui')}>UI Logic</button>
                 <button className={`topic-badge ${topics.cs ? 'active' : ''}`} onClick={() => toggleTopic('cs')}>Cybersecurity</button>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title-plain">PROFILE PICTURE (OPTIONAL)</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <label htmlFor="studentProfilePic" className="profile-pic-upload">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Profile Preview" className="profile-pic-preview" />
                  ) : (
                    <div className="profile-pic-placeholder">
                      <Camera size={28} className="icon-blue" />
                    </div>
                  )}
                  <input type="file" id="studentProfilePic" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} onChange={handleProfilePicture} />
                </label>
                <div>
                  <p className="upload-main-text" style={{ marginBottom: '4px' }}>Upload a profile photo</p>
                  <p className="upload-sub-text">JPG or PNG, 1:1 ratio recommended</p>
                </div>
              </div>
            </section>

            <section className="form-section">
              <h3 className="section-title-plain">PROOF OF ORGANIZATION</h3>
              <label htmlFor="studentFile" className="upload-area" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <UploadCloud size={24} className="icon-gray" />
                 <p className="upload-main-text">
                   {verificationFile ? `Selected: ${verificationFile.name}` : 'Drag and drop verification or click to browse'}
                 </p>
                 <p className="upload-sub-text">PDF, PNG, OR .EDU VERIFICATION LINK</p>
                 <input type="file" id="studentFile" style={{ display: 'none' }} onChange={(e) => setVerificationFile(e.target.files[0])} />
              </label>
            </section>

            <div className="form-actions">
              <button className="btn-text" onClick={() => navigate('/auth')}>DISCARD CHANGES</button>
              <button className="btn-launch" onClick={handleLaunch}>
                Launch Environment <Rocket size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Widgets */}
          <div className="setup-widgets">
            {/* Log Widget */}
            <div className="log-widget">
              <h4 className="widget-header">INITIALIZATION LOG</h4>
              <div className="log-content">
                <div className="log-line">
                  <span className="log-time">14:22:81</span>
                  <span className="log-tag">[SYS]</span>
                  <span className="log-msg">Handshaking with academic gateway...</span>
                </div>
                <div className="log-line">
                  <span className="log-time">14:22:85</span>
                  <span className="log-tag">[USER]</span>
                  <span className="log-msg">Awaiting local variable input...</span>
                </div>
                <div className="log-line log-pending">
                  <span className="log-time">--:--:--</span>
                  <span className="log-tag">[ENV]</span>
                  <span className="log-msg">Awaiting configuration push...</span>
                </div>
              </div>
            </div>

            {/* Preview Widget */}
            <div className="preview-widget">
              <div className="preview-image-placeholder">
                 <div className="preview-overlay-text">
                   <h4>ARCHITECTURE PREVIEW</h4>
                   <p>Your development workspace will be provisioned instantly upon submission.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="explore-footer mt-auto">
        <div className="footer-left">
           <h3>BLUEPRINT</h3>
        </div>
        <div className="footer-center" style={{ marginLeft: 'auto' }}>
            <a href="#">DOCUMENTATION</a>
            <a href="#">SUPPORT</a>
        </div>
      </footer>
    </div>
  );
}

export default SetupPage;
