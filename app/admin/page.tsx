
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/AdminDashboard';
import { useAppContext } from '../../context/AppContext';
import { collection, onSnapshot, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../../firebase';
import { Order } from '../../types';

export default function AdminPage() {
  const { profile } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
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
    });
    return () => unsubscribe();
  }, [profile]);

  if (profile?.role !== 'ADMIN') return null;

  return <AdminDashboard orders={orders} />;
}
