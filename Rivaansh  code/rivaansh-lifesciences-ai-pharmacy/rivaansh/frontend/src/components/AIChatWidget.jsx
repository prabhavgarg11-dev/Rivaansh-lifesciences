import { useState, useRef, useEffect } from 'react';
import api from '../api/api.js';

const DISCLAIMER = 'AI suggestions are not a substitute for professional medical advice. Always consult a qualified healthcare provider.';

export default function AIChatWidget({ floating = true }) {
  const [open, setOpen]       = useState(!floating);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: '👋 Hi! I\'m **RivaBot**, your AI health assistant.\n\nI can help you with:\n• Medicine information & dosage\n• Symptom assessment\n• Drug interactions\n• Health tips\n\nHow can I help you today?'
  }]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [hasNew, setHasNew]   = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasNew(false);
    }
  }, [messages, open]);

  const QUICK = [
    'Which medicine for cold & fever?',
    'Paracetamol dosage for adults',
    'Side effects of Azithromycin',
    'Vitamin C benefits',
  ];

  const sendMsg = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    const { ok, data } = await api.post('/ai/chat', {
      message: msg,
      history: messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
    });

    const reply = ok ? data.reply : '⚠️ Sorry, AI assistant is temporarily unavailable. Please try again.';
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);

    if (floating && !open) setHasNew(true);
  };

  const renderContent = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
      .replace(/^• /gm, '&bull; ');
  };

  const chatPanel = (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'white', borderRadius: floating ? 'var(--r-xl)' : 'var(--r-lg)',
      boxShadow: floating ? 'var(--sh-xl)' : 'none',
      border: floating ? 'none' : '1px solid var(--bd)',
      overflow: 'hidden',
      height: floating ? 520 : '100%',
      width: floating ? 360 : '100%',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--pr), var(--accent))',
        padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-icons-round" style={{ color: 'white', fontSize: 20 }}>smart_toy</span>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font)', fontWeight: 800, color: 'white', fontSize: '.95rem', lineHeight: 1 }}>
              RivaBot
            </p>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.8)', marginTop: 2 }}>
              AI Health Assistant
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,.2)', padding: '2px 8px',
            borderRadius: 'var(--r-full)', marginLeft: 4
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '.65rem', color: 'white', fontWeight: 600 }}>Online</span>
          </div>
        </div>
        {floating && (
          <button onClick={() => setOpen(false)} style={{
            background: 'rgba(255,255,255,.2)', border: 'none',
            borderRadius: 8, padding: 4, cursor: 'pointer', color: 'white',
            display: 'flex'
          }}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>close</span>
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '8px 14px', background: '#fef3c7',
        fontSize: '.7rem', color: '#78350f',
        borderBottom: '1px solid #fde68a',
        display: 'flex', gap: 6, alignItems: 'flex-start'
      }}>
        <span className="material-icons-round" style={{ fontSize: 13, marginTop: 1, flexShrink: 0 }}>warning</span>
        {DISCLAIMER}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 8, alignItems: 'flex-end'
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg,var(--pr),var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="material-icons-round" style={{ color: 'white', fontSize: 14 }}>smart_toy</span>
              </div>
            )}
            <div style={{
              maxWidth: '78%',
              padding: '10px 13px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg,var(--pr),var(--accent))'
                : 'var(--bgd)',
              color: msg.role === 'user' ? 'white' : '#1a2332',
              fontSize: '.84rem',
              lineHeight: 1.55,
              boxShadow: '0 1px 4px rgba(0,0,0,.08)'
            }}
              dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
            />
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--pr),var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <span className="material-icons-round" style={{ color: 'white', fontSize: 14 }}>smart_toy</span>
            </div>
            <div style={{
              padding: '10px 14px', background: 'var(--bgd)',
              borderRadius: '14px 14px 14px 4px',
              display: 'flex', gap: 5, alignItems: 'center'
            }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--pr)', animation: `pulse 1.2s ${j * .2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 14px 10px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => sendMsg(q)} style={{
              padding: '5px 10px', background: 'var(--pr-50)',
              border: '1px solid var(--bd)', borderRadius: 'var(--r-full)',
              fontSize: '.72rem', color: 'var(--pr)', fontWeight: 600, cursor: 'pointer'
            }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '10px 14px', borderTop: '1px solid var(--bd)',
        display: 'flex', gap: 8, alignItems: 'flex-end'
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
          placeholder="Ask about medicines, symptoms…"
          rows={1}
          disabled={loading}
          style={{
            flex: 1, padding: '10px 12px',
            background: 'var(--bgd)', border: '2px solid var(--bd)',
            borderRadius: 'var(--r)', resize: 'none',
            fontSize: '.85rem', lineHeight: 1.4,
            maxHeight: 100, transition: 'border-color var(--tr)',
            color: '#1a2332', fontFamily: 'var(--body)'
          }}
          onFocus={e => e.target.style.borderColor = 'var(--pr)'}
          onBlur={e => e.target.style.borderColor = 'var(--bd)'}
        />
        <button
          onClick={() => sendMsg()}
          disabled={loading || !input.trim()}
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: input.trim() ? 'var(--pr)' : 'var(--bgd)',
            border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all var(--tr)', flexShrink: 0
          }}>
          {loading
            ? <div className="spinner" style={{ width: 16, height: 16 }} />
            : <span className="material-icons-round" style={{ color: input.trim() ? 'white' : 'var(--ts)', fontSize: 20 }}>send</span>
          }
        </button>
      </div>
    </div>
  );

  if (!floating) return chatPanel;

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: 24, right: 24, zIndex: 999,
            width: 58, height: 58, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--pr), var(--accent))',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,103,103,.4)',
            transition: 'all var(--tr-lg)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="material-icons-round" style={{ color: 'white', fontSize: 26 }}>smart_toy</span>
          {hasNew && (
            <div style={{
              position: 'absolute', top: 4, right: 4,
              width: 12, height: 12, borderRadius: '50%',
              background: '#ef4444', border: '2px solid white'
            }} />
          )}
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          animation: 'fadeUp .3s ease'
        }}>
          {chatPanel}
        </div>
      )}
    </>
  );
}
