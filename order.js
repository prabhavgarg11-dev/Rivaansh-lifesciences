/**
 * order.js — Order & Prescription Module for Rivaansh Lifesciences
 * Handles: Place order, fetch orders, prescription upload, status display
 */
import api from './api.js';
import { isLoggedIn } from './auth.js';
import { getCartItems, getSubtotal, getDeliveryFee, getTotal, clearCart } from './cart.js';

let _orders = [];
let _rxFile = null;
let _rxStatus = 'none';

export function getOrders() { return _orders; }
export function getRxFile() { return _rxFile; }
export function getRxStatus() { return _rxStatus; }

export function setRxFile(file) {
    _rxFile = file;
    _rxStatus = file ? 'attached' : 'none';
    _notifyRx();
}

const _orderListeners = new Set();
const _rxListeners = new Set();
export function onOrdersChange(fn) { _orderListeners.add(fn); }
export function onRxChange(fn) { _rxListeners.add(fn); }
function _notify() { _orderListeners.forEach(fn => fn(_orders)); }
function _notifyRx() { _rxListeners.forEach(fn => fn(_rxFile, _rxStatus)); }

export async function placeOrder(address, phone) {
    if (!isLoggedIn()) return { ok: false, message: 'Please log in.' };

    const items = getCartItems();
    if (!items.length) return { ok: false, message: 'Cart is empty.' };

    if (!address || address.trim().length < 10) return { ok: false, message: 'Enter valid address.' };

    const hasRx = items.some(i => i.prescriptionRequired);
    if (hasRx && !_rxFile) return { ok: false, message: 'Upload prescription.' };

    const payload = {
        items: items.map(i => ({ productId: i.productId || i._id, quantity: i.quantity || 1, price: i.price || 0 })),
        address: address.trim(),
        phone: phone || '',
        totalAmount: getTotal(),
    };

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    if (_rxFile) formData.append('prescription', _rxFile);

    const { ok, data } = await api.postForm('/api/orders', formData);

    if (!ok) {
        const msg = data?.message || 'Order placement failed.';
        showToast(msg, 'er');
        return { ok: false, message: msg };
    }

    // ✅ Reset state after successful order
    _rxFile = null;
    _rxStatus = 'none';
    _notifyRx();

    // ✅ Clear cart from server
    await clearCart();
    
    // ✅ Fetch fresh orders
    await fetchOrders();

    // ✅ Dispatch success event for UI to redirect
    showToast('Order placed successfully!', 'success');
    window.dispatchEvent(new CustomEvent('order:placed', { detail: { orderId: data._id } }));

    return { ok: true, order: data };
}

export async function fetchOrders() {
    if (!isLoggedIn()) return [];

    showLoader(true);
    const { ok, data } = await api.get('/api/orders');
    showLoader(false);

    if (ok && Array.isArray(data)) {
        _orders = data;
    } else {
        _orders = [];
    }
    _notify();
    return _orders;
}

export async function uploadPrescription(file) {
    if (!file) {
        showToast('Please select a file', 'er');
        throw new Error('No file provided');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'er');
        throw new Error('File too large');
    }

    // Validate file type
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) {
        showToast('Only JPG, PNG, or PDF allowed', 'er');
        throw new Error('Invalid file type');
    }

    const formData = new FormData();
    formData.append('file', file);

    showLoader(true);
    try {
        const { ok, status, data } = await api.postForm('/api/upload', formData);
        showLoader(false);

        if (!ok) {
            const msg = data?.message || `Upload failed (${status})`;
            showToast(msg, 'er');
            throw new Error(msg);
        }

        const fileUrl = data?.url || data?.fileUrl || data?.path;
        if (!fileUrl) {
            showToast('Upload succeeded but no file URL returned', 'er');
            throw new Error('Missing file URL in response');
        }

        showToast('Prescription uploaded successfully', 'success');
        return fileUrl;

    } catch (err) {
        showLoader(false);
        console.error('Prescription upload error:', err);
        showToast(err.message || 'Upload failed. Please try again.', 'er');
        throw err;
    }
}

export function renderOrdersPage(container) {
    if (!container) return;

    const orders = getOrders();
    if (!orders.length) {
        container.innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--tm)">
            <span class="material-icons-round" style="font-size:48px;display:block;margin-bottom:12px">shopping_bag</span>
            <p style="font-weight:600">No orders yet</p>
            <p style="font-size:.85rem;margin-bottom:16px">Start by browsing our products and placing an order.</p>
            <button class="bo" onclick="showPage('products')" style="padding:10px 20px">Browse Products</button>
        </div>`;
        return;
    }

    container.innerHTML = `<div style="display:flex;flex-direction:column;gap:12px;padding:0 12px">` +
        orders.map(o => `
        <div style="background:var(--bgs);border-radius:10px;padding:16px;border-left:4px solid var(--pr)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                <div>
                    <div style="font-weight:700;font-size:.9rem">Order #${o._id.slice(-8).toUpperCase()}</div>
                    <div style="font-size:.75rem;color:var(--tm)">${new Date(o.createdAt).toLocaleDateString()}</div>
                </div>
                <span class="order-stat" style="background:${o.status === 'delivered' ? 'var(--su)' : 'var(--pr)'};color:white;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:700">
                    ${o.status?.toUpperCase() || 'PENDING'}
                </span>
            </div>
            <div style="font-size:.85rem;color:var(--tm);margin-bottom:8px">
                <strong># of items:</strong> ${o.items?.length || 0}
            </div>
            <div style="font-size:.85rem;color:var(--tm);margin-bottom:8px">
                <strong>Total:</strong> <span style="color:var(--pr);font-weight:700">₹${o.totalAmount || 0}</span>
            </div>
            ${o.address ? `<div style="font-size:.8rem;color:var(--tm);margin-bottom:8px"><strong>📍 Delivery:</strong> ${o.address}</div>` : ''}
            <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd)">
                <details style="cursor:pointer">
                    <summary style="font-size:.82rem;font-weight:700;color:var(--pr);user-select:none">View Items</summary>
                    <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
                        ${o.items?.map(i => `
                        <div style="display:flex;justify-content:space-between;font-size:.8rem;padding:6px;background:var(--bg);border-radius:6px">
                            <span>${i.name || 'Product'} <strong>×${i.quantity || 1}</strong></span>
                            <span style="font-weight:700">₹${(i.price || 0) * (i.quantity || 1)}</span>
                        </div>`).join('') || '<p style="font-size:.8rem;color:var(--tm)">No items</p>'}
                    </div>
                </details>
            </div>
        </div>`).join('') + `</div>`;
}

function showLoader(on) { window.dispatchEvent(new CustomEvent('loader:toggle', { detail: { on } })); }
function showToast(msg, type = 'success') { if (typeof window.st === 'function') window.st(msg, type); }

