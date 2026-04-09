import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/api.js';
import ProductCard from '../components/ProductCard.jsx';

const CATEGORIES = ['all','tablet','capsule','cream','kit'];

export default function ProductsPage() {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (search.trim()) params.set('search', search.trim());
    api.get('/products?' + params.toString()).then(({ ok, data }) => {
      if (ok) setProducts(data);
      setLoading(false);
    });
  }, [category, search]);

  const setCategory = (c) => {
    const sp = new URLSearchParams(searchParams);
    if (c === 'all') sp.delete('category'); else sp.set('category', c);
    setSearchParams(sp);
  };

  return (
    <div className="container" style={{ padding:'32px 20px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'var(--font)',fontWeight:900,fontSize:'1.8rem',color:'#1a2332',marginBottom:4 }}>Medicine Store</h1>
        <p style={{ color:'var(--tm)',fontSize:'.92rem' }}>Browse our complete range of authentic medicines & health products</p>
      </div>

      {/* Search */}
      <div style={{ position:'relative',marginBottom:20 }}>
        <span className="material-icons-round" style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--ts)',fontSize:20 }}>search</span>
        <input className="input" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search medicines, brands, compositions..."
          style={{ paddingLeft:44,fontSize:'1rem' }} />
        {search && (
          <button onClick={()=>setSearch('')} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--ts)',display:'flex',alignItems:'center' }}>
            <span className="material-icons-round" style={{ fontSize:18 }}>close</span>
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div style={{ display:'flex',gap:8,marginBottom:24,flexWrap:'wrap' }}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setCategory(c)} style={{
            padding:'7px 18px',borderRadius:'var(--r-full)',fontFamily:'var(--font)',
            fontWeight:600,fontSize:'.82rem',cursor:'pointer',transition:'all var(--tr)',
            background:category===c?'var(--pr)':'white',
            color:category===c?'white':'var(--tm)',
            border:`2px solid ${category===c?'var(--pr)':'var(--bd)'}`,
          }}>
            {c.charAt(0).toUpperCase()+c.slice(1)}{c==='all'?'':' s'}
          </button>
        ))}
      </div>

      {/* Count */}
      <div style={{ marginBottom:16,fontSize:'.85rem',color:'var(--ts)' }}>
        {loading ? 'Searching...' : `${products.length} product${products.length!==1?'s':''} found`}
        {search && <span style={{ color:'var(--pr)',fontWeight:600 }}> for "{search}"</span>}
      </div>

      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:20 }}>
          {[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{ height:290,borderRadius:'var(--r-lg)' }} />)}
        </div>
      ) : products.length===0 ? (
        <div className="empty-state">
          <span className="material-icons-round">medication_liquid</span>
          <h3>No medicines found</h3>
          <p>Try a different search term or browse all categories.</p>
          <button className="btn btn-primary btn-sm" onClick={()=>{setSearch('');setCategory('all');}}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:20 }}>
          {products.map(p=><ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
