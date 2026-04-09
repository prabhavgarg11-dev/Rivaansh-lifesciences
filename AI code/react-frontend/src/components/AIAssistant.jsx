import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, Loader2, Activity, Pill, Stethoscope, X, Maximize2, Minimize2 } from 'lucide-react';
import { sendChatMessage, analyzeSymptoms, getMedicineInfo } from '../services/api';
import './AIAssistant.css';

const QUICK_ACTIONS = [
  { id: 'cold', label: '🤧 Cold & Flu', message: 'I have cold and fever symptoms, what should I take?' },
  { id: 'pain', label: '💊 Pain Relief', message: 'Which Rivaansh product helps with joint and muscle pain?' },
  { id: 'immunity', label: '🛡️ Immunity', message: 'Which product helps boost immunity?' },
  { id: 'order', label: '📦 Orders', message: 'How can I track my order?' },
];

const TypingIndicator = () => (
  <div className="ai-chat-message ai-message typing">
    <div className="ai-avatar-sm"><Bot size={16} /></div>
    <div className="message-bubble">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </div>
  </div>
);

const AIAssistant = () => {
  const [expanded, setExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Hello! 👋 I'm the Rivaansh Clinical AI Assistant. I can help you find the right medicines, check symptoms, or answer health queries. How may I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState('chat'); // 'chat' | 'symptom' | 'medicine'
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const addMessage = (role, text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role,
      text,
      timestamp: new Date()
    }]);
  };

  const handleSend = async (messageText = input) => {
    const msg = messageText.trim();
    if (!msg || isTyping) return;

    setInput('');
    addMessage('user', msg);
    setIsTyping(true);

    try {
      let response;
      if (mode === 'symptom') {
        response = await analyzeSymptoms(msg);
        addMessage('assistant', response.result);
      } else if (mode === 'medicine') {
        response = await getMedicineInfo(msg);
        addMessage('assistant', response.result);
      } else {
        response = await sendChatMessage(msg);
        addMessage('assistant', response.reply);
      }
    } catch {
      addMessage('assistant', "I'm having trouble connecting to the server right now. Please try again in a moment, or call us at +91 8426033033 for immediate assistance.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="section ai-section" id="ai-assistant">
      <div className="container ai-container">
        {/* Left: Info */}
        <div className="ai-content">
          <div className="ai-badge">
            <Sparkles size={16} className="sparkle-icon" />
            <span>AI-Powered Innovation</span>
          </div>
          <h2 className="ai-title">Meet Your Intelligent Healthcare Companion</h2>
          <p className="ai-description">
            Experience the future of medical consultation. Our advanced Gemini-powered AI clinical assistant is available 24/7 to provide personalized health insights, answer medicine queries, and guide your healthcare journey.
          </p>

          <ul className="ai-features">
            <li><div className="feature-marker"><Activity size={16} /></div><span>Symptom analysis & triage</span></li>
            <li><div className="feature-marker"><Pill size={16} /></div><span>Medicine info & drug interactions</span></li>
            <li><div className="feature-marker"><Stethoscope size={16} /></div><span>Prescription guidance</span></li>
            <li><div className="feature-marker"><Bot size={16} /></div><span>Medication reminders & order tracking</span></li>
          </ul>

          <div className="ai-mode-selector">
            <p className="mode-label">Select AI Mode:</p>
            <div className="mode-btns">
              <button
                className={`mode-btn ${mode === 'chat' ? 'active' : ''}`}
                onClick={() => setMode('chat')}
              >💬 General Chat</button>
              <button
                className={`mode-btn ${mode === 'symptom' ? 'active' : ''}`}
                onClick={() => setMode('symptom')}
              >🩺 Symptom Check</button>
              <button
                className={`mode-btn ${mode === 'medicine' ? 'active' : ''}`}
                onClick={() => setMode('medicine')}
              >💊 Medicine Info</button>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg ai-btn"
            onClick={() => setChatOpen(true)}
          >
            <Bot size={20} /> Open AI Chat
          </button>
        </div>

        {/* Right: Inline Chat Widget */}
        <div className="ai-visual">
          <div className={`ai-chat-widget ${expanded ? 'expanded' : ''}`}>
            {/* Chat Header */}
            <div className="ai-chat-header">
              <div className="ai-chat-header-info">
                <div className="ai-status-dot"></div>
                <div className="ai-avatar"><Bot size={20} /></div>
                <div>
                  <h4>Rivaansh Clinical AI</h4>
                  <span>Powered by Gemini · Online</span>
                </div>
              </div>
              <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
                {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
            </div>

            {/* Mode indicator */}
            <div className="ai-mode-indicator">
              Mode: <strong>{mode === 'chat' ? '💬 General Chat' : mode === 'symptom' ? '🩺 Symptom Analysis' : '💊 Medicine Info'}</strong>
            </div>

            {/* Messages */}
            <div className="ai-messages-container">
              {messages.map(msg => (
                <div key={msg.id} className={`ai-chat-message ${msg.role === 'assistant' ? 'ai-message' : 'user-message'}`}>
                  {msg.role === 'assistant' && (
                    <div className="ai-avatar-sm"><Bot size={14} /></div>
                  )}
                  <div className="message-bubble">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                  </div>
                  {msg.role === 'user' && (
                    <div className="user-avatar-sm"><User size={14} /></div>
                  )}
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick actions */}
            {messages.length <= 1 && (
              <div className="quick-actions">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.id}
                    className="quick-action-btn"
                    onClick={() => handleSend(action.message)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="ai-input-area">
              <textarea
                ref={inputRef}
                className="ai-input"
                rows={1}
                placeholder={
                  mode === 'symptom' ? 'Describe your symptoms...' :
                  mode === 'medicine' ? 'Enter medicine name...' :
                  'Ask about medicines, health, orders...'
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={`send-btn ${isTyping ? 'disabled' : ''}`}
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
              >
                {isTyping ? <Loader2 size={20} className="spin-icon" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIAssistant;
