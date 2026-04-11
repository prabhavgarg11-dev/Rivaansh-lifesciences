/**
 * script.js — Rivaansh Lifesciences Frontend Engine
 * Features: API fetch, search/filter, cart (localStorage), orders, modal
 */

// ── API base URL ──────────────────────────────────────────────
// Automatically uses localhost in development, Render in production.
const getAPIBase = () => {
  return "https://rivaansh-lifesciences.onrender.com";
};

const API = getAPIBase();

// ── State ──────────────────────────────────────────────────────────────────
let _allProducts = []; // full catalogue from API
let _filtered = []; // currently shown on products page
let _currentCat = "all";
let _currentBrand = "all";
let _currentPrice = 5000;
let _currentSearch = "";
let _currentSort = "default";
let _cart = JSON.parse(localStorage.getItem("rv_cart") || "[]");
let _orders = JSON.parse(localStorage.getItem("rv_orders") || "[]");
let _wishlist = JSON.parse(localStorage.getItem("rv_wishlist") || "[]");
let _subscriptions = JSON.parse(
  localStorage.getItem("rv_subscriptions") || "[]",
);
let _notifications = JSON.parse(
  localStorage.getItem("rv_notifications") || "[]",
);
let _prescriptions = JSON.parse(
  localStorage.getItem("rv_prescriptions") || "[]",
);
let _users = JSON.parse(localStorage.getItem("rv_users") || "[]");
let _user = JSON.parse(localStorage.getItem("rv_user") || "null");
let _reviews = JSON.parse(localStorage.getItem("rv_reviews") || "[]");
let _cartOpen = false;
let _chatHistory = []; // FEATURE 1: Persistent chat history for context-aware AI

function toSlug(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getProductUrl(product) {
  return `/product/${toSlug(product.name)}-${product.id}`;
}

function updateProductSEO(product) {
  const canonical = document.querySelector('link[rel="canonical"]');
  const descMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const ogImg = document.querySelector('meta[property="og:image"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  const twitterImg = document.querySelector('meta[name="twitter:image"]');
  const title = `${product.name} | Buy Online at Rivaansh Lifesciences`;
  document.title = title;
  if (descMeta) descMeta.content = product.description || 'Order genuine healthcare products and medicines from Rivaansh Lifesciences.';
  if (canonical) canonical.href = `${window.location.origin}${getProductUrl(product)}`;
  if (ogTitle) ogTitle.content = title;
  if (ogDesc) ogDesc.content = product.description || 'Shop clinical healthcare products, medicines and wellness kits online.';
  if (ogUrl) ogUrl.content = `${window.location.origin}${getProductUrl(product)}`;
  if (ogImg) ogImg.content = product.image ? `${window.location.origin}/${product.image}` : `${window.location.origin}/logo.png`;
  if (twitterTitle) twitterTitle.content = title;
  if (twitterDesc) twitterDesc.content = product.description || 'Order authentic medicines and health products online in India.';
  if (twitterImg) twitterImg.content = product.image ? `${window.location.origin}/${product.image}` : `${window.location.origin}/logo.png`;
}

function resetPageSEO() {
  const canonical = document.querySelector('link[rel="canonical"]');
  const descMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');
  const ogImg = document.querySelector('meta[property="og:image"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDesc = document.querySelector('meta[name="twitter:description"]');
  const twitterImg = document.querySelector('meta[name="twitter:image"]');

  document.title = 'Rivaansh Lifesciences | AI Healthcare Pharmacy & Genuine Medicines';
  if (descMeta) descMeta.content = 'Rivaansh Lifesciences is India\'s trusted AI-powered pharmacy offering authentic medicines, healthcare products, wellness kits, and clinical AI tools with fast delivery across major cities.';
  if (canonical) canonical.href = `${window.location.origin}/`;
  if (ogTitle) ogTitle.content = 'Rivaansh Lifesciences — AI-Powered Clinical Pharmacy in India';
  if (ogDesc) ogDesc.content = 'Buy licensed medicines, wellness products and use AI healthcare tools for symptom screening, prescription analysis and drug safety across India.';
  if (ogUrl) ogUrl.content = `${window.location.origin}/`;
  if (ogImg) ogImg.content = `${window.location.origin}/logo.png`;
  if (twitterTitle) twitterTitle.content = 'Rivaansh Lifesciences — AI Healthcare Pharmacy';
  if (twitterDesc) twitterDesc.content = 'Trusted online pharmacy and AI health assistant for medicines, wellness products and smart healthcare guidance.';
  if (twitterImg) twitterImg.content = `${window.location.origin}/logo.png`;
}

function handleDeepLink() {
  const pathName = window.location.pathname.toLowerCase();
  if (pathName.startsWith('/product/')) {
    const segments = pathName.split('-');
    const id = Number(segments.pop());
    if (id) {
      const product = _allProducts.find((p) => p.id === id);
      if (product) {
        showPage('products');
        openModal(id);
        return;
      }
    }
  }

  if (pathName.startsWith('/products')) {
    showPage('products');
    return;
  }
  if (pathName.startsWith('/faq')) {
    showPage('faq');
    return;
  }
  if (pathName.startsWith('/contact')) {
    showPage('contact');
    return;
  }
  if (pathName.startsWith('/privacy')) {
    showPage('privacy');
    return;
  }
  if (pathName.startsWith('/terms')) {
    showPage('terms');
    return;
  }
  if (pathName.startsWith('/refund')) {
    showPage('refund');
    return;
  }
  showPage('home');
}

const ADMIN_CREDENTIALS = {
  email: "admin@rivaansh.com",
  password: "Admin@123",
  name: "Administrator",
  role: "admin",
};

// ── SIMPLE AUTH HELPERS ────────────────────────────────────────────────────
function loginUser(email, password) {
  try {
    const user = _users.find(u => u.email === email && u.password === password);
    if (user) {
      return { ok: true, user: { ...user, password: undefined } };
    }
    return { ok: false, message: "Invalid email or password" };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

function registerUser(name, email, phone = "", password) {
  try {
    if (_users.find(u => u.email === email)) {
      return { ok: false, message: "Email already registered" };
    }
    const newUser = {
      uid: Math.random().toString(36).substr(2, 9),
      name,
      email,
      phone,
      password,
      role: "user",
      createdAt: new Date().toISOString()
    };
    _users.push(newUser);
    localStorage.setItem("rv_users", JSON.stringify(_users));
    return { ok: true, user: { ...newUser, password: undefined } };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

// ── DOM READY ──────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  console.log("✓ DOMContentLoaded fired, initializing Rivaansh app...");
  // Initialize admin user if missing
  if (!_users.length) {
    _users.push({
      uid: "admin_1",
      name: ADMIN_CREDENTIALS.name,
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      role: ADMIN_CREDENTIALS.role,
    });
    localStorage.setItem("rv_users", JSON.stringify(_users));
  }

  console.log("✓ Attaching search...");
  attachSearch();
  console.log("✓ Attaching navigation...");
  attachSpotlightNav();
  console.log("✓ Rendering cart...");
  renderCart();
  updateCartBadge();
  console.log("✓ Rendering auth buttons...");
  renderAuthButtons();
  renderOrders();
  console.log("✓ Loading products...");
  await loadProducts();
  handleDeepLink();
  window.addEventListener('popstate', handleDeepLink);
  console.log("✓ Updating admin stats...");
  updateAdminStats();
  console.log("✓ Checking AI status...");
  checkAIStatus();
  console.log("✓ App initialization complete!");
});

// ── LOADER ─────────────────────────────────────────────────────────────────
function hideLoader() {
  const l = document.getElementById("loader");
  console.log("🔄 hideLoader called, loader element:", l);
  if (l) {
    l.style.transition = "opacity 0.6s ease, visibility 0.6s ease";
    l.style.opacity = "0";
    l.style.visibility = "hidden";
    setTimeout(() => {
      l.style.display = "none";
      console.log("✓ Loader hidden successfully");
    }, 600);
  } else {
    console.warn("⚠️ Loader element not found!");
  }
}

window.addEventListener("load", () => {
    console.log("✓ Window load event fired");
    setTimeout(hideLoader, 500); // Aesthetic delay for clinical feel
});

// ── FETCH PRODUCTS ─────────────────────────────────────────────────────────
async function loadPrescriptions() {
  try {
    const res = await fetch(`${API}/api/prescriptions`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const serverPrescriptions = await res.json();
    if (Array.isArray(serverPrescriptions) && serverPrescriptions.length) {
      _prescriptions = serverPrescriptions;
      localStorage.setItem("rv_prescriptions", JSON.stringify(_prescriptions));
    }
  } catch (err) {
    console.warn(
      "Could not load prescriptions from backend; using local storage fallback.",
      err.message,
    );
  }
}

async function checkClinicalConnectivity() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s probe
    const res = await fetch(`${API}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
}

async function loadProducts() {
  console.log("📦 loadProducts started, API:", API);
  const loaderText = document.querySelector(".loader-text");
  if (loaderText) loaderText.textContent = "🏥 Probing Clinical Backend...";

  const isUp = await checkClinicalConnectivity();
  console.log("✓ Backend connectivity check:", isUp);

  if (!isUp) {
    console.warn("⚠️ Clinical backend not reachable. Using fallback.");
    if (loaderText)
      loaderText.textContent = "⚡ Starting Emergency Fallback Engine...";
    addNotification(
      "Clinical backend is starting up. Using temporary catalogue.",
      "info",
    );
    loadFallbackProducts();
    hideLoader();
    return;
  }

  try {
    if (loaderText)
      loaderText.textContent = "🚀 Fetching Clinical Catalogue...";
    const res = await fetch(`${API}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _allProducts = await res.json();

    // Ensure image paths are professional
    _allProducts = _allProducts.map((p) => ({
      ...p,
      image: getClinicalImageUrl(p.image),
    }));

    if (!_allProducts || !_allProducts.length) {
      throw new Error("Catalogue empty or corrupted");
    }
    
    _filtered = [..._allProducts];
    renderHome();
    renderProductsPage();
    try {
      renderAISuggestions();
    } catch (e) {
      console.warn("AI Suggestions module not ready.");
    }
    renderWishlistPage();
    populatePrescriptionProductOptions();
    await loadPrescriptions();
    renderPrescriptionsPage();
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    addNotification(
      "Could not reach clinical backend, using emergency local fallback.",
      "error",
    );
    loadFallbackProducts();
  } finally {
    hideLoader();
  }
}

function getClinicalImageUrl(path) {
  if (!path) return "images/rivakold.jpg";
  if (path.startsWith("http")) return path;
  if (!path.startsWith("images/")) return `images/${path}`;
  return path;
}

function loadFallbackProducts() {
  _allProducts = [
    { id: 1, name: "Rivakold™ Antikold Tablets", brand: "Rivaansh™ Pharma", composition: "Paracetamol + Phenylephrine", description: "Clinically superior multi-symptom cold and flu relief.", price: 85, originalPrice: 110, category: "Tablet", badge: "Trending", prescriptionRequired: false, image: "images/rivakold.jpg", uses: "Cold, Fever, Congestion.", sideEffects: "Drowsiness.", dosage: "1-2 tablets daily.", storage: "Dry Place" },
    { id: 2, name: "Rivasyne™ Cream", brand: "Rivaansh™ Derma", composition: "Clotrimazole 1%", description: "Strategic clinical-grade antifungal and healing therapy.", price: 150, originalPrice: 180, category: "Skincare", badge: "Pharmacist Choice", prescriptionRequired: false, image: "images/rivasyne.jpg", uses: "Fungal infection, Skin rash.", sideEffects: "Mild redness.", dosage: "Apply twice daily.", storage: "Below 25°C" },
    { id: 3, name: "Rivapro-ESR™ Capsules", brand: "Rivaansh™ Nutra", composition: "Lactobacillus 5B CFU", description: "Advanced clinical gut-health and high-fidelity immunity booster.", price: 299, originalPrice: 380, category: "Capsule", badge: "Premium Hub", prescriptionRequired: false, image: "images/rivapro_esr.jpg", uses: "Digestive health, Immunity.", sideEffects: "None.", dosage: "1 daily.", storage: "Refrigerate" },
    { id: 4, name: "Rivadol-AP™ Pain Relief", brand: "Rivaansh™ Pharma", composition: "Aceclofenac + Paracetamol", description: "High-performance joint and muscle pain solution.", price: 120, originalPrice: 150, category: "Tablet", badge: "Bestseller", prescriptionRequired: true, image: "images/rivadol_ap.jpg", uses: "Pain/Inflammation.", sideEffects: "Acidity.", dosage: "Twice daily.", storage: "Cool Place" },
    { id: 5, name: "Rivayne™ Face Wash", brand: "Rivaansh™ Derma", composition: "Salicylic Acid + Zinc", description: "Clinical acne clearance and skin-purifying therapy.", price: 290, originalPrice: 350, category: "Skincare", badge: "Dermatological", prescriptionRequired: false, image: "images/Products_page-0005.jpg", uses: "Acne, Deep cleaning.", sideEffects: "Dryness.", dosage: "Twice daily.", storage: "Cool Place" },
    { id: 6, name: "Rivaderm™ Anti-Itch Cream", brand: "Rivaansh™ Derma", composition: "Hydrocortisone 1%", description: "Clinical-grade relief for skin irritation and redness.", price: 175, originalPrice: 220, category: "Skincare", badge: "Skin Relief", prescriptionRequired: false, image: "images/Products_page-0006.jpg", uses: "Itching, Inflammation.", sideEffects: "Thinning skin.", dosage: "Apply thinly twice.", storage: "Below 30°C" },
    { id: 7, name: "Rivoxy™ Softgel Capsules", brand: "Rivaansh™ Nutra", composition: "Omega-3 1000mg + Antioxidants", description: "Triple-strength clinical heart and brain fuel.", price: 450, originalPrice: 599, category: "Capsule", badge: "Neuro Support", prescriptionRequired: false, image: "images/rivapro_esr.jpg", uses: "Cardiac health, Memory.", sideEffects: "None.", dosage: "2 daily.", storage: "Dry/Dark" },
    { id: 8, name: "hCG™ Pregnancy Detection Kit", brand: "Rivaansh™ Life", composition: "Anti-hCG Antibodies", description: "99.9% accurate clinical one-step diagnostic hub.", price: 140, originalPrice: 180, category: "Diagnostic Kit", badge: "Instant Hub", prescriptionRequired: false, image: "images/hcg_test.jpg", uses: "Pregnancy detection.", sideEffects: "None.", dosage: "3 drops of urine.", storage: "2-30°C" },
    { id: 9, name: "Rivacold-Multi™ Extra Strength", brand: "Rivaansh™ Pharma", composition: "Paracetamol + Caffeine", description: "Accelerated cold and clinical headache relief.", price: 95, originalPrice: 125, category: "Tablet", badge: "Fast Hit", prescriptionRequired: false, image: "images/rivakold.jpg", uses: "Headache, Flu.", sideEffects: "Alertness.", dosage: "1-2 daily.", storage: "Dry Place" },
    { id: 10, name: "RivaCheck™ Glucometer Kit", brand: "Rivaansh™ Lab", composition: "Digital Hub + 25 Strips", description: "Clinical-grade blood glucose management system.", price: 999, originalPrice: 1499, category: "Diagnostic Kit", badge: "Lab Grade", prescriptionRequired: false, image: "images/hcg_test.jpg", uses: "Sugar monitoring.", sideEffects: "None.", dosage: "As needed.", storage: "Dry Meter" }
  ];
  _filtered = [..._allProducts];
  renderHome();
  renderProductsPage();
  renderAISuggestions();
}

// ── RENDER HOME (trending, first 8) ───────────────────────────────────────
function renderHome() {
  const grid = document.getElementById("homeGrid");
  if (!grid) return;
  const featured = _allProducts.slice(0, 8);
  grid.innerHTML = featured.map((p) => cardHTML(p)).join("");
  animateCards(grid);
}

// ── RENDER PRODUCTS PAGE ───────────────────────────────────────────────────
function renderProductsPage() {
  const grid = document.getElementById("allGrid");
  const counter = document.getElementById("productCount");
  const noRes = document.getElementById("noResults");
  if (!grid) return;

  if (!_filtered.length) {
    grid.innerHTML = "";
    if (noRes) noRes.classList.remove("hidden");
    if (counter) counter.textContent = "0 products found";
    return;
  }
  if (noRes) noRes.classList.add("hidden");
  if (counter)
    counter.textContent = `${_filtered.length} product${_filtered.length !== 1 ? "s" : ""} found`;

  grid.innerHTML = _filtered.map((p) => cardHTML(p)).join("");
  animateCards(grid);
}

// ── CARD HTML ──────────────────────────────────────────────────────────────
function cardHTML(p) {
  const inCart = _cart.find((i) => i.id === p.id);
  const isWished = _wishlist.includes(p.id);
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  const badgeHTML = `<div class="badge">Trending</div>`;
  const rxHTML = p.prescriptionRequired ? `<div class="rx-flag">Rx Required</div>` : "";
  const wishClass = isWished ? "wish active" : "wish";
  const whatsappMsg = encodeURIComponent(
    `Check out ${p.name} at Rivaansh Lifesciences! ${window.location.href}`,
  );

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

  const imgUrl =
    p.image && p.image.startsWith("uploads/")
      ? `${API}/${p.image}`
      : p.image || "";

  return `
    <div class="product-card" onclick="openModal(${p.id})">
        <div class="card-img-wrap">
            <img src="${imgUrl}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x300/e0f5f2/0a7c6e?text=Rivaansh'">
            ${badgeHTML}
            ${rxHTML}
        </div>
        <div class="card-body">
            <div class="card-brand">Rivaansh Lifesciences</div>
            <div class="card-name">${p.name}</div>
            <div class="card-comp">${p.composition}</div>
            ${getProductReviewsHTML(p.id)}
            <div class="card-footer">
                <div class="card-price-wrap">
                    <div class="card-price">
                        ₹${p.price}
                        ${discount > 0 ? `<span class="card-disc">${discount}% off</span>` : ""}
                    </div>
                    ${p.originalPrice ? `<div class="card-orig">₹${p.originalPrice}</div>` : ""}
                </div>
                ${addBtnHTML}
            </div>
            <div class="card-actions">
                <button class="${wishClass}" onclick="event.stopPropagation(); toggleWishlist(${p.id})"><i class="fa-${isWished ? "solid" : "regular"} fa-heart"></i></button>
                <button class="btn-secondary" onclick="event.stopPropagation(); shareWhatsApp(decodeURIComponent('${whatsappMsg}'))"><i class="fa-brands fa-whatsapp"></i></button>
                ${subscribeHTML}
            </div>
        </div>
    </div> `;
}

// ── ANIMATE CARDS ──────────────────────────────────────────────────────────
function animateCards(grid) {
  const cards = grid.querySelectorAll(".product-card");
  cards.forEach((c, i) => {
    c.style.animationDelay = `${i * 0.04}s`;
  });
}

// ── FILTER BY CATEGORY ─────────────────────────────────────────────────────


window.filterCat = function (cat, el) {
  _currentCat = cat;
  if (el) {
    document.querySelectorAll(".cgrid-item, .cat-btn").forEach((b) => b.classList.remove("active"));
    el.classList.add("active");
  } else {
    // If called from a direct link/page change, try to find and highlight the button
    document.querySelectorAll(".cgrid-item, .cat-btn").forEach((b) => {
      const btnText = b.querySelector('span')?.innerText || b.innerText;
      if (btnText.toLowerCase().includes(cat.toLowerCase())) b.classList.add("active");
      else b.classList.remove("active");
    });
  }

  const select = document.getElementById("filterCategory");
  if (select) select.value = cat;

  showPage("products");
  applyFilters();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.filterCatDirect = function (cat) {
  _currentCat = cat;
  const select = document.getElementById("filterCategory");
  if (select) select.value = cat;
  applyFilters();
};

window.filterBrandDirect = function (brand) {
  _currentBrand = brand;
  applyFilters();
};

window.updatePriceLabel = function (val) {
  const label = document.getElementById("priceLabelVal");
  if (label) label.textContent = "₹" + val;
};

window.filterPriceDirect = function (val) {
  _currentPrice = Number(val);
  applyFilters();
};

// ── SORT ───────────────────────────────────────────────────────────────────
window.sortProducts = function (val) {
  _currentSort = val;
  applyFilters();
};

// ── APPLY FILTERS + SORT ───────────────────────────────────────────────────
function applyFilters() {
  let list = [..._allProducts];

  if (_currentCat && _currentCat !== "all") {
    list = list.filter((p) => p.category?.toLowerCase() === _currentCat.toLowerCase());
  }
  if (_currentBrand && _currentBrand !== "all") {
    list = list.filter(
      (p) => p.brand?.toLowerCase() === _currentBrand.toLowerCase(),
    );
  }
  if (_currentPrice < 5000) {
    list = list.filter((p) => p.price <= _currentPrice);
  }
  if (_currentSearch) {
    const q = _currentSearch.toLowerCase();
    list = list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.composition?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q),
    );
  }
  if (_currentSort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (_currentSort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (_currentSort === "name-asc")
    list.sort((a, b) => a.name.localeCompare(b.name));

  _filtered = list;
  renderProductsPage();
  if (typeof renderAISuggestions === "function") renderAISuggestions();
}

// ── SEARCH ─────────────────────────────────────────────────────────────────
function attachSearch() {
  const input = document.getElementById("mainSearch") || document.getElementById("searchInput");
  const clear = document.getElementById("searchClear");
  if (!input) return;

  let debounce;
  input.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      _currentSearch = input.value.trim();
      if (clear) clear.style.display = _currentSearch ? "block" : "none";
      if (_currentSearch && document.getElementById("homePage")?.classList.contains("active")) {
        showPage("products");
      }
      applyFilters();
      
      // FEATURE 4: AI search autocomplete — if no local match found, query Gemini
      const hasLocalMatch = _allProducts.some(p => 
        p.name.toLowerCase().includes(_currentSearch.toLowerCase()) || 
        p.composition.toLowerCase().includes(_currentSearch.toLowerCase())
      );
      
      if (_currentSearch && !hasLocalMatch) {
        try {
          const aiRes = await fetch(`${API}/api/ai/medicine-info`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicine: _currentSearch })
          });
          const aiData = await aiRes.json();
          
          // Check if AI response container exists (on products page)
          const aiContainer = document.getElementById('aiSearchContainer');
          if (aiContainer && aiData.info) {
            aiContainer.innerHTML = `
              <div style="background:linear-gradient(135deg, #e0f7ff, #f0f9ff); border-left:4px solid var(--tl); padding:12px; border-radius:8px; margin:10px 0; font-size:0.85rem;">
                <div style="display:flex; gap:8px; align-items:flex-start;">
                  <i class="fa fa-lightbulb" style="color:var(--tl); margin-top:2px;"></i>
                  <div>
                    <strong>💡 AI Insight:</strong>
                    <p style="margin:4px 0 0 0; color:#333;">${aiData.info}</p>
                  </div>
                </div>
              </div>
            `;
          }
        } catch (err) {
          console.warn('AI search autocomplete unavailable:', err);
        }
      } else {
        const aiContainer = document.getElementById('aiSearchContainer');
        if (aiContainer) aiContainer.innerHTML = '';
      }
    }, 500);
  });
}

window.handleSearch = function (val) {
  _currentSearch = val.trim();
  if (_currentSearch && document.getElementById("homePage")?.classList.contains("active")) {
    showPage("products");
  }
  applyFilters();
};

window.clearSearch = function () {
  const input = document.getElementById("searchInput");
  const clear = document.getElementById("searchClear");
  if (input) input.value = "";
  if (clear) clear.style.display = "none";
  _currentSearch = "";
  applyFilters();
};

// ── MODAL ──────────────────────────────────────────────────────────────────
window.openModal = function (id) {
  const p = _allProducts.find((x) => x.id === id);
  if (!p) return;

  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  const inCart = _cart.find((i) => i.id === p.id);

  const addBtn = inCart
    ? `<button class="modal-add-btn" style="background:var(--su);" onclick="closeModalDirect(); toggleCart()"><i class="fa fa-bag-shopping"></i> View in Cart (${inCart.qty})</button>`
    : `<button class="modal-add-btn" onclick="addToCart(${p.id}); closeModalDirect()"><i class="fa fa-cart-plus"></i> Add to Cart</button>`;

  const imgUrl =
    p.image && p.image.startsWith("uploads/")
      ? `${API}/${p.image}`
      : p.image || "";

  document.getElementById("modalContent").innerHTML = `
        <img class="modal-img" src="${imgUrl}" alt="${p.name}" onerror="this.src='https://placehold.co/700x260/e0f5f2/0a7c6e?text=Rivaansh'">
        <div class="modal-body">
            <div class="modal-brand">${p.brand || "Rivaansh"}</div>
            <h2 class="modal-name">${p.name}</h2>
            <div class="modal-comp"><i class="fa fa-flask-vial"></i> ${p.composition}</div>
            <p class="modal-desc">${p.description || "Clinical formulation by Rivaansh Lifesciences."}</p>
            <div class="modal-price-row">
                <span class="modal-price">₹${p.price}</span>
                ${p.originalPrice ? `<span class="modal-orig">₹${p.originalPrice}</span>` : ""}
                ${discount > 0 ? `<span class="modal-save">Save ${discount}%</span>` : ""}
            </div>
            ${
              p.prescriptionRequired
                ? `<div class="modal-rx-warn"><i class="fa fa-prescription-bottle-medical"></i> This product requires a valid prescription.</div>
            <div class="prescription-upload">
                <label for="rxFileInput">Upload Prescription</label>
                <input id="rxFileInput" type="file" accept="image/*,.pdf" onchange="handlePrescriptionUpload(event, ${p.id})">
            </div>`
                : ""
            }
            <button class="modal-info-btn" onclick="toggleMedInfo(${p.id})">
                <i class="fa fa-book-medical"></i> Clinical Safety & Guide 
                <i class="fa fa-chevron-down" style="font-size:0.7rem; float:right; margin-top:5px;"></i>
            </button>
            <div id="modalMedInfo" class="modal-med-info hidden" style="background:#fafdff; padding:15px; border-radius:12px; border:1px solid #e1ecf5; margin-top:10px;">
                <div class="med-info-grid">
                    <div class="med-info-item">
                        <h5 style="color:var(--tl); margin-bottom:4px; font-size:0.75rem;"><i class="fa fa-flask"></i> USES</h5>
                        <p style="font-size:0.85rem; line-height:1.4;">${p.uses || "Standard pharmaceutical application as per patient requirements."}</p>
                    </div>
                    <div class="med-info-item" style="margin-top:10px;">
                        <h5 style="color:var(--tl); margin-bottom:4px; font-size:0.75rem;"><i class="fa fa-triangle-exclamation"></i> SIDE EFFECTS</h5>
                        <p style="font-size:0.85rem; line-height:1.4;">${p.sideEffects || "Generally safe. Mild effects possible; consult pharmacist if concerned."}</p>
                    </div>
                    <div class="med-info-item" style="margin-top:10px;">
                        <h5 style="color:var(--tl); margin-bottom:4px; font-size:0.75rem;"><i class="fa fa-clock"></i> DOSAGE</h5>
                        <p style="font-size:0.85rem; line-height:1.4;">${p.dosage || "Take as precisely directed by your healthcare specialist."}</p>
                    </div>
                    <div class="med-info-item" style="margin-top:10px;">
                        <h5 style="color:var(--tl); margin-bottom:4px; font-size:0.75rem;"><i class="fa fa-box-archive"></i> STORAGE</h5>
                        <p style="font-size:0.85rem; line-height:1.4;">${p.storage || "Store in a cool, dry place. Keep protected from child access."}</p>
                    </div>
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

  const overlay = document.getElementById("modal");
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
  if (p) {
    window.history.replaceState({ productId: p.id }, '', getProductUrl(p));
    updateProductSEO(p);
  }
};

window.closeModal = function (e) {
  if (e.target === document.getElementById("modal")) closeModalDirect();
};

window.closeModalDirect = function () {
  document.getElementById("modal").classList.remove("open");
  document.body.style.overflow = "";
  window.history.replaceState(null, '', '/');
  resetPageSEO();
};

// ── CART LOGIC ─────────────────────────────────────────────────────────────
window.addToCart = function (id) {
  const p = _allProducts.find((x) => x.id === id);
  if (!p) return;
  const existing = _cart.find((i) => i.id === id);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, 20);
  } else {
    _cart.push({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      qty: 1,
      brand: p.brand,
    });
  }
  saveCart();
  toast(`${p.name} added to cart`, "success");
  refreshProductGrids();
};

window.removeFromCart = function (id) {
  _cart = _cart.filter((i) => i.id !== id);
  saveCart();
  refreshProductGrids();
};

window.updateQty = function (id, delta) {
  const item = _cart.find((i) => i.id === id);
  if (!item) return;
  item.qty = Math.max(0, Math.min(item.qty + delta, 20));
  if (item.qty === 0) _cart = _cart.filter((i) => i.id !== id);
  saveCart();
  refreshProductGrids();
};

function saveCart() {
  localStorage.setItem("rv_cart", JSON.stringify(_cart));
  renderCart();
  updateCartBadge();
}

function refreshProductGrids() {
  renderHome();
  renderProductsPage();
}

function updateCartBadge() {
  const total = _cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (!badge) return;
  if (total > 0) {
    badge.textContent = total > 99 ? "99+" : total;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (!_cart.length) {
    container.innerHTML = `<div class="cart-empty"><i class="fa fa-bag-shopping"></i><p>Your cart is empty</p></div>`;
    document.getElementById("cartSubtotal").textContent = "₹0";
    document.getElementById("cartDelivery").textContent = "₹49";
    document.getElementById("cartTotal").textContent = "₹49";
    return;
  }

  container.innerHTML = _cart
    .map(
      (item) => `
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
    `,
    )
    .join("");

  const sub = _cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = sub >= 499 ? 0 : 49;
  const total = sub + delivery;

  document.getElementById("cartSubtotal").textContent = `₹${sub}`;
  document.getElementById("cartDelivery").textContent =
    delivery === 0 ? "FREE" : `₹${delivery}`;
  document.getElementById("cartTotal").textContent = `₹${total}`;
}

// ── CART DRAWER ────────────────────────────────────────────────────────────
window.toggleCart = function () {
  _cartOpen = !_cartOpen;
  document.getElementById("cartDrawer").classList.toggle("open", _cartOpen);
  document.getElementById("cartOverlay").classList.toggle("open", _cartOpen);
  document.body.style.overflow = _cartOpen ? "hidden" : "";
};

// ── CHECKOUT ───────────────────────────────────────────────────────────────
async function createOrderOnServer() {
  const sub = _cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = sub >= 499 ? 0 : 49;
  const phone = document.getElementById("checkoutPhone")?.value.trim();
  const address = document.getElementById("checkoutAddress")?.value.trim();

  if (!phone || !address) {
    toast("Please enter both Phone and Address for delivery", "error");
    throw new Error("Incomplete checkout details");
  }

  const payload = {
    products: _cart.map((i) => ({
      productId: i.id,
      name: i.name,
      quantity: i.qty,
      price: i.price,
    })),
    totalAmount: sub + delivery,
    userName: _user ? `${_user.name} (${_user.email})` : "Guest User",
    address: `${address} | Phone: ${phone}`,
  };

  const res = await fetch(`${API}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Order creation failed: ${res.status}`);
  return res.json();
}

async function confirmPayment(orderId, provider, paymentId, success = true) {
  return fetch(`${API}/api/orders/${orderId}/payment-confirmation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      paymentId,
      status: success ? "Paid" : "Failed",
    }),
  });
}

window.checkout = async function () {
  if (!_cart.length) {
    toast("Your cart is empty", "error");
    return;
  }

  try {
    const data = await createOrderOnServer();
    if (!data || !data.order) throw new Error("Order creation failed.");

    const order = {
      id: data.order._id || "ORD" + Date.now(),
      items: [..._cart],
      totalAmount: data.order.totalAmount,
      status: data.order.status,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    _orders.unshift(order);
    localStorage.setItem("rv_orders", JSON.stringify(_orders));
    _cart = [];
    saveCart();
    renderOrders();
    if (_cartOpen) toggleCart();
    toast("🎉 Order placed successfully!", "success");
    showPage("orders");
  } catch (err) {
    console.error("Checkout error:", err);
    toast("Checkout failed. Please try again.", "error");
  }
};

window.startPayment = async function (method) {
  if (!_cart.length) {
    toast("Cart is empty. Add items first.", "error");
    return;
  }

  try {
    const initial = await createOrderOnServer();
    const orderId = initial.order?._id;
    const totalAmount = initial.order?.totalAmount;
    if (!orderId) throw new Error("Order creation failed on backend");

    const amount = Math.round(totalAmount * 100);

    if (method === "razorpay") {
      if (typeof Razorpay === "undefined") {
        toast("💳 Razorpay SDK not loaded. Please check your internet connection.", "error");
        setTimeout(() => { if (typeof Razorpay !== "undefined") window.startPayment(method); }, 2000);
        return;
      }

      try {
        // ── STEP 1: Create Razorpay order on backend FIRST and AWAIT ──────────
        const token = localStorage.getItem('rl_token') || localStorage.getItem('userToken') || '';
        const rzpRes = await fetch(`${API}/api/orders/create-razorpay-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({ amount: totalAmount, currency: "INR" }),
        });
        const rzpData = await rzpRes.json();

        // ── STEP 2: Guard — do NOT open checkout if order_id is missing ───────
        if (!rzpRes.ok || (!rzpData.order_id && !rzpData.id)) {
          console.error("Razorpay order creation failed:", rzpData);
          toast(rzpData.message || "Payment could not be initiated. Please try again.", "error");
          return;
        }

        const razorpayOrderId = rzpData.order_id || rzpData.id;

        // ── STEP 3: Only NOW open the Razorpay checkout ───────────────────────
        const options = {
          key: RZP_KEY_ID || rzpData.key || "rzp_test_YourRazorpayKeyHere",
          amount: rzpData.amount || Math.round(totalAmount * 100),
          currency: rzpData.currency || "INR",
          name: "Rivaansh Lifesciences",
          description: "Safe & Secure Clinical Purchase",
          order_id: razorpayOrderId,
          prefill: {
            email: _user?.email || localStorage.getItem('rl_email') || "",
            name: _user?.name  || localStorage.getItem('rl_name')  || "Guest",
            contact: localStorage.getItem('rl_phone') || ""
          },
          notes: { orderId: String(orderId) },
          theme: { color: "#2563eb" },
          handler: async function (response) {
            // ── STEP 4: Verify payment signature on backend ───────────────────
            try {
              const verifyRes = await fetch(`${API}/api/orders/verify-payment`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": "Bearer " + token
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();

              if (verifyData.success) {
                await confirmPayment(orderId, "razorpay", response.razorpay_payment_id, true);
                const confirmedOrder = {
                  id: orderId,
                  items: [..._cart],
                  totalAmount: totalAmount,
                  status: "Paid",
                  date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
                };
                _orders.unshift(confirmedOrder);
                localStorage.setItem("rv_orders", JSON.stringify(_orders));
                _cart = [];
                saveCart();
                renderOrders();
                showPage("orders");
                toast(`🎉 Payment successful! Order #${String(orderId).slice(-8).toUpperCase()}`, "success");
              } else {
                toast("Payment verification failed. Please contact support.", "error");
              }
            } catch (verifyErr) {
              console.error("Payment verification error:", verifyErr);
              toast("Payment received but verification failed. Contact support.", "error");
            }
          },
          modal: {
            ondismiss: function () { toast("Payment window closed", "info"); }
          }
        };

        const rzp = new Razorpay(options);
        rzp.on("payment.failed", function (response) {
          console.error("Razorpay payment failed:", response.error);
          toast("Payment failed: " + response.error.description, "error");
        });
        rzp.open();

      } catch (err) {
        console.error("Razorpay initiation error:", err);
        toast("Payment initialization failed: " + err.message, "error");
      }
      return;

    } else if (method === "paypal") {
      const returnUrl = `${window.location.origin}/payment-success?order=${orderId}`;
      const cancelUrl = `${window.location.origin}/payment-fail`;
      const url = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=rivaanshlifesciences@gmail.com&item_name=Rivaansh+Pharma+Order&amount=${(amount / 100).toFixed(2)}&currency_code=INR&return=${encodeURIComponent(returnUrl)}&cancel_return=${encodeURIComponent(cancelUrl)}&custom=${orderId}`;
      window.open(url, "_blank");
      toast("Redirected to PayPal checkout", "info");

      const pendingOrder = {
        id: orderId,
        items: [..._cart],
        totalAmount: totalAmount,
        status: "Payment Pending (PayPal)",
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };
      _orders.unshift(pendingOrder);
      localStorage.setItem("rv_orders", JSON.stringify(_orders));
      _cart = [];
      saveCart();
      renderOrders();
      showPage("orders");
    }
  } catch (err) {
    console.error("Payment init error:", err);
    toast(`Payment failed: ${err.message}`, "error");
  }
};

window.shareWhatsApp = function (message) {
  const payload = encodeURIComponent(
    message ||
      "Check out Rivaansh Lifesciences pharmacy: " + window.location.href,
  );
  const link = `https://wa.me/?text=${payload}`;
  window.open(link, "_blank");
};

// ── ORDERS ─────────────────────────────────────────────────────────────────
function renderOrders() {
  const container = document.getElementById("ordersList");
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

  container.innerHTML = _orders
    .map(
      (o) => `
        <div class="order-card">
            <div class="order-top">
                <div>
                    <div class="order-id">Order #${String(o.id).slice(-8).toUpperCase()}</div>
                    <div class="order-date">${o.date}</div>
                </div>
                <span class="order-status ${o.status === "delivered" ? "delivered" : ""}">${(o.status || "Confirmed").toUpperCase()}</span>
            </div>
            <p class="order-meta"><strong>${o.items?.length || 0} item(s)</strong> ordered</p>
            <p class="order-total">Total: ₹${o.totalAmount}</p>
            
            <!-- FEATURE 3: Order Status Timeline -->
            <div style="margin-top:12px; padding:10px; background:var(--bg); border-radius:8px; font-size:.8rem;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    ${['pending', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered']
                        .map((status, idx) => {
                            const statusIndex = ['pending', 'confirmed', 'dispatched', 'out_for_delivery', 'delivered'].indexOf(o.status || 'pending');
                            const isCompleted = idx <= statusIndex;
                            const icons = {
                                pending: 'clock-o',
                                confirmed: 'check-circle-o',
                                dispatched: 'truck',
                                out_for_delivery: 'location-arrow',
                                delivered: 'home'
                            };
                            return `
                                <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
                                    <div style="width:28px; height:28px; border-radius:50%; background:${isCompleted ? 'var(--tl)' : 'var(--border)'}; display:flex; align-items:center; justify-content:center; color:white; font-size:.7rem;">
                                        <i class="fa fa-${icons[status]}"></i>
                                    </div>
                                    <span style="text-transform:capitalize; white-space:nowrap; max-width:50px; text-align:center; word-break:break-word;">${status.replace('_', ' ')}</span>
                                </div>
                            `;
                        }).join('')}
                </div>
            </div>
            
            <details style="margin-top:10px; cursor:pointer;">
                <summary style="font-size:.82rem; font-weight:700; color:var(--tl); user-select:none;">View Items</summary>
                <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
                    ${(o.items || [])
                      .map(
                        (i) => `
                        <div style="display:flex; justify-content:space-between; font-size:.8rem; padding:6px 10px; background:var(--bg); border-radius:6px;">
                            <span>${i.name} <strong>×${i.qty || i.quantity || 1}</strong></span>
                            <span style="font-weight:700;">₹${(i.price || 0) * (i.qty || i.quantity || 1)}</span>
                        </div>`,
                      )
                      .join("")}
                </div>
            </details>
        </div>
    `,
    )
    .join("");
}

// ── PAGE NAVIGATION ────────────────────────────────────────────────────────
window.showPage = function (page) {
  // Map compliance page aliases to actual page IDs
  const pageMap = {
    privacy: "privacyPage",
    terms: "termsPage",
    refund: "refundPage",
    faq: "faqPage",
    contact: "contactPage",
    orderTracking: "orderTrackingPage",
    prescriptionAnalysis: "prescriptionAnalysisPage",
    dashboard: "dashboardPage",
  };

  const pageId = pageMap[page] || page + "Page";

  if (
    pageId === "adminPanelPage" &&
    (!_user || (_user.role !== "admin" && !_user.isAdmin))
  ) {
    toast("⚠️ Admin access required", "info"); // for demo, we show info and allow entry if they just clicked
  }

  document.querySelectorAll(".page").forEach((p) => {
    p.classList.remove("active");
    // Ensure display is block while animating in
    if (p.id === pageId) {
      p.style.display = "block";
      // Tiny delay to trigger CSS transition
      setTimeout(() => p.classList.add("active"), 10);
    } else {
      p.classList.remove("active");
      // Hide after transition
      setTimeout(() => {
        if (!p.classList.contains("active")) p.style.display = "none";
      }, 500);
    }
  });

  // Sync nav & Bottom Nav (App Experience)
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.dataset.page === page);
  });
  
  // Mobile Nav Active State Hub
  const btnHome = document.getElementById("navHome");
  const btnShop = document.getElementById("navShop");
  const btnProfile = document.getElementById("navProfile");
  
  if (btnHome) btnHome.classList.toggle("active", page === "home");
  if (btnShop) btnShop.classList.toggle("active", page === "products");
  if (btnProfile) btnProfile.classList.toggle("active", page === "dashboard");

  if (pageId === "orderTrackingPage") renderOrderTracking();
  if (pageId === "adminPanelPage") updateAdminStats();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.toggleAdminView = function (viewId) {
  const form = document.querySelector(".admin-form-card");
  if (form) form.classList.toggle("hidden");
};

window.adminAddProduct = async function () {
  const name = document.getElementById("apName").value;
  const price = document.getElementById("apPrice").value;
  if (!name || !price) {
    toast("Name and Price are mandatory", "error");
    return;
  }

  const payload = {
    name,
    price,
    originalPrice: document.getElementById("apOrigPrice").value || null,
    category: document.getElementById("apCat").value,
    brand: document.getElementById("apBrand").value || "Rivaansh",
    composition:
      document.getElementById("apComp").value || "Clinical Formulation",
    image:
      document.getElementById("apImg").value ||
      "https://placehold.co/400x300/e0f5f2/0a7c6e?text=New+Med",
    description:
      document.getElementById("apDesc").value ||
      "New clinical product from Rivaansh Lifesciences.",
  };

  try {
    const token = localStorage.getItem("rv_admin_token");
    const res = await fetch(`${API}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-admin-token": token } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create product on backend");
    const newP = await res.json();
    _allProducts.unshift(newP);
    toast("✅ Product created successfully", "success");
    document
      .querySelectorAll(".admin-form-card input, .admin-form-card textarea")
      .forEach((i) => (i.value = ""));
    toggleAdminView("addProduct");
    refreshProductGrids();
  } catch (err) {
    console.error(err);
    toast("Admin error: Could not save product to server.", "error");
  }
};

window.logout = function () {
  _user = null;
  localStorage.removeItem("rv_user");
  localStorage.removeItem("rv_admin_token");
  renderAuthButtons();
  showPage("home");
  toast("Logged out successfully", "info");
};

// ── AUTH (Sign in / sign up) ─────────────────────────────────────────────────
function saveAuthState() {
  localStorage.setItem("rv_user", JSON.stringify(_user));
  localStorage.setItem("rv_users", JSON.stringify(_users));
  renderAuthButtons();
}

function renderAuthButtons() {
  const userName = document.getElementById("authUserName");
  const adminNav = document.getElementById("adminNavLink");
  if (!userName) return;

  if (_user) {
    userName.textContent = `Hi, ${_user.name.split(" ")[0]}`;
    if (_user.isAdmin) {
      adminNav?.classList.remove("hidden");
    } else {
      adminNav?.classList.add("hidden");
    }
  } else {
    userName.textContent = "Profile";
    adminNav?.classList.add("hidden");
  }
}

window.switchAuthTab = function (tab) {
  const tabs = document.querySelectorAll(".auth-tab");
  const contents = document.querySelectorAll(".auth-tab-content");
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === tab));
  contents.forEach((c) => c.classList.toggle("active", c.id === `${tab}Tab`));
};

async function updateAdminStats() {
  if (!document.getElementById("adminPanelPage")) return;
  const el = (id) => document.getElementById(id);
  if (!el("adminOrdersCount")) return;

  if (_user && _user.isAdmin) {
    const token = localStorage.getItem("rv_admin_token");
    if (token) {
      try {
        const res = await fetch(`${API}/api/admin/stats`, {
          headers: { "x-admin-token": token },
        });
        if (res.ok) {
          const stats = await res.json();
          if (el("adminOrdersCount"))
            el("adminOrdersCount").textContent = stats.orders;
          if (el("adminPrescriptionsCount"))
            el("adminPrescriptionsCount").textContent = stats.prescriptions;
          if (el("adminUsersCount"))
            el("adminUsersCount").textContent = stats.users;
          if (el("adminProductsCount"))
            el("adminProductsCount").textContent = stats.products;

          renderAdminPrescriptions();
          return;
        }
      } catch (err) {
        console.warn("Admin stats fetch failed:", err);
      }
    }
  }
  // Fallback counts if offline
  if (el("adminOrdersCount"))
    el("adminOrdersCount").textContent = _orders.length;
  if (el("adminPrescriptionsCount"))
    el("adminPrescriptionsCount").textContent = _prescriptions.filter(
      (r) => r.status === "Pending",
    ).length;
  if (el("adminUsersCount")) el("adminUsersCount").textContent = _users.length;
  if (el("adminProductsCount"))
    el("adminProductsCount").textContent = _allProducts.length;
}

async function renderAdminPrescriptions() {
  const list = document.getElementById("adminPrescriptionList");
  if (!list) return;

  try {
    const res = await fetch(`${API}/api/admin/prescriptions`, {
      headers: { "x-admin-token": localStorage.getItem("rv_admin_token") },
    });
    const items = await res.json();

    if (!items || !items.length) {
      list.innerHTML = `<p style="text-align:center; padding:20px; color:#999;">No pending prescriptions.</p>`;
      return;
    }

    list.innerHTML = items
      .map(
        (rx) => `
            <div class="prescription-item" style="padding:15px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center;">
                <div class="rx-info">
                    <strong style="display:block; color:var(--text);">${rx.fileName}</strong>
                    <span style="font-size:0.75rem; color:#888;">Product: ${rx.productId} | ${rx.uploadedAt}</span>
                </div>
                <div class="rx-actions">
                    <button class="rx-approve" onclick="adminReviewRx('${rx._id || rx.id}', 'Approved')">Approve</button>
                    <button class="rx-reject" onclick="adminReviewRx('${rx._id || rx.id}', 'Rejected')">Reject</button>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Admin RX render failed:", err);
  }
}

window.adminReviewRx = async function (id, status) {
  try {
    const res = await fetch(`${API}/api/prescriptions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": localStorage.getItem("rv_admin_token"),
      },
      body: JSON.stringify({
        status,
        comment: `${status} by Admin on ${new Date().toLocaleDateString()}`,
      }),
    });
    if (res.ok) {
      toast(`🩺 Prescription ${status}!`, "info");
      updateAdminStats();
    }
  } catch (err) {
    toast("Review failed", "error");
  }
};

window.adminAddProduct = async function () {
  const name = document.getElementById("addProductName")?.value.trim();
  const price = document.getElementById("addProductPrice")?.value.trim();
  const cat = document.getElementById("addProductCategory")?.value.trim();
  const desc = document.getElementById("addProductDesc")?.value.trim();

  if (!name || !price || !cat) {
    toast("Please fill basic product info", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/api/admin/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": localStorage.getItem("rv_admin_token"),
      },
      body: JSON.stringify({
        name,
        price: Number(price),
        category: cat,
        description: desc,
        brand: "Rivaansh",
        image: "images/medicine_placeholder.jpg",
      }),
    });
    if (res.ok) {
      toast("📦 New Product Published!", "success");
      setTimeout(() => window.location.reload(), 1500);
    }
  } catch (err) {
    toast("Publish failed", "error");
  }
};

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("open");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("open");
}

window.handleAuth = async function (type) {
  if (type === "login") {
    const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
    const pass = document.getElementById("loginPass")?.value;

    if (!email || !pass) return toast("Please enter email and password", "error");

    try {
      const result = loginUser(email, pass);
      
      if (result.ok) {
        _user = result.user;
        saveAuthState();
        closeAuthModal();
        toast(`Welcome back, ${_user.name.split(" ")[0]}!`, "success");
        if (_user.role === "admin") showPage("adminPanel");
        else showPage("dashboard");
      } else {
        toast(result.message || "Login failed", "error");
      }
    } catch (err) {
      toast(err.message || "Login error", "error");
    }
  } else {
    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
    const pass = document.getElementById("signupPass")?.value;

    if (!name || !email || !pass) return toast("Please fill all signup fields", "error");

    try {
      const result = registerUser(name, email, '', pass);
      
      if (result.ok) {
        _user = result.user;
        saveAuthState();
        closeAuthModal();
        toast("🎉 Health ID Created! Welcome to Rivaansh.", "success");
        showPage("dashboard");
      } else {
        toast(result.message || "Registration failed", "error");
      }
    } catch (err) {
      toast(err.message || "Registration error", "error");
    }
  }
};

function logout() {
  _user = null;
  saveAuthState();
  toast("Logged out successfully", "info");
}

// ── WISHLIST ───────────────────────────────────────────────────────────────
function saveWishlist() {
  localStorage.setItem("rv_wishlist", JSON.stringify(_wishlist));
  renderWishlistCount();
}

function renderWishlistCount() {
  const el = document.getElementById("wishlistBadge");
  if (!el) return;
  el.textContent = _wishlist.length ? _wishlist.length : "";
}

window.toggleWishlist = function (id, evt) {
  if (evt) evt.stopPropagation();
  const i = _wishlist.indexOf(id);
  if (i < 0) {
    _wishlist.push(id);
    toast("Added to wishlist", "success");
  } else {
    _wishlist.splice(i, 1);
    toast("Removed from wishlist", "info");
  }
  saveWishlist();
  renderHome();
  renderProductsPage();
};

function renderWishlistPage() {
  const container = document.getElementById("wishlistGrid");
  if (!container) return;

  const list = _allProducts.filter((p) => _wishlist.includes(p.id));
  if (!list.length) {
    container.innerHTML =
      '<div class="empty-wishlist"><i class="fa fa-heart-crack"></i><p>No items in wishlist yet.</p></div>';
    return;
  }
  container.innerHTML = list.map((p) => cardHTML(p)).join("");
}

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────
function saveNotifications() {
  localStorage.setItem("rv_notifications", JSON.stringify(_notifications));
  renderNotificationsPanel();
}

function addNotification(message, type = "info") {
  const note = {
    id: `n_${Date.now()}`,
    message,
    type,
    time: new Date().toLocaleTimeString("en-IN"),
  };
  _notifications.unshift(note);
  if (_notifications.length > 25) _notifications.pop();
  saveNotifications();
  toast(message, type === "error" ? "error" : "success");
}

function renderNotificationsPanel() {
  const panel = document.getElementById("notificationsPanel");
  const count = document.getElementById("notifBadge");
  if (!panel || !count) return;
  count.textContent = _notifications.length ? _notifications.length : "";
  panel.innerHTML = _notifications
    .map(
      (n) =>
        `<div class="notif-item notif-${n.type}"><span>${n.message}</span><small>${n.time}</small></div>`,
    )
    .join("");
}

function savePrescriptions() {
  localStorage.setItem("rv_prescriptions", JSON.stringify(_prescriptions));
}

function renderPrescriptionsPage() {
  const section = document.getElementById("prescriptionsPage");
  if (!section) return;
  const list = section.querySelector(".prescription-list");
  if (!list) return;

  if (!_prescriptions.length) {
    list.innerHTML =
      '<div class="empty-prescriptions"><i class="fa fa-file-prescription"></i><p>No prescriptions uploaded yet.</p></div>';
    return;
  }

  list.innerHTML = _prescriptions
    .map((rx) => {
      const isImage =
        rx.fileType?.startsWith("image/") ||
        rx.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
      const isPdf =
        rx.fileType === "application/pdf" || rx.fileName.match(/\.pdf$/i);

      let previewHtml = "";
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
            <div class="rx-comment">${rx.comment || "--"}</div>
            <div class="rx-preview-area">${previewHtml}</div>
            <div class="rx-actions">
                <a href="${rx.dataUrl}" download="${rx.fileName}" target="_blank" class="btn-secondary">Download</a>
                <button class="btn-secondary" onclick="removePrescription('${rx.id}')">Delete</button>
                ${
                  rx.status === "Pending"
                    ? `
                    <button class="btn-secondary" onclick="updatePrescriptionStatus('${rx.id}', 'Approved')">Approve</button>
                    <button class="btn-secondary" onclick="updatePrescriptionStatus('${rx.id}', 'Rejected')">Reject</button>
                `
                    : ""
                }
            </div>
        </div>`;
    })
    .join("");
}

function openPreviewModal(dataUrl, fileType) {
  const modal = document.getElementById("previewModal");
  const content = document.getElementById("previewModalContent");
  if (!modal || !content) return;

  if (fileType?.startsWith("image/")) {
    content.innerHTML = `<img class="preview-zoom-img" src="${dataUrl}" alt="Preview" />`;
  } else if (
    fileType === "application/pdf" ||
    dataUrl.startsWith("data:application/pdf")
  ) {
    content.innerHTML = `<iframe class="preview-zoom-iframe" src="${dataUrl}" frameborder="0"></iframe>`;
  } else {
    content.innerHTML = `<p>Preview not available for this file format.</p>`;
  }

  modal.classList.add("open");
}

function closePreviewModal(event) {
  if (
    event.target.id === "previewModal" ||
    event.target.id === "previewModalClose"
  ) {
    const modal = document.getElementById("previewModal");
    if (modal) modal.classList.remove("open");
  }
}

window.toggleNotifications = function () {
  const pnl = document.getElementById("notificationsPanel");
  if (!pnl) return;
  pnl.classList.toggle("open");
};

// ── PRESCRIPTION UPLOAD ────────────────────────────────────────────────────
window.handlePrescriptionUpload = async function (e, productId) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result;
    const payload = {
      productId,
      user: _user ? _user.email : "guest",
      fileName: file.name,
      uploadedAt: new Date().toLocaleString("en-IN"),
      fileType: file.type,
      dataUrl,
    };

    try {
      const res = await fetch(`${API}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      _prescriptions.unshift(saved);
    } catch (err) {
      console.warn(
        "Backend prescription upload failed, falling back to local:",
        err.message,
      );
      const item = {
        id: `rx_${Date.now()}`,
        ...payload,
        status: "Pending",
        comment: "Awaiting pharmacist review",
        isReviewed: false,
      };
      _prescriptions.unshift(item);
    }

    if (_prescriptions.length > 20) _prescriptions.pop();
    savePrescriptions();
    addNotification(
      "Prescription uploaded successfully. Our pharmacist review will follow.",
      "success",
    );
    renderPrescriptionsPage();
  };
  reader.readAsDataURL(file);
};

function populatePrescriptionProductOptions() {
  const select = document.getElementById("rxProductSelect");
  if (!select || !_allProducts.length) return;

  select.innerHTML =
    '<option value="general">General Prescription</option>' +
    _allProducts
      .filter((p) => p.prescriptionRequired)
      .map((p) => `<option value="${p.id}">${p.name}</option>`)
      .join("");
}

window.uploadPrescriptionFromPanel = function () {
  const fileInput = document.getElementById("rxFileInputPanel");
  const productSelect = document.getElementById("rxProductSelect");
  const file = fileInput?.files?.[0];

  if (!file) {
    toast("Please choose a prescription file.", "error");
    return;
  }

  const selectValue = productSelect?.value || "general";
  const productId = selectValue === "general" ? "general" : Number(selectValue);

  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result;
    const payload = {
      productId,
      user: _user ? _user.email : "guest",
      fileName: file.name,
      uploadedAt: new Date().toLocaleDateString("en-IN"),
      fileType: file.type,
      dataUrl,
    };

    try {
      const res = await fetch(`${API}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      _prescriptions.unshift(saved);
    } catch (err) {
      console.warn(
        "Backend prescription upload failed, falling back to local:",
        err.message,
      );
      const item = {
        id: `rx_${Date.now()}`,
        ...payload,
        status: "Pending",
        comment: "Awaiting pharmacist review",
        isReviewed: false,
      };
      _prescriptions.unshift(item);
    }

    if (_prescriptions.length > 20) _prescriptions.pop();
    savePrescriptions();
    addNotification(
      "Prescription uploaded successfully. Our pharmacist review will follow.",
      "success",
    );
    renderPrescriptionsPage();
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
};

window.updatePrescriptionStatus = async function (id, status) {
  const rx = _prescriptions.find((x) => x.id === id);
  if (!rx) return;

  try {
    const token = localStorage.getItem("rv_admin_token");
    const res = await fetch(`${API}/api/prescriptions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "x-admin-token": token } : {}),
      },
      body: JSON.stringify({
        status,
        comment:
          status === "Approved"
            ? "Prescription approved by pharmacist."
            : "Prescription rejected. Please upload valid prescription.",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const updated = await res.json();
    Object.assign(rx, updated);
  } catch (err) {
    rx.status = status;
    rx.comment =
      status === "Approved"
        ? "Prescription approved by pharmacist (offline mode)."
        : "Prescription rejected. Please upload valid prescription.";
  }

  rx.isReviewed = true;
  savePrescriptions();
  addNotification(
    `Prescription ${status.toLowerCase()}.`,
    status === "Rejected" ? "error" : "success",
  );
  renderPrescriptionsPage();
};

window.removePrescription = async function (id) {
  try {
    const token = localStorage.getItem("rv_admin_token");
    const res = await fetch(`${API}/api/prescriptions/${id}`, {
      method: "DELETE",
      headers: token ? { "x-admin-token": token } : {},
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.warn("Backend delete failed, removing locally.", err.message);
  }
  _prescriptions = _prescriptions.filter((x) => x.id !== id);
  savePrescriptions();
  addNotification("Prescription removed.", "info");
  renderPrescriptionsPage();
};

// ── AI-BASED SUGGESTIONS ───────────────────────────────────────────────────
function renderAISuggestions() {
  const grid = document.getElementById("aiSuggestions");
  if (!grid) return;
  const query = (_currentSearch || "").toLowerCase();
  let recs = [];

  if (query) {
    recs = _allProducts.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(query) ||
        (p.composition || "").toLowerCase().includes(query) ||
        (p.brand || "").toLowerCase().includes(query),
    );
  }

  if (!recs.length) {
    recs = _allProducts
      .filter((p) => p.badge === "Trending" || p.badge === "Popular")
      .slice(0, 4);
  } else {
    recs = recs.slice(0, 4);
  }

  grid.innerHTML = recs
    .map(
      (p) => `
        <div class="ai-card" onclick="openModal(${p.id})">
            <img src="${p.image || ""}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/160x120/e0f5f2/0a7c6e?text=Rivaansh'"/>
            <h4>${p.name}</h4>
            <p>₹${p.price} • ${p.category}</p>
        </div>
    `,
    )
    .join("");
}

// ── AUTO-REFILL SUBSCRIPTIONS ─────────────────────────────────────────────
window.addSubscription = function (id) {
  if (!_user) {
    toast("Login required to add subscription", "error");
    return;
  }
  if (_subscriptions.includes(id)) {
    toast("Already subscribed", "info");
    return;
  }
  _subscriptions.push(id);
  localStorage.setItem("rv_subscriptions", JSON.stringify(_subscriptions));
  addNotification(
    "Auto-refill subscription enabled for this product.",
    "success",
  );
};

// ── MEDICINE INFO FEATURE ────────────────────────────────────────────────
window.toggleMedInfo = function (id) {
  const el = document.getElementById("modalMedInfo");
  if (el) el.classList.toggle("hidden");
};

window.searchMedInfo = function (val) {
  const results = document.getElementById("medInfoResults");
  if (!results) return;

  if (!val.trim()) {
    results.innerHTML = `<div class="med-info-placeholder"><i class="fa fa-book-medical"></i><p>Search for a medicine to view detailed clinical information.</p></div>`;
    return;
  }

  const q = val.toLowerCase();
  const filtered = _allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.composition.toLowerCase().includes(q),
  );

  if (!filtered.length) {
    results.innerHTML = `<div class="med-info-placeholder"><i class="fa fa-circle-question"></i><p>No medical matches found for "${val}". Please consult a pharmacist.</p></div>`;
    return;
  }

  results.innerHTML = filtered
    .map(
      (p) => `
        <div class="med-info-card">
            <div class="med-info-header">
                <h3 class="med-info-title">${p.name}</h3>
                <span class="med-info-badge">${p.brand}</span>
            </div>
            <div class="med-info-comp"><i class="fa fa-flask-vial"></i> ${p.composition}</div>
            <div class="med-info-grid">
                <div class="med-info-item">
                    <h5>Primary Uses</h5>
                    <p>${p.uses || "Used as directed by a healthcare professional according to patient history."}</p>
                </div>
                <div class="med-info-item">
                    <h5>Common Side Effects</h5>
                    <p>${p.sideEffects || "Generally safe when taken correctly. Consult a doctor if any unusual symptoms occur."}</p>
                </div>
                <div class="med-info-item">
                    <h5>Recommended Dosage</h5>
                    <p>${p.dosage || "Dosage depends on age, weight, and general health condition."}</p>
                </div>
                <div class="med-info-item">
                    <h5>Storage Instructions</h5>
                    <p>${p.storage || "Protect from moisture and heat. Keep out of reach of children."}</p>
                </div>
            </div>
            <div style="margin-top:20px; display:flex; gap:10px;">
                <button class="btn-primary" style="padding: 10px 20px" onclick="openModal(${p.id})">Order Now</button>
                <button class="btn-ghost" style="color:var(--tl); border-color:var(--tl)" onclick="shareWhatsApp('Medical info for ${p.name}: ${p.uses}')"><i class="fa fa-share"></i> Share Info</button>
            </div>
        </div>
    `,
    )
    .join("");
};

function checkAutoRefill() {
  if (!_subscriptions.length) return;
  _subscriptions.forEach((id) => {
    const p = _allProducts.find((p) => p.id === id);
    if (!p) return;
    addNotification(
      `Auto-refill: ${p.name} order created automatically. Check Orders.`,
      "info",
    );
    const existing = _cart.find((c) => c.id === p.id);
    if (!existing)
      _cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        qty: 1,
        brand: p.brand,
      });
    saveCart();
  });
}

setInterval(checkAutoRefill, 1000 * 60 * 5); // every 5 min demo

// ── VOICE SEARCH ─────────────────────────────────────────────────────────
window.startVoiceSearch = function () {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    toast("Voice search is not supported in this browser.", "error");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    toast("Listening... speak now", "info");
  };
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const input = document.getElementById("searchInput");
    if (input) input.value = transcript;
    _currentSearch = transcript;
    applyFilters();
    renderAISuggestions();
    toast(`Search: ${transcript}`, "success");
    showPage("products");
  };
  recognition.onerror = () => {
    toast("Voice recognition failed. Try again.", "error");
  };
  recognition.start();
};

// ── INITIAL UI ANCHOR ──────────────────────────────────────────────────────
function initUI() {
  renderAuthButtons();
  renderWishlistCount();
  renderNotificationsPanel();
}

// ── REVIEWS & RATINGS ──────────────────────────────────────────────────────
function getProductRating(productId) {
  const reviews = _reviews.filter((r) => r.productId === productId);
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = (
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  ).toFixed(1);
  return { avg: parseFloat(avg), count: reviews.length };
}

function getProductReviewsHTML(productId) {
  const { avg, count } = getProductRating(productId);
  if (!count)
    return '<div class="product-rating"><span class="rating-text">No reviews yet</span></div>';

  let stars = "";
  for (let i = 1; i <= 5; i++) {
    stars += `<i class="fa ${i <= avg ? "fa-star" : "fa-star-o"}"></i>`;
  }
  return `<div class="product-rating"><div class="stars">${stars}</div><span class="rating-text">${avg}/5 (${count})</span></div>`;
}

window.openReviewModal = function (productId) {
  if (!_user) {
    toast("Please login to leave a review", "error");
    openAuthModal();
    return;
  }

  const product = _allProducts.find((p) => p.id === productId);
  if (!product) return;

  const existingReview = _reviews.find(
    (r) => r.productId === productId && r.user === _user.email,
  );

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

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  window.currentRating = 0;
};

function selectRating(rating) {
  window.currentRating = rating;
  const stars = document.querySelectorAll(".star-select");
  stars.forEach((s, i) => {
    s.classList.toggle("active", i < rating);
  });
}

window.submitReview = function (productId) {
  if (!window.currentRating) {
    toast("Please select a rating", "error");
    return;
  }
  const text = document.getElementById("reviewText")?.value.trim();
  const review = {
    id: `rv_${Date.now()}`,
    productId,
    user: _user.email,
    name: _user.name,
    rating: window.currentRating,
    text: text || "",
    date: new Date().toLocaleDateString("en-IN"),
  };
  _reviews.push(review);
  localStorage.setItem("rv_reviews", JSON.stringify(_reviews));
  closeReviewModal();
  renderProductsPage();
  toast("Review submitted! Thank you.", "success");
};

function closeReviewModal() {
  const modal = document.querySelector(".modal-overlay.open");
  if (modal) modal.remove();
}

// ── ORDER TRACKING ─────────────────────────────────────────────────────────
window.renderOrderTracking = function () {
  const container = document.getElementById("trackingContainer");
  if (!container) return;

  if (!_orders.length) {
    container.innerHTML =
      '<p style="text-align: center; color: #999; padding: 30px;">No orders to track. <a href="#" onclick="showPage(\'products\')">Start shopping</a></p>';
    return;
  }

  let html = "";
  _orders.forEach((order) => {
    const statuses = ["Pending", "Confirmed", "Shipped", "Delivered"];
    const currentIndex = statuses.indexOf(order.status) || 0;

    let timeline = '<div class="tracking-timeline">';
    statuses.forEach((status, i) => {
      let iconClass = i <= currentIndex ? "fa-check" : "fa-clock";
      timeline += `<div class="tracking-step ${i <= currentIndex ? "completed" : ""}">
                <div class="tracking-marker"><i class="fa ${iconClass}"></i></div>
                <div class="tracking-content">
                    <div class="tracking-title">${status}</div>
                    <div class="tracking-date">${i <= currentIndex ? "Completed" : "Pending"}</div>
                </div>
            </div>`;
    });
    timeline += "</div>";

    html += `<div class="order-card" style="margin-bottom: 20px;">
            <div class="order-top">
                <div>
                    <div class="order-id">Order #${String(order.id).slice(-8).toUpperCase()}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <span class="order-status">${order.status || "Pending"}</span>
            </div>
            ${timeline}
        </div>`;
  });

  container.innerHTML = html;
};

function showOrderTracking() {
  showPage("orderTracking");
  renderOrderTracking();
}

initUI();

// ── TOAST ──────────────────────────────────────────────────────────────────
window.toast = function (msg, type = "info") {
  const t = document.createElement("div");
  t.className = `toast-startup toast-${type}`;
  const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-circle-xmark" : "fa-circle-info";
  t.innerHTML = `<i class="fa ${icon}"></i> <span>${msg}</span>`;
  document.body.appendChild(t);
  
  setTimeout(() => {
    t.style.animation = "toastDown 0.4s ease forwards";
    setTimeout(() => t.remove(), 450);
  }, 3500);
};
window.st = window.toast;

// ── ERROR STATE ────────────────────────────────────────────────────────────
function showError(isFallback = false) {
  const grids = [
    document.getElementById("homeGrid"),
    document.getElementById("allGrid"),
  ];
  grids.forEach((g) => {
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
  const counter = document.getElementById("productCount");
  if (counter)
    counter.textContent = isFallback
      ? "Fallback products loaded"
      : "Backend server not reachable";
}

function getClinicalBotResponse(input) {
  // 1. Detect Clinical Search Intent
  const meds = [
    "tablet",
    "pill",
    "capsule",
    "skin",
    "fever",
    "pain",
    "kit",
    "vitamin",
    "hvg",
    "hcg",
    "cream",
  ];
  const foundMed = meds.find((m) => input.includes(m));
  if (foundMed) {
    return `I can help find ${foundMed}-related medicines. Please search for "${foundMed}" in our Medicines Catalogue for clinical details and pricing.`;
  }

  // 2. Clinical Contextual Responses
  if (
    input.includes("order") ||
    input.includes("track") ||
    input.includes("status")
  ) {
    return "I can assist with that. Your pharmaceutical orders are tracked in real-time. Please navigate to 'My Orders' in your dashboard for the latest status.";
  }
  if (
    input.includes("medicine") ||
    input.includes("composition") ||
    input.includes("dosage")
  ) {
    return "Critical medicine details (composition, side effects, and dosage) are available in our Clinical Medicine Guide. You can find it in the footer support section.";
  }
  if (
    input.includes("prescription") ||
    input.includes("rx") ||
    input.includes("upload")
  ) {
    return "Valid prescriptions are required for Rx medicines. You can upload clinical documents directly during checkout or via the 'Prescriptions' tab.";
  }
  if (
    input.includes("doctor") ||
    input.includes("pharmacist") ||
    input.includes("expert")
  ) {
    return "Connecting you to a Rivaansh Lifesciences licensed pharmacist... For immediate assistance, please call our 24/7 clinical helpline at +91 8426033033.";
  }
  if (
    input.includes("hi") ||
    input.includes("hello") ||
    input.includes("hey")
  ) {
    return "Welcome to Rivaansh Lifesciences Support! 👋 I'm here to help with your medical queries, prescriptions, or order tracking. How may I serve you?";
  }

  return "Thank you for reaching out. For specific medical queries or pharmaceutical guidance, please use our clinical suggestion buttons or contact our direct helpline.";
}

window.handleChatAction = function (action) {
  let userInput = "";
  let actionDelay = 1500;

  if (action === "track") userInput = "Track my order";
  else if (action === "medInfo") userInput = "Find medicine info";
  else if (action === "presc") userInput = "Upload prescription";
  else if (action === "expert") {
    userInput = "Talk to an expert";
    actionDelay = 2000;
  }

  if (userInput) {
    const inputPrimary = document.getElementById("chatInputPrimary");
    if (inputPrimary) {
      inputPrimary.value = userInput;
      window.sendChatMsg();
    }
  }

  setTimeout(() => {
    if (action === "track") showPage("orders");
    if (action === "medInfo") showPage("medicineInfo");
    if (action === "presc") showPage("prescriptions");
    if (action === "expert") {
      window.location.href = "tel:+918426033033";
      toast("Calling Rivaansh Health Helpline...", "info");
    }

    // Optionally close chatbot after action
    if (action !== "expert") {
      window.closeChatbot();
    }
  }, actionDelay);
};

window.submitSupportForm = function () {
  const name = document.getElementById("suppName")?.value.trim();
  const email = document.getElementById("suppEmail")?.value.trim();
  const msg = document.getElementById("suppMsg")?.value.trim();

  if (!name || !email || !msg) {
    toast("Please fill all fields", "error");
    return;
  }

  toast(
    "🚀 Query submitted! A clinical expert will contact you soon.",
    "success",
  );
  document.getElementById("suppName").value = "";
  document.getElementById("suppEmail").value = "";
  document.getElementById("suppMsg").value = "";
};

window.uploadPrescriptionFromPanel = async function () {
  const select = document.getElementById("rxProductSelect");
  const fileInput = document.getElementById("rxFileInputPanel");
  if (!select || !fileInput) return;

  const file = fileInput.files?.[0];
  if (!file) {
    toast("Please select a pharmaceutical prescription file first.", "error");
    return;
  }

  const productId =
    select.value === "general" ? 0 : parseInt(select.value) || 0;
  const fileName = file.name;

  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result;
    const payload = {
      productId,
      user: _user ? _user.email : "guest",
      fileName,
      uploadedAt: new Date().toLocaleString("en-IN"),
      fileType: file.type,
      dataUrl,
    };

    try {
      toast("🚀 Uploading clinical document...", "info");
      const res = await fetch(`${API}/api/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      _prescriptions.unshift(saved);
      toast("✅ Prescription uploaded & synced with backend", "success");
    } catch (err) {
      const item = {
        _id: `rx_${Date.now()}`,
        ...payload,
        status: "Pending",
        comment: "Saved locally (Sync pending)",
      };
      _prescriptions.unshift(item);
      toast("⚠️ Offline: Prescription saved locally to browser", "info");
    }
    savePrescriptions();
    renderPrescriptionsPage();
    fileInput.value = "";
  };
  reader.readAsDataURL(file);
};

function populatePrescriptionProductOptions() {
  const select = document.getElementById("rxProductSelect");
  if (!select) return;

  // Keep first option
  select.innerHTML = '<option value="general">General Prescription</option>';
  _allProducts.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.name} (${p.brand})`;
    select.appendChild(opt);
  });
}

function deletePrescription(id) {
  // Use _id if available (MongoDB standard), fall back to id (offline support)
  _prescriptions = _prescriptions.filter((r) => (r._id || r.id) !== id);
  savePrescriptions();
  renderPrescriptionsPage();
  toast("Prescription removed from clinical queue", "info");

  // Sync delete with server using the ID found
  fetch(`${API}/api/prescriptions/${id}`, { method: "DELETE" }).catch(() => {});
}

window.removePrescription = deletePrescription;

window.updateBottomNav = function (btn) {
  const nav = btn.parentElement;
  if (!nav) return;
  nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
};

function attachSpotlightNav() {
  const nav = document.querySelector(".desktop-nav");
  if (!nav) return;
  nav.addEventListener("mousemove", (e) => {
    const rect = nav.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    nav.style.setProperty("--x", `${x}px`);
    nav.style.setProperty("--y", `${y}px`);
  });
}

window.handleSearch = function (val) {
  _currentSearch = (val || "").toLowerCase().trim();
  applyFilters();
  showPage("products");
};

window.clearSearch = function () {
  const el = document.getElementById("mainSearch");
  if (el) el.value = "";
  _currentSearch = "";
  applyFilters();
  renderProductsPage();
};

window.filterCat = function (cat, btn) {
  _currentCat = cat;
  applyFilters();
  if (btn && btn.parentElement) {
    btn.parentElement
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  } else if (btn) {
    document.querySelectorAll(".cat-btn, .category-bar button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  }
};

// ── AI MEDICINE INFO (API-powered) ────────────────────────────
window.searchMedInfoAI = async function (val) {
    if (!val || val.trim().length < 2) return;
    const results = document.getElementById('medInfoResults');
    if (!results) return;

    // Local matches
    window.searchMedInfo(val);

    const localMatch = _allProducts.find(p =>
        p.name.toLowerCase().includes(val.toLowerCase()) ||
        p.composition.toLowerCase().includes(val.toLowerCase())
    );

    if (!localMatch && val.trim().length > 3) {
        try {
            const res = await fetch(`${API}/api/ai/medicine-info`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicine: val.trim() })
            });
            const data = await res.json();
            if (res.ok && data.result) {
                results.innerHTML = `
                    <div class="med-info-card">
                        <div class="med-info-header">
                            <h3 class="med-info-title"><i class="fa fa-wand-magic-sparkles" style="color:var(--tl)"></i> AI Clinical Info: ${val}</h3>
                            <span class="med-info-badge">AI Powered</span>
                        </div>
                        <div class="med-info-ai-content">${data.result.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
                        <small style="color:#94a3b8;margin-top:15px;display:block;">⚠️ AI-generated information. Always consult a licensed pharmacist.</small>
                    </div>`;
            }
        } catch (e) {
            console.warn('AI offline');
        }
    }
};

// ── DRUG INTERACTION CHECKER ──────────────────────────────────
window.checkDrugInteractions = async function () {
    const input = document.getElementById('drugInteractInput');
    const resultBox = document.getElementById('drugInteractResult');
    const drugs = input?.value.trim();
    if (!drugs) return toast('Enter medicine names separated by commas', 'info');

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<div class="diag-loading"><i class="fa fa-spinner fa-spin"></i> Checking clinical interactions...</div>';

    try {
        const res = await fetch(`${API}/api/ai/drug-interact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ drugs })
        });
        const data = await res.json();
        if (res.ok && data.result) {
            resultBox.innerHTML = `
                <div class="ai-result-header"><i class="fa fa-pills"></i> Interaction Analysis</div>
                <div class="ai-result-body">${data.result.replace(/\n/g, '<br>')}</div>
                <div class="ai-result-disclaimer">⚠️ Consult a doctor before combining medications.</div>`;
        } else {
            throw new Error(data.error);
        }
    } catch (e) {
        resultBox.innerHTML = `
            <div class="ai-result-header"><i class="fa fa-triangle-exclamation"></i> Offline Analysis</div>
            <div class="ai-result-body">Drug interaction data unavailable. Call <strong>+91 8426033033</strong> for guidance.</div>
            <div class="ai-result-disclaimer">⚠️ Never combine medications without professional supervision.</div>`;
    }
};

window.quickDrugCheck = function (drugString) {
    const input = document.getElementById('drugInteractInput');
    if (input) {
        input.value = drugString;
        window.checkDrugInteractions();
    }
};

// ── HEALTH RISK SCREENER ──────────────────────────────────────
window.runHealthRisk = async function () {
    const age = document.getElementById('riskAge')?.value;
    const weight = document.getElementById('riskWeight')?.value;
    const height = document.getElementById('riskHeight')?.value;
    const conditions = document.getElementById('riskConditions')?.value.trim();
    const lifestyle = document.getElementById('riskLifestyle')?.value.trim();
    const resultBox = document.getElementById('healthRiskResult');

    if (!age) return toast('Please enter your age to proceed', 'info');

    let bmi = null;
    if (weight && height) {
        bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    }

    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<div class="diag-loading"><i class="fa fa-spinner fa-spin"></i> Assessing Health Risk...</div>';

    try {
        const res = await fetch(`${API}/api/ai/health-risk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ age, weight, height, bmi, conditions, lifestyle })
        });
        const data = await res.json();
        if (res.ok && data.result) {
            const bmiInfo = bmi ? `<div class="bmi-badge" style="background:#eff6ff;padding:12px 18px;border-radius:12px;border:1px solid #bfdbfe;margin-bottom:15px;"><strong>BMI: ${bmi}</strong></div>` : '';
            resultBox.innerHTML = `
                ${bmiInfo}
                <div class="ai-result-header"><i class="fa fa-shield-heart"></i> AI Risk Assessment</div>
                <div class="ai-result-body">${data.result.replace(/\n/g, '<br>')}</div>
                <div class="ai-result-disclaimer">⚠️ This is for reference only.</div>`;
        } else {
            throw new Error(data.error);
        }
    } catch (e) {
        resultBox.innerHTML = `<div class="ai-result-body">Assessment offline. Contact us at +91 8426033033 for guidance.</div>`;
    }
};

// ── AI CLINICAL CHATBOT ───────────────────────────────────────
window.toggleChatbot = function () {
    const wrapper = document.getElementById('chatbotWrapper');
    if (wrapper) wrapper.classList.toggle('active');
};

window.sendChatMsg = async function () {
    const input = document.getElementById('chatInputPrimary');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML += `<div class="chat-msg user"><div class="msg-bubble">${msg}</div></div>`;
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // FEATURE 1: Add message to chat history
    _chatHistory.push({ role: 'user', parts: [{ text: msg }] });

    const loadingId = 'loading-' + Date.now();
    messagesDiv.innerHTML += `<div id="${loadingId}" class="chat-msg bot"><div class="msg-bubble"><i class="fa fa-spinner fa-spin"></i> Clinician typing...</div></div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
        // FEATURE 1: Send history array with request for context-aware responses
        const res = await fetch(`${API}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg, history: _chatHistory })
        });
        const data = await res.json();
        document.getElementById(loadingId)?.remove();
        if (res.ok && data.reply) {
            // FEATURE 1: Add bot response to history
            _chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
            messagesDiv.innerHTML += `<div class="chat-msg bot"><div class="msg-bubble">${data.reply.replace(/\n/g, '<br>')}</div></div>`;
        } else {
            messagesDiv.innerHTML += `<div class="chat-msg bot"><div class="msg-bubble">Sorry, I'm offline. Please call +91 8426033033.</div></div>`;
        }
    } catch (e) {
        document.getElementById(loadingId)?.remove();
        messagesDiv.innerHTML += `<div class="chat-msg bot"><div class="msg-bubble">Connection error. Please try again.</div></div>`;
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Handle chat suggestions (Action Buttons)
window.handleChatAction = function(action) {
    let message = "";
    if (action === 'track') message = "How can I track my order?";
    if (action === 'medInfo') message = "Can you give me info about a medicine?";
    if (action === 'presc') message = "How do I upload a prescription?";
    if (action === 'expert') message = "I need to talk to a human expert.";
    
    const input = document.getElementById('chatInputPrimary');
    if (input) {
        input.value = message;
        sendChatMsg();
    }
};

// FEATURE 2: Medicine Reminder / Notification System
window.setMedicineReminder = function(medicineName, time) {
    if ('Notification' in window) {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') {
                // Store reminder in localStorage
                const remindersKey = 'rv_reminders';
                let reminders = JSON.parse(localStorage.getItem(remindersKey) || '[]');
                reminders.push({
                    medicine: medicineName,
                    time: time,
                    id: 'reminder_' + Date.now()
                });
                localStorage.setItem(remindersKey, JSON.stringify(reminders));
                
                // Schedule notification for today
                const now = new Date();
                const [hour, minute] = time.split(':').map(Number);
                const reminderTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);
                const timeUntilReminder = reminderTime.getTime() - now.getTime();
                
                if (timeUntilReminder > 0) {
                    setTimeout(() => {
                        new Notification(`Medicine Reminder: ${medicineName}`, {
                            body: `Time to take ${medicineName}`,
                            icon: '/images/medicine-icon.png'
                        });
                    }, timeUntilReminder);
                }
                
                toast(`Reminder set for ${medicineName} at ${time}`, 'success');
            } else {
                toast('Notification permission denied', 'warning');
            }
        });
    } else {
        toast('Notifications not supported in this browser', 'info');
    }
};

// ── SYMPTOM CHECKER ───────────────────────────────────────────
window.checkSymptoms = async function () {
    const symptoms = document.getElementById('symptomInput')?.value.trim();
    const resultBox = document.getElementById('symptomResult');
    if (!symptoms) return toast('Please describe your symptoms', 'info');
    
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<div class="diag-loading"><i class="fa fa-spinner fa-spin"></i> Analyzing symptoms...</div>';

    try {
        const res = await fetch(`${API}/api/ai/symptom`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms })
        });
        const data = await res.json();
        if (res.ok && data.result) {
            resultBox.innerHTML = `
                <div class="ai-result-header"><i class="fa fa-stethoscope"></i> Clinical Assessment</div>
                <div class="ai-result-body">${data.result.replace(/\n/g, '<br>')}</div>
            `;
        } else {
            throw new Error();
        }
    } catch (e) {
        resultBox.innerHTML = '<div class="ai-result-body">Symptom check unavailable. Call <strong>+91 8426033033</strong> for guidance.</div>';
    }
};

// ── PRESCRIPTION ANALYZER ─────────────────────────────────────
window.analyzePrescription = async function () {
    const text = document.getElementById('prescriptionTextInput')?.value.trim();
    const resultBox = document.getElementById('prescriptionAnalysisResult');
    if (!text) return toast('Please enter your prescription text', 'info');
    
    resultBox.classList.remove('hidden');
    resultBox.innerHTML = '<div class="diag-loading"><i class="fa fa-spinner fa-spin"></i> Analyzing treatment plan...</div>';

    try {
        const res = await fetch(`${API}/api/ai/prescription`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        const data = await res.json();
        if (res.ok && data.result) {
            resultBox.innerHTML = `
                <div class="ai-result-header"><i class="fa fa-file-medical"></i> Treatment Guide</div>
                <div class="ai-result-body">${data.result.replace(/\n/g, '<br>')}</div>
            `;
        } else {
            throw new Error();
        }
    } catch (e) {
        resultBox.innerHTML = '<div class="ai-result-body">Analysis offline. Please upload prescription in the Uploads tab.</div>';
    }
};

// ── AI STATUS CHECK ON LOAD ───────────────────────────────────
async function checkAIStatus() {
    try {
        const res = await fetch(`${API}/api/ai/status`);
        if (res.ok) {
            const data = await res.json();
            console.log(`🤖 Clinical AI: ${data.message} (${data.mode || 'unknown'})`);
            if (!data.available) addNotification('AI is running in smart fallback mode. Add your Gemini API key to .env for full AI.', 'info');
        }
    } catch (e) { }
}

// ── DASHBOARD & TRACKING ENGINE ───────────────────────────────────────────
window.showDashboardOrAuth = function() {
    if (_user) {
        showPage('dashboard');
        updateDashboard();
    } else {
        openAuthModal();
    }
};

function updateDashboard() {
    if (!_user) return;
    const el = (id) => document.getElementById(id);
    if (el('dashName')) el('dashName').textContent = _user.name;
    if (el('dashEmail')) el('dashEmail').textContent = _user.email;
    
    // Simulate some counts
    if (el('dashOrdersCount')) el('dashOrdersCount').textContent = `${_orders.length} Active Sessions`;
    if (el('dashPrescCount')) el('dashPrescCount').textContent = `${_prescriptions.length} Records`;
    if (el('dashWishCount')) el('dashWishCount').textContent = `${_wishlist.length} Items`;
    
    renderRecentActivity();
}

function renderRecentActivity() {
    const list = document.getElementById('dashRecentList');
    if (!list) return;
    const recent = _orders.slice(0, 3);
    if (!recent.length) {
        list.innerHTML = '<p class="empty-text">No recent clinical sessions found.</p>';
        return;
    }
    list.innerHTML = recent.map(o => `
        <div class="activity-item">
            <i class="fa fa-clock-rotate-left"></i>
            <div>
                <strong>Order #${String(o.id).slice(-6).toUpperCase()}</strong>
                <p>${o.status || 'Confirmed'} • ${o.date}</p>
            </div>
            <button onclick="viewTrackingData('${o.id}')">Track</button>
        </div>
    `).join("");
}

window.viewTrackingData = function(id) {
    showPage('orderTracking');
    renderOrderTracking(id);
};

function renderOrderTracking(id) {
    const container = document.getElementById('trackingContainer');
    if (!container) return;
    const order = _orders.find(o => String(o.id) === String(id));
    
    if (!order) {
        container.innerHTML = '<div class="tracking-empty"><i class="fa fa-truck-fade"></i><h3>Order Details Syncing...</h3></div>';
        return;
    }

    const stages = ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = stages.indexOf(order.status || 'Confirmed');
    
    container.innerHTML = `
        <div class="tracking-header">
            <h3>Clinical Logistics: #${String(id).slice(-8).toUpperCase()}</h3>
            <p>Estimated Arrival: <strong>2-3 Business Days</strong></p>
        </div>
        <div class="tracking-steps">
            ${stages.map((s, i) => `
                <div class="track-step ${i <= currentIdx ? 'active' : ''}">
                    <div class="step-dot"></div>
                    <div class="step-label">${s}</div>
                </div>
            `).join("")}
        </div>
        <div class="tracking-footer">
            <p><i class="fa fa-location-dot"></i> Hub: Jaipur Central Clinical Facility</p>
            <p><i class="fa fa-shield-check"></i> Quality Verification: <strong>PASSED</strong></p>
        </div>
    `;
}

// ── LIVE SUGGESTIONS ──────────────────────────────────────────────────────
window.handleLiveSuggest = function(val) {
    const results = document.getElementById('liveSuggest');
    if (!results) return;
    const q = (val || "").toLowerCase().trim();
    
    if (q.length < 2) {
        results.classList.add('hidden');
        return;
    }
    
    const hits = _allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q)
    ).slice(0, 8);
    
    if (!hits.length) {
        results.classList.add('hidden');
        return;
    }
    
    results.classList.remove('hidden');
    results.innerHTML = hits.map(p => `
        <div class="suggest-item" onclick="openModal(${p.id}); document.getElementById('liveSuggest').classList.add('hidden')">
            <img src="${p.image}" alt="${p.name}" onerror="this.src='https://placehold.co/40x40/e0f5f2/0a7c6e?text=${p.name.charAt(0)}'">
            <div class="suggest-info">
                <div class="suggest-name">${p.name}</div>
                <div class="suggest-meta">${p.brand} • ${p.composition.slice(0, 30)}...</div>
            </div>
            <div class="suggest-price">₹${p.price}</div>
        </div>
    `).join("");
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        document.getElementById('liveSuggest')?.classList.add('hidden');
    }
});

window.toggleAIPanel = function() {
    const p = document.getElementById('headerAIPanel');
    if (p) p.classList.toggle('hidden');
};

window.openAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.add('open');
};

window.closeAuthModal = function() {
    const modal = document.getElementById('authModal');
    if (modal) modal.classList.remove('open');
};

window.switchAuthTab = function(type, el) {
    document.querySelectorAll('.a-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form-content').forEach(f => f.classList.remove('active'));
    el.classList.add('active');
    document.getElementById(type + 'Form').classList.add('active');
};


