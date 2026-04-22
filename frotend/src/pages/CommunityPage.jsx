import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Compass, Bell, Mail, Bookmark, User as UserIcon, 
  Image as ImageIcon, Smile, Calendar, Search, X, Heart, Trash2
} from 'lucide-react';
import './CommunityPage.css';

function CommunityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('for-you');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Dynamic Post States
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const imageInputRef = useRef(null);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const notifRef = useRef(notifications);

  // Keep ref in sync for interval scope
  useEffect(() => {
     notifRef.current = notifications;
  }, [notifications]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const fetchNotifs = async () => {
     if (!user || typeof user.email !== 'string') return;
     try {
        const res = await fetch(`http://${window.location.hostname}:5000/api/auth/user/${user.email}/notifications`);
        if (res.ok) {
           const data = await res.json();
           const newUnread = data.filter(n => !n.read).length;
           const oldUnread = notifRef.current.filter(n => !n.read).length;
           
           if (newUnread > oldUnread) {
              const latest = data.find(n => !n.read);
              if (latest) {
                 setToastMessage(`${latest.actorName} liked your post!`);
                 setTimeout(() => setToastMessage(null), 5000);
              }
           }
           setNotifications(data);
        }
     } catch(e) {}
  };

  useEffect(() => {
    fetchPosts();
    fetchNotifs();
    const interval = setInterval(() => {
       fetchPosts();
       fetchNotifs();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const requireAuthAction = (action) => {
    if (user) {
      if (typeof action === 'function') action();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const getInitial = (name, email) => {
    return (name || email || 'U').charAt(0).toUpperCase();
  };

  const toggleNotifMenu = async () => {
     const nextState = !showNotifMenu;
     setShowNotifMenu(nextState);
     if (nextState && notifications.filter(n => !n.read).length > 0) {
        try {
           await fetch(`http://${window.location.hostname}:5000/api/auth/user/${user.email}/notifications/read`, { method: 'POST' });
           setNotifications(notifications.map(n => ({...n, read: true})));
        } catch(e){}
     }
  };

  // Image handling
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }

  // Submit Post
  const handlePostSubmit = async () => {
    if (!postText.trim() && !selectedImage) return;

    const formData = new FormData();
    formData.append('authorName', user.fullName || user.email.split('@')[0]);
    formData.append('authorHandle', `@${user.email.split('@')[0]}`);
    formData.append('authorEmail', user.email);
    formData.append('authorAvatar', user.profilePicture || '');
    formData.append('text', postText);
    
    if (selectedImage) {
      formData.append('file', selectedImage);
    }

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/posts/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setPostText('');
        clearImage();
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleToggleLike = async (postId) => {
    const previousPosts = [...posts];
    const userEmail = user.email;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const hasLiked = p.likes && p.likes.includes(userEmail);
        const newLikes = hasLiked 
          ? p.likes.filter(e => e !== userEmail) 
          : [...(p.likes || []), userEmail];
        return { ...p, likes: newLikes };
      }
      return p;
    }));

    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/posts/${postId}/like`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email: userEmail, userName: user.fullName || user.email.split('@')[0] })
      });
      if (!res.ok) setPosts(previousPosts);
    } catch (err) {
      setPosts(previousPosts);
      console.error('Failed to toggle like:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const res = await fetch(`http://${window.location.hostname}:5000/api/posts/${postId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        // Add a local notification/toast
        const successNotif = {
           id: Date.now(),
           type: 'SUCCESS',
           message: 'Post deleted successfully',
           read: false,
           createdAt: new Date().toISOString()
        };
        setNotifications(prev => [successNotif, ...prev]);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 3600;
    if (interval > 24) return Math.floor(interval / 24) + "d";
    if (interval >= 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="app-container" style={{backgroundColor: '#fafbfc', minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
      {/* Toast Notification Popup */}
      {toastMessage && (
         <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', backgroundColor: '#1d4ed8', color: 'white', padding: '1rem 1.5rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', cursor: 'pointer', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1rem', animation: 'slideIn 0.3s ease-out' }}>
            <Heart size={20} fill="white" />
            <span style={{ fontWeight: 600 }}>{toastMessage}</span>
         </div>
      )}

      <nav className="navbar" style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: 'white', margin: 0, maxWidth: 'none', padding: '1rem 5%' }}>
        <div className="logo-section" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
           <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>BluePrint</h2>
        </div>
        <div className="nav-links">
           <a href="#" className="active" onClick={(e) => { e.preventDefault(); }}>Community</a>
           <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>Explore</a>
           <a href="#" onClick={(e) => { e.preventDefault(); navigate('/team'); }}>Team</a>
        </div>
        <div className="nav-actions">
           {user ? (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/profile')} title={user.email}>
                 {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                 ) : (
                    getInitial(user.fullName, user.email)
                 )}
              </div>
           ) : (
              <button style={{ backgroundColor: '#1d4ed8', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => requireAuthAction()}>Login</button>
           )}
        </div>
      </nav>

    <div className="comm-page" style={{ flex: 1, minHeight: 'auto', marginTop: 0 }}>
      {/* 1. Left Sidebar */}
      <aside className="comm-sidebar">
        <div className="comm-sidebar-top">
          <div className="comm-nav">
            <a href="#" className="active">
              <Home size={24} /> <span className="nav-text">Home</span>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate('/explore'); }}>
              <Compass size={24} /> <span className="nav-text">Explore</span>
            </a>
            
            {/* Notification Bell Pivot */}
            <div style={{ position: 'relative' }}>
               <a href="#" onClick={(e) => { e.preventDefault(); requireAuthAction(toggleNotifMenu); }} style={{ position: 'relative' }}>
                 <Bell size={24} /> <span className="nav-text">Notifications</span>
                 {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: '0.5rem', left: '1.25rem', backgroundColor: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '0.1rem 0.35rem', borderRadius: '1rem', fontWeight: 'bold' }}>{unreadCount}</span>
                 )}
               </a>
               
               {showNotifMenu && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '300px', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', zIndex: 50, border: '1px solid #e2e8f0', padding: '0.5rem 0' }}>
                     <h4 style={{ padding: '0.5rem 1rem', margin: 0, borderBottom: '1px solid #e2e8f0' }}>Notifications</h4>
                     {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>No notifications yet!</div>
                     ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                           {notifications.map((n, idx) => (
                              <div key={idx} style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', backgroundColor: n.read ? 'white' : '#eff6ff' }}>
                                 <Heart size={16} fill="#ef4444" color="#ef4444" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                                 <div>
                                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>{n.actorName}</strong> liked your post.</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>"{n.postTextSnippet}"</p>
                                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>{getTimeAgo(n.createdAt)}</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               )}
            </div>

            <a href="#" onClick={(e) => { e.preventDefault(); requireAuthAction(); }}>
              <Mail size={24} /> <span className="nav-text">Messages</span>
            </a>
             <a href="#" onClick={(e) => { e.preventDefault(); requireAuthAction(() => navigate('/profile')); }}>
              <UserIcon size={24} /> <span className="nav-text">Profile</span>
            </a>
          </div>
          <button className="comm-post-btn-large" onClick={() => requireAuthAction()}>
            Post
          </button>
        </div>
      </aside>

      {/* 2. Main Feed */}
      <main className="comm-main">
        {/* Sticky Header */}
        <div className="comm-header-sticky">
           <div className="comm-header-top">
              <h3>Home</h3>
           </div>
           <div className="comm-tabs">
              <div className={`comm-tab ${activeTab === 'for-you' ? 'active' : ''}`} onClick={() => setActiveTab('for-you')}>
                 For You
                 <div className="tab-indicator"></div>
              </div>
              <div className={`comm-tab ${activeTab === 'following' ? 'active' : ''}`} onClick={() => setActiveTab('following')}>
                 Following
                 <div className="tab-indicator"></div>
              </div>
           </div>
        </div>

        {/* Input Box */}
        <div className="comm-compose-box" style={{flexDirection: 'column'}}>
           <div style={{display: 'flex', gap: '1rem'}}>
               <div className="comm-compose-avatar">
                  {user && user.profilePicture ? (
                     <img src={user.profilePicture} alt="Profile" />
                  ) : (
                     <div className="comm-avatar-placeholder">
                        {user ? getInitial(user.fullName, user.email) : <UserIcon size={20} />}
                     </div>
                  )}
               </div>
               
               <div className="comm-compose-content" style={{flex: 1}}>
                  <input 
                    type="text" 
                    placeholder="What's happening?" 
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    onClick={() => requireAuthAction()} 
                  />
                  
                  {previewImage && (
                    <div style={{ position: 'relative', marginBottom: '1rem', display: 'inline-block' }}>
                       <img src={previewImage} alt="Preview" style={{ maxHeight: '200px', borderRadius: '0.5rem', objectFit: 'contain' }} />
                       <button 
                         onClick={clearImage}
                         style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.2rem', cursor: 'pointer' }}
                       ><X size={16}/></button>
                    </div>
                  )}
               </div>
           </div>

           <div className="comm-compose-actions" style={{ marginLeft: '56px' }}>
              <div className="compose-icons">
                 <input 
                    type="file" 
                    accept="image/*" 
                    ref={imageInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleImageSelect}
                 />
                 <ImageIcon size={18} className="icon-blue-click" onClick={() => requireAuthAction(() => imageInputRef.current.click())}/>
                 <Smile size={18} className="icon-blue-click" onClick={() => requireAuthAction()}/>
                 <Calendar size={18} className="icon-blue-click" onClick={() => requireAuthAction()}/>
              </div>
              <button 
                className="comm-post-btn-small" 
                style={{ opacity: (postText.trim() || previewImage) ? 1 : 0.5 }}
                onClick={() => requireAuthAction(handlePostSubmit)}
              >Post</button>
           </div>
        </div>

        {/* Feed Posts */}
        <div className="comm-feed">
           {posts.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                 No posts yet! Generate some engineering insights.
              </div>
           ) : (
              posts.map((post) => {
                 const hasLiked = user && post.likes && post.likes.includes(user.email);

                 return (
                 <div key={post.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                     <div className="comm-post" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                        <div className="post-avatar">
                           {post.authorAvatar ? (
                              <img src={post.authorAvatar} alt={post.authorName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                           ) : (
                              <div className="placeholder-avatar color-3">
                                 {getInitial(post.authorName, '')}
                              </div>
                           )}
                        </div>
                        <div className="post-content-area">
                           <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                 <span className="post-name">{post.authorName}</span>
                                 <span className="post-handle">{post.authorHandle} • {getTimeAgo(post.createdAt)}</span>
                              </div>
                              {user && user.email === post.authorEmail && (
                                 <button 
                                   onClick={() => handleDeletePost(post.id)}
                                   style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', borderRadius: '50%', transition: 'all 0.2s', display: 'flex' }}
                                   onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = '#fef2f2'; }}
                                   onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                   title="Delete post"
                                 >
                                   <Trash2 size={15} />
                                 </button>
                              )}
                           </div>
                           
                           <p className="post-text">{post.text}</p>

                           {post.imageFile && (
                              <div style={{ width: '100%', borderRadius: '0.5rem', overflow: 'hidden', marginBottom: '0.75rem', border: '1px solid #f1f5f9' }}>
                                 <img src={post.imageFile.startsWith('http') ? post.imageFile.replace('localhost', window.location.hostname) : `http://${window.location.hostname}:5000${post.imageFile}`} alt="Post attachment" style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain', backgroundColor: '#f8fafc' }} />
                              </div>
                           )}
                           
                           <div className="post-metrics" style={{ marginTop: '0.5rem' }}>
                              <span 
                                className="metric" 
                                style={{ color: hasLiked ? '#ef4444' : '', cursor: 'pointer' }} 
                                onClick={() => requireAuthAction(() => handleToggleLike(post.id))}
                              >
                                 <Heart size={16} fill={hasLiked ? '#ef4444' : 'none'} color={hasLiked ? '#ef4444' : 'currentColor'} /> {post.likes ? post.likes.length : 0}
                              </span>
                           </div>
                        </div>
                     </div>
                 </div>
                 );
              })
           )}
        </div>
      </main>

      {/* 3. Right Sidebar */}
      <aside className="comm-right">
        <div className="comm-search-bar">
           <Search size={18} className="search-icon" />
           <input type="text" placeholder="Search Engineering Hub" />
        </div>
        <div className="right-footer-links">
           <a href="#">Cookie Policy</a>
        </div>
      </aside>

      {isAuthModalOpen && (
        <div className="dept-modal-backdrop">
          <div className="dept-auth-modal">
            <button className="dept-close-btn" onClick={() => setIsAuthModalOpen(false)}>
              <X size={20} />
            </button>
            <div className="auth-modal-content">
              <h3>This requires sign in</h3>
              <p>You need to be signed in to interact with the engineering hub.</p>
              <div className="auth-modal-actions">
                <button className="btn-secondary" onClick={() => setIsAuthModalOpen(false)}>
                  Continue without sign in
                </button>
                <button className="btn-primary" onClick={() => navigate('/auth')}>
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}

export default CommunityPage;
