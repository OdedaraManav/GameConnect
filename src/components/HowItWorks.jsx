import React from 'react';
import { UserCheck, Compass, Users, Gamepad2 } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/mockData';

export default function HowItWorks() {
  const getStepIcon = (index) => {
    switch (index) {
      case 0:
        return <Compass size={28} />;
      case 1:
        return <Users size={28} />;
      case 2:
        return <Gamepad2 size={28} />;
      default:
        return <UserCheck size={28} />;
    }
  };

  return (
    <section id="how-it-works" className="how-it-works-section">
      <div className="container">
        <div className="section-header center">
          <div className="section-badge">
            <UserCheck size={14} />
            <span>Simple Workflow</span>
          </div>
          <h2 className="section-title">
            HOW IT <span className="gradient-text">WORKS</span>
          </h2>
          <p className="section-subtitle">
            Get started in minutes and revolutionize how you discover games and teammates.
          </p>
        </div>

        {/* 3 Steps Process Grid */}
        <div className="steps-grid">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.stepNumber} className="step-card glass-panel">
              <div className="step-number-badge">{step.stepNumber}</div>
              <div className="step-icon-wrapper">
                {getStepIcon(index)}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <h4 className="step-subtitle">{step.subtitle}</h4>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
