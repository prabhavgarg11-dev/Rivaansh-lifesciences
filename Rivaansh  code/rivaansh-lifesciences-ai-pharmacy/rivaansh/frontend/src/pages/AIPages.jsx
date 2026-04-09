import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.js';
import AIChatWidget from '../components/AIChatWidget.jsx';

const DISCLAIMER = 'AI suggestions are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.';

function DisclaimerBox() {
  return (
    <div className="disclaimer">
      <span className="material-icons-round">warning</span>
      {DISCLAIMER}
    </div>
  );
}

// ══════════════════════════════════
// CHAT PAGE
// ══════════════════════════════════
export function AIChatPage() {
  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,var(--pr),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-icons-round" style={{ color: 'white', fontSize: 22 }}>smart_toy</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.4rem', fontWeight: 800, color: '#1a2332', lineHeight: 1 }}>AI Health Assistant</h1>
            <p style={{ fontSize: '.85rem', color: 'var(--ts)', marginTop: 3 }}>Powered by Claude AI · Available 24/7</p>
          </div>
          <span className="badge badge-ai" style={{ marginLeft: 'auto' }}>
            <span className="material-icons-round" style={{ fontSize: 12 }}>auto_awesome</span> AI
          </span>
        </div>
        <div style={{ height: 560 }}>
          <AIChatWidget floating={false} />
        </div>
        <div style={{ marginTop: 16 }}><DisclaimerBox /></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════
// SMART SEARCH PAGE
// ══════════════════════════════════
export function AISearchPage() {
  const [query, setQuery]   = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const { ok, data } = await api.post('/ai/search', { query });
    if (ok) setResult(data);
    setLoading(false);
  };

  const symptoms = ['Fever & headache', 'Cold & cough', 'Skin infection', 'Stomach pain', 'Vitamin deficiency', 'Allergies'];

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AIPageHeader icon="search" title="AI Medicine Search" subtitle="Describe symptoms or conditions — AI finds relevant medicines" color="#6366f1" />

        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <div className="input-group">
            <label className="label">Describe your symptoms or condition</label>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="e.g., fever with body pain and sore throat…"
              rows={3}
              className="input"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: '.78rem', color: 'var(--ts)', alignSelf: 'center' }}>Quick:</span>
            {symptoms.map(s => (
              <button type="button" key={s} onClick={() => setQuery(s)} style={{
                padding: '4px 12px', borderRadius: 'var(--r-full)',
                border: '1px solid var(--bd)', background: 'white',
                fontSize: '.78rem', cursor: 'pointer', color: 'var(--tm)', fontWeight: 500
              }}>{s}</button>
            ))}
          </div>

          <button type="submit" disabled={loading || !query.trim()} className="btn btn-primary">
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing…</> : <><span className="material-icons-round" style={{ fontSize: 18 }}>psychology</span>AI Search</>}
          </button>
        </form>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .4s ease' }}>
            {result.conditions?.length > 0 && (
              <AIResultCard title="Possible Conditions" icon="psychology" color="#6366f1">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.conditions.map(c => <span key={c} className="badge badge-warning">{c}</span>)}
                </div>
              </AIResultCard>
            )}

            {result.explanation && (
              <AIResultCard title="AI Analysis" icon="auto_awesome" color="#0891b2">
                <p style={{ fontSize: '.88rem', color: 'var(--tm)', lineHeight: 1.6 }}>{result.explanation}</p>
              </AIResultCard>
            )}

            {result.products?.length > 0 && (
              <AIResultCard title="Recommended Medicines" icon="medication" color="#059669">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {result.products.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} style={{
                      padding: '10px 14px', background: 'var(--bgd)',
                      borderRadius: 'var(--r)', border: '1px solid var(--bd)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div>
                        <p style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.88rem', color: '#1a2332' }}>{p.name}</p>
                        <p style={{ fontSize: '.73rem', color: 'var(--ts)' }}>{p.brand}</p>
                      </div>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 800, color: 'var(--pr)' }}>₹{p.price}</span>
                    </Link>
                  ))}
                </div>
              </AIResultCard>
            )}

            {result.urgency === 'high' || result.see_doctor ? (
              <div className="disclaimer" style={{ background: '#fee2e2', borderColor: 'var(--er)' }}>
                <span className="material-icons-round" style={{ color: 'var(--er)' }}>medical_services</span>
                <strong>Important:</strong> Based on your symptoms, we strongly recommend consulting a doctor immediately.
              </div>
            ) : <DisclaimerBox />}
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════
// PRESCRIPTION ANALYZER PAGE
// ══════════════════════════════════
export function PrescriptionPage() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag]       = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(f.type)) { alert('Only JPG, PNG, WEBP, or PDF allowed.'); return; }
    if (f.size > 5 * 1024 * 1024) { alert('File must be under 5MB.'); return; }
    setFile(f);
    setResult(null);
    if (f.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else setPreview(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('prescription', file);
    const { ok, data } = await api.postForm('/ai/prescription', fd);
    if (ok) setResult(data);
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AIPageHeader icon="document_scanner" title="Prescription Analyzer" subtitle="Upload your prescription — AI extracts medicines and suggests matching products" color="#059669" />

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('rx-file').click()}
          style={{
            border: `2px dashed ${drag ? 'var(--pr)' : 'var(--bd)'}`,
            borderRadius: 'var(--r-lg)', padding: '32px 24px',
            textAlign: 'center', cursor: 'pointer', marginBottom: 16,
            background: drag ? 'var(--pr-50)' : 'var(--bgd)',
            transition: 'all var(--tr)'
          }}>
          <input id="rx-file" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
          {preview ? (
            <img src={preview} alt="Prescription preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 8, margin: '0 auto' }} />
          ) : file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span className="material-icons-round" style={{ fontSize: 48, color: 'var(--pr)' }}>picture_as_pdf</span>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 600 }}>{file.name}</p>
            </div>
          ) : (
            <>
              <span className="material-icons-round" style={{ fontSize: 48, color: 'var(--pr-100)', display: 'block', marginBottom: 12 }}>upload_file</span>
              <p style={{ fontFamily: 'var(--font)', fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>Drop prescription here or click to upload</p>
              <p style={{ fontSize: '.82rem', color: 'var(--ts)' }}>Supports JPG, PNG, WEBP, PDF · Max 5MB</p>
            </>
          )}
        </div>

        {file && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button onClick={handleAnalyze} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing…</> : <><span className="material-icons-round" style={{ fontSize: 18 }}>document_scanner</span>Analyze Prescription</>}
            </button>
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} className="btn btn-outline">
              <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        )}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .4s ease' }}>
            {result.medicines?.length > 0 && (
              <AIResultCard title="Extracted Medicines" icon="medication" color="#059669">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.medicines.map((m, i) => (
                    <div key={i} style={{ padding: '12px 14px', background: 'var(--bgd)', borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'var(--font)', fontWeight: 700, color: '#1a2332' }}>{m.name}</span>
                        <span className="badge badge-primary">{m.dosage}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {m.frequency && <span style={{ fontSize: '.75rem', color: 'var(--ts)' }}>🕐 {m.frequency}</span>}
                        {m.duration && <span style={{ fontSize: '.75rem', color: 'var(--ts)' }}>📅 {m.duration}</span>}
                        {m.instructions && <span style={{ fontSize: '.75rem', color: 'var(--ts)' }}>📝 {m.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </AIResultCard>
            )}

            {result.suggestedProducts?.length > 0 && (
              <AIResultCard title="Matching Products in Store" icon="storefront" color="#6366f1">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {result.suggestedProducts.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} style={{
                      padding: '10px 14px', background: 'var(--bgd)', borderRadius: 'var(--r)',
                      border: '1px solid var(--bd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.88rem' }}>{p.name}</span>
                      <span style={{ color: 'var(--pr)', fontWeight: 800 }}>₹{p.price}</span>
                    </Link>
                  ))}
                </div>
              </AIResultCard>
            )}

            <div style={{
              padding: 14, background: '#fef3c7', borderRadius: 'var(--r)',
              border: '1px solid #fde68a', fontSize: '.8rem', color: '#78350f', fontWeight: 600
            }}>
              ⚠️ Always verify extracted medicines with your pharmacist before purchase.
            </div>
          </div>
        )}
        <div style={{ marginTop: 20 }}><DisclaimerBox /></div>
      </div>
    </div>
  );
}

// ══════════════════════════════════
// SIDE EFFECT DETECTOR PAGE
// ══════════════════════════════════
export function SideEffectsPage() {
  const [medicines, setMedicines] = useState(['']);
  const [symptoms, setSymptoms]   = useState('');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const addMedicine = () => setMedicines(m => [...m, '']);
  const updateMed = (i, v) => setMedicines(m => m.map((x, idx) => idx === i ? v : x));
  const removeMed = (i) => setMedicines(m => m.filter((_, idx) => idx !== i));

  const handleCheck = async () => {
    const meds = medicines.filter(m => m.trim());
    if (!meds.length) return;
    setLoading(true);
    setResult(null);
    const syms = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    const { ok, data } = await api.post('/ai/sideeffects', { medicines: meds, symptoms: syms });
    if (ok) setResult(data);
    setLoading(false);
  };

  const riskColors = { low: 'var(--su)', moderate: 'var(--wa)', high: 'var(--er)', unknown: 'var(--ts)' };
  const sevColors  = { mild: 'var(--su)', moderate: 'var(--wa)', severe: 'var(--er)', avoid: 'var(--er)' };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AIPageHeader icon="warning" title="Side Effect & Drug Interaction Checker" subtitle="Check for side effects, interactions, and safety warnings" color="#dc2626" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div className="input-group">
            <label className="label">Medicines (Enter one per field)</label>
            {medicines.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={m} onChange={e => updateMed(i, e.target.value)} placeholder={`Medicine ${i + 1} (e.g., Paracetamol 500mg)`} className="input" style={{ flex: 1 }} />
                {medicines.length > 1 && (
                  <button onClick={() => removeMed(i)} className="btn-icon" style={{ border: '1px solid var(--bd)' }}>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </div>
            ))}
            <button onClick={addMedicine} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>add</span> Add Medicine
            </button>
          </div>

          <div className="input-group">
            <label className="label">Currently Experienced Symptoms (optional, comma-separated)</label>
            <input value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g., nausea, dizziness, rash" className="input" />
          </div>

          <button onClick={handleCheck} disabled={loading || !medicines.some(m => m.trim())} className="btn btn-primary">
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing…</> : <><span className="material-icons-round" style={{ fontSize: 18 }}>warning</span>Check Side Effects</>}
          </button>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .4s ease' }}>
            {/* Risk Level */}
            <div style={{ padding: 20, borderRadius: 'var(--r-lg)', border: `2px solid ${riskColors[result.overall_risk] || 'var(--bd)'}`, background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className="material-icons-round" style={{ color: riskColors[result.overall_risk], fontSize: 28 }}>
                  {result.overall_risk === 'low' ? 'check_circle' : result.overall_risk === 'high' ? 'error' : 'warning'}
                </span>
                <div>
                  <p style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '1rem', color: '#1a2332' }}>Overall Risk Level</p>
                  <span style={{ fontFamily: 'var(--font)', fontWeight: 700, color: riskColors[result.overall_risk], textTransform: 'uppercase', fontSize: '.88rem' }}>
                    {result.overall_risk}
                  </span>
                </div>
              </div>
            </div>

            {result.individual_effects?.length > 0 && (
              <AIResultCard title="Side Effects by Medicine" icon="medication" color="#dc2626">
                {result.individual_effects.map((e, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--bgd)', borderRadius: 'var(--r)', border: '1px solid var(--bd)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 700 }}>{e.medicine}</span>
                      <span style={{ fontSize: '.75rem', background: sevColors[e.severity] + '20', color: sevColors[e.severity], padding: '2px 8px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>{e.severity}</span>
                    </div>
                    {e.common_effects?.length > 0 && <p style={{ fontSize: '.8rem', color: 'var(--tm)', marginBottom: 4 }}><strong>Common:</strong> {e.common_effects.join(', ')}</p>}
                    {e.rare_effects?.length > 0 && <p style={{ fontSize: '.8rem', color: 'var(--ts)' }}><strong>Rare:</strong> {e.rare_effects.join(', ')}</p>}
                  </div>
                ))}
              </AIResultCard>
            )}

            {result.interactions?.length > 0 && (
              <AIResultCard title="Drug Interactions" icon="sync_problem" color="#ea580c">
                {result.interactions.map((inter, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: inter.severity === 'avoid' ? '#fee2e2' : 'var(--bgd)', borderRadius: 'var(--r)', border: `1px solid ${inter.severity === 'avoid' ? '#fca5a5' : 'var(--bd)'}`, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '.8rem', fontWeight: 700, color: sevColors[inter.severity] }}>{inter.drugs.join(' + ')}</span>
                      <span style={{ fontSize: '.7rem', background: sevColors[inter.severity] + '20', color: sevColors[inter.severity], padding: '2px 6px', borderRadius: 'var(--r-full)', fontWeight: 700 }}>{inter.severity}</span>
                    </div>
                    <p style={{ fontSize: '.8rem', color: 'var(--tm)', marginBottom: 4 }}>{inter.interaction}</p>
                    <p style={{ fontSize: '.78rem', color: 'var(--pr)', fontWeight: 600 }}>→ {inter.recommendation}</p>
                  </div>
                ))}
              </AIResultCard>
            )}

            {result.recommendations?.length > 0 && (
              <AIResultCard title="Recommendations" icon="tips_and_updates" color="#059669">
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.recommendations.map((r, i) => <li key={i} style={{ fontSize: '.88rem', color: 'var(--tm)', lineHeight: 1.5 }}>{r}</li>)}
                </ul>
              </AIResultCard>
            )}

            {result.see_doctor_immediately && (
              <div className="disclaimer" style={{ background: '#fee2e2', borderColor: 'var(--er)' }}>
                <span className="material-icons-round" style={{ color: 'var(--er)' }}>emergency</span>
                <strong>Seek immediate medical attention:</strong> {result.reason_to_see_doctor}
              </div>
            )}
            <DisclaimerBox />
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════
// LAB TEST SUGGESTER PAGE
// ══════════════════════════════════
export function LabTestPage() {
  const [symptomInput, setSymptomInput] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [age, setAge]    = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);

  const addSymptom = () => {
    if (!symptomInput.trim()) return;
    setSymptoms(s => [...s, symptomInput.trim()]);
    setSymptomInput('');
  };

  const handleCheck = async () => {
    if (!symptoms.length) return;
    setLoading(true);
    setResult(null);
    const { ok, data } = await api.post('/ai/labtest', { symptoms, age, gender });
    if (ok) setResult(data);
    setLoading(false);
  };

  const urgencyColor = { routine: 'var(--su)', soon: 'var(--wa)', urgent: 'var(--er)' };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AIPageHeader icon="biotech" title="AI Lab Test Suggester" subtitle="Describe symptoms — AI recommends relevant diagnostic tests" color="#7c3aed" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div className="input-group">
            <label className="label">Symptoms</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={symptomInput} onChange={e => setSymptomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSymptom()} placeholder="Type a symptom and press Enter" className="input" style={{ flex: 1 }} />
              <button onClick={addSymptom} className="btn btn-outline">Add</button>
            </div>
            {symptoms.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {symptoms.map((s, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--pr-50)', color: 'var(--pr)', borderRadius: 'var(--r-full)', fontSize: '.82rem', fontWeight: 600 }}>
                    {s}
                    <button onClick={() => setSymptoms(prev => prev.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pr)', display: 'flex', padding: 0 }}>
                      <span className="material-icons-round" style={{ fontSize: 14 }}>close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="input-group">
              <label className="label">Age (optional)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="e.g., 35" className="input" min="1" max="120" />
            </div>
            <div className="input-group">
              <label className="label">Gender (optional)</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="input">
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <button onClick={handleCheck} disabled={loading || !symptoms.length} className="btn btn-primary">
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Analyzing…</> : <><span className="material-icons-round" style={{ fontSize: 18 }}>biotech</span>Suggest Lab Tests</>}
          </button>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .4s ease' }}>
            {result.possible_conditions?.length > 0 && (
              <AIResultCard title="Possible Conditions" icon="psychology" color="#7c3aed">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.possible_conditions.map(c => <span key={c} className="badge badge-warning">{c}</span>)}
                </div>
              </AIResultCard>
            )}

            {result.suggested_tests?.length > 0 && (
              <AIResultCard title="Recommended Lab Tests" icon="biotech" color="#7c3aed">
                {result.suggested_tests.map((t, i) => (
                  <div key={i} style={{ padding: '12px 14px', background: 'var(--bgd)', borderRadius: 'var(--r)', border: '1px solid var(--bd)', marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 700, color: '#1a2332' }}>{t.name}</span>
                      <span style={{ fontSize: '.72rem', fontWeight: 700, color: urgencyColor[t.urgency], background: urgencyColor[t.urgency] + '15', padding: '2px 8px', borderRadius: 'var(--r-full)' }}>
                        {t.urgency}
                      </span>
                    </div>
                    <p style={{ fontSize: '.82rem', color: 'var(--tm)', marginBottom: 4 }}>{t.why}</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {t.fasting_required && <span style={{ fontSize: '.75rem', color: 'var(--wa)', fontWeight: 600 }}>🍽️ Fasting required</span>}
                      {t.estimated_cost && <span style={{ fontSize: '.75rem', color: 'var(--ts)', fontWeight: 500 }}>💰 Est. {t.estimated_cost}</span>}
                    </div>
                  </div>
                ))}
              </AIResultCard>
            )}

            {result.consult_specialist && (
              <div style={{ padding: 14, background: 'var(--pr-50)', borderRadius: 'var(--r)', border: '1px solid var(--bd)', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span className="material-icons-round" style={{ color: 'var(--pr)' }}>medical_services</span>
                <p style={{ fontSize: '.88rem', color: 'var(--pr-dark)', fontWeight: 600 }}>
                  Recommended specialist: <strong>{result.consult_specialist}</strong>
                </p>
              </div>
            )}
            <DisclaimerBox />
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════
// MEDICINE REMINDER PAGE
// ══════════════════════════════════
export function ReminderPage() {
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '' }]);
  const [wakeTime, setWakeTime]   = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const updateMed = (i, field, val) => {
    setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  const handleCreate = async () => {
    const meds = medicines.filter(m => m.name.trim());
    if (!meds.length) return;
    setLoading(true);
    setResult(null);
    const { ok, data } = await api.post('/ai/reminder', { medicines: meds, wakeTime, sleepTime });
    if (ok) setResult(data);
    setLoading(false);
  };

  return (
    <div className="container" style={{ paddingTop: 28, paddingBottom: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <AIPageHeader icon="alarm" title="Medicine Reminder Planner" subtitle="AI creates an optimal daily schedule for your medications" color="#ea580c" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
          <div className="input-group">
            <label className="label">Your Medicines</label>
            {medicines.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                <input value={m.name} onChange={e => updateMed(i, 'name', e.target.value)} placeholder="Medicine name" className="input" />
                <input value={m.dosage} onChange={e => updateMed(i, 'dosage', e.target.value)} placeholder="Dose (e.g. 1 tab)" className="input" />
                <input value={m.frequency} onChange={e => updateMed(i, 'frequency', e.target.value)} placeholder="Frequency" className="input" />
                {medicines.length > 1 && (
                  <button onClick={() => setMedicines(prev => prev.filter((_, idx) => idx !== i))} className="btn-icon" style={{ border: '1px solid var(--bd)' }}>
                    <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => setMedicines(prev => [...prev, { name: '', dosage: '', frequency: '' }])} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>add</span> Add Medicine
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[{ label: 'Wake Time', val: wakeTime, set: setWakeTime }, { label: 'Sleep Time', val: sleepTime, set: setSleepTime }].map(t => (
              <div key={t.label} className="input-group">
                <label className="label">{t.label}</label>
                <input type="time" value={t.val} onChange={e => t.set(e.target.value)} className="input" />
              </div>
            ))}
          </div>

          <button onClick={handleCreate} disabled={loading || !medicines.some(m => m.name.trim())} className="btn btn-primary">
            {loading ? <><div className="spinner" style={{ width: 16, height: 16 }} />Creating Schedule…</> : <><span className="material-icons-round" style={{ fontSize: 18 }}>alarm</span>Create Reminder Schedule</>}
          </button>
        </div>

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .4s ease' }}>
            <AIResultCard title={`Daily Medicine Schedule (${result.total_daily_doses} doses/day)`} icon="schedule" color="#ea580c">
              {result.schedule?.map((slot, i) => (
                <div key={i} style={{ padding: '14px 16px', background: i % 2 === 0 ? 'var(--bgd)' : 'white', borderRadius: 'var(--r)', border: '1px solid var(--bd)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--pr),var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 800, fontSize: '.78rem', color: 'white' }}>{slot.time}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font)', fontWeight: 700, color: '#1a2332' }}>{slot.label}</span>
                  </div>
                  {slot.medicines?.map((med, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: j < slot.medicines.length - 1 ? '1px solid var(--bd)' : 'none' }}>
                      <span style={{ fontFamily: 'var(--font)', fontWeight: 600, fontSize: '.88rem' }}>{med.name}</span>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge badge-primary">{med.dose}</span>
                        {med.instructions && <span style={{ fontSize: '.72rem', color: 'var(--ts)' }}>{med.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </AIResultCard>

            {result.tips?.length > 0 && (
              <AIResultCard title="Pro Tips" icon="tips_and_updates" color="#059669">
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.tips.map((t, i) => <li key={i} style={{ fontSize: '.88rem', color: 'var(--tm)', lineHeight: 1.5 }}>{t}</li>)}
                </ul>
              </AIResultCard>
            )}

            {result.interactions_note && (
              <div className="disclaimer">
                <span className="material-icons-round">info</span>
                {result.interactions_note}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Components ────────────────────────────────────────────────────────
function AIPageHeader({ icon, title, subtitle, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--bd)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-icons-round" style={{ color, fontSize: 26 }}>{icon}</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: '1.3rem', fontWeight: 800, color: '#1a2332', lineHeight: 1 }}>{title}</h1>
          <span className="badge badge-ai" style={{ fontSize: '.65rem' }}>
            <span className="material-icons-round" style={{ fontSize: 11 }}>auto_awesome</span> AI
          </span>
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--ts)' }}>{subtitle}</p>
      </div>
    </div>
  );
}

function AIResultCard({ title, icon, color, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--bd)', overflow: 'hidden', boxShadow: 'var(--sh-sm)' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bd)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bgd)' }}>
        <span className="material-icons-round" style={{ fontSize: 18, color }}>{icon}</span>
        <h3 style={{ fontFamily: 'var(--font)', fontWeight: 700, fontSize: '.9rem', color: '#1a2332' }}>{title}</h3>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}
