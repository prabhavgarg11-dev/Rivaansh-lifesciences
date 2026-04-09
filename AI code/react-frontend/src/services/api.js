/**
 * Rivaansh Lifesciences — Central API Service
 * All backend communication goes through this file.
 * In dev: Vite proxies /api → http://localhost:5000
 * In prod: set VITE_API_URL to your backend URL
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

// ── Image URL resolver ────────────────────────────────────────
// Products from the DB may have relative paths like "images/rivakold.jpg"
// These are served by the Express server at /images/...
export function resolveImageUrl(imagePath) {
  if (!imagePath) return `https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400`;
  if (imagePath.startsWith('http')) return imagePath; // already absolute
  // Relative path → served by Express backend
  return `${BASE_URL}/${imagePath}`;
}

// ── Generic fetch helper ──────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error(`[API] ${endpoint} failed:`, err.message);
    throw err;
  }
}

// ── Products API ───────────────────────────────────────────────
export async function fetchProducts() {
  return apiFetch('/api/products');
}

export async function fetchProductById(id) {
  return apiFetch(`/api/products/${id}`);
}

export async function fetchProductsByCategory(category) {
  return apiFetch(`/api/products/category/${encodeURIComponent(category)}`);
}

// ── AI Chat API ───────────────────────────────────────────────
export async function sendChatMessage(message) {
  return apiFetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function analyzeSymptoms(symptoms) {
  return apiFetch('/api/ai/symptom', {
    method: 'POST',
    body: JSON.stringify({ symptoms }),
  });
}

export async function getMedicineInfo(medicine) {
  return apiFetch('/api/ai/medicine-info', {
    method: 'POST',
    body: JSON.stringify({ medicine }),
  });
}

export async function checkDrugInteraction(drugs) {
  return apiFetch('/api/ai/drug-interact', {
    method: 'POST',
    body: JSON.stringify({ drugs }),
  });
}

export async function getAIStatus() {
  return apiFetch('/api/ai/status');
}

// ── Health Check ──────────────────────────────────────────────
export async function checkServerHealth() {
  return apiFetch('/api/health');
}
