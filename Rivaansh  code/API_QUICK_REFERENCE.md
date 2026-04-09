# 📡 API QUICK REFERENCE GUIDE

## Quick Links
- **Backend:** http://localhost:5000 (dev) | https://rivaansh-backend-xxxxx.onrender.com (prod)
- **Frontend:** http://localhost:5500 (dev) | https://rivaansh-lifesciences.vercel.app (prod)
- **Database:** mongodb://localhost:27017 (dev) | MongoDB Atlas (prod)

---

## 🏥 Health & Status Endpoints

### Health Check
```bash
GET /api/health
```
**Response:** `{"status": "ok"}`

### AI Status
```bash
GET /api/ai/status
```
**Response:** 
```json
{
  "available": true,
  "message": "Gemini AI is online",
  "mode": "gemini-1.5-flash"
}
```

---

## 🛒 Product Endpoints

### Get All Products
```bash
GET /api/products
```
**Response:**
```json
[
  {
    "_id": "123",
    "name": "Paracetamol 500mg",
    "price": 50,
    "description": "...",
    "category": "Pain Relief",
    "stock": 100
  }
]
```

### Get Single Product
```bash
GET /api/products/:id
```

### Add Product (Admin)
```bash
POST /api/products
Content-Type: application/json

{
  "name": "Medicine Name",
  "price": 100,
  "description": "Description",
  "category": "Category",
  "stock": 50
}
```

### Update Product (Admin)
```bash
PUT /api/products/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 120,
  "stock": 80
}
```

### Delete Product (Admin)
```bash
DELETE /api/products/:id
```

---

## 👤 Authentication Endpoints

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "123",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register

### Logout (Frontend)
```javascript
localStorage.removeItem('authToken');
localStorage.removeItem('user');
```

---

## 🛍️ Cart Endpoints

### Get Cart
```bash
GET /api/cart
Authorization: Bearer token
```

**Response:**
```json
{
  "items": [
    {
      "productId": "123",
      "name": "Paracetamol",
      "price": 50,
      "quantity": 2,
      "total": 100
    }
  ],
  "total": 100
}
```

### Add to Cart
```bash
POST /api/cart
Authorization: Bearer token
Content-Type: application/json

{
  "productId": "123",
  "quantity": 2
}
```

### Update Cart Item
```bash
PUT /api/cart/:itemId
Authorization: Bearer token

{
  "quantity": 3
}
```

### Remove from Cart
```bash
DELETE /api/cart/:itemId
Authorization: Bearer token
```

### Clear Cart
```bash
DELETE /api/cart
Authorization: Bearer token
```

---

## 📦 Order Endpoints

### Create Order
```bash
POST /api/orders
Authorization: Bearer token
Content-Type: application/json

{
  "items": [
    {
      "productId": "123",
      "quantity": 2,
      "price": 50
    }
  ],
  "total": 100,
  "address": "123 Street, City",
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "_id": "order_123",
  "userId": "user_123",
  "status": "pending",
  "total": 100,
  "createdAt": "2026-04-09T..."
}
```

### Get My Orders
```bash
GET /api/orders
Authorization: Bearer token
```

### Get Order Details
```bash
GET /api/orders/:orderId
Authorization: Bearer token
```

### Cancel Order
```bash
PUT /api/orders/:orderId/cancel
Authorization: Bearer token
```

---

## 💬 AI Chat Endpoints

### Get AI Status
```bash
GET /api/ai/status
```

### Chat with AI
```bash
POST /api/ai/chat
Content-Type: application/json

{
  "message": "What is paracetamol?",
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
  "reply": "Paracetamol is used for... Always consult your doctor."
}
```

---

## ⚕️ Prescription Endpoints

### Upload Prescription
```bash
POST /api/prescriptions
Authorization: Bearer token
Content-Type: multipart/form-data

{
  "prescription": [file],
  "doctorName": "Dr. Smith",
  "date": "2026-04-09"
}
```

### Get My Prescriptions
```bash
GET /api/prescriptions
Authorization: Bearer token
```

### Delete Prescription
```bash
DELETE /api/prescriptions/:prescriptionId
Authorization: Bearer token
```

---

## 🔐 Authentication

### Token Usage
Add to all authenticated requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Token Storage (Frontend)
```javascript
// Stored in localStorage
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Token Refresh
Tokens expire after 7 days. User must login again.

---

## ❌ Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | Request worked |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request format |
| 401 | Unauthorized | Login required, invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Contact support |
| 503 | Service Unavailable | Server down, try later |

### Error Response Format
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## 🧪 Testing Examples

### Test with cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Get Products:**
```bash
curl http://localhost:5000/api/products
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Chat with AI:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is paracetamol?",
    "history": []
  }'
```

### Test with Browser Console
```javascript
// Fetch API
fetch('/api/products')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(e => console.error(e));

// With authentication
fetch('/api/orders', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## 📊 Rate Limiting

Current limits (can be enforced):
- **General requests:** No limit
- **Login attempts:** 5 per minute per IP
- **AI requests:** 100 per 15 minutes per IP

---

## 🔄 Pagination (Optional)

Not yet implemented. Can add:
```bash
GET /api/products?page=1&limit=10&sort=price&order=asc
```

---

## 📝 Webhook Events (Future)

Planned webhooks for:
- Order created
- Order shipped
- Payment received
- User registered

---

## 🛠️ Troubleshooting

**API not responding?**
```bash
# Check server is running
curl http://localhost:5000/api/health

# Check backend logs
# Look for errors in terminal where npm start is running
```

**CORS error?**
```
Origin not allowed
→ Check CORS_ORIGINS in .env
→ Add your frontend URL to CORS_ORIGINS
→ Restart server
```

**Token invalid?**
```
401 Unauthorized
→ Login again to get new token
→ Check token is sent in Authorization header
→ Check token hasn't expired
```

**Database error?**
```
MongoDB connection failed
→ Check MongoDB is running
→ Check MONGO_URI string is correct
→ Check network connection to MongoDB Atlas
```

**AI not working?**
```
Gemini API error
→ Check GEMINI_API_KEY in environment
→ Check API key is valid in Google Cloud
→ Check API key has Generative API enabled
```

---

## 📱 Frontend API Base URL

The frontend automatically detects and uses correct API:

```javascript
// From script.js
function getAPIBase() {
  // Render: https://xxx.onrender.com
  if (hostname.includes('onrender.com')) {
    return 'https://' + hostname.replace('frontend', 'backend');
  }
  // Vercel: https://xxx.vercel.app (API at Render)
  if (hostname.includes('vercel.app')) {
    return 'https://rivaansh-backend-xxxxx.onrender.com';
  }
  // Local: http://localhost:5000
  return 'http://localhost:5000';
}
```

---

## 📚 Full Documentation

- **Deployment Guide:** PRODUCTION_DEPLOYMENT_GUIDE_FINAL.md
- **Production Readiness:** PRODUCTION_READINESS_CHECKLIST.md
- **AI Features:** AI_FEATURES_GUIDE.md
- **API Responses:** API_RESPONSES.md
- **README:** README.md

---

## 🚀 Quick Start

1. **Backend**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend**
   ```bash
   Open frontend/index.html in browser
   OR
   npm install -g http-server
   http-server frontend
   ```

3. **Test**
   ```bash
   curl http://localhost:5000/api/health
   curl http://localhost:5000/api/products
   curl http://localhost:5000/api/ai/status
   ```

---

**Last Updated:** April 9, 2026
**Status:** Production Ready ✅
**Next Review:** May 9, 2026
