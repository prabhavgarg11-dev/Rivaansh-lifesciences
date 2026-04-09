import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider }  from './context/AuthContext.jsx';
import { CartProvider }  from './context/CartContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import Navbar      from './components/Navbar.jsx';
import CartDrawer  from './components/CartDrawer.jsx';
import HomePage           from './pages/HomePage.jsx';
import ProductsPage       from './pages/ProductsPage.jsx';
import ProductDetailPage  from './pages/ProductDetailPage.jsx';
import AIChatPage         from './pages/AIChatPage.jsx';
import AISearchPage       from './pages/AISearchPage.jsx';
import AIPrescriptionPage from './pages/AIPrescriptionPage.jsx';
import AISideEffectsPage  from './pages/AISideEffectsPage.jsx';
import AILabTestPage      from './pages/AILabTestPage.jsx';
import AIReminderPage     from './pages/AIReminderPage.jsx';
import AuthPage           from './pages/AuthPage.jsx';
import OrdersPage         from './pages/OrdersPage.jsx';
import CheckoutPage       from './pages/CheckoutPage.jsx';
import DashboardPage      from './pages/DashboardPage.jsx';

function AppInner() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <main>
        <Routes>
          <Route path="/"                  element={<HomePage />} />
          <Route path="/products"          element={<ProductsPage />} />
          <Route path="/products/:id"      element={<ProductDetailPage />} />
          <Route path="/ai/chat"           element={<AIChatPage />} />
          <Route path="/ai/search"         element={<AISearchPage />} />
          <Route path="/ai/prescription"   element={<AIPrescriptionPage />} />
          <Route path="/ai/sideeffects"    element={<AISideEffectsPage />} />
          <Route path="/ai/labtest"        element={<AILabTestPage />} />
          <Route path="/ai/reminder"       element={<AIReminderPage />} />
          <Route path="/auth"              element={<AuthPage />} />
          <Route path="/orders"            element={<OrdersPage />} />
          <Route path="/checkout"          element={<CheckoutPage />} />
          <Route path="/dashboard"         element={<DashboardPage />} />
          <Route path="*" element={
            <div className="container empty-state" style={{padding:80}}>
              <span className="material-icons-round">error_outline</span>
              <h3>Page Not Found</h3>
              <p>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary btn-sm">Go Home</a>
            </div>
          } />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{background:'#1a2332',color:'rgba(255,255,255,.7)',padding:'32px 0 20px',marginTop:48}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:32,marginBottom:24}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span className="material-icons-round" style={{color:'white',fontSize:18}}>local_pharmacy</span>
                </div>
                <span style={{fontFamily:'var(--font)',fontWeight:800,color:'white',fontSize:'.95rem'}}>Rivaansh Lifesciences</span>
              </div>
              <p style={{fontSize:'.83rem',lineHeight:1.6,maxWidth:280}}>AI-powered digital pharmacy delivering authentic medicines with smart health assistance.</p>
              <div style={{marginTop:12,fontSize:'.78rem',background:'rgba(255,255,255,.08)',padding:'8px 12px',borderRadius:'var(--r)',display:'inline-block'}}>
                ⚠️ AI advice is not a substitute for professional medical consultation.
              </div>
            </div>
            {[
              {title:'Products',links:['Tablets','Capsules','Creams & Gels','Test Kits']},
              {title:'AI Features',links:['AI Health Chat','Symptom Search','Prescription Analyzer','Drug Checker']},
              {title:'Support',links:['Orders','Dashboard','Privacy Policy','Terms of Service']},
            ].map(col=>(
              <div key={col.title}>
                <div style={{fontFamily:'var(--font)',fontWeight:700,color:'white',marginBottom:12,fontSize:'.9rem'}}>{col.title}</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {col.links.map(l=><span key={l} style={{fontSize:'.82rem',cursor:'pointer',transition:'color var(--tr)'}} onMouseEnter={e=>e.target.style.color='white'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.7)'}>{l}</span>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:16,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'.78rem',flexWrap:'wrap',gap:8}}>
            <span>© 2025 Rivaansh Lifesciences. All rights reserved.</span>
            <span style={{display:'flex',alignItems:'center',gap:4}}>Powered by <span style={{color:'var(--accent)',fontWeight:600',margin:'0 2px'}}>Claude AI</span> · Made with ❤️ in India</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
