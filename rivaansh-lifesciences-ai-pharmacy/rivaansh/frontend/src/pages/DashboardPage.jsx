import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function DashboardPage() {
  const { user, isLoggedIn } = useAuth();
  const { items, total } = useCart();
  const [orders,  setOrders]  = useState([]);
  const [recs,    setRecs]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!isLoggedIn) { setLoading(false); return; }
      const [{ok,data}, recRes] = await Promise.all([
        api.get('/orders'),
        api.post('/ai/recommend', { cartItems: items, searchHistory:[], orderHistory:[] })
      ]);
      if (ok) setOrders(data.slice(0,3));
      if (recRes.ok) setRecs(recRes.data);
      setLoading(false);
    };
    load();
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div className="container empty-state" style={{padding:80}}>
      <span className="material-icons-round">dashboard</span>
      <h3>Please sign in to view your dashboard</h3>
      <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
    </div>
  );

  const AI_TOOLS = [
    {to:'/ai/chat',icon:'smart_toy',label:'AI Health Chat',color:'#6366f1'},
    {to:'/ai/search',icon:'search',label:'Symptom Search',color:'#0ea5e9'},
    {to:'/ai/prescription',icon:'document_scanner',label:'Rx Analyzer',color:'#10b981'},
    {to:'/ai/sideeffects',icon:'science',label:'Drug Checker',color:'#f59e0b'},
    {to:'/ai/labtest',icon:'biotech',label:'Lab Tests',color:'#ef4444'},
    {to:'/ai/reminder',icon:'alarm',label:'Med Reminder',color:'#8b5cf6'},
  ];

  return (
    <div className="container" style={{padding:'32px 20px'}}>
      {/* Welcome header */}
      <div style={{background:'linear-gradient(135deg,var(--pr),var(--accent))',borderRadius:'var(--r-xl)',padding:'28px 32px',marginBottom:28,display:'flex',alignItems:'center',gap:20}}>
        <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <span style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.4rem',color:'white'}}>{user?.name?.[0]?.toUpperCase()||'U'}</span>
        </div>
        <div style={{flex:1}}>
          <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.4rem',color:'white',marginBottom:4}}>
            Good day, {user?.name?.split(' ')[0]}!
          </h1>
          <p style={{color:'rgba(255,255,255,.8)',fontSize:'.88rem'}}>Your AI-powered health dashboard is ready.</p>
        </div>
        <div style={{display:'flex',gap:16'}}>
          {[{label:'Orders',val:orders.length},{label:'Cart Items',val:items.length}].map(s=>(
            <div key={s.label} style={{textAlign:'center',background:'rgba(255,255,255,.15)',padding:'12px 20px',borderRadius:'var(--r-lg)'}}>
              <div style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.5rem',color:'white'}}>{s.val}</div>
              <div style={{fontSize:'.75rem',color:'rgba(255,255,255,.75)'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tools grid */}
      <div style={{marginBottom:28}}>
        <h2 style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.2rem',marginBottom:14,display:'flex',alignItems:'center',gap:6}}>
          <span className="material-icons-round" style={{color:'var(--pr)'}}>auto_awesome</span>AI Health Tools
        </h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
          {AI_TOOLS.map(t=>(
            <Link key={t.to} to={t.to} style={{
              display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'16px 8px',
              background:'white',borderRadius:'var(--r-lg)',border:'1px solid var(--bd2)',textDecoration:'none',
              transition:'all var(--tr-lg)'
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 6px 20px ${t.color}20`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd2)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>
              <div style={{width:40,height:40,borderRadius:'var(--r)',background:t.color+'15',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span className="material-icons-round" style={{color:t.color,fontSize:22}}>{t.icon}</span>
              </div>
              <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.72rem',textAlign:'center',color:'#1a2332',lineHeight:1.3}}>{t.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        {/* Recent Orders */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h2 style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem'}}>Recent Orders</h2>
            <Link to="/orders" style={{fontSize:'.82rem',color:'var(--pr)',fontWeight:600}}>View All</Link>
          </div>
          {loading ? <div className="skeleton" style={{height:200,borderRadius:'var(--r-lg)'}} /> :
          orders.length===0 ? (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:24,border:'1px solid var(--bd2)',textAlign:'center'}}>
              <span className="material-icons-round" style={{fontSize:40,color:'var(--pr-100)',display:'block',marginBottom:8}}>shopping_bag</span>
              <p style={{color:'var(--tm)',fontSize:'.88rem'}}>No orders yet</p>
              <Link to="/products" className="btn btn-primary btn-sm" style={{marginTop:10,display:'inline-flex'}}>Shop Now</Link>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {orders.map(o=>(
                <div key={o._id} style={{background:'white',borderRadius:'var(--r-lg)',padding:'14px 16px',border:'1px solid var(--bd2)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.88rem',color:'var(--pr)'}}>#{o._id?.slice(-6).toUpperCase()}</div>
                    <div style={{fontSize:'.75rem',color:'var(--ts)',marginTop:2}}>{o.items?.length} items · {new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--font)',fontWeight:800,color:'var(--pr)'}}>Rs.{o.totalAmount}</div>
                    <div style={{fontSize:'.72rem',fontWeight:700,color:'var(--su)',marginTop:2}}>{o.status?.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Recommendations */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h2 style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem',display:'flex',alignItems:'center',gap:6}}>
              <span className="material-icons-round" style={{color:'#6366f1',fontSize:18}}>auto_awesome</span>AI Recommendations
            </h2>
          </div>
          {loading ? <div className="skeleton" style={{height:200,borderRadius:'var(--r-lg)'}} /> :
          recs?.health_tip && (
            <div style={{background:'linear-gradient(135deg,#f0f0ff,#e8f8ff)',borderRadius:'var(--r-lg)',padding:20,border:'1px solid rgba(99,102,241,.2)',marginBottom:14}}>
              <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                <span className="material-icons-round" style={{color:'#6366f1',fontSize:20,flexShrink:0}}>lightbulb</span>
                <div>
                  <div style={{fontFamily:'var(--font)',fontWeight:700,color:'#4338ca',marginBottom:4,fontSize:'.88rem'}}>AI Health Tip</div>
                  <div style={{fontSize:'.85rem',color:'var(--tm)',lineHeight:1.5}}>{recs.health_tip}</div>
                </div>
              </div>
            </div>
          )}
          {recs?.recommendations?.slice(0,2).map((r,i)=> r.product && (
            <div key={i} style={{background:'white',borderRadius:'var(--r-lg)',padding:'12px 14px',border:'1px solid var(--bd2)',marginBottom:10,display:'flex',gap:12,alignItems:'center'}}>
              <img src={r.product.image||'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=56&h=56&fit=crop'} alt={r.product.name}
                style={{width:44,height:44,borderRadius:'var(--r-sm)',objectFit:'cover',flexShrink:0}}
                onError={e=>{e.target.src='https://images.unsplash.com/photo-1576671081837-49000212a370?w=56&h=56&fit=crop';}} />
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.85rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.product.name}</div>
                <div style={{fontSize:'.75rem',color:'#6366f1',marginTop:2}}>{r.reason}</div>
              </div>
              <span style={{fontFamily:'var(--font)',fontWeight:800,color:'var(--pr)',flexShrink:0,fontSize:'.9rem'}}>Rs.{r.product.price}</span>
            </div>
          ))}
          {!recs?.recommendations?.length && !loading && (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:24,border:'1px solid var(--bd2)',textAlign:'center'}}>
              <span className="material-icons-round" style={{fontSize:36,color:'var(--pr-100)',display:'block',marginBottom:8}}>recommend</span>
              <p style={{color:'var(--tm)',fontSize:'.85rem'}}>Add items to cart to get AI recommendations</p>
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:768px){.container>div[style*="grid-template-columns:repeat(6"]{grid-template-columns:repeat(3,1fr)!important}.container>div:last-child[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
