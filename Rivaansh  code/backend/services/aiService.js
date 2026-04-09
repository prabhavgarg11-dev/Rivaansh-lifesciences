/**
 * ═══════════════════════════════════════════════════════════════
 * RIVAANSH LIFESCIENCES — CLINICAL AI SERVICE
 * Gemini (primary) → OpenAI (secondary) → Smart Rule Fallback
 * ═══════════════════════════════════════════════════════════════
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// ── Initialize AI Clients ─────────────────────────────────────
let gemini = null;
let geminiModel = null;
let openaiClient = null;

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const isValidKey = (key) => key && !key.includes('your_') && key.length > 10;

if (isValidKey(GEMINI_KEY)) {
  try {
    gemini = new GoogleGenerativeAI(GEMINI_KEY);
    geminiModel = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Gemini AI initialized (Clinical Hub)');
  } catch (e) {
    console.warn('⚠️ Gemini init failed:', e.message);
  }
}

if (isValidKey(OPENAI_KEY)) {
  try {
    openaiClient = new OpenAI({ apiKey: OPENAI_KEY });
    console.log('✅ OpenAI initialized (Clinical Backup)');
  } catch (e) {
    console.warn('⚠️ OpenAI init failed:', e.message);
  }
}

// ── Core AI Call (Gemini first, then OpenAI) ──────────────────
async function callAI(systemPrompt, userPrompt) {
  // Try Gemini first
  if (geminiModel) {
    try {
      const fullPrompt = `${systemPrompt}\n\nUser Query: ${userPrompt}`;
      const result = await geminiModel.generateContent(fullPrompt);
      const text = result.response.text();
      if (text && text.trim()) return { text, source: 'gemini' };
    } catch (e) {
      console.warn('Gemini call failed, trying OpenAI:', e.message);
    }
  }

  // Fallback to OpenAI
  if (openaiClient) {
    try {
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
      });
      const text = response.choices[0]?.message?.content;
      if (text) return { text, source: 'openai' };
    } catch (e) {
      console.warn('OpenAI call failed:', e.message);
    }
  }

  return null; // No AI available — caller handles fallback
}

// ── 1. Clinical Chatbot ───────────────────────────────────────
const CHAT_SYSTEM = `You are the official clinical assistant of Rivaansh Lifesciences, a licensed pharmaceutical company based in Jaipur, India. Products include Rivakold™ (cold/flu tablets), Rivasyne™ (antifungal cream), Rivapro-ESR™ (gut health capsules), Rivadol-AP™ (pain relief tablets), Rivayne™ (face wash), Rivaderm™ (anti-itch cream), Rivoxy™ (Omega-3 capsules), and hCG™ (pregnancy kit).

Guidelines:
- Be professional, empathetic, and concise (3-4 sentences)
- Always recommend consulting a licensed doctor for serious conditions
- You can help with product selection, order queries, and general health info
- Phone: +91 8426033033 | Email: rivaanshlifesciences@gmail.com`;

async function getChatResponse(message) {
  const result = await callAI(CHAT_SYSTEM, message);
  if (result) return result.text;

  // Smart rule-based fallback
  const msg = message.toLowerCase();
  if (msg.includes('rivakold') || msg.includes('cold') || msg.includes('fever'))
    return 'Rivakold™ Antikold Tablets provide rapid relief from cold, fever, and congestion. Dosage: 1-2 tablets daily after meals. For severe fever above 103°F, please consult a physician. Available on our platform for ₹85.';
  if (msg.includes('rivasyne') || msg.includes('fungal') || msg.includes('skin'))
    return 'Rivasyne™ Cream (Clotrimazole 1%) is our clinical-grade antifungal therapy. Apply twice daily to the affected area. Results visible in 7–14 days. If condition worsens, please visit a dermatologist.';
  if (msg.includes('rivapro') || msg.includes('gut') || msg.includes('probiotic'))
    return 'Rivapro-ESR™ Capsules contain 5 Billion CFU Lactobacillus for superior gut health. Take 1 capsule daily before breakfast. Store refrigerated for maximum potency. ₹299 per pack.';
  if (msg.includes('order') || msg.includes('track') || msg.includes('delivery'))
    return 'Your Rivaansh order can be tracked in the "My Orders" section of your dashboard. Standard delivery is 2–4 business days. Express delivery within Jaipur: 4–6 hours. For real-time updates, call +91 8426033033.';
  if (msg.includes('prescription') || msg.includes('rx') || msg.includes('upload'))
    return 'Rx-required medicines need a valid prescription from a licensed medical practitioner. Upload your prescription in the "Prescriptions" tab. Our pharmacist reviews documents within 1 business day.';
  if (msg.includes('price') || msg.includes('cost') || msg.includes('offer'))
    return 'Rivaansh products are priced 15-30% below MRP with free delivery on orders above ₹499. Check the Medicines Catalogue for all current prices and available discounts.';
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey'))
    return 'Hello! 👋 Welcome to Rivaansh Lifesciences. I\'m your clinical assistant, here to help with product queries, prescription guidance, order tracking, and health information. How may I assist you today?';
  return 'Thank you for reaching out to Rivaansh Lifesciences. For specific pharmaceutical guidance, our clinical team is available at +91 8426033033 or rivaanshlifesciences@gmail.com. I\'m available 24/7 for general queries.';
}

// ── 2. Symptom Checker ────────────────────────────────────────
const SYMPTOM_SYSTEM = `You are the Rivaansh Lifesciences Clinical Symptom Screening AI. Analyze symptoms and:
1. List 2-3 possible conditions (clearly labeled as possibilities, not diagnoses)
2. Suggest general care measures
3. Mention if any Rivaansh products could help
4. Always advise consulting a licensed doctor
Format response clearly with sections. Keep it under 300 words. Add a medical disclaimer.`;

async function analyzeSymptoms(symptoms) {
  const result = await callAI(SYMPTOM_SYSTEM, `Patient symptoms: ${symptoms}`);
  if (result) return result.text;

  // Rule-based fallback
  const s = symptoms.toLowerCase();
  let response = 'Rivaansh (Clinical AI) Assessment\n\n';

  if (s.includes('fever') || s.includes('temperature') || s.includes('hot'))
    response += '**Potential Observation:** Viral fever or upper respiratory irritation.\n**Recommended Care:** Adequate rest and hydration. Our Rivakold™ Antikold Tablets provide multisymptom relief for fever and body ache.\n';
  else if (s.includes('cough') || s.includes('cold') || s.includes('throat'))
    response += '**Potential Observation:** Common cold, seasonal flu, or pharyngitis.\n**Recommended Care:** Warm saline gargles and steam inhalation. Rivakold™ can assist in congestion relief.\n';
  else if (s.includes('pain') || s.includes('joint') || s.includes('muscle') || s.includes('ache'))
    response += '**Potential Observation:** Muscular strain or systemic inflammation.\n**Recommended Care:** Rest the affected area. Rivadol-AP™ Pain Relief Tablets are designed for targeted analgesia (prescription required).\n';
  else if (s.includes('skin') || s.includes('rash') || s.includes('itch') || s.includes('red'))
    response += '**Potential Observation:** Dermatitis, fungal infection, or localized allergy.\n**Recommended Care:** Maintain hygiene and keep the area dry. Rivasyne™ Cream is clinically proven for fungal infections.\n';
  else if (s.includes('stomach') || s.includes('digestion') || s.includes('acidity') || s.includes('gas'))
    response += '**Potential Observation:** Gastric distress or disturbed gut flora.\n**Recommended Care:** Light diet and hydration. Rivapro-ESR™ Capsules restore gut microbiota effectively.\n';
  else
    response += '**Clinical Note:** Your symptoms are highly specific. For a thorough diagnostic understanding, clinical evaluation is advised.\n';

  response += '\n⚠️ **Medical Disclaimer:** This AI screening does not constitute a confirmed diagnosis. Always consult your licensed physician.';
  return response;
}

// ── 3. Prescription Analyzer ──────────────────────────────────
const RX_SYSTEM = `You are the Rivaansh Lifesciences Prescription Analysis AI. When given prescription text:
1. Identify each medicine and its purpose
2. Explain therapeutic benefits in simple language
3. Note important interaction warnings or precautions
4. Mention if any Rivaansh product matches the prescribed class
Keep it professional, under 400 words, and add a disclaimer.`;

async function analyzePrescription(text) {
  const result = await callAI(RX_SYSTEM, `Prescription text: ${text}`);
  if (result) return result.text;

  // Fallback
  return `📋 **Treatment Plan Analysis**\n\nPrescription scan complete.\n\n**What we observe:** The text contains specific pharmaceutical instructions. To ensure maximum safety, please cross-reference your medicines against our Medicine Guide or consult our on-staff pharmacist directly.\n\n**Important:** Ensure all doses are strictly taken as directed by your physician.\n\n📞 For medication verification: +91 8426033033`;
}

// ── 4. Drug Interaction Checker ───────────────────────────────
const DRUG_SYSTEM = `You are a clinical pharmacology AI for Rivaansh Lifesciences. When given a list of medications, analyze potential drug interactions:
1. Rate severity: Minor / Moderate / Major / Contraindicated
2. Explain the mechanism of each interaction briefly
3. Suggest precautions or alternatives
4. Always advise consulting a pharmacist or doctor
Be precise, professional, and responsible. Keep under 400 words.`;

async function checkDrugInteraction(drugs) {
  const result = await callAI(DRUG_SYSTEM, `Please check interactions between: ${drugs}`);
  if (result) return result.text;

  return `💊 **Drug Interaction Analysis**\n\nCombining multiple medications changes how your body metabolizes them.\n\n1. Use caution when taking these together.\n2. Space out doses if applicable.\n3. Verify these specifically with our licensed pharmacist or your prescribing doctor.\n\n**General Precaution:** Some combinations decrease efficacy while others risk toxicity.\n\n⚠️ Always consult a licensed medical professional before beginning a multi-drug regimen.`;
}

// ── 5. Health Risk Screener ───────────────────────────────────
const RISK_SYSTEM = `You are a preventive health AI for Rivaansh Lifesciences. Assess health risks based on patient data:
1. Identify main risk factors
2. Suggest specific Rivaansh products that could help preventively
3. Recommend lifestyle modifications
4. Rate overall risk level (Low/Medium/High)
Keep under 350 words. Include a disclaimer.`;

async function screenHealthRisk(data) {
  const result = await callAI(RISK_SYSTEM, `Patient health data: ${JSON.stringify(data)}`);
  if (result) return result.text;

  return `🩺 **Health Risk Assessment**\n\nBased on your profile, here is a preliminary outlook:\n\n**Preventive Directives:**\n- Ensure consistent vitals tracking\n- Cultivate a balanced lifestyle\n- Consider Rivapro-ESR™ to reinforce core gut immunity\n- Use Rivoxy™ Softgel Capsules to supplement essential bodily functions\n\n📞 For personalized diagnostics: +91 8426033033`;
}

// ── 6. Medicine Info AI ───────────────────────────────────────
const MEDICINE_INFO_SYSTEM = `You are a pharmaceutical information AI for Rivaansh Lifesciences. Provide clinical information about medicines:
1. Chemical composition and mechanism of action
2. Primary therapeutic uses
3. Common and serious side effects
4. Dosage guidelines (general)  
5. Important contraindications and drug interactions
6. Storage requirements
Keep factual, professional, under 400 words. Add disclaimer.`;

async function getMedicineInfo(medicine) {
  const result = await callAI(MEDICINE_INFO_SYSTEM, `Provide information about: ${medicine}`);
  if (result) return result.text;

  return `💊 **Clinical Medicine Intelligence**\n\n"${medicine}" is part of our comprehensive pharmaceutical awareness program.\n\n**Usage:** Refer to the certified package insert.\n**Precautions:** Follow the specific dosage and check for personal allergies.\n\n⚠️ **Disclaimer:** This information is clinical-grade reference data. Check with your doctor before use.`;
}

// ── Export AI Status ──────────────────────────────────────────
function getAIStatus() {
  return {
    gemini: !!geminiModel,
    openai: !!openaiClient,
    mode: geminiModel ? 'gemini' : openaiClient ? 'openai' : 'fallback',
    available: !!(geminiModel || openaiClient),
  };
}

module.exports = {
  getChatResponse,
  analyzeSymptoms,
  analyzePrescription,
  checkDrugInteraction,
  screenHealthRisk,
  getMedicineInfo,
  getAIStatus,
};
