import { useState } from 'react';
import api from '../api/api.js';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function AIReminderPage() {
  const [medicines, setMedicines] = useState([]);
  const [medInput, setMedInput]   = useState({ name:'',dose:'',frequency:'' });
  const [wakeTime, setWakeTime]   = useState('07:00');
  const [sleepTime,setSleepTime]  = useState('22:00');
  const [result,   setResult]     = useState(null);
  const [loading,  setLoading]    = useState(false);

  const addMed = () => {
    if (!medInput.name.trim()) return;
    setMedicines(m=>[...m,{...medInput}]);
    setMedInput({name:'',dose:'',frequency:''});
  };

  const generate = async () => {
    if (!medicines.length) return;
    setLoading(true); setResult(null);
    const {ok,data} = await api.post('/ai/reminder',{medicines,wakeTime,sleepTime});
    if (ok) setResult(data);
    setLoading(false);
  };

  const slotColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6'];

  return (
    <div className="container" style={{padding:'32px 20px',maxWidth:900}}>
      <div style={{marginBottom:24}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <span className="material-icons-round" style={{color:'#8b5cf6',fontSize:28}}>alarm</span>
          <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332'}}>Medicine Reminder Planner</h1>
          <span className="badge badge-ai"><span className="material-icons-round" style={{fontSize:11}}>auto_awesome</span>AI</span>
        </div>
        <p style={{color:'var(--tm)',fontSize:'.92rem'}}>AI creates a personalized daily medicine schedule based on your routine.</p>
      </div>

      {/* Schedule settings */}
      <div style={{background:'white',borderRadius:'var(--r-xl)',padding:24,border:'1px solid var(--bd2)',marginBottom:20}}>
        <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:16}}>Your Daily Routine</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
          <div className="input-group">
            <label className="label">Wake Up Time</label>
            <input className="input" type="time" value={wakeTime} onChange={e=>setWakeTime(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="label">Sleep Time</label>
            <input className="input" type="time" value={sleepTime} onChange={e=>setSleepTime(e.target.value)} />
          </div>
        </div>

        <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:12}}>Add Medicines</h3>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:10,marginBottom:14}}>
          <input className="input" value={medInput.name} onChange={e=>setMedInput(m=>({...m,name:e.target.value}))} placeholder="Medicine name *" />
          <input className="input" value={medInput.dose} onChange={e=>setMedInput(m=>({...m,dose:e.target.value}))} placeholder="Dose (e.g. 1 tab)" />
          <select className="input" value={medInput.frequency} onChange={e=>setMedInput(m=>({...m,frequency:e.target.value}))}>
            <option value="">Frequency</option>
            <option value="once daily">Once daily</option>
            <option value="twice daily">Twice daily</option>
            <option value="thrice daily">Three times daily</option>
            <option value="every 4 hours">Every 4 hours</option>
            <option value="before meals">Before meals</option>
            <option value="after meals">After meals</option>
            <option value="at bedtime">At bedtime</option>
          </select>
          <button onClick={addMed} className="btn btn-primary" disabled={!medInput.name.trim()}>Add</button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {medicines.map((m,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--bgd)',borderRadius:'var(--r)',borderLeft:'3px solid var(--pr)'}}>
              <span className="material-icons-round" style={{color:'var(--pr)',fontSize:18}}>medication</span>
              <div style={{flex:1}}>
                <span style={{fontWeight:700,fontSize:'.9rem'}}>{m.name}</span>
                {m.dose && <span style={{color:'var(--ts)',fontSize:'.82rem',marginLeft:8}}>· {m.dose}</span>}
                {m.frequency && <span style={{color:'var(--pr)',fontSize:'.82rem',marginLeft:8}}>· {m.frequency}</span>}
              </div>
              <button onClick={()=>setMedicines(ms=>ms.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--er)',display:'flex',alignItems:'center'}}>
                <span className="material-icons-round" style={{fontSize:18}}>delete_outline</span>
              </button>
            </div>
          ))}
          {!medicines.length && <div style={{padding:'20px',textAlign:'center',color:'var(--ts)',fontSize:'.85rem',fontStyle:'italic'}}>No medicines added yet</div>}
        </div>
      </div>

      <button onClick={generate} disabled={!medicines.length||loading} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'1rem',marginBottom:24}}>
        {loading ? <><span className="spinner" style={{width:18,height:18}} /> Creating your schedule...</> : <><span className="material-icons-round" style={{fontSize:20}}>auto_awesome</span>Generate AI Schedule</>}
      </button>

      {result && (
        <div style={{display:'flex',flexDirection:'column',gap:20,animation:'fadeUp .4s ease'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:'linear-gradient(135deg,#f3e8ff,#ede9fe)',borderRadius:'var(--r-lg)',border:'1px solid #c4b5fd'}}>
            <span className="material-icons-round" style={{color:'#7c3aed',fontSize:24}}>schedule</span>
            <div>
              <div style={{fontFamily:'var(--font)',fontWeight:700,color:'#4c1d95'}}>Your Daily Schedule is Ready</div>
              <div style={{fontSize:'.82rem',color:'#6d28d9',marginTop:2}}>{result.total_daily_doses} dose{result.total_daily_doses!==1?'s':''} per day</div>
            </div>
          </div>

          {/* Timeline */}
          {result.schedule?.map((slot,i)=>(
            <div key={i} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',flexShrink:0}}>
                <div style={{width:44,height:44,borderRadius:'50%',background:slotColors[i%slotColors.length]+'20',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <span className="material-icons-round" style={{color:slotColors[i%slotColors.length],fontSize:22}}>alarm</span>
                </div>
                {i<result.schedule.length-1 && <div style={{width:2,height:24,background:'var(--bd)',marginTop:4}} />}
              </div>
              <div style={{flex:1,background:'white',borderRadius:'var(--r-lg)',padding:'16px 20px',border:'1px solid var(--bd2)',marginBottom:4}}>
                <div style={{display:'flex',alignItems:'baseline',gap:8,marginBottom:10}}>
                  <span style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.1rem',color:slotColors[i%slotColors.length]}}>{slot.time}</span>
                  <span style={{fontFamily:'var(--font)',fontWeight:600,color:'var(--tm)',fontSize:'.88rem'}}>{slot.label}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {slot.medicines?.map((m,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',background:'var(--bgd)',borderRadius:'var(--r-sm)'}}>
                      <span className="material-icons-round" style={{color:'var(--pr)',fontSize:18}}>medication</span>
                      <div>
                        <span style={{fontWeight:600,fontSize:'.88rem'}}>{m.name}</span>
                        {m.dose && <span style={{color:'var(--ts)',fontSize:'.8rem',marginLeft:6}}>— {m.dose}</span>}
                        {m.instructions && <div style={{fontSize:'.78rem',color:'var(--ts)',marginTop:2}}>ℹ️ {m.instructions}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Notes */}
          {result.interactions_note && (
            <div style={{padding:'14px 18px',background:'#fef3c7',border:'1px solid #f59e0b',borderRadius:'var(--r-lg)',fontSize:'.88rem',color:'#78350f'}}>
              <strong>⚠️ Note:</strong> {result.interactions_note}
            </div>
          )}

          {result.tips?.length>0 && (
            <div style={{background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',borderRadius:'var(--r-lg)',padding:20,border:'1px solid #bbf7d0'}}>
              <h3 style={{fontFamily:'var(--font)',fontWeight:700,marginBottom:10,color:'#166534'}}>💡 Tips for Better Medication Adherence</h3>
              <ul style={{display:'flex',flexDirection:'column',gap:6,listStyle:'none',paddingLeft:0}}>
                {result.tips.map((t,i)=>(
                  <li key={i} style={{display:'flex',gap:8,fontSize:'.88rem',color:'#166534'}}>
                    <span className="material-icons-round" style={{fontSize:16,flexShrink:0,marginTop:2}}>check_circle</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Print button */}
          <button onClick={()=>window.print()} className="btn btn-outline" style={{alignSelf:'flex-start'}}>
            <span className="material-icons-round" style={{fontSize:18}}>print</span>Print Schedule
          </button>

          <div className="disclaimer"><span className="material-icons-round">warning</span><span>Always follow your doctor's prescription timing. This AI schedule is a general guide only.</span></div>
        </div>
      )}
    </div>
  );
}
