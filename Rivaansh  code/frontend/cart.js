/**
 * cart.js — Server-Synced Cart Module for Rivaansh Lifesciences
 * Handles: GET/POST cart, sync updates, no localStorage cart persistence
 */
import api from './api.js';
import { isLoggedIn } from './auth.js';

// ── State ─────────────────────────────────────────────────────────────────────
let _cart = { items: [], total: 0 } ;

// ── Listeners ─────────────────────────────────────────────────────────────────
const _listeners = new Set();
export function onCartChange(fn) { _listeners.add(fn); }
function _notify() { _listeners.forEach(fn => fn(_cart)); }

// ── Getters ───────────────────────────────────────────────────────────────────
export function getCart() { return _cart; }
export function getCartItems() { return Array.isArray(_cart.items) ? _cart.items : []; }
export function getItemCount() { return getCartItems().reduce((s, i) => s + (i.quantity || 0), 0); }
export function getSubtotal() { return getCartItems().reduce((s, i) => s + ((i.price || 0) * (i.quantity || 0)), 0); }
export function getDeliveryFee() { return getSubtotal() >= 499 ? 0 : 49; }
export function getTotal() { return getSubtotal() + getDeliveryFee(); }
export function isInCart(id) { return getCartItems().some(item => item.productId === id || item._id === id); }

// ── Fetch cart from backend
export async function fetchCart() {
    if (!isLoggedIn()) {
        _cart = { items: [], total: 0 };
        _notify();
        return _cart;
    }

    showLoader(true);
    const { ok, data } = await api.get('/api/cart');
    showLoader(false);

    if (!ok) {
        showToast(data.message || 'Unable to fetch cart.');
        return _cart;
    }

    _cart = { items: Array.isArray(data.items) ? data.items : [], total: data.total || getSubtotal() };
    _notify();
    return _cart;
}

// ── Add/update item
export async function addToCart(productId, quantity = 1) {
    if (!isLoggedIn()) {
        window.dispatchEvent(new CustomEvent('auth:required'));
        return { ok: false, message: 'Please login to add to cart.' };
    }
    if (!productId) return { ok: false, message: 'Invalid product.' };

    const { ok, data } = await api.post('/api/cart', { productId, quantity });

    if (!ok) {
        showToast(data?.message || 'Could not add to cart.', 'er');
        return { ok: false, message: data?.message };
    }
    
    // ✅ Fetch fresh cart after add
    await fetchCart();
    showToast('Item added to cart.', 'success');
    return { ok: true, cart: _cart };
}

// ── Remove item (quantity zero via POST)
export async function removeFromCart(productId) {
    if (!isLoggedIn()) return { ok: false, message: 'Please login.' };
    if (!productId) return { ok: false, message: 'Invalid product.' };

    showLoader(true);
    const { ok, data } = await api.post('/api/cart', { productId, quantity: 0 });
    showLoader(false);

    if (!ok) {
        showToast(data.message || 'Could not remove item.', 'er');
        return { ok: false, message: data.message };
    }
    await fetchCart();
    showToast('Item removed from cart.');
    return { ok: true, cart: _cart };
}

// ── Update quantity
export async function updateQty(productId, delta) {
    if (!isLoggedIn()) return { ok: false, message: 'Please login first.' };
    if (!productId || !delta) return { ok: false, message: 'Invalid data.' };

    const item = getCartItems().find(i => i.productId === productId || i._id === productId);
    if (!item) return { ok: false, message: 'Product missing in cart.' };

    const newQty = (item.quantity || 0) + delta;
    return addToCart(productId, newQty > 0 ? newQty : 0);
}

// ── Clear cart
export async function clearCart() {
    if (!isLoggedIn()) return { ok: false, message: 'Please login.' };

    showLoader(true);
    const { ok, data } = await api.post('/api/cart', { items: [] });
    showLoader(false);

    if (!ok) {
        showToast(data.message || 'Could not clear cart.', 'er');
        return { ok: false, message: data.message };
    }
    _cart = { items: [], total: 0 };
    _notify();
    return { ok: true };
}

function showLoader(on) { window.dispatchEvent(new CustomEvent('loader:toggle', { detail: { on } })); }
function showToast(msg, type = 'success') { if (typeof window.toast === 'function') window.toast(msg, type); }
