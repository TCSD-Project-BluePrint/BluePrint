import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Code, FileText, CheckCircle, MessageSquare, CornerUpLeft, BookOpen, Layers, Menu, Wifi, CloudOff, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
   const navigate = useNavigate();
   const { user, logout } = useAuth();
   const [topPosts, setTopPosts] = useState([]);

   useEffect(() => {
      const fetchPosts = async () => {
         try {
            const res = await fetch(`http://${window.location.hostname}:5000/api/posts`);
            if (res.ok) {
               const data = await res.json();
               // Sort by most liked to determine "top posts"
               data.sort((a, b) => b.likes.length - a.likes.length);
               setTopPosts(data.slice(0, 3));
            }
         } catch (err) {
            console.error("Failed to fetch top posts", err);
         }
      };

      fetchPosts();
      const intervalId = setInterval(fetchPosts, 5000); // 5-second polling for real-time feel
      return () => clearInterval(intervalId);
   }, []);

   const requireAuth = (e) => {
      e.preventDefault();
      navigate('/auth');
   };

   const handleYearClick = (e) => {
      e.preventDefault();
      navigate('/department/1');
   };

   return (
      <div className="app-container">
         {/* Navigation */}
         <nav className="navbar">
            <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
               <h2>BluePrint</h2>
            </div>
            <div className="nav-links">
               <a href="#" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>Community</a>
               <a href="#" onClick={handleYearClick}>Library</a>
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
                  <button className="btn-primary-small" onClick={requireAuth}>Login</button>
               )}
            </div>
         </nav>

         {/* Hero Section */}
         <header className="hero-section">
            <div className="hero-content">
               <h1 className="hero-title">
                  The Engineering<br />Knowledge Hub:<br />
                  <span className="text-blue">From Beginner<br />to Builder</span>
               </h1>
               <p className="hero-subtitle">
                  Access structured, department-specific notes and a real-time community of peers and experts. Designed for the technical mind.
               </p>
               <div className="hero-buttons">
                  {user ? (
                     <button className="btn-primary" onClick={(e) => { e.preventDefault(); navigate('/community'); }}>
                        Go to Community
                     </button>
                  ) : (
                     <button className="btn-primary" onClick={requireAuth}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" className="google-logo" />
                        Login with Google
                     </button>
                  )}
                  <button className="btn-secondary" onClick={() => navigate('/explore')}>Explore Departments</button>
               </div>
            </div>
            <div className="hero-visual">
               <div className="diagram-container">
                  <div className="diagram-line horizontal"></div>
                  <div className="diagram-line vertical"></div>
                  <div className="diagram-node node-top">
                     <Settings className="icon-blue" size={20} />
                     <span>MECHANICAL</span>
                  </div>
                  <div className="diagram-node node-left">
                     <div className="icon-wrapper">
                        <span className="icon-blue compass-icon">⋀</span>
                     </div>
                     <span>CIVIL</span>
                  </div>
                  <div className="diagram-node node-center">
                     <div className="blocks-icon">
                        <div className="block"></div>
                        <div className="block"></div>
                        <div className="block"></div>
                     </div>
                  </div>
                  <div className="diagram-node node-right">
                     <Code className="icon-blue" size={20} />
                     <span>CSE</span>
                  </div>
               </div>
            </div>
         </header>

         {/* Core Structure Section */}
         <section className="section-light">
            <div className="section-header">
               <h4 className="overline-blue">CORE STRUCTURE</h4>
               <h2 className="section-title">The Bones</h2>
               <p className="section-subtitle">No more lost information between semesters. All data architecture mapped for longevity.</p>
            </div>

            <div className="cards-grid-4">
               <div className="year-card" onClick={handleYearClick}>
                  <div className="card-icon-wrapper">
                     <FileText className="icon" size={18} />
                  </div>
                  <h3>Year 01</h3>
                  <p>Foundational mathematics, physics, and basic systems engineering.</p>
                  <div className="tags">
                     <span className="tag">SEM 1</span>
                     <span className="tag">SEM 2</span>
                  </div>
               </div>
               <div className="year-card" onClick={handleYearClick}>
                  <div className="card-icon-wrapper">
                     <BookOpen className="icon" size={18} />
                  </div>
                  <h3>Year 02</h3>
                  <p>Core departmental specialization and technical methodology.</p>
                  <div className="tags">
                     <span className="tag">SEM 3</span>
                     <span className="tag">SEM 4</span>
                  </div>
               </div>
               <div className="year-card highlight" onClick={handleYearClick}>
                  <div className="card-icon-wrapper">
                     <Layers className="icon" size={18} />
                  </div>
                  <h3>Year 03</h3>
                  <p>Advanced analytical modules and real-world project simulations.</p>
                  <div className="tags">
                     <span className="tag active">SEM 5</span>
                     <span className="tag">SEM 6</span>
                  </div>
               </div>
               <div className="year-card" onClick={handleYearClick}>
                  <div className="card-icon-wrapper">
                     <Settings className="icon" size={18} />
                  </div>
                  <h3>Year 04</h3>
                  <p>Final capstone execution and professional bridge programs.</p>
                  <div className="tags">
                     <span className="tag">SEM 7</span>
                     <span className="tag">SEM 8</span>
                  </div>
               </div>
            </div>
         </section>

         {/* Neural Network Section */}
         <section className="section-split">
            <div className="split-left">
               <h4 className="overline-red">NEURAL NETWORK</h4>
               <h2 className="section-title">The Brain</h2>
               <p className="section-subtitle">A clinical, focused feed for high-intensity peer-to-peer learning. No fluff, just solving.</p>

               <ul className="stats-list">
                  <li>
                     <User className="icon-blue" size={18} />
                     <span>Highly Active Community</span>
                  </li>
                  <li>
                     <CheckCircle className="icon-blue" size={18} />
                     <span>Verified Expert Moderation</span>
                  </li>
                  <li>
                     <MessageSquare className="icon-blue" size={18} />
                     <span>Fast response time</span>
                  </li>
               </ul>
            </div>

            <div className="split-right">
               <div className="feed-header">
                  <h4>TOP 3 ENGINEERING POSTS</h4>
                  <a href="#" className="view-all" onClick={requireAuth}>View all</a>
               </div>

               <div className="feed-list">
                  {topPosts.length === 0 ? (
                     <div style={{ padding: '1rem', color: '#64748b' }}>Awaiting community pulses...</div>
                  ) : (
                     topPosts.map((post, idx) => {
                        const bgColors = ['color-1', 'user-2', 'user-3'];
                        const bgColor = bgColors[idx % bgColors.length] || '';

                        return (
                           <div className="feed-item" onClick={() => navigate('/community')} style={{ cursor: 'pointer' }} key={post.id}>
                              <div className="feed-item-header">
                                 <div className="user-info">
                                    <div className={`avatar ${bgColor}`}>{(post.authorName || 'U').charAt(0).toUpperCase()}</div>
                                    <div className="user-meta">
                                       <span className="user-name">{post.authorName}</span>
                                       <span className="time">{post.authorHandle}</span>
                                    </div>
                                 </div>
                                 {post.tag && <span className="badge-green" style={{ fontSize: '0.65rem' }}>{post.tag}</span>}
                              </div>
                              <h4 className="question-title">{post.text}</h4>
                              <div className="question-stats">
                                 <span><MessageSquare size={14} /> {post.comments}</span>
                                 <span><ThumbsUp size={14} /> {post.likes.length}</span>
                              </div>
                           </div>
                        );
                     })
                  )}
               </div>
            </div>
         </section>

         {/* Dark Banner Section */}
         <section className="section-dark-banner">
            <div className="banner-content">
               <h2>Your entire library in<br />your pocket.</h2>
               <p>
                  Seamlessly transition from detailed technical study on<br />
                  desktop to quick reference on your mobile. Sync notes,<br />
                  grades, and community threads in real-time.
               </p>
               <div className="banner-buttons">
                  <button className="btn-dark" onClick={() => navigate('/mobile')}>
                     <Wifi size={18} />
                     Real-time Sync
                  </button>
                  <button className="btn-dark" onClick={() => navigate('/mobile')}>
                     <CloudOff size={18} />
                     Offline Access
                  </button>
               </div>
            </div>
            <div className="banner-visual">
               <div className="backdrop-card"></div>
               <div className="phone-mockup">
                  <div className="phone-screen">
                     <div className="phone-header"></div>
                     <div className="phone-line"></div>
                     <div className="phone-line"></div>
                  </div>
               </div>
            </div>
         </section>

         {/* Footer */}
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

export default LandingPage;
