'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import OrdersList from '../../components/OrdersList';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';

export default function OrdersPage() {
  const { user } = useAppContext();
  const [userOrders, setUserOrders] = useState<Order[]>([]);

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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Please log in</h2>
        <p className="text-stone-500 mb-8">You need to be logged in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-6">
      <OrdersList orders={userOrders} />
    </div>
  );
}
