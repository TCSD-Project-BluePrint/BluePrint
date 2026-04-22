import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, BadgeCheck, Calendar, List, CloudUpload, ShieldCheck, ArrowRight, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MentorSetupPage.css';

function MentorSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const authState = location.state || {};

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    organization: '',
    email: '',
    mobile: '',
    degree: '',
    year: '',
    institution: ''
  });

  const [domains, setDomains] = useState({
    aiml: false,
    struct: false,
    sysarch: false,
    cloud: false,
    cyber: false,
    robotics: false
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

  const domainLabels = {
    aiml: 'AI & ML',
    struct: 'Structural Engineering',
    sysarch: 'Systems Architecture',
    cloud: 'Cloud Infrastructure',
    cyber: 'Cybersecurity',
    robotics: 'Robotics & Automation'
  };

  const toggleDomain = (key) => {
    setDomains(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLaunch = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('fullName', formData.fullName);
    data.append('username', formData.username);
    data.append('organization', formData.organization);
    data.append('email', formData.email);
    data.append('mobile', formData.mobile);
    data.append('degree', formData.degree);
    data.append('year', formData.year);
    data.append('institution', formData.institution);
    data.append('domains', JSON.stringify(domains));
    data.append('password', authState.password || '');
    if (verificationFile) data.append('credentialFile', verificationFile);
    if (profilePicture) data.append('profilePicture', profilePicture);

    // Try saving to backend (best-effort)
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/auth/register-mentor`, {
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
      login({ email: formData.email || authState.email, role: 'mentor', fullName: formData.fullName, profilePicture: profilePreview || null });
      navigate('/explore');
    } catch (err) {
      console.warn('Backend unavailable:', err);
      alert('Could not connect to the server. Registration failed.');
    }
  };

  return (
    <div className="msetup-page">
      {/* Top Header */}
      <header className="msetup-top-header">
        <div className="setup-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2>BluePrint</h2>
        </div>

        <nav className="msetup-nav nav-links">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
        </nav>

        <div className="msetup-actions">
           <a href="#" className="link-signout">Sign Out</a>
           <div className="avatar-small">JV</div>
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="msetup-body">
        
        {/* Sidebar */}
        <aside className="msetup-sidebar">
          <div className="msetup-sidebar-header">
            <h4>ONBOARDING</h4>
            <p>Technical Curator Mode</p>
          </div>
          <nav className="msetup-sidebar-nav">
            <a href="#" className="active">
              <User size={16} />
              Profile Setup
            </a>
            <a href="#">
              <BadgeCheck size={16} />
              Expertise
            </a>
            <a href="#">
              <Calendar size={16} />
              Availability
            </a>
            <a href="#">
              <List size={16} />
              Guidelines
            </a>
          </nav>
        </aside>

        {/* Real Content Area */}
        <main className="msetup-main">
          <div className="bg-grid-overlay"></div>
          
          <div className="msetup-content-inner">
            <div className="msetup-title-area">
              <span className="badge-light-blue">VERIFICATION PROTOCOL V2.4</span>
              <h1>Mentor Verification & Profile Setup</h1>
              <p>
                Establish your professional identity within the technical ecosystem. Our<br/>
                curator team will review your credentials for platform-wide certification.
              </p>
            </div>

            <div className="msetup-grid-layout">
              {/* Left Column (Forms) */}
              <div className="msetup-left-col">
                
                {/* 01. BASIC INFORMATION */}
                <div className="msetup-card">
                   <div className="msetup-card-header">
                      <h3><span className="dot-blue"></span> 01. BASIC INFORMATION</h3>
                      <User size={24} className="icon-watermark" />
                   </div>
                   <div className="msetup-card-body">
                      <div className="form-row">
                         <div className="form-group flex-1">
                           <label>FULL NAME</label>
                           <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                         </div>
                         <div className="form-group flex-1">
                           <label>USERNAME</label>
                           <div className="input-with-prefix">
                             <span className="prefix">@</span>
                             <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                           </div>
                         </div>
                      </div>
                      <div className="form-group">
                         <label>ORGANIZATION / INSTITUTION</label>
                         <input type="text" value={formData.organization} onChange={(e) => setFormData({...formData, organization: e.target.value})} />
                      </div>
                   </div>
                </div>

                {/* 02. TECHNICAL DOMAINS */}
                <div className="msetup-card">
                   <div className="msetup-card-header">
                      <h3><span className="dot-blue"></span> 02. TECHNICAL DOMAINS</h3>
                   </div>
                   <div className="msetup-card-body">
                      <div className="domain-badges">
                         {Object.entries(domainLabels).map(([key, label]) => (
                            <button 
                               key={key} 
                               className={`domain-badge ${domains[key] ? 'active' : ''}`}
                               onClick={() => toggleDomain(key)}
                            >
                               {label} {domains[key] && <X size={12} className="close-icon" />}
                            </button>
                         ))}
                      </div>
                      <p className="input-helper-text">Select up to 5 domains of professional mastery for mentorship matching.</p>
                   </div>
                </div>

                {/* 03. ACADEMIC PEDIGREE */}
                <div className="msetup-card">
                   <div className="msetup-card-header">
                      <h3><span className="dot-blue"></span> 03. ACADEMIC PEDIGREE</h3>
                   </div>
                   <div className="msetup-card-body">
                      <div className="form-row">
                         <div className="form-group flex-2">
                           <label>HIGHEST DEGREE EARNED</label>
                           <select value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})}>
                              <option>{formData.degree}</option>
                           </select>
                         </div>
                         <div className="form-group flex-1">
                           <label>YEAR</label>
                           <input type="text" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} />
                         </div>
                         <div className="form-group flex-2">
                           <label>INSTITUTION</label>
                           <input type="text" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} />
                         </div>
                      </div>
                   </div>
                </div>

              </div>

              {/* Right Column (Vault) */}
              <div className="msetup-right-col">

                {/* PROFILE PICTURE */}
                <div className="vault-card">
                  <h4>PROFILE PICTURE</h4>
                  <label htmlFor="profilePicInput" className="profile-pic-upload">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile Preview" className="profile-pic-preview" />
                    ) : (
                      <div className="profile-pic-placeholder">
                        <Camera size={28} className="icon-blue" />
                      </div>
                    )}
                    <input type="file" id="profilePicInput" accept="image/png, image/jpeg, image/jpg" style={{ display: 'none' }} onChange={handleProfilePicture} />
                  </label>
                  <p className="input-helper-text" style={{ textAlign: 'center', marginTop: '10px' }}>Click to upload (Optional) — JPG or PNG, 1:1 ratio</p>
                </div>
                
                {/* VERIFICATION VAULT */}
                <div className="vault-card">
                  <h4>VERIFICATION VAULT</h4>
                  <label htmlFor="mentorFile" className="vault-upload-area" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CloudUpload size={24} className="icon-blue" />
                    <strong>{verificationFile ? `Selected: ${verificationFile.name}` : 'Upload Credentials'}</strong>
                    <span>PDF, JPG, or PNG (Max 10MB)</span>
                    <input type="file" id="mentorFile" style={{ display: 'none' }} onChange={(e) => setVerificationFile(e.target.files[0])} />
                  </label>
                  <div className="vault-shield-alert">
                    <ShieldCheck size={16} className="icon-red" />
                    <div className="alert-content">
                       <h5>Identity Shield Active</h5>
                       <p>Your documents are encrypted and stored in a private secure vault.</p>
                    </div>
                  </div>
                </div>

                {/* CHANNEL ROUTING */}
                <div className="routing-card">
                  <h4>CHANNEL ROUTING</h4>
                  <div className="form-group">
                    <label>PRIVATE EMAIL ADDRESS</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>MOBILE NODE (OPTIONAL)</label>
                    <input type="tel" value={formData.mobile} onChange={(e) => setFormData({...formData, mobile: e.target.value})} />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="msetup-submit-area">
                  <button className="btn-initialize" onClick={handleLaunch}>
                    Initialize Certification <ArrowRight size={16} />
                  </button>
                  <p className="terms-text">
                    By initializing, you agree to the Technical Curator Guidelines and<br/>
                    Ethics Protocol.
                  </p>
                </div>

              </div>
            </div>

            {/* Bottom Info Cards */}
            <div className="msetup-info-cards">
               <div className="info-card">
                 <h5>PLATFORM INTEGRITY</h5>
                 <p>99.8% accurate mentor matching algorithm based on peer-reviewed verification.</p>
               </div>
               <div className="info-card">
                 <h5>REVIEW LATENCY</h5>
                 <p>Certification usually completed within 48-72 hours of document submission.</p>
               </div>
               <div className="info-card">
                 <h5>GLOBAL NETWORK</h5>
                 <p>Connect with over 15,000+ researchers and industry leaders worldwide.</p>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

export default MentorSetupPage;
