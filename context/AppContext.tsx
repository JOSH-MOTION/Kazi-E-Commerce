'use client';
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, collection, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { CartItem, Product, Category, Promotion, StoreSettings } from '../types';
import { PRODUCTS as STATIC_PRODUCTS, CATEGORIES as STATIC_CATEGORIES, PROMOTIONS as STATIC_PROMOS } from '../constants';

interface AppContextType {
  user: any;
  profile: any;
  products: Product[];
  categories: Category[];
  promotions: Promotion[];
  settings: StoreSettings | null;
  cart: CartItem[];
  cartTotal: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  addToCart: (productId: string, variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'store_config'), (snap) => {
      if (snap.exists()) {
        setSettings({ id: snap.id, ...snap.data() } as StoreSettings);
      } else {
        setSettings({ id: 'store_config', tickerText: 'Welcome to J&B Market • Premium African Retail • Accra 2025', isTickerActive: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      if (snapshot.empty && STATIC_PRODUCTS.length > 0) {
        setProducts(STATIC_PRODUCTS);
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty) {
        setCategories(STATIC_CATEGORIES);
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(data);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      if (snapshot.empty) {
        setPromotions(STATIC_PROMOS);
      } else {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
        setPromotions(data);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;
    const authUnsub = onAuthStateChanged(auth, (u) => {
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }
      if (u) {
        setUser({ uid: u.uid, email: u.email, displayName: u.displayName, photoURL: u.photoURL });
        profileUnsub = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (snap.exists()) setProfile(snap.data());
          else setProfile(null);
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return () => { authUnsub(); if (profileUnsub) profileUnsub(); };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('kazi_cart_v2');
    if (saved) { try { setCart(JSON.parse(saved)); } catch (e) { setCart([]); } }
  }, []);

  useEffect(() => {
    if (cart.length >= 0) localStorage.setItem('kazi_cart_v2', JSON.stringify(cart));
  }, [cart]);

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      const variant = product?.variants?.find(v => v.id === item.variantId);
      return sum + (variant?.price || 0) * item.quantity;
    }, 0);
  }, [cart, products]);

  const addToCart = (productId: string, variantId: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item => item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId, variantId, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => item.variantId === variantId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };

  const clearCart = () => setCart([]);

  return (
    <AppContext.Provider value={{
      user, profile, products, categories, promotions, settings,
      cart, cartTotal, totalItems,
      isCartOpen, setIsCartOpen,
      isAuthOpen, setIsAuthOpen,
      addToCart, removeFromCart, updateCartQuantity, clearCart,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};