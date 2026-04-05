import { useState, useRef, useEffect } from 'react';
import api from '../api/api.js';

const SUGGESTIONS = [
  "Which medicine for cold and fever?",
  "Dosage of paracetamol for adults?",
  "What are the side effects of ibuprofen?",
  "Natural remedies for headache?",
  "Is it safe to take antibiotics without a prescription?",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState([{
    role:'assistant',
    content:"Hi! I'm **RivaBot**, your AI health assistant from Rivaansh Lifesciences. I can help you with medicine information, dosage guidance, symptom analysis, and more. What can I help you with today?\n\n⚠️ *Disclaimer: I'm not a medical professional. Always consult a doctor for serious conditions.*"
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const history = messages.map(m=>({role:m.role,content:m.content}));
    setMessages(m=>[...m,{role:'user',content:msg}]);
    setLoading(true);
    const {ok,data} = await api.post('/ai/chat',{message:msg,history});
    setLoading(false);
    setMessages(m=>[...m,{role:'assistant',content:ok?data.reply:'Sorry, AI is unavailable right now. Please try again.'}]);
  };

  const renderContent = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/•/g,'•')
      .replace(/\n/g,'<br/>');
  };

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 64px)',background:'var(--bgd)'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,var(--pr),var(--accent))',padding:'16px 24px',display:'flex',alignItems:'center',gap:14,flexShrink:0}}>
        <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span className="material-icons-round" style={{color:'white',fontSize:24}}>smart_toy</span>
        </div>
        <div>
          <div style={{fontFamily:'var(--font)',fontWeight:800,fontSize:'1.05rem',color:'white'}}>RivaBot — AI Health Assistant</div>
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:2}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:'#4ade80',animation:'pulse 2s infinite'}} />
            <span style={{fontSize:'.75rem',color:'rgba(255,255,255,.8)'}}>Online · Powered by Claude AI</span>
          </div>
        </div>
        <span className="badge badge-ai" style={{marginLeft:'auto'}}>
          <span className="material-icons-round" style={{fontSize:11}}>auto_awesome</span>AI
        </span>
      </div>

      {/* Messages */}
      <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:16}}>
        {/* Suggestions */}
        {messages.length<=1 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',margin:'8px 0'}}>
            {SUGGESTIONS.map(s=>(
              <button key={s} onClick={()=>send(s)} style={{
                padding:'8px 14px',background:'white',border:'1px solid var(--bd)',
                borderRadius:'var(--r-full)',fontSize:'.8rem',cursor:'pointer',
                color:'var(--tm)',fontWeight:500,transition:'all var(--tr)'
              }} onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--pr)';e.currentTarget.style.color='var(--pr)';}}
                 onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--bd)';e.currentTarget.style.color='var(--tm)';}}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m,i)=>(
          <div key={i} style={{display:'flex',gap:10,justifyContent:m.role==='user'?'flex-end':'flex-start',animation:'fadeUp .3s ease'}}>
            {m.role==='assistant' && (
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:4}}>
                <span className="material-icons-round" style={{color:'white',fontSize:17}}>smart_toy</span>
              </div>
            )}
            <div style={{
              maxWidth:'72%',padding:'12px 16px',borderRadius:m.role==='user'?'var(--r-lg) var(--r-lg) 4px var(--r-lg)':'var(--r-lg) var(--r-lg) var(--r-lg) 4px',
              background:m.role==='user'?'var(--pr)':'white',
              color:m.role==='user'?'white':'#1a2332',
              boxShadow:'var(--sh-sm)',fontSize:'.9rem',lineHeight:1.6,
              border:m.role==='assistant'?'1px solid var(--bd2)':undefined
            }} dangerouslySetInnerHTML={{__html:renderContent(m.content)}} />
            {m.role==='user' && (
              <div style={{width:32,height:32,borderRadius:'50%',background:'var(--pr-50)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:4}}>
                <span className="material-icons-round" style={{color:'var(--pr)',fontSize:17}}>person</span>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--pr),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <span className="material-icons-round" style={{color:'white',fontSize:17}}>smart_toy</span>
            </div>
            <div style={{padding:'12px 18px',background:'white',borderRadius:'var(--r-lg) var(--r-lg) var(--r-lg) 4px',boxShadow:'var(--sh-sm)',border:'1px solid var(--bd2)',display:'flex',gap:4,alignItems:'center'}}>
              {[0,1,2].map(j=>(<div key={j} style={{width:7,height:7,borderRadius:'50%',background:'var(--pr)',animation:`pulse 1.2s ${j*0.2}s infinite`}} />))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{padding:'16px 20px',background:'white',borderTop:'1px solid var(--bd)',flexShrink:0}}>
        <div className="disclaimer" style={{marginBottom:12}}>
          <span className="material-icons-round">info</span>
          <span>For emergencies, call 112. AI responses are informational only.</span>
        </div>
        <div style={{display:'flex',gap:10}}>
          <input ref={inputRef} className="input" value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
            placeholder="Ask about medicines, symptoms, dosage..."
            style={{flex:1,borderRadius:'var(--r-full)',padding:'12px 20px'}} />
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            className="btn btn-primary" style={{borderRadius:'var(--r-full)',padding:'12px 20px',flexShrink:0}}>
            <span className="material-icons-round" style={{fontSize:20}}>send</span>
          </button>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
