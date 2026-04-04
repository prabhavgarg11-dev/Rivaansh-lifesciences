import { useState, useRef } from 'react';
import api from '../api/api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function AIPrescriptionPage() {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.size > 5*1024*1024) { setError('File must be under 5MB'); return; }
    setFile(f); setError('');
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else setPreview(null);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setResult(null);
    const fd = new FormData();
    fd.append('prescription', file);
    const { ok, data } = await api.postForm('/ai/prescription', fd);
    if (ok) setResult(data);
    else setError(data.message || 'Analysis failed.');
    setLoading(false);
  };

  const confColor = { high:'var(--su)', medium:'var(--wa)', low:'var(--er)' };

  return (
    <div className="container" style={{ padding:'32px 20px',maxWidth:900 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}>
          <span className="material-icons-round" style={{ color:'var(--pr)',fontSize:28 }}>document_scanner</span>
          <h1 style={{ fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332' }}>Prescription Analyzer</h1>
          <span className="badge badge-ai"><span className="material-icons-round" style={{ fontSize:11 }}>auto_awesome</span>Vision AI</span>
        </div>
        <p style={{ color:'var(--tm)',fontSize:'.92rem' }}>Upload a prescription image and AI will extract medicine names, dosages, and suggest matching products.</p>
      </div>

      {/* Upload Zone */}
      <div
        onClick={()=>inputRef.current?.click()}
        onDrop={e=>{e.preventDefault();handleFile(e.dataTransfer.files[0]);}}
        onDragOver={e=>e.preventDefault()}
        style={{
          border:'2px dashed var(--bd)',borderRadius:'var(--r-xl)',padding:40,textAlign:'center',
          cursor:'pointer',background:'white',transition:'all var(--tr)',marginBottom:20,
          background:file?'var(--pr-50)':'white'
        }}
        onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pr)';e.currentTarget.style.background='var(--pr-50)';}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.background=file?'var(--pr-50)':'white';}}
      >
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display:'none' }} onChange={e=>handleFile(e.target.files[0])} />
        {preview ? (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
            <img src={preview} alt="Prescription preview" style={{ maxHeight:200,maxWidth:'100%',borderRadius:'var(--r)',objectFit:'contain',boxShadow:'var(--sh)' }} />
            <div style={{ fontFamily:'var(--font)',fontWeight:600,color:'var(--pr)',fontSize:'.9rem' }}>{file.name}</div>
          </div>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:12 }}>
            <div style={{ width:60,height:60,borderRadius:'50%',background:'var(--pr-50)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-icons-round" style={{ color:'var(--pr)',fontSize:28 }}>upload_file</span>
            </div>
            <div style={{ fontFamily:'var(--font)',fontWeight:700,color:'#1a2332',fontSize:'1rem' }}>
              {file ? file.name : 'Drop prescription here or click to browse'}
            </div>
            <div style={{ fontSize:'.82rem',color:'var(--ts)' }}>Supports JPG, PNG, PDF · Max 5MB</div>
          </div>
        )}
      </div>

      {error && <div style={{ padding:'10px 14px',background:'#fee2e2',color:'var(--er)',borderRadius:'var(--r)',marginBottom:16,fontSize:'.88rem' }}>{error}</div>}

      <button onClick={analyze} disabled={!file||loading} className="btn btn-primary" style={{ width:'100%',padding:'14px',fontSize:'1rem',marginBottom:24 }}>
        {loading ? <><span className="spinner" style={{ width:18,height:18 }} /> Analyzing Prescription...</> : <><span className="material-icons-round" style={{ fontSize:20 }}>document_scanner</span>Analyze with AI</>}
      </button>

      {loading && (
        <div style={{ textAlign:'center',padding:40 }}>
          <div style={{ display:'inline-flex',flexDirection:'column',alignItems:'center',gap:12 }}>
            <div style={{ width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <span className="material-icons-round" style={{ color:'white',fontSize:24,animation:'spin 1.5s linear infinite' }}>document_scanner</span>
            </div>
            <div style={{ fontFamily:'var(--font)',fontWeight:700,color:'var(--pr)' }}>Reading prescription...</div>
            <div style={{ fontSize:'.82rem',color:'var(--ts)' }}>This may take a few seconds</div>
          </div>
        </div>
      )}

      {result && (
        <div style={{ display:'flex',flexDirection:'column',gap:24,animation:'fadeUp .4s ease' }}>
          {/* Confidence */}
          <div style={{ display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:confColor[result.confidence]+'15',border:`2px solid ${confColor[result.confidence]}`,borderRadius:'var(--r)' }}>
            <span className="material-icons-round" style={{ color:confColor[result.confidence] }}>verified</span>
            <span style={{ fontFamily:'var(--font)',fontWeight:700,color:confColor[result.confidence] }}>
              Confidence: {result.confidence?.toUpperCase()} — {result.confidence==='high'?'Clear prescription read':'Some details may need manual verification'}
            </span>
          </div>

          {/* Patient / Doctor info */}
          {(result.doctor_name||result.patient_name||result.date) && (
            <div style={{ background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)' }}>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:12 }}>Prescription Details</h3>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12 }}>
                {result.doctor_name && <div><div style={{ fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3 }}>Doctor</div><div style={{ fontWeight:600,fontSize:'.9rem' }}>{result.doctor_name}</div></div>}
                {result.patient_name && <div><div style={{ fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3 }}>Patient</div><div style={{ fontWeight:600,fontSize:'.9rem' }}>{result.patient_name}</div></div>}
                {result.date && <div><div style={{ fontSize:'.75rem',color:'var(--ts)',fontWeight:600,marginBottom:3 }}>Date</div><div style={{ fontWeight:600,fontSize:'.9rem' }}>{result.date}</div></div>}
              </div>
            </div>
          )}

          {/* Extracted medicines */}
          {result.medicines?.length>0 && (
            <div style={{ background:'white',borderRadius:'var(--r-lg)',padding:20,border:'1px solid var(--bd2)' }}>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:6 }}>
                <span className="material-icons-round" style={{ color:'var(--pr)' }}>medication</span>
                Extracted Medicines ({result.medicines.length})
              </h3>
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {result.medicines.map((m,i)=>(
                  <div key={i} style={{ padding:'12px 16px',background:'var(--bgd)',borderRadius:'var(--r)',borderLeft:'3px solid var(--pr)' }}>
                    <div style={{ fontFamily:'var(--font)',fontWeight:700,fontSize:'.95rem',marginBottom:6 }}>{m.name}</div>
                    <div style={{ display:'flex',flexWrap:'wrap',gap:8,fontSize:'.8rem',color:'var(--tm)' }}>
                      {m.dosage && <span>💊 {m.dosage}</span>}
                      {m.frequency && <span>⏰ {m.frequency}</span>}
                      {m.duration && <span>📅 {m.duration}</span>}
                      {m.instructions && <span>ℹ️ {m.instructions}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched products */}
          {result.suggestedProducts?.length>0 && (
            <div>
              <h3 style={{ fontFamily:'var(--font)',fontWeight:700,marginBottom:16,display:'flex',alignItems:'center',gap:6 }}>
                <span className="material-icons-round" style={{ color:'var(--pr)' }}>local_pharmacy</span>
                Matching Products in Our Store
              </h3>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:16 }}>
                {result.suggestedProducts.map(p=><ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          <div className="disclaimer"><span className="material-icons-round">warning</span><span>{result.disclaimer || 'Always verify extracted medicines with your pharmacist before purchasing.'}</span></div>
        </div>
      )}
    </div>
  );
}
