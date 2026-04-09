# COMPREHENSIVE TESTING CHECKLIST

## Pre-Deployment Testing (Local)

Run these tests locally before pushing to production.

### TEST SUITE 1: Frontend Module Loading ✅

**Goal:** Verify all JavaScript modules load in correct order without errors

**Steps:**
1. Start local backend: `npm run dev` in `backend/` folder
2. Start local frontend: `npm start` in `frontend/` folder  
3. Open http://localhost:3000 in browser
4. Press F12 to open Developer Tools
5. Go to Console tab
6. Check for any RED error messages

**Expected Result:**
- ✅ No console errors
- ✅ Message similar to: "✅ API service initialized"
- ✅ Products load on homepage

**If Failed:**
```javascript
// Run in console to debug
console.log('Module status:')
console.log('api:', typeof api)
console.log('_user:', _user)
console.log('_cart:', _cart.length)
console.log('_chatHistory:', _chatHistory.length)
```

---

### TEST SUITE 2: Chat History Feature ✅

**Goal:** Verify AI chat maintains conversation context

**Steps:**
1. Click "AI Tools" in navbar
2. Open the chatbot (bottom right corner)
3. Type: "I have a headache"
4. Wait for AI response
5. Then type: "What should I take?"
6. Check that response is relevant to headache (showing context awareness)

**Expected Result:**
- ✅ First message gets response about headache remedies
- ✅ Second message references your headache (context aware)
- ✅ Chat history array grows with each exchange

**Verification in Console:**
```javascript
console.log('Chat history length:', _chatHistory.length)
console.log('Last 2 messages:', JSON.stringify(_chatHistory.slice(-2), null, 2))
```

**If Failed:**
- Check backend logs for Gemini API errors
- Verify GEMINI_API_KEY is set: `echo $GEMINI_API_KEY`
- Check /api/ai/status endpoint: `curl http://localhost:5000/api/ai/status`

---

### TEST SUITE 3: Medicine Reminders ✅

**Goal:** Verify notification system works and requests permission

**Steps:**
1. Open browser console (F12)
2. Copy-paste this code:
```javascript
window.setMedicineReminder('Aspirin 500mg', '14:30');
```
3. Browser should popup: "Allow notifications from localhost?"
4. Click "Allow"
5. Should see toast: "Reminder set for Aspirin 500mg at 14:30"
6. Check localStorage:
```javascript
console.log(JSON.parse(localStorage.getItem('rv_reminders')))
```

**Expected Result:**
- ✅ Browser permission dialog appears
- ✅ Success toast notification shows
- ✅ Reminder stored in localStorage under `rv_reminders` key
- ✅ Reminder object has: `{medicine, time, id}`

**If Failed:**
- Browser permissions not granted (check URL bar icon)
- Check console for JavaScript errors
- Try in incognito window if in-private mode blocks notifications

---

### TEST SUITE 4: Order Timeline Visualization ✅

**Goal:** Verify order status timeline displays correctly

**Steps:**
1. Go to "My Orders" page
2. If no orders exist, create a test order (add item to cart, checkout)
3. Look at each order card
4. Verify visual timeline shows 5 stages:
   - ⏱️ pending
   - ✓ confirmed  
   - 🚚 dispatched
   - 📍 out_for_delivery
   - 🏠 delivered

**Expected Result:**
- ✅ Timeline row visible in each order card
- ✅ Current status highlighted in teal
- ✅ Past statuses filled/colored, future statuses grayed out
- ✅ Icons display correctly next to status labels

**Visual Test in Console:**
```javascript
// Check if timeline div exists in order cards
console.log(document.querySelectorAll('.order-card').length, 'order cards found')
document.querySelectorAll('[style*="out_for_delivery"]').length > 0 ? 
  console.log('✓ Timeline HTML present') : 
  console.log('✗ Timeline not found')
```

**If Failed:**
- HTML element with timeline not rendering
- Check `renderOrders()` function includes FEATURE 3
- Verify no CSS conflicts hiding timeline
- Check browser console for HTML parsing errors

---

### TEST SUITE 5: AI Search Autocomplete ✅

**Goal:** Verify AI search provides autocomplete when no local match

**Steps:**
1. Go to "Shop Medicines" (Products page)
2. Type in search box: "Cough medicine brands not in our database"
3. Wait 500ms (after debounce)
4. Look for highlighted card above search results with "💡 AI Insight:"
5. Card should contain clinical information about cough medicines

**Expected Result:**
- ✅ After 500ms delay, AI Insight card appears
- ✅ Card shows medicine recommendations/information
- ✅ Local search results still show if any partial matches
- ✅ No page errors

**Detailed Test:**
```javascript
// Manually trigger AI search
const aiContainer = document.getElementById('aiSearchContainer')
if (aiContainer) {
  console.log('✓ AI container exists')
  console.log('AI container content:', aiContainer.innerHTML)
} else {
  console.log('✗ AI container not found in page')
}
```

**If Failed:**
- Check backend `/api/ai/medicine-info` endpoint returns data:
```bash
curl -X POST http://localhost:5000/api/ai/medicine-info \
  -H "Content-Type: application/json" \
  -d '{"medicine":"Aspirin"}'
```
- Verify `attachSearch()` function includes FEATURE 4 code
- Check for CORS errors in browser console Network tab

---

### TEST SUITE 6: Backend Routes ✅

**Goal:** Verify all new API routes work correctly

**Steps in Terminal:**

**6A) Test Cart Endpoint:**
```bash
# Test GET /api/cart
curl -H "Authorization: Bearer test_token" \
  http://localhost:5000/api/cart

# Should return: {"items":[],"total":0,"message":"Cart fetched successfully"}

# Test POST /api/cart  
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"id":1,"qty":2}],"total":500}'

# Should return: {"success":true,"message":"Cart synced successfully",...}
```

**6B) Test Orders Endpoint:**
```bash
# Test GET /api/orders
curl -H "Authorization: Bearer test_token" \
  http://localhost:5000/api/orders

# Should return: [ {order1}, {order2}, ... ]

# Test GET /api/orders/:id (replace with real order ID)
curl -H "Authorization: Bearer test_token" \
  http://localhost:5000/api/orders/ORDER_ID_HERE

# Should return: {_id, status, items, totalAmount, ...}
```

**6C) Test Auth Middleware:**
```bash
# Without token - should get 401
curl http://localhost:5000/api/orders

# Should return: {"message":"No authentication token provided"}
```

**6D) Test Health Check:**
```bash
curl http://localhost:5000/api/health

# Should return: {"status":"ok","dbConnected":true}
```

**Expected Results - All Should Succeed ✅**
- Cart endpoint returns 200 with cart data
- Orders endpoint returns 200 with orders array
- Missing auth token returns 401
- Health check returns with database status

**If Failed:**
- Check server.js for syntax errors: `npm run dev` should show compile errors
- Verify middleware order: requireAuth must be before handler
- Check MongoDB connection: `mongodb.com/atlas` → check IP whitelist

---

### TEST SUITE 7: CORS Configuration ✅

**Goal:** Verify CORS headers are correct for development

**Steps:**
1. Open browser DevTools Network tab (F12)
2. Make any API request (e.g., /api/products)
3. Click on the request in Network tab
4. Go to "Response Headers" section
5. Look for headers like:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Credentials: true`

**Expected Result:**
- ✅ CORS headers present
- ✅ No "blocked by CORS" errors in Console
- ✅ OPTIONS preflight requests return 200

**Test from Console:**
```javascript
fetch('http://localhost:5000/api/products', {credentials: 'include'})
  .then(r => {
    console.log('Status:', r.status)
    console.log('CORS Access-Control-Allow-Origin:', r.headers.get('Access-Control-Allow-Origin'))
    return r.json()
  })
  .then(d => console.log('✓ CORS working, got', d.length, 'products'))
```

**If Failed:**
- Check backend/server.js CORS configuration
- Verify origin includes `http://localhost:3000`
- Restart backend after CORS changes

---

### TEST SUITE 8: Gemini API Integration ✅

**Goal:** Verify Gemini AI is working correctly

**Steps in Terminal:**

**8A) Check API Key Format:**
```bash
# Should show NO quotes and NO spaces
echo $GEMINI_API_KEY
```

Expected: `AIzaSyDuE_k62VJSmitops86CaTZkCSR8EJTFIM`  
❌ NOT: `"AIzaSyDuE_k62VJSmitops86CaTZkCSR8EJTFIM"` (with quotes)

**8B) Test AI Status Endpoint:**
```bash
curl http://localhost:5000/api/ai/status
```

Expected:
```json
{"available":true,"message":"Gemini AI is online","mode":"gemini-1.5-flash"}
```

**8C) Test Chat with History:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is paracetamol?",
    "history": [{
      "role": "user",
      "parts": [{"text": "I have a fever"}]
    }]
  }'
```

Expected: JSON response with `{"reply": "Clinical information about paracetamol..."}`

**8D) Test Medicine Info (for search autocomplete):**
```bash
curl -X POST http://localhost:5000/api/ai/medicine-info \
  -H "Content-Type: application/json" \
  -d '{"medicine": "Ibuprofen"}'
```

Expected: JSON with both `result` and `info` fields

**Expected Results - All Should Return Data ✅**
- Status endpoint returns `available: true`
- Chat endpoint returns reply text
- Medicine info endpoint returns information

**If Failed:**
```
Error: "Invalid API key"
→ Check GEMINI_API_KEY has no quotes
→ Verify in backend/.env file

Error: "Rate limit exceeded"  
→ Wait 60 seconds, retry

Error: "API not available"
→ Check internet connection
→ Verify Gemini API is enabled in Google Cloud console
```

---

## Production Testing Checklist

After deploying to Render/Vercel:

### P1: Health Check
```javascript
fetch('https://rivaansh-lifesciences.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d.status === 'ok' ? '✓ Backend OK' : '✗ Backend Error'))
```

### P2: Gemini AI Online
```javascript
fetch('https://rivaansh-lifesciences.onrender.com/api/ai/status')
  .then(r => r.json())
  .then(d => console.log(d.available ? '✓ Gemini Online' : '✗ Gemini Offline'))
```

### P3: Products Load
```javascript
fetch('https://rivaansh-lifesciences.onrender.com/api/products')
  .then(r => r.json())
  .then(d => console.log('✓ Products:', d.length, 'available'))
```

### P4: Chat Works
Visit https://rivaansh-lifesciences.vercel.app and manually:
1. Click AI Tools
2. Type a message in chatbot
3. Verify response arrives in <5 seconds

### P5: Orders Timeline
Visit Orders page and verify timeline displays correctly

### P6: No Console Errors
Press F12, check Console tab for any RED error messages

---

## Debugging Commands

If something fails, run these diagnostic commands:

```bash
# Check backend logs
tail -f ~/.render/logs/* 2>/dev/null || echo "Logs location varies by OS"

# Test MongoDB connection
npm test  # if test suite exists

# Check Node version (must be 16+)
node --version

# Verify packages installed
npm list | grep "gemini\|express\|mongoose"

# Test individual endpoint
curl -v http://localhost:5000/api/health

# Check for syntax errors
npm run build  # if build script exists
```

---

## Final Sign-Off ✅

When all tests pass:

```javascript
const results = {
  modulesLoad: true,
  chatHistoryWorks: true,
  medicineRemindersWork: true,
  orderTimelineShows: true,
  aiSearchWorks: true,
  backendRoutesRespond: true,
  corsConfigured: true,
  geminiIntegrated: true
}

console.log('✅ ALL TESTS PASSED') if Object.values(results).every(v => v === true)
```

**Ready for Production? Submit this checklist to team lead before deployment.**

---

**Test Suite Version:** 1.0  
**Last Updated:** April 9, 2026  
**Maintainer:** Rivaansh Lifesciences Development Team
