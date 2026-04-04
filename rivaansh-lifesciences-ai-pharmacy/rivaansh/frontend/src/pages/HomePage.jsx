import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api.js';
import ProductCard from '../components/ProductCard.jsx';

const FEATURES = [
  { icon:'smart_toy',   title:'AI Health Assistant', desc:'Chat with RivaBot for instant medical guidance & medicine info.', to:'/ai/chat',         color:'#6366f1' },
  { icon:'search',      title:'Smart Symptom Search', desc:'Describe your symptoms and AI finds the right medicines for you.', to:'/ai/search',       color:'#0ea5e9' },
  { icon:'document_scanner', title:'Prescription Analyzer', desc:'Upload a prescription and AI extracts & matches all medicines.', to:'/ai/prescription', color:'#10b981' },
  { icon:'science',     title:'Drug Interaction Check', desc:'Check for side effects and dangerous drug combinations.', to:'/ai/sideeffects',   color:'#f59e0b' },
  { icon:'biotech',     title:'Lab Test Suggester', desc:'Based on symptoms, AI recommends the right diagnostic tests.', to:'/ai/labtest',       color:'#ef4444' },
  { icon:'alarm',       title:'Medicine Reminders', desc:'AI creates a personalized daily medicine schedule for you.', to:'/ai/reminder',      color:'#8b5cf6' },
];

const CATEGORIES = [
  { key:'tablet', label:'Tablets', icon:'medication', color:'#6366f1' },
  { key:'capsule', label:'Capsules', icon:'science', color:'#10b981' },
  { key:'cream', label:'Creams & Gels', icon:'spa', color:'#f59e0b' },
  { key:'kit', label:'Test Kits', icon:'biotech', color:'#ef4444' },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const nav = useNavigate();

  useEffect(() => {
    api.get('/products').then(({ ok, data }) => {
      if (ok) setProducts(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) nav(`/ai/search?q=${encodeURIComponent(search.trim())}`);
  };

  const featured = products.filter(p => p.badge).slice(0, 4);
  const bestsellers = products.filter(p => p.badge === 'Best Seller' || p.badge === 'Trending').slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section style={{ background:'linear-gradient(135deg,#003d3d 0%,#006767 50%,#008585 100%)', padding:'60px 0 80px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,backgroundImage:'radial-gradient(circle at 20% 50%,rgba(255,255,255,.04) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(0,180,160,.15) 0%,transparent 40%)' }} />
        <div className="container" style={{ position:'relative' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
            <div style={{ animation:'fadeUp .6s ease forwards' }}>
              <div style={{ display:'inline-flex',alignItems:'center',gap:6,background:'rgba(255,255,255,.12)',color:'rgba(255,255,255,.9)',padding:'5px 14px',borderRadius:'var(--r-full)',fontSize:'.78rem',fontWeight:600,marginBottom:20,backdropFilter:'blur(8px)' }}>
                <span className="material-icons-round" style={{ fontSize:14 }}>auto_awesome</span>
                AI-Powered Healthcare Platform
              </div>
              <h1 style={{ fontFamily:'var(--font)',fontWeight:900,fontSize:'2.8rem',color:'white',lineHeight:1.1,marginBottom:16 }}>
                Your Smart<br/><span style={{ color:'#7dd3c8' }}>AI Pharmacy</span><br/>Assistant
              </h1>
              <p style={{ color:'rgba(255,255,255,.75)',fontSize:'1.05rem',lineHeight:1.7,marginBottom:32,maxWidth:440 }}>
                Get AI-powered medicine recommendations, prescription analysis, health advice, and doorstep delivery — all in one place.
              </p>
              <form onSubmit={handleSearch} style={{ display:'flex',gap:10,maxWidth:460 }}>
                <div style={{ flex:1,position:'relative' }}>
                  <span className="material-icons-round" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--pr)',fontSize:20 }}>search</span>
                  <input
                    value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Describe symptoms or search medicines..."
                    style={{ width:'100%',padding:'14px 14px 14px 44px',borderRadius:'var(--r-lg)',border:'none',fontSize:'.95rem',background:'white',boxShadow:'0 4px 24px rgba(0,0,0,.2)' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ background:'var(--accent2)',boxShadow:'0 4px 16px rgba(255,107,53,.4)',flexShrink:0 }}>
                  AI Search
                </button>
              </form>
              <div style={{ display:'flex',gap:16,marginTop:24 }}>
                {[{icon:'check_circle',text:'99.9% Authentic'},{icon:'local_shipping',text:'Free Delivery ₹499+'},{icon:'support_agent',text:'24/7 AI Support'}].map(b=>(
                  <div key={b.text} style={{ display:'flex',alignItems:'center',gap:5,color:'rgba(255,255,255,.8)',fontSize:'.8rem',fontWeight:500 }}>
                    <span className="material-icons-round" style={{ fontSize:15,color:'#7dd3c8' }}>{b.icon}</span>{b.text}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:12,animation:'fadeUp .6s .2s ease both' }}>
              {FEATURES.slice(0,3).map(f=>(
                <Link key={f.to} to={f.to} style={{ display:'flex',alignItems:'center',gap:14,padding:'16px 20px',background:'rgba(255,255,255,.1)',backdropFilter:'blur(12px)',borderRadius:'var(--r-lg)',border:'1px solid rgba(255,255,255,.15)',textDecoration:'none',transition:'all var(--tr)' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.18)';e.currentTarget.style.transform='translateX(4px)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.1)';e.currentTarget.style.transform='translateX(0)';}}>
                  <div style={{ width:40,height:40,borderRadius:'var(--r)',background:f.color+'30',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    <span className="material-icons-round" style={{ color:f.color,fontSize:20 }}>{f.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--font)',fontWeight:700,color:'white',fontSize:'.9rem' }}>{f.title}</div>
                    <div style={{ fontSize:'.75rem',color:'rgba(255,255,255,.65)',marginTop:2 }}>{f.desc}</div>
                  </div>
                  <span className="material-icons-round" style={{ color:'rgba(255,255,255,.4)',marginLeft:'auto' }}>arrow_forward_ios</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:40,background:'var(--bg)',clipPath:'ellipse(55% 100% at 50% 100%)' }} />
      </section>

      {/* CATEGORIES */}
      <div className="container section">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Find medicines by type</p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
          {CATEGORIES.map(c=>(
            <Link key={c.key} to={`/products?category=${c.key}`} style={{
              display:'flex',flexDirection:'column',alignItems:'center',gap:10,
              padding:'24px 16px',background:'white',borderRadius:'var(--r-lg)',
              border:'2px solid var(--bd2)',textDecoration:'none',transition:'all var(--tr-lg)'
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 24px ${c.color}20`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd2)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
              <div style={{ width:52,height:52,borderRadius:14,background:c.color+'15',display:'flex',alignItems:'center',justifyContent:'center' }}>
                <span className="material-icons-round" style={{ fontSize:26,color:c.color }}>{c.icon}</span>
              </div>
              <span style={{ fontFamily:'var(--font)',fontWeight:700,fontSize:'.88rem',color:'#1a2332' }}>{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* AI FEATURES GRID */}
      <div style={{ background:'linear-gradient(135deg,var(--bgd),#eef8f8)',padding:'48px 0' }}>
        <div className="container">
          <div style={{ textAlign:'center',marginBottom:32 }}>
            <span className="badge badge-ai" style={{ marginBottom:12 }}>
              <span className="material-icons-round" style={{ fontSize:12 }}>auto_awesome</span>
              Powered by Claude AI
            </span>
            <h2 className="section-title">AI-Powered Health Features</h2>
            <p className="section-subtitle">Advanced AI tools to make your healthcare smarter</p>
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
            {FEATURES.map((f,i)=>(
              <Link key={f.to} to={f.to} style={{
                display:'flex',flexDirection:'column',gap:12,padding:24,
                background:'white',borderRadius:'var(--r-lg)',border:'1px solid var(--bd2)',
                textDecoration:'none',transition:'all var(--tr-lg)',animation:`fadeUp .5s ${i*0.08}s ease both`
              }}
                onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 8px 32px ${f.color}20`;e.currentTarget.style.borderColor=f.color+'50';e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';e.currentTarget.style.borderColor='var(--bd2)';e.currentTarget.style.transform='translateY(0)';}}>
                <div style={{ width:48,height:48,borderRadius:'var(--r)',background:f.color+'15',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <span className="material-icons-round" style={{ color:f.color,fontSize:24 }}>{f.icon}</span>
                </div>
                <div>
                  <div style={{ fontFamily:'var(--font)',fontWeight:700,fontSize:'1rem',color:'#1a2332',marginBottom:6 }}>{f.title}</div>
                  <div style={{ fontSize:'.83rem',color:'var(--tm)',lineHeight:1.5 }}>{f.desc}</div>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:4,color:f.color,fontSize:'.8rem',fontWeight:700,fontFamily:'var(--font)',marginTop:'auto' }}>
                  Try Now <span className="material-icons-round" style={{ fontSize:15 }}>arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED PRODUCTS */}
      <div className="container section">
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <div>
            <h2 className="section-title">Featured Medicines</h2>
            <p className="section-subtitle">Handpicked by our pharmacists</p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View All</Link>
        </div>
        {loading ? (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20 }}>
            {[1,2,3,4].map(i=><div key={i} className="skeleton" style={{ height:280,borderRadius:'var(--r-lg)' }} />)}
          </div>
        ) : (
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:20 }}>
            {(featured.length ? featured : products.slice(0,8)).map(p=><ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* DISCLAIMER */}
      <div className="container" style={{ paddingBottom:32 }}>
        <div className="disclaimer">
          <span className="material-icons-round">warning</span>
          <div>
            <strong>Medical Disclaimer:</strong> AI suggestions on this platform are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any medication.
          </div>
        </div>
      </div>
    </div>
  );
}
