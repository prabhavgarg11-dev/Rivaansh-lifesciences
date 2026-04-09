# 🚀 Rivaansh Lifesciences — Production Deployment Guide

## Overview
This guide helps you deploy the Rivaansh Lifesciences platform to production on **Render** (backend) and **Vercel** (frontend).

## Architecture
```
┌─────────────────┐         ┌──────────────────┐         ┌────────────────┐
│  Frontend       │         │  Backend         │         │  Database      │
│  (Vercel)       │────────▶│  (Render)        │────────▶│  (MongoDB)     │
│                 │         │                  │         │                │
│ Node.js + React │  HTTPS  │  Express.js      │  TCP    │  Cloud Atlas   │
└─────────────────┘         └──────────────────┘         └────────────────┘
                                    │
                                    ▼
                            ┌──────────────────┐
                            │  AI Services     │
                            │  (Gemini API)    │
                            └──────────────────┘
```

---

## 📋 Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] Google Cloud Gemini API key obtained
- [ ] GitHub repository created and pushed
- [ ] Render account created (render.com)
- [ ] Vercel account created (vercel.com)
- [ ] Domain name registered (optional)
- [ ] SSL certificate (auto-handled by both platforms)
- [ ] Environment variables prepared

---

## 🔧 Step 1: Backend Setup (Render)

### 1.1 Prepare Backend Environment

Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rivaansh?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key
ADMIN_EMAIL=admin@rivaansh.com
ADMIN_PASSWORD=YourStrongPassword123!@
ADMIN_SECRET=GenerateSecureRandomSecret
FRONTEND_URL=https://rivaansh-lifesciences.vercel.app
CORS_ORIGINS=https://rivaansh-lifesciences.vercel.app,https://yourdomain.com
LOG_LEVEL=info
```

### 1.2 Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (for Render)
5. Get connection string
6. Replace in `MONGO_URI`

### 1.3 Get Gemini API Key

1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Create new API key
4. Copy and save in `GEMINI_API_KEY`

### 1.4 Deploy to Render

#### Option A: Using Git (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Production deployment setup"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select `rivaansh-code` repository
   - Configure:
     - **Name:** `rivaansh-backend`
     - **Root Directory:** `backend`
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Environment Variables:**
       - Add all from `.env.production`

3. **Deploy:**
   - Click "Create Web Service"
   - Wait for build completion
   - You'll get URL: `https://rivaansh-backend-xxxxx.onrender.com`

#### Option B: Manual Docker (Advanced)

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
EXPOSE 5000

CMD ["npm", "start"]
```

---

## 🎨 Step 2: Frontend Setup (Vercel)

### 2.1 Update API Configuration

Update `frontend/script.js`:
```javascript
const getAPIBase = () => {
  const hostname = window.location.hostname;
  
  // Production URLs
  if (hostname === 'rivaansh-lifesciences.vercel.app') {
    return 'https://rivaansh-backend-xxxxx.onrender.com';
  }
  
  // Development
  if (['localhost', '127.0.0.1'].includes(hostname)) {
    return 'http://localhost:5000';
  }
  
  // Fallback: Same origin (if on same domain)
  return `${window.location.protocol}//${hostname}`;
};
```

### 2.2 Deploy to Vercel

1. **Using Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel deploy --prod
   ```

2. **Or Using Git:**
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repo
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** `frontend`
     - **Build Command:** (leave empty if no build)
     - **Output Directory:** (leave empty)

3. **Deploy:**
   - Vercel will auto-deploy on push to `main`

---

## 🔌 Step 3: Connect Frontend to Backend

### 3.1 Update Backend CORS

In `backend/.env.production`:
```env
CORS_ORIGINS=https://rivaansh-lifesciences.vercel.app,https://yourdomain.com
```

### 3.2 Update Frontend API URL

Test connection:
```javascript
fetch('https://rivaansh-backend-xxxxx.onrender.com/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));
```

---

## 🧪 Step 4: Testing

### 4.1 Test Backend Health
```bash
curl https://rivaansh-backend-xxxxx.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "database": "CONNECTED",
  "environment": "production",
  "timestamp": "2026-04-09T14:10:54.021Z"
}
```

### 4.2 Test Products API
```bash
curl https://rivaansh-backend-xxxxx.onrender.com/api/products | head -20
```

### 4.3 Test AI Feature
```bash
curl -X POST https://rivaansh-backend-xxxxx.onrender.com/api/ai/status
```

### 4.4 Test Frontend
- Visit: https://rivaansh-lifesciences.vercel.app
- Open DevTools (F12)
- Check Console for errors
- Verify products load

---

## 📊 Step 5: Monitoring & Logs

### Render
1. Go to https://render.com/dashboard
2. Select your service
3. Click "Logs" tab
4. Monitor real-time logs

### Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click "Deployments"
4. View build & deployment logs

---

## 🔐 Security Checklist

- [ ] Strong admin password set
- [ ] GEMINI_API_KEY not committed to Git
- [ ] MONGO_URI with strong database password
- [ ] CORS restricted to your domains
- [ ] HTTPS enforced (auto by Render/Vercel)
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Database backups enabled
- [ ] Monthly security updates

---

## 📈 Performance Optimization

### Backend (Render)
- Use Render's "Pay-as-you-go" plan for better performance
- Enable auto-scaling if available
- Monitor CPU and memory usage
- Implement caching for frequently accessed data

### Frontend (Vercel)
- Enable image optimization
- Use Vercel Analytics to monitor performance
- Implement edge caching
- Minimize JavaScript bundle size

---

## 🆘 Troubleshooting

###Problem: CORS errors in frontend
**Solution:**
1. Check `CORS_ORIGINS` in backend `.env.production`
2. Add your frontend domain to allowed origins
3. Redeploy backend

### Problem: Database connection fails
**Solution:**
1. Check MongoDB Atlas IP whitelist
2. Verify `MONGO_URI` is correct
3. Ensure user has database access permissions
4. Check network connectivity

### Problem: AI features not working
**Solution:**
1. Verify GEMINI_API_KEY is set in Render environment
2. Check API quota in Google Cloud console
3. Review backend logs for API errors

### Problem: Frontend not loading
**Solution:**
1. Check Vercel deployment succeeded
2. Verify there are no build errors
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check network tab for failed requests

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **Google Gemini API:** https://ai.google.dev

---

## 🎯 Next Steps

1. ✅ Deploy backend to Render
2. ✅ Deploy frontend to Vercel
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring and alerts
5. ✅ Create backup strategy
6. ✅ Document deployment process for team

---

**Last Updated:** April 9, 2026
**Version:** 1.0.0
**Status:** Production Ready ✅
