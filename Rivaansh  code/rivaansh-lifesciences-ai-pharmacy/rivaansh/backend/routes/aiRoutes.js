/**
 * aiRoutes.js — AI Feature Routes for Rivaansh Lifesciences
 * 
 * All AI features powered by Anthropic Claude API:
 *   POST /api/ai/chat          → Health Assistant Chatbot
 *   POST /api/ai/search        → Symptom-based Medicine Search
 *   POST /api/ai/recommend     → Personalized Recommendations
 *   POST /api/ai/prescription  → Prescription Image Analyzer
 *   POST /api/ai/summary       → Drug Info Simplifier
 *   POST /api/ai/sideeffects   → Side Effect & Drug Interaction Detector
 *   POST /api/ai/labtest       → Lab Test Suggester
 *   POST /api/ai/reminder      → Medicine Reminder Suggestions
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const fs       = require('fs');
const path     = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL  = 'claude-sonnet-4-20250514';

// Multer config for prescription uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP, or PDF allowed'));
    }
});

// Load products for context
function loadProducts() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname, '../products.json'), 'utf8'));
    } catch { return []; }
}

const DISCLAIMER = '\n\n⚠️ *Disclaimer: AI suggestions are not a substitute for professional medical advice. Always consult a qualified healthcare provider before starting any medication.*';

// ══════════════════════════════════════════════════════════════════════
// 1. HEALTH ASSISTANT CHATBOT
// ══════════════════════════════════════════════════════════════════════
router.post('/chat', async (req, res) => {
    const { message, history = [] } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message required.' });

    const products = loadProducts();
    const productNames = products.map(p => `${p.name} (${p.brand}, ₹${p.price})`).join(', ');

    try {
        const messages = [
            ...history.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message }
        ];

        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 600,
            system: `You are "RivaBot", a knowledgeable and friendly health assistant for Rivaansh Lifesciences pharmacy. 
You help users with:
- Medicine information, dosage, and usage
- Symptom assessment and medicine suggestions
- Healthcare advice in simple, empathetic language

Available products in our store: ${productNames}

Rules:
- Be warm, clear, and concise. Use bullet points when listing items.
- Always recommend consulting a doctor for serious conditions.
- If a medicine we sell is relevant, mention it naturally.
- End responses with the disclaimer ONLY on first message or medical advice topics.
- Never diagnose — only suggest and inform.
- Respond in the same language as the user (support Hindi/Gujarati if needed).`,
            messages
        });

        const reply = response.content[0].text;
        res.json({ reply: reply + DISCLAIMER, usage: response.usage });
    } catch (err) {
        console.error('AI Chat error:', err.message);
        res.status(500).json({ message: 'AI service unavailable. Please try again.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 2. SMART SYMPTOM-BASED SEARCH
// ══════════════════════════════════════════════════════════════════════
router.post('/search', async (req, res) => {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ message: 'Query required.' });

    const products = loadProducts();
    const productList = products.map(p =>
        `ID:${p.id} | ${p.name} | ${p.brand} | ${p.category} | ₹${p.price} | ${p.composition} | Rx:${p.prescriptionRequired}`
    ).join('\n');

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 800,
            system: `You are a pharmaceutical AI for Rivaansh Lifesciences pharmacy. 
Analyze the user's query (symptoms, condition, or medicine name) and return a JSON response ONLY.
Product catalogue:
${productList}

Return ONLY valid JSON, no markdown:
{
  "intent": "symptom|medicine|condition|general",
  "conditions": ["possible condition 1", "possible condition 2"],
  "matched_product_ids": [1, 2, 3],
  "explanation": "Brief explanation of why these are recommended",
  "urgency": "low|medium|high",
  "see_doctor": true|false
}`,
            messages: [{ role: 'user', content: `User query: "${query}"` }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = { matched_product_ids: [], explanation: response.content[0].text, conditions: [] };
        }

        // Attach full product objects
        const matchedProducts = (result.matched_product_ids || [])
            .map(id => products.find(p => p.id === id || p.id === Number(id)))
            .filter(Boolean);

        res.json({ ...result, products: matchedProducts });
    } catch (err) {
        console.error('AI Search error:', err.message);
        res.status(500).json({ message: 'AI search unavailable.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 3. PERSONALIZED RECOMMENDATIONS
// ══════════════════════════════════════════════════════════════════════
router.post('/recommend', async (req, res) => {
    const { cartItems = [], searchHistory = [], orderHistory = [], currentProduct = null } = req.body;

    const products = loadProducts();
    const productList = products.map(p =>
        `ID:${p.id} | ${p.name} | ${p.category} | ₹${p.price} | ${p.badge || ''}`
    ).join('\n');

    const context = {
        cart: cartItems.map(i => i.name).join(', ') || 'empty',
        searches: searchHistory.slice(-5).join(', ') || 'none',
        orders: orderHistory.slice(-3).map(o => o.items?.map(i => i.name).join(', ')).join('; ') || 'none',
        viewing: currentProduct?.name || 'none'
    };

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 600,
            system: `You are a personalization AI for Rivaansh Lifesciences pharmacy.
Based on user context, recommend products. Return ONLY valid JSON:
{
  "recommendations": [
    { "product_id": 1, "reason": "Based on your cart items", "type": "complement" }
  ],
  "alternatives": [
    { "product_id": 2, "reason": "Generic alternative saves ₹X", "type": "alternative" }
  ],
  "combo": { "product_ids": [1, 3], "reason": "Great combo for...", "savings": "₹X" },
  "health_tip": "Brief relevant health tip"
}
All product IDs must be from this catalogue:
${productList}`,
            messages: [{
                role: 'user',
                content: `User context: Cart: ${context.cart} | Recent searches: ${context.searches} | Viewing: ${context.viewing}`
            }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = { recommendations: [], alternatives: [], health_tip: response.content[0].text };
        }

        // Hydrate with full product objects
        const hydrate = (ids) => (ids || []).map(id => products.find(p => p.id === id || p.id === Number(id))).filter(Boolean);

        result.recommendations = (result.recommendations || []).map(r => ({
            ...r, product: products.find(p => p.id === r.product_id || p.id === Number(r.product_id))
        })).filter(r => r.product);

        result.alternatives = (result.alternatives || []).map(r => ({
            ...r, product: products.find(p => p.id === r.product_id || p.id === Number(r.product_id))
        })).filter(r => r.product);

        if (result.combo) {
            result.combo.products = hydrate(result.combo.product_ids);
        }

        res.json(result);
    } catch (err) {
        console.error('AI Recommend error:', err.message);
        res.status(500).json({ message: 'AI recommendations unavailable.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 4. PRESCRIPTION ANALYZER (Image AI)
// ══════════════════════════════════════════════════════════════════════
router.post('/prescription', upload.single('prescription'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Prescription image required.' });

    const products = loadProducts();
    const productList = products.map(p => `${p.name} | ${p.composition}`).join('\n');

    try {
        const imageBase64 = req.file.buffer.toString('base64');
        const mediaType   = req.file.mimetype;

        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 1000,
            system: `You are a prescription analysis AI for Rivaansh Lifesciences pharmacy.
Analyze the prescription image and extract medicine information.
Return ONLY valid JSON:
{
  "doctor_name": "extracted or null",
  "patient_name": "extracted or null",
  "date": "extracted or null",
  "medicines": [
    {
      "name": "Medicine Name",
      "dosage": "500mg",
      "frequency": "twice daily",
      "duration": "5 days",
      "instructions": "after meals"
    }
  ],
  "matched_products": ["Product name from our store that matches"],
  "notes": "Any additional prescription notes",
  "confidence": "high|medium|low",
  "disclaimer": "Always verify with your pharmacist before dispensing."
}
Our available products: ${productList}`,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'image',
                        source: { type: 'base64', media_type: mediaType, data: imageBase64 }
                    },
                    { type: 'text', text: 'Please analyze this prescription and extract all medicine information.' }
                ]
            }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = {
                medicines: [],
                notes: response.content[0].text,
                confidence: 'low',
                disclaimer: 'Could not fully parse prescription. Please verify manually.'
            };
        }

        // Match products
        const matchedProducts = products.filter(p =>
            result.medicines?.some(m =>
                m.name?.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]) ||
                p.composition?.toLowerCase().includes(m.name?.toLowerCase().split(' ')[0])
            )
        );

        res.json({ ...result, suggestedProducts: matchedProducts.slice(0, 4) });
    } catch (err) {
        console.error('Prescription AI error:', err.message);
        res.status(500).json({ message: 'Prescription analysis failed. Please try again.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 5. DRUG INFO SIMPLIFIER
// ══════════════════════════════════════════════════════════════════════
router.post('/summary', async (req, res) => {
    const { productId, text } = req.body;
    if (!productId && !text) return res.status(400).json({ message: 'Product ID or text required.' });

    const products = loadProducts();
    let product = productId ? products.find(p => p.id === Number(productId)) : null;
    const content = text || (product ? `${product.name}: ${product.description}. Composition: ${product.composition}. Uses: ${product.uses}. Side effects: ${product.sideEffects}. Dosage: ${product.dosage}.` : '');

    if (!content) return res.status(404).json({ message: 'Product not found.' });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 600,
            system: `You are a healthcare communication specialist. Convert complex pharmaceutical information into clear, simple language that a non-medical person can easily understand.

Format your response as JSON ONLY:
{
  "simple_name": "Easy name for the medicine",
  "what_it_does": "Simple 1-2 sentence explanation",
  "who_should_use": "Brief description",
  "how_to_use": ["step 1", "step 2"],
  "key_warnings": ["warning 1", "warning 2"],
  "good_to_know": "One helpful tip",
  "safety_score": "safe|use-with-care|prescription-only"
}`,
            messages: [{ role: 'user', content: `Please simplify this drug information:\n${content}` }]
        });

        let result;
        try {
            const textRes = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(textRes);
        } catch {
            result = { what_it_does: response.content[0].text };
        }

        res.json({ product: product || null, summary: result });
    } catch (err) {
        console.error('Drug summary error:', err.message);
        res.status(500).json({ message: 'Drug summarizer unavailable.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 6. SIDE EFFECT DETECTOR + DRUG INTERACTION CHECKER
// ══════════════════════════════════════════════════════════════════════
router.post('/sideeffects', async (req, res) => {
    const { medicines = [], symptoms = [] } = req.body;
    if (!medicines.length) return res.status(400).json({ message: 'At least one medicine required.' });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 800,
            system: `You are a clinical pharmacology AI assistant. Analyze drug interactions and side effects.
Return ONLY valid JSON:
{
  "individual_effects": [
    { "medicine": "name", "common_effects": ["effect1"], "rare_effects": ["effect2"], "severity": "mild|moderate|severe" }
  ],
  "interactions": [
    { "drugs": ["drug1", "drug2"], "interaction": "description", "severity": "mild|moderate|severe|avoid", "recommendation": "what to do" }
  ],
  "symptom_warnings": ["warning if user reports specific symptoms"],
  "overall_risk": "low|moderate|high",
  "recommendations": ["recommendation 1", "recommendation 2"],
  "see_doctor_immediately": true|false,
  "reason_to_see_doctor": "reason or null"
}`,
            messages: [{
                role: 'user',
                content: `Medicines: ${medicines.join(', ')}\nReported symptoms: ${symptoms.join(', ') || 'none'}`
            }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = { recommendations: [response.content[0].text], overall_risk: 'unknown' };
        }

        res.json({ ...result, disclaimer: DISCLAIMER });
    } catch (err) {
        console.error('Side effects error:', err.message);
        res.status(500).json({ message: 'Side effect analyzer unavailable.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 7. LAB TEST SUGGESTER
// ══════════════════════════════════════════════════════════════════════
router.post('/labtest', async (req, res) => {
    const { symptoms = [], age, gender } = req.body;
    if (!symptoms.length) return res.status(400).json({ message: 'Symptoms required.' });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 600,
            system: `You are a diagnostic AI assistant. Based on symptoms, suggest relevant lab tests.
Return ONLY valid JSON:
{
  "possible_conditions": ["condition 1", "condition 2"],
  "suggested_tests": [
    {
      "name": "Complete Blood Count (CBC)",
      "why": "To check for infection or anemia",
      "urgency": "routine|soon|urgent",
      "fasting_required": false,
      "estimated_cost": "₹150-300"
    }
  ],
  "lifestyle_checks": ["blood pressure check", "weight"],
  "urgency_level": "low|medium|high",
  "consult_specialist": "General Physician|Cardiologist|etc or null"
}`,
            messages: [{
                role: 'user',
                content: `Patient symptoms: ${symptoms.join(', ')}\nAge: ${age || 'unknown'}\nGender: ${gender || 'unknown'}`
            }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = { suggested_tests: [], possible_conditions: [response.content[0].text] };
        }

        res.json({ ...result, disclaimer: DISCLAIMER });
    } catch (err) {
        console.error('Lab test error:', err.message);
        res.status(500).json({ message: 'Lab test suggester unavailable.' });
    }
});

// ══════════════════════════════════════════════════════════════════════
// 8. MEDICINE REMINDER PLANNER
// ══════════════════════════════════════════════════════════════════════
router.post('/reminder', async (req, res) => {
    const { medicines = [], wakeTime = '07:00', sleepTime = '22:00', meals = ['08:00', '13:00', '20:00'] } = req.body;
    if (!medicines.length) return res.status(400).json({ message: 'Medicine list required.' });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 700,
            system: `You are a medication scheduling AI. Create an optimal medicine reminder schedule.
Return ONLY valid JSON:
{
  "schedule": [
    {
      "time": "08:00",
      "label": "Morning with Breakfast",
      "medicines": [
        { "name": "Medicine Name", "dose": "1 tablet", "instructions": "with water after food" }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2"],
  "interactions_note": "Any timing conflicts or interactions to be aware of",
  "total_daily_doses": 3
}`,
            messages: [{
                role: 'user',
                content: `Medicines: ${JSON.stringify(medicines)}\nWake time: ${wakeTime}\nSleep time: ${sleepTime}\nMeal times: ${meals.join(', ')}`
            }]
        });

        let result;
        try {
            const text = response.content[0].text.replace(/```json|```/g, '').trim();
            result = JSON.parse(text);
        } catch {
            result = { schedule: [], tips: [response.content[0].text] };
        }

        res.json(result);
    } catch (err) {
        console.error('Reminder error:', err.message);
        res.status(500).json({ message: 'Reminder planner unavailable.' });
    }
});

module.exports = router;
