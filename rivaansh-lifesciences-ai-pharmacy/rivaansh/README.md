# 🏥 Rivaansh Lifesciences — AI-Powered Pharmacy v2.0

A full-stack AI-powered pharmaceutical eCommerce platform inspired by Tata 1mg, built with React + Node.js + Anthropic Claude AI.

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set your ANTHROPIC_API_KEY and JWT_SECRET
node server.js
# Server runs on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🤖 AI Features

| Feature | Route | Description |
|---|---|---|
| AI Health Chatbot | `/ai/chat` | RivaBot — conversational health assistant powered by Claude |
| Smart Symptom Search | `/ai/search` | NLP-based medicine search from symptoms |
| Prescription Analyzer | `/ai/prescription` | Upload image → AI extracts medicines + suggests products |
| Drug Interaction Checker | `/ai/sideeffects` | Checks side effects & dangerous combinations |
| Lab Test Suggester | `/ai/labtest` | AI recommends diagnostic tests from symptoms |
| Medicine Reminder | `/ai/reminder` | AI-generated personalized daily medicine schedule |
| Drug Info Simplifier | `/products/:id` | AI explains complex drug info in simple language |
| Personalized Recs | `/dashboard` | AI recommendations based on cart & history |

---

## ⚙️ Tech Stack

- **Frontend**: React 18, React Router v6, Vite
- **Backend**: Node.js, Express.js
- **AI**: Anthropic Claude (claude-sonnet-4-20250514) via `@anthropic-ai/sdk`
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Storage**: In-memory (swap for MongoDB with mongoose)
- **File Uploads**: Multer (memory storage)

---

## 📁 Project Structure

```
rivaansh/
├── backend/
│   ├── routes/
│   │   ├── aiRoutes.js       ← All 8 AI features
│   │   ├── authRoutes.js     ← Register / Login / Me
│   │   ├── cartRoutes.js     ← Cart CRUD
│   │   └── orderRoutes.js    ← Order placement & history
│   ├── middleware/
│   │   └── authMiddleware.js ← JWT guard
│   ├── products.json         ← Product catalogue
│   ├── server.js             ← Express entry point
│   ├── .env.example          ← Environment variables template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/api.js        ← Fetch wrapper with JWT
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── CartContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CartDrawer.jsx
    │   │   └── ProductCard.jsx
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── ProductsPage.jsx
    │   │   ├── ProductDetailPage.jsx
    │   │   ├── AIChatPage.jsx
    │   │   ├── AISearchPage.jsx
    │   │   ├── AIPrescriptionPage.jsx
    │   │   ├── AISideEffectsPage.jsx
    │   │   ├── AILabTestPage.jsx
    │   │   ├── AIReminderPage.jsx
    │   │   ├── AuthPage.jsx
    │   │   ├── OrdersPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   └── DashboardPage.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🔐 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/rivaansh_pharmacy
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
NODE_ENV=development
```

Get your Anthropic API key at: https://console.anthropic.com

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login`    — Sign in → returns JWT
- `GET  /api/auth/me`       — Get current user (auth required)

### Products
- `GET /api/products`       — List all (supports ?search= and ?category=)
- `GET /api/products/:id`   — Single product

### Cart (auth required)
- `GET  /api/cart`          — Get cart
- `POST /api/cart`          — Add/update/remove item

### Orders (auth required)
- `POST /api/orders`        — Place order (supports multipart/form-data for Rx)
- `GET  /api/orders`        — Order history

### AI (no auth required for demo)
- `POST /api/ai/chat`        — Chatbot: { message, history[] }
- `POST /api/ai/search`      — Symptom search: { query }
- `POST /api/ai/recommend`   — Recommendations: { cartItems, searchHistory, orderHistory }
- `POST /api/ai/prescription`— Rx analyzer: multipart { prescription: file }
- `POST /api/ai/summary`     — Drug simplifier: { productId }
- `POST /api/ai/sideeffects` — Interaction checker: { medicines[], symptoms[] }
- `POST /api/ai/labtest`     — Lab test suggester: { symptoms[], age, gender }
- `POST /api/ai/reminder`    — Reminder planner: { medicines[], wakeTime, sleepTime }

---

## 🛡️ Security Notes

- JWT tokens expire in 7 days
- Passwords hashed with bcrypt (10 rounds)
- File uploads validated (type + 5MB limit)
- CORS enabled for all origins in dev (restrict in production)
- AI responses always include medical disclaimer

---

## 📦 Upgrading to MongoDB

Replace in-memory stores in `cartRoutes.js`, `orderRoutes.js`, and `authRoutes.js` with Mongoose models.
Uncomment and configure `MONGO_URI` in `.env`.

---

## ⚠️ Medical Disclaimer

AI suggestions on this platform are for informational purposes only and are NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before starting any medication.

---

*Built with ❤️ for Rivaansh Lifesciences — Powered by Anthropic Claude AI*
