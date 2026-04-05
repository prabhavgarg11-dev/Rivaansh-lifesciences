/**
 * api.js — Rivaansh Lifesciences API Client
 * Provides a typed fetch wrapper with auth header support.
 * Imported as an ES module where needed (Vite / React builds).
 */

const _isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
const BASE_URL = _isLocal
    ? 'http://localhost:5000'
    : 'https://rivaansh-lifesciences.onrender.com';

/**
 * Generic API helper
 * @param {string} endpoint - path, e.g. "/api/products"
 * @param {object} [options] - fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}
 */
async function api(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Attach admin token from localStorage if present
    const adminToken = localStorage.getItem('rv_admin_token');
    if (adminToken) headers['x-admin-token'] = adminToken;

    try {
        const res = await fetch(BASE_URL + endpoint, {
            ...options,
            headers
        });

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({ message: res.statusText }));
            throw new Error(errBody.message || `HTTP ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        console.error(`[Rivaansh API] ${options.method || 'GET'} ${endpoint} →`, err.message);
        throw err;
    }
}

// ── Convenience helpers ───────────────────────────────────────

export const getProducts = (params = {}) => {
    const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v && v !== 'all'))
    ).toString();
    return api('/api/products' + (qs ? '?' + qs : ''));
};

export const getProduct    = id  => api(`/api/products/${id}`);

export const createOrder   = body => api('/api/orders', { method: 'POST', body: JSON.stringify(body) });

export const confirmPayment = (id, body) =>
    api(`/api/orders/${id}/payment-confirmation`, { method: 'POST', body: JSON.stringify(body) });

export const getPrescriptions    = ()     => api('/api/prescriptions');
export const uploadPrescription  = body  =>
    api('/api/prescriptions', { method: 'POST', body: JSON.stringify(body) });

export const adminLogin = (email, password) =>
    api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const adminStats = () => api('/api/admin/stats');

export { BASE_URL };
export default api;