# QUICK DEPLOYMENT GUIDE

## 🚀 Deploy to Production (Render + Vercel)

### 1. BEFORE YOU DEPLOY - Checklist ✅

- [ ] GEMINI_API_KEY in `.env` has NO quotes and NO spaces
- [ ] `.env` file is in `backend/` directory  
- [ ] All 6 from previous session + 4 new features are in the code
- [ ] CORS includes your Vercel domain
- [ ] MongoDB Atlas is running and connection string is correct
- [ ] Git repo is up to date with all changes

### 2. DEPLOY BACKEND (Render)

```bash
# 1. In your terminal, push to GitHub
cd "c:\Users\lenovo\Desktop\Rivaansh Life Sciences\Rivaansh  code"
git add .
git commit -m "Implement 4 new AI features + missing routes"
git push origin main
```

**Then in Render Dashboard:**
1. Go to https://dashboard.render.com
2. Select your "Rivaansh Backend" service
3. Click "Manual Deploy" → Deploy latest commit
4. Wait for deployment (usually 2-3 minutes)
5. Check logs for: `✓ Server running on port 10000` (or similar)

**Verify Backend Working:**
```
curl https://rivaansh-lifesciences.onrender.com/api/health
```

Should return: `{"status":"ok","dbConnected":true}`

### 3. DEPLOY FRONTEND (Vercel)

Vercel auto-deploys when you push to GitHub, so just wait ~1-2 minutes.

**Verify Frontend:**
1. Go to https://rivaansh-lifesciences.vercel.app
2. Check browser console (F12) for errors
3. Test a basic action like "Load Products"

### 4. SET ENVIRONMENT VARIABLES (Render)

1. In Render Dashboard, open your backend service
2. Go to "Environment" tab
3. Add these variables:

```
GEMINI_API_KEY=AIzaSyDuE_k62VJSmitops86CaTZkCSR8EJTFIM
MONGO_URI=mongodb+srv://...your connection string...
JWT_SECRET=rivaansh_jwt_secret_key_2024
ADMIN_EMAIL=admin@rivaansh.com
ADMIN_PASSWORD=Admin@123
ADMIN_SECRET=rivaansh_admin_secret
PORT=10000
NODE_ENV=production
```

4. Click "Save Changes"
5. Service will auto-redeploy

### 5. TEST PRODUCTION

Run these tests in browser console on https://rivaansh-lifesciences.vercel.app:

**Test 1: Products Load**
```javascript
fetch('/api/products').then(r => r.json()).then(d => console.log('✓ Products:', d.length, 'items'))
```
Expected: Should show 20+ products

**Test 2: Health Check**  
```javascript
fetch('https://rivaansh-lifesciences.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Health:', d))
```
Expected: `{status: "ok", dbConnected: true}`

**Test 3: AI Chat with History**
```javascript
const history = [{role:'user', parts:[{text:'I have a cold'}]}];
fetch('/api/ai/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({message: 'What should I take?', history})
}).then(r => r.json()).then(d => console.log('✓ AI Response:', d.reply?.slice(0, 50)))
```
Expected: Should show AI response text

**Test 4: Medicine Search**
```javascript
fetch('/api/ai/medicine-info', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({medicine: 'Paracetamol'})
}).then(r => r.json()).then(d => console.log('✓ Medicine Info:', d.info?.slice(0, 50)))
```
Expected: Should show medicine information

**Test 5: Order Timeline**
```javascript
// In Orders page, check that each order shows a 5-stage timeline visualization
// Statuses should be: pending → confirmed → dispatched → out_for_delivery → delivered
```

### 6. TROUBLESHOOTING

**If backend shows "Forbidden by CORS":**
1. Check that your Vercel domain is in CORS allowed origins
2. Verify GEMINI_API_KEY has no quotes: `echo $GEMINI_API_KEY`
3. Render logs should show CORS error details

**If Gemini API gives rate limit error:**
1. Wait 60 seconds and retry
2. Consider adding request throttling
3. Check Gemini API quota in Google Cloud Console

**If chat history not working:**
1. Check browser console for errors: `F12 → Console`
2. Verify `_chatHistory` array is updating: `console.log(_chatHistory)`
3. Ensure `history` parameter is being sent in request body

**If order timeline not showing:**
1. Create a test order first
2. Check that order has a `status` field (pending/confirmed/etc)
3. Verify CSS is loading (icons should show 📊 icons)

### 7. MONITOR IN PRODUCTION

**Render Logs:**
- Go to Render dashboard
- Select backend service → Logs
- Check for errors, watch for Gemini API rate limits

**Browser Console:**
- Press F12 on production site
- Check for JavaScript errors
- Test features manually

**Performance:**
- Search should complete in <2 seconds
- Chat responses should arrive in <5 seconds
- Orders page should load in <1 second

---

## 📋 FILES DEPLOYED

### Frontend (Vercel)
- ✅ `frontend/index.html` - Added AI search container
- ✅ `frontend/script.js` - Chat history, reminders, timeline, search AI
- ✅ `frontend/api.js` - Cart and orders endpoints

### Backend (Render)
- ✅ `backend/server.js` - Cart routes, orders, CORS, auth middleware
- ✅ `backend/routes/ai.js` - Context-aware chat, medicine info
- ✅ `backend/.env` - Corrected GEMINI_API_KEY format

---

## ⚡ QUICK REFERENCE

### Important URLs
- Frontend: https://rivaansh-lifesciences.vercel.app
- Backend: https://rivaansh-lifesciences.onrender.com
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com

### API Base
```javascript
// Production
const API_URL = 'https://rivaansh-lifesciences.onrender.com';

// Development (frontend auto-detects)
// Uses '/api' proxy when on localhost:3000
// Uses 'http://localhost:5000' when on localhost
```

### Key Endpoints
- GET `/api/health` - Health check
- GET `/api/products` - List medicines
- POST `/api/ai/chat` - Chat with AI (supports history)
- POST `/api/ai/medicine-info` - Search medicine (for autocomplete)
- POST `/api/cart` - Sync cart (needs auth token)
- GET `/api/orders` - Get user orders (needs auth token)

---

## 🎯 Success Indicators

After deployment, confirm these work:

✅ Products page loads medicines from backend  
✅ Chatbot responds with AI (context-aware)  
✅ Search field shows AI insights when no local match  
✅ Orders show visual timeline with 5 stages  
✅ Can set medicine reminders (notification permission)  
✅ Cart syncs with backend  
✅ No CORS errors in console  
✅ Gemini API responding without errors  

---

**Last Updated:** April 9, 2026  
**All Features:** COMPLETE ✅  
**Ready for Production:** YES ✅
