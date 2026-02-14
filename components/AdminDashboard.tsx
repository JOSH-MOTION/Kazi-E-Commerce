
import React, { useState } from 'react';
import { TrendingUp, Clock, Package, CheckCircle, Eye, AlertCircle, Ticket, Edit3, Save, X, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant } from '../types';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { CATEGORIES, PROMOTIONS } from '../constants';
import { useAppContext } from '../context/AppContext';

interface AdminDashboardProps {
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const { products } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingStock, setEditingStock] = useState<{ productId: string, variantId: string, value: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const updateStock = async () => {
    if (!editingStock) return;
    setSaving(true);
    try {
      const product = products.find(p => p.id === editingStock.productId);
      if (!product) return;
      
      const newVariants = product.variants.map(v => 
        v.id === editingStock.variantId ? { ...v, stock: parseInt(editingStock.value) || 0 } : v
      );
      
      const productRef = doc(db, 'products', editingStock.productId);
      await updateDoc(productRef, { variants: newVariants });
      setEditingStock(null);
    } catch (err) {
      alert("Failed to update stock.");
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    revenue: orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((sum, o) => sum + o.totalAmount, 0),
    pending: orders.filter(o => o.status === OrderStatus.PENDING_VERIFICATION).length,
    total: orders.length
  };

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-12 lg:p-16 relative">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-3">Operations Hub</h1>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px]">Managing Trust and Fulfillment • Ghana.</p>
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
          <StatCard icon={<TrendingUp />} label="Total Revenue" value={`GH₵ ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<AlertCircle />} label="MoMo Verification Pending" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package />} label="Collection Volume" value={stats.total.toString()} color="stone" />
        </div>

        {activeTab === 'orders' && <OrdersTable orders={orders} updateStatus={updateOrderStatus} />}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-bold text-3xl">Live Catalog</h2>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-stone-900/10"
              >
                <Plus size={18} />
                <span>Add New Item</span>
              </button>
            </div>

            <div className="grid gap-6">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-3xl border border-stone-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-24 h-32 bg-stone-100 rounded-2xl overflow-hidden shrink-0">
                    <img src={product.images[0]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        {CATEGORIES.find(c => c.id === product.categoryId)?.name}
                      </span>
                      <h3 className="text-xl font-bold text-stone-900">{product.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                      {product.variants.map(v => {
                        const isEditing = editingStock?.variantId === v.id;
                        return (
                          <div key={v.id} className={`p-4 rounded-2xl border-2 transition-all ${isEditing ? 'border-orange-500 bg-orange-50/30' : 'border-stone-50 bg-stone-50/50 hover:bg-white hover:border-stone-100'}`}>
                            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">{v.size || 'OS'} • {v.colorName}</div>
                            <div className="flex items-center justify-between">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <input 
                                    autoFocus
                                    type="number" 
                                    className="w-16 bg-white border border-orange-200 rounded-lg px-2 py-1 text-sm font-bold outline-none"
                                    value={editingStock.value}
                                    onChange={e => setEditingStock({ ...editingStock, value: e.target.value })}
                                  />
                                  <button onClick={updateStock} className="text-orange-600 hover:text-orange-700 transition-colors">
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className={`text-sm font-bold ${v.stock < 5 ? 'text-red-500' : 'text-stone-900'}`}>{v.stock} in stock</span>
                                  <button 
                                    onClick={() => setEditingStock({ productId: product.id, variantId: v.id, value: v.stock.toString() })}
                                    className="text-stone-300 hover:text-stone-900 transition-colors"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && <PromosView />}
      </div>

      {isAddingProduct && <AddProductModal onClose={() => setIsAddingProduct(false)} />}
    </div>
  );
};

const AddProductModal = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: CATEGORIES[0].id,
    basePrice: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...form,
        basePrice: parseInt(form.basePrice),
        images: [form.imageUrl],
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v-' + Date.now(), sku: 'NEW-ITEM', size: 'M', colorName: 'Default', hexColor: '#000000', price: parseInt(form.basePrice), stock: 10, isComingSoon: false }
        ]
      });
      onClose();
    } catch (err) {
      alert("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
        <button type="button" onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-stone-900"><X size={24} /></button>
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">New Item Entry</h2>
        
        <div className="space-y-6">
          <Field label="Item Name" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="e.g. Premium Waffle Polo" />
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-bold outline-none focus:border-stone-900 transition-all appearance-none"
                value={form.categoryId}
                onChange={e => setForm({...form, categoryId: e.target.value})}
              >
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Field label="Base Price (GH₵)" type="number" value={form.basePrice} onChange={v => setForm({...form, basePrice: v})} placeholder="150" />
          </div>
          <Field label="Description" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Tell the story of this item..." />
          <Field label="Hero Image URL" value={form.imageUrl} onChange={v => setForm({...form, imageUrl: v})} placeholder="Unsplash or Cloudinary URL" />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-stone-900 text-white py-6 rounded-2xl font-bold mt-12 hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-stone-900/20"
        >
          {loading ? <Loader2 className="animate-spin" /> : <span>Add to Live Catalog</span>}
        </button>
      </form>
    </div>
  );
};

const Field = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">{label}</label>
    <input 
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full p-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-bold outline-none focus:border-stone-900 transition-all"
      required
    />
  </div>
);

const OrdersTable = ({ orders, updateStatus }: { orders: Order[], updateStatus: any }) => (
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
                <div className="font-bold text-stone-900">GH₵ {order.totalAmount.toLocaleString()}</div>
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
                    onClick={() => updateStatus(order.id, OrderStatus.PROCESSING)}
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
    </div>
  </div>
);

const PromosView = () => (
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
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{promo.type === 'PERCENT' ? `${promo.value}% OFF` : `GH₵ ${promo.value} OFF`}</span>
            </div>
            <p className="font-bold text-stone-900 mb-2">{promo.description}</p>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Expires: {new Date(promo.endDate).toLocaleDateString()}</p>
          </div>
          <Ticket size={100} className="absolute -bottom-8 -right-8 text-stone-900/5 group-hover:text-stone-900/10 transition-colors" />
        </div>
      ))}
    </div>
  </div>
);

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
