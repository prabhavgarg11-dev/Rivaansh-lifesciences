import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductCard({ product }) {
  const { addToCart, isInCart, removeFromCart } = useCart();
  const { show } = useToast();
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const inCart = isInCart(product.id);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { show('Please sign in to add items to cart.', 'warning'); return; }
    setLoading(true);
    if (inCart) {
      await removeFromCart(product.id);
      show(product.name + ' removed from cart.', 'info');
    } else {
      await addToCart(product.id, 1);
      show(product.name + ' added to cart!', 'success');
    }
    setLoading(false);
  };

  const badgeColors = {
    'Best Seller': '#ff6b35', 'Trending': '#8b5cf6', 'New': '#06b6d4',
    'Natural': '#22c55e', 'Fast Relief': '#ef4444', 'Clinical': '#3b82f6',
    'Superfood': '#f59e0b', 'Premium': '#6366f1', 'Rx Required': '#dc2626',
    'Immunity': '#10b981',
  };

  return (
    <Link to={`/products/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', background: 'var(--bgd)', aspectRatio: '4/3', overflow: 'hidden' }}>
          <img
            src={product.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop'}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s ease' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&h=300&fit=crop'; }}
          />
          {product.badge && (
            <span style={{
              position: 'absolute', top: 10, left: 10,
              background: badgeColors[product.badge] || 'var(--pr)',
              color: 'white', padding: '3px 10px',
              borderRadius: 'var(--r-full)', fontSize: '.7rem',
              fontFamily: 'var(--font)', fontWeight: 700
            }}>{product.badge}</span>
          )}
          {product.prescriptionRequired && (
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(220,38,38,.9)', color: 'white',
              padding: '3px 8px', borderRadius: 'var(--r-full)',
              fontSize: '.65rem', fontFamily: 'var(--font)', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 3
            }}>
              <span className="material-icons-round" style={{ fontSize: 12 }}>medical_services</span>Rx
            </span>
          )}
          {discount > 0 && (
            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'var(--su)', color: 'white',
              padding: '2px 8px', borderRadius: 'var(--r-full)',
              fontSize: '.7rem', fontWeight: 700, fontFamily: 'var(--font)'
            }}>{discount}% OFF</div>
          )}
        </div>
        <div style={{ padding: 14, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '.72rem', color: 'var(--ts)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {product.brand}
          </div>
          <h3 style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.92rem', color: '#1a2332', lineHeight: 1.3 }}>
            {product.name}
          </h3>
          <div style={{ fontSize: '.75rem', color: 'var(--ts)', lineHeight: 1.4, flexGrow: 1 }}>
            {product.composition}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div>
              <span style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--pr)' }}>
                Rs.{product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '.78rem', color: 'var(--ts)', textDecoration: 'line-through', marginLeft: 6 }}>
                  Rs.{product.originalPrice}
                </span>
              )}
            </div>
            <button
              onClick={handleCart}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '7px 14px', borderRadius: 'var(--r)',
                background: inCart ? 'var(--pr-50)' : 'var(--pr)',
                color: inCart ? 'var(--pr)' : 'white',
                border: inCart ? '2px solid var(--pr)' : '2px solid transparent',
                fontFamily: 'var(--font)', fontWeight: 600, fontSize: '.78rem',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all var(--tr)',
              }}
            >
              {loading
                ? <span className="spinner" style={{ width: 14, height: 14 }} />
                : <><span className="material-icons-round" style={{ fontSize: 16 }}>{inCart ? 'remove_shopping_cart' : 'add_shopping_cart'}</span>{inCart ? 'Remove' : 'Add'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
