
import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, Package, AlertCircle, Ticket, Edit3, Save, X, Plus, Loader2, Trash2, Layers, CalendarClock, ChevronDown, ChevronUp, Zap, Check, Sparkles, Palette } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant } from '../types';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { useAppContext } from '../context/AppContext';
import { uploadToCloudinary, optimizeImage } from '../cloudinary';

interface AdminDashboardProps {
  orders: Order[];
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'OS'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders }) => {
  const { products, categories } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos' | 'categories'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const deleteProduct = async (id: string) => {
    if (confirm("Permanently delete this item?")) {
      await deleteDoc(doc(db, 'products', id));
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
          <StatCard icon={<TrendingUp size={20} />} label="Total Revenue" value={`GH₵ ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<AlertCircle size={20} />} label="MoMo Verification Pending" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package size={20} />} label="Collection Volume" value={stats.total.toString()} color="stone" />
        </div>

        {activeTab === 'orders' && <OrdersTable orders={orders} updateStatus={updateOrderStatus} />}

        {activeTab === 'inventory' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold">Catalogue Management</h2>
              <button 
                onClick={() => setIsAddingProduct(true)}
                className="bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-stone-800 transition-all"
              >
                <Plus size={14} /> Add New Item
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {products.map(product => (
                <ProductAdminRow 
                  key={product.id} 
                  product={product} 
                  onEdit={() => setEditingProduct(product)}
                  onDelete={() => deleteProduct(product.id)}
                  editingStock={editingStock}
                  setEditingStock={setEditingStock}
                  updateStock={updateStock}
                  saving={saving}
                />
              ))}
            </div>
          </div>
        )}

        {(isAddingProduct || editingProduct) && (
          <ProductForm 
            product={editingProduct} 
            onClose={() => { setIsAddingProduct(false); setEditingProduct(null); }} 
          />
        )}
      </div>
    </div>
  );
};

const ProductAdminRow = ({ product, onEdit, onDelete, editingStock, setEditingStock, updateStock, saving }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { categories } = useAppContext();
  
  return (
    <div className="bg-white border border-stone-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6 flex flex-col md:flex-row items-center gap-6">
        <img src={optimizeImage(product.images[0], 200)} className="w-20 h-24 object-cover rounded-xl" />
        <div className="flex-grow">
          <h3 className="font-bold text-stone-900 mb-1">{product.name}</h3>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            {categories.find(c => c.id === product.categoryId)?.name || 'Uncategorized'} • {product.variants?.length || 0} Variants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onEdit} className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all">
            <Edit3 size={18} />
          </button>
          <button onClick={onDelete} className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <Trash2 size={18} />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-stone-50 bg-stone-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {product.variants?.map((v: ProductVariant) => (
              <div key={v.id} className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{v.colorName} / {v.size || 'OS'}</span>
                    <p className="font-bold text-stone-900">GH₵ {v.price}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-stone-200" style={{ backgroundColor: v.hexColor }} />
                </div>
                
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Inventory</label>
                    {v.stock > 0 ? (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-green-600 uppercase"><Zap size={8} fill="currentColor"/> Instant</span>
                    ) : v.leadTime ? (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-orange-600 uppercase"><CalendarClock size={8}/> Pre-order</span>
                    ) : (
                      <span className="text-[8px] font-bold text-stone-300 uppercase">Out of Stock</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number"
                      placeholder="Stock"
                      value={editingStock?.variantId === v.id ? editingStock.value : v.stock}
                      onChange={(e) => setEditingStock({ productId: product.id, variantId: v.id, value: e.target.value })}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold outline-none focus:border-stone-900 transition-all"
                    />
                    {editingStock?.variantId === v.id && (
                      <button 
                        onClick={updateStock}
                        disabled={saving}
                        className="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
    } catch (err) {
      alert("Image upload failed");
    } finally {
      setLoading(false);
    }
  };

  const generateVariants = () => {
    if (!newColor.name || selectedSizes.length === 0) {
      alert("Please enter a color name and select at least one size.");
      return;
    }

    const newBatch = selectedSizes.map(size => ({
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sku: `${form.name.slice(0, 3).toUpperCase()}-${newColor.name.slice(0, 3).toUpperCase()}-${size}`,
      colorName: newColor.name,
      hexColor: newColor.hex,
      size: size,
      price: form.basePrice,
      stock: 0,
      isComingSoon: false,
      leadTime: ''
    }));

    setVariants([...variants, ...newBatch]);
    // Reset generator for the next color
    setSelectedSizes([]);
    setNewColor({ name: '', hex: '#1a1a1a' });
  };

  const updateVariant = (idx: number, updates: Partial<ProductVariant>) => {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, ...updates } : v));
  };

  const groupedVariants = useMemo(() => {
    const groups: Record<string, Partial<ProductVariant>[]> = {};
    variants.forEach((v, idx) => {
      const colorKey = v.colorName || 'Default';
      if (!groups[colorKey]) groups[colorKey] = [];
      groups[colorKey].push({ ...v, originalIndex: idx } as any);
    });
    return groups;
  }, [variants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) return alert("Please upload at least one image.");
    setLoading(true);
    try {
      const payload = { ...form, images, variants };
      if (product) {
        await updateDoc(doc(db, 'products', product.id), payload);
      } else {
        await addDoc(collection(db, 'products'), payload);
      }
      onClose();
    } catch (err) {
      alert("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  };

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-300">
        <header className="p-8 border-b border-stone-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-2xl font-serif font-bold">{product ? 'Edit Product' : 'New Collection Item'}</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Easily add multiple colors and sizes for each garment.</p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors"><X size={24} /></button>
        </header>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Section 1: Basic Info & Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <Input label="Product Name" value={form.name} onChange={(v:any) => setForm({...form, name: v})} placeholder="e.g. Linen Wrap Dress" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Category</label>
                  <select 
                    className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-stone-900 transition-all font-bold text-stone-900"
                    value={form.categoryId}
                    onChange={e => setForm({...form, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <Input label="Global Base Price (GH₵)" type="number" value={form.basePrice} onChange={(v:any) => setForm({...form, basePrice: parseInt(v) || 0})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Description</label>
                <textarea 
                  className="w-full h-32 p-6 bg-stone-50 border border-stone-200 rounded-[2rem] outline-none focus:border-stone-900 transition-all font-bold text-stone-900 resize-none"
                  placeholder="The story behind this piece..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Product Gallery</label>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden group border border-stone-100">
                    <img src={optimizeImage(img, 400)} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(images.filter((_, i) => i !== idx))} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-[3/4] bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-all group">
                  <Plus size={24} className="text-stone-300 mb-2 group-hover:scale-125 transition-transform" />
                  <span className="text-[8px] font-bold uppercase text-stone-400">Add Photo</span>
                  <input type="file" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Variant Generator (For Adding Multiple Colors) */}
          <div className="bg-stone-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Palette size={120} />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Plus size={20} />
              </div>
              <div>
                <h4 className="text-xl font-serif font-bold">Add Colorway & Sizes</h4>
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mt-1">You can add multiple colors by repeating this step.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-stone-500 tracking-[0.2em] block">1. Identify Color</label>
                  <input 
                    type="text" 
                    value={newColor.name} 
                    onChange={e => setNewColor({...newColor, name: e.target.value})} 
                    placeholder="e.g. Royal Blue"
                    className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-orange-500 transition-all shadow-inner"
                  />
                  <div className="flex items-center gap-4 mt-4">
                    <input 
                      type="color" 
                      className="w-14 h-14 rounded-2xl cursor-pointer bg-transparent border-none" 
                      value={newColor.hex} 
                      onChange={e => setNewColor({...newColor, hex: e.target.value})} 
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Selected Hex</span>
                      <span className="text-xs font-mono text-white">{newColor.hex.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-stone-500 tracking-[0.2em] block">2. Select Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map(size => (
                      <button 
                        key={size} type="button" 
                        onClick={() => toggleSize(size)}
                        className={`px-5 py-3 rounded-xl text-xs font-bold border-2 transition-all ${selectedSizes.includes(size) ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <button 
                  type="button" 
                  onClick={generateVariants}
                  disabled={!newColor.name || selectedSizes.length === 0}
                  className="w-full py-5 bg-white text-stone-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl disabled:opacity-20 disabled:cursor-not-allowed group"
                >
                  <span className="flex items-center justify-center gap-3">
                    <Check size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    Add {selectedSizes.length} Variants to List
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Defined Variants (Grouped by Color) */}
          <div className="space-y-8">
            <div className="flex justify-between items-end border-b border-stone-100 pb-4">
              <div>
                <h4 className="text-2xl font-serif font-bold text-stone-900">Catalogue Breakdown ({variants.length})</h4>
                <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest mt-1">Review colors, adjust stock, or set pre-order lead times.</p>
              </div>
              {variants.length > 0 && (
                <button type="button" onClick={() => setVariants([])} className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">Remove All Variants</button>
              )}
            </div>

            {Object.keys(groupedVariants).length === 0 ? (
              <div className="py-24 bg-stone-50 rounded-[3rem] border border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <Layers size={32} strokeWidth={1} />
                </div>
                <p className="font-bold text-stone-900 mb-1">List is currently empty.</p>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Add your first color using the generator above.</p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedVariants).map(([colorName, colorVariants]) => (
                  <div key={colorName} className="space-y-6 animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-lg border border-stone-200 shadow-sm" style={{ backgroundColor: (colorVariants[0] as any).hexColor }} />
                      <h5 className="font-serif font-bold text-xl text-stone-900">{colorName}</h5>
                      <span className="px-3 py-1 bg-stone-100 rounded-full text-[9px] font-bold uppercase text-stone-500 tracking-widest">{colorVariants.length} Sizes</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {colorVariants.map((v: any) => (
                        <div key={v.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-md transition-shadow relative group/card">
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Size</span>
                              <p className="text-2xl font-bold text-stone-900">{v.size}</p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setVariants(variants.filter((_, i) => i !== v.originalIndex))} 
                              className="p-2 text-stone-200 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Current Stock</label>
                                <input 
                                  type="number" 
                                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-all" 
                                  value={v.stock} 
                                  onChange={e => updateVariant(v.originalIndex, {stock: parseInt(e.target.value) || 0})} 
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className="text-[9px] font-bold uppercase text-stone-400 tracking-widest">Price (GH₵)</label>
                                <input 
                                  type="number" 
                                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-all" 
                                  value={v.price} 
                                  onChange={e => updateVariant(v.originalIndex, {price: parseInt(e.target.value) || 0})} 
                                />
                              </div>
                            </div>

                            <div className="pt-4 border-t border-stone-50 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[9px] font-bold uppercase text-stone-900 tracking-widest flex items-center gap-2">
                                  <CalendarClock size={12} className="text-orange-500" /> Pre-order Settings
                                </label>
                                {v.leadTime && v.stock === 0 && (
                                  <span className="flex items-center gap-1 text-[8px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">Active</span>
                                )}
                              </div>
                              <input 
                                className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl text-xs font-bold outline-none focus:border-stone-900 transition-all placeholder:text-stone-300" 
                                placeholder="e.g. 7 days" 
                                value={v.leadTime} 
                                onChange={e => updateVariant(v.originalIndex, {leadTime: e.target.value})} 
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={form.isFeatured} 
                  onChange={e => setForm({...form, isFeatured: e.target.checked})}
                  className="w-6 h-6 rounded-lg border-2 border-stone-200 text-stone-900 focus:ring-stone-900 cursor-pointer"
                />
                <span className="text-[10px] font-bold uppercase text-stone-400 group-hover:text-stone-900 transition-colors tracking-widest">Pin to Homepage</span>
              </label>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
              <button type="button" onClick={onClose} className="px-10 py-5 font-bold text-stone-400 hover:text-stone-900 transition-all">Discard</button>
              <button 
                disabled={loading || images.length === 0}
                className="flex-grow md:flex-grow-0 px-16 py-5 bg-stone-900 text-white rounded-2xl font-bold hover:bg-stone-800 disabled:opacity-50 shadow-2xl shadow-stone-900/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Deploy to Catalogue</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrdersTable = ({ orders, updateStatus }: { orders: Order[], updateStatus: any }) => (
  <div className="bg-white border border-stone-200 rounded-[2.5rem] overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50/50">
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Order ID</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Customer</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Amount</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Status</th>
            <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-stone-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-stone-50/30 transition-colors">
              <td className="px-8 py-6">
                <span className="font-mono text-xs font-bold text-stone-400">#{order.id.slice(-6).toUpperCase()}</span>
                <p className="text-[10px] text-stone-300 mt-1">{new Date(order.createdAt).toLocaleDateString()}</p>
              </td>
              <td className="px-8 py-6">
                <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
                <p className="text-[10px] text-stone-400 mt-1">{order.customerPhone}</p>
              </td>
              <td className="px-8 py-6 font-bold text-stone-900">GH₵ {order.totalAmount.toLocaleString()}</td>
              <td className="px-8 py-6">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-8 py-6">
                <select 
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-stone-900 transition-all"
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                >
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
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    stone: 'bg-stone-100 text-stone-600 border-stone-200'
  };
  return (
    <div className={`p-8 rounded-[2.5rem] border ${colors[color as keyof typeof colors]} shadow-sm`}>
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
      <h3 className="text-3xl font-serif font-bold tracking-tight">{value}</h3>
    </div>
  );
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const styles = {
    [OrderStatus.PENDING_VERIFICATION]: 'bg-orange-50 text-orange-600',
    [OrderStatus.PROCESSING]: 'bg-blue-50 text-blue-600',
    [OrderStatus.SHIPPED]: 'bg-indigo-50 text-indigo-600',
    [OrderStatus.DELIVERED]: 'bg-green-50 text-green-600',
    [OrderStatus.CANCELLED]: 'bg-stone-50 text-stone-400',
    [OrderStatus.PENDING_PAYMENT]: 'bg-yellow-50 text-yellow-600'
  };
  return (
    <span className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl outline-none focus:border-stone-900 transition-all font-bold text-stone-900 placeholder:text-stone-200 shadow-inner"
    />
  </div>
);

export default AdminDashboard;
