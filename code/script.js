/**
 * script.js — Rivaansh Lifesciences Frontend Engine
 * Features: API fetch, search/filter, cart (localStorage), orders, modal
 *
 * Razorpay Integration:
 * 1. Sign up at https://razorpay.com
 * 2. Get Test API Key from Dashboard
 * 3. Replace 'rzp_test_YOUR_TEST_KEY_HERE' with your key
 * 4. For production, use Live Key and enable webhooks
 */

const API = (() => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // Local dev: use backend port 5000 explicitly
    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    // Production staging (same domain) fallback
    return `${protocol}//${host}`;
})();

// ── State ──────────────────────────────────────────────────────────────────
let _allProducts   = [];   // full catalogue from API
let _filtered      = [];   // currently shown on products page
let _currentCat    = 'all';

// Normalize image URLs from backend data sources
function getProductImageUrl(image) {
    if (!image) return 'https://placehold.co/400x300/e0f5f2/0a7c6e?text=No+Image';

    const normalized = String(image).trim();
    if (/^(https?:)?\/\//i.test(normalized)) {
        return normalized.startsWith('http') ? normalized : `${window.location.protocol}${normalized}`;
    }

    return `${API}/${normalized.replace(/^\/?/, '')}`;
}

let _currentSearch = '';
let _currentSort   = 'default';
let _cart          = JSON.parse(localStorage.getItem('rv_cart') || '[]');
let _orders        = JSON.parse(localStorage.getItem('rv_orders') || '[]');
let _wishlist      = JSON.parse(localStorage.getItem('rv_wishlist') || '[]');
let _subscriptions= JSON.parse(localStorage.getItem('rv_subscriptions') || '[]');
let _notifications= JSON.parse(localStorage.getItem('rv_notifications') || '[]');
let _prescriptions= JSON.parse(localStorage.getItem('rv_prescriptions') || '[]');
let _users        = JSON.parse(localStorage.getItem('rv_users') || '[]');
let _user         = JSON.parse(localStorage.getItem('rv_user') || 'null');
let _reviews      = JSON.parse(localStorage.getItem('rv_reviews') || '[]');
let _cartOpen      = false;

const ADMIN_CREDENTIALS = { email: 'admin@rivaansh.com', password: 'Admin@123', name: 'Administrator', role: 'admin' };

// ── DOM READY ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize admin user if missing
    if (!_users.length) {
        _users.push({
            uid: 'admin_1',
            name: ADMIN_CREDENTIALS.name,
            email: ADMIN_CREDENTIALS.email,
            password: ADMIN_CREDENTIALS.password,
            role: ADMIN_CREDENTIALS.role
        });
        localStorage.setItem('rv_users', JSON.stringify(_users));
    }

    attachSearch();
    renderCart();
    updateCartBadge();
    renderAuthButtons();
    renderOrders();
    await loadProducts();
    updateAdminStats();
    hideLoader();
});

// ── LOADER ─────────────────────────────────────────────────────────────────
function hideLoader() {
    const l = document.getElementById('loader');
    if (l) { l.classList.add('hidden'); }
}

// ── FETCH PRODUCTS ─────────────────────────────────────────────────────────
async function loadPrescriptions() {
    try {
        const res = await fetch(`${API}/api/prescriptions`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const serverPrescriptions = await res.json();
        if (Array.isArray(serverPrescriptions) && serverPrescriptions.length) {
            _prescriptions = serverPrescriptions;
            localStorage.setItem('rv_prescriptions', JSON.stringify(_prescriptions));
        }
    } catch (err) {
        console.warn('Could not load prescriptions from backend; using local storage fallback.', err.message);
    }
}

async function loadProducts() {
    console.log('🔄 Starting to load products from API...');
    try {
        const apiUrl = `${API}/api/products`;
        console.log('📡 Fetching from:', apiUrl);
        const res = await fetch(apiUrl);
        console.log('📡 Response status:', res.status);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const data = await res.json();
        console.log('📦 Raw API response:', data);
        if (!Array.isArray(data) || !data.length) {
            throw new Error('API returned empty or invalid product array');
        }
        _allProducts = data;
        console.log(`✅ Loaded ${data.length} products from backend`);

        // Convert relative backend image paths into full API URLs
        _allProducts = _allProducts.map(p => ({
            ...p,
            image: getProductImageUrl(p.image)
        }));
        _filtered = [..._allProducts];
        console.log('🎨 Processed products with images:', _allProducts.slice(0, 3)); // Log first 3

        renderHome();
        renderProductsPage();
        renderAISuggestions();
        renderWishlistPage();
        populatePrescriptionProductOptions();
        await loadPrescriptions();
        renderPrescriptionsPage();
    } catch (err) {
        console.error('❌ Fetch error:', err.message);
        console.log('🔄 Falling back to local products...');
        addNotification('Could not reach backend server, loading local fallback products.', 'error');
        loadFallbackProducts();
        showError(true);
    }
}

function loadFallbackProducts() {
    _allProducts = [
        { id: 101, name: 'Vitamin C 500mg', price: 249, originalPrice: 299, category: 'vitamins', brand: 'Rivaansh', composition: 'Ascorbic Acid', image: 'https://placehold.co/400x300/e0f5f2/0a7c6e?text=Vitamin+C', badge:'Popular', prescriptionRequired:false },
        { id: 102, name: 'Glucose Powder', price: 179, originalPrice: 219, category: 'nutrition', brand: 'Rivaansh', composition: 'Dextrose', image: 'https://placehold.co/400x300/e0f5f2/0a7c6e?text=Glucose', badge:'Trending', prescriptionRequired:false },
        { id: 103, name: 'Paracetamol 500mg', price: 99, originalPrice: null, category: 'medicines', brand: 'Rivaansh', composition: 'Paracetamol', image: 'https://placehold.co/400x300/e0f5f2/0a7c6e?text=Paracetamol', badge:'', prescriptionRequired:false }
    ];
    _filtered = [..._allProducts];
    renderHome();
    renderProductsPage();
    renderAISuggestions();
}

// ── RENDER HOME (trending, first 8) ───────────────────────────────────────
function renderHome() {
    const grid = document.getElementById('homeGrid');
    if (!grid) return;
    const featured = _allProducts.slice(0, 8);
    grid.innerHTML = featured.map(p => cardHTML(p)).join('');
    animateCards(grid);
}

// ── RENDER PRODUCTS PAGE ───────────────────────────────────────────────────
function renderProductsPage() {
    const grid    = document.getElementById('allGrid');
    const counter = document.getElementById('productCount');
    const noRes   = document.getElementById('noResults');
    if (!grid) return;

    console.log(`🎨 Rendering products page with ${_filtered.length} products`);
    console.log('📋 Products to render:', _filtered.slice(0, 5)); // Log first 5

    if (!_filtered.length) {
        grid.innerHTML = '';
        if (noRes) noRes.classList.remove('hidden');
        if (counter) counter.textContent = '0 products found';
        return;
    }
    if (noRes) noRes.classList.add('hidden');
    if (counter) counter.textContent = `${_filtered.length} product${_filtered.length !== 1 ? 's' : ''} found`;

    grid.innerHTML = _filtered.map(p => cardHTML(p)).join('');
    animateCards(grid);
}

// ── CARD HTML ──────────────────────────────────────────────────────────────
function cardHTML(p) {
    const inCart      = _cart.find(i => i.id === p.id);
    const isWished    = _wishlist.includes(p.id);
    const discount    = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const badgeHTML   = p.badge ? `<div class="card-badge">${p.badge}</div>` : '';
    const rxHTML      = p.prescriptionRequired ? `<div class="rx-flag">Rx</div>` : '';
    const wishClass   = isWished ? 'wish active' : 'wish';
    const whatsappTxt = `Check out ${p.name} at Rivaansh Lifesciences! ${window.location.href}`;

    const addBtnHTML = inCart
        ? `<div class="qty-ctrl">
                <button onclick="event.stopPropagation(); updateQty(${p.id}, -1)">−</button>
                <span>${inCart.qty}</span>
                <button onclick="event.stopPropagation(); updateQty(${p.id}, +1)">+</button>
           </div>`
        : `<button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})">
                <i class="fa fa-plus"></i> Add
           </button>`;

    const subscribeHTML = `<button class="sub-btn" onclick="event.stopPropagation(); addSubscription(${p.id})">📅 Subscribe</button>`;

    return `
    <div class="product-card" onclick="openModal(${p.id})">
        <div class="card-img-wrap">
            <img src="${getProductImageUrl(p.image)}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300/e0f5f2/0a7c6e?text=Rivaansh'">
            ${badgeHTML}
            ${rxHTML}
        </div>
        <div class="card-body">
            <div class="card-brand">${p.brand || 'Rivaansh'}</div>
            <div class="card-name">${p.name}</div>
            <div class="card-comp">${p.composition}</div>
            ${getProductReviewsHTML(p.id)}
            <div class="card-footer">
                <div class="card-price-wrap">
                    <div class="card-price">
                        ₹${p.price}
                        ${discount > 0 ? `<span class="card-disc">${discount}% off</span>` : ''}
                    </div>
                    ${p.originalPrice ? `<div class="card-orig">₹${p.originalPrice}</div>` : ''}
                </div>
                ${addBtnHTML}
            </div>
            <div class="card-actions">
                <button class="${wishClass}" onclick="event.stopPropagation(); toggleWishlist(${p.id})"><i class="fa ${isWished ? 'fa-heart' : 'fa-heart-o'}"></i></button>
                <button class="btn-secondary" onclick="event.stopPropagation(); shareWhatsApp('${whatsappTxt}')"><i class="fa fa-whatsapp"></i></button>
                ${subscribeHTML}
            </div>
        </div>
    </div> `;
}

// ── ANIMATE CARDS ──────────────────────────────────────────────────────────
function animateCards(grid) {
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((c, i) => {
        c.style.animationDelay = `${i * 0.04}s`;
    });
}

// ── FILTER BY CATEGORY ─────────────────────────────────────────────────────
window.filterCat = function(cat, btn) {
    _currentCat = cat;
    // Update active button
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    applyFilters();
};

// ── SORT ───────────────────────────────────────────────────────────────────
window.sortProducts = function(val) {
    _currentSort = val;
    applyFilters();
};

// ── APPLY FILTERS + SORT ───────────────────────────────────────────────────
function applyFilters() {
    let list = [..._allProducts];

    if (_currentCat && _currentCat !== 'all') {
        list = list.filter(p => p.category?.toLowerCase() === _currentCat);
    }
    if (_currentSearch) {
        const q = _currentSearch.toLowerCase();
        list = list.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.composition?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        );
    }
    if (_currentSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (_currentSort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (_currentSort === 'name-asc')   list.sort((a, b) => a.name.localeCompare(b.name));

    _filtered = list;
    renderProductsPage();
    renderAISuggestions();
}

// ── SEARCH ─────────────────────────────────────────────────────────────────
function attachSearch() {
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (!input) return;

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            _currentSearch = input.value.trim();
            if (clear) clear.style.display = _currentSearch ? 'block' : 'none';
            if (_currentSearch) showPage('products');
            applyFilters();
        }, 280);
    });
}

window.clearSearch = function() {
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (input) input.value = '';
    if (clear) clear.style.display = 'none';
    _currentSearch = '';
    applyFilters();
};

// ── MODAL ──────────────────────────────────────────────────────────────────
window.openModal = function(id) {
    const p = _allProducts.find(x => x.id === id);
    if (!p) return;

    const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const inCart   = _cart.find(i => i.id === p.id);

    const addBtn = inCart
        ? `<button class="modal-add-btn" style="background:var(--su);" onclick="closeModalDirect(); toggleCart()"><i class="fa fa-bag-shopping"></i> View in Cart (${inCart.qty})</button>`
        : `<button class="modal-add-btn" onclick="addToCart(${p.id}); closeModalDirect()"><i class="fa fa-cart-plus"></i> Add to Cart</button>`;

    document.getElementById('modalContent').innerHTML = `
        <img class="modal-img" src="${getProductImageUrl(p.image)}" alt="${p.name}" onerror="this.src='https://placehold.co/700x260/e0f5f2/0a7c6e?text=Rivaansh'">
        <div class="modal-body">
            <div class="modal-brand">${p.brand}</div>
            <h2 class="modal-name">${p.name}</h2>
            <div class="modal-comp"><i class="fa fa-flask-vial"></i> ${p.composition}</div>
            <p class="modal-desc">${p.description || 'Clinical formulation by Rivaansh Lifesciences.'}</p>
            <div class="modal-price-row">
                <span class="modal-price">₹${p.price}</span>
                ${p.originalPrice ? `<span class="modal-orig">₹${p.originalPrice}</span>` : ''}
                ${discount > 0 ? `<span class="modal-save">Save ${discount}%</span>` : ''}
            </div>
            ${p.prescriptionRequired ? `<div class="modal-rx-warn"><i class="fa fa-prescription-bottle-medical"></i> This product requires a valid prescription.</div>
            <div class="prescription-upload">
                <label for="rxFileInput">Upload Prescription</label>
                <input id="rxFileInput" type="file" accept="image/*,.pdf" onchange="handlePrescriptionUpload(event, ${p.id})">
            </div>` : ''}
            <button class="modal-info-btn" onclick="toggleMedInfo(${p.id})"><i class="fa fa-book-medical"></i> View Clinical Info</button>
            <div id="modalMedInfo" class="modal-med-info hidden">
                <div class="med-info-grid" style="margin-top:15px; border-top:1px solid #eee; padding-top:15px;">
                    <div class="med-info-item"><h5>Uses</h5><p>${p.uses || 'Consult healthcare professional.'}</p></div>
                    <div class="med-info-item"><h5>Side Effects</h5><p>${p.sideEffects || 'Consult healthcare professional.'}</p></div>
                    <div class="med-info-item"><h5>Dosage</h5><p>${p.dosage || 'As directed by physician.'}</p></div>
                    <div class="med-info-item"><h5>Storage</h5><p>${p.storage || 'Recommended storage conditions.'}</p></div>
                </div>
            </div>
            ${getProductReviewsHTML(p.id)}
            <div class="modal-actions">
                ${addBtn}
                <button class="sub-btn" onclick="event.stopPropagation(); addSubscription(${p.id})">Subscribe & Save</button>
                <button class="sub-btn" onclick="event.stopPropagation(); openReviewModal(${p.id})"><i class="fa fa-star"></i> Leave Review</button>
                <button class="modal-close-btn" onclick="closeModalDirect()">Close</button>
            </div>
        </div>`;

    const overlay = document.getElementById('modal');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeModal = function(e) {
    if (e.target === document.getElementById('modal')) closeModalDirect();
};

window.closeModalDirect = function() {
    document.getElementById('modal').classList.remove('open');
    document.body.style.overflow = '';
};

// ── CART LOGIC ─────────────────────────────────────────────────────────────
window.addToCart = function(id) {
    const p = _allProducts.find(x => x.id === id);
    if (!p) return;
    const existing = _cart.find(i => i.id === id);
    if (existing) {
        existing.qty = Math.min(existing.qty + 1, 20);
    } else {
        _cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1, brand: p.brand });
    }
    saveCart();
    toast(`${p.name} added to cart`, 'success');
    refreshProductGrids();
};

window.removeFromCart = function(id) {
    _cart = _cart.filter(i => i.id !== id);
    saveCart();
    refreshProductGrids();
};

window.updateQty = function(id, delta) {
    const item = _cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, Math.min(item.qty + delta, 20));
    if (item.qty === 0) _cart = _cart.filter(i => i.id !== id);
    saveCart();
    refreshProductGrids();
};

function saveCart() {
    localStorage.setItem('rv_cart', JSON.stringify(_cart));
    renderCart();
    updateCartBadge();
}

function refreshProductGrids() {
    renderHome();
    renderProductsPage();
}

function updateCartBadge() {
    const total = _cart.reduce((s, i) => s + i.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    if (total > 0) {
        badge.textContent = total > 99 ? '99+' : total;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (!_cart.length) {
        container.innerHTML = `<div class="cart-empty"><i class="fa fa-bag-shopping"></i><p>Your cart is empty</p></div>`;
        document.getElementById('cartSubtotal').textContent = '₹0';
        document.getElementById('cartDelivery').textContent = '₹49';
        document.getElementById('cartTotal').textContent = '₹49';
        return;
    }

    container.innerHTML = _cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/50x50/e0f5f2/0a7c6e?text=R'">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price * item.qty}</div>
                <div class="cart-item-qty">
                    <button onclick="updateQty(${item.id}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="updateQty(${item.id}, +1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})"><i class="fa fa-trash"></i></button>
        </div>
    `).join('');

    const sub      = _cart.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = sub >= 499 ? 0 : 49;
    const total    = sub + delivery;

    document.getElementById('cartSubtotal').textContent = `₹${sub}`;
    document.getElementById('cartDelivery').textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
    document.getElementById('cartTotal').textContent    = `₹${total}`;
}

// ── CART DRAWER ────────────────────────────────────────────────────────────
window.toggleCart = function() {
    _cartOpen = !_cartOpen;
    document.getElementById('cartDrawer').classList.toggle('open', _cartOpen);
    document.getElementById('cartOverlay').classList.toggle('open', _cartOpen);
    document.body.style.overflow = _cartOpen ? 'hidden' : '';
};

// ── CHECKOUT ───────────────────────────────────────────────────────────────
async function createOrderOnServer() {
    const sub      = _cart.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = sub >= 499 ? 0 : 49;
    const payload = {
        products: _cart.map(i => ({ productId: i.id, quantity: i.qty })),
        totalAmount: sub + delivery,
        userName: _user?.name || 'Guest User',
        address: 'Rivaansh Hub, Jaipur, Rajasthan'
    };

    const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Order creation failed: ${res.status}`);
    return res.json();
}

async function confirmPayment(orderId, provider, paymentId, success = true) {
    return fetch(`${API}/api/orders/${orderId}/payment-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, paymentId, status: success ? 'Paid' : 'Failed' })
    });
}

window.checkout = async function() {
    if (!_cart.length) { toast('Your cart is empty', 'error'); return; }

    try {
        const data = await createOrderOnServer();
        if (!data || !data.order) throw new Error('Order creation failed.');

        const order = {
            id: data.order._id || 'ORD' + Date.now(),
            items: [..._cart],
            totalAmount: data.order.totalAmount,
            status: data.order.status,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        _orders.unshift(order);
        localStorage.setItem('rv_orders', JSON.stringify(_orders));
        _cart = [];
        saveCart();
        renderOrders();
        if (_cartOpen) toggleCart();
        toast('🎉 Order placed successfully!', 'success');
        showPage('orders');

    } catch (err) {
        console.error('Checkout error:', err);
        toast('Checkout failed. Please try again.', 'error');
    }
};

window.startPayment = async function(method) {
    if (!_cart.length) {
        toast('Cart is empty. Add items first.', 'error');
        return;
    }

    try {
        const initial = await createOrderOnServer();
        const orderId = initial.order?._id;
        if (!orderId) throw new Error('Order create failed');

        const amount = _cart.reduce((a, i) => a + i.price * i.qty, 0) * 100;

        if (method === 'razorpay') {
            if (typeof Razorpay === 'undefined') {
                toast('Razorpay SDK not loaded. Please refresh the page.', 'error');
                return;
            }

            // Razorpay Test Key (replace with your live key in production)
            const razorpayKey = 'rzp_test_YOUR_TEST_KEY_HERE'; // Get from https://dashboard.razorpay.com/

            const options = {
                key: razorpayKey,
                amount: amount, // Amount in paise (₹1 = 100 paise)
                currency: 'INR',
                name: 'Rivaansh Lifesciences',
                description: 'Healthcare Products Purchase',
                image: 'https://rivaanshlifesciences.com/logo.png', // Your logo URL
                prefill: {
                    email: _user?.email || '',
                    name: _user?.name || 'Guest User',
                    contact: _user?.phone || ''
                },
                notes: {
                    orderId: orderId,
                    userId: _user?.uid || 'guest'
                },
                theme: {
                    color: '#10B981' // Green theme matching your brand
                },
                handler: async function(response) {
                    try {
                        // Confirm payment on backend
                        await confirmPayment(orderId, 'razorpay', response.razorpay_payment_id, true);
                        toast(`Payment successful! ID: ${response.razorpay_payment_id}`, 'success');

                        // Clear cart and update UI
                        _cart = [];
                        saveCart();
                        updateCartBadge();
                        renderOrders();
                        showPage('orders');
                        toggleCart(); // Close cart drawer

                    } catch (err) {
                        console.error('Payment confirmation error:', err);
                        toast('Payment successful but confirmation failed. Contact support.', 'warning');
                    }
                },
                modal: {
                    ondismiss: function() {
                        toast('Payment cancelled by user', 'info');
                    },
                    confirm_close: true,
                    escape: true
                },
                retry: {
                    enabled: false // Disable retry for demo
                }
            };

            try {
                const rzp = new Razorpay(options);
                rzp.open();
            } catch (err) {
                console.error('Razorpay initialization error:', err);
                toast('Payment gateway error. Please try again.', 'error');
            }

        } else if (method === 'paypal') {
            const returnUrl = `${window.location.origin}/payment-success?order=${orderId}`;
            const cancelUrl = `${window.location.origin}/payment-fail`;
            const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=seller@rivaansh.com&item_name=Rivaansh+Order&amount=${(amount/100).toFixed(2)}&currency_code=INR&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}&custom=${orderId}`;
            window.open(url, '_blank');
            toast('Redirected to PayPal checkout', 'info');
        }

        _cart = [];
        saveCart();
        renderOrders();
        showPage('orders');

    } catch (err) {
        console.error('Payment init error:', err);
        toast('Payment initialization failed. Please try again.', 'error');
    }
};

window.shareWhatsApp = function(message) {
    const payload = encodeURIComponent(message || 'Check out Rivaansh Lifesciences pharmacy: ' + window.location.href);
    const link = `https://wa.me/?text=${payload}`;
    window.open(link, '_blank');
};

// ── ORDERS ─────────────────────────────────────────────────────────────────
function renderOrders() {
    const container = document.getElementById('ordersList');
    if (!container) return;

    if (!_orders.length) {
        container.innerHTML = `
            <div class="empty-orders">
                <div class="empty-icon"><i class="fa fa-clipboard-list"></i></div>
                <h3>No orders yet</h3>
                <p>Your confirmed purchases will appear here.</p>
                <button class="btn-primary" onclick="showPage('products')">Start Shopping</button>
            </div>`;
        return;
    }

    container.innerHTML = _orders.map(o => `
        <div class="order-card">
            <div class="order-top">
                <div>
                    <div class="order-id">Order #${String(o.id).slice(-8).toUpperCase()}</div>
                    <div class="order-date">${o.date}</div>
                </div>
                <span class="order-status ${o.status === 'delivered' ? 'delivered' : ''}">${(o.status || 'Confirmed').toUpperCase()}</span>
            </div>
            <p class="order-meta"><strong>${o.items?.length || 0} item(s)</strong> ordered</p>
            <p class="order-total">Total: ₹${o.totalAmount}</p>
            <details style="margin-top:10px; cursor:pointer;">
                <summary style="font-size:.82rem; font-weight:700; color:var(--tl); user-select:none;">View Items</summary>
                <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
                    ${(o.items || []).map(i => `
                        <div style="display:flex; justify-content:space-between; font-size:.8rem; padding:6px 10px; background:var(--bg); border-radius:6px;">
                            <span>${i.name} <strong>×${i.qty || i.quantity || 1}</strong></span>
                            <span style="font-weight:700;">₹${(i.price || 0) * (i.qty || i.quantity || 1)}</span>
                        </div>`).join('')}
                </div>
            </details>
        </div>
    `).join('');
}

// ── PAGE NAVIGATION ────────────────────────────────────────────────────────
window.showPage = function(page) {
    // Map compliance page aliases to actual page IDs
    const pageMap = {
        'privacy': 'privacyPage',
        'terms': 'termsPage',
        'refund': 'refundPage',
        'orderTracking': 'orderTrackingPage'
    };
    
    const pageId = pageMap[page] || (page + 'Page');

    if (pageId === 'adminPanelPage' && (!_user || !_user.isAdmin)) {
        toast('⚠️ Admin access required', 'error');
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');

    // Sync nav
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.toggle('active', l.dataset.page === page);
    });
    document.querySelectorAll('.bnav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === page);
    });

    if (pageId === 'orderTrackingPage') renderOrderTracking();
    updateAdminStats();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── AUTH (Sign in / sign up) ─────────────────────────────────────────────────
function saveAuthState() {
    localStorage.setItem('rv_user', JSON.stringify(_user));
    localStorage.setItem('rv_users', JSON.stringify(_users));
    renderAuthButtons();
}

function renderAuthButtons() {
    const authBtn = document.getElementById('authBtn');
    const userName = document.getElementById('authUserName');
    const adminNav = document.getElementById('adminNavLink');
    if (!authBtn || !userName) return;

    if (_user) {
        authBtn.textContent = 'Logout';
        authBtn.onclick = logout;
        userName.textContent = `Hi, ${_user.name}`;

        if (_user.isAdmin) {
            adminNav?.classList.remove('hidden');
            adminNav?.classList.add('active');
        } else {
            adminNav?.classList.add('hidden');
        }
    } else {
        authBtn.textContent = 'Login';
        authBtn.onclick = openAuthModal;
        userName.textContent = 'Guest';
        adminNav?.classList.add('hidden');
    }
    updateAdminStats();
}

window.switchAuthTab = function(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-tab-content');
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    contents.forEach(c => c.classList.toggle('active', c.id === `${tab}Tab`));
};

async function updateAdminStats() {
    if (!document.getElementById('adminPanelPage')) return;

    if (_user && _user.isAdmin) {
        const token = localStorage.getItem('rv_admin_token');
        if (token) {
            try {
                const res = await fetch(`${API}/api/admin/stats`, {
                    headers: { 'x-admin-token': token }
                });
                if (res.ok) {
                    const stats = await res.json();
                    document.getElementById('adminOrdersCount').textContent = stats.orders ?? _orders.length;
                    document.getElementById('adminPrescriptionsCount').textContent = stats.prescriptions ?? _prescriptions.filter(r => r.status === 'Pending').length;
                    document.getElementById('adminUsersCount').textContent = stats.users ?? _users.length;
                    document.getElementById('adminProductsCount').textContent = stats.products ?? _allProducts.length;
                    return;
                }
            } catch (err) {
                console.warn('Admin stats fetch failed:', err);
            }
        }
    }

    document.getElementById('adminOrdersCount').textContent         = _orders.length;
    document.getElementById('adminPrescriptionsCount').textContent  = _prescriptions.filter(r => r.status === 'Pending').length;
    document.getElementById('adminUsersCount').textContent          = _users.length;
    document.getElementById('adminProductsCount').textContent       = _allProducts.length;
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('open');
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('open');
}

window.registerUser = function() {
    const name  = document.getElementById('regName')?.value.trim();
    const email = document.getElementById('regEmail')?.value.trim().toLowerCase();
    const pass  = document.getElementById('regPassword')?.value;
    if (!name || !email || !pass) { toast('Please fill all signup fields', 'error'); return; }

    if (_users.find(u => u.email === email)) {
        toast('User already exists', 'error');
        return;
    }

    const newUser = { uid: `u_${Date.now()}`, name, email, password: pass, role: 'user' };
    _users.push(newUser);
    _user = { uid: newUser.uid, name: newUser.name, email: newUser.email, isAdmin: false };
    saveAuthState();
    closeAuthModal();
    toast('Signup successful', 'success');
};

window.loginUser = async function() {
    const email = document.getElementById('loginEmail')?.value.trim().toLowerCase();
    const pass  = document.getElementById('loginPassword')?.value;

    if (!email || !pass) {
        toast('Please enter email and password', 'error');
        return;
    }

    let user = _users.find(u => u.email === email && u.password === pass);

    // Accept hard-coded admin credentials even if local storage got cleared
    if (!user && email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
        user = { ...ADMIN_CREDENTIALS, uid: 'admin_1' };
        _users.push(user);
    }

    if (!user) {
        toast('Invalid email or password', 'error');
        return;
    }

    _user = { uid: user.uid, name: user.name, email: user.email, isAdmin: user.role === 'admin' };

    if (_user.isAdmin) {
        try {
            const res = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pass })
            });
            const data = await res.json();
            if (res.ok && data.token) {
                localStorage.setItem('rv_admin_token', data.token);
            }
        } catch (err) {
            console.warn('Admin login backend failed:', err);
        }
    }

    saveAuthState();
    closeAuthModal();
    toast('Login successful', 'success');

    if (_user.isAdmin) {
        showPage('adminPanel');
    }
};

function logout() {
    _user = null;
    saveAuthState();
    toast('Logged out successfully', 'info');
}

// ── WISHLIST ───────────────────────────────────────────────────────────────
function saveWishlist() {
    localStorage.setItem('rv_wishlist', JSON.stringify(_wishlist));
    renderWishlistCount();
}

function renderWishlistCount() {
    const el = document.getElementById('wishlistBadge');
    if (!el) return;
    el.textContent = _wishlist.length ? _wishlist.length : '';
}

window.toggleWishlist = function(id, evt) {
    if (evt) evt.stopPropagation();
    const i = _wishlist.indexOf(id);
    if (i < 0) {
        _wishlist.push(id);
        toast('Added to wishlist', 'success');
    } else {
        _wishlist.splice(i, 1);
        toast('Removed from wishlist', 'info');
    }
    saveWishlist();
    renderHome();
    renderProductsPage();
};

function renderWishlistPage() {
    const container = document.getElementById('wishlistGrid');
    if (!container) return;

    const list = _allProducts.filter(p => _wishlist.includes(p.id));
    if (!list.length) {
        container.innerHTML = '<div class="empty-wishlist"><i class="fa fa-heart-crack"></i><p>No items in wishlist yet.</p></div>';
        return;
    }
    container.innerHTML = list.map(p => cardHTML(p)).join('');
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────
function saveNotifications() {
    localStorage.setItem('rv_notifications', JSON.stringify(_notifications));
    renderNotificationsPanel();
}

function addNotification(message, type = 'info') {
    const note = { id: `n_${Date.now()}`, message, type, time: new Date().toLocaleTimeString('en-IN') };
    _notifications.unshift(note);
    if (_notifications.length > 25) _notifications.pop();
    saveNotifications();
    toast(message, type === 'error' ? 'error' : 'success');
}

function renderNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    const count = document.getElementById('notifBadge');
    if (!panel || !count) return;
    count.textContent = _notifications.length ? _notifications.length : '';
    panel.innerHTML = _notifications.map(n => `<div class="notif-item notif-${n.type}"><span>${n.message}</span><small>${n.time}</small></div>`).join('');
}

function savePrescriptions() {
    localStorage.setItem('rv_prescriptions', JSON.stringify(_prescriptions));
}

function renderPrescriptionsPage() {
    const section = document.getElementById('prescriptionsPage');
    if (!section) return;
    const list = section.querySelector('.prescription-list');
    if (!list) return;

    if (!_prescriptions.length) {
        list.innerHTML = '<div class="empty-prescriptions"><i class="fa fa-file-prescription"></i><p>No prescriptions uploaded yet.</p></div>';
        return;
    }

    list.innerHTML = _prescriptions.map(rx => {
        const isImage = rx.fileType?.startsWith('image/') || rx.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
        const isPdf = rx.fileType === 'application/pdf' || rx.fileName.match(/\.pdf$/i);

        let previewHtml = '';
        if (isImage) {
            previewHtml = `<img class="rx-preview-thumb" src="${rx.dataUrl}" alt="${rx.fileName}" onclick="openPreviewModal('${rx.dataUrl}', '${rx.fileType}')" />`;
        } else if (isPdf) {
            previewHtml = `<div class="rx-preview-pdf" onclick="openPreviewModal('${rx.dataUrl}', '${rx.fileType}')"><i class="fa fa-file-pdf"></i> View PDF</div>`;
        } else {
            previewHtml = `<div class="rx-preview">No preview available</div>`;
        }

        return `
        <div class="rx-card">
            <div class="rx-header">
                <strong>${rx.fileName}</strong>
                <span>${rx.uploadedAt}</span>
            </div>
            <div class="rx-meta">${rx.user} • Product ID ${rx.productId}</div>
            <div class="rx-meta">Status: <strong class="rx-status rx-${rx.status.toLowerCase()}">${rx.status}</strong></div>
            <div class="rx-comment">${rx.comment || '--'}</div>
            <div class="rx-preview-area">${previewHtml}</div>
            <div class="rx-actions">
                <a href="${rx.dataUrl}" download="${rx.fileName}" target="_blank" class="btn-secondary">Download</a>
                <button class="btn-secondary" onclick="removePrescription('${rx.id}')">Delete</button>
                ${rx.status === 'Pending' ? `
                    <button class="btn-secondary" onclick="updatePrescriptionStatus('${rx.id}', 'Approved')">Approve</button>
                    <button class="btn-secondary" onclick="updatePrescriptionStatus('${rx.id}', 'Rejected')">Reject</button>
                ` : ''}
            </div>
        </div>`;
    }).join('');
}

function openPreviewModal(dataUrl, fileType) {
    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewModalContent');
    if (!modal || !content) return;

    if (fileType?.startsWith('image/')) {
        content.innerHTML = `<img class="preview-zoom-img" src="${dataUrl}" alt="Preview" />`;
    } else if (fileType === 'application/pdf' || dataUrl.startsWith('data:application/pdf')) {
        content.innerHTML = `<iframe class="preview-zoom-iframe" src="${dataUrl}" frameborder="0"></iframe>`;
    } else {
        content.innerHTML = `<p>Preview not available for this file format.</p>`;
    }

    modal.classList.add('open');
}

function closePreviewModal(event) {
    if (event.target.id === 'previewModal' || event.target.id === 'previewModalClose') {
        const modal = document.getElementById('previewModal');
        if (modal) modal.classList.remove('open');
    }
}

window.toggleNotifications = function() {
    const pnl = document.getElementById('notificationsPanel');
    if (!pnl) return;
    pnl.classList.toggle('open');
};

// ── PRESCRIPTION UPLOAD ────────────────────────────────────────────────────
window.handlePrescriptionUpload = async function(e, productId) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
        const dataUrl = reader.result;
        const payload = {
            productId,
            user: _user ? _user.email : 'guest',
            fileName: file.name,
            uploadedAt: new Date().toLocaleString('en-IN'),
            fileType: file.type,
            dataUrl
        };

        try {
            const res = await fetch(`${API}/api/prescriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const saved = await res.json();
            _prescriptions.unshift(saved);
        } catch (err) {
            console.warn('Backend prescription upload failed, falling back to local:', err.message);
            const item = {
                id: `rx_${Date.now()}`,
                ...payload,
                status: 'Pending',
                comment: 'Awaiting pharmacist review',
                isReviewed: false
            };
            _prescriptions.unshift(item);
        }

        if (_prescriptions.length > 20) _prescriptions.pop();
        savePrescriptions();
        addNotification('Prescription uploaded successfully. Our pharmacist review will follow.', 'success');
        renderPrescriptionsPage();
    };
    reader.readAsDataURL(file);
};

function populatePrescriptionProductOptions() {
    const select = document.getElementById('rxProductSelect');
    if (!select || !_allProducts.length) return;

    select.innerHTML = '<option value="general">General Prescription</option>' +
        _allProducts
            .filter(p => p.prescriptionRequired)
            .map(p => `<option value="${p.id}">${p.name}</option>`)
            .join('');
}

window.uploadPrescriptionFromPanel = function() {
    const fileInput = document.getElementById('rxFileInputPanel');
    const productSelect = document.getElementById('rxProductSelect');
    const file = fileInput?.files?.[0];

    if (!file) {
        toast('Please choose a prescription file.', 'error');
        return;
    }

    const selectValue = productSelect?.value || 'general';
    const productId = selectValue === 'general' ? 'general' : Number(selectValue);

    const reader = new FileReader();
    reader.onload = async () => {
        const dataUrl = reader.result;
        const payload = {
            productId,
            user: _user ? _user.email : 'guest',
            fileName: file.name,
            uploadedAt: new Date().toLocaleDateString('en-IN'),
            fileType: file.type,
            dataUrl
        };

        try {
            const res = await fetch(`${API}/api/prescriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const saved = await res.json();
            _prescriptions.unshift(saved);
        } catch (err) {
            console.warn('Backend prescription upload failed, falling back to local:', err.message);
            const item = {
                id: `rx_${Date.now()}`,
                ...payload,
                status: 'Pending',
                comment: 'Awaiting pharmacist review',
                isReviewed: false
            };
            _prescriptions.unshift(item);
        }

        if (_prescriptions.length > 20) _prescriptions.pop();
        savePrescriptions();
        addNotification('Prescription uploaded successfully. Our pharmacist review will follow.', 'success');
        renderPrescriptionsPage();
        fileInput.value = '';
    };

    reader.readAsDataURL(file);
};

window.updatePrescriptionStatus = async function(id, status) {
    const rx = _prescriptions.find(x => x.id === id);
    if (!rx) return;

    try {
        const token = localStorage.getItem('rv_admin_token');
        const res = await fetch(`${API}/api/prescriptions/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'x-admin-token': token } : {})
            },
            body: JSON.stringify({ status, comment: status === 'Approved' ? 'Prescription approved by pharmacist.' : 'Prescription rejected. Please upload valid prescription.' })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        Object.assign(rx, updated);
    } catch (err) {
        rx.status = status;
        rx.comment = status === 'Approved' ? 'Prescription approved by pharmacist (offline mode).' : 'Prescription rejected. Please upload valid prescription.';
    }

    rx.isReviewed = true;
    savePrescriptions();
    addNotification(`Prescription ${status.toLowerCase()}.`, status === 'Rejected' ? 'error' : 'success');
    renderPrescriptionsPage();
};

window.removePrescription = async function(id) {
    try {
        const token = localStorage.getItem('rv_admin_token');
        const res = await fetch(`${API}/api/prescriptions/${id}`, {
            method: 'DELETE',
            headers: token ? { 'x-admin-token': token } : {}
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
        console.warn('Backend delete failed, removing locally.', err.message);
    }
    _prescriptions = _prescriptions.filter(x => x.id !== id);
    savePrescriptions();
    addNotification('Prescription removed.', 'info');
    renderPrescriptionsPage();
};

// ── AI-BASED SUGGESTIONS ───────────────────────────────────────────────────
function renderAISuggestions() {
    const grid = document.getElementById('aiSuggestions');
    if (!grid) return;
    const query = _currentSearch.toLowerCase();
    let recs = [];

    if (query) {
        recs = _allProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.composition.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query)
        );
    }

    if (!recs.length) {
        recs = _allProducts.filter(p => p.badge === 'Trending' || p.badge === 'Popular').slice(0, 4);
    } else {
        recs = recs.slice(0, 4);
    }

    grid.innerHTML = recs.map(p => `
        <div class="ai-card" onclick="openModal(${p.id})">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/160x120/e0f5f2/0a7c6e?text=Rivaansh'"/>
            <h4>${p.name}</h4>
            <p>₹${p.price} • ${p.category}</p>
        </div>
    `).join('');
}

// ── AUTO-REFILL SUBSCRIPTIONS ─────────────────────────────────────────────
window.addSubscription = function(id) {
    if (!_user) { toast('Login required to add subscription', 'error'); return; }
    if (_subscriptions.includes(id)) { toast('Already subscribed', 'info'); return; }
    _subscriptions.push(id);
    localStorage.setItem('rv_subscriptions', JSON.stringify(_subscriptions));
    addNotification('Auto-refill subscription enabled for this product.', 'success');
};

// ── MEDICINE INFO FEATURE ────────────────────────────────────────────────
window.toggleMedInfo = function(id) {
    const el = document.getElementById('modalMedInfo');
    if (el) el.classList.toggle('hidden');
};

window.searchMedInfo = function(val) {
    const results = document.getElementById('medInfoResults');
    if (!results) return;

    if (!val.trim()) {
        results.innerHTML = `<div class="med-info-placeholder"><i class="fa fa-book-medical"></i><p>Search for a medicine to view detailed clinical information.</p></div>`;
        return;
    }

    const q = val.toLowerCase();
    const filtered = _allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.composition.toLowerCase().includes(q)
    );

    if (!filtered.length) {
        results.innerHTML = `<div class="med-info-placeholder"><i class="fa fa-circle-question"></i><p>No medical matches found for "${val}". Please consult a pharmacist.</p></div>`;
        return;
    }

    results.innerHTML = filtered.map(p => `
        <div class="med-info-card">
            <div class="med-info-header">
                <h3 class="med-info-title">${p.name}</h3>
                <span class="med-info-badge">${p.brand}</span>
            </div>
            <div class="med-info-comp"><i class="fa fa-flask-vial"></i> ${p.composition}</div>
            <div class="med-info-grid">
                <div class="med-info-item">
                    <h5>Primary Uses</h5>
                    <p>${p.uses || 'Used as directed by a healthcare professional according to patient history.'}</p>
                </div>
                <div class="med-info-item">
                    <h5>Common Side Effects</h5>
                    <p>${p.sideEffects || 'Generally safe when taken correctly. Consult a doctor if any unusual symptoms occur.'}</p>
                </div>
                <div class="med-info-item">
                    <h5>Recommended Dosage</h5>
                    <p>${p.dosage || 'Dosage depends on age, weight, and general health condition.'}</p>
                </div>
                <div class="med-info-item">
                    <h5>Storage Instructions</h5>
                    <p>${p.storage || 'Protect from moisture and heat. Keep out of reach of children.'}</p>
                </div>
            </div>
            <div style="margin-top:20px; display:flex; gap:10px;">
                <button class="btn-primary" style="padding: 10px 20px" onclick="openModal(${p.id})">Order Now</button>
                <button class="btn-ghost" style="color:var(--tl); border-color:var(--tl)" onclick="shareWhatsApp('Medical info for ${p.name}: ${p.uses}')"><i class="fa fa-share"></i> Share Info</button>
            </div>
        </div>
    `).join('');
};

function checkAutoRefill() {
    if (!_subscriptions.length) return;
    _subscriptions.forEach(id => {
        const p = _allProducts.find(p => p.id === id);
        if (!p) return;
        addNotification(`Auto-refill: ${p.name} order created automatically. Check Orders.`, 'info');
        const existing = _cart.find(c => c.id === p.id);
        if (!existing) _cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1, brand: p.brand });
        saveCart();
    });
}

setInterval(checkAutoRefill, 1000 * 60 * 5); // every 5 min demo

// ── VOICE SEARCH ─────────────────────────────────────────────────────────
window.startVoiceSearch = function() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        toast('Voice search is not supported in this browser.', 'error');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { toast('Listening... speak now', 'info'); };
    recognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('searchInput');
        if (input) input.value = transcript;
        _currentSearch = transcript;
        applyFilters();
        renderAISuggestions();
        toast(`Search: ${transcript}`, 'success');
        showPage('products');
    };
    recognition.onerror = () => { toast('Voice recognition failed. Try again.', 'error'); };
    recognition.start();
};

// ── CHATBOT SUPPORT ───────────────────────────────────────────────────────
function openChatbot() {
    const box = document.getElementById('chatbotBox');
    box.classList.add('open');
}

function closeChatbot() {
    const box = document.getElementById('chatbotBox');
    box.classList.remove('open');
}

window.sendChatbotMessage = function() {
    const input = document.getElementById('chatInput');
    const msg = input?.value.trim();
    if (!msg) return;

    const history = document.getElementById('chatHistory');
    history.innerHTML += `<div class="chat-msg user-msg"><span>${msg}</span></div>`;
    input.value = '';

    setTimeout(() => {
        const botResp = `Thanks for asking! I recommend: ${_allProducts.slice(0,1)[0]?.name || 'Explore our pharmacy'}.`;
        history.innerHTML += `<div class="chat-msg bot-msg"><span>${botResp}</span></div>`;
        history.scrollTop = history.scrollHeight;
    }, 600);
};

// ── INITIAL UI ANCHOR ──────────────────────────────────────────────────────
function initUI() {
    renderAuthButtons();
    renderWishlistCount();
    renderNotificationsPanel();
}

// ── REVIEWS & RATINGS ──────────────────────────────────────────────────────
function getProductRating(productId) {
    const reviews = _reviews.filter(r => r.productId === productId);
    if (!reviews.length) return { avg: 0, count: 0 };
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    return { avg: parseFloat(avg), count: reviews.length };
}

function getProductReviewsHTML(productId) {
    const { avg, count } = getProductRating(productId);
    if (!count) return '<div class="product-rating"><span class="rating-text">No reviews yet</span></div>';
    
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fa ${i <= avg ? 'fa-star' : 'fa-star-o'}"></i>`;
    }
    return `<div class="product-rating"><div class="stars">${stars}</div><span class="rating-text">${avg}/5 (${count})</span></div>`;
}

window.openReviewModal = function(productId) {
    if (!_user) {
        toast('Please login to leave a review', 'error');
        openAuthModal();
        return;
    }
    
    const product = _allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingReview = _reviews.find(r => r.productId === productId && r.user === _user.email);
    
    let modalHTML = `
        <div class="modal-overlay open" onclick="if(event.target===this) closeReviewModal()">
            <div class="modal-card" style="max-width: 500px;">
                <button class="modal-close" onclick="closeReviewModal()"><i class="fa fa-xmark"></i></button>
                <h3>Review ${product.name}</h3>
                <div class="review-form">
                    <div class="review-rating-select">
                        <label>Rating:</label>`;
    
    for (let i = 1; i <= 5; i++) {
        modalHTML += `<i class="star-select fa fa-star-o" data-rating="${i}" onclick="selectRating(${i})"></i>`;
    }
    
    modalHTML += `</div>
                    <textarea id="reviewText" placeholder="Share your experience..." style="width:100%; border: 1px solid #cde2f7; border-radius: 10px; padding: 10px; min-height: 100px;"></textarea>
                    <button class="btn-primary" onclick="submitReview(${productId})">Submit Review</button>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    window.currentRating = 0;
};

function selectRating(rating) {
    window.currentRating = rating;
    const stars = document.querySelectorAll('.star-select');
    stars.forEach((s, i) => {
        s.classList.toggle('active', i < rating);
    });
}

window.submitReview = function(productId) {
    if (!window.currentRating) {
        toast('Please select a rating', 'error');
        return;
    }
    const text = document.getElementById('reviewText')?.value.trim();
    const review = {
        id: `rv_${Date.now()}`,
        productId,
        user: _user.email,
        name: _user.name,
        rating: window.currentRating,
        text: text || '',
        date: new Date().toLocaleDateString('en-IN')
    };
    _reviews.push(review);
    localStorage.setItem('rv_reviews', JSON.stringify(_reviews));
    closeReviewModal();
    renderProductsPage();
    toast('Review submitted! Thank you.', 'success');
};

function closeReviewModal() {
    const modal = document.querySelector('.modal-overlay.open');
    if (modal) modal.remove();
}

// ── ORDER TRACKING ─────────────────────────────────────────────────────────
window.renderOrderTracking = function() {
    const container = document.getElementById('trackingContainer');
    if (!container) return;

    if (!_orders.length) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 30px;">No orders to track. <a href="#" onclick="showPage(\'products\')">Start shopping</a></p>';
        return;
    }

    let html = '';
    _orders.forEach(order => {
        const statuses = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
        const currentIndex = statuses.indexOf(order.status) || 0;
        
        let timeline = '<div class="tracking-timeline">';
        statuses.forEach((status, i) => {
            timeline += `<div class="tracking-step ${i <= currentIndex ? 'completed' : ''}">
                <div class="tracking-marker"><i class="fa ${i <= currentIndex ? 'fa-check' : (i-1)}"></i></div>
                <div class="tracking-content">
                    <div class="tracking-title">${status}</div>
                    <div class="tracking-date">${i <= currentIndex ? 'Completed' : 'Pending'}</div>
                </div>
            </div>`;
        });
        timeline += '</div>';

        html += `<div class="order-card" style="margin-bottom: 20px;">
            <div class="order-top">
                <div>
                    <div class="order-id">Order #${String(order.id).slice(-8).toUpperCase()}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <span class="order-status">${order.status || 'Pending'}</span>
            </div>
            ${timeline}
        </div>`;
    });

    container.innerHTML = html;
};

function showOrderTracking() {
    showPage('orderTracking');
    renderOrderTracking();
}

initUI();

// ── TOAST ──────────────────────────────────────────────────────────────────
function toast(msg, type = 'info') {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className   = `toast show ${type}`;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}
window.st = toast; // global alias for other modules

// ── ERROR STATE ────────────────────────────────────────────────────────────
function showError(isFallback = false) {
    const grids = [document.getElementById('homeGrid'), document.getElementById('allGrid')];
    grids.forEach(g => {
        if (!g) return;
        if (!isFallback) {
             g.innerHTML = `
                <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--tm);">
                    <i class="fa fa-circle-exclamation" style="font-size:2.5rem; color:#f59e0b; display:block; margin-bottom:12px;"></i>
                    <strong style="font-size:1rem; color:var(--nv);">Unable to load products</strong>
                    <p style="font-size:.85rem; margin-top:6px;">Make sure the backend server is running at <code>${API}</code></p>
                    <button onclick="location.reload()" style="margin-top:16px; background:var(--tl); color:#fff; border:none; padding:10px 22px; border-radius:50px; font-weight:700; cursor:pointer;">
                        <i class="fa fa-rotate-right"></i> Retry
                    </button>
                </div>`;
        }
    });
    const counter = document.getElementById('productCount');
    if (counter) counter.textContent = isFallback ? 'Fallback products loaded' : 'Backend server not reachable';
}
