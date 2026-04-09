import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer({ open, onClose }) {
  const { items, count, subtotal, delivery, total, updateQty, removeFromCart } = useCart();
  const nav = useNavigate();
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',backdropFilter:'blur(3px)',zIndex:1200,animation:'fadeIn .2s ease' }} />
      <div style={{ position:'fixed',top:0,right:0,bottom:0,width:400,background:'white',zIndex:1201,display:'flex',flexDirection:'column',boxShadow:'-8px 0 40px rgba(0,0,0,.15)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px',borderBottom:'1px solid var(--bd)',background:'linear-gradient(135deg,var(--pr),var(--pr-light))' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span className="material-icons-round" style={{ color:'white',fontSize:24 }}>shopping_cart</span>
            <div>
              <div style={{ fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem',color:'white' }}>My Cart</div>
              <div style={{ fontSize:'.78rem',color:'rgba(255,255,255,.8)' }}>{count} item{count!==1?'s':''}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,.2)',border:'none',borderRadius:'var(--r)',padding:8,cursor:'pointer',color:'white',display:'flex',alignItems:'center' }}>
            <span className="material-icons-round">close</span>
          </button>
        </div>
        {subtotal > 0 && subtotal < 499 && (
          <div style={{ padding:'10px 16px',background:'linear-gradient(135deg,#fef3c7,#fde68a)',display:'flex',alignItems:'center',gap:8,fontSize:'.82rem',color:'#78350f',fontWeight:600 }}>
            <span className="material-icons-round" style={{ fontSize:16,color:'#f59e0b' }}>local_shipping</span>
            Add Rs.{499-subtotal} more for FREE delivery!
          </div>
        )}
        {subtotal >= 499 && (
          <div style={{ padding:'10px 16px',background:'#dcfce7',display:'flex',alignItems:'center',gap:8,fontSize:'.82rem',color:'#166534',fontWeight:600 }}>
            <span className="material-icons-round" style={{ fontSize:16,color:'var(--su)' }}>check_circle</span>
            FREE delivery unlocked!
          </div>
        )}
        <div style={{ flex:1,overflowY:'auto',padding:16 }}>
          {items.length===0 ? (
            <div className="empty-state">
              <span className="material-icons-round">shopping_cart</span>
              <h3>Your cart is empty</h3>
              <p>Browse our medicines and add items to get started.</p>
              <button className="btn btn-primary btn-sm" onClick={()=>{onClose();nav('/products');}}>Browse Medicines</button>
            </div>
          ) : (
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {items.map(item => (
                <div key={item.productId} style={{ display:'flex',gap:12,padding:14,background:'var(--bgd)',borderRadius:'var(--r)',border:'1px solid var(--bd2)' }}>
                  <img src={item.image||'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&h=80&fit=crop'} alt={item.name}
                    style={{ width:60,height:60,borderRadius:'var(--r-sm)',objectFit:'cover',flexShrink:0 }}
                    onError={e=>{e.target.src='https://images.unsplash.com/photo-1576671081837-49000212a370?w=80&h=80&fit=crop';}} />
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font)',fontWeight:700,fontSize:'.88rem',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{item.name}</div>
                    <div style={{ fontFamily:'var(--font)',fontWeight:800,color:'var(--pr)',fontSize:'.92rem' }}>Rs.{item.price*item.quantity}</div>
                    <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:8 }}>
                      <div style={{ display:'flex',alignItems:'center',background:'white',borderRadius:'var(--r-sm)',border:'1px solid var(--bd)',overflow:'hidden' }}>
                        <button onClick={()=>updateQty(item.productId,-1)} style={{ padding:'4px 10px',background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center' }}>
                          <span className="material-icons-round" style={{ fontSize:14 }}>remove</span>
                        </button>
                        <span style={{ padding:'4px 10px',fontFamily:'var(--font)',fontWeight:700,fontSize:'.88rem' }}>{item.quantity}</span>
                        <button onClick={()=>updateQty(item.productId,1)} style={{ padding:'4px 10px',background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center' }}>
                          <span className="material-icons-round" style={{ fontSize:14 }}>add</span>
                        </button>
                      </div>
                      <button onClick={()=>removeFromCart(item.productId)} style={{ background:'none',border:'none',cursor:'pointer',color:'var(--er)',display:'flex',alignItems:'center' }}>
                        <span className="material-icons-round" style={{ fontSize:18 }}>delete_outline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {items.length>0 && (
          <div style={{ padding:'20px 24px',borderTop:'1px solid var(--bd)',background:'white' }}>
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginBottom:16 }}>
              {[{label:'Subtotal',val:`Rs.${subtotal}`},{label:'Delivery',val:delivery===0?'FREE':`Rs.${delivery}`,green:delivery===0}].map(row=>(
                <div key={row.label} style={{ display:'flex',justifyContent:'space-between',fontSize:'.88rem' }}>
                  <span style={{ color:'var(--tm)' }}>{row.label}</span>
                  <span style={{ fontWeight:700,color:row.green?'var(--su)':'#1a2332' }}>{row.val}</span>
                </div>
              ))}
              <div style={{ display:'flex',justifyContent:'space-between',paddingTop:8,borderTop:'1px solid var(--bd)' }}>
                <span style={{ fontFamily:'var(--font)',fontWeight:700 }}>Total</span>
                <span style={{ fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem',color:'var(--pr)' }}>Rs.{total}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width:'100%' }} onClick={()=>{onClose();nav('/checkout');}}>
              <span className="material-icons-round" style={{ fontSize:20 }}>payment</span>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}@media(max-width:480px){.cart-drawer{width:100%!important}}`}</style>
    </>
  );
}
