
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrdersListProps {
  orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
  const router = useRouter();

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="text-stone-300" size={32} />
        </div>
        <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No orders yet</h3>
        <p className="text-stone-400 text-sm mb-8">Your premium collection is waiting to be started.</p>
        <button 
          onClick={() => router.push('/')}
          className="bg-stone-900 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-900 mb-2">My Orders</h2>
          <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Track your fulfillment status in real-time.</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[2rem] border border-stone-100 p-6 md:p-8 hover:shadow-xl hover:shadow-stone-900/5 transition-all group">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 shrink-0">
                  <Package size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <h4 className="font-bold text-stone-900">GH₵ {order.totalAmount.toLocaleString()}</h4>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`flex-grow md:flex-grow-0 px-6 py-3 rounded-2xl flex items-center gap-3 border transition-colors ${getStatusStyles(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{order.status.replace('_', ' ')}</span>
                </div>
                <button className="p-3 rounded-xl hover:bg-stone-50 text-stone-300 hover:text-stone-900 transition-all border border-transparent hover:border-stone-100">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Verification Helper */}
            {order.status === OrderStatus.PENDING_VERIFICATION && (
              <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100/50 flex items-start gap-4 animate-pulse">
                <Clock className="text-orange-500 shrink-0" size={18} />
                <p className="text-[10px] font-bold text-orange-800 uppercase leading-relaxed tracking-wider">
                  Verification in progress. We are checking Transaction ID: <span className="font-mono">{order.momoTransactionId}</span>. This usually takes 5-15 minutes.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING_VERIFICATION: return 'bg-orange-50 text-orange-600 border-orange-100';
    case OrderStatus.PROCESSING: return 'bg-blue-50 text-blue-600 border-blue-100';
    case OrderStatus.SHIPPED: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case OrderStatus.DELIVERED: return 'bg-green-50 text-green-600 border-green-100';
    case OrderStatus.CANCELLED: return 'bg-stone-50 text-stone-400 border-stone-200';
    default: return 'bg-stone-50 text-stone-500 border-stone-100';
  }
};

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING_VERIFICATION: return <Clock size={14} />;
    case OrderStatus.PROCESSING: return <Package size={14} />;
    case OrderStatus.SHIPPED: return <Truck size={14} />;
    case OrderStatus.DELIVERED: return <CheckCircle size={14} />;
    case OrderStatus.CANCELLED: return <XCircle size={14} />;
    default: return <Clock size={14} />;
  }
};

export default OrdersList;
