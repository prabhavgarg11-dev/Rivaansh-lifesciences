import React from 'react';
import { Pill, Activity, FlaskConical, Stethoscope, ArrowUpRight } from 'lucide-react';
import './Segments.css';

const Segments = () => {
  const segments = [
    {
      id: 1,
      title: 'Pharmaceuticals',
      description: 'Developing high-quality branded and generic formulations globally.',
      icon: <Pill size={32} />,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Active Pharma Ingredients',
      description: 'Producing state-of-the-art APIs for robust global supply chains.',
      icon: <Activity size={32} />,
      color: 'green'
    },
    {
      id: 3,
      title: 'Research & Innovation',
      description: 'Pioneering scientific breakthroughs for complex medical challenges.',
      icon: <FlaskConical size={32} />,
      color: 'purple'
    },
    {
      id: 4,
      title: 'Biosimilars',
      description: 'Making advanced biological therapies more accessible to patients.',
      icon: <Stethoscope size={32} />,
      color: 'orange'
    }
  ];

  return (
    <section className="section segments-section section-light">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Business Segments</h2>
          <p className="section-subtitle">
            A diversified portfolio driving growth and accessible healthcare solutions globally to create sustainable value for communities.
          </p>
        </div>

        <div className="segments-grid">
          {segments.map(segment => (
            <div key={segment.id} className="segment-card group">
              <div className={`segment-icon segment-icon-${segment.color}`}>
                {segment.icon}
              </div>
              <h3 className="segment-title">{segment.title}</h3>
              <p className="segment-description">{segment.description}</p>
              <a href={`#${segment.title.toLowerCase().replace(/ /g, '-')}`} className="segment-link">
                Learn more <ArrowUpRight size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Segments;
