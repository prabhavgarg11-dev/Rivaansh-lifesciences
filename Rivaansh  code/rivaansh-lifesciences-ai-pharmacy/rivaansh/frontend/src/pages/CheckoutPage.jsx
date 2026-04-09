import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/api.js';

export default function CheckoutPage() {
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const { user } = useAuth();
  const { show } = useToast();
  const nav = useNavigate();
  const [form, setForm] = useState({ address:'', phone: user?.phone||'' });
  const [rxFile, setRxFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasRx = items.some(i=>i.prescriptionRequired);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.address.trim() || form.address.trim().length<10) { show('Please enter a valid delivery address (min 10 chars).','error'); return; }
    if (hasRx && !rxFile) { show('Please upload a prescription for Rx medicines.','error'); return; }

    setLoading(true);
    const fd = new FormData();
    const payload = { items: items.map(i=>({productId:i.productId,quantity:i.quantity,price:i.price,name:i.name})), address:form.address, phone:form.phone, totalAmount:total };
    fd.append('payload', JSON.stringify(payload));
    if (rxFile) fd.append('prescription', rxFile);

    const {ok,data} = await api.postForm('/orders', fd);
    setLoading(false);
    if (ok) {
      await clearCart();
      show('Order placed successfully!','success');
      nav('/orders');
    } else show(data?.message||'Order failed. Try again.','error');
  };

  if (!items.length) return (
    <div className="container empty-state" style={{padding:80}}>
      <span className="material-icons-round">shopping_cart</span>
      <h3>Your cart is empty</h3>
      <button className="btn btn-primary btn-sm" onClick={()=>nav('/products')}>Browse Medicines</button>
    </div>
  );

  return (
    <div className="container" style={{padding:'32px 20px',maxWidth:900}}>
      <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332',marginBottom:24}}>Checkout</h1>
      <div style={{display:'grid',gridTemplateColumns:'1fr 380px',gap:24,alignItems:'start'}}>
        {/* Form */}
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:20}}>
          <div style={{background:'white',borderRadius:'var(--r-xl)',padding:24,border:'1px solid var(--bd2)'}}>
            <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
              <span className="material-icons-round" style={{color:'var(--pr)'}}>location_on</span>Delivery Address
            </h3>
            <div className="input-group" style={{marginBottom:14}}>
              <label className="label">Full Address *</label>
              <textarea className="input" rows={3} value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}
                placeholder="House/Flat No., Street, Area, City, State, PIN..." style={{resize:'vertical'}} />
            </div>
            <div className="input-group">
              <label className="label">Phone Number</label>
              <input className="input" type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 98765 43210" />
            </div>
          </div>

          {hasRx && (
            <div style={{background:'#fff3cd',borderRadius:'var(--r-xl)',padding:24,border:'2px solid #f59e0b'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:8,color:'#78350f',display:'flex',alignItems:'center',gap:6}}>
                <span className="material-icons-round" style={{color:'#f59e0b'}}>medical_services</span>Prescription Required
              </h3>
              <p style={{fontSize:'.85rem',color:'#78350f',marginBottom:14}}>Your cart contains prescription medicines. Please upload a valid prescription.</p>
              <input type="file" accept="image/*,application/pdf" onChange={e=>setRxFile(e.target.files[0])}
                style={{display:'block',fontSize:'.85rem',color:'#78350f'}} />
              {rxFile && <div style={{marginTop:10,fontSize:'.8rem',color:'var(--su)',fontWeight:600}}>✅ {rxFile.name}</div>}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{padding:'15px',fontSize:'1.05rem'}}>
            {loading ? <><span className="spinner" style={{width:20,height:20}} /> Placing Order...</> : <><span className="material-icons-round" style={{fontSize:22}}>check_circle</span>Place Order — Rs.{total}</>}
          </button>
          <div className="disclaimer"><span className="material-icons-round">info</span><span>Cash on Delivery available. Orders are typically delivered in 2-4 business days.</span></div>
        </form>

        {/* Summary */}
        <div style={{background:'white',borderRadius:'var(--r-xl)',padding:24,border:'1px solid var(--bd2)',position:'sticky',top:80}}>
          <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:16}}>Order Summary</h3>
          <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16,maxHeight:280,overflowY:'auto'}}>
            {items.map(i=>(
              <div key={i.productId} style={{display:'flex',gap:10,alignItems:'center'}}>
                <img src={i.image||'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=56&h=56&fit=crop'} alt={i.name}
                  style={{width:44,height:44,borderRadius:'var(--r-sm)',objectFit:'cover',flexShrink:0}}
                  onError={e=>{e.target.src='https://images.unsplash.com/photo-1576671081837-49000212a370?w=56&h=56&fit=crop';}} />
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:'.83rem',fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.name}</div>
                  <div style={{fontSize:'.75rem',color:'var(--ts)'}}>×{i.quantity}</div>
                </div>
                <div style={{fontFamily:'var(--font)',fontWeight:700,color:'var(--pr)',flexShrink:0}}>Rs.{i.price*i.quantity}</div>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid var(--bd)',paddingTop:14,display:'flex',flexDirection:'column',gap:8}}>
            {[{l:'Subtotal',v:`Rs.${subtotal}`},{l:'Delivery',v:delivery===0?'FREE':`Rs.${delivery}`,green:delivery===0}].map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',fontSize:'.88rem'}}>
                <span style={{color:'var(--tm)'}}>{r.l}</span>
                <span style={{fontWeight:700,color:r.green?'var(--su)':'#1a2332'}}>{r.v}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid var(--bd)'}}>
              <span style={{fontFamily:'var(--font)',fontWeight:800}}>Total</span>
              <span style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.2rem',color:'var(--pr)'}}>Rs.{total}</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.container>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
