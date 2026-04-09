import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [cart, setCart]       = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) { setCart({ items: [], total: 0 }); return; }
    setLoading(true);
    const { ok, data } = await api.get('/cart');
    if (ok) setCart({ items: data.items || [], total: data.total || 0 });
    setLoading(false);
  }, [isLoggedIn]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isLoggedIn) { window.dispatchEvent(new CustomEvent('auth:required')); return { ok: false }; }
    const { ok, data } = await api.post('/cart', { productId, quantity });
    if (ok) await fetchCart();
    return { ok, data };
  };

  const removeFromCart = async (productId) => {
    if (!isLoggedIn) return { ok: false };
    const { ok, data } = await api.post('/cart', { productId, quantity: 0 });
    if (ok) await fetchCart();
    return { ok, data };
  };

  const updateQty = async (productId, delta) => {
    const item = cart.items.find(i => String(i.productId) === String(productId));
    if (!item) return { ok: false };
    const newQty = item.quantity + delta;
    return newQty <= 0 ? removeFromCart(productId) : addToCart(productId, newQty);
  };

  const clearCart = async () => {
    const { ok } = await api.post('/cart', { items: [] });
    if (ok) setCart({ items: [], total: 0 });
    return { ok };
  };

  const items    = cart.items || [];
  const count    = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
  const delivery = subtotal >= 499 ? 0 : 49;
  const total    = subtotal + delivery;
  const isInCart = (id) => items.some(i => String(i.productId) === String(id));

  return (
    <CartContext.Provider value={{
      cart, items, count, subtotal, delivery, total,
      loading, fetchCart, addToCart, removeFromCart, updateQty, clearCart, isInCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
