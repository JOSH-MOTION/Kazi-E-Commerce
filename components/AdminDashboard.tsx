
import React, { useState, useRef, useCallback } from 'react';
import { TrendingUp, Clock, Package, CheckCircle, AlertCircle, Ticket, Edit3, Save, X, Plus, Loader2, Upload, Image as ImageIcon, Check, Trash2, Layers } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant, Category, Promotion } from '../types';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { useAppContext } from '../context/AppContext';
import { uploadToCloudinary } from '../cloudinary';

interface AdminDashboardProps {
  orders: Order[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const { products, categories, promotions } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos' | 'categories'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingPromo, setIsAddingPromo] = useState(false);
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
          <div className="flex bg-white p-1.5 rounded-2xl border border-stone-200 shadow-sm overflow-x-auto scrollbar-hide">
            {[
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'inventory', label: 'Products', icon: Layers },
              { id: 'categories', label: 'Categories', icon: TrendingUp },
              { id: 'promos', label: 'Promotions', icon: Ticket }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:text-stone-900'}`}
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
                    <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
                        {categories.find(c => c.id === product.categoryId)?.name || 'Misc'}
                      </span>
                      <h3 className="text-xl font-bold text-stone-900">{product.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
                      {product.variants?.map(v => {
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
                                  <span className={`text-sm font-bold ${v.stock < 5 ? 'text-red-500' : 'text-stone-900'}`}>{v.stock} stock</span>
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

        {activeTab === 'categories' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-bold text-3xl">Categories</h2>
              <button onClick={() => setIsAddingCategory(true)} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3"><Plus size={18} /> <span>New Category</span></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between">
                  <div className="font-bold text-stone-900">{cat.name}</div>
                  <button onClick={() => deleteDoc(doc(db, 'categories', cat.id))} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
           <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="font-serif font-bold text-3xl">Promotions</h2>
              <button onClick={() => setIsAddingPromo(true)} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3"><Plus size={18} /> <span>New Promo</span></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map(promo => (
                <div key={promo.id} className="p-8 bg-white rounded-3xl border border-stone-100 relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-4">
                    <div className="bg-orange-600 text-white px-4 py-2 rounded-xl font-mono text-sm font-bold tracking-widest">{promo.code}</div>
                    <button onClick={() => deleteDoc(doc(db, 'promotions', promo.id))} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                  <p className="font-bold text-stone-900 mb-2">{promo.description}</p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{promo.type === 'PERCENT' ? `${promo.value}% OFF` : `GH₵${promo.value} OFF`}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAddingProduct && <AddProductModal onClose={() => setIsAddingProduct(false)} />}
      {isAddingCategory && <AddCategoryModal onClose={() => setIsAddingCategory(false)} />}
      {isAddingPromo && <AddPromoModal onClose={() => setIsAddingPromo(false)} />}
    </div>
  );
};

// ─── Modals ──────────────────────────────────────────────────────────────────

const AddCategoryModal = ({ onClose }: any) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, 'categories'), { name, slug: name.toLowerCase().replace(/ /g, '-') });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-12">
        <h2 className="text-2xl font-serif font-bold mb-8">New Category</h2>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Footwear" className="w-full p-4 border rounded-2xl mb-8 outline-none focus:border-stone-900" required />
        <button disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Create Category'}</button>
      </form>
    </div>
  );
};

const AddPromoModal = ({ onClose }: any) => {
  const [form, setForm] = useState({ code: '', description: '', type: 'PERCENT' as const, value: '' });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, 'promotions'), { ...form, value: parseInt(form.value), startDate: new Date().toISOString(), endDate: '2030-01-01' });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-12 space-y-4">
        <h2 className="text-2xl font-serif font-bold mb-8">New Promotion</h2>
        <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Code (e.g. WELCOME20)" className="w-full p-4 border rounded-2xl outline-none" required />
        <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description" className="w-full p-4 border rounded-2xl outline-none" required />
        <div className="grid grid-cols-2 gap-4">
          <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="p-4 border rounded-2xl">
            <option value="PERCENT">% OFF</option>
            <option value="FIXED">GH₵ OFF</option>
          </select>
          <input type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} placeholder="Value" className="w-full p-4 border rounded-2xl outline-none" required />
        </div>
        <button disabled={loading} className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold">{loading ? <Loader2 className="animate-spin mx-auto" /> : 'Active Promo'}</button>
      </form>
    </div>
  );
};

const AddProductModal = ({ onClose }: { onClose: () => void }) => {
  const { categories } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [form, setForm] = useState({ name: '', description: '', categoryId: categories[0]?.id || '', basePrice: '' });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setLoading(true);
    try {
      const uploadedUrls = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToCloudinary(files[i]);
        uploadedUrls.push(url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (err) { alert('Image upload failed'); }
    finally { setLoading(false); }
  };

  const addVariant = () => {
    setVariants([...variants, { id: 'v-' + Date.now(), sku: 'SKU-' + Math.random().toString(36).substring(7).toUpperCase(), colorName: '', hexColor: '#000000', price: parseInt(form.basePrice) || 0, stock: 10, isComingSoon: false }]);
  };

  const updateVariant = (idx: number, field: keyof ProductVariant, val: any) => {
    const updated = [...variants];
    updated[idx] = { ...updated[idx], [field]: val };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0 || variants.length === 0) return alert('Please add images and at least one variant.');
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...form,
        basePrice: parseInt(form.basePrice),
        images,
        variants,
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (err) { alert("Failed to save product."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-4xl rounded-[2.5rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Craft New Product</h2>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <Field label="Product Name" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} placeholder="e.g. Premium Linen Set" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Category</label>
                <select className="w-full p-4 bg-stone-50 border rounded-2xl text-sm font-bold" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <Field label="Base Price (GH₵)" type="number" value={form.basePrice} onChange={(v: string) => setForm({ ...form, basePrice: v })} placeholder="150" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-stone-50 border rounded-2xl min-h-[120px] outline-none text-sm font-bold" placeholder="The story of the product..." required />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Gallery ({images.length} images)</label>
              <div className="grid grid-cols-4 gap-2">
                {images.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                    <img src={url} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                  </div>
                ))}
                <label className="aspect-square flex items-center justify-center border-2 border-dashed border-stone-200 rounded-xl cursor-pointer hover:border-stone-400 transition-all text-stone-400">
                  <Plus size={24} />
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Variant Builder</label>
              <button type="button" onClick={addVariant} className="text-orange-600 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-orange-50 px-3 py-1.5 rounded-full">+ Add Variant</button>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {variants.length === 0 && <p className="text-xs text-stone-300 italic text-center py-10">Add colors/sizes to allow purchases.</p>}
              {variants.map((v, idx) => (
                <div key={v.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Variant #{idx + 1}</span>
                    <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== idx))} className="text-stone-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={v.colorName} onChange={e => updateVariant(idx, 'colorName', e.target.value)} placeholder="Color (e.g. Ebony)" className="p-3 border rounded-xl text-xs font-bold bg-white" required />
                    <div className="flex items-center gap-2 bg-white p-2 border rounded-xl">
                      <input type="color" value={v.hexColor} onChange={e => updateVariant(idx, 'hexColor', e.target.value)} className="w-6 h-6 rounded border-0" />
                      <span className="text-[10px] font-mono font-bold uppercase text-stone-400">{v.hexColor}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input value={v.size || ''} onChange={e => updateVariant(idx, 'size', e.target.value)} placeholder="Size" className="p-3 border rounded-xl text-xs font-bold bg-white" />
                    <input type="number" value={v.stock} onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value))} placeholder="Stock" className="p-3 border rounded-xl text-xs font-bold bg-white" required />
                    <input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', parseInt(e.target.value))} placeholder="Price" className="p-3 border rounded-xl text-xs font-bold bg-white" required />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button disabled={loading} className="w-full bg-stone-900 text-white py-6 rounded-2xl font-bold mt-12 hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-2xl">
          {loading ? <Loader2 className="animate-spin" /> : <span>Publish to Live Store</span>}
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
  switch (status) {
    case OrderStatus.PENDING_VERIFICATION: return 'bg-orange-50 text-orange-600 border border-orange-100';
    case OrderStatus.PROCESSING: return 'bg-green-50 text-green-600 border border-green-100';
    case OrderStatus.CANCELLED: return 'bg-stone-100 text-stone-400';
    default: return 'bg-stone-50 text-stone-500';
  }
};

export default AdminDashboard;
