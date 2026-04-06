import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import CreatePost from './pages/CreatePost';
import Messages from './pages/Messages';
import AdminCenter from './pages/Admin';
import PetsNeedingHelp from './pages/PetsNeedingHelp';
import FlightVolunteers from './pages/FlightVolunteers';
import PublicProfile from './pages/PublicProfile';
import PostDetail from './pages/PostDetail';
import Onboarding from './pages/Onboarding';
import UpdatePassword from './pages/UpdatePassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import OurStory from './pages/OurStory';
import HowItWorks from './pages/HowItWorks';
import { Moon, Sun, User, MessageCircle, Home as HomeIcon, PawPrint, Plane, LogOut, BookOpen, HelpCircle } from 'lucide-react';
const BrandLogo = () => (
  <svg width="68" height="34" viewBox="0 0 68 34" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M3 4h62v8a5 5 0 0 0 0 10v8H3v-8a5 5 0 0 0 0-10V4z" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="13" y1="6" x2="13" y2="28" strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
    <g transform="translate(22, 5) scale(0.8)">
       <path d="M12 21c-2.4 0-4.6-1.5-5.5-3.8-.3-.8.2-1.6 1-1.6 1.7 0 3-1.3 3-3 0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.7 1.3 3 3 3 .8 0 1.3.8 1 1.6C16.6 19.5 14.4 21 12 21Z" strokeWidth="2" strokeLinecap="round"/>
       <path d="M16 8.5c0 1.4-1.3 2.5-3 2.5s-3-1.1-3-2.5 1.3-3.5 3-3.5 3 2.1 3 3.5Z" strokeWidth="2.5" strokeLinecap="round"/>
       <path d="M9.5 7.5c0 1.4-1.2 2.5-2.8 2.5s-2.8-1.1-2.8-2.5 1.2-3.3 2.7-3.3 2.8 1.9 2.8 3.3Z" strokeWidth="2.5" strokeLinecap="round"/>
       <path d="M20 7.5c0 1.4-1.2 2.5-2.8 2.5S14.5 8.9 14.5 7.5 15.7 4.2 17.2 4.2 20 6.1 20 7.5Z" strokeWidth="2.5" strokeLinecap="round"/>
    </g>
    <g transform="translate(48, 6) scale(0.55)">
      <path d="M17.8 19.2 16 11l-3.5 3.5C11 16 9 16 7.5 14.5c-1.5-1.5-1.5-3.5 0-5l3.5-3.5L2.8 4.2c-.3-.3-.5-.7-.5-1.1s.2-.8.5-1.1c.6-.6 1.5-.6 2.1 0l14.3 14.3c.3.3.5.7.5 1.1s-.2.8-.5 1.1c-.6.6-1.5.6-2.1 0Z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 2 12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <line x1="46" y1="21" x2="57" y2="21" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="46" y1="25" x2="52" y2="25" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const App = () => {
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkOnboarding(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkOnboarding(session.user.id);
        fetchUnreadCount(session.user.id);
        fetchUserRole(session.user.id);
      } else {
        setUnreadCount(0);
        setUserRole(null);
      }
    });

    // Subscribe to unread messages
    let messageChannel;
    if (session?.user) {
      fetchUnreadCount(session.user.id);
      messageChannel = supabase
        .channel('unread-counts')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'messages'
        }, () => {
          fetchUnreadCount(session.user.id);
        })
        .subscribe();
    }

    return () => {
      subscription.unsubscribe();
      if (messageChannel) supabase.removeChannel(messageChannel);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount).catch(console.error);
      } else {
        navigator.clearAppBadge().catch(console.error);
      }
    }
  }, [unreadCount]);

  const checkOnboarding = async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    // If no username, and we aren't already on the onboarding page, redirect
    if (profile && !profile.username && window.location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  };

  const fetchUserRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (data) setUserRole(data.role);
  };

  const fetchUnreadCount = async (userId) => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <nav className="navbar">
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', flexShrink: 0, color: 'var(--color-primary)' }}>
            <BrandLogo />
            <span className="logo-text">FlyMyPaws</span>
          </Link>

          {/* Nav Links - Bottom on mobile */}
          <div className="nav-links-container">
            <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <HomeIcon size={20} className="nav-icon" />
              <span className="full-text">Home</span>
              <span className="short-text">Home</span>
            </NavLink>
            <NavLink to="/how-it-works" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <HelpCircle size={20} className="nav-icon" />
              <span className="full-text">How It Works</span>
              <span className="short-text">Guide</span>
            </NavLink>
            <NavLink to="/our-story" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <BookOpen size={20} className="nav-icon" />
              <span className="full-text">Our Story</span>
              <span className="short-text">Story</span>
            </NavLink>
            <NavLink to="/pets" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <PawPrint size={20} className="nav-icon" />
              <span className="full-text">Pets Needing Help</span>
              <span className="short-text">Pets</span>
            </NavLink>
            <NavLink to="/volunteers" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Plane size={20} className="nav-icon" />
              <span className="full-text">Flight Volunteers</span>
              <span className="short-text">Volunteers</span>
            </NavLink>
          </div>

          {/* Right Side - Actions */}
          <div className="nav-actions">
            <button onClick={() => setDarkMode(!darkMode)} className="theme-toggle" aria-label="Toggle dark mode">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <NavLink to="/messages" className="nav-link nav-icon-only" title="Messages">
                  <MessageCircle size={22} />
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </NavLink>
                <NavLink to="/profile" className="nav-link nav-icon-only" title="Profile">
                  <User size={22} />
                </NavLink>
                <button onClick={handleLogout} className="theme-toggle" title="Logout" style={{ color: 'var(--color-error)', padding: '0.4rem' }}>
                  <LogOut size={20} />
                </button>
                <NavLink to="/create-post" className="btn btn-primary btn-sm btn-post-mobile">
                  <span className="btn-text">+ Post</span>
                  <span className="btn-icon">+</span>
                </NavLink>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home session={session} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/admin" element={<AdminCenter />} />
          <Route path="/pets" element={<PetsNeedingHelp session={session} />} />
          <Route path="/volunteers" element={<FlightVolunteers session={session} />} />
          <Route path="/user/:id" element={<PublicProfile />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/update-password" element={<UpdatePassword session={session} />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                <BrandLogo />
                <span style={{
                  fontWeight: 800,
                  fontSize: '1rem',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>FlyMyPaws</span>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', maxWidth: '220px', lineHeight: '1.5' }}>
                Connecting pet owners with caring flight volunteers. Every pet deserves a safe journey.
              </p>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', gap: '4rem' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>PLATFORM</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/pets" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Pets Needing Help</Link>
                  <Link to="/volunteers" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Flight Volunteers</Link>
                  <Link to="/create-post" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Post a Request</Link>
                  <Link to="/how-it-works" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>How It Works</Link>
                  <Link to="/our-story" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Our Story</Link>
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>LEGAL</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/#disclaimer" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Disclaimer</Link>
                  <Link to="/privacy-policy" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Privacy Policy</Link>
                  <Link to="/terms-of-service" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Terms of Service</Link>
                  {userRole === 'admin' && (
                    <Link to="/admin" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Admin</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
