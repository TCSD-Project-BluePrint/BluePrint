import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Settings, GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'taken' | 'available'
  const emailCheckTimer = useRef(null);

  // Real-time debounced email check (only during sign-up)
  useEffect(() => {
    if (activeTab !== 'signup') { setEmailStatus(null); return; }
    
    // Clear previous timer
    if (emailCheckTimer.current) clearTimeout(emailCheckTimer.current);

    // Basic email format check before hitting API
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!email || !isValidEmail) {
      setEmailStatus(null);
      return;
    }

    setEmailStatus('checking');
    emailCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/auth/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        setEmailStatus(data.exists ? 'taken' : 'available');
      } catch {
        setEmailStatus(null); // server offline, skip check
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(emailCheckTimer.current);
  }, [email, activeTab]);

  // Password policy checks for live feedback
  const pwChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const allPassed = Object.values(pwChecks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'signup') {
        // Block if real-time check already flagged email as taken
        if (emailStatus === 'taken') {
          setShowDuplicatePopup(true);
          setLoading(false);
          return;
        }

        // Client-side password validation before navigating to setup
        if (!allPassed) {
          setError('Password does not meet the requirements');
          setLoading(false);
          return;
        }

        // Check if email already exists in database
        try {
          const checkRes = await fetch(`http://${window.location.hostname}:5000/api/auth/check-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const checkData = await checkRes.json();
          if (checkData.exists) {
            setShowDuplicatePopup(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          // If server is down, let them proceed — setup page will catch it
          console.warn('Could not verify email uniqueness:', err);
        }

        // Pass email, password, and role to the setup page
        if (role === 'mentor') {
          navigate('/mentor-setup', { state: { email, password, role } });
        } else {
          navigate('/setup', { state: { email, password, role } });
        }
      } else {
        // SIGN IN — call backend login endpoint
        const res = await fetch(`http://${window.location.hostname}:5000/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Login failed');
          setLoading(false);
          return;
        }

        // Login successful — store user context
        login({
          email: data.user.email,
          role: data.user.role,
          fullName: data.user.fullName,
          username: data.user.username,
          profilePicture: data.user.profilePicture || null
        });
        navigate('/explore');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Background Grid Pattern */}
      <div className="bg-grid-overlay"></div>

      {/* Header */}
      <header className="auth-header">
        <div className="auth-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <h2>BluePrint</h2>
        </div>

        <div className="auth-nav-center">
          <a href="#">DOCUMENTATION</a>
          <a href="#">SECURITY</a>
          <button className="btn-support">
            <HelpCircle size={14} />
            Support
          </button>
        </div>

        <div className="auth-nav-right">
          <button className="btn-icon">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="auth-main">
        <div className="auth-card-container">
          <div className="auth-card">
            {/* Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signin'); setError(''); }}
              >
                SIGN IN
              </button>
              <button
                className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
                onClick={() => { setActiveTab('signup'); setError(''); }}
              >
                SIGN UP
              </button>
            </div>

            <div className="auth-card-body">
              <h1 className="auth-title">
                {activeTab === 'signin' ? 'Access Environment' : 'Initialize Environment'}
              </h1>
              <p className="auth-subtitle">Select your technical role to continue.</p>

              {/* Role Toggle */}
              <div className="role-toggle">
                <button
                  className={`role-btn ${role === 'student' ? 'active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  <GraduationCap size={16} className={role === 'student' ? 'icon-blue' : ''} />
                  Student
                </button>
                <button
                  className={`role-btn ${role === 'mentor' ? 'active' : ''}`}
                  onClick={() => setRole('mentor')}
                >
                  <span className="mentor-icon">⋀</span>
                  Mentor
                </button>
              </div>

              {/* Social Logins */}
              <div className="social-logins">
                <button className="btn-social">
                  Google
                </button>
                <button className="btn-social">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg" alt="GitHub" width="16" style={{ opacity: 0.8 }} />
                  GitHub
                </button>
              </div>

              <div className="divider">
                <span>MANUAL CREDENTIALS</span>
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  backgroundColor: '#fef2f2', color: '#dc2626', padding: '0.75rem 1rem',
                  borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem',
                  border: '1px solid #fecaca'
                }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className="label-row">
                    <label>e-mail</label>
                    {activeTab === 'signup' && emailStatus && (
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
                        color: emailStatus === 'taken' ? '#dc2626' : emailStatus === 'available' ? '#16a34a' : '#94a3b8'
                      }}>
                        {emailStatus === 'checking' && '⏳ Checking...'}
                        {emailStatus === 'taken' && <><AlertCircle size={12} /> Email already taken</>}
                        {emailStatus === 'available' && <><CheckCircle2 size={12} /> Available</>}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="curator@blueprint.tech"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={activeTab === 'signup' && emailStatus === 'taken' ? { borderColor: '#fecaca', backgroundColor: '#fef2f2' } : {}}
                  />
                </div>

                <div className="form-group">
                  <div className="label-row">
                    <label>Password</label>
                    {activeTab === 'signin' && <a href="#" className="link-recover">RECOVER ACCESS</a>}
                  </div>
                  <div className="input-with-icon">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" className="btn-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Password strength feedback — only shown on SIGN UP */}
                {activeTab === 'signup' && password.length > 0 && (
                  <div style={{
                    backgroundColor: '#f8fafc', borderRadius: '0.5rem', padding: '0.75rem 1rem',
                    marginBottom: '1rem', border: '1px solid #e2e8f0', fontSize: '0.8rem'
                  }}>
                    <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#475569', fontSize: '0.75rem' }}>PASSWORD REQUIREMENTS</p>
                    {[
                      { key: 'length', label: 'Minimum 8 characters' },
                      { key: 'uppercase', label: 'At least one uppercase letter (A-Z)' },
                      { key: 'number', label: 'At least one number (0-9)' },
                      { key: 'special', label: 'At least one special character (!@#$...)' },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: pwChecks[key] ? '#16a34a' : '#94a3b8' }}>
                        <CheckCircle2 size={14} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="btn-primary-large" disabled={loading}>
                  {loading ? 'PROCESSING...' : (activeTab === 'signin' ? 'ACCESS ENVIRONMENT' : 'CREATE ENVIRONMENT')}
                </button>

                {activeTab === 'signup' && (
                  <button
                    type="button"
                    className="btn-guest-large"
                    onClick={() => {
                      navigate('/');
                    }}
                  >
                    CONTINUE AS GUEST (LIMITED ACCESS)
                  </button>
                )}
              </form>
            </div>
          </div>

          <div className="auth-card-footer">
            <a href="#">TECHNICAL<br />DOCUMENTATION</a>
            <span className="dot">•</span>
            <a href="#">SYSTEMS<br />STATUS</a>
          </div>
        </div>
      </main>

      {/* Duplicate Email Popup */}
      {showDuplicatePopup && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: '1rem', padding: '2rem',
            maxWidth: '400px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', animation: 'slideUpPopup 0.3s ease-out'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef2f2',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
            }}>
              <AlertCircle size={28} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>User Already Exists</h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>An account with this email is already registered. Please use a different email address or sign in instead.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => { setShowDuplicatePopup(false); setActiveTab('signin'); }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: '#1d4ed8', color: 'white' }}
              >
                SIGN IN INSTEAD
              </button>
              <button
                onClick={() => { setShowDuplicatePopup(false); setEmail(''); }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', border: '1px solid #cbd5e1', backgroundColor: 'white', color: '#0f172a' }}
              >
                USE DIFFERENT EMAIL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="auth-page-footer">
        <div className="footer-links-inline">
          <a href="#">DOCUMENTATION</a>
          <a href="#">SECURITY</a>
        </div>
      </footer>
    </div>
  );
}

export default AuthPage;
