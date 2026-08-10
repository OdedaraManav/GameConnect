import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Gamepad2, Menu, X, Users, Compass, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
              >
                <User size={16} />
                <span>Profile ({user?.username})</span>
              </NavLink>
            )}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="user-profile-badge">
                <Link to="/profile" className="nav-profile-btn" title={`View profile for ${user?.username}`}>
                  <img src={avatarUrl} alt={user?.username} className="nav-avatar-img" />
                  <span className="nav-user-name">{user?.username}</span>
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
                >
                  <User size={18} />
                  <span>My Profile ({user?.username})</span>
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
    </>
  );
}
