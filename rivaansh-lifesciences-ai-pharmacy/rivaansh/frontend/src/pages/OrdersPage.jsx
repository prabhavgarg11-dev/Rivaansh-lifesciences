import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';

const STATUS_STYLE = {
  confirmed: { bg:'#dbeafe',color:'#1e40af',icon:'check_circle' },
  processing:{ bg:'#fef3c7',color:'#92400e',icon:'hourglass_top' },
  shipped:   { bg:'#e0e7ff',color:'#3730a3',icon:'local_shipping' },
  delivered: { bg:'#dcfce7',color:'#166534',icon:'done_all' },
  cancelled: { bg:'#fee2e2',color:'#991b1b',icon:'cancel' },
};

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.get('/orders').then(({ok,data})=>{ if(ok) setOrders(data); setLoading(false); });
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <div className="container empty-state" style={{padding:80}}>
      <span className="material-icons-round">shopping_bag</span>
      <h3>Please sign in to view orders</h3>
      <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
    </div>
  );

  if (loading) return (
    <div className="container" style={{padding:40}}>
      {[1,2,3].map(i=><div key={i} className="skeleton" style={{height:160,borderRadius:'var(--r-lg)',marginBottom:16}} />)}
    </div>
  );

  return (
    <div className="container" style={{padding:'32px 20px',maxWidth:800}}>
      <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332',marginBottom:6}}>My Orders</h1>
      <p style={{color:'var(--tm)',fontSize:'.9rem',marginBottom:24}}>{orders.length} order{orders.length!==1?'s':''} total</p>

      {orders.length===0 ? (
        <div className="empty-state">
          <span className="material-icons-round">shopping_bag</span>
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here.</p>
          <Link to="/products" className="btn btn-primary btn-sm">Browse Medicines</Link>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {orders.map(order=>{
            const s = STATUS_STYLE[order.status?.toLowerCase()] || STATUS_STYLE.confirmed;
            return (
              <div key={order._id} style={{background:'white',borderRadius:'var(--r-xl)',padding:24,border:'1px solid var(--bd2)',boxShadow:'var(--sh-sm)'}}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:10}}>
                  <div>
                    <div style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1rem',color:'var(--pr)'}}>
                      #{order._id?.slice(-8).toUpperCase()}
                    </div>
                    <div style={{fontSize:'.8rem',color:'var(--ts)',marginTop:3}}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,padding:'6px 14px',background:s.bg,borderRadius:'var(--r-full)'}}>
                    <span className="material-icons-round" style={{fontSize:16,color:s.color}}>{s.icon}</span>
                    <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.8rem',color:s.color}}>{order.status?.toUpperCase()||'PENDING'}</span>
                  </div>
                </div>

                <div style={{display:'flex',gap:24,marginBottom:16,flexWrap:'wrap'}}>
                  <div><div style={{fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3}}>ITEMS</div><div style={{fontWeight:700}}>{order.items?.length||0} product{(order.items?.length||0)!==1?'s':''}</div></div>
                  <div><div style={{fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3}}>TOTAL</div><div style={{fontFamily:'var(--font)',fontWeight:800,color:'var(--pr)',fontSize:'1.05rem'}}>Rs.{order.totalAmount||0}</div></div>
                  {order.address && <div style={{flex:1}}><div style={{fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3}}>DELIVERY</div><div style={{fontSize:'.88rem',color:'var(--tm)'}}>{order.address.substring(0,60)}{order.address.length>60?'...':''}</div></div>}
                </div>

                {order.items?.length>0 && (
                  <details style={{borderTop:'1px solid var(--bd)',paddingTop:14}}>
                    <summary style={{cursor:'pointer',fontFamily:'var(--font)',fontWeight:700,fontSize:'.85rem',color:'var(--pr)',userSelect:'none',listStyle:'none',display:'flex',alignItems:'center',gap:6}}>
                      <span className="material-icons-round" style={{fontSize:18}}>expand_more</span>View Items
                    </summary>
                    <div style={{marginTop:10,display:'flex',flexDirection:'column',gap:6}}>
                      {order.items.map((item,j)=>(
                        <div key={j} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 12px',background:'var(--bgd)',borderRadius:'var(--r-sm)',fontSize:'.85rem'}}>
                          <span>{item.name||'Product'} <strong>×{item.quantity||1}</strong></span>
                          <span style={{fontWeight:700,color:'var(--pr)'}}>Rs.{(item.price||0)*(item.quantity||1)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
