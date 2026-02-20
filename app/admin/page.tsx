
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/AdminDashboard';
import { useAppContext } from '../../context/AppContext';
import { collection, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../../firebase';
import { Order, ManualSale } from '../../types';

export default function AdminPage() {
  const { profile } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [manualSales, setManualSales] = useState<ManualSale[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (profile && profile.role !== 'ADMIN') {
      router.push('/');
    }
  }, [profile, router]);

  useEffect(() => {
    if (profile?.role !== 'ADMIN') return;

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(data);
    }, (err) => {
      console.error("Admin orders listener error:", err);
    });

    const qManual = query(collection(db, 'manualSales'), orderBy('createdAt', 'desc'));
    const unsubManual = onSnapshot(qManual, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManualSale));
      setManualSales(data);
    }, (err) => {
      console.error("Manual sales listener error:", err);
    });

    return () => {
      unsubscribe();
      unsubManual();
    };
  }, [profile]);

  if (profile?.role !== 'ADMIN') return null;

  return <AdminDashboard orders={orders} manualSales={manualSales} />;
}
