
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
import InfoPages from './components/InfoPages';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Order, ManualSale } from './types';

const Router = () => {
  const { cart, cartTotal, profile, user, clearCart, addToCart, isAuthOpen, setIsAuthOpen } = useAppContext();
  const [view, setView] = useState<string>('store');
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [manualSales, setManualSales] = useState<ManualSale[]>([]);
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
    const q = collection(db, 'orders');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAdminOrders(data);
    }, (err) => {
      console.error("Admin orders listener error:", err);
    });
    
    const qManual = collection(db, 'manualSales');
    const unsubManual = onSnapshot(qManual, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManualSale));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setManualSales(data);
    }, (err) => {
      console.error("Manual sales listener error:", err);
    });

    return () => {
      unsubscribe();
      unsubManual();
    };
  }, [profile]);

  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUserOrders(data);
    }, (err) => {
      console.error("User orders listener error:", err);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar navigate={(path) => window.location.hash = path} />
      
      <main className="flex-grow w-full">
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
        {view === 'admin' && profile?.role === 'ADMIN' && <AdminDashboard orders={adminOrders} manualSales={manualSales} />}
        {view === 'orders' && (
          <div className="w-full max-w-5xl mx-auto py-12 px-6">
            <OrdersList orders={userOrders} />
          </div>
        )}
        {['support', 'track-order', 'momo-guide', 'returns'].includes(view) && (
          <InfoPages type={view as any} />
        )}
      </main>

      <Footer navigate={(path) => window.location.hash = path} />
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
