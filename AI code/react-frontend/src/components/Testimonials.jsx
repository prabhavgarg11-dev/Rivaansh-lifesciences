import React from 'react';
import { Star, Quote } from 'lucide-react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Dr. Sarah Jenkins',
      role: 'Chief Cardiologist',
      content: 'Rivaansh Lifesciences has consistently provided high-efficacy cardiovascular treatments. Their commitment to quality is evident in the patient outcomes we observe daily.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Healthcare Administrator',
      content: 'Partnering with Rivaansh has transformed our supply chain reliability. Their medicines are not only cost-effective but also adhere strictly to international standards.',
      rating: 5
    },
    {
      id: 3,
      name: 'Dr. Alisha Patel',
      role: 'Pediatrician',
      content: 'The pediatric line from Rivaansh is exceptional. It is reassuring to have a trusted pharmaceutical partner that prioritizes child safety and formulation precision.',
      rating: 5
    }
  ];

  return (
    <section className="section testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Trusted by Professionals</h2>
          <p className="section-subtitle">
            Hear from the medical experts and healthcare partners who choose Rivaansh Lifesciences for their clinical needs.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <Quote size={40} className="quote-icon" />
              <div className="rating">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} fill="#ff9800" color="#ff9800" />
                ))}
              </div>
              <p className="testimonial-content">"{testimonial.content}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
