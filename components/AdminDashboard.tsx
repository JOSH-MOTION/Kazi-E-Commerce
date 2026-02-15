
import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Clock, Package, AlertCircle, Ticket, Edit3, Save, X, Plus, Loader2, Trash2, Layers, CalendarClock, ChevronDown, ChevronUp, Zap, Check, Sparkles, Palette, Settings, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant, Category, Promotion, StoreSettings } from '../types';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { useAppContext } from '../context/AppContext';
import { uploadToCloudinary, optimizeImage } from '../cloudinary';

interface AdminDashboardProps {
  orders: Order[];
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'OS'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const { products, categories, promotions, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos' | 'categories' | 'settings'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const stats = {
    revenue: orders.filter(o => o.status !== OrderStatus.CANCELLED).reduce((sum, o) => sum + o.totalAmount, 0),
    pending: orders.filter(o => o.status === OrderStatus.PENDING_VERIFICATION).length,
    total: orders.length
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-10 relative w-full">
      <div className="w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-tighter">J&B Hub</h1>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[8px]">Proprietary Retail Control • Accra.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm overflow-x-auto scrollbar-hide">
            {[
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'inventory', label: 'Products', icon: Layers },
              { id: 'categories', label: 'Categories', icon: LayoutGrid },
              { id: 'promos', label: 'Promos', icon: Ticket },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-md' : 'text-stone-400 hover:text-stone-900'}`}
              >
                <tab.icon size={12} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard icon={<TrendingUp size={16} />} label="Gross Volume" value={`GH₵ ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<AlertCircle size={16} />} label="Awaiting Verification" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package size={16} />} label="Total Orders" value={stats.total.toString()} color="stone" />
        </div>

        {activeTab === 'orders' && <OrdersTable orders={orders} updateStatus={updateOrderStatus} />}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-stone-900 uppercase">Catalogue</h2>
              <button onClick={() => setIsAddingProduct(true)} className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 shadow-lg">
                <Plus size={12} /> Add Piece
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {products.length === 0 ? (
                <div className="py-20 bg-white rounded-2xl border border-stone-100 text-center text-stone-400">
                  <Package className="mx-auto mb-3 opacity-20" size={32} />
                  <p className="font-bold text-[9px] uppercase tracking-widest">No products yet</p>
                </div>
              ) : products.map(product => (
                <ProductAdminRow key={product.id} product={product} onEdit={() => setEditingProduct(product)} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && <CategoryManager categories={categories} />}
        {activeTab === 'promos' && <PromotionManager promotions={promotions} />}
        {activeTab === 'settings' && <StoreSettingsManager settings={settings} />}

        {(isAddingProduct || editingProduct) && <ProductForm product={editingProduct} onClose={() => { setIsAddingProduct(false); setEditingProduct(null); }} />}
      </div>
    </div>
  );
};

const ProductAdminRow = ({ product, onEdit }: any) => {
  const { categories } = useAppContext();
  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm group">
      <div className="w-12 h-14 bg-stone-50 rounded-lg overflow-hidden shrink-0">
        <img src={optimizeImage(product.images[0], 200)} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-stone-900 text-xs">{product.name}</h3>
        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
          {categories.find(c => c.id === product.categoryId)?.name} • {product.variants.length} Variants
        </p>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 text-stone-300 hover:text-stone-900 rounded-lg transition-all"><Edit3 size={16} /></button>
        <button onClick={async () => { if(confirm("Remove this piece?")) await deleteDoc(doc(db, 'products', product.id)); }} className="p-2 text-stone-200 hover:text-red-500 rounded-lg transition-all"><Trash2 size={16} /></button>
      </div>
    </div>
  );
};

const CategoryManager = ({ categories }: { categories: Category[] }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'categories'), { name, slug: name.toLowerCase().replace(/\s+/g, '-') });
      setName('');
    } catch (e) { alert("Error adding category"); }
    setSaving(false);
  };

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm space-y-8">
        <form onSubmit={addCategory} className="space-y-4">
          <Input label="New Category Name" value={name} onChange={setName} placeholder="e.g. Leather Goods" />
          <button disabled={saving} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-stone-800 shadow-lg transition-all active:scale-95">
            {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create Category'}
          </button>
        </form>
        <div className="space-y-2">
          <h4 className="text-[8px] font-bold uppercase text-stone-400 tracking-widest">Active Categories</h4>
          <div className="divide-y divide-stone-50">
            {categories.map(c => (
              <div key={c.id} className="py-3 flex justify-between items-center">
                <span className="font-bold text-stone-900 text-xs">{c.name}</span>
                <button onClick={() => deleteDoc(doc(db, 'categories', c.id))} className="text-stone-200 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PromotionManager = ({ promotions }: { promotions: Promotion[] }) => {
  const [form, setForm] = useState<Partial<Promotion>>({ code: '', value: 0, description: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setSaving(true);
    try {
      const url = await uploadToCloudinary(e.target.files[0]);
      setForm(prev => ({ ...prev, imageUrl: url }));
    } catch (e) { alert("Image upload failed"); }
    setSaving(false);
  };

  const addPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.code || !form.value) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'promotions'), {
        ...form, type: 'PERCENT', targetType: 'STORE', startDate: new Date().toISOString(), endDate: '2026-12-31'
      });
      setForm({ code: '', value: 0, description: '', imageUrl: '' });
    } catch (e) { alert("Error adding promo"); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm space-y-8">
        <form onSubmit={addPromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input label="Code" value={form.code} onChange={(v:any) => setForm({...form, code: v.toUpperCase()})} placeholder="SALE20" />
            <Input label="Value (%)" type="number" value={form.value} onChange={(v:any) => setForm({...form, value: parseInt(v) || 0})} />
            <Input label="Label" value={form.description} onChange={(v:any) => setForm({...form, description: v})} placeholder="Holiday Special" />
          </div>
          <div className="space-y-4">
            <label className="text-[8px] font-bold uppercase text-stone-400 tracking-widest block">Promo Visual</label>
            <div className="aspect-video bg-stone-50 rounded-xl border-2 border-dashed border-stone-100 relative overflow-hidden flex items-center justify-center group">
              {form.imageUrl ? (
                <img src={form.imageUrl} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto text-stone-200 mb-1" size={24} />
                  <span className="text-[7px] text-stone-300 font-bold uppercase">Upload Banner</span>
                </div>
              )}
              <input type="file" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <button disabled={saving} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-stone-800 shadow-lg">
              {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Deploy Promo'}
            </button>
          </div>
        </form>
        <div className="space-y-3 pt-6 border-t border-stone-50">
          <h4 className="text-[8px] font-bold uppercase text-stone-400 tracking-widest">Active Promos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {promotions.map(p => (
              <div key={p.id} className="p-3 bg-stone-50 rounded-xl flex items-center gap-3 border border-stone-100">
                {p.imageUrl && <img src={p.imageUrl} className="w-8 h-8 rounded-lg object-cover" />}
                <div className="flex-grow">
                  <span className="font-mono font-bold text-orange-600 text-[10px]">{p.code}</span>
                  <p className="text-[7px] text-stone-400 font-bold uppercase">{p.value}% OFF</p>
                </div>
                <button onClick={() => deleteDoc(doc(db, 'promotions', p.id))} className="text-stone-200 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreSettingsManager = ({ settings }: { settings: StoreSettings | null }) => {
  const [text, setText] = useState(settings?.tickerText || '');
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { tickerText: text, isTickerActive: true }, { merge: true });
      alert("Storefront updated.");
    } catch (e) { alert("Error saving settings"); }
    setSaving(false);
  };

  return (
    <div className="max-w-xl">
      <div className="bg-stone-900 rounded-2xl p-8 text-white shadow-xl space-y-6">
        <h3 className="text-lg font-serif font-bold uppercase">Announcement Ticker</h3>
        <textarea 
          value={text} onChange={e => setText(e.target.value)}
          className="w-full h-32 bg-stone-800 border border-stone-700 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-orange-500"
          placeholder="New arrivals coming soon..."
        />
        <button onClick={saveSettings} disabled={saving} className="w-full py-4 bg-white text-stone-900 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-orange-400 hover:text-white transition-all">
          {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Publish to Live'}
        </button>
      </div>
    </div>
  );
};

const ProductForm = ({ product, onClose }: { product: Product | null, onClose: () => void }) => {
  const { categories } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(product?.variants || []);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [newColor, setNewColor] = useState({ name: '', hex: '#1a1a1a' });
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    basePrice: product?.basePrice || 0,
    isFeatured: product?.isFeatured || false
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLoading(true);
    try {
      const url = await uploadToCloudinary(e.target.files[0]);
      setImages(prev => [...prev, url]);
    } catch (e) { alert("Upload error"); }
    setLoading(false);
  };

  const generateVariants = () => {
    if (!newColor.name) {
      alert("Name your colorway first.");
      return;
    }

    const sizesToAdd = selectedSizes.length > 0 ? selectedSizes : ['No Size'];

    const newBatch = sizesToAdd.map(size => ({
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sku: `${form.name.slice(0, 2).toUpperCase()}-${newColor.name.slice(0, 2).toUpperCase()}-${size.slice(0, 2).toUpperCase()}`,
      colorName: newColor.name,
      hexColor: newColor.hex,
      size: size === 'No Size' ? undefined : size,
      price: form.basePrice,
      stock: 0,
      leadTime: '',
      isComingSoon: false
    }));

    setVariants(prev => [...prev, ...newBatch]);
    setSelectedSizes([]);
    setNewColor({ name: '', hex: '#1a1a1a' });
  };

  const groupedVariants = useMemo<Record<string, any[]>>(() => {
    const groups: Record<string, any[]> = {};
    variants.forEach((v, idx) => {
      const colorKey = v.colorName || 'Default';
      if (!groups[colorKey]) groups[colorKey] = [];
      groups[colorKey].push({ ...v, originalIndex: idx });
    });
    return groups;
  }, [variants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Add at least one photo.");
    if (variants.length === 0) return alert("Add at least one colorway.");
    
    setLoading(true);
    try {
      if (product) await updateDoc(doc(db, 'products', product.id), { ...form, images, variants });
      else await addDoc(collection(db, 'products'), { ...form, images, variants });
      onClose();
    } catch (e) { alert("Save error"); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <header className="p-6 border-b border-stone-50 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 uppercase tracking-tighter">{product ? 'Edit Item' : 'Create Piece'}</h3>
            <p className="text-[7px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Iterative Piece Builder.</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900 transition-colors"><X size={20} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-10 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input label="Name" value={form.name} onChange={(v:any) => setForm({...form, name: v})} placeholder="Woven Tote" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold uppercase text-stone-400 block tracking-widest">Category</label>
                  <select className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-xs" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Input label="Base Price" type="number" value={form.basePrice} onChange={(v:any) => setForm({...form, basePrice: parseInt(v) || 0})} />
              </div>
              <div className="space-y-2">
                <label className="text-[8px] font-bold uppercase text-stone-400 block tracking-widest">Description</label>
                <textarea className="w-full h-24 p-4 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-xs resize-none" placeholder="Details..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[8px] font-bold uppercase text-stone-400 block tracking-widest">Gallery</label>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden relative group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <label className="aspect-[4/5] bg-stone-50 border border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-stone-900 transition-all">
                  <Plus size={18} className="text-stone-300 mb-1" />
                  <span className="text-[7px] font-bold text-stone-400 uppercase">Upload</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 text-white space-y-6 shadow-xl">
             <div className="flex items-center gap-3">
                <Palette className="text-orange-500" size={20} />
                <h4 className="text-sm font-serif font-bold uppercase tracking-tight">Colorway Batcher</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-4">
                   <Input label="Name" value={newColor.name} onChange={v => setNewColor({...newColor, name: v})} placeholder="Midnight" />
                   <div className="flex items-center gap-3">
                      <input type="color" className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none p-0 overflow-hidden" value={newColor.hex} onChange={e => setNewColor({...newColor, hex: e.target.value})} />
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{newColor.hex}</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[8px] font-bold uppercase text-stone-500 block tracking-widest">Sizes (Optional)</label>
                   <div className="flex flex-wrap gap-1.5">
                      {STANDARD_SIZES.map(s => (
                        <button key={s} type="button" onClick={() => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${selectedSizes.includes(s) ? 'bg-orange-600 text-white border-orange-600' : 'bg-stone-800 text-stone-500 border-stone-700'}`}>{s}</button>
                      ))}
                   </div>
                </div>
                <button type="button" onClick={generateVariants} disabled={!newColor.name} className="w-full py-3 bg-white text-stone-900 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-orange-600 hover:text-white transition-all disabled:opacity-20">Append Colorway</button>
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-serif font-bold text-stone-900 pb-2 border-b border-stone-50 uppercase tracking-tight">Piece Inventory</h4>
            {Object.keys(groupedVariants).length === 0 ? (
              <p className="text-[8px] text-stone-300 uppercase tracking-widest text-center py-10">Use Batcher to add variants.</p>
            ) : (
              <div className="space-y-8">
                {(Object.entries(groupedVariants) as [string, any[]][]).map(([color, colorVariants]) => (
                  <div key={color} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorVariants[0].hexColor }} />
                      <h5 className="font-bold text-[10px] uppercase text-stone-900 tracking-widest">{color}</h5>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {colorVariants.map((v: any) => (
                        <div key={v.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 relative group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[14px] font-bold text-stone-900">{v.size || 'STD'}</span>
                            <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== v.originalIndex))} className="text-stone-200 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input label="Stock" type="number" value={v.stock} onChange={val => updateVariant(v.originalIndex, { stock: parseInt(val) || 0 })} />
                            <Input label="Price" type="number" value={v.price} onChange={val => updateVariant(v.originalIndex, { price: parseInt(val) || 0 })} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 flex gap-4 z-[2000]">
            <button type="button" onClick={onClose} className="flex-grow py-4 bg-white border border-stone-100 rounded-xl font-bold text-[9px] text-stone-400 uppercase tracking-widest shadow-xl">Cancel</button>
            <button disabled={loading || images.length === 0 || variants.length === 0} className="flex-[2] py-4 bg-stone-900 text-white rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} /> Commit Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  function updateVariant(idx: number, updates: Partial<ProductVariant>) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...updates } : v));
  }
};

const OrdersTable = ({ orders, updateStatus }: { orders: Order[], updateStatus: any }) => (
  <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm w-full">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[10px]">
        <thead className="bg-stone-50/50 border-b border-stone-50">
          <tr>
            <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Ref</th>
            <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Customer</th>
            <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Amount</th>
            <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Status</th>
            <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-stone-50/20 transition-colors">
              <td className="px-6 py-4 font-mono font-bold text-stone-300">#{order.id.slice(-6).toUpperCase()}</td>
              <td className="px-6 py-4">
                <p className="font-bold text-stone-900">{order.customerName}</p>
                <p className="text-[8px] opacity-40 uppercase">{order.customerPhone}</p>
              </td>
              <td className="px-6 py-4 font-bold">GH₵ {order.totalAmount.toLocaleString()}</td>
              <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
              <td className="px-6 py-4">
                <select className="bg-stone-50 border border-stone-50 rounded px-2 py-1 outline-none text-[8px] font-bold uppercase" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}>
                  {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, color }: any) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600 border-orange-50',
    blue: 'bg-blue-50 text-blue-600 border-blue-50',
    stone: 'bg-stone-50 text-stone-600 border-stone-100'
  };
  return (
    <div className={`p-6 rounded-2xl border ${colors[color as keyof typeof colors]} flex items-center gap-4`}>
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">{icon}</div>
      <div>
        <p className="text-[7px] font-bold uppercase tracking-widest opacity-60 mb-0.5">{label}</p>
        <h3 className="text-xl font-serif font-bold">{value}</h3>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    [OrderStatus.PENDING_VERIFICATION]: 'bg-orange-50 text-orange-600',
    [OrderStatus.PROCESSING]: 'bg-blue-50 text-blue-600',
    [OrderStatus.SHIPPED]: 'bg-indigo-50 text-indigo-600',
    [OrderStatus.DELIVERED]: 'bg-green-50 text-green-600',
    [OrderStatus.CANCELLED]: 'bg-stone-50 text-stone-300',
    [OrderStatus.PENDING_PAYMENT]: 'bg-yellow-50 text-yellow-600'
  };
  return <span className={`px-2 py-1 rounded text-[7px] font-bold uppercase tracking-widest ${styles[status]}`}>{status.replace('_', ' ')}</span>;
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-1.5">
    <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest block">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-stone-900 text-[11px] placeholder:text-stone-200 shadow-sm" />
  </div>
);

export default AdminDashboard;
