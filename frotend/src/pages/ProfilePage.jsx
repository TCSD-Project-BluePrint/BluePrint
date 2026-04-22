import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserCircle, BookOpen, CalendarDays, Mail, Phone, MapPin, Pen, KeyRound, ShieldCheck, Sun, Moon, Monitor, Bell, MessageSquare, Clock, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Editable fields
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    organization: user?.organization || '',
    bio: user?.bio || 'Passionate learner exploring the frontiers of engineering and technology.',
  });

  const [theme, setTheme] = useState('light');
  const [contributionCount, setContributionCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      try {
        // Fetch Notes
        const notesRes = await fetch(`http://${window.location.hostname}:5000/api/notes`);
        const notesData = await notesRes.json();
        const userNotes = notesData.filter(n => n.uploaderEmail === user.email).length;

        // Fetch Posts
        const postsRes = await fetch(`http://${window.location.hostname}:5000/api/posts`);
        const postsData = await postsRes.json();
        const userPosts = postsData.filter(p => p.authorEmail === user.email).length;

        setContributionCount(userNotes + userPosts);
      } catch (err) {
        console.error('Failed to fetch user contributions:', err);
      }
    };

    fetchCounts();
  }, [user]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
          const resized = canvas.toDataURL('image/jpeg', 0.8);
          login({ ...user, profilePicture: resized });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    login({ ...user, ...editData });
    setEditing(false);
  };

  const handleDiscard = () => {
    setEditData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      organization: user?.organization || '',
      bio: user?.bio || 'Passionate learner exploring the frontiers of engineering and technology.',
    });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitial = () => {
    return (user?.fullName || user?.email || 'U').charAt(0).toUpperCase();
  };

  const roleBadge = user?.role === 'mentor' ? 'MENTOR' : 'STUDENT';
  const roleLevel = user?.role === 'mentor' ? 'Technical Curator' : 'Level 1 Student';

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-brand">
          <h2>BluePrint</h2>
          <p>{roleBadge} PORTAL</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <a href="#" className="active">
            <UserCircle size={18} /> Profile
          </a>
          <a href="#">
            <BookOpen size={18} /> Academic Info
          </a>
          <a href="#">
            <CalendarDays size={18} /> Schedule
          </a>
        </nav>
        <div className="sidebar-status">
          <span className="status-label">SYSTEM STATUS</span>
          <span className="status-value"><span className="status-dot"></span> v2.4.0 Stable</span>
        </div>
      </aside>

      {/* Main Area */}
      <div className="profile-main-area">
        {/* Top Header */}
        <header className="profile-top-header">
          <div className="header-left">
            <span>BluePrint</span>
          </div>
          <div className="header-right">
            <Bell size={18} className="header-icon" />
            <span className="header-user-name">{user.fullName || user.email}</span>
            <span className="header-role-label">{roleLevel.toUpperCase()}</span>
            <div className="header-avatar" onClick={() => navigate('/profile')}>
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" />
              ) : (
                getInitial()
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="profile-content">
          {/* Title */}
          <div className="profile-page-title">
            <h1>{roleBadge === 'MENTOR' ? 'Mentor' : 'Student'} Profile</h1>
            <div className="profile-meta-row">
              <span className="verified-badge">VERIFIED PORTFOLIO</span>
              <span className="session-text">Member since 2024 • {roleBadge}</span>
            </div>
          </div>

          {/* Profile + Stats Grid */}
          <div className="profile-grid">
            {/* Left: Profile Card */}
            <div className="profile-card">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large" onClick={() => fileInputRef.current?.click()}>
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" />
                  ) : (
                    <div className="avatar-placeholder-large">{getInitial()}</div>
                  )}
                  <div className="avatar-overlay">
                    <Camera size={20} />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleProfilePicChange}
                />
              </div>

              <h2 className="profile-name">
                {editing ? (
                  <input type="text" value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} className="edit-input-name" />
                ) : (
                  user.fullName || 'User'
                )}
              </h2>
              <p className="profile-role-label">
                {roleLevel} • {user.organization || 'Engineering Faculty'}
              </p>

              <p className="profile-bio">
                {editing ? (
                  <textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="edit-textarea" rows={3} />
                ) : (
                  editData.bio
                )}
              </p>

              <div className="profile-contact-list">
                <div className="contact-item">
                  <Mail size={14} />
                  {editing ? (
                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} className="edit-input-inline" />
                  ) : (
                    <span>{user.email || 'Not set'}</span>
                  )}
                </div>
                <div className="contact-item">
                  <Phone size={14} />
                  {editing ? (
                    <input type="tel" value={editData.mobile} onChange={(e) => setEditData({ ...editData, mobile: e.target.value })} className="edit-input-inline" />
                  ) : (
                    <span>{user.mobile || 'Not set'}</span>
                  )}
                </div>
                <div className="contact-item">
                  <MapPin size={14} />
                  {editing ? (
                    <input type="text" value={editData.organization} onChange={(e) => setEditData({ ...editData, organization: e.target.value })} className="edit-input-inline" />
                  ) : (
                    <span>{user.organization || 'Not set'}</span>
                  )}
                </div>
              </div>

              {!editing && (
                <button className="btn-edit-profile" onClick={() => setEditing(true)}>
                  <Pen size={14} /> Edit Profile
                </button>
              )}
            </div>

            {/* Right: Stats Cards */}
            <div className="stats-column">
              <div className="stat-card">
                <span className="stat-label">ROLE</span>
                <h3 className="stat-value">{roleBadge}</h3>
                <span className="stat-sub">{user.role === 'mentor' ? 'Technical Curator' : 'Active Learner'}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">CONTRIBUTIONS</span>
                <h3 className="stat-value">{contributionCount}</h3>
                <span className="stat-sub">Total uploads & posts</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">ORGANIZATION</span>
                <h3 className="stat-value-sm">{user.organization || '—'}</h3>
                <span className="stat-sub">{user.role === 'mentor' ? user.institution || 'Institution' : 'Academic Body'}</span>
              </div>
            </div>
          </div>

          <div className="profile-actions-bottom" style={{ marginTop: '32px' }}>
            <button className="btn-logout" onClick={handleLogout} style={{ width: 'fit-content', padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} /> SIGN OUT
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="profile-footer">
          <span>BUILD: BF2b-4567-99ab-cdef • Last Synced: {new Date().toLocaleTimeString()} UTC</span>
          <div className="footer-links-right">
            <a href="#">PRIVACY POLICY</a>
            <a href="#">SECURITY AUDIT</a>
            <a href="#">SUPPORT</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ProfilePage;
