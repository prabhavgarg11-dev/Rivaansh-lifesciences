/**
 * api.js — Rivaansh Lifesciences API Client
 * Provides a typed fetch wrapper with auth header support.
 * Imported as an ES module where needed (Vite / React builds).
 */

const BASE_URL = 'https://rivaansh-lifesciences.onrender.com';

/**
 * Generic API helper — returns { ok, status, data } format
 * @param {string} endpoint - path, e.g. "/api/products"
 * @param {object} [options] - fetch options (method, body, headers, etc.)
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function api(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Attach user token if present
    const userToken = localStorage.getItem('userToken');
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

    // Attach admin token if present
    const adminToken = localStorage.getItem('rv_admin_token');
    if (adminToken) headers['x-admin-token'] = adminToken;

    try {
        const res = await fetch(BASE_URL + endpoint, {
            ...options,
            headers
        });

        const data = await res.json().catch(() => ({}));
        
        // Trigger auth expiry event on 401
        if (!res.ok && res.status === 401) {
            window.dispatchEvent(new Event('auth:expired'));
        }

        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        console.error(`[Rivaansh API] ${options.method || 'GET'} ${endpoint} →`, err.message);
        return { ok: false, status: 0, data: { message: err.message } };
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

export const getCart       = () => api('/api/cart');
export const syncCart      = body => api('/api/cart', { method: 'POST', body: JSON.stringify(body) });

export const getOrders     = () => api('/api/orders');
export const getOrder      = id => api(`/api/orders/${id}`);

export const createOrder   = body => api('/api/orders', { method: 'POST', body: JSON.stringify(body) });

export const confirmPayment = (id, body) =>
    api(`/api/orders/${id}/payment-confirmation`, { method: 'POST', body: JSON.stringify(body) });

export const getPrescriptions    = ()     => api('/api/prescriptions');
export const uploadPrescription  = body  =>
    api('/api/prescriptions', { method: 'POST', body: JSON.stringify(body) });

export const adminLogin = (email, password) =>
    api('/api/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const adminStats = () => api('/api/admin/stats');

// Convenience methods for api object
api.get    = (endpoint, opts = {}) => api(endpoint, { ...opts, method: 'GET' });
api.post   = (endpoint, body, opts = {}) =>
    api(endpoint, { ...opts, method: 'POST', body: JSON.stringify(body) });
api.put    = (endpoint, body, opts = {}) =>
    api(endpoint, { ...opts, method: 'PUT', body: JSON.stringify(body) });
api.delete = (endpoint, opts = {}) => api(endpoint, { ...opts, method: 'DELETE' });
api.postForm = (endpoint, formData, opts = {}) => {
    // Don't set Content-Type — let browser set multipart boundary
    return fetch(BASE_URL + endpoint, {
        method: 'POST',
        headers: { 'x-admin-token': localStorage.getItem('rv_admin_token') || '',
                   'Authorization': `Bearer ${localStorage.getItem('userToken') || ''}` },
        body: formData,
        ...opts
    }).then(async res => {
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    });
};

export { BASE_URL };
export default api;