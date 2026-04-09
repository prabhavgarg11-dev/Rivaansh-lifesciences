import React from 'react';
import { ArrowRight, Activity, ShieldCheck, Microscope } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-background"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge">
            <Activity size={16} />
            <span>Advancing Global Health</span>
          </div>
          <h1 className="hero-title">
            Innovating for a <span>Healthier</span> Tomorrow
          </h1>
          <p className="hero-subtitle">
            Rivaansh Lifesciences is a leading pharmaceutical organization committed to delivering accessible, high-quality, and affordable healthcare solutions across the globe.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg">
              Explore Our Products <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary btn-lg">
              Our Research Focus
            </button>
          </div>
          
          <div className="hero-features">
            <div className="feature">
              <ShieldCheck className="feature-icon" size={24} />
              <span>WHO-GMP Certified</span>
            </div>
            <div className="feature">
              <Microscope className="feature-icon" size={24} />
              <span>Advanced R&D</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1582719471384-894fbb16e074?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Pharmaceutical researchers working in a modern laboratory" 
            className="hero-image"
          />
          <div className="experience-card">
            <h3>25+</h3>
            <p>Years of Excellence</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
