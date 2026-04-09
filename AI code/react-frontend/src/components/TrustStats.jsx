import React from 'react';
import { Users, Globe, Building2, FlaskConical } from 'lucide-react';
import './TrustStats.css';

const TrustStats = () => {
  const stats = [
    {
      id: 1,
      icon: <Users size={32} />,
      value: '50M+',
      label: 'Patients Served',
      color: 'blue'
    },
    {
      id: 2,
      icon: <Globe size={32} />,
      value: '45+',
      label: 'Countries Reached',
      color: 'green'
    },
    {
      id: 3,
      icon: <Building2 size={32} />,
      value: '12',
      label: 'Manufacturing Sites',
      color: 'purple'
    },
    {
      id: 4,
      icon: <FlaskConical size={32} />,
      value: 'R&D',
      label: 'Excellence Hubs',
      color: 'orange'
    }
  ];

  return (
    <section className="trust-stats">
      <div className="container">
        <div className="stats-grid">
          {stats.map(stat => (
            <div key={stat.id} className="stat-card">
              <div className={`stat-icon stat-icon-${stat.color}`}>
                {stat.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustStats;
