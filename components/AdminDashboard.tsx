import React, { useState } from 'react';
import { TrendingUp, Clock, Package, CheckCircle, Eye, AlertCircle, Ticket, Edit3, Save } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { db } from '../firebase';
import { updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { PRODUCTS, PROMOTIONS } from '../constants';

interface AdminDashboardProps {
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos'>('orders');

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
    <div className="bg-stone-50 min-h-screen p-4 md:p-12 lg:p-16">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-3">Operations Hub</h1>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Managing Trust and Fulfillment.</p>
          </div>
          <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm">
            {[
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'inventory', label: 'Inventory', icon: TrendingUp },
              { id: 'promos', label: 'Promotions', icon: Ticket }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:text-stone-900'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          <StatCard icon={<TrendingUp />} label="Total Revenue" value={`UGX ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<AlertCircle />} label="MoMo Verification Pending" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package />} label="Collection Volume" value={stats.total.toString()} color="stone" />
        </div>

        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xl shadow-stone-900/5">
            <div className="px-8 py-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
              <h2 className="font-bold text-stone-900 uppercase tracking-widest text-xs">Recent Order Stream</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] border-b border-stone-100">
                  <tr>
                    <th className="px-8 py-6">ID / Timestamp</th>
                    <th className="px-8 py-6">Customer / Area</th>
                    <th className="px-8 py-6">Settlement</th>
                    <th className="px-8 py-6">Verification ID</th>
                    <th className="px-8 py-6">Progress</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition">
                      <td className="px-8 py-6">
                        <div className="font-mono text-[10px] font-bold text-orange-600 mb-1">{order.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-stone-400 font-bold uppercase">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-stone-900">{order.customerName}</div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{order.deliveryAddress.split(',')[0]}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-stone-900">UGX {order.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-6 text-xs font-mono font-bold tracking-wider text-stone-600">
                        {order.momoTransactionId || '---'}
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {order.status === OrderStatus.PENDING_VERIFICATION && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, OrderStatus.PROCESSING)}
                            className="bg-stone-900 text-white text-[10px] font-bold px-5 py-2.5 rounded-xl hover:bg-stone-800 transition-all shadow-lg"
                          >
                            Verify MoMo
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="p-20 text-center text-stone-400 text-sm font-medium">No orders recorded in the stream.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-2xl shadow-stone-900/5">
            <h2 className="font-serif font-bold text-2xl mb-8">Product & Variant Stock</h2>
            <div className="space-y-6">
              {PRODUCTS.map(product => (
                <div key={product.id} className="border border-stone-100 rounded-2xl p-6 bg-stone-50/30">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <img src={product.images[0]} className="w-10 h-14 object-cover rounded-lg" />
                      <h3 className="font-bold text-stone-900">{product.name}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {product.variants.map(v => (
                      <div key={v.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{v.size || 'OS'} • {v.colorName}</div>
                        <div className="flex items-baseline justify-between">
                          <span className={`text-sm font-bold ${v.stock < 5 ? 'text-red-500' : 'text-stone-900'}`}>{v.stock} pcs</span>
                          <button className="text-stone-300 hover:text-stone-900 transition-colors"><Edit3 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-2xl shadow-stone-900/5">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif font-bold text-2xl">Active Campaigns</h2>
              <button className="bg-stone-900 text-white px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest">+ Create Promo</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROMOTIONS.map(promo => (
                <div key={promo.id} className="p-8 rounded-[2rem] border-2 border-stone-50 bg-stone-50/30 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-stone-900 text-white px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">{promo.code}</div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{promo.type === 'PERCENT' ? `${promo.value}% OFF` : `UGX ${promo.value} OFF`}</span>
                    </div>
                    <p className="font-bold text-stone-900 mb-2">{promo.description}</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Expires: {new Date(promo.endDate).toLocaleDateString()}</p>
                  </div>
                  <Ticket size={100} className="absolute -bottom-8 -right-8 text-stone-900/5 group-hover:text-stone-900/10 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-8 rounded-[2rem] border border-stone-200 flex items-center gap-6 shadow-xl shadow-stone-900/5">
    <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 shadow-inner`}>{icon}</div>
    <div>
      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-2xl font-serif font-bold text-stone-900">{value}</p>
    </div>
  </div>
);

const getStatusStyle = (status: OrderStatus) => {
  switch(status) {
    case OrderStatus.PENDING_VERIFICATION: return 'bg-orange-50 text-orange-600 border border-orange-100';
    case OrderStatus.PROCESSING: return 'bg-green-50 text-green-600 border border-green-100';
    case OrderStatus.CANCELLED: return 'bg-stone-100 text-stone-400';
    default: return 'bg-stone-50 text-stone-500';
  }
};

export default AdminDashboard;