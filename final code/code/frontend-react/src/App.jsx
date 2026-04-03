import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Search, User, Microscope, Pill, Stethoscope, Menu, X, ArrowLeft, Upload, Trash2, CheckCircle, Package, LogOut, ChevronRight, Filter } from 'lucide-react';
import { products, categories } from './data/products';
import Logo from './components/Logo';

// ══════════════════════════════════════════════════════════════════════════════
// CONTEXT & UTILS
// ══════════════════════════════════════════════════════════════════════════════
const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS (Reusable Section)
// ══════════════════════════════════════════════════════════════════════════════
const Header = () => {
    const { cart } = useAppContext();
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-[1000] bg-white border-b border-slate-100 shadow-soft px-4 md:px-12 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                {/* Logo Component - Responds to clicks and navigates home */}
                <Logo showText={true} />

                <div className="hidden md:flex flex-1 max-w-xl relative group">
                    <input value={keyword} onChange={(e) => setKeyword(e.target.value)} type="text" placeholder="Search medicines, lab tests, salts..." className="w-full bg-slate-50 rounded-full py-3.5 px-6 pl-14 border border-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all outline-none font-medium" />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
                </div>

                <div className="flex items-center gap-4 md:gap-8 shrink-0">
                    <nav className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
                        <Link to="/upload" className="hover:text-primary transition-colors">Upload Rx</Link>
                        <Link to="/orders" className="hover:text-primary transition-colors">Orders</Link>
                    </nav>
                    <button onClick={() => navigate('/cart')} className="relative p-2 text-slate-700 hover:text-primary transition-all">
                        <ShoppingCart className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>
                    </button>
                    <Link to="/account" className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-white transition-all font-bold text-sm">
                        <User className="w-4 h-4 text-primary" />
                        Account
                    </Link>
                </div>
            </div>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-slate-900 text-slate-300 py-16 px-6 md:px-12 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                    <Microscope className="text-primary w-6 h-6" />
                    <h2 className="text-white font-black text-lg uppercase tracking-tight">Rivaansh</h2>
                </div>
                <p className="text-sm leading-relaxed mb-6 opacity-70">WHO-GMP clinically tested formulations from Jaipur hub to your doorstep. Trusted since 2012.</p>
                <div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-slate-800" /><div className="w-8 h-8 rounded-full bg-slate-800" /></div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm">Experience App</h4>
                <div className="space-y-4 text-sm opacity-70">
                    <p>About Us</p><p>Careers</p><p>Press</p><p>Contact</p>
                </div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm">Policies</h4>
                <div className="space-y-4 text-sm opacity-70">
                    <p>Privacy Policy</p><p>Returns</p><p>Shipping</p><p>Terms</p>
                </div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm">Connect</h4>
                <div className="space-y-4 text-sm opacity-70">
                    <p>WhatsApp: +91 911</p><p>Email Care</p><p>Instagram</p>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 py-8 text-center text-xs opacity-50 font-bold uppercase tracking-widest text-white">© 2026 Rivaansh Lifesciences Pharmaceuticals</div>
    </footer>
);

// ══════════════════════════════════════════════════════════════════════════════
// 7 PAGES (Simplified Core Content)
// ══════════════════════════════════════════════════════════════════════════════
const HomePage = () => (
    <section>
        <div className="hero bg-primary p-12 md:p-24 text-white text-center rounded-b-[3rem] relative overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">Digital Healthcare <br/> Delivered Daily.</h1>
                <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10">Authentic medicines, laboratory diagnostics and specialist consultations now just a tap away.</p>
                <Link to="/products" className="inline-block bg-white text-primary px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all">Shop Medicines</Link>
            </div>
        </div>
        <div className="py-20 px-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-10 text-center uppercase tracking-widest">Our Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((c, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-soft hover:shadow-premium hover:-translate-y-2 transition-all text-center cursor-pointer group">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/10"><Stethoscope className="text-primary" /></div>
                        <span className="font-bold text-slate-700">{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ProductsPage = () => {
    const { dbProducts, loading, keyword, setKeyword, addToCart } = useAppContext();
    return (
        <section className="py-12 px-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-12">
                {/* Sidebar Filter (Task 6) */}
                <aside className="hidden md:block w-64 space-y-8 shrink-0">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft">
                        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2 underline decoration-primary decoration-2 underline-offset-4">CATEGORIES</h3>
                        <div className="space-y-4 text-sm font-semibold text-slate-500">
                             {['All Medicines', 'Fever & Cold', 'Pain Relief', 'Nutritional', 'Baby Care'].map((c, i) => (
                                 <div key={i} className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                                     <div className="w-1 h-4 bg-slate-100 rounded-full" /> {c}
                                 </div>
                             ))}
                        </div>
                    </div>
                </aside>

                <div className="flex-1 space-y-10">
                    {/* Task 5: SEARCH BOX UI */}
                    <div className="md:hidden relative group">
                        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} type="text" placeholder="Search medicines..." className="w-full bg-white rounded-2xl py-4 px-6 pl-14 shadow-soft border border-slate-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 flex items-center justify-between">
                        Store <span>Catalogue</span> 
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dbProducts.length} MEDICINES</span>
                    </h2>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="skeleton h-80" /><div className="skeleton h-80" /><div className="skeleton h-80" />
                        </div>
                    ) : dbProducts.length === 0 ? (
                        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <div className="text-6xl mb-6">🏜️</div>
                            <p className="text-slate-300 font-black text-lg uppercase tracking-tight">No medicines found matching "{keyword}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {dbProducts.map((p) => (
                                <div key={p._id} className="bg-white rounded-[2.5rem] p-6 shadow-soft border border-slate-100 flex flex-col group hover:shadow-premium transition-all duration-300">
                                    <Link to={`/product/${p._id}`} className="aspect-square mb-6 overflow-hidden rounded-3xl bg-slate-50 flex items-center justify-center p-8">
                                        <img src={p.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                                    </Link>
                                    <div className="space-y-1 mb-6 flex-1 px-2">
                                        <div className="text-[10px] font-black text-primary/60 tracking-[0.2em] uppercase">{p.category}</div>
                                        <Link to={`/product/${p._id}`} className="block text-lg font-extrabold text-slate-900 leading-tight hover:text-primary transition-colors">{p.name}</Link>
                                        <p className="text-xs text-slate-400 font-bold tracking-tight">{p.brand} | {p.composition}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 px-2 mt-auto">
                                        <div>
                                            <div className="text-sm text-slate-300 line-through font-bold">₹{p.price + (p.discount || 20)}</div>
                                            <div className="text-2xl font-black text-slate-900 leading-none">₹{p.price}</div>
                                        </div>
                                        <button onClick={() => addToCart(p)} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all">ADD</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const product = products.find(p => p.id === parseInt(id));
    const { addToCart } = useAppContext();
    if (!product) return <div className="py-24 text-center font-bold">Product not found.</div>;
    return (
        <section className="py-12 md:py-24 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-soft sticky top-32"><img src={product.image} className="w-full h-auto object-contain" /></div>
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="bg-secondary/10 text-secondary-dark px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{product.category}</span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">{product.name}</h1>
                        <p className="text-lg text-slate-400 font-bold">{product.brand} | Quality Guaranteed</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-sm text-slate-500 mb-2 uppercase tracking-widest font-black">Composition</p><p className="text-xl font-bold text-slate-700">{product.composition}</p></div>
                    <div className="flex items-end gap-4"><div className="text-4xl font-black text-slate-800">₹{product.price}</div><div className="text-xl text-slate-300 line-through mb-1">₹{product.originalPrice}</div><div className="text-success font-black mb-1">{product.discount}</div></div>
                    <button onClick={() => addToCart(product)} className="w-full bg-primary text-white py-6 rounded-3xl text-xl font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">ADD TO CART FOR ₹{product.price}</button>
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                        <div className="space-y-2"><h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Key Benefits</h4><p className="text-slate-500 leading-relaxed font-semibold">{product.description}</p></div>
                        <div className="space-y-2"><h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Uses</h4><p className="text-slate-500 leading-relaxed font-semibold">{product.uses}</p></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const UploadPage = () => (
    <section className="py-24 px-4 bg-slate-50 min-h-[90vh]">
        <div className="max-w-2xl mx-auto bg-white p-12 md:p-20 rounded-[3rem] shadow-premium border border-slate-100 text-center">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8"><Upload className="text-primary w-10 h-10" /></div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">Upload Your <span>Prescription</span></h2>
            <p className="text-slate-500 font-semibold mb-10 leading-relaxed">Simply capture a clear photo of your doctor's prescriptions and our pharmacists will help fulfill your order.</p>
            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-primary/20 transition-colors cursor-pointer mb-10">
                <div className="text-slate-400 font-black uppercase text-xs tracking-widest">Drag & Drop Documents Here</div>
            </div>
            <button className="w-full bg-primary text-white py-6 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all uppercase tracking-widest">Submit Prescription</button>
        </div>
    </section>
);

const CartPage = () => {
    const { cart, removeFromCart } = useAppContext();
    const total = cart.reduce((sum, i) => sum + i.price, 0);
    return (
        <section className="py-12 md:py-24 px-4 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-slate-800 mb-12 flex items-center justify-between">My Shopping Cart <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{cart.length} Items</span></h1>
            {cart.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100"><p className="text-slate-300 font-black text-lg uppercase">Your cart is empty.</p><Link to="/products" className="text-primary font-bold mt-4 inline-block hover:underline">Continue Browsing</Link></div>
            ) : (
                <div className="space-y-6">
                    {cart.map((item, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft flex items-center gap-8 group">
                            <img src={item.image} className="w-20 h-20 object-contain p-2 bg-slate-50 rounded-2xl shrink-0" />
                            <div className="flex-1"><h4 className="font-bold text-slate-800 text-lg leading-tight">{item.name}</h4><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.brand}</p></div>
                            <div className="text-xl font-black text-slate-800">₹{item.price}</div>
                            <button onClick={() => removeFromCart(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-6 h-6" /></button>
                        </div>
                    ))}
                    <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] mt-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div><p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Total Amount Payable</p><div className="text-4xl font-black">₹{total}</div></div>
                        <button className="bg-primary hover:bg-primary-dark text-white px-12 py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20">PROCEED TO CHECKOUT</button>
                    </div>
                </div>
            )}
        </section>
    );
};

const OrdersPage = () => (
    <section className="py-24 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-12">My Store <span>History</span></h1>
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-soft text-center"><Package className="w-16 h-16 text-slate-200 mx-auto mb-6" /><p className="text-slate-300 font-black text-lg uppercase">No completed orders found.</p></div>
    </section>
);

const AccountPage = () => (
    <section className="py-24 px-4 max-w-4xl mx-auto">
        <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-premium border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-primary/5" />
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-full border-8 border-white p-1 shadow-premium mb-6 overflow-hidden"><User className="w-full h-full text-slate-100" /></div>
                <h2 className="text-3xl font-black text-slate-800 mb-2 uppercase tracking-tight">Rivaansh Lifesciences User</h2>
                <p className="text-slate-400 font-bold mb-10">care@rivaansh.com | Jaipur, India</p>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6"><div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Security Settings</h4><button className="text-primary font-bold hover:underline">Change Account Password</button></div><div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Logout Access</h4><button className="text-red-500 font-bold hover:underline">Sign out of Rivaansh</button></div></div>
            </div>
        </div>
    </section>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
    const [cart, setCart] = useState([]);
    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState("");
    
    useEffect(() => {
        const saved = localStorage.getItem('riva_cart');
        if (saved) setCart(JSON.parse(saved));
    }, []);

    // Task 5: SEARCH-CONNECTED FETCH
    useEffect(() => {
        async function loadStore() {
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:5000/api/products?keyword=${keyword}`);
                const data = await res.json();
                setDbProducts(data);
                setLoading(false);
            } catch (err) {
                console.error("API Conn Error:", err);
                setLoading(false);
            }
        }
        loadStore();
    }, [keyword]); // Refetch when keyword changes

    useEffect(() => {
        localStorage.setItem('riva_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => [...prev, product]);
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <AppContext.Provider value={{ cart, dbProducts, loading, keyword, setKeyword, addToCart, removeFromCart }}>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen bg-slate-50 antialiased font-inter">
                    <Header />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products" element={<ProductsPage />} />
                            <Route path="/product/:id" element={<ProductDetailPage />} />
                            <Route path="/upload" element={<UploadPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/account" element={<AccountPage />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}
