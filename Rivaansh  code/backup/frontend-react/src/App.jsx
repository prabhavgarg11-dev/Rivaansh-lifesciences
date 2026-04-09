import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Search, User, Microscope, Pill, Stethoscope, 
  Menu, X, ArrowLeft, Upload, Trash2, CheckCircle, Package, 
  ChevronRight, Filter, Star, Heart, Plus, 
  MessageSquare, Send, Zap, ShieldCheck, CreditCard, 
  Globe, Phone, Sparkles, ArrowRight, Layers, Clock
} from 'lucide-react';
import { products, categories } from './data/products';

// ══════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS & UTILS
// ══════════════════════════════════════════════════════════════════════════════
const AppContext = createContext();
const useAppContext = () => useContext(AppContext);

const animations = {
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slideUp: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 20, opacity: 0 } },
  scaleUp: { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 } },
  hoverScale: { whileHover: { scale: 1.02, y: -5 }, whileTap: { scale: 0.98 } }
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS - REUSABLE UI
// ══════════════════════════════════════════════════════════════════════════════

const Navbar = () => {
    const { cart, keyword, setKeyword, openAuth, user } = useAppContext();
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`glass-nav transition-all duration-500 ${scrolled ? 'py-4 shadow-xl shadow-slate-900/5' : 'py-6 px-4'}`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative">
                        <div className="absolute -inset-2 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all rounded-full" />
                        <motion.div 
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 8 }}
                          className="relative w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
                        >
                            <Stethoscope className="text-white w-6 h-6" strokeWidth={2.5} />
                        </motion.div>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-xl font-display font-bold text-slate-900 tracking-tight leading-none">Rivaansh</h1>
                        <span className="text-[10px] font-black text-secondary tracking-widest uppercase">L I F E S C I E N C E S</span>
                    </div>
                </Link>

                {/* Search Bar - Premium Glassmorphic */}
                <div className="hidden lg:flex flex-1 max-w-2xl relative group">
                    <input 
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      type="text" 
                      placeholder="Search for medicines, lab tests, specialists..." 
                      className="w-full bg-slate-100/50 rounded-2xl py-3 px-14 border border-slate-200 outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary transition-all font-medium text-slate-700"
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <span className="hidden sm:block text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-1 rounded-md">CMD + K</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600 mr-4">
                        <Link to="/products" className="hover:text-primary transition-colors">Pharmacy</Link>
                        <Link to="/upload" className="hover:text-primary transition-colors">Diagnostics</Link>
                        <Link to="/account" className="hover:text-primary transition-colors">Consult</Link>
                    </div>

                    <button onClick={() => navigate('/cart')} className="relative p-2.5 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                        <ShoppingCart className="w-5 h-5" />
                        <AnimatePresence>
                            {cart.length > 0 && (
                                <motion.span 
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg"
                                >
                                    {cart.length}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>

                    <button 
                      onClick={openAuth}
                      className="flex items-center gap-2.5 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 active:scale-95 transition-all font-bold text-sm shadow-xl shadow-slate-900/10"
                    >
                        {user ? <CheckCircle className="w-4 h-4 text-secondary" /> : <User className="w-4 h-4" />}
                        {user ? 'Profile' : 'Sign In'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

const ProductCard = ({ product }) => {
    const { addToCart } = useAppContext();
    const navigate = useNavigate();

    return (
        <motion.div 
          {...animations.hoverScale}
          className="group glass-card rounded-3xl p-5 flex flex-col h-full cursor-pointer relative overflow-hidden"
        >
            {/* Badge */}
            {product.discount && (
                <div className="absolute top-4 left-4 z-10 bg-secondary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-secondary/20">
                    {product.discount}
                </div>
            )}
            
            <button className="absolute top-4 right-4 z-10 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
                <Heart className="w-4 h-4" />
            </button>

            {/* Image Section */}
            <div 
              onClick={() => navigate(`/product/${product.id}`)}
              className="aspect-square bg-slate-50/50 rounded-2xl flex items-center justify-center p-6 mb-5 group-hover:scale-105 transition-transform duration-700 overflow-hidden"
            >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  onError={(e) => e.target.src = 'https://placehold.co/400x400/e0f5f2/0a7c6e?text=Rivaansh'}
                />
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-1 mb-6">
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex text-accent gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= 4 ? 'fill-current' : 'text-slate-200'}`} />)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">(42)</span>
                </div>
                <h3 className="font-bold text-slate-800 leading-tight group-hover:text-primary transition-colors text-lg line-clamp-2 uppercase tracking-tight">{product.name}</h3>
                <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                   <Globe className="w-3 h-3" /> {product.brand || 'Rivaansh Global'}
                </p>
                <div className="text-[10px] font-black text-secondary tracking-widest uppercase py-1">{product.category}</div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div>
                     <span className="text-[10px] font-black text-slate-300 line-through">₹{product.originalPrice || product.price + 50}</span>
                     <div className="text-xl font-black text-slate-900 tracking-tight">₹{product.price}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 text-white hover:bg-slate-900 transition-all active:scale-90"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
};

const SkeletonLoader = () => (
    <div className="glass-card rounded-3xl p-5 space-y-4 animate-pulse">
        <div className="aspect-square bg-slate-200 rounded-2xl" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between items-center pt-4">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded-xl w-10" />
        </div>
    </div>
);

const AuthModal = ({ isOpen, onClose }) => {
    const [tab, setTab] = useState('login');
    const { login } = useAppContext();

    if (!isOpen) return null;

    return (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div 
              {...animations.scaleUp}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
                <div className="absolute top-6 right-6">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                
                <div className="p-10 pt-16">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="text-primary w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Access Health Panel</h2>
                        <p className="text-slate-500 font-medium">Join 50k+ users for secure clinical care.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
                            <button onClick={() => setTab('login')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'login' ? 'bg-white shadow-xl shadow-slate-900/5 text-primary' : 'text-slate-500'}`}>Sign In</button>
                            <button onClick={() => setTab('signup')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'signup' ? 'bg-white shadow-xl shadow-slate-900/5 text-primary' : 'text-slate-500'}`}>Create Account</button>
                        </div>
                        
                        <input type="email" placeholder="Email Address" className="w-full bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 outline-none focus:border-primary transition-all" />
                        <input type="password" placeholder="Password" className="w-full bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 outline-none focus:border-primary transition-all" />
                        
                        <button 
                          onClick={() => { login({ name: 'Rivaansh User', email: 'care@rivaansh.com' }); onClose(); }}
                          className="w-full bg-primary text-white py-5 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-slate-900 transition-all uppercase tracking-widest text-sm"
                        >
                            {tab === 'login' ? 'Enter Dashboard' : 'Join Community'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AIChatbot = () => {
    const [open, setOpen] = useState(false);
    const [msgs, setMsgs] = useState([{ type: 'bot', text: "Hello! I'm your Rivaansh Health Assistant. How can I help you today?" }]);
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [msgs]);

    return (
        <div className="fixed bottom-8 right-8 z-[500]">
            <AnimatePresence>
                {open && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, y: 50, x: 50 }}
                      animate={{ scale: 1, opacity: 1, y: 0, x: 0 }}
                      exit={{ scale: 0, opacity: 0, y: 50, x: 50 }}
                      className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
                    >
                        <div className="bg-gradient-to-r from-primary to-secondary p-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <Sparkles className="w-6 h-6" />
                                <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
                            </div>
                            <h3 className="text-xl font-bold font-display leading-none">Rivaansh AI</h3>
                            <p className="text-xs opacity-80 mt-1 font-semibold italic text-slate-100">Clinical Support Assistant</p>
                        </div>
                        <div ref={scrollRef} className="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-50">
                            {msgs.map((m, i) => (
                                <motion.div 
                                  initial={{ opacity: 0, x: m.type === 'bot' ? -10 : 10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  key={i} 
                                  className={`flex ${m.type === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-semibold leading-relaxed shadow-sm ${m.type === 'bot' ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-primary text-white rounded-tr-none'}`}>
                                        {m.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
                             <input 
                               placeholder="Ask about meds, dosage, symptoms..." 
                               className="flex-1 bg-slate-100 px-5 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium" 
                               onKeyDown={(e) => {
                                 if (e.key === 'Enter') {
                                    setMsgs([...msgs, { type: 'user', text: e.target.value }]);
                                    e.target.value = '';
                                    setTimeout(() => setMsgs(prev => [...prev, { type: 'bot', text: "That's a great question. Please consult our specialist or check the clinical guide for precise info." }]), 600);
                                 }
                               }}
                             />
                             <button className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"><Send className="w-5 h-5" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(!open)}
              className="w-16 h-16 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <AnimatePresence mode='wait'>
                    {open ? <X className="relative z-10 w-8 h-8" /> : <MessageSquare className="relative z-10 w-8 h-8" />}
                </AnimatePresence>
                {!open && <span className="absolute top-2 right-2 w-3 h-3 bg-secondary border-2 border-slate-900 rounded-full animate-pulse" />}
            </motion.button>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════════
// 7 PAGES - PRECISE & BEAUTIFUL
// ══════════════════════════════════════════════════════════════════════════════

const HomePage = () => {
    const navigate = useNavigate();
    return (
        <motion.div {...animations.fadeIn}>
            {/* Hero Section */}
            <header className="relative pt-12 pb-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <motion.div 
                      initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                      className="relative z-10 space-y-10"
                    >
                        <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-xl border border-white p-2 pr-6 rounded-full shadow-xl shadow-slate-900/5">
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">NEW</span>
                            <span className="text-xs font-bold text-slate-500">Free doctor consultation with every laboratory test</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-[1.1] tracking-tight">Your Digital <br/> <span className="text-gradient">Pharmacy</span> <br/> Redefined.</h2>
                        <p className="text-xl text-slate-400 font-semibold leading-relaxed max-w-lg">Clinically tested pharmaceutical formulations delivered from our hub to your doorstep with licensed pharmacist review.</p>
                        <div className="flex flex-wrap gap-4">
                            <button onClick={() => navigate('/products')} className="btn-premium bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 flex items-center gap-3">
                                Get Started <ChevronRight className="w-5 h-5" />
                            </button>
                            <button className="bg-white text-slate-600 px-10 py-5 rounded-2xl font-bold text-lg border border-slate-100 hover:bg-slate-50 transition-all flex items-center gap-3 shadow-lg shadow-slate-900/5">
                                <Zap className="text-accent w-5 h-5" /> Fast Delivery
                            </button>
                        </div>
                        <div className="flex items-center gap-6 pt-6 grayscale opacity-40">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e8/FDA_logo.svg" className="h-6" alt="FDA"/>
                             <img src="https://upload.wikimedia.org/wikipedia/commons/e/ec/WHO_logo.svg" className="h-8" alt="WHO"/>
                             <div className="text-[10px] font-black tracking-widest text-slate-900">CERTIFIED CARE</div>
                        </div>
                    </motion.div>

                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="relative hidden lg:block"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
                        <div className="animate-float relative">
                            <img 
                              src="https://images.unsplash.com/photo-1576091160550-2173dad99901?q=80&w=2070&auto=format&fit=crop" 
                              className="w-full aspect-[4/5] object-cover rounded-[4rem] shadow-2xl border-8 border-white"
                              alt="Health Professional"
                            />
                            <div className="absolute -bottom-8 -left-8 glass-card p-6 rounded-3xl flex items-center gap-4 animate-float sm-delay-100">
                                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center"><CheckCircle className="text-secondary w-6 h-6" /></div>
                                <div><p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Verified</p><p className="text-lg font-black text-slate-800">Doctor Prescribed</p></div>
                            </div>
                            <div className="absolute -top-12 -right-8 glass-card p-6 rounded-3xl flex flex-col gap-2 animate-float sm-delay-200">
                                <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Ratings</p>
                                <div className="flex items-center gap-2">
                                     <div className="flex text-accent gap-0.5"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div>
                                     <span className="font-black text-slate-900">4.9/5</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Features St Strip */}
            <div className="bg-slate-900 py-16">
                 <div className="max-w-7xl mx-auto px-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                           <div className="text-center space-y-2">
                                <ShieldCheck className="w-10 h-10 text-secondary mx-auto mb-4" />
                                <h4 className="text-white font-bold text-lg">100% Genuine</h4>
                                <p className="text-slate-400 text-xs font-semibold">Verified Source Supply</p>
                           </div>
                           <div className="text-center space-y-2">
                                <Clock className="w-10 h-10 text-secondary mx-auto mb-4" />
                                <h4 className="text-white font-bold text-lg">Express Delivery</h4>
                                <p className="text-slate-400 text-xs font-semibold">Under 4 Hours in City</p>
                           </div>
                           <div className="text-center space-y-2">
                                <CreditCard className="w-10 h-10 text-secondary mx-auto mb-4" />
                                <h4 className="text-white font-bold text-lg">Digital Payment</h4>
                                <p className="text-slate-400 text-xs font-semibold">Secure Encryption</p>
                           </div>
                           <div className="text-center space-y-2">
                                <User className="w-10 h-10 text-secondary mx-auto mb-4" />
                                <h4 className="text-white font-bold text-lg">Expert Care</h4>
                                <p className="text-slate-400 text-xs font-semibold">24/7 Pharmacist Help</p>
                           </div>
                      </div>
                 </div>
            </div>

            {/* Categories */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-end justify-between mb-16">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Categories</h5>
                            <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 uppercase tracking-tight">Explore Specialist Labs</h2>
                        </div>
                        <button className="hidden sm:flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">See Detailed Index <ArrowRight className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map((c, i) => (
                            <motion.div 
                              key={i} {...animations.hoverScale}
                              onClick={() => navigate('/products')}
                              className="group glass-card p-10 rounded-[2.5rem] text-center space-y-6 hover:bg-slate-900 transition-all duration-500"
                            >
                                <div className="w-20 h-20 bg-slate-50/50 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-primary transition-all">
                                    {c.icon === 'Pill' ? <Pill className="group-hover:text-white" /> : 
                                     c.icon === 'Stethoscope' ? <Stethoscope className="group-hover:text-white" /> : 
                                     c.icon === 'Microscope' ? <Microscope className="group-hover:text-white" /> : <User className="group-hover:text-white" />}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 group-hover:text-white transition-all uppercase tracking-tight">{c.name}</h4>
                                <p className="text-xs font-semibold text-slate-400 group-hover:text-slate-500 transition-all">200+ Products Tracked</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </motion.div>
    );
};

const ProductsPage = () => {
    const { dbProducts, loading, setKeyword } = useAppContext();
    const [sort, setSort] = useState('newest');
    const [category, setCategory] = useState('All');

    return (
        <motion.section {...animations.fadeIn} className="py-12 px-4 max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Pharmacy Store</h5>
                    <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 uppercase tracking-tighter shrink-0">Premium Medicine <span className="text-slate-300">Hub</span></h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl">
                         {['All', 'Essential', 'Nutritional', 'Wellness'].map(c => (
                             <button 
                               key={c}
                               onClick={() => setCategory(c)}
                               className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${category === c ? 'bg-white text-primary shadow-xl shadow-slate-900/5' : 'text-slate-400 hover:text-slate-600'}`}
                             >
                                 {c}
                             </button>
                         ))}
                    </div>
                    <select 
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="bg-white border border-slate-200 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm outline-none cursor-pointer"
                    >
                        <option value="newest">Sort By: Newest</option>
                        <option value="low">Price: Low to High</option>
                        <option value="high">Price: High to Low</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Advanced Filter Sidebar */}
                <aside className="w-full lg:w-72 space-y-8 shrink-0">
                    <div className="glass-card p-8 rounded-[2.5rem]">
                        <h3 className="font-black text-slate-900 mb-8 flex items-center justify-between text-sm uppercase tracking-widest">
                            Refine Supply <Filter className="w-4 h-4 text-primary" />
                        </h3>
                        <div className="space-y-8">
                             <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pricing Spectrum</p>
                                 <input type="range" className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary" />
                                 <div className="flex justify-between mt-2 text-[10px] font-black text-slate-900 font-mono"><span>₹49</span><span>₹9,999</span></div>
                             </div>
                             <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Availability</p>
                                 <div className="space-y-3">
                                      <label className="flex items-center gap-3 cursor-pointer group">
                                           <div className="w-5 h-5 border-2 border-slate-200 rounded-md group-hover:border-primary transition-all flex items-center justify-center"><CheckCircle className="w-3 h-3 text-transparent group-hover:text-primary" /></div>
                                           <span className="text-sm font-bold text-slate-600">In Stock Now</span>
                                      </label>
                                      <label className="flex items-center gap-3 cursor-pointer group">
                                           <div className="w-5 h-5 border-2 border-slate-200 rounded-md group-hover:border-primary transition-all flex items-center justify-center"><CheckCircle className="w-3 h-3 text-transparent group-hover:text-primary" /></div>
                                           <span className="text-sm font-bold text-slate-600 text-opacity-50">Requires Rx</span>
                                      </label>
                                 </div>
                             </div>
                             <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Trusted Brands</p>
                                 <div className="flex flex-wrap gap-2">
                                      {['Rivaansh', 'GSK', 'Pfizer', 'Dabur'].map(b => <span key={b} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 hover:border-primary cursor-pointer transition-all">{b}</span>)}
                                 </div>
                             </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            <SkeletonLoader /><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /><SkeletonLoader /><SkeletonLoader />
                        </div>
                    ) : dbProducts.filter(p => category === 'All' || p.category.includes(category)).length === 0 ? (
                        <div className="py-40 text-center glass-card rounded-[3.5rem] border-2 border-dashed">
                             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6"><Layers className="text-slate-200" /></div>
                             <p className="text-slate-300 font-black text-xl uppercase tracking-tighter leading-tight">No therapeutic matches <br/> found for your criteria</p>
                             <button onClick={() => { setKeyword(''); setCategory('All'); }} className="mt-8 text-primary font-bold underline decoration-primary/20 hover:decoration-primary transition-all">Clear All Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {dbProducts.filter(p => category === 'All' || p.category.includes(category)).map((p) => (
                                <ProductCard key={p._id || p.id} product={p} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.section>
    );
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const { dbProducts, addToCart } = useAppContext();
    const product = dbProducts?.find(p => p._id === id || p.id == id);
    
    if (!product) return (
        <div className="py-40 text-center space-y-6">
            <h2 className="text-4xl font-black text-slate-900 uppercase">Product Not Located</h2>
            <Link to="/products" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold">Return to Store</Link>
        </div>
    );

    return (
        <motion.section {...animations.fadeIn} className="py-12 md:py-24 px-4 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                <div className="sticky top-32 space-y-8">
                     <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 font-bold text-xs uppercase hover:text-primary transition-all"><ArrowLeft className="w-4 h-4"/> Back to Catalogue</Link>
                     <div className="glass-card p-12 md:p-20 rounded-[4rem] group overflow-hidden">
                          <motion.img 
                            layoutId={`img-${product.id}`}
                            src={product.image} 
                            className="w-full h-auto object-contain filter drop-shadow-2xl translate-y-4 group-hover:scale-110 transition-transform duration-700" 
                          />
                     </div>
                </div>

                <div className="space-y-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <span className="bg-secondary/10 text-secondary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">{product.category}</span>
                             <span className="bg-accent/10 text-accent text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-1"><Zap className="w-3 h-3 fill-current"/> Fastest Seller</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-[1.1] uppercase tracking-tight">{product.name}</h1>
                        <p className="text-xl text-slate-400 font-semibold">{product.brand} • Pharma Verified Quality</p>
                        <div className="flex items-center gap-2 py-4">
                             <div className="flex text-accent gap-1"><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="w-5 h-5"/></div>
                             <span className="font-bold text-slate-900 border-l border-slate-200 pl-4 ml-2">4.5 Clinical Rating (89 Reviews)</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                         <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest font-black">Composition</p><p className="text-xl font-bold text-slate-700 uppercase tracking-tight">{product.composition}</p></div>
                         <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 mb-2 uppercase tracking-widest font-black">Storage</p><p className="text-xl font-bold text-slate-700 uppercase tracking-tight">Below 25°C</p></div>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck className="w-32 h-32 text-primary" /></div>
                         <div className="flex items-end gap-6 relative z-10">
                              <div className="text-5xl font-black text-slate-900">₹{product.price}</div>
                              <div className="text-2xl text-slate-300 line-through mb-1">₹{product.originalPrice || product.price + 50}</div>
                              <div className="bg-secondary text-white text-[10px] font-black px-3 py-1 rounded-full mb-2 shadow-lg shadow-secondary/20">{(Math.round((((product.originalPrice || product.price + 50) - product.price) / (product.originalPrice || product.price + 50)) * 100))}% OFF</div>
                         </div>
                         <div className="flex gap-4">
                              <button 
                                onClick={() => addToCart(product)}
                                className="flex-1 bg-primary text-white py-6 rounded-[2rem] text-xl font-black shadow-2xl shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all outline-none"
                              >
                                  ADD TO CARE BOX
                              </button>
                         </div>
                         <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest justify-center">
                              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-secondary"/> Secured Payment</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-secondary"/> Same Day Shipped</span>
                         </div>
                    </div>

                    <div className="space-y-10 pt-10 border-t border-slate-100">
                        <div className="space-y-4">
                            <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-xs px-4 border-l-4 border-primary">Clinical Overview</h4>
                            <p className="text-slate-500 leading-relaxed font-semibold italic">"{product.description}"</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs opacity-50">Primary Uses</h4>
                                <ul className="space-y-2 text-sm font-bold text-slate-600">
                                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0"/> Clinical management of identified symptoms</li>
                                    <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-secondary mt-0.5 shrink-0"/> Pharmacological support as needed</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs opacity-50">Safety Notes</h4>
                                <p className="text-slate-500 text-sm font-semibold">Store in a cool and dry location out of the reach of minors.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

const UploadPage = () => (
    <motion.section {...animations.fadeIn} className="py-32 px-4 bg-slate-50/50 min-h-[90vh] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
        <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center space-y-6 mb-16">
                 <h5 className="text-[10px] font-black tracking-[0.4em] text-primary uppercase">RX Services</h5>
                 <h2 className="text-5xl font-display font-black text-slate-900 uppercase tracking-tight">Prescription <span>Refill</span></h2>
                 <p className="text-slate-400 font-semibold text-lg max-w-xl mx-auto">Upload your medical documents securely. Our certified pharmacists will verify and fulfill your order same-day.</p>
            </div>
            
            <div className="glass-card p-12 md:p-20 rounded-[4rem] text-center space-y-12 group transition-all duration-700">
                <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-700">
                    <Upload className="text-primary w-12 h-12" strokeWidth={3} />
                </div>
                <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-20 hover:border-primary/20 transition-all cursor-pointer bg-slate-50/50 group/drop">
                    <div className="text-slate-300 group-hover/drop:text-slate-400 font-black uppercase text-xs tracking-[0.3em] transition-all">Submit JPEG / PDF / PNG</div>
                    <p className="text-slate-200 mt-2 font-bold text-[10px]">Max file size: 10MB</p>
                </div>
                <button className="btn-premium w-full bg-slate-900 text-white py-7 rounded-[2rem] text-xl font-black shadow-2xl shadow-slate-900/20 uppercase tracking-widest">Process My Order</button>
                <div className="flex items-center justify-center gap-8 pt-4 grayscale opacity-30">
                     <ShieldCheck className="h-6" /><CreditCard className="h-6" /><CheckCircle className="h-6" />
                </div>
            </div>
        </div>
    </motion.section>
);

const CartPage = () => {
    const { cart, removeFromCart } = useAppContext();
    const subtotal = cart.reduce((sum, i) => sum + i.price, 0);
    const shipping = subtotal > 500 ? 0 : 49;
    const total = subtotal + shipping;

    return (
        <motion.section {...animations.fadeIn} className="py-12 md:py-24 px-4 max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16">
                 <div className="flex-1 space-y-10">
                      <div className="space-y-2">
                           <h1 className="text-4xl font-display font-black text-slate-900 uppercase tracking-tight">Shopping Box</h1>
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Review your therapeutic requirements</p>
                      </div>
                      
                      {cart.length === 0 ? (
                          <div className="py-40 text-center glass-card rounded-[3.5rem] border-2 border-dashed space-y-8">
                               <ShoppingCart className="w-16 h-16 text-slate-100 mx-auto" />
                               <p className="text-slate-300 font-black text-xl uppercase tracking-tighter">Your care box <br/> is currently empty.</p>
                               <Link to="/products" className="inline-block text-primary font-black uppercase tracking-widest text-xs border-b-2 border-primary/20 pb-1">Begin Therapeutic Journey</Link>
                          </div>
                      ) : (
                          <div className="space-y-6">
                              <AnimatePresence>
                                  {cart.map((item, idx) => (
                                      <motion.div 
                                        key={`${item.id}-${idx}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                        className="glass-card p-6 rounded-[2.5rem] flex items-center gap-8 group relative overflow-hidden"
                                      >
                                          <div className="w-24 h-24 bg-slate-50/50 rounded-3xl flex items-center justify-center p-4 border border-slate-100 shrink-0">
                                              <img src={item.image} className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
                                          </div>
                                          <div className="flex-1 min-w-0">
                                               <div className="text-[10px] font-black text-secondary tracking-widest uppercase mb-1">{item.category}</div>
                                               <h4 className="font-bold text-slate-900 text-lg leading-tight truncate">{item.name}</h4>
                                               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{item.brand}</p>
                                          </div>
                                          <div className="text-xl font-black text-slate-900 whitespace-nowrap">₹{item.price}</div>
                                          <button 
                                            onClick={() => removeFromCart(idx)} 
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                          >
                                              <Trash2 className="w-5 h-5" />
                                          </button>
                                      </motion.div>
                                  ))}
                              </AnimatePresence>
                          </div>
                      )}
                 </div>

                 <aside className="w-full lg:w-96 shrink-0">
                      <div className="glass-card rounded-[3.5rem] p-10 space-y-10 sticky top-32 bg-slate-900 border-none text-white overflow-hidden shadow-2xl shadow-slate-900/40">
                           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                           <h3 className="text-2xl font-black uppercase tracking-tight relative z-10">Care Summary</h3>
                           <div className="space-y-6 relative z-10">
                                <div className="flex justify-between items-center text-slate-400 font-bold text-sm">
                                     <span>Pharmacy Subtotal</span>
                                     <span className="text-white">₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-400 font-bold text-sm">
                                     <span>Clinical Delivery Fee</span>
                                     <span className={shipping === 0 ? 'text-secondary' : 'text-white'}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                </div>
                                <div className="h-px bg-white/10 my-4" />
                                <div className="flex justify-between items-end">
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pb-1">Payable Total</span>
                                     <span className="text-4xl font-black tracking-tight">₹{total}</span>
                                </div>
                           </div>
                           <button 
                             disabled={cart.length === 0}
                             className="w-full bg-primary hover:bg-white hover:text-primary transition-all text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-primary/40 relative z-10 group disabled:opacity-50 disabled:grayscale"
                           >
                               SECURE CHECKOUT <ChevronRight className="inline-block w-6 h-6 ml-2" />
                           </button>
                           <div className="flex items-center justify-center gap-4 relative z-10 grayscale opacity-40">
                                <ShieldCheck className="h-6" /><CheckCircle className="h-6" /><CreditCard className="h-6" />
                           </div>
                      </div>
                 </aside>
            </div>
        </motion.section>
    );
};

const Footer = () => (
    <footer className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 xl:gap-24">
            <div className="space-y-10 col-span-1 lg:col-span-1">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"><Stethoscope className="text-white w-6 h-6" /></div>
                    <h2 className="text-2xl font-display font-black text-slate-900 tracking-tighter uppercase">Rivaansh</h2>
                </Link>
                <p className="text-slate-400 font-semibold leading-relaxed">Global pharmaceutical delivery platform optimizing WHO-GMP clinically tested healthcare.</p>
                <div className="flex gap-4">
                     {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all cursor-pointer shadow-sm"><Phone className="w-5 h-5"/></div>)}
                </div>
            </div>
            <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8">Supply Services</h4>
                <div className="space-y-4 font-bold text-slate-400">
                    <p className="hover:text-primary cursor-pointer transition-colors">Pharmacy Shop</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Lab Diagnostics</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Specialist Consult</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Fast Track Rx</p>
                </div>
            </div>
            <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8">Enterprise</h4>
                <div className="space-y-4 font-bold text-slate-400">
                    <p className="hover:text-primary cursor-pointer transition-colors">Clinical Network</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Wellness Partner</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Care Franchise</p>
                    <p className="hover:text-primary cursor-pointer transition-colors">Pharma Logistics</p>
                </div>
            </div>
            <div>
                <h4 className="font-black text-slate-900 uppercase tracking-widest text-[10px] mb-8">Newsletter</h4>
                <div className="space-y-6">
                    <p className="text-xs font-bold text-slate-500">Subscribe for health bulletins and therapeutic updates.</p>
                    <div className="relative">
                        <input className="w-full bg-slate-100 p-4 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="care@mail.com" />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg"><ArrowRight className="w-4 h-4"/></button>
                    </div>
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pt-20 border-t border-slate-50 mt-20 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
             <div>© 2026 Rivaansh Lifesciences Pharmaceuticals Ltd.</div>
             <div className="flex items-center gap-10">
                  <span>Privacy</span>
                  <span>Compliance</span>
                  <span>GDPR Safe</span>
             </div>
        </div>
    </footer>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP ARCHITECTURE
// ══════════════════════════════════════════════════════════════════════════════

export default function App() {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('riva_cart_v2');
        return saved ? JSON.parse(saved) : [];
    });
    const [dbProducts, setDbProducts] = useState(products);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('riva_user_v2');
        return saved ? JSON.parse(saved) : null;
    });
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    // API Simulation / Real Connect
    useEffect(() => {
        async function fetchProducts() {
            try {
                if (keyword.length > 2) {
                    setLoading(true);
                    const res = await fetch(`https://rivaansh-lifesciences.onrender.com/api/products?keyword=${keyword}`);
                    if (res.ok) {
                        const data = await res.json();
                        setDbProducts(data);
                    }
                    setLoading(false);
                } else if (keyword.length === 0) {
                    setDbProducts(products);
                }
            } catch (err) {
                console.warn("Backend link failed, using dataset", err);
                setLoading(false);
            }
        }
        const delay = setTimeout(fetchProducts, 300);
        return () => clearTimeout(delay);
    }, [keyword]);

    // Save state
    useEffect(() => {
        localStorage.setItem('riva_cart_v2', JSON.stringify(cart));
        if (user) localStorage.setItem('riva_user_v2', JSON.stringify(user));
        else localStorage.removeItem('riva_user_v2');
    }, [cart, user]);

    const addToCart = (p) => {
        setCart(prev => [...prev, p]);
        // Simple toast style notification logic can be added here
    };
    
    const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx));
    const login = (userData) => setUser(userData);
    const openAuth = () => setIsAuthOpen(true);
    const closeAuth = () => setIsAuthOpen(false);

    return (
        <AppContext.Provider value={{ cart, dbProducts, loading, keyword, setKeyword, addToCart, removeFromCart, user, login, openAuth }}>
            <BrowserRouter>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden">
                        <AnimatePresence mode='wait'>
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/products" element={<ProductsPage />} />
                                <Route path="/product/:id" element={<ProductDetailPage />} />
                                <Route path="/upload" element={<UploadPage />} />
                                <Route path="/cart" element={<CartPage />} />
                                <Route path="/account" element={<HomePage />} />
                            </Routes>
                        </AnimatePresence>
                    </main>
                    <Footer />
                    
                    {/* Floating UI Elements */}
                    <AIChatbot />
                    <AnimatePresence>
                        {isAuthOpen && <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />}
                    </AnimatePresence>
                </div>
            </BrowserRouter>
        </AppContext.Provider>
    );
}
