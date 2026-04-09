import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { fetchProducts, resolveImageUrl } from '../services/api';
import './FeaturedProducts.css';

// Local fallback in case backend is offline
const FALLBACK_PRODUCTS = [
  { id: 1, name: 'Rivakold™ Antikold Tablets', category: 'Tablet', price: 85, description: 'Clinically superior multi-symptom cold and flu relief.', image: 'images/rivakold.jpg', badge: 'Trending' },
  { id: 2, name: 'Rivasyne™ Cream', category: 'Skincare', price: 150, description: 'Strategic clinical-grade antifungal and healing therapy.', image: 'images/rivasyne.jpg', badge: 'Pharmacist Choice' },
  { id: 3, name: 'Rivapro-ESR™ Capsules', category: 'Capsule', price: 299, description: 'Advanced clinical gut-health and immunity booster.', image: 'images/rivapro_esr.jpg', badge: 'Premium' },
  { id: 4, name: 'Rivadol-AP™ Pain Relief', category: 'Tablet', price: 120, description: 'High-performance joint and muscle pain solution.', image: 'images/rivadol_ap.jpg', badge: 'Bestseller' },
  { id: 8, name: 'hCG™ Pregnancy Detection Kit', category: 'Diagnostic Kit', price: 140, description: '99.9% accurate clinical one-step diagnostic kit.', image: 'images/hcg_test.jpg', badge: 'Instant' },
  { id: 7, name: 'Rivoxy™ Softgel Capsules', category: 'Capsule', price: 450, description: 'Triple-strength clinical heart and brain fuel.', image: 'https://images.unsplash.com/photo-1547489432-cf93fa6c71ee?w=400', badge: 'Neuro Support' },
  { id: 12, name: 'RivaC-Zinc™ 1000mg', category: 'Vitamins', price: 145, description: 'Double-action high-fidelity immunity support.', image: 'https://images.unsplash.com/photo-1505751171710-1f6d0ace5a85?w=400', badge: 'Immune' },
  { id: 14, name: 'RivaKof-D™ Clinical Syrup', category: 'Syrup', price: 115, description: 'Sugar-free clinical dry cough suppressant.', image: 'https://images.unsplash.com/photo-1555633514-abcee6ad93e1?w=400', badge: 'Sugar Free' },
];

const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Skincare', 'Vitamins', 'Syrup', 'Diagnostic Kit'];

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS);
      } catch {
        console.warn('Backend offline, using local product data');
        setProducts(FALLBACK_PRODUCTS);
        setError('Using local data — backend offline');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <section className="section featured-products" id="products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Our Pharmaceutical Portfolio</h2>
          <p className="section-subtitle">
            Explore Rivaansh's complete range of high-quality medicines, nutritional supplements, and diagnostic kits.
          </p>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Bar */}
        {error && (
          <div className="status-bar warning">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="products-loader">
            <Loader2 size={40} className="spin-icon" />
            <p>Loading medicines from catalogue...</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {filtered.map(product => (
                <div key={product.id || product._id} className="product-card">
                  <div className="product-image-container">
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400';
                      }}
                    />
                    {product.badge && (
                      <div className="product-badge">{product.badge}</div>
                    )}
                    <div className="product-category-badge">{product.category}</div>
                    {product.prescriptionRequired && (
                      <div className="rx-badge">Rx Required</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    {product.composition && (
                      <p className="product-composition">{product.composition}</p>
                    )}
                    <p className="product-description">{product.description}</p>
                    <div className="product-pricing">
                      <span className="product-price">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="product-original-price">₹{product.originalPrice}</span>
                      )}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="product-discount">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                        </span>
                      )}
                    </div>
                    <div className="product-actions">
                      <button
                        className={`btn product-btn ${addedId === (product.id || product._id) ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag size={16} />
                        {addedId === (product.id || product._id) ? 'Added!' : 'Add to Cart'}
                      </button>
                      <button className="product-link-btn">
                        <Tag size={14} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="products-empty">
                <p>No products found in this category.</p>
              </div>
            )}

            <div className="products-footer">
              <div className="cart-summary">
                {cart.length > 0 && (
                  <span className="cart-badge">🛒 {cart.length} item{cart.length > 1 ? 's' : ''} in cart</span>
                )}
              </div>
              <button className="btn btn-secondary btn-lg">
                View Complete Catalog <ArrowRight size={20} />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
