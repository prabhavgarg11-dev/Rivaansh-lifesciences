# 🤖 Rivaansh Lifesciences — AI Features Documentation

## Overview
Rivaansh Lifesciences includes intelligent clinical AI assistant powered by Google's Gemini AI, with smart fallback mechanisms.

## 🎯 AI Features

### 1. Clinical AI Chat Assistant (Riva)
- **Purpose:** Help patients understand medicines, symptoms, and prescriptions
- **Technology:** Google Gemini 1.5 Flash API
- **Language:** Simple, patient-friendly explanations
- **Medical Compliance:** Always recommends consulting licensed pharmacists

**Endpoint:** `POST /api/ai/chat`

**Request:**
```json
{
  "message": "What is paracetamol used for?",
  "history": [
    {
      "role": "user",
      "parts": [{"text": "Previous question"}]
    },
    {
      "role": "model",
      "parts": [{"text": "Previous answer"}]
    }
  ]
}
```

**Response:**
```json
{
  "reply": "Paracetamol is used to reduce fever and mild to moderate pain..."
}
```

### 2. Context-Aware Conversation
- **Feature:** Maintains conversation history for better context
- **Benefit:** AI remembers previous messages in the conversation
- **Implementation:** Passes chat history with each request

**Example Flow:**
```
User: "What medicines help with cold?"
AI: "For common cold, you might consider... Always consult your doctor."

User: "What about for fever specifically?"
AI: "For fever, paracetamol is commonly used... [remembers they asked about cold]"
```

### 3. AI Status Monitoring
- **Endpoint:** `GET /api/ai/status`
- **Response:**
```json
{
  "available": true,
  "message": "Gemini AI is online",
  "mode": "gemini-1.5-flash"
}
```

### 4. Smart Fallback System
- **If Gemini unavailable:** Falls back to predefined responses
- **Ensures:** App never breaks, always helpful to users
- **Messages:** Clear indication when AI is in fallback mode

---

## 🔧 Setup & Configuration

### 1. Get Gemini API Key

**Step 1:** Go to https://aistudio.google.com/
**Step 2:** Click "Get API Key"
**Step 3:** Create new key for Rivaansh project
**Step 4:** Copy the API key

### 2. Configure Environment

**Development (.env):**
```env
GEMINI_API_KEY=your_development_key_here
NODE_ENV=development
```

**Production (.env.production):**
```env
GEMINI_API_KEY=your_production_key_here
NODE_ENV=production
```

### 3. Verify Setup

```bash
# Test endpoint
curl -X GET http://localhost:5000/api/ai/status

# Expected response
{
  "available": true,
  "message": "Gemini AI is online",
  "mode": "gemini-1.5-flash"
}
```

---

## 💬 Using the AI Chat

### Frontend Integration

**Initialize Chat:**
```javascript
const chatHistory = [];

async function sendAIMessage(userMessage) {
  const response = await fetch(`${API}/api/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      history: chatHistory
    })
  });
  
  const data = await response.json();
  
  // Add to history for context
  chatHistory.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });
  
  chatHistory.push({
    role: 'model',
    parts: [{ text: data.reply }]
  });
  
  return data.reply;
}
```

### Example Interactions

**Question 1:**
```
User: "What should I do if I have a headache?"
AI Response: "A headache can have many causes. Common over-the-counter pain relievers 
include paracetamol (acetaminophen) or ibuprofen. However, I recommend consulting 
your doctor or pharmacist if headaches persist. Always follow dosage instructions..."
```

**Question 2:**
```
User: "Can I take paracetamol with food?"
AI Response: "Yes, paracetamol can generally be taken with food. In fact, taking it 
with food may help reduce stomach upset. Always read the label... Since you asked 
about paracetamol, make sure not to exceed 4000mg per day..."
```

---

## 🧠 AI System Prompt

The AI operates under this clinical system prompt:

```
You are Riva, a clinical AI assistant for Rivaansh Lifesciences, 
a WHO-GMP certified pharmacy in Jaipur, India. 

You help patients understand medicines, symptoms, and prescriptions. 
Always recommend consulting a licensed pharmacist or doctor 
for medical decisions. 

Keep answers clear, concise, and in simple language. 
Never diagnose definitively — always say "this may indicate" 
or "consult your doctor".
```

---

## 📊 Cost Estimation

### Google Gemini API Pricing
- **Pay-as-you-go:** Billed per request
- **Free tier:** 15 requests/minute (generous free quota)
- **Pricing:** $0.075 per 1M tokens (input), $0.30 per 1M tokens (output)

**Example:**
- 1,000 chat requests/month = ~$5-$15/month
- 10,000 requests/month = ~$50-$150/month

### Budget Optimization
1. Cache frequently asked questions
2. Use shorter, efficient prompts
3. Monitor API usage in Google Cloud Console
4. Set up quota alarms

---

## 🚀 Deploying AI Features

### On Render

**Add environment variable in Render dashboard:**
```
GEMINI_API_KEY = paste_your_production_key_here
```

**Verify after deployment:**
```bash
curl https://rivaansh-backend-xxxxx.onrender.com/api/ai/status
```

### On Vercel (Frontend)

The frontend automatically detects the backend's AI status and shows appropriate UI messages.

---

## 🛡️ Security & Rate Limiting

### Best Practices

1. **Never commit API keys to Git**
   ```bash
   # .gitignore
   .env
   .env.production
   .env.local
   ```

2. **Rotate keys regularly**
   - Generate new key every 3 months
   - Invalidate old keys

3. **Monitor API usage**
   - Check Google Cloud Console weekly
   - Set up billing alerts

4. **Rate limiting** (Optional add-on)
   ```javascript
   // Implement in backend
   const rateLimit = require('express-rate-limit');
   
   const aiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.post('/api/ai/chat', aiLimiter, chatHandler);
   ```

---

## 📱 Using AI in Frontend

### Display AI Chat UI

```html
<!-- HTML -->
<div id="aiChat" class="ai-chat-container">
  <div id="chatMessages"></div>
  <input type="text" id="chatInput" placeholder="Ask Riva...">
  <button onclick="sendChat()">Send</button>
</div>
```

```javascript
// JavaScript
const chatHistory = [];

async function sendChat() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Show loading
  showLoadingSpinner();
  
  try {
    const response = await fetch(`${API}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history: chatHistory })
    });
    
    const data = await response.json();
    
    // Update history
    chatHistory.push({ role: 'user', parts: [{ text: message }] });
    chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
    
    // Display response
    displayMessage('user', message);
    displayMessage('ai', data.reply);
    
    input.value = '';
  } catch (error) {
    showError('Failed to get AI response. Try again.');
    console.error(error);
  }
}

function displayMessage(sender, text) {
  const messagesDiv = document.getElementById('chatMessages');
  const messageEl = document.createElement('div');
  messageEl.className = `message message-${sender}`;
  messageEl.textContent = text;
  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
```

---

## 🧪 Testing AI Features

### Manual Testing

```bash
# Test AI Status
curl http://localhost:5000/api/ai/status

# Test Chat (with curl)
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is paracetamol?",
    "history": []
  }'
```

### Frontend Testing

1. Start backend: `npm start` (from backend folder)
2. Open frontend: http://localhost:5500
3. Go to AI Chat section
4. Ask questions and verify responses

---

## 🔍 Monitoring & Troubleshooting

### Check if AI is Working

**Backend logs should show:**
```
🤖 Clinical AI: Gemini AI is online (gemini-1.5-flash)
```

### Common Issues

**Issue:** "AI offline - add GEMINI_API_KEY to .env"
- **Solution:** Check if GEMINI_API_KEY exists in environment

**Issue:** Chat returns generic fallback responses
- **Solution:** Check API key is valid in Google Cloud Console

**Issue:** Rate limit errors
- **Solution:** Implement rate limiting or wait before making more requests

### Logs to Check

**Render:**
- Dashboard → Service → Logs
- Search for "Gemini" or "AI"

**Local Development:**
- Terminal output when running `npm start`

---

## 📈 Future Enhancements

Planned AI features:
- [ ] Symptom checker
- [ ] Drug interaction checker
- [ ] Prescription analyzer
- [ ] Personalized medicine recommendations
- [ ] Multi-language support
- [ ] Voice chat capability

---

## 📞 Support

**For API issues:** https://ai.google.dev
**For billing:** Google Cloud Console
**For feature requests:** Create GitHub issue

---

**Last Updated:** April 9, 2026
**AI Model:** Gemini 1.5 Flash
**Status:** Production Ready ✅
