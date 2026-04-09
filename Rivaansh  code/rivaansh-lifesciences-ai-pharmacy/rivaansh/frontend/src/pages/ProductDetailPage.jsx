import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSum, setLoadingSum] = useState(false);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart, isInCart } = useCart();
  const { show } = useToast();
  const { isLoggedIn } = useAuth();
  const nav = useNavigate();
  const inCart = product && isInCart(product.id);

  useEffect(() => {
    setLoading(true);
    api.get('/products/'+id).then(({ok,data})=>{ if(ok) setProduct(data); setLoading(false); });
  }, [id]);

  const handleAdd = async () => {
    if (!isLoggedIn) { show('Please sign in first.','warning'); nav('/auth'); return; }
    const {ok} = await addToCart(product.id, qty);
    if (ok) show(product.name+' added to cart!','success');
  };

  const loadSummary = async () => {
    setLoadingSum(true);
    const {ok,data} = await api.post('/ai/summary',{productId:product.id});
    if (ok) setSummary(data.summary);
    setLoadingSum(false);
  };

  if (loading) return <div className="container" style={{padding:40,textAlign:'center'}}><div className="spinner spinner-dark" style={{margin:'auto'}} /></div>;
  if (!product) return <div className="container empty-state" style={{padding:60}}><span className="material-icons-round">error</span><h3>Product not found</h3></div>;

  const discount = product.originalPrice ? Math.round(((product.originalPrice-product.price)/product.originalPrice)*100) : 0;

  return (
    <div className="container" style={{padding:'32px 20px'}}>
      <button onClick={()=>nav(-1)} className="btn btn-ghost btn-sm" style={{marginBottom:20}}>
        <span className="material-icons-round" style={{fontSize:18}}>arrow_back</span> Back
      </button>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:40,alignItems:'start'}}>
        {/* Image */}
        <div style={{position:'relative',borderRadius:'var(--r-xl)',overflow:'hidden',background:'var(--bgd)',aspectRatio:'1',boxShadow:'var(--sh)'}}>
          <img src={product.image||'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=600&fit=crop'} alt={product.name}
            style={{width:'100%',height:'100%',objectFit:'cover'}}
            onError={e=>{e.target.src='https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&h=600&fit=crop';}} />
          {discount>0 && <div style={{position:'absolute',top:16,right:16,background:'var(--su)',color:'white',padding:'6px 14px',borderRadius:'var(--r-full)',fontFamily:'var(--font)',fontWeight:800,fontSize:'.88rem'}}>{discount}% OFF</div>}
          {product.prescriptionRequired && <div style={{position:'absolute',top:16,left:16,background:'var(--er)',color:'white',padding:'6px 12px',borderRadius:'var(--r-full)',fontFamily:'var(--font)',fontWeight:700,fontSize:'.78rem',display:'flex',alignItems:'center',gap:4}}>
            <span className="material-icons-round" style={{fontSize:14}}>medical_services</span>Prescription Required
          </div>}
        </div>

        {/* Info */}
        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          <div>
            <div style={{fontSize:'.78rem',color:'var(--ts)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6}}>{product.brand}</div>
            <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.7rem',color:'#1a2332',lineHeight:1.2,marginBottom:8}}>{product.name}</h1>
            <div style={{fontSize:'.85rem',color:'var(--tm)',background:'var(--bgd)',padding:'8px 12px',borderRadius:'var(--r)',borderLeft:'3px solid var(--pr)'}}>{product.composition}</div>
          </div>

          <div style={{display:'flex',alignItems:'baseline',gap:12}}>
            <span style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'2rem',color:'var(--pr)'}}>Rs.{product.price}</span>
            {product.originalPrice && <span style={{fontSize:'1.1rem',color:'var(--ts)',textDecoration:'line-through'}}>Rs.{product.originalPrice}</span>}
            {discount>0 && <span className="badge badge-success">Save {discount}%</span>}
          </div>

          <p style={{color:'var(--tm)',lineHeight:1.7,fontSize:'.92rem'}}>{product.description}</p>

          {/* Qty + Add */}
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',border:'2px solid var(--bd)',borderRadius:'var(--r)',overflow:'hidden'}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{padding:'10px 14px',background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center'}}>
                <span className="material-icons-round" style={{fontSize:18}}>remove</span>
              </button>
              <span style={{padding:'10px 18px',fontFamily:'var(--font)',fontWeight:700,fontSize:'1rem',borderLeft:'1px solid var(--bd)',borderRight:'1px solid var(--bd)'}}>{qty}</span>
              <button onClick={()=>setQty(q=>q+1)} style={{padding:'10px 14px',background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center'}}>
                <span className="material-icons-round" style={{fontSize:18}}>add</span>
              </button>
            </div>
            <button className="btn btn-primary" style={{flex:1,minWidth:160}} onClick={handleAdd} disabled={inCart}>
              <span className="material-icons-round" style={{fontSize:20}}>{inCart?'check':'add_shopping_cart'}</span>
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>

          {/* AI Summary Button */}
          <button onClick={loadSummary} disabled={loadingSum} className="btn btn-outline" style={{borderColor:'#6366f1',color:'#6366f1'}}>
            {loadingSum ? <><span className="spinner" style={{width:16,height:16,borderColor:'rgba(99,102,241,.3)',borderTopColor:'#6366f1'}} /> Analyzing...</> : <><span className="material-icons-round" style={{fontSize:18}}>auto_awesome</span>Explain in Simple Language (AI)</>}
          </button>

          {summary && (
            <div style={{background:'linear-gradient(135deg,#f0f0ff,#e8f8ff)',borderRadius:'var(--r-lg)',padding:20,border:'1px solid rgba(99,102,241,.2)'}}>
              <div style={{fontFamily:'var(--font)',fontWeight:700,color:'#4338ca',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                <span className="material-icons-round" style={{fontSize:18}}>auto_awesome</span>AI Summary
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {summary.what_it_does && <div><span style={{fontWeight:600,color:'#1a2332',fontSize:'.85rem'}}>What it does: </span><span style={{color:'var(--tm)',fontSize:'.85rem'}}>{summary.what_it_does}</span></div>}
                {summary.how_to_use?.length>0 && <div><span style={{fontWeight:600,color:'#1a2332',fontSize:'.85rem'}}>How to use: </span><span style={{color:'var(--tm)',fontSize:'.85rem'}}>{summary.how_to_use.join(' → ')}</span></div>}
                {summary.key_warnings?.length>0 && <div><span style={{fontWeight:600,color:'var(--er)',fontSize:'.85rem'}}>⚠️ Warnings: </span><span style={{color:'var(--tm)',fontSize:'.85rem'}}>{summary.key_warnings.join('; ')}</span></div>}
                {summary.good_to_know && <div style={{background:'white',padding:'8px 12px',borderRadius:'var(--r-sm)',fontSize:'.82rem',color:'var(--tm)'}}>💡 {summary.good_to_know}</div>}
              </div>
            </div>
          )}

          {/* Details */}
          {product.uses && (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[{label:'Uses',value:product.uses,icon:'medical_services',color:'var(--pr)'},{label:'Dosage',value:product.dosage,icon:'schedule',color:'#6366f1'},{label:'Side Effects',value:product.sideEffects,icon:'warning',color:'var(--wa)'},{label:'Storage',value:product.storage,icon:'thermostat',color:'#0ea5e9'}].filter(i=>i.value).map(item=>(
                <div key={item.label} style={{display:'flex',gap:10,padding:'10px 14px',background:'var(--bgd)',borderRadius:'var(--r)'}}>
                  <span className="material-icons-round" style={{fontSize:18,color:item.color,flexShrink:0,marginTop:1}}>{item.icon}</span>
                  <div><span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.83rem',color:'#1a2332'}}>{item.label}: </span><span style={{fontSize:'.83rem',color:'var(--tm)'}}>{item.value}</span></div>
                </div>
              ))}
            </div>
          )}

          <div className="disclaimer">
            <span className="material-icons-round">warning</span>
            <span>AI suggestions are not a substitute for professional medical advice. Always consult a qualified healthcare provider.</span>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.container>div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
