import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Gamepad2, Menu, X, Users, Compass, UserCheck, User } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
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
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <User size={16} />
            <span>Profile ({CURRENT_USER.username})</span>
          </NavLink>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="navbar-auth">
          <Link to="/profile" className="nav-profile-btn" title="View Profile">
            <img src={CURRENT_USER.avatar} alt={CURRENT_USER.username} className="nav-avatar-img" />
          </Link>
          <button className="btn btn-secondary nav-login-btn">
            Login
          </button>
          <button className="btn btn-primary nav-signup-btn">
            Sign Up
          </button>
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
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User size={18} />
              <span>My Profile ({CURRENT_USER.username})</span>
            </NavLink>
          </nav>

          <div className="mobile-auth">
            <button className="btn btn-secondary w-full">Login</button>
            <button className="btn btn-primary w-full">Sign Up</button>
          </div>
        </div>
      )}
    </header>
  );
}
