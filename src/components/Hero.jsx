import React from 'react';
import { Gamepad2, Users, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero-section">
      {/* Glow Effects Background */}
      <div className="hero-ambient-glow glow-1"></div>
      <div className="hero-ambient-glow glow-2"></div>

      <div className="container hero-container">
        <div className="hero-content">
          {/* Badge */}
          <div className="section-badge hero-badge">
            <Sparkles size={14} />
            <span>The Ultimate Gaming Discovery & Social Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="hero-title">
            FIND YOUR NEXT <span className="gradient-text">GAME.</span>
            <br />
            FIND YOUR NEXT <span className="gradient-text-accent">SQUAD.</span>
          </h1>

          {/* Supporting Text */}
          <p className="hero-description">
            Discover games you'll love and connect with gamers like you based on skill, playstyle, and availability.
          </p>

          {/* Call To Action Buttons */}
          <div className="hero-actions">
            <a href="#games" className="btn btn-primary hero-btn">
              <Gamepad2 size={20} />
              <span>Find My Game</span>
            </a>
            <a href="#find-players" className="btn btn-secondary hero-btn">
              <Users size={20} />
              <span>Find Players</span>
            </a>
          </div>

          {/* Live Trust Metrics */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Active Gamers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">1,200+</span>
              <span className="stat-label">Games Tracked</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Match Accuracy</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card / Showcase */}
        <div className="hero-visual">
          <div className="hero-card-wrapper glass-panel">
            <div className="hero-card-header">
              <div className="pulse-dot"></div>
              <span>SQUAD MATCHMAKING LIVE</span>
            </div>
            <div className="hero-card-body">
              <div className="visual-match-preview">
                <div className="player-avatar-group">
                  <div className="avatar avatar-1">🎮</div>
                  <div className="avatar avatar-2">⚔️</div>
                  <div className="avatar avatar-3">🎯</div>
                  <div className="avatar avatar-4">+4</div>
                </div>
                <div className="match-info">
                  <h4>PUBG Rank Squad</h4>
                  <p className="match-tags">
                    <span className="match-tag"><Zap size={12} /> Competitive</span>
                    <span className="match-tag"><ShieldCheck size={12} /> 96% Match</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
