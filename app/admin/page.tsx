
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '../../components/AdminDashboard';
import { useAppContext } from '../../context/AppContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order, ManualSale, InventoryProduct, Expense } from '../../types';

export default function AdminPage() {
  const { profile } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [manualSales, setManualSales] = useState<ManualSale[]>([]);
  const [inventoryProducts, setInventoryProducts] = useState<InventoryProduct[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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

    const qInventory = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));
    const unsubInventory = onSnapshot(qInventory, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InventoryProduct));
      setInventoryProducts(data);
    }, (err) => {
      console.error("Inventory listener error:", err);
    });

    const qExpenses = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (err) => {
      console.error("Expenses listener error:", err);
    });

    return () => {
      unsubscribe();
      unsubManual();
      unsubInventory();
      unsubExpenses();
    };
  }, [profile]);

  if (profile?.role !== 'ADMIN') return null;

  return <AdminDashboard 
    orders={orders} 
    manualSales={manualSales} 
    inventoryProducts={inventoryProducts}
    expenses={expenses}
  />;
}
