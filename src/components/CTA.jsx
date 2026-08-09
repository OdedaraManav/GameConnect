import React from 'react';
import { Rocket, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CTA() {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-box glass-panel">
          {/* Ambient Lighting Glows */}
          <div className="cta-glow glow-cyan"></div>
          <div className="cta-glow glow-purple"></div>

          <div className="cta-content">
            <div className="section-badge cta-badge">
              <Rocket size={14} />
              <span>Join GameConnect Today</span>
            </div>

            <h2 className="cta-title">
              READY TO FIND YOUR <span className="gradient-text">NEXT GAME?</span>
            </h2>

            <p className="cta-description">
              Join GameConnect and discover your gaming community. Connect with compatible players, track your performance, and level up your gaming experience.
            </p>

            <div className="cta-buttons">
              <button className="btn btn-primary btn-lg cta-main-btn">
                <span>Get Started</span>
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="cta-trust-note">
              <ShieldCheck size={16} />
              <span>Free to join • No subscription required • Built for gamers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
