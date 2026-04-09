import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Navbar({ onCartOpen }) {
  const { user, isLoggedIn, logout } = useAuth();
  const { count } = useCart();
  const { show } = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); show('Logged out.', 'info'); nav('/'); setMenuOpen(false); };

  const links = [
    { to:'/',           label:'Home',     icon:'home' },
    { to:'/products',   label:'Medicines', icon:'medication' },
    { to:'/ai/chat',    label:'AI Doctor', icon:'smart_toy' },
    { to:'/orders',     label:'Orders',   icon:'shopping_bag' },
    { to:'/dashboard',  label:'Dashboard', icon:'dashboard' },
  ];

  return (
    <nav style={{ position:'sticky',top:0,zIndex:1000,background:'white',borderBottom:'1px solid var(--bd)',boxShadow:'0 2px 12px rgba(0,103,103,.08)' }}>
      <div className="container" style={{ display:'flex',alignItems:'center',gap:12,height:64 }}>
        <Link to="/" style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <span className="material-icons-round" style={{ color:'white',fontSize:20 }}>local_pharmacy</span>
          </div>
          <div>
            <div style={{ fontFamily:'var(--font)',fontWeight:800,fontSize:'.9rem',color:'var(--pr)',lineHeight:1 }}>Rivaansh</div>
            <div style={{ fontSize:'.62rem',color:'var(--ts)',lineHeight:1,marginTop:1 }}>Lifesciences</div>
          </div>
        </Link>

        <div style={{ display:'flex',gap:2,flex:1,overflow:'hidden' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              display:'flex',alignItems:'center',gap:5,padding:'7px 11px',borderRadius:'var(--r)',
              fontFamily:'var(--font)',fontWeight:600,fontSize:'.82rem',whiteSpace:'nowrap',
              color:loc.pathname===l.to?'var(--pr)':'var(--tm)',
              background:loc.pathname===l.to?'var(--pr-50)':'transparent',transition:'all var(--tr)'
            }}>
              <span className="material-icons-round" style={{ fontSize:17 }}>{l.icon}</span>
              <span style={{ display:'none' }} className="nav-label">{l.label}</span>
            </Link>
          ))}
        </div>

        <Link to="/ai/chat">
          <span className="badge badge-ai" style={{ cursor:'pointer',whiteSpace:'nowrap' }}>
            <span className="material-icons-round" style={{ fontSize:11 }}>auto_awesome</span>
            AI
          </span>
        </Link>

        <button onClick={onCartOpen} style={{ position:'relative',background:'var(--bgd)',border:'none',borderRadius:'var(--r)',padding:'8px 12px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',flexShrink:0 }}>
          <span className="material-icons-round" style={{ fontSize:20,color:'var(--pr)' }}>shopping_cart</span>
          {count>0 && (
            <span style={{ position:'absolute',top:-6,right:-6,background:'var(--accent2)',color:'white',width:20,height:20,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'.68rem',fontWeight:800 }}>
              {count>9?'9+':count}
            </span>
          )}
        </button>

        {isLoggedIn ? (
          <div style={{ position:'relative' }}>
            <button onClick={()=>setMenuOpen(m=>!m)} style={{ display:'flex',alignItems:'center',gap:6,background:'var(--pr-50)',border:'none',borderRadius:'var(--r)',padding:'7px 12px',cursor:'pointer' }}>
              <div style={{ width:26,height:26,borderRadius:'50%',background:'var(--pr)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font)',fontWeight:700,fontSize:'.8rem' }}>
                {user?.name?.[0]?.toUpperCase()||'U'}
              </div>
              <span className="material-icons-round" style={{ fontSize:16,color:'var(--pr)' }}>expand_more</span>
            </button>
            {menuOpen && (
              <>
                <div onClick={()=>setMenuOpen(false)} style={{ position:'fixed',inset:0,zIndex:99 }} />
                <div style={{ position:'absolute',right:0,top:'110%',background:'white',borderRadius:'var(--r-lg)',boxShadow:'var(--sh-lg)',border:'1px solid var(--bd)',minWidth:180,zIndex:100,overflow:'hidden' }}>
                  <div style={{ padding:'12px 16px',borderBottom:'1px solid var(--bd)',background:'var(--bgd)' }}>
                    <div style={{ fontFamily:'var(--font)',fontWeight:700,fontSize:'.88rem' }}>{user?.name}</div>
                    <div style={{ fontSize:'.75rem',color:'var(--ts)' }}>{user?.email}</div>
                  </div>
                  {[{to:'/dashboard',label:'Dashboard',icon:'dashboard'},{to:'/orders',label:'My Orders',icon:'shopping_bag'},{to:'/ai/reminder',label:'Med Reminders',icon:'alarm'}].map(item=>(
                    <Link key={item.to} to={item.to} onClick={()=>setMenuOpen(false)} style={{ display:'flex',alignItems:'center',gap:10,padding:'11px 16px',color:'var(--tm)',fontWeight:500,fontSize:'.87rem' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bgd)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span className="material-icons-round" style={{ fontSize:17,color:'var(--pr)' }}>{item.icon}</span>{item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop:'1px solid var(--bd)' }}>
                    <button onClick={handleLogout} style={{ display:'flex',width:'100%',alignItems:'center',gap:10,padding:'11px 16px',background:'none',border:'none',color:'var(--er)',fontWeight:500,fontSize:'.87rem',cursor:'pointer' }}>
                      <span className="material-icons-round" style={{ fontSize:17 }}>logout</span>Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/auth" className="btn btn-primary btn-sm" style={{ flexShrink:0 }}>
            <span className="material-icons-round" style={{ fontSize:16 }}>person</span>
            Sign In
          </Link>
        )}
      </div>
      <style>{`@media(min-width:900px){.nav-label{display:block!important}}`}</style>
    </nav>
  );
}
