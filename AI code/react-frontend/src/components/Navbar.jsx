import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Menu, X, User, Activity } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <div className="navbar-logo">
          <Activity className="logo-icon" size={32} />
          <div>
            <h1>Rivaansh</h1>
            <span>Lifesciences</span>
          </div>
        </div>

        <nav className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
          <a href="#about">About Us</a>
          <a href="#businesses">Businesses</a>
          <a href="#products">Products</a>
          <a href="#research">R&D</a>
          <a href="#sustainability">Sustainability</a>
          <a href="#careers">Careers</a>
          <a href="#investors">Investors</a>
        </nav>

        <div className="navbar-actions">
          <button className="icon-btn"><Search size={20} /></button>
          <button className="icon-btn"><ShoppingCart size={20} /></button>
          <button className="btn btn-primary login-btn">
            <User size={18} />
            <span>Login</span>
          </button>
          <button 
            className="mobile-toggle icon-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
