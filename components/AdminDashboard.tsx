
import React, { useState } from 'react';
import { TrendingUp, Clock, Package, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { db } from '../firebase';
import { updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

interface AdminDashboardProps {
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const stats = {
    revenue: orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((sum, o) => sum + o.totalAmount, 0),
    pending: orders.filter(o => o.status === OrderStatus.PENDING_VERIFICATION).length,
    total: orders.length
  };

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Operations Control</h1>
          <p className="text-stone-500 text-sm">Real-time MoMo order tracking.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={<TrendingUp />} label="Total Revenue" value={`UGX ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<AlertCircle />} label="Pending Verification" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package />} label="All Orders" value={stats.total.toString()} color="stone" />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center">
            <h2 className="font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID / Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">MoMo ID</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-stone-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] mb-1">{order.id}</div>
                      <div className="font-bold">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 font-bold">UGX {order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-mono">{order.momoTransactionId || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusStyle(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status === OrderStatus.PENDING_VERIFICATION && (
                        <button 
                          onClick={() => updateOrderStatus(order.id, OrderStatus.PROCESSING)}
                          className="bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-700"
                        >
                          Verify Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-stone-200 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>{icon}</div>
    <div>
      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

const getStatusStyle = (status: OrderStatus) => {
  switch(status) {
    case OrderStatus.PENDING_VERIFICATION: return 'bg-blue-50 text-blue-700';
    case OrderStatus.PROCESSING: return 'bg-green-50 text-green-700';
    case OrderStatus.CANCELLED: return 'bg-red-50 text-red-700';
    default: return 'bg-stone-50 text-stone-600';
  }
};

export default AdminDashboard;
