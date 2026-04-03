// Rivaansh Lifesciences - Modern Healthcare Website Script
// Clean, modular JavaScript for Tata 1mg inspired UI

// API Configuration
const API = (() => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    if (host === 'localhost' || host === '127.0.0.1') {
        return 'http://localhost:5000';
    }

    // For deployed domain, use same-origin API path
    return `${protocol}//${host}`;
})();

// State Management
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    loadProducts();
    renderCart();
    updateCartBadge();
    setupEventListeners();
    hideLoading();
    console.log('App initialized');
});

// Loading Management
function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) {
        loader.style.display = 'none';
    }
}

// API Functions
async function loadProducts() {
    console.log('Starting to load products...');
    try {
        console.log('Fetching products from:', `${API}/api/products`);
        const response = await fetch(`${API}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('API response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('API response data:', data);
        products = Array.isArray(data) ? data : [];
        console.log('Products loaded successfully:', products.length);
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to sample products
        console.log('Using fallback products');
        products = [
            {
                id: 1,
                name: "Rivadol AP Tablets",
                composition: "Paracetamol 325mg, Aceclofenac 100mg",
                price: 45,
                originalPrice: 55,
                badge: "Popular",
                prescriptionRequired: false,
                rating: 4.8,
                reviews: 245,
                category: 'pain-relief',
                image: "/images/rivadol_ap.jpg"
            },
            {
                id: 2,
                name: "Rivakold Syrup",
                composition: "Ambroxol 15mg, Terbutaline 1.25mg, Guaifenesin 50mg, Menthol 2.5mg per 5ml",
                price: 85,
                originalPrice: 95,
                badge: "Best Seller",
                prescriptionRequired: false,
                rating: 4.7,
                reviews: 189,
                category: 'cough-cold',
                image: "/images/rivakold.jpg"
            }
        ];
    }

    renderCategoryFilters();
    renderProducts();
}

function getUniqueCategories() {
    const categorySet = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(categorySet)];
}

function renderCategoryFilters() {
    const filterContainer = document.getElementById('categoryFilter');
    if (!filterContainer) return;

    const categories = getUniqueCategories();
    filterContainer.innerHTML = categories.map((category, idx) => {
        const label = category === 'all' ? 'All' : category.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<button class="category-button ${idx === 0 ? 'active' : ''}" data-cat="${category}" onclick="filterByCategory('${category}', this)">${label}</button>`;
    }).join('');
}

async function filterByCategory(category, button) {
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    if (button) button.classList.add('active');

    if (category === 'all') {
        renderProducts();
        return;
    }

    try {
        const query = new URLSearchParams({ category });
        const response = await fetch(`${API}/api/products?${query.toString()}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        renderProducts(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Category filter failed, falling back to client-side filter', error);
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}


// Product Rendering
function renderProducts(filteredProducts = null) {
    const items = filteredProducts || products;
    console.log('Rendering products:', items.length);

    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) {
        console.error('Products grid not found');
        return;
    }

    if (items.length === 0) {
        productsGrid.innerHTML = '<p>No products found.</p>';
        return;
    }

    productsGrid.innerHTML = items.map(product => {
        const imageUrl = product.image
            ? (product.image.startsWith('http') ? product.image : `${API}${product.image}`)
            : 'https://via.placeholder.com/300x300?text=No+Image';

        return `
            <div class="product-card">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${product.name}" loading="lazy">
                    ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    ${product.prescriptionRequired ? `<div class="prescription-badge">Rx Required</div>` : ''}
                    <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-composition">${product.composition || 'N/A'}</div>
                    <div class="product-price">
                        <span class="discounted-price">₹${product.price}</span>
                        ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <div class="stars">${renderStars(product.rating || 0)}</div>
                        <span class="rating-text">${product.rating || 0} (${product.reviews || 0})</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');

    console.log('Products rendered successfully');
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
           (hasHalfStar ? '☆' : '') +
           '☆'.repeat(emptyStars);
}

// Cart Management
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCartBadge();
    renderCart();
    showToast('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    renderCart();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        renderCart();
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="quantity-controls">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total;
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('show');
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('show');
    }
}

// Modal Management
function showAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.add('show');
    }
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.querySelector('.auth-tab:nth-child(1)');
    const signupTab = document.querySelector('.auth-tab:nth-child(2)');

    if (tab === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginTab.classList.add('active');
        signupTab.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupTab.classList.add('active');
        loginTab.classList.remove('active');
    }
}

// Authentication
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Simple authentication (replace with real API call)
    if (email && password) {
        user = { email, name: email.split('@')[0] };
        localStorage.setItem('user', JSON.stringify(user));
        closeAuthModal();
        showToast('Login successful!');
        updateAuthUI();
    } else {
        showToast('Please enter valid credentials', 'error');
    }
}

function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    if (name && email && password) {
        user = { name, email };
        localStorage.setItem('user', JSON.stringify(user));
        closeAuthModal();
        showToast('Account created successfully!');
        updateAuthUI();
    } else {
        showToast('Please fill all fields', 'error');
    }
}

function updateAuthUI() {
    const loginBtn = document.querySelector('.btn-outline');
    if (user) {
        loginBtn.textContent = `Hi, ${user.name}`;
    } else {
        loginBtn.textContent = 'Login';
    }
}

// Quick Actions
function showLabTests() {
    scrollToSection('connect');
    prefillContactForm('Lab Test Booking', 'I would like to book a lab test. Please guide me through the process.');
    showToast('You can request a lab test from the Connect section.', 'success');
}

function showConsult() {
    scrollToSection('connect');
    prefillContactForm('Doctor Consultation', 'I want to consult with a doctor. Please provide available slots and pricing.');
    showToast('You can request doctor consultation from the Connect section.', 'success');
}

function showReorder() {
    scrollToSection('connect');
    prefillContactForm('Reorder Medicines', 'I would like to reorder my previous medicines. Please assist.');
    showToast('You can request a reorder from the Connect section.', 'success');
}

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function prefillContactForm(subject, message) {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    if (nameInput) nameInput.focus();
    if (messageInput) messageInput.value = `${subject}: ${message}`;

    if (!emailInput || !emailInput.value) {
        if (user && user.email) {
            emailInput.value = user.email;
        }
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Wishlist
function toggleWishlist(productId) {
    // Simple wishlist toggle (can be expanded)
    showToast('Wishlist feature coming soon!');
}

// Checkout
function checkout() {
    const sidebar = document.getElementById('cartSidebar');
    const checkoutPage = document.getElementById('checkoutPage');

    if (sidebar) sidebar.classList.remove('show');
    if (checkoutPage) {
        checkoutPage.style.display = 'block';
        document.getElementById('checkoutPage').scrollIntoView({ behavior: 'smooth' });
        renderCheckoutItems();
    }
}

function renderCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (!checkoutItems) return;

    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-details">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-price">₹${item.price} × ${item.quantity}</div>
            </div>
            <div class="checkout-item-total">₹${item.price * item.quantity}</div>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal > 500 ? 0 : 49;
    const total = subtotal + delivery;

    if (checkoutSubtotal) checkoutSubtotal.textContent = `₹${subtotal}`;
    if (checkoutTotal) checkoutTotal.textContent = `₹${total}`;
}

async function placeOrder() {
    // Validate form
    const name = document.getElementById('addressName').value;
    const phone = document.getElementById('addressPhone').value;
    const addressDetails = document.getElementById('addressDetails').value;
    const city = document.getElementById('addressCity').value;
    const state = document.getElementById('addressState').value;
    const pin = document.getElementById('addressPin').value;

    if (!name || !phone || !addressDetails || !city || !state || !pin) {
        showToast('Please fill all address fields', 'error');
        return;
    }

    const fullAddress = `${addressDetails}, ${city}, ${state} - ${pin}`;

    // Process payment
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if (paymentMethod === 'razorpay') {
        initiateRazorpayPayment(fullAddress, phone);
    } else {
        // COD order
        await createOrder(fullAddress, phone, 'COD');
    }
}

async function createOrder(address, phone, paymentMethod) {
    try {
        const orderData = {
            items: cart,
            address,
            phone,
            totalAmount: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 49 // + delivery
        };

        const response = await fetch(`${API}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const order = await response.json();
            showToast('Order placed successfully!', 'success');
            showOrderTracking(order._id);
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to place order', 'error');
        }
    } catch (error) {
        console.error('Order error:', error);
        showToast('Failed to place order. Please try again.', 'error');
    }
}

function initiateRazorpayPayment(address, phone) {
    // For demo purposes, simulate payment success
    showToast('Payment processing...');

    setTimeout(async () => {
        await createOrder(address, phone, 'Razorpay');
    }, 2000);
}

function showOrderTracking(orderId = null) {
    const checkoutPage = document.getElementById('checkoutPage');
    const trackingPage = document.getElementById('orderTracking');

    if (checkoutPage) checkoutPage.style.display = 'none';
    if (trackingPage) {
        trackingPage.style.display = 'block';
        trackingPage.scrollIntoView({ behavior: 'smooth' });

        if (orderId) {
            // Update tracking with real order ID
            const orderIdElement = document.createElement('p');
            orderIdElement.textContent = `Order ID: ${orderId}`;
            orderIdElement.style.fontWeight = 'bold';
            orderIdElement.style.marginBottom = '20px';
            trackingPage.querySelector('.container').insertBefore(orderIdElement, trackingPage.querySelector('.tracking-container'));
        }
    }

    // Clear cart after successful order
    cart = [];
    saveCart();
    updateCartBadge();
}

// Toast Notifications
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // File upload
    const fileInput = document.getElementById('prescriptionFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

async function submitContactForm() {
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) {
        showToast('Please provide name, email, and message.', 'error');
        return;
    }

    try {
        const payload = { name, email, phone, message, submittedAt: new Date().toISOString() };
        const response = await fetch(`${API}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        showToast('Message sent successfully. Our team will contact you soon.');
        document.getElementById('contactName').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactMessage').value = '';

    } catch (error) {
        console.error('Connect form submission error:', error);
        showToast('Unable to send message right now, please try again later.', 'error');
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.composition && product.composition.toLowerCase().includes(query))
    );
    renderFilteredProducts(filteredProducts);
}

function renderFilteredProducts(filteredProducts) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p>No products found matching your search.</p>';
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div    class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x300?text=No+Image'}" alt="${product.name}">
                <button class="wishlist-btn" onclick="toggleWishlist(${product.id})">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-composition">${product.composition || 'N/A'}</div>
                <div class="product-price">
                    <span class="discounted-price">₹${product.price}</span>
                    ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                    ${product.discount ? `<span class="discount">${product.discount}% off</span>` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${renderStars(product.rating || 0)}
                    </div>
                    <span class="rating-text">${product.rating || 0} (${product.reviews || 0})</span>
                </div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('filePreview');
            if (preview) {
                preview.innerHTML = `
                    <div class="file-preview">
                        <img src="${e.target.result}" alt="Prescription preview" style="max-width: 200px; max-height: 200px;">
                        <p>File: ${file.name}</p>
                    </div>
                `;
                document.getElementById('submitPrescription').style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

// Initialize auth UI on load
updateAuthUI();

// Chat Functions
function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    const chatToggle = document.getElementById('chatToggle');

    if (chatWidget.style.display === 'flex') {
        chatWidget.style.display = 'none';
        chatToggle.style.display = 'flex';
    } else {
        chatWidget.style.display = 'flex';
        chatToggle.style.display = 'none';
    }
}
// Quick Links
function toggleQuickLinks() {
    const quickLinksFloat = document.getElementById('quickLinksFloat');
    const quickLinksToggle = document.getElementById('quickLinksToggle');
    const toggleIcon = quickLinksToggle.querySelector('i');

    if (quickLinksFloat.classList.contains('show')) {
        quickLinksFloat.classList.remove('show');
        setTimeout(() => {
            quickLinksToggle.style.display = 'flex';
            toggleIcon.className = 'fas fa-plus';
        }, 300);
    } else {
        quickLinksToggle.style.display = 'none';
        quickLinksFloat.classList.add('show');
        toggleIcon.className = 'fas fa-times';
    }
}
function startChat() {
    toggleChat();
    showToast('Connecting to pharmacist...');
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    // Simulate bot response
    setTimeout(() => {
        const responses = [
            "Thank you for your question. Let me help you with that.",
            "I understand your concern. For this medication, please consult with your doctor first.",
            "That's a good question! The recommended dosage is usually...",
            "I'd be happy to help. Could you please provide more details about your symptoms?",
            "For prescription medications, we require a valid prescription from a registered medical practitioner.",
            "Our pharmacists are here to assist you 24/7. Is there anything specific you'd like to know?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'bot');
    }, 1000 + Math.random() * 2000);
}

function addMessage(content, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${content}</p>
            <span class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Enhanced Mobile Optimization
function enhanceMobileExperience() {
    // Touch gestures for cart
    let touchStartX = 0;
    let touchEndX = 0;

    const cartSidebar = document.getElementById('cartSidebar');
    if (cartSidebar) {
        cartSidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        cartSidebar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right - close cart
            toggleCart();
        }
    }

    // Optimize images for mobile
    if (window.innerWidth <= 768) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            const src = img.src;
            if (src.includes('?')) {
                img.src = src.replace(/w=\d+/, 'w=400').replace(/h=\d+/, 'h=300');
            }
        });
    }
}

// Performance optimizations
function optimizePerformance() {
    // Debounce search input
    let searchTimeout;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => handleSearch(e), 300);
        });
    }

    // Preload critical images
    const criticalImages = [
        'images/logo.png',
        'https://images.unsplash.com/photo-1584308666744-24d5f400f905?w=400&h=200&fit=crop'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize enhancements
document.addEventListener('DOMContentLoaded', () => {
    enhanceMobileExperience();
    optimizePerformance();
});