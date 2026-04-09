import React from 'react';
import { Target, Award, Leaf, Zap } from 'lucide-react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const reasons = [
    {
      id: 1,
      icon: <Award size={32} />,
      title: 'Uncompromising Quality',
      description: 'Our state-of-the-art facilities ensure every product meets the highest international quality standards.',
    },
    {
      id: 2,
      icon: <Target size={32} />,
      title: 'Patient-Centric Approach',
      description: 'We prioritize patient safety and well-being in every decision and formulation we develop.',
    },
    {
      id: 3,
      icon: <Zap size={32} />,
      title: 'Innovative R&D',
      description: 'Continuous investment in research allows us to pioneer advanced therapeutic solutions.',
    },
    {
      id: 4,
      icon: <Leaf size={32} />,
      title: 'Sustainable Practices',
      description: 'Committed to environmental stewardship through eco-friendly manufacturing processes.',
    }
  ];

  return (
    <section className="section why-choose-section section-light">
      <div className="container">
        <div className="why-content-wrapper">
          <div className="why-text">
            <h2 className="section-title">The Rivaansh Advantage</h2>
            <p className="section-subtitle" style={{textAlign: 'left', marginInline: '0'}}>
              We combine scientific expertise with compassionate care to deliver healthcare solutions that make a tangible difference in people's lives across the globe.
            </p>
            <div className="reasons-grid">
              {reasons.map(reason => (
                <div key={reason.id} className="reason-item">
                  <div className="reason-icon">{reason.icon}</div>
                  <div className="reason-content">
                    <h3>{reason.title}</h3>
                    <p>{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="why-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
              alt="Medical Professionals" 
              className="why-image"
            />
            <div className="certification-badge">
              <h4>ISO 9001:2015</h4>
              <p>Certified Company</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
