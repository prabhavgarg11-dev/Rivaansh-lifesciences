import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function AISearchPage() {
  const [searchParams] = useSearchParams();
  const [query,    setQuery]    = useState(searchParams.get('q') || '');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { if (query) runSearch(); }, []);

  const runSearch = async (q) => {
    const searchQ = q || query;
    if (!searchQ.trim()) return;
    setLoading(true); setResult(null);
    const { ok, data } = await api.post('/ai/search', { query: searchQ });
    if (ok) setResult(data);
    setLoading(false);
  };

  const urgencyColor = { low:'var(--su)', medium:'var(--wa)', high:'var(--er)' };

  return (
    <div className="container" style={{ padding:'32px 20px' }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
          <span className="material-icons-round" style={{ color:'var(--pr)',fontSize:28 }}>search</span>
          <h1 style={{ fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332' }}>AI Symptom Search</h1>
          <span className="badge badge-ai"><span className="material-icons-round" style={{ fontSize:11 }}>auto_awesome</span>AI</span>
        </div>
        <p style={{ color:'var(--tm)',fontSize:'.92rem' }}>Describe your symptoms or condition and AI will find the right medicines for you.</p>
      </div>

      <div style={{ display:'flex',gap:12,marginBottom:32 }}>
        <input className="input" value={query} onChange={e=>setQuery(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter') runSearch(); }}
          placeholder="e.g. fever and headache, sore throat, skin rash..."
          style={{ flex:1,fontSize:'1rem',padding:'14px 18px' }} />
        <button onClick={()=>runSearch()} disabled={!query.trim()||loading} className="btn btn-primary" style={{ flexShrink:0,padding:'14px 24px' }}>
          {loading ? <span className="spinner" style={{ width:18,height:18 }} /> : <><span className="material-icons-round" style={{ fontSize:20 }}>auto_awesome</span>Search</>}
        </button>
      </div>

      {/* Example queries */}
      {!result && !loading && (
        <div>
          <p style={{ fontSize:'.85rem',color:'var(--ts)',marginBottom:12,fontWeight:600 }}>Try these examples:</p>
          <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
            {['fever and body pain','cold and runny nose','skin fungal infection','stomach cramps','vitamin deficiency','high sugar levels'].map(s=>(
              <button key={s} onClick={()=>{ setQuery(s); runSearch(s); }} style={{
                padding:'7px 14px',background:'white',border:'1px solid var(--bd)',borderRadius:'var(--r-full)',
                fontSize:'.82rem',cursor:'pointer',color:'var(--tm)',transition:'all var(--tr)'
              }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pr)';e.currentTarget.style.color='var(--pr)';}}
                 onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--tm)';}}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign:'center',padding:60 }}>
          <div style={{ display:'inline-flex',flexDirection:'column',alignItems:'center',gap:16 }}>
            <div style={{ width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-icons-round" style={{ color:'white',fontSize:28,animation:'spin 1.5s linear infinite' }}>auto_awesome</span>
            </div>
            <div style={{ fontFamily:'var(--font)',fontWeight:700,color:'var(--pr)' }}>AI is analyzing your symptoms...</div>
            <div style={{ fontSize:'.83rem',color:'var(--ts)' }}>Searching our medicine catalogue</div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ display:'flex',flexDirection:'column',gap:24,animation:'fadeUp .4s ease' }}>
          {/* Urgency banner */}
          {result.urgency && (
            <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:urgencyColor[result.urgency]+'15',border:`2px solid ${urgencyColor[result.urgency]}`,borderRadius:'var(--r-lg)' }}>
              <span className="material-icons-round" style={{ color:urgencyColor[result.urgency] }}>{result.urgency==='high'?'warning':result.urgency==='medium'?'info':'check_circle'}</span>
              <div>
                <span style={{ fontFamily:'var(--font)',fontWeight:700,color:urgencyColor[result.urgency] }}>
                  {result.urgency==='high'?'High Urgency — Please see a doctor soon':result.urgency==='medium'?'Moderate — Monitor symptoms':'Low Urgency — Home care may suffice'}
                </span>
                {result.see_doctor && <div style={{ fontSize:'.82rem',color:'var(--tm)',marginTop:2 }}>We recommend consulting a healthcare professional for proper diagnosis.</div>}
              </div>
            </div>
          )}

          {/* Possible conditions */}
          {result.conditions?.length>0 && (
            <div style={{ background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)' }}>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:6 }}>
                <span className="material-icons-round" style={{ color:'var(--info)' }}>psychology</span>
                Possible Conditions
              </h3>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {result.conditions.map(c=><span key={c} className="badge badge-info">{c}</span>)}
              </div>
            </div>
          )}

          {/* AI explanation */}
          {result.explanation && (
            <div style={{ background:'linear-gradient(135deg,#f0f0ff,#e8f8ff)',borderRadius:'var(--r-lg)',padding:20,border:'1px solid rgba(99,102,241,.2)' }}>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:10,color:'#4338ca',display:'flex',alignItems:'center',gap:6 }}>
                <span className="material-icons-round" style={{ fontSize:18 }}>auto_awesome</span>AI Analysis
              </h3>
              <p style={{ color:'var(--tm)',fontSize:'.9rem',lineHeight:1.6 }}>{result.explanation}</p>
            </div>
          )}

          {/* Matched products */}
          {result.products?.length>0 && (
            <div>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:6 }}>
                <span className="material-icons-round" style={{ color:'var(--pr)' }}>medication</span>
                Recommended Medicines ({result.products.length})
              </h3>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:20 }}>
                {result.products.map(p=><ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {!result.products?.length && (
            <div className="empty-state"><span className="material-icons-round">medication_liquid</span><h3>No specific medicines found</h3><p>Please consult a pharmacist or doctor for personalized advice.</p></div>
          )}

          <div className="disclaimer"><span className="material-icons-round">warning</span><span>AI suggestions are not a substitute for professional medical advice. Always consult a qualified healthcare provider before starting any medication.</span></div>
        </div>
      )}
    </div>
  );
}
