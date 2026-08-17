import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Menu, X, Users, Compass, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getIncomingFriendRequests, getAcceptedFriendRequests } from '../services/api';
import AuthModal from './AuthModal';
import SocialModal from './SocialModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  // Global Social Notifications State
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [acceptedRequestCount, setAcceptedRequestCount] = useState(0);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const { user, token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Background fetch & polling for social notifications across all pages
  useEffect(() => {
    if (!token || !isAuthenticated) {
      setPendingRequestCount(0);
      setAcceptedRequestCount(0);
      return;
    }

    async function fetchGlobalSocialNotifications() {
      try {
        const [incRes, accRes] = await Promise.all([
          getIncomingFriendRequests(token).catch(() => ({ requests: [] })),
          getAcceptedFriendRequests(token).catch(() => ({ requests: [] }))
        ]);
        if (incRes && incRes.requests) {
          setPendingRequestCount(incRes.requests.length);
        }
        if (accRes && accRes.requests) {
          setAcceptedRequestCount(accRes.requests.length);
        }
      } catch (err) {
        // silent fallback
      }
    }

    fetchGlobalSocialNotifications();
    const interval = setInterval(fetchGlobalSocialNotifications, 12000);

    window.addEventListener('social_data_changed', fetchGlobalSocialNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener('social_data_changed', fetchGlobalSocialNotifications);
    };
  }, [token, isAuthenticated]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    if (location.pathname === '/profile') {
      navigate('/');
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openLogin = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

  return (
    <>
      <header className="navbar-header">
        <div className="container navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-logo">
            <div className="logo-icon-wrapper">
              <Gamepad2 className="logo-icon" size={26} />
            </div>
            <span className="logo-text">
              GAME<span className="gradient-text">CONNECT</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-links">
            <NavLink 
              to="/games" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Compass size={16} />
              <span>Games</span>
            </NavLink>
            <NavLink 
              to="/players" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Users size={16} />
              <span>Find Players</span>
            </NavLink>
            {isAuthenticated && (
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <User size={16} />
                <span>Profile ({user?.username})</span>
                {pendingRequestCount > 0 && (
                  <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px', padding: '1px 5px', lineHeight: 1 }}>
                    {pendingRequestCount}
                  </span>
                )}
                {acceptedRequestCount > 0 && (
                  <span style={{ backgroundColor: '#22c55e', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '9999px', padding: '1px 5px', lineHeight: 1 }}>
                    ✓ {acceptedRequestCount}
                  </span>
                )}
              </NavLink>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Profile Button with Live Red/Green Badges */}
                <Link to="/profile" className="nav-profile-btn" title={`View profile for ${user?.username}`}>
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <img src={avatarUrl} alt={user?.username} className="nav-avatar-img" />
                    {(pendingRequestCount > 0 || acceptedRequestCount > 0) && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-2px',
                          right: '-2px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: pendingRequestCount > 0 ? '#ef4444' : '#22c55e',
                          border: '2px solid #0f172a',
                          boxShadow: pendingRequestCount > 0 ? '0 0 6px #ef4444' : '0 0 6px #22c55e'
                        }}
                      />
                    )}
                  </div>
                  <span className="nav-user-name">{user?.username}</span>

                  {/* 🔴 Red Pending Badge */}
                  {pendingRequestCount > 0 && (
                    <span
                      data-testid="nav-pending-badge"
                      title={`${pendingRequestCount} pending friend request${pendingRequestCount > 1 ? 's' : ''}`}
                      style={{
                        backgroundColor: '#ef4444',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                        lineHeight: '1',
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                        marginLeft: '0.2rem'
                      }}
                    >
                      {pendingRequestCount}
                    </span>
                  )}

                  {/* 🟢 Green Accepted Badge */}
                  {acceptedRequestCount > 0 && (
                    <span
                      data-testid="nav-accepted-badge"
                      title={`${acceptedRequestCount} accepted friend request${acceptedRequestCount > 1 ? 's' : ''}`}
                      style={{
                        backgroundColor: '#22c55e',
                        color: '#ffffff',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        padding: '0.1rem 0.45rem',
                        borderRadius: '9999px',
                        lineHeight: '1',
                        boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                        marginLeft: '0.2rem'
                      }}
                    >
                      ✓ {acceptedRequestCount}
                    </span>
                  )}
                </Link>

                <button 
                  onClick={handleLogout} 
                  className="btn btn-secondary nav-logout-btn"
                  title="Log out of account"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-secondary nav-login-btn" onClick={openLogin}>
                  <LogIn size={16} />
                  <span>Login</span>
                </button>
                <button className="btn btn-primary nav-signup-btn" onClick={openSignUp}>
                  <UserPlus size={16} />
                  <span>Sign Up</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu} 
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-drawer">
            <nav className="mobile-nav-links">
              <NavLink 
                to="/games" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Compass size={18} />
                <span>Games</span>
              </NavLink>
              <NavLink 
                to="/players" 
                className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users size={18} />
                <span>Find Players</span>
              </NavLink>
              {isAuthenticated && (
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <User size={18} />
                  <span>My Profile ({user?.username})</span>
                  {pendingRequestCount > 0 && (
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '9999px' }}>
                      {pendingRequestCount}
                    </span>
                  )}
                  {acceptedRequestCount > 0 && (
                    <span style={{ backgroundColor: '#22c55e', color: '#fff', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '9999px' }}>
                      ✓ {acceptedRequestCount}
                    </span>
                  )}
                </NavLink>
              )}
            </nav>

            <div className="mobile-auth">
              {isAuthenticated ? (
                <button 
                  className="btn btn-secondary w-full" 
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout ({user?.username})</span>
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary w-full" onClick={openLogin}>Login</button>
                  <button className="btn btn-primary w-full margin-t-xs" onClick={openSignUp}>Sign Up</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />

      {/* Global Social Modal */}
      <SocialModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        onRequestCountChange={setPendingRequestCount}
        onAcceptedCountChange={setAcceptedRequestCount}
      />
    </>
  );
}
