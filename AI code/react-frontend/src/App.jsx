import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStats from './components/TrustStats';
import Segments from './components/Segments';
import FeaturedProducts from './components/FeaturedProducts';
import AIAssistant from './components/AIAssistant';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Blog from './components/Blog';
import Footer from './components/Footer';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <TrustStats />
      <Segments />
      <FeaturedProducts />
      <AIAssistant />
      <WhyChooseUs />
      <Testimonials />
      <Blog />
      <Footer />
    </div>
  );
}

export default App;
