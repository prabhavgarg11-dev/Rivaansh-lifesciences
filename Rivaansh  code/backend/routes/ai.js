const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const PHARMACY_SYSTEM = `You are Riva, a clinical AI assistant for Rivaansh Lifesciences, 
a WHO-GMP certified pharmacy in Jaipur, India. You help patients understand medicines, 
symptoms, and prescriptions. Always recommend consulting a licensed pharmacist or doctor 
for medical decisions. Keep answers clear, concise, and in simple language. 
Never diagnose definitively — always say "this may indicate" or "consult your doctor".`;

// FEATURE 1: Context-aware Gemini chat with conversation history
async function geminiChat(prompt, history) {
    // Try Gemini first
    try {
        const chat = model.startChat({
            history: history || []
        });
        const result = await chat.sendMessage(prompt);
        return result.response.text();
    } catch (err) {
        console.error('Gemini API error:', err.message);
    }

    // Fallback to OpenAI
    try {
        const messages = history ? history.map(h => ({ role: h.role, content: h.parts[0].text })) : [];
        messages.push({ role: 'user', content: prompt });
        
        const response = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: PHARMACY_SYSTEM },
                ...messages
            ],
            max_tokens: 500,
        });
        return response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';
    } catch (openaiErr) {
        console.error('OpenAI API error:', openaiErr.message);
        
        // Rule-based fallback
        const msg = prompt.toLowerCase();
        if (msg.includes('headache') || msg.includes('pain')) {
            return 'For headaches, consider Rivakold™ Antikold Tablets (₹85) which provides relief from pain and fever. Take 1-2 tablets after meals. If severe or persistent, please consult a doctor.';
        }
        if (msg.includes('cold') || msg.includes('fever') || msg.includes('cough')) {
            return 'Rivakold™ is our clinical-grade cold relief medication. It helps with fever, cough, and congestion. Available for ₹85. For high fever above 103°F, seek medical attention.';
        }
        if (msg.includes('hello') || msg.includes('hi')) {
            return 'Hello! 👋 Welcome to Rivaansh Lifesciences. I\'m your clinical assistant. How can I help you with medicines, prescriptions, or health queries today?';
        }
        return 'Thank you for reaching out to Rivaansh Lifesciences. Our clinical team is available at +91 8426033033 or rivaanshlifesciences@gmail.com for personalized assistance.';
    }
}

// GET /api/ai/status
router.get('/status', (req, res) => {
    const available = !!process.env.GEMINI_API_KEY;
    res.json({
        available,
        message: available ? 'Gemini AI is online' : 'AI offline - add GEMINI_API_KEY to .env',
        mode: available ? 'gemini-pro' : 'fallback'
    });
});

// POST /api/ai/chat  
// FEATURE 1: Supports persistent chat history for context-aware responses
router.post('/chat', async (req, res) => {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    try {
        const reply = await geminiChat(
            `${PHARMACY_SYSTEM}\n\nPatient says: "${message}". Reply helpfully about medicines, orders, or health queries.`,
            history
        );
        res.json({ reply });
    } catch (err) {
        console.error('AI chat error:', err.message);
        res.status(500).json({ error: 'AI temporarily unavailable', reply: null });
    }
});

// POST /api/ai/symptom
router.post('/symptom', async (req, res) => {
    const { symptoms } = req.body;
    if (!symptoms) return res.status(400).json({ error: 'Symptoms required' });
    try {
        const result = await geminiChat(
            `A patient reports these symptoms: "${symptoms}". 
             Provide a brief clinical overview of possible conditions, 
             suggest OTC remedies available at a pharmacy, 
             and clearly state when to see a doctor. Do not make a definitive diagnosis.`
        );
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Symptom check unavailable' });
    }
});

// POST /api/ai/prescription
router.post('/prescription', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Prescription text required' });
    try {
        const result = await geminiChat(
            `A patient shared this prescription text: "${text}". 
             Explain each medicine mentioned in simple terms: what it treats, 
             common side effects, and important usage instructions. 
             Format clearly with each medicine on its own section.`
        );
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Prescription analysis unavailable' });
    }
});

// POST /api/ai/medicine-info
// FEATURE 4: Returns medicine info for AI search autocomplete
router.post('/medicine-info', async (req, res) => {
    const { medicine } = req.body;
    if (!medicine) return res.status(400).json({ error: 'Medicine name required' });
    try {
        const result = await geminiChat(
            `Give clinical information about the medicine: "${medicine}". 
             Include: uses, composition, dosage, side effects, contraindications, 
             storage. Keep it structured and easy to understand for a patient.`
        );
        res.json({ result, info: result }); // Provide both 'result' and 'info' for compatibility
    } catch (err) {
        res.status(500).json({ error: 'Medicine info unavailable' });
    }
});

// POST /api/ai/drug-interact
router.post('/drug-interact', async (req, res) => {
    const { drugs } = req.body;
    if (!drugs) return res.status(400).json({ error: 'Drug names required' });
    try {
        const result = await geminiChat(
            `Check drug interactions between: "${drugs}". 
             List any known interactions, their severity (mild/moderate/severe), 
             and what to do. If no interactions found, confirm it's safe. 
             Always recommend consulting a pharmacist.`
        );
        res.json({ result });
    } catch (err) {
        res.status(500).json({ error: 'Drug interaction check unavailable' });
    }
});

module.exports = router;
