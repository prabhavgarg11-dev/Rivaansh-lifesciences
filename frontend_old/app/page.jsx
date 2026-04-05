"use client";
import { useEffect, useState } from 'react';
import { ShoppingCart, User, Search, Microscope, Pill, Stethoscope, Loader2 } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const res = await fetch(""https://rivaansh-lifesciences.onrender.com/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="glass-nav py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          < Microscope className="text-primary w-8 h-8" />
          <div className="leading-tight">
            <h1 className="text-xl md:text-2xl font-black text-primary uppercase tracking-wide">Rivaansh</h1>
            <p className="text-xs md:text-sm font-bold text-secondary tracking-wide">LifeSciences</p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
          <input 
            type="text" 
            placeholder="Search for medicines, health products..." 
            className="w-full bg-slate-100 rounded-full py-3 px-6 pl-12 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-slate-200"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button className="relative text-slate-500 hover:text-primary transition-colors">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">0</span>
          </button>
          <button className="hidden md:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-light transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5">
            <User className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 md:px-12 py-12 md:py-24 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6 z-10">
          <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-sm tracking-wide uppercase">
            Special Launch Offer
          </span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
            Premium Healthcare, <br/> Delivered Safely.
          </h2>
          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Order genuine medicines, book home lab tests, and consult specialists online. Experience the Rivaansh standard of care.
          </p>
          <div className="flex gap-4 pt-4">
            <button className="bg-primary hover:bg-primary-light text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 w-full md:w-auto">
              Order Medicines
            </button>
            <button className="bg-white text-primary border-2 border-primary hover:bg-slate-50 px-8 py-4 rounded-xl font-bold transition-all w-full md:w-auto">
              Upload Prescription
            </button>
          </div>
        </div>
        
        <div className="flex-1 w-full h-[400px] md:h-[500px] relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white group">
          <img 
            src="https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&auto=format&fit=crop" 
            alt="Pharmacy" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
             <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-xl w-full max-w-md">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-success/20 p-2 rounded-full">
                    <Pill className="text-success w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900">100% Genuine Medicines</h3>
                </div>
                <p className="text-sm text-slate-600">Sourced directly from verified manufacturers.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Products Section (Task 2) */}
      <section className="bg-slate-50 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h3>
            <span className="text-slate-500 font-medium">Ready for immediate delivery</span>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="font-bold text-slate-400">Loading premium inventory...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
              <p className="text-red-500 font-bold mb-2">API Connection Error</p>
              <p className="text-slate-500">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group">
                   <div className="aspect-square bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-8">
                      <img 
                        src={`https://via.placeholder.com/200/f8f9fb/006767?text=${item.name.replace(/\s/g, '+')}`} 
                        alt={item.name} 
                        className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                   </div>
                   <div className="space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Certified Pharma</span>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">{item.name}</h4>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-2xl font-black text-slate-900">₹{item.price}</span>
                        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-light transition-all flex items-center gap-2">
                           Add
                        </button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
               <p className="text-slate-400 font-bold">No products found in our current catalogue.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm">
         <div className="flex items-center justify-center gap-3 mb-4 opacity-50 grayscale">
            <img src="/logo.png.jpeg" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => {e.target.style.display='none'}} />
            <h2 className="font-bold text-white text-lg tracking-wider uppercase">Rivaansh Lifesciences</h2>
         </div>
         <p>© 2026 Rivaansh Lifesciences Pharmaceuticals. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
