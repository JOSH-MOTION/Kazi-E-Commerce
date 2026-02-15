
'use client';
import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Storefront from './components/Storefront';
import Checkout from './components/Checkout';
import AdminDashboard from './components/AdminDashboard';
import OrdersList from './components/OrdersList';
import AuthModal from './components/Auth';
import { collection, onSnapshot, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from './firebase';
import { Order } from './types';

const Router = () => {
  const { cart, cartTotal, profile, user, clearCart, addToCart, isAuthOpen, setIsAuthOpen } = useAppContext();
  const [view, setView] = useState<string>('store');
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'store';
      setView(hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (profile?.role !== 'ADMIN') return;
    // Removed orderBy to prevent index requirement error
    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // In-memory sort
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAdminOrders(data);
    });
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // In-memory sort
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserOrders(data);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar navigate={(path) => window.location.hash = path} />
      
      <main className="flex-grow">
        {view === 'store' && <Storefront addToCart={addToCart} />}
        {view === 'checkout' && (
          <Checkout 
            cart={cart} 
            total={cartTotal} 
            userProfile={profile} 
            onComplete={() => { clearCart(); window.location.hash = 'orders'; }}
            onCancel={() => window.location.hash = 'store'}
          />
        )}
        {view === 'admin' && profile?.role === 'ADMIN' && <AdminDashboard orders={adminOrders} />}
        {view === 'orders' && (
          <div className="max-w-4xl mx-auto py-16 px-4">
            <OrdersList orders={userOrders} />
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer navigate={(path) => window.location.hash = path} />
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
