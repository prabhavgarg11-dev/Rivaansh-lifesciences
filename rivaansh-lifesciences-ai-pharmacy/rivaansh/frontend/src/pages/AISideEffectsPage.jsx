import { useState } from 'react';
import api from '../api/api.js';

export default function AISideEffectsPage() {
  const [medicines, setMedicines] = useState([]);
  const [medInput, setMedInput]   = useState('');
  const [symptoms, setSymptoms]   = useState([]);
  const [symInput, setSymInput]   = useState('');
  const [result,   setResult]     = useState(null);
  const [loading,  setLoading]    = useState(false);

  const addMed = () => { if(medInput.trim()&&!medicines.includes(medInput.trim())){setMedicines(m=>[...m,medInput.trim()]);setMedInput('');} };
  const addSym = () => { if(symInput.trim()&&!symptoms.includes(symInput.trim())){setSymptoms(s=>[...s,symInput.trim()]);setSymInput('');} };

  const analyze = async () => {
    if (!medicines.length) return;
    setLoading(true); setResult(null);
    const {ok,data} = await api.post('/ai/sideeffects',{medicines,symptoms});
    if (ok) setResult(data);
    setLoading(false);
  };

  const riskColor = { low:'var(--su)',moderate:'var(--wa)',high:'var(--er)',unknown:'var(--ts)' };
  const sevColor = { mild:'#10b981',moderate:'var(--wa)',severe:'var(--er)',avoid:'#7f1d1d' };

  return (
    <div className="container" style={{padding:'32px 20px',maxWidth:900}}>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span className="material-icons-round" style={{color:'var(--wa)',fontSize:28}}>science</span>
          <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332'}}>Drug Interaction Checker</h1>
          <span className="badge badge-ai"><span className="material-icons-round" style={{fontSize:11}}>auto_awesome</span>AI</span>
        </div>
        <p style={{color:'var(--tm)',fontSize:'.92rem'}}>Enter medicines and reported symptoms to check for side effects and dangerous drug interactions.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <div>
          <label className="label" style={{marginBottom:8,display:'block'}}>Medicines *</label>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <input className="input" value={medInput} onChange={e=>setMedInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addMed();}}}
              placeholder="e.g. Paracetamol, Ibuprofen..." style={{flex:1}} />
            <button onClick={addMed} className="btn btn-primary btn-sm" style={{flexShrink:0}}>Add</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {medicines.map(m=>(
              <span key={m} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 12px',background:'var(--pr-50)',color:'var(--pr)',borderRadius:'var(--r-full)',fontSize:'.8rem',fontWeight:600}}>
                {m}
                <button onClick={()=>setMedicines(ms=>ms.filter(x=>x!==m))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center',padding:0}}>
                  <span className="material-icons-round" style={{fontSize:14}}>close</span>
                </button>
              </span>
            ))}
            {!medicines.length && <span style={{fontSize:'.82rem',color:'var(--ts)'}}>Add at least one medicine to check</span>}
          </div>
        </div>
        <div>
          <label className="label" style={{marginBottom:8,display:'block'}}>Reported Symptoms (optional)</label>
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <input className="input" value={symInput} onChange={e=>setSymInput(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addSym();}}}
              placeholder="e.g. nausea, dizziness..." style={{flex:1}} />
            <button onClick={addSym} className="btn btn-outline btn-sm" style={{flexShrink:0}}>Add</button>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {symptoms.map(s=>(
              <span key={s} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 12px',background:'#fff3cd',color:'#78350f',borderRadius:'var(--r-full)',fontSize:'.8rem',fontWeight:600}}>
                {s}
                <button onClick={()=>setSymptoms(ss=>ss.filter(x=>x!==s))} style={{background:'none',border:'none',cursor:'pointer',color:'#78350f',display:'flex',alignItems:'center',padding:0}}>
                  <span className="material-icons-round" style={{fontSize:14}}>close</span>
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button onClick={analyze} disabled={!medicines.length||loading} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'1rem',marginBottom:24}}>
        {loading ? <><span className="spinner" style={{width:18,height:18}} /> Analyzing interactions...</> : <><span className="material-icons-round" style={{fontSize:20}}>science</span>Check Drug Interactions</>}
      </button>

      {result && (
        <div style={{display:'flex',flexDirection:'column',gap:20,animation:'fadeUp .4s ease'}}>
          {/* Overall risk */}
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',background:riskColor[result.overall_risk]+'15',border:`2px solid ${riskColor[result.overall_risk]}`,borderRadius:'var(--r-lg)'}}>
            <span className="material-icons-round" style={{color:riskColor[result.overall_risk],fontSize:28}}>{result.overall_risk==='high'?'dangerous':result.overall_risk==='moderate'?'warning':'check_circle'}</span>
            <div>
              <div style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem',color:riskColor[result.overall_risk]}}>
                Overall Risk: {result.overall_risk?.toUpperCase()}
              </div>
              {result.see_doctor_immediately && <div style={{color:'var(--er)',fontWeight:600,fontSize:'.88rem',marginTop:4}}>⚠️ {result.reason_to_see_doctor || 'Please consult a doctor immediately.'}</div>}
            </div>
          </div>

          {/* Individual effects */}
          {result.individual_effects?.length>0 && (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:14}}>Side Effects by Medicine</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {result.individual_effects.map((ef,i)=>(
                  <div key={i} style={{padding:'12px 14px',background:'var(--bgd)',borderRadius:'var(--r)',borderLeft:`3px solid ${sevColor[ef.severity]||'var(--ts)'}`}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontFamily:'var(--font)',fontWeight:700}}>{ef.medicine}</span>
                      <span className="badge" style={{background:sevColor[ef.severity]+'20',color:sevColor[ef.severity]}}>{ef.severity}</span>
                    </div>
                    {ef.common_effects?.length>0 && <div style={{fontSize:'.82rem',color:'var(--tm)',marginBottom:4}}><strong>Common:</strong> {ef.common_effects.join(', ')}</div>}
                    {ef.rare_effects?.length>0 && <div style={{fontSize:'.82rem',color:'var(--tm)'}}><strong>Rare:</strong> {ef.rare_effects.join(', ')}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drug interactions */}
          {result.interactions?.length>0 && (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:14,color:'var(--er)'}}>⚠️ Drug Interactions Found</h3>
              {result.interactions.map((ix,i)=>(
                <div key={i} style={{padding:'12px 14px',background:'#fff1f2',borderRadius:'var(--r)',borderLeft:`3px solid ${sevColor[ix.severity]||'var(--er)'}`,marginBottom:10}}>
                  <div style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:4}}>{ix.drugs?.join(' + ')}</div>
                  <div style={{fontSize:'.85rem',color:'var(--tm)',marginBottom:6}}>{ix.interaction}</div>
                  {ix.recommendation && <div style={{fontSize:'.82rem',fontWeight:600,color:sevColor[ix.severity]||'var(--er)'}}>{ix.recommendation}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations?.length>0 && (
            <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',borderRadius:'var(--r-lg)',padding:20,border:'1px solid #bbf7d0'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:12,color:'#166534'}}>✅ Recommendations</h3>
              <ul style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:0,listStyle:'none'}}>
                {result.recommendations.map((r,i)=>(
                  <li key={i} style={{display:'flex',gap:8,fontSize:'.88rem',color:'#166534'}}>
                    <span className="material-icons-round" style={{fontSize:16,flexShrink:0,marginTop:2}}>check_circle</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="disclaimer"><span className="material-icons-round">warning</span><span>This analysis is for informational purposes only. Always consult a pharmacist or doctor before making medication decisions.</span></div>
        </div>
      )}
    </div>
  );
}
