import React from 'react';
import { Users, Trophy, Clock, Gamepad2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SQUAD_FEATURES } from '../data/mockData';

export default function PlayerSection() {
  const getFeatureIcon = (iconName) => {
    switch (iconName) {
      case 'Gamepad2':
        return <Gamepad2 size={24} className="feature-icon-svg" />;
      case 'Trophy':
        return <Trophy size={24} className="feature-icon-svg" />;
      case 'Clock':
        return <Clock size={24} className="feature-icon-svg" />;
      default:
        return <Users size={24} className="feature-icon-svg" />;
    }
  };

  return (
    <section id="find-players" className="squad-section">
      <div className="container">
        <div className="squad-wrapper glass-panel">
          {/* Ambient section lighting */}
          <div className="squad-glow"></div>

          <div className="squad-header center">
            <div className="section-badge">
              <Users size={14} />
              <span>Smart Matchmaking</span>
            </div>
            <h2 className="section-title">
              FIND YOUR <span className="gradient-text-accent">SQUAD</span>
            </h2>
            <p className="section-subtitle">
              Stop queuing with random toxic teammates. GameConnect matches you with players who fit your playstyle.
            </p>
          </div>

          {/* 3 Highlight Cards */}
          <div className="squad-features-grid">
            {SQUAD_FEATURES.map((feature) => (
              <div key={feature.id} className="squad-feature-card">
                <div className="feature-icon-box">
                  {getFeatureIcon(feature.icon)}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-check">
                  <CheckCircle2 size={16} />
                  <span>Compatible Profile</span>
                </div>
              </div>
            ))}
          </div>

          {/* Squad Action Callout */}
          <div className="squad-cta-bar">
            <div className="squad-cta-text">
              <h4>Ready to form your dream gaming squad?</h4>
              <p>Create your gamer profile and discover players active right now.</p>
            </div>
            <button className="btn btn-accent squad-btn">
              <span>Find Players Now</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
