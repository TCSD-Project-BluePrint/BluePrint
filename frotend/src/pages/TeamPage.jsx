import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, Shield, Link as LinkIcon, Sliders, HardDrive, Database, Settings2 } from 'lucide-react';
import './TeamPage.css';

function TeamPage() {
   const navigate = useNavigate();
   const { user } = useAuth();

   const handleProtectedNav = (e, path) => {
      e.preventDefault();
      navigate(path);
   };

   return (
      <div className="team-page">
         {/* Navigation */}
         <nav className="navbar team-nav">
            <div className="logo-section" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
               <h2>BluePrint</h2>
            </div>
            <div className="nav-links">
               <a href="#" onClick={(e) => handleProtectedNav(e, '/community')}>Community</a>
               <a href="#" onClick={(e) => handleProtectedNav(e, '/explore')}>Explore</a>
               <a href="#" className="active" onClick={(e) => handleProtectedNav(e, '/team')}>Team</a>
            </div>
            <div className="nav-actions">
               {user ? (
                  <>
                     <Settings size={20} className="header-icon" />
                     <div className="profile-avatar" onClick={() => navigate('/profile')} title={user.email}>
                        {user.profilePicture ? (
                           <img src={user.profilePicture} alt="Profile" className="profile-avatar-img" />
                        ) : (
                           (user.fullName || user.email || 'U').charAt(0).toUpperCase()
                        )}
                     </div>
                     <button className="btn-primary-small" onClick={() => navigate('/department/1')}>Get Started</button>
                  </>
               ) : (
                  <>
                     <Settings size={20} className="header-icon" />
                     <div className="profile-avatar" onClick={() => navigate('/auth')}>
                        <Shield size={16} />
                     </div>
                     <button className="btn-primary-small" onClick={() => navigate('/auth')}>Get Started</button>
                  </>
               )}
            </div>
         </nav>

         {/* Hero Header */}
         <header className="team-hero">
            <div className="grid-overlay"></div>
            <div className="hero-content">
               <div className="overline-blue">CORE PERSONNEL & STRATEGIC PARTNERS</div>
               <h1 className="team-title">The Architects of <br /><span className="text-blue">Knowledge.</span></h1>
               <p className="team-subtitle">
                  Meet the specialized engineering team building the technical foundation for the future of STEM learning.
               </p>
               <div className="team-tags">
                  <span className="tag"><Database size={12} /> SYSTEMS ARCHITECTURE</span>
                  <span className="tag"><HardDrive size={12} /> CORE ENGINEERING</span>
               </div>
            </div>
         </header>

         {/* Team Section */}
         <section className="engineers-section">
            <div className="engineers-header">
               <div>
                  <h2>Core Engineering Team</h2>
                  <p>The dedicated individuals maintaining the primary protocols and interface layers of the BluePrint ecosystem.</p>
               </div>
               <div className="status-badge">STATUS: OPERATIONAL / ALPHA PHASE</div>
            </div>

            <div className="team-grid">
               {/* Card 1 */}
               <div className="team-card">
                  <span className="role-badge"></span>
                  <h3>Parth Jaiswal</h3>
                  <p className="role-title">FRONTEND</p>
                  <p className="role-desc">parth.jaiswal24@mmit.edu.in</p>
                  <div className="card-divider"></div>
                  <div className="card-footer">
                     <div className="icon-group">
                        <Database size={16} />
                        <LinkIcon size={16} />
                     </div>
                     {/* <span className="team-meta">CORE.ROOT</span> */}
                  </div>
               </div>

               {/* Card 2 */}
               <div className="team-card">
                  <span className="role-badge"></span>
                  <h3>Mayuresh Pathak</h3>
                  <p className="role-title">UI/UX</p>
                  <p className="role-desc">mayuresh.pathak24@mmit.edu.in</p>
                  <div className="card-divider"></div>
                  <div className="card-footer">
                     <div className="icon-group">
                        <Sliders size={16} />
                        <Settings2 size={16} />
                     </div>
                     {/* <span className="team-meta">FLOW.SYNC</span> */}
                  </div>
               </div>

               {/* Card 3 */}
               <div className="team-card">
                  <span className="role-badge"></span>
                  <h3>Rushil Dhale</h3>
                  <p className="role-title">BACKEND</p>
                  <p className="role-desc">rushil.dhale24@mmit.edu.in</p>
                  <div className="card-divider"></div>
                  <div className="card-footer">
                     <div className="icon-group">
                        <HardDrive size={16} />
                        <Shield size={16} />
                     </div>
                     {/* <span className="team-meta">UI.UX</span> */}
                  </div>
               </div>
            </div>
         </section>

         {/* Join the Mission CTA */}
         <section className="cta-container">
            <div className="mission-box">
               <div className="blueprint-grid"></div>
               <h2>Join the Mission</h2>
               <p>Whether you're a student capturing brilliant insights or a professor sharing a lifetime of knowledge, your contribution defines the future of BluePrint.</p>
               <div className="mission-buttons">
                  <button className="btn-white" onClick={() => navigate('/setup')}>CONTRIBUTE NOTES</button>
                  <button className="btn-blue-outline" onClick={() => navigate('/mentor/setup')}>APPLY AS MENTOR</button>
               </div>
            </div>
         </section>

         {/* Standard Footer */}
         <footer className="team-footer">
            <div className="footer-logo">
               <div className="logo-box"></div> BluePrint
            </div>
            <div className="footer-links">
               <a href="#">DOCUMENTATION</a>
            </div>
         </footer>
      </div>
   );
}

export default TeamPage;
