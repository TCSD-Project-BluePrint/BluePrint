import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Settings, Upload, Download, FileText, CheckSquare, Bookmark, Code, Droplet, LayoutGrid, Calculator, BookOpen, X, Play, Trash2 } from 'lucide-react';
import './DepartmentPage.css';

function DepartmentPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [activeYear, setActiveYear] = useState('First Year');
  const [activeDept, setActiveDept] = useState('Computer Science');
  const [notes, setNotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const requireAuthAction = (action) => {
    if (user) {
      action();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/notes/${noteId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotes(notes.filter(n => n.id !== noteId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete note');
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const [uploadData, setUploadData] = useState({
    topicName: '',
    unitNumber: '',
    year: 'First Year',
    departmentId: '1', // Let's use string IDs simple mapping inside
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
  const departments = [
    { name: 'Computer Science', id: '1' },
    { name: 'AI & Data Science', id: '2' },
    { name: 'Mechanical Eng.', id: '3' },
    { name: 'Electrical Eng.', id: '5' },
    { name: 'Civil Engineering', id: '4' }
  ];

  useEffect(() => {
    // If ID is in url, set active dept
    if (id) {
      const match = departments.find(d => d.id === id);
      if (match) setActiveDept(match.name);
    }
  }, [id]);

  useEffect(() => {
    fetchNotes();
  }, [activeYear, activeDept]);

  const fetchNotes = async () => {
    try {
      const activeDeptId = departments.find(d => d.name === activeDept)?.id || '1';
      const url = `http://${window.location.hostname}:5000/api/notes?year=${encodeURIComponent(activeYear)}&departmentId=${activeDeptId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Error fetching notes", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    if (!user) {
      alert("Please log in to upload notes");
      navigate('/auth');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('topicName', uploadData.topicName);
    formData.append('unitNumber', uploadData.unitNumber);
    formData.append('year', uploadData.year);
    formData.append('departmentId', uploadData.departmentId);
    formData.append('uploaderEmail', user.email || 'Anonymous');

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/notes/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Note uploaded successfully!');
        setIsModalOpen(false);
        setUploadData({ ...uploadData, topicName: '', unitNumber: '' });
        setSelectedFile(null);
        fetchNotes(); // Refresh
      } else {
        const err = await res.json();
        alert('Upload failed: ' + err.message);
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const renderIcon = (topicName) => {
    // Guess icon based on topic keyword
    const lower = topicName.toLowerCase();
    if (lower.includes('calc') || lower.includes('math') || lower.includes('algebra')) return <Calculator className="note-icon-wrap green" />;
    if (lower.includes('fluid') || lower.includes('water')) return <Droplet className="note-icon-wrap blue" />;
    if (lower.includes('structure') || lower.includes('code') || lower.includes('program')) return <Code className="note-icon-wrap orange" />;
    if (lower.includes('physics')) return <LayoutGrid className="note-icon-wrap purple" />;
    return <BookOpen className="note-icon-wrap blue" />;
  };

  return (
    <div className="department-page">
      {/* Sidebar */}
      <aside className="dept-sidebar">
        <div className="dept-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          BluePrint
        </div>

        <div className="filter-section">
          <div className="filter-title">Resource Filter</div>
          <div className="filter-subtitle">SELECT YEAR & SEMESTER</div>
          <div className="filter-list">
            {years.map((year, index) => (
              <div
                key={year}
                className={`filter-item ${activeYear === year ? 'active' : ''}`}
                onClick={() => setActiveYear(year)}
              >
                <div className="icon">{index + 1}</div>
                {year}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <div className="filter-subtitle">DEPARTMENTS</div>
          <div className="filter-list">
            {departments.map(dept => (
              <div
                key={dept.name}
                className={`filter-item ${activeDept === dept.name ? 'active' : ''}`}
                onClick={() => setActiveDept(dept.name)}
              >
                <div className="icon" style={{ background: activeDept === dept.name ? '#2563eb' : 'transparent', border: activeDept === dept.name ? 'none' : '1px solid #cbd5e1' }}>
                  {activeDept === dept.name && <CheckSquare size={14} color="#fff" />}
                </div>
                {dept.name}
              </div>
            ))}
          </div>
        </div>

        <div className="sidebar-spacer"></div>

        <div className="sidebar-footer">
          <button className="btn-upload" onClick={() => requireAuthAction(() => setIsModalOpen(true))}>
            <Upload size={16} /> Upload Material
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: '#475569', fontWeight: '500', cursor: 'pointer' }}>
            <BookOpen size={18} /> Curriculum
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dept-main">
        {/* Topbar */}
        <header className="dept-topbar">
          <nav className="topbar-nav nav-links">
            <a href="#" className="active" onClick={(e) => { e.preventDefault(); }}>Library</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
          </nav>

          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Find notes, diagrams, or blueprints..." />
          </div>

          <div className="topbar-actions">
            <Bell size={20} className="topbar-icon" />
            <Settings size={20} className="topbar-icon" />
            {user ? (
              <div className="profile-avatar" onClick={() => navigate('/profile')} title={user.email} style={{ width: 32, height: 32, borderRadius: '50%', background: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  (user.fullName || user.email || 'U').charAt(0).toUpperCase()
                )}
              </div>
            ) : (
              <div className="profile-avatar" onClick={() => navigate('/auth')} style={{ width: 32, height: 32, borderRadius: '50%', background: '#94a3b8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Settings size={16} />
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="dept-content">
          <div className="breadcrumb">
            <span style={{ letterSpacing: '0.05em' }}>TECHNICAL VAULT</span>
            <span>Library / {activeYear} / {activeDept}</span>
          </div>

          <h1 className="page-title">No more lost information.</h1>
          <p className="page-subtitle">
            Your centralized repository for engineering precision. Access peer-reviewed
            diagrams, lecture notes, and blueprints curated for academic excellence.
          </p>

          {/* Hero Card */}
          <div className="hero-card">
            <div className="hero-card-image">
              <div className="hero-badge-group">
                <span className="hero-badge">COURSE MATERIAL</span>
                <span className="hero-date">ADDED RECENTLY</span>
              </div>
              <h2 className="hero-card-title">{activeDept} Core Topics</h2>
            </div>
            <div className="hero-card-body">
              <div>
                <p className="hero-card-desc">
                  Comprehensive collection including related course files, diagrams,
                  and sorted notes with verified implementations.
                </p>
                <div className="hero-stats">
                  <span><FileText size={16} /> {notes.length} Files</span>
                  <span><Code size={16} /> Community Code Snippets</span>
                </div>
              </div>
              <button className="btn-save">
                <Bookmark size={18} fill="currentColor" /> SAVE TO LIBRARY
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          <div className="notes-grid">
            {notes.map(note => (
              <div key={note.id} className="note-card">
                {renderIcon(note.topicName)}

                <div className="note-meta">
                  <span className="dept-tag">{activeDept}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="note-title">{note.topicName}</h3>
                <p className="note-desc">
                  Unit {note.unitNumber} - Verified notes by {note.uploaderEmail}. Contains standard lectures and analysis.
                </p>

                <div className="note-footer">
                  <span>
                    <FileText size={16} /> {note.filename.split('.').pop().toUpperCase()} Format
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {user && user.email === note.uploaderEmail && (
                      <span 
                        className="note-action" 
                        style={{ cursor: 'pointer', color: '#94a3b8' }} 
                        onClick={() => handleDeleteNote(note.id)}
                        title="Delete note"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                      >
                        <Trash2 size={18} />
                      </span>
                    )}
                    <span className="note-action" style={{ cursor: 'pointer' }} onClick={() => requireAuthAction(() => window.open(`http://${window.location.hostname}:5000${note.filePath}`, '_blank'))}>
                      <Download size={18} />
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <h3>No notes found</h3>
                <p>Be the first to upload material for {activeDept} - {activeYear}!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false) }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Upload Material</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              <div className="form-group">
                <label>Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Fluid Mechanics"
                  required
                  value={uploadData.topicName}
                  onChange={(e) => setUploadData({ ...uploadData, topicName: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Unit Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Unit 3"
                    required
                    value={uploadData.unitNumber}
                    onChange={(e) => setUploadData({ ...uploadData, unitNumber: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Year</label>
                  <select
                    value={uploadData.year}
                    onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
                  >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Department</label>
                <select
                  value={uploadData.departmentId}
                  onChange={(e) => setUploadData({ ...uploadData, departmentId: e.target.value })}
                >
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>File Attachment</label>
                <div
                  className="file-drop-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p>Drag and drop or <span className="browse-text">browse</span></p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>PDF, JPG, PNG up to 10MB</p>
                  {selectedFile && <div className="selected-file">{selectedFile.name}</div>}
                </div>
                <input
                  type="file"
                  className="file-input"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Required Modal */}
      {isAuthModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsAuthModalOpen(false) }}>
          <div className="modal-content" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>This required sign in</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>You need to be logged in to view or upload notes.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setIsAuthModalOpen(false)}>continue with out Account</button>
              <button className="btn-primary" onClick={() => navigate('/auth')}>Sign in</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentPage;
