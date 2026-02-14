'use client';
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Storefront from './components/Storefront';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/Auth';
import { collection, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase';
import { Order } from './types';

const Router = () => {
  const { cart, cartTotal, profile, clearCart, addToCart, isAuthOpen, setIsAuthOpen } = useAppContext();
  const [view, setView] = useState<string>('store');
  const [orders, setOrders] = useState<Order[]>([]);

  // Robust SPA Routing based on window hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'store';
      setView(hash);
      window.scrollTo(0, 0); // Reset scroll on navigation
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Admin Data Sync
  useEffect(() => {
    if (profile?.role !== 'ADMIN') return;
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    });
    return () => unsubscribe();
  }, [profile]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar navigate={navigate} />
      
      <main className="flex-grow animate-fade-in">
        {view === 'store' && <Storefront addToCart={addToCart} />}
        
        {view === 'checkout' && (
          cart.length === 0 ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
              <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Your bag is empty</h2>
              <p className="text-stone-500 mb-8 max-w-xs">Add some premium essentials to your collection before checking out.</p>
              <button onClick={() => navigate('store')} className="bg-stone-900 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-stone-900/20 hover:scale-105 transition-transform">
                Start Shopping
              </button>
            </div>
          ) : (
            <Checkout 
              cart={cart} 
              total={cartTotal} 
              userProfile={profile}
              onComplete={() => { clearCart(); navigate('store'); }}
              onCancel={() => navigate('store')} 
            />
          )
        )}

        {view === 'admin' && (
          profile?.role === 'ADMIN' ? (
            <AdminDashboard orders={orders} />
          ) : (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Access Restricted</p>
              <button onClick={() => navigate('store')} className="mt-6 text-stone-900 font-bold underline underline-offset-4">Return to Store</button>
            </div>
          )
        )}
      </main>

      <Footer />
      
      {/* Modals rendered at root for proper stacking context */}
      <CartDrawer navigate={navigate} />
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}