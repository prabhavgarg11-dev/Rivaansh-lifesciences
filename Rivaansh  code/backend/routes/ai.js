const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Using gemini-pro for broad compatibility. If gemini-1.5-flash is available, switch back.
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const PHARMACY_SYSTEM = `You are Riva, a clinical AI assistant for Rivaansh Lifesciences, 
a WHO-GMP certified pharmacy in Jaipur, India. You help patients understand medicines, 
symptoms, and prescriptions. Always recommend consulting a licensed pharmacist or doctor 
for medical decisions. Keep answers clear, concise, and in simple language. 
Never diagnose definitively — always say "this may indicate" or "consult your doctor".`;

// FEATURE 1: Context-aware Gemini chat with conversation history
// Fallback responses for common pharmacy questions
const FALLBACK_RESPONSES = {
    'paracetamol': 'Paracetamol (acetaminophen) is used for mild to moderate pain and fever. Common dosage: 500-1000mg every 4-6 hours, not exceeding 4000mg daily. Always consult a pharmacist or doctor before use.',
    'ibuprofen': 'Ibuprofen is an anti-inflammatory pain reliever for mild to moderate pain, fever, and inflammation. Typical dose: 200-400mg every 4-6 hours. Take with food to reduce stomach upset. Consult your pharmacist.',
    'medicine': 'For medicine information, please ask about specific medicines. Our AI can help you understand uses, dosages, side effects, and precautions. Always consult a licensed pharmacist or doctor.',
    'default': 'Thank you for your question. At Rivaansh Lifesciences, we\'re here to help you understand medicines and health. For specific medical concerns, please consult a licensed pharmacist or doctor. How can we assist you today?'
};

async function geminiChat(prompt, history) {
    try {
        const chat = model.startChat({
            history: history || []
        });
        const result = await chat.sendMessage(prompt);
        return result.response.text();
    } catch (err) {
        console.error('Gemini API error:', err.message);
        
        // Smart fallback: return helpful response based on query
        const lowerPrompt = prompt.toLowerCase();
        for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
            if (lowerPrompt.includes(key)) {
                return response;
            }
        }
        return FALLBACK_RESPONSES.default;
    }
}

// GET /api/ai/status
// Check if Gemini API is available, return mode (gemini or fallback)
router.get('/status', (req, res) => {
    const available = !!process.env.GEMINI_API_KEY;
    res.json({
        available: true, // Always available (fallback mode)
        message: 'Clinical AI Assistant Online',
        mode: available ? 'gemini-pro' : 'fallback',
        status: 'running'
    });
});

// POST /api/ai/chat  
// FEATURE 1: Supports persistent chat history for context-aware responses
// Falls back to pre-written responses if Gemini API is unavailable
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
        // Return fallback response instead of error
        const fallbackReply = await geminiChat(message, null);
        res.json({ reply: fallbackReply, mode: 'fallback' });
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
