import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function AuthPage() {
  const [mode, setMode]     = useState('login');
  const [form, setForm]     = useState({ name:'',email:'',phone:'',password:'',confirm:'' });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const { login, register }  = useAuth();
  const { show } = useToast();
  const nav = useNavigate();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e = {};
    if (mode==='register' && !form.name.trim()) e.name='Name required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email='Valid email required';
    if (mode==='register' && !form.phone.trim()) e.phone='Phone required';
    if (!form.password || form.password.length<6) e.password='Min 6 characters';
    if (mode==='register' && form.password!==form.confirm) e.confirm='Passwords do not match';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = mode==='login'
      ? await login(form.email, form.password)
      : await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (res.ok) { show(mode==='login'?'Welcome back!':'Account created!','success'); nav('/'); }
    else show(res.message||'Something went wrong','error');
  };

  const fields = mode==='login'
    ? [{k:'email',label:'Email',type:'email',placeholder:'your@email.com',icon:'email'},{k:'password',label:'Password',type:'password',placeholder:'••••••••',icon:'lock'}]
    : [{k:'name',label:'Full Name',type:'text',placeholder:'Your Name',icon:'person'},{k:'email',label:'Email',type:'email',placeholder:'your@email.com',icon:'email'},{k:'phone',label:'Phone',type:'tel',placeholder:'+91 98765 43210',icon:'phone'},{k:'password',label:'Password',type:'password',placeholder:'Min 6 characters',icon:'lock'},{k:'confirm',label:'Confirm Password',type:'password',placeholder:'Repeat password',icon:'lock_open'}];

  return (
    <div style={{minHeight:'calc(100vh - 64px)',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,var(--bgd),#e0f2f2)',padding:24}}>
      <div style={{background:'white',borderRadius:'var(--r-xl)',boxShadow:'var(--sh-xl)',padding:40,width:'100%',maxWidth:440,animation:'fadeUp .5s ease'}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
            <span className="material-icons-round" style={{color:'white',fontSize:26}}>local_pharmacy</span>
          </div>
          <h1 style={{fontFamily:'var(--font)',fontWeight:900,fontSize:'1.5rem',color:'#1a2332'}}>
            {mode==='login'?'Welcome Back':'Join Rivaansh'}
          </h1>
          <p style={{color:'var(--ts)',fontSize:'.88rem',marginTop:6}}>
            {mode==='login'?'Sign in to your account':'Create your free account'}
          </p>
        </div>

        {/* Toggle */}
        <div style={{display:'flex',background:'var(--bgd)',borderRadius:'var(--r)',padding:4,marginBottom:24}}>
          {['login','register'].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setErrors({});}} style={{
              flex:1,padding:'9px',border:'none',borderRadius:'var(--r-sm)',cursor:'pointer',
              fontFamily:'var(--font)',fontWeight:700,fontSize:'.87rem',transition:'all var(--tr)',
              background:mode===m?'white':'transparent',
              color:mode===m?'var(--pr)':'var(--ts)',
              boxShadow:mode===m?'var(--sh-sm)':undefined
            }}>{m==='login'?'Sign In':'Sign Up'}</button>
          ))}
        </div>

        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
          {fields.map(f=>(
            <div key={f.k} className="input-group">
              <label className="label">{f.label}</label>
              <div style={{position:'relative'}}>
                <span className="material-icons-round" style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--ts)',fontSize:18}}>{f.icon}</span>
                <input
                  className="input" type={f.type} value={form[f.k]} placeholder={f.placeholder}
                  onChange={e=>set(f.k,e.target.value)}
                  style={{paddingLeft:40,borderColor:errors[f.k]?'var(--er)':undefined}}
                />
              </div>
              {errors[f.k] && <span style={{fontSize:'.78rem',color:'var(--er)'}}>{errors[f.k]}</span>}
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{padding:'13px',fontSize:'1rem',marginTop:6}}>
            {loading ? <span className="spinner" style={{width:18,height:18}} /> : mode==='login'?'Sign In':'Create Account'}
          </button>
        </form>

        <div className="disclaimer" style={{marginTop:16}}>
          <span className="material-icons-round">info</span>
          <span>Your health data is private and secure. We never share personal information.</span>
        </div>
      </div>
    </div>
  );
}
