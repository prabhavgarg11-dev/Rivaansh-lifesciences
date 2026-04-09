import React from 'react';
import { Activity, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Activity className="logo-icon" size={32} />
              <div>
                <h2>Rivaansh</h2>
                <span>Lifesciences</span>
              </div>
            </div>
            <p className="footer-description">
              A premier pharmaceutical organization dedicated to providing high-quality, affordable medicines to communities worldwide. Committed to health, driven by innovation.
            </p>
            <div className="social-links">
              <a href="#facebook" className="social-link"><Facebook size={20} /></a>
              <a href="#twitter" className="social-link"><Twitter size={20} /></a>
              <a href="#linkedin" className="social-link"><Linkedin size={20} /></a>
              <a href="#instagram" className="social-link"><Instagram size={20} /></a>
            </div>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#leadership">Leadership Team</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#investors">Investors</a></li>
              <li><a href="#sustainability">Sustainability</a></li>
            </ul>
          </div>

          <div className="footer-links-group">
            <h4 className="footer-heading">Therapy Areas</h4>
            <ul className="footer-links">
              <li><a href="#cardiology">Cardiology</a></li>
              <li><a href="#neurology">Neurology</a></li>
              <li><a href="#orthopedics">Orthopedics</a></li>
              <li><a href="#gastroenterology">Gastroenterology</a></li>
              <li><a href="#pediatrics">Pediatrics</a></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h4 className="footer-heading">Contact Us</h4>
            <ul className="contact-info">
              <li>
                <MapPin size={20} className="contact-icon" />
                <span>123 Pharma Park, Innovation Dist, Health City, 400001</span>
              </li>
              <li>
                <Phone size={20} className="contact-icon" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li>
                <Mail size={20} className="contact-icon" />
                <span>contact@rivaanshlifesciences.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Rivaansh Lifesciences. All Rights Reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#cookie">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
