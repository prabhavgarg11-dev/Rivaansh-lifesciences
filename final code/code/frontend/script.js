/**
 * script.js — Tata 1mg Premium Healthcare Engine
 * Features: Debounced Live-Search, Clinical Cart & SPA Page Switching
 */

let allProducts = [];
let cart = [];
let debounceTimeout;

document.addEventListener("DOMContentLoaded", () => {
    console.log("Rivaansh Health App (1mg Engine) Ready. ✅");
    showPage("home");
    fetchInventory();

    // 🔎 1. DEBOUNCED LIVE SEARCH (Step search & debounce)
    const searchInput = document.getElementById("liveSearch");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase();
                const dropdown = document.getElementById("search-dropdown");

                if (query.length < 2) {
                    dropdown.style.display = "none";
                    return;
                }

                const filtered = allProducts.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.composition.toLowerCase().includes(query)
                );

                renderSearchDropdown(filtered);
            }, 300); // 300ms debounce
        });
    }

    // Hide search dropdown on click outside
    document.addEventListener("click", (e) => {
        const dropdown = document.getElementById("search-dropdown");
        if (!e.target.closest(".search-hub")) dropdown.style.display = "none";
    });
});

// 🚀 FETCH INVENTORY (Step fetch)
async function fetchInventory() {
  try {
    console.log("🚀 Fetching from LIVE API...");

    const API = "https://rivaansh-lifesciences.onrender.com";

    const res = await fetch(`${API}/api/products`);

    if (!res.ok) {
      throw new Error("Backend Unreachable");
    }

    const allProducts = await res.json();

    renderProducts(allProducts.slice(0, 8), "trending-grid");
    renderProducts(allProducts, "catalog-grid");

    console.log(`📦 DATA LOADED: ${allProducts.length} Items ✅`);

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);
  }
}

// 📦 2. PRODUCT RENDER LOGIC (Step 🛒)
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    products.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";

        // Calculate original price vs discount
        const originalPrice = (p.price / (1 - p.discount / 100)).toFixed(0);

        card.innerHTML = `
            ${p.discount > 10 ? `<span style="position:absolute;top:10px;left:10px;background:var(--su);color:#fff;font-weight:900;font-size:10px;padding:2px 8px;border-radius:4px;">${p.discount}% OFF</span>` : ""}
            <div onclick="viewDetails(${p.id})">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/200?text=Healthcare'" />
            </div>
            <h4 onclick="viewDetails(${p.id})" style="cursor:pointer;">${p.name}</h4>
            <div class="composition">${p.composition}</div>
            <div class="rating">
                <i class="fa-solid fa-star"></i> ${p.rating} | Healthcare Points
            </div>
            <div class="price-row">
                <div class="price">₹${p.price.toFixed(2)}</div>
                <div style="font-size:12px; color:#888; text-decoration:line-through;">₹${originalPrice}</div>
                <div class="discount">${p.discount}% off</div>
            </div>
            <button class="add-btn" onclick="addToCart(${p.id})">ADD TO CART</button>
        `;

        container.appendChild(card);
    });
}

// 📦 3. LIVE SEARCH DROPDOWN RENDER
function renderSearchDropdown(results) {
    const dropdown = document.getElementById("search-dropdown");
    if (!dropdown) return;

    dropdown.innerHTML = "";

    if (results.length === 0) {
        dropdown.innerHTML = "<div class='search-item'>No formulations found.</div>";
    } else {
        results.slice(0, 5).forEach(p => {
            const item = document.createElement("div");
            item.className = "search-item";
            item.innerHTML = `
                <img src="${p.image}" />
                <div>
                    <p style="font-weight:700; font-size:13px;">${p.name}</p>
                    <p style="font-size:11px; color:#888;">${p.composition}</p>
                </div>
            `;
            item.onclick = () => {
                viewDetails(p.id);
                dropdown.style.display = "none";
            };
            dropdown.appendChild(item);
        });
    }

    dropdown.style.display = "block";
}

// 📦 4. CART LOGIC (Step cart)
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    cart.push(product);
    updateCartIcon();
    
    // Post to Server (Step POST /api/cart)
    fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });

    console.log("🛒 Item added to clinical cart🚑", product.name);
}

function updateCartIcon() {
    const countEl = document.getElementById("cart-count");
    if (countEl) countEl.innerText = cart.length;
}

// 📦 5. SPA NAVIGATION SWITCHER
function showPage(pageId) {
    console.log("Navigating to Hub Page:", pageId);
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    const target = document.getElementById(pageId + "Page");
    if (target) {
        target.classList.add("active");
        if (pageId === "cart") renderCart();
    }
    window.scrollTo(0, 0);
}

// CART RENDER
function renderCart() {
    const container = document.getElementById("cart-items");
    const totalEl = document.getElementById("grand-total");
    if (!container) return;

    container.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement("div");
        div.style = "display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #eee; background:#fff; border-radius:12px; margin-bottom:10px;";
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
                <img src="${item.image}" style="width:50px; height:50px; object-fit:contain;" />
                <div>
                    <h5 style="font-weight:800;">${item.name}</h5>
                    <p style="color:#10B981; font-weight:900;">₹${item.price.toFixed(2)}</p>
                </div>
            </div>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(div);
    });

    totalEl.innerText = total.toFixed(2);
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartIcon();
    renderCart();
};

window.viewDetails = function(id) {
    fetch(`http://localhost:5000/api/products/${id}`)
        .then(res => res.json())
        .then(p => {
            const container = document.getElementById("product-detail-view");
            container.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:40px; background:#fff; padding:40px; border-radius:20px; box-shadow:var(--sh);">
                    <div style="background:#f8fafc; border-radius:20px; padding:40px; text-align:center;">
                        <img src="${p.image}" style="width:100%; height:100%; object-fit:contain;" />
                    </div>
                    <div>
                        <h5 style="color:var(--su); font-weight:900; margin-bottom:5px;">Certified Healthcare Formulation</h5>
                        <h1 style="font-size:2.5rem; font-weight:900;">${p.name}</h1>
                        <p style="font-size:1.1rem; color:#666; margin-bottom:20px;">${p.composition}</p>
                        <div style="display:flex; align-items:center; gap:15px; margin-bottom:30px;">
                            <span style="font-size:2.5rem; font-weight:900; color:var(--txt);">₹${p.price.toFixed(2)}</span>
                            <span style="color:var(--su); font-weight:800;">${p.discount}% OFF</span>
                        </div>
                        <h4 style="font-weight:900; margin-bottom:10px;">Product Highlights</h4>
                        <p style="color:#555; line-height:1.6; margin-bottom:40px;">${p.description}</p>
                        <button onclick="addToCart(${p.id})" style="width:100%; padding:20px; background:var(--pr); color:#fff; border:none; border-radius:50px; font-weight:900; font-size:1.1rem; cursor:pointer;">Order Now🚑</button>
                    </div>
                </div>
            `;
            showPage('details');
        });
};

// Global for HTML
window.showPage = showPage;
window.addToCart = addToCart;
window.filterType = (type) => {
    const filtered = allProducts.filter(p => p.category === type);
    renderProducts(filtered, "catalog-grid");
    showPage('products');
};
