/**
 * ═══════════════════════════════════════════════════════════════
 * RIVAANSH LIFESCIENCES — AI API ROUTES
 * All clinical AI endpoints wired to aiService.js
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const router = express.Router();
const {
  getChatResponse,
  analyzeSymptoms,
  analyzePrescription,
  checkDrugInteraction,
  screenHealthRisk,
  getMedicineInfo,
  getAIStatus,
} = require('../services/aiService');

// ── Helper: Wrap async route handlers ────────────────────────
const asyncRoute = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// ── GET /api/ai/status ────────────────────────────────────────
// Returns AI availability status (Gemini / OpenAI / Fallback)
router.get('/status', (req, res) => {
  const status = getAIStatus();
  res.json({
    success: true,
    ...status,
    message: status.available
      ? `Clinical AI active (${status.mode})`
      : 'AI running in smart fallback mode',
  });
});

// ── POST /api/ai/chat ─────────────────────────────────────────
// Clinical chatbot — main conversation endpoint
router.post('/chat', asyncRoute(async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const reply = await getChatResponse(message.trim());
  res.json({ reply, success: true });
}));

// Alias for old /api/chat route (backwards compatible)
router.post('/chat-legacy', asyncRoute(async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const reply = await getChatResponse(message);
  res.json({ reply, success: true });
}));

// ── POST /api/ai/symptom ──────────────────────────────────────
// AI Symptom Checker — analyze patient symptoms
router.post('/symptom', asyncRoute(async (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || !symptoms.trim()) {
    return res.status(400).json({ error: 'Symptoms description is required' });
  }
  if (symptoms.trim().length < 5) {
    return res.status(400).json({ error: 'Please provide more detail about your symptoms' });
  }
  const result = await analyzeSymptoms(symptoms.trim());
  res.json({ result, success: true });
}));

// ── POST /api/ai/prescription ─────────────────────────────────
// Prescription Analyzer — decode treatment plans
router.post('/prescription', asyncRoute(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Prescription text is required' });
  }
  const result = await analyzePrescription(text.trim());
  res.json({ result, success: true });
}));

// ── POST /api/ai/drug-interact ────────────────────────────────
// Drug Interaction Checker — check safety between medicines
router.post('/drug-interact', asyncRoute(async (req, res) => {
  const { drugs } = req.body;
  if (!drugs || !drugs.trim()) {
    return res.status(400).json({ error: 'Please provide drug names to check interactions' });
  }
  const result = await checkDrugInteraction(drugs.trim());
  res.json({ result, success: true });
}));

// ── POST /api/ai/health-risk ──────────────────────────────────
// Health Risk Screener — preventive health assessment
router.post('/health-risk', asyncRoute(async (req, res) => {
  const { age, weight, height, conditions, lifestyle } = req.body;
  if (!age) {
    return res.status(400).json({ error: 'Age is required for risk assessment' });
  }
  const data = { age, weight, height, conditions, lifestyle };
  const result = await screenHealthRisk(data);
  res.json({ result, success: true });
}));

// ── POST /api/ai/medicine-info ────────────────────────────────
// AI Medicine Information — detailed clinical info on any drug
router.post('/medicine-info', asyncRoute(async (req, res) => {
  const { medicine } = req.body;
  if (!medicine || !medicine.trim()) {
    return res.status(400).json({ error: 'Medicine name is required' });
  }
  const result = await getMedicineInfo(medicine.trim());
  res.json({ result, success: true });
}));

module.exports = router;
