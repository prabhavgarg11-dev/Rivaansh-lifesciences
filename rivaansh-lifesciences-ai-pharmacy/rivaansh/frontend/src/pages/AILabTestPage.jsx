import { useState } from 'react';
import api from '../api/api.js';

export default function AILabTestPage() {
  const [symptoms, setSymptoms] = useState([]);
  const [input, setInput]       = useState('');
  const [age, setAge]           = useState('');
  const [gender, setGender]     = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);

  const add = () => { if(input.trim()&&!symptoms.includes(input.trim())){setSymptoms(s=>[...s,input.trim()]);setInput('');} };

  const analyze = async () => {
    if (!symptoms.length) return;
    setLoading(true); setResult(null);
    const {ok,data} = await api.post('/ai/labtest',{symptoms,age,gender});
    if (ok) setResult(data);
    setLoading(false);
  };

  const urgencyStyle = { low:{bg:'#dcfce7',color:'#166534',icon:'check_circle'}, medium:{bg:'#fef3c7',color:'#78350f',icon:'schedule'}, high:{bg:'#fee2e2',color:'#991b1b',icon:'warning'} };

  return (
    <div className="container" style={{padding:'32px 20px',maxWidth:900}}>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span className="material-icons-round" style={{color:'var(--er)',fontSize:28}}>biotech</span>
          <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332'}}>Lab Test Suggester</h1>
          <span className="badge badge-ai"><span className="material-icons-round" style={{fontSize:11}}>auto_awesome</span>AI</span>
        </div>
        <p style={{color:'var(--tm)',fontSize:'.92rem'}}>Describe your symptoms and AI will suggest relevant diagnostic lab tests.</p>
      </div>

      <div style={{background:'white',borderRadius:'var(--r-xl)',padding:28,border:'1px solid var(--bd2)',marginBottom:24}}>
        <div style={{display:'flex',gap:8,marginBottom:14}}>
          <input className="input" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add();}}}
            placeholder="Add symptom (e.g. fatigue, fever, chest pain)..." style={{flex:1}} />
          <button onClick={add} className="btn btn-primary" style={{flexShrink:0}}>
            <span className="material-icons-round" style={{fontSize:18}}>add</span>Add
          </button>
        </div>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,minHeight:36,marginBottom:20}}>
          {symptoms.map(s=>(
            <span key={s} style={{display:'inline-flex',alignItems:'center',gap:4,padding:'5px 12px',background:'var(--pr-50)',color:'var(--pr)',borderRadius:'var(--r-full)',fontSize:'.82rem',fontWeight:600}}>
              {s}
              <button onClick={()=>setSymptoms(ss=>ss.filter(x=>x!==s))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--pr)',display:'flex',alignItems:'center',padding:0}}>
                <span className="material-icons-round" style={{fontSize:14}}>close</span>
              </button>
            </span>
          ))}
          {!symptoms.length && <span style={{fontSize:'.82rem',color:'var(--ts)',fontStyle:'italic'}}>No symptoms added yet...</span>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div className="input-group">
            <label className="label">Age (optional)</label>
            <input className="input" type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="e.g. 35" min="1" max="120" />
          </div>
          <div className="input-group">
            <label className="label">Gender (optional)</label>
            <select className="input" value={gender} onChange={e=>setGender(e.target.value)}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={analyze} disabled={!symptoms.length||loading} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'1rem',marginBottom:24}}>
        {loading ? <><span className="spinner" style={{width:18,height:18}} /> Analyzing symptoms...</> : <><span className="material-icons-round" style={{fontSize:20}}>biotech</span>Suggest Lab Tests</>}
      </button>

      {/* Common symptom presets */}
      {!result && !loading && (
        <div>
          <p style={{fontSize:'.85rem',color:'var(--ts)',marginBottom:10,fontWeight:600}}>Common symptom groups:</p>
          <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
            {[{label:'Diabetes check',syms:['frequent urination','excessive thirst','fatigue']},{label:'Thyroid check',syms:['weight gain','hair loss','fatigue']},{label:'Liver check',syms:['yellow eyes','dark urine','nausea']},{label:'Heart check',syms:['chest pain','shortness of breath','dizziness']}].map(g=>(
              <button key={g.label} onClick={()=>setSymptoms(g.syms)} style={{padding:'7px 14px',background:'white',border:'1px solid var(--bd)',borderRadius:'var(--r-full)',fontSize:'.82rem',cursor:'pointer',color:'var(--tm)'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pr)';e.currentTarget.style.color='var(--pr)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--tm)';}}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div style={{display:'flex',flexDirection:'column',gap:20,animation:'fadeUp .4s ease'}}>
          {result.urgency_level && (
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:urgencyStyle[result.urgency_level]?.bg||'var(--bgd)',borderRadius:'var(--r-lg)'}}>
              <span className="material-icons-round" style={{color:urgencyStyle[result.urgency_level]?.color||'var(--tm)',fontSize:22}}>{urgencyStyle[result.urgency_level]?.icon||'info'}</span>
              <span style={{fontFamily:'var(--font)',fontWeight:700,color:urgencyStyle[result.urgency_level]?.color||'var(--tm)'}}>
                Urgency: {result.urgency_level.toUpperCase()}{result.urgency_level==='high'?' — Seek medical attention promptly':''}
              </span>
            </div>
          )}

          {result.possible_conditions?.length>0 && (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:12}}>Possible Conditions</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                {result.possible_conditions.map(c=><span key={c} className="badge badge-info">{c}</span>)}
              </div>
            </div>
          )}

          {result.suggested_tests?.length>0 && (
            <div style={{background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:6}}>
                <span className="material-icons-round" style={{color:'var(--er)'}}>biotech</span>
                Suggested Lab Tests ({result.suggested_tests.length})
              </h3>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                {result.suggested_tests.map((t,i)=>(
                  <div key={i} style={{padding:'14px 16px',background:'var(--bgd)',borderRadius:'var(--r)',borderLeft:`3px solid ${t.urgency==='urgent'?'var(--er)':t.urgency==='soon'?'var(--wa)':'var(--pr)'}`}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:6}}>
                      <span style={{fontFamily:'var(--font)',fontWeight:700,fontSize:'.95rem'}}>{t.name}</span>
                      <div style={{display:'flex',gap:6,flexShrink:0}}>
                        <span className="badge" style={{background:t.urgency==='urgent'?'#fee2e2':t.urgency==='soon'?'#fef3c7':'var(--pr-50)',color:t.urgency==='urgent'?'var(--er)':t.urgency==='soon'?'#78350f':'var(--pr)'}}>{t.urgency}</span>
                        {t.fasting_required && <span className="badge badge-warning">Fasting required</span>}
                      </div>
                    </div>
                    <div style={{fontSize:'.83rem',color:'var(--tm)',marginBottom:4}}>{t.why}</div>
                    {t.estimated_cost && <div style={{fontSize:'.78rem',color:'var(--su)',fontWeight:600}}>Est. cost: {t.estimated_cost}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.consult_specialist && (
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:'linear-gradient(135deg,var(--pr-50),#e0f2fe)',borderRadius:'var(--r-lg)',border:'1px solid var(--pr-100)'}}>
              <span className="material-icons-round" style={{color:'var(--pr)',fontSize:24}}>local_hospital</span>
              <div><div style={{fontFamily:'var(--font)',fontWeight:700,color:'var(--pr)'}}>Consult a Specialist</div><div style={{fontSize:'.85rem',color:'var(--tm)',marginTop:2}}>We recommend seeing a <strong>{result.consult_specialist}</strong> for proper evaluation.</div></div>
            </div>
          )}

          <div className="disclaimer"><span className="material-icons-round">warning</span><span>Lab test suggestions are for guidance only. Please consult a doctor before getting any tests done.</span></div>
        </div>
      )}
    </div>
  );
}
