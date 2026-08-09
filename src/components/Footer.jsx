import React from 'react';
import { Gamepad2, Github, Twitter, MessageSquare, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <a href="#" className="navbar-logo footer-logo">
              <div className="logo-icon-wrapper">
                <Gamepad2 className="logo-icon" size={24} />
              </div>
              <span className="logo-text">
                GAME<span className="gradient-text">CONNECT</span>
              </span>
            </a>
            <p className="footer-description">
              The ultimate gaming discovery and social platform designed for gamers to discover titles, build squads, and track performance.
            </p>
            {/* Social Links Placeholders */}
            <div className="footer-socials">
              <a href="#" className="social-icon-btn" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="social-icon-btn" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-icon-btn" aria-label="Discord">
                <MessageSquare size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links Column 1 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><a href="#games">Game Discovery</a></li>
              <li><a href="#find-players">Player Matchmaking</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#">PUBG Statistics</a></li>
            </ul>
          </div>

          {/* Quick Links Column 2 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Community</h4>
            <ul className="footer-links">
              <li><a href="#">Find Teammates</a></li>
              <li><a href="#">Leaderboards</a></li>
              <li><a href="#">Discord Server</a></li>
              <li><a href="#">Guidelines</a></li>
            </ul>
          </div>

          {/* Quick Links Column 3 */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Legal & Info</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">RAWG API Notice</a></li>
              <li><a href="#">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {currentYear} GameConnect. All rights reserved. Designed for Portfolio Showcase.
          </p>
          <p className="made-with-love">
            Built with <Heart size={14} className="heart-icon" fill="#FF2A85" color="#FF2A85" /> using React & Vite
          </p>
        </div>
      </div>
    </footer>
  );
}
