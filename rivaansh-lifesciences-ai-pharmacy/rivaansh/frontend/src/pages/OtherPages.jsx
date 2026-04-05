import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

// ══════════════════════════════════
// PRODUCT DETAIL PAGE
// ══════════════════════════════════
export function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart, updateQty, isInCart, items } = useCart();
  const { show } = useToast();
  const { isLoggedIn } = useAuth();
  const [product, setProduct]   = useState(null);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  const inCart    = isInCart(id);
  const cartItem  = items.find(i => String(i.productId) === String(id));
  const discount  = product?.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!isLoggedIn) { window.dispatchEvent(new CustomEvent('auth:required')); return; }
    setAddLoading(true);
    const { ok } = await addToCart(product.id, 1);
    if (ok) show(`${product.name} added to cart!`, 'success');
    setAddLoading(false);
  };

  const handleAiSummary = async () => {
    setAiLoading(true);
    const { ok, data } = await api.post('/ai/summary', { productId: product.id });
    if (ok) setSummary(data.summary);
    setAiLoading(false);
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div className="skeleton" style={{ height: 360, borderRadius: 'var(--r-xl)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[80, 200, 40, 80, 60, 120].map((h, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <div className="empty-state">
        <span className="material-icons-round">search_off</span>
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-primary btn-sm">Back to Products</Link>
      </div>
    </div>
  );

  const tabs = [
    { id: 'info', label: 'Information', icon: 'info' },
    { id: 'ai', label: 'AI Summary', icon: 'auto_awesome' },
    { id: 'usage', label: 'Usage & Dosage', icon: 'medication' },
  ];

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 20, fontSize: '.82rem', color: 'var(--ts)' }}>
        <Link to="/" style={{ color: 'var(--pr)' }}>Home</Link>
        <span className="material-icons-round" style={{ fontSize: 14 }}>chevron_right</span>
        <Link to="/products" style={{ color: 'var(--pr)' }}>Medicines</Link>
        <span className="material-icons-round" style={{ fontSize: 14 }}>chevron_right</span>
        <span>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
        {/* Image */}
        <div style={{ background: 'var(--bgd)', borderRadius: 'var(--r-xl)', overflow: 'hidden', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<span class="material-icons-round" style="font-size:80px;color:var(--pr-100)">medication</span>'; }} />
          ) : (
            <span className="material-icons-round" style={{ fontSize: 80, color: 'var(--pr-100)' }}>medication</span>
          )}
          {discount > 0 && (
            <div style={{ position: 'absolute', top: 16, left: 16, background: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: 'var(--r-full)', fontFamily: 'var(--font)', fontWeight: 800, fontSize: '.9rem' }}>
              {discount}% OFF
            </div>
          )}
          {product.prescriptionRequired && (
            <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--er)', color: 'white', padding: '6px 12px', borderRadius: 'var(--r)', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.82rem' }}>
              Prescription Required
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {product.badge && (
            <span className="badge badge-primary" style={{ alignSelf: 'flex-start' }}>{product.badge}</span>
          )}

          <div>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.5rem', fontWeight: 800, color: '#1a2332', marginBottom: 4 }}>{product.name}</h1>
            <p style={{ color: 'var(--ts)', fontWeight: 500 }}>{product.brand}</p>
          </div>

          {product.composition && (
            <div style={{ padding: '10px 14px', background: 'var(--bgd)', borderRadius: 'var(--r)', fontSize: '.83rem', color: 'var(--tm)' }}>
              <strong style={{ color: 'var(--pr)', fontFamily: 'var(--font)' }}>Composition:</strong> {product.composition}
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: '2rem', fontWeight: 900, color: 'var(--pr)' }}>₹{product.price}</span>
            {product.originalPrice && (
              <span style={{ textDecoration: 'line-through', color: 'var(--ts)', fontSize: '1.1rem' }}>₹{product.originalPrice}</span>
            )}
          </div>

          {/* Stock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.88rem', fontWeight: 600, color: product.stock > 0 ? 'var(--su)' : 'var(--er)' }}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>{product.stock > 0 ? 'check_circle' : 'cancel'}</span>
            {product.stock > 50 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
          </div>

          {/* Cart */}
          {inCart ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: 'var(--pr-50)', borderRadius: 'var(--r-lg)', border: '2px solid var(--pr)' }}>
              <button onClick={() => updateQty(product.id, -1)} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--pr)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons-round" style={{ fontSize: 20 }}>remove</span>
              </button>
              <span style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--pr)', flex: 1, textAlign: 'center' }}>
                {cartItem?.quantity || 0} in cart
              </span>
              <button onClick={() => updateQty(product.id, 1)} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--pr)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons-round" style={{ fontSize: 20 }}>add</span>
              </button>
            </div>
          ) : (
            <button onClick={handleAddToCart} disabled={addLoading || product.stock === 0} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {addLoading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <span className="material-icons-round">add_shopping_cart</span>}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}

          {/* Delivery badge */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { icon: 'local_shipping', label: 'Free delivery above ₹499' },
              { icon: 'verified', label: 'WHO-GMP Certified' },
              { icon: 'lock', label: 'Secure Payment' },
            ].map(b => (
              <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.75rem', color: 'var(--ts)', fontWeight: 500 }}>
                <span className="material-icons-round" style={{ fontSize: 14, color: 'var(--su)' }}>{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginTop: 40 }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--bd)', marginBottom: 24, overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => t.id === 'ai' ? (setActiveTab('ai'), !summary && handleAiSummary()) : setActiveTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 'var(--r) var(--r) 0 0',
              border: 'none', background: activeTab === t.id ? 'var(--pr)' : 'transparent',
              color: activeTab === t.id ? 'white' : 'var(--tm)',
              fontFamily: 'var(--font)', fontWeight: 600, fontSize: '.88rem', cursor: 'pointer',
              whiteSpace: 'nowrap', transition: 'all var(--tr)'
            }}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
              {t.id === 'ai' && <span className="badge badge-ai" style={{ fontSize: '.62rem', padding: '1px 6px' }}>AI</span>}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            <InfoCard icon="description" title="Description" text={product.description} />
            {product.uses && <InfoCard icon="medical_services" title="Uses" text={product.uses} />}
            {product.storage && <InfoCard icon="ac_unit" title="Storage" text={product.storage} />}
          </div>
        )}

        {activeTab === 'usage' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {product.dosage && <InfoCard icon="schedule" title="Dosage" text={product.dosage} color="var(--pr)" />}
            {product.sideEffects && <InfoCard icon="warning" title="Side Effects" text={product.sideEffects} color="var(--wa)" />}
          </div>
        )}

        {activeTab === 'ai' && (
          <div style={{ animation: 'fadeUp .3s ease' }}>
            {aiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40, color: 'var(--pr)' }}>
                <div className="spinner spinner-dark" />
                <span style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>AI is analyzing this medicine…</span>
              </div>
            ) : summary ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                {summary.what_it_does && <AIInfoCard label="What it does" value={summary.what_it_does} icon="info" />}
                {summary.who_should_use && <AIInfoCard label="Who should use" value={summary.who_should_use} icon="person" />}
                {summary.how_to_use?.length > 0 && <AIInfoCard label="How to use" value={summary.how_to_use.join(' → ')} icon="format_list_numbered" />}
                {summary.key_warnings?.length > 0 && <AIInfoCard label="Key warnings" value={summary.key_warnings.join(' • ')} icon="warning" color="var(--wa)" />}
                {summary.good_to_know && <AIInfoCard label="Good to know" value={summary.good_to_know} icon="tips_and_updates" />}
              </div>
            ) : null}
            <div style={{ marginTop: 16 }}>
              <div className="disclaimer"><span className="material-icons-round">warning</span>AI-generated summary for informational purposes only.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text, color = 'var(--pr)' }) {
  return (
    <div style={{ padding: 20, background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--bd)', boxShadow: 'var(--sh-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span className="material-icons-round" style={{ fontSize: 18, color }}>{icon}</span>
        <h3 style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem', color: '#1a2332' }}>{title}</h3>
      </div>
      <p style={{ fontSize: '.88rem', color: 'var(--tm)', lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

function AIInfoCard({ label, value, icon, color = 'var(--pr)' }) {
  return (
    <div style={{ padding: 16, background: 'var(--bgd)', borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
        <span className="material-icons-round" style={{ fontSize: 16, color }}>{icon}</span>
        <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--ts)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '.86rem', color: 'var(--tm)', lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

// ══════════════════════════════════
// AUTH PAGE
// ══════════════════════════════════
export function AuthPage() {
  const [mode, setMode]         = useState('login');
  const [form, setForm]         = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login, register, isLoggedIn } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();

  useEffect(() => { if (isLoggedIn) nav('/'); }, [isLoggedIn]);

  const handle = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = mode === 'login'
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.phone, form.password);

    if (res.ok) {
      show(mode === 'login' ? 'Welcome back!' : 'Account created!', 'success');
      nav('/');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'linear-gradient(135deg,var(--bgd),white)' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg,var(--pr),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span className="material-icons-round" style={{ color: 'white', fontSize: 28 }}>local_pharmacy</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.6rem', fontWeight: 800, color: '#1a2332', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--ts)' }}>
            {mode === 'login' ? 'Sign in to your Rivaansh account' : 'Join Rivaansh Lifesciences'}
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {mode === 'register' && (
              <div className="input-group">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}

            <div className="input-group">
              <label className="label">Email Address</label>
              <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            {mode === 'register' && (
              <div className="input-group">
                <label className="label">Phone Number</label>
                <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              </div>
            )}

            <div className="input-group">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: '#fee2e2', borderRadius: 'var(--r)', color: 'var(--er)', fontSize: '.85rem', fontWeight: 500, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="material-icons-round" style={{ fontSize: 16 }}>error</span>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 4 }}>
              {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="divider" style={{ marginTop: 24 }} />
          <p style={{ textAlign: 'center', fontSize: '.88rem', color: 'var(--ts)' }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }} style={{ color: 'var(--pr)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.88rem' }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════
// CHECKOUT PAGE
// ══════════════════════════════════
export function CheckoutPage() {
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();
  const [form, setForm]       = useState({ address: '', phone: '' });
  const [rxFile, setRxFile]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced]   = useState(false);
  const [orderId, setOrderId] = useState('');

  const hasRx = items.some(i => i.prescriptionRequired);

  useEffect(() => {
    if (!isLoggedIn) nav('/auth');
    if (!items.length && !placed) nav('/products');
  }, [isLoggedIn, items, placed]);

  const handleOrder = async (e) => {
    e.preventDefault();
    if (hasRx && !rxFile) { show('Please upload prescription for Rx medicines.', 'error'); return; }
    setLoading(true);

    const fd = new FormData();
    fd.append('payload', JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, name: i.name })), address: form.address, phone: form.phone, totalAmount: total }));
    if (rxFile) fd.append('prescription', rxFile);

    const { ok, data } = await api.postForm('/orders', fd);
    if (ok) {
      await clearCart();
      setOrderId(data._id);
      setPlaced(true);
      show('Order placed successfully! 🎉', 'success');
    } else {
      show(data.message || 'Order failed.', 'error');
    }
    setLoading(false);
  };

  if (placed) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,var(--su),#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'fadeUp .5s ease' }}>
          <span className="material-icons-round" style={{ color: 'white', fontSize: 40 }}>check</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.8rem', fontWeight: 800, color: '#1a2332', marginBottom: 8 }}>Order Placed! 🎉</h1>
        <p style={{ color: 'var(--ts)', marginBottom: 8 }}>Your order <strong style={{ color: 'var(--pr)' }}>{orderId}</strong> has been confirmed.</p>
        <p style={{ color: 'var(--ts)', marginBottom: 28, fontSize: '.9rem' }}>Your medicines will be delivered to your address.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Form */}
        <form onSubmit={handleOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20, boxShadow: 'none' }}>
            <h2 style={{ fontFamily: 'var(--font)', fontWeight: 700, marginBottom: 16 }}>Delivery Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="label">Delivery Address *</label>
                <textarea className="input" rows={3} style={{ resize: 'vertical' }} required placeholder="House no., Street, Area, City, State, PIN" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="input-group">
                <label className="label">Contact Number *</label>
                <input className="input" type="tel" required placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
          </div>

          {hasRx && (
            <div className="card" style={{ padding: 20, boxShadow: 'none', border: '2px solid var(--er)' }}>
              <h2 style={{ fontFamily: 'var(--font)', fontWeight: 700, marginBottom: 8, color: 'var(--er)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="material-icons-round">warning</span> Prescription Required
              </h2>
              <p style={{ fontSize: '.83rem', color: 'var(--ts)', marginBottom: 12 }}>Some items require a valid prescription.</p>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}>
                <div style={{ padding: '12px 16px', border: '2px dashed var(--bd)', borderRadius: 'var(--r)', textAlign: 'center', background: 'var(--bgd)' }}>
                  <span className="material-icons-round" style={{ color: 'var(--pr)', display: 'block', fontSize: 32, marginBottom: 6 }}>upload_file</span>
                  <span style={{ fontSize: '.83rem', color: 'var(--tm)', fontWeight: 600 }}>
                    {rxFile ? rxFile.name : 'Upload Prescription (JPG/PDF)'}
                  </span>
                </div>
                <input type="file" accept="image/*,.pdf" onChange={e => setRxFile(e.target.files[0])} style={{ display: 'none' }} />
              </label>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {loading ? <div className="spinner" style={{ width: 18, height: 18 }} /> : <><span className="material-icons-round">check_circle</span>Place Order (₹{total})</>}
          </button>
        </form>

        {/* Order Summary */}
        <div className="card" style={{ padding: 20, boxShadow: 'none', alignSelf: 'flex-start' }}>
          <h2 style={{ fontFamily: 'var(--font)', fontWeight: 700, marginBottom: 16 }}>Order Summary ({items.length} items)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {items.map(item => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.87rem' }}>
                <span style={{ color: 'var(--tm)' }}>{item.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          {[
            { label: 'Subtotal', val: `₹${subtotal}` },
            { label: 'Delivery', val: delivery === 0 ? 'FREE' : `₹${delivery}`, c: delivery === 0 ? 'var(--su)' : null },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', color: 'var(--tm)', marginBottom: 8 }}>
              <span>{r.label}</span>
              <span style={{ fontWeight: 600, color: r.c }}>{r.val}</span>
            </div>
          ))}
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.1rem' }}>Total</span>
            <span style={{ fontFamily: 'var(--font)', fontWeight: 900, fontSize: '1.2rem', color: 'var(--pr)' }}>₹{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════
// ORDERS PAGE
// ══════════════════════════════════
export function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const nav = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { nav('/auth'); return; }
    api.get('/orders').then(({ data }) => {
      setOrders(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [isLoggedIn]);

  const statusColor = { confirmed: 'var(--info)', processing: 'var(--wa)', shipped: '#7c3aed', delivered: 'var(--su)', cancelled: 'var(--er)' };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>My Orders</h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <span className="material-icons-round">shopping_bag</span>
          <h3>No orders yet</h3>
          <p>Browse our products and place your first order.</p>
          <Link to="/products" className="btn btn-primary btn-sm">Shop Now</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ padding: 20, transition: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 800, color: '#1a2332' }}>
                    Order #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p style={{ fontSize: '.78rem', color: 'var(--ts)', marginTop: 2 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span style={{ padding: '5px 14px', borderRadius: 'var(--r-full)', background: (statusColor[order.status] || 'var(--ts)') + '15', color: statusColor[order.status] || 'var(--ts)', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.78rem', textTransform: 'uppercase' }}>
                  {order.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: '.85rem', color: 'var(--tm)', marginBottom: 12 }}>
                <span><strong>{order.items?.length || 0}</strong> items</span>
                <span style={{ color: 'var(--pr)', fontWeight: 700 }}>₹{order.totalAmount}</span>
                {order.address && <span>📍 {order.address.substring(0, 40)}{order.address.length > 40 ? '…' : ''}</span>}
              </div>

              <details>
                <summary style={{ cursor: 'pointer', fontSize: '.82rem', fontWeight: 700, color: 'var(--pr)', userSelect: 'none' }}>View Items</summary>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '6px 10px', background: 'var(--bgd)', borderRadius: 'var(--r)' }}>
                      <span>{item.name || 'Product'} × {item.quantity}</span>
                      <span style={{ fontWeight: 700 }}>₹{(item.price || 0) * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════
export function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const { items, total } = useCart();
  const nav = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [recommend, setRecommend] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { nav('/auth'); return; }
    api.get('/orders').then(({ data }) => setOrders(Array.isArray(data) ? data : []));
    api.post('/ai/recommend', { cartItems: items }).then(({ data }) => setRecommend(data));
  }, [isLoggedIn]);

  const aiLinks = [
    { icon: 'smart_toy', label: 'Chat with AI Doctor', to: '/ai/chat', color: '#0891b2' },
    { icon: 'search', label: 'AI Medicine Search', to: '/ai/search', color: '#6366f1' },
    { icon: 'document_scanner', label: 'Analyze Prescription', to: '/ai/prescription', color: '#059669' },
    { icon: 'warning', label: 'Check Side Effects', to: '/ai/sideeffects', color: '#dc2626' },
    { icon: 'biotech', label: 'Lab Test Suggester', to: '/ai/labtest', color: '#7c3aed' },
    { icon: 'alarm', label: 'Medicine Reminder', to: '/ai/reminder', color: '#ea580c' },
  ];

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28, padding: 24, background: 'linear-gradient(135deg,var(--pr),var(--accent))', borderRadius: 'var(--r-xl)', color: 'white' }}>
        <p style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
          Hello, {user?.name?.split(' ')[0]} 👋
        </p>
        <p style={{ opacity: .85, fontSize: '.9rem' }}>Welcome to your Rivaansh health dashboard.</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Orders', val: orders.length },
            { label: 'Cart Items', val: items.length },
            { label: 'Cart Value', val: `₹${total}` },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1.4rem' }}>{s.val}</p>
              <p style={{ opacity: .75, fontSize: '.78rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Quick Access */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="section-title" style={{ marginBottom: 4 }}>AI Health Tools</h2>
        <p className="section-subtitle">Smart healthcare at your fingertips</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginTop: 16 }}>
          {aiLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 16px', background: 'white',
              borderRadius: 'var(--r-lg)', border: '1px solid var(--bd)',
              textDecoration: 'none', transition: 'all var(--tr-lg)',
              boxShadow: 'var(--sh-sm)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = l.color; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--bd)'; }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: l.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span className="material-icons-round" style={{ color: l.color, fontSize: 18 }}>{l.icon}</span>
              </div>
              <span style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: '.82rem', color: '#1a2332', lineHeight: 1.3 }}>{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {recommend?.recommendations?.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            <span className="material-icons-round" style={{ fontSize: 20, color: 'var(--pr)', verticalAlign: 'middle', marginRight: 6 }}>auto_awesome</span>
            AI Recommendations
          </h2>
          <p className="section-subtitle">{recommend.health_tip}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 16 }}>
            {recommend.recommendations.slice(0, 4).map((r, i) => (
              r.product && (
                <Link key={i} to={`/product/${r.product.id}`} style={{
                  padding: '14px 16px', background: 'white', borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--bd)', textDecoration: 'none',
                  display: 'flex', flexDirection: 'column', gap: 8, boxShadow: 'var(--sh-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem', color: '#1a2332' }}>{r.product.name}</span>
                    <span style={{ fontFamily: 'var(--font)', fontWeight: 800, color: 'var(--pr)' }}>₹{r.product.price}</span>
                  </div>
                  <span style={{ fontSize: '.75rem', color: 'var(--ts)' }}>{r.reason}</span>
                  <span className="badge badge-ai" style={{ alignSelf: 'flex-start' }}>
                    <span className="material-icons-round" style={{ fontSize: 11 }}>auto_awesome</span> {r.type}
                  </span>
                </Link>
              )
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>Recent Orders</h2>
            <Link to="/orders" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {orders.slice(0, 3).map(o => (
              <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--bd)', boxShadow: 'var(--sh-sm)' }}>
                <div>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem' }}>#{o._id.slice(-8).toUpperCase()}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--ts)' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 800, color: 'var(--pr)' }}>₹{o.totalAmount}</p>
                  <span style={{ fontSize: '.72rem', color: 'var(--su)', fontWeight: 700, textTransform: 'uppercase' }}>{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
