/**
 * auth.js — Authentication Module for Rivaansh Lifesciences
 * Handles: Login, Signup, Auto-login, Auto-logout, Cross-tab sync
 */
import api from './api.js';

// ── State ─────────────────────────────────────────────────────────────────────
let _user = null;  // { _id, name, email, isAdmin }
let _token = localStorage.getItem('rl_token') || null;

// ── Token helpers ─────────────────────────────────────────────────────────────
function saveToken(token) {
    _token = token;
    localStorage.setItem('rl_token', token);
}

function clearToken() {
    _token = null;
    localStorage.removeItem('rl_token');
}

export function getToken() { return _token; }
export function getUser()  { return _user; }
export function isLoggedIn() { return !!_token; }

// ── JWT expiry check (client-side) ────────────────────────────────────────────
function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

// ── Listeners ─────────────────────────────────────────────────────────────────
const _listeners = new Set();
export function onAuthChange(fn) { _listeners.add(fn); }
function _notify() { _listeners.forEach(fn => fn(_user, _token)); }

// ── Auto-logout when token expires via global event ───────────────────────────
window.addEventListener('auth:expired', () => {
    logout(false); // silent — no toast for background expiry (called from api.js 401)
    showToast('Session expired. Please sign in again.', 'info');
});

// ── Cross-tab sync ────────────────────────────────────────────────────────────
window.addEventListener('storage', (e) => {
    if (e.key === 'userToken') {
        if (!e.newValue) {
            // Logged out in another tab
            _user = null;
            _token = null;
            _notify();
        } else {
            // Logged in from another tab
            _token = e.newValue;
            _notify();
        }
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════
export async function login(email, password) {
    if (!email || !password) return { ok: false, message: 'Please fill in all fields.' };

    const { ok, data } = await api.post('/api/users/login', { email, password });

    if (ok && data.token) {
        saveToken(data.token);
        _user = { _id: data._id, name: data.name || '', email: data.email, isAdmin: data.isAdmin };
        
        // ✅ Sync cart after successful login
        if (typeof window.Cart !== 'undefined' && window.Cart.fetchCart) {
            try {
                await window.Cart.fetchCart();
            } catch (err) {
                console.error('Cart sync failed:', err);
            }
        }
        
        _notify();
        return { ok: true, user: _user };
    }
    return { ok: false, message: data.message || 'Login failed.' };
}

// ══════════════════════════════════════════════════════════════════════════════
// REGISTER
// ══════════════════════════════════════════════════════════════════════════════
export async function register(name, email, phone, password) {
    if (!name || !email || !phone || !password)
        return { ok: false, message: 'Please fill in all fields.' };
    if (password.length < 6)
        return { ok: false, message: 'Password must be at least 6 characters.' };

    const { ok, data } = await api.post('/api/users/register', { name, email, phone, password });

    if (ok && data.token) {
        saveToken(data.token);
        _user = { _id: data._id, name: data.name, email: data.email, isAdmin: data.isAdmin };
        _notify();
        return { ok: true, user: _user };
    }
    return { ok: false, message: data.message || 'Registration failed.' };
}

// ══════════════════════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════════════════════
export function logout(showMsg = true) {
    _user = null;
    clearToken();
    _notify();
    if (showMsg) showToast('Logged out successfully.', 'info');
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-LOGIN on page load
// ══════════════════════════════════════════════════════════════════════════════
export async function init() {
    if (!_token) return;

    // Client-side expiry check first (saves a round-trip)
    if (isTokenExpired(_token)) {
        clearToken();
        _notify();
        return;
    }

    // Verify with server by calling a protected endpoint
    const { ok, data } = await api.get('/api/cart');
    if (ok) {
        // We don't store full user here; parse name from cache or use placeholder
        const stored = JSON.parse(localStorage.getItem('userInfo') || 'null');
        _user = stored || { name: 'User' };
        _notify();
    } else {
        clearToken();
        localStorage.removeItem('userInfo');
        _notify();
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// Persist user info for offline access
// ══════════════════════════════════════════════════════════════════════════════
export function cacheUserInfo(user) {
    localStorage.setItem('userInfo', JSON.stringify(user));
    _user = user;
}

// Helper — uses window.toast defined in script.js
function showToast(msg, type = 'info') {
    if (typeof window.toast === 'function') {
        window.toast(msg, type);
    } else {
        console.warn('[Auth] Toast not available:', msg);
    }
}
