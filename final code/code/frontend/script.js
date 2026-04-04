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

    // Add to local cart
    cart.push(product);
    updateCartIcon();

    console.log("🛒 Item added to cart:", product.name);

    // Send to backend (optional but correct way)
    fetch(`${API}/api/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(product)
    })
    .then(res => res.json())
    .then(data => {
        console.log("✅ Sent to backend:", data);
    })
    .catch(err => {
        console.error("❌ Cart API error:", err);
    });
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

  let cart = JSON.parse(localStorage.getItem("rv_cart")) || [];

  if (cart.length === 0) {
    container.innerHTML = "<p>Cart is empty</p>";
    totalEl.innerText = "₹0";
    return;
  }

  let total = 0;

  container.innerHTML = cart.map((item, index) => {
    const price = item.price || 0;
    const qty = item.qty || 1;
    total += price * qty;

    return `
      <div class="cart-item">
        <img src="${item.image || 'https://via.placeholder.com/80'}" width="80"/>
        <div>
          <h4>${item.name}</h4>
          <p>₹${price} x ${qty}</p>
          <button onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join("");

  totalEl.innerText = `₹${total}`;
}
window.removeFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem("rv_cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("rv_cart", JSON.stringify(cart));
  renderCart();
};      

window.viewDetails = function(id) {
    fetch(`${API}/api/products/${id}`)
        .then(res => res.json())
        .then(p => {
            const container = document.getElementById("product-detail-view");

            container.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1.2fr; gap:40px; background:#fff; padding:40px; border-radius:20px;">
                    
                    <div style="background:#f8fafc; border-radius:20px; padding:40px; text-align:center;">
                        <img src="${p.image}" style="width:100%; height:100%; object-fit:contain;" />
                    </div>

                    <div>
                        <h1 style="font-size:2.5rem; font-weight:900;">${p.name}</h1>
                        <p style="font-size:1rem; margin-bottom:20px;">${p.composition}</p>

                        <div style="display:flex; gap:15px; margin-bottom:20px;">
                            <span style="font-size:2rem; font-weight:900;">₹${p.price}</span>
                            <span>${p.discount || 0}% OFF</span>
                        </div>

                        <p>${p.description}</p>

                        <button onclick="addToCart('${p.id}')"
                            style="width:100%; padding:15px; background:black; color:white; border:none; border-radius:10px;">
                            Add to Cart
                        </button>
                    </div>

                </div>
            `;
        })
        .catch(err => {
            console.error("❌ Product fetch error:", err);
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
