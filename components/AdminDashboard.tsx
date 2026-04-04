
import React, { useState, useMemo, useEffect } from 'react';
import { TrendingUp, Clock, Package, AlertCircle, Ticket, Edit3, Save, X, Plus, Loader2, Trash2, Layers, CalendarClock, ChevronDown, ChevronUp, Zap, Check, Sparkles, Palette, Settings, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { Order, OrderStatus, Product, ProductVariant, Category, Promotion, StoreSettings, ManualSale, InventoryProduct, Expense } from '../types';
import { db } from '../firebase';
import { updateDoc, doc, addDoc, collection, deleteDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { uploadToCloudinary, optimizeImage } from '../cloudinary';
import { MessageCircle, DollarSign, BarChart3, ExternalLink } from 'lucide-react';
import { MOMO_CONFIG } from '../constants';

interface AdminDashboardProps {
  orders: Order[];
  manualSales: ManualSale[];
  inventoryProducts: InventoryProduct[];
  expenses: Expense[];
}

const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'OS'];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orders, manualSales, inventoryProducts, expenses }) => {
  const { products, categories, promotions, settings } = useAppContext();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'promos' | 'categories' | 'settings' | 'manual' | 'inventoryTracking'>('orders');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const stats = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== OrderStatus.CANCELLED);
    const onlineRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    // Calculate online profit
    const onlineProfit = validOrders.reduce((sum, order) => {
      const orderProfit = order.items.reduce((itemSum, item) => {
        const product = products.find(p => p.id === item.productId);
        const variant = product?.variants.find(v => v.id === item.variantId);
        if (variant) {
          return itemSum + (variant.price - (variant.costPrice || 0)) * item.quantity;
        }
        return itemSum;
      }, 0);
      return sum + orderProfit;
    }, 0);

    const manualRevenue = manualSales.reduce((sum, s) => sum + s.salePrice * s.quantity, 0);
    const manualProfit = manualSales.reduce((sum, s) => sum + s.profit, 0);

    return {
      revenue: onlineRevenue + manualRevenue,
      profit: onlineProfit + manualProfit,
      pending: orders.filter(o => o.status === OrderStatus.PENDING_VERIFICATION).length,
      total: orders.length + manualSales.length
    };
  }, [orders, manualSales, products]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen p-4 md:p-10 relative w-full">
      <div className="w-full">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-tighter">Cartly Hub</h1>
            <p className="text-stone-400 font-bold uppercase tracking-widest text-[8px]">Proprietary Retail Control • Accra.</p>
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-stone-200 shadow-sm overflow-x-auto scrollbar-hide">
            {[
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'inventory', label: 'Products', icon: Layers },
              { id: 'categories', label: 'Categories', icon: LayoutGrid },
              { id: 'promos', label: 'Promos', icon: Ticket },
              { id: 'manual', label: 'Manual Sales', icon: MessageCircle },
              { id: 'inventoryTracking', label: 'Inventory Tracking', icon: BarChart3 },
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

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <StatCard icon={<TrendingUp size={16} />} label="Gross Volume" value={`GH₵ ${stats.revenue.toLocaleString()}`} color="orange" />
          <StatCard icon={<DollarSign size={16} />} label="Est. Profit" value={`GH₵ ${stats.profit.toLocaleString()}`} color="green" />
          <StatCard icon={<AlertCircle size={16} />} label="Awaiting Verification" value={stats.pending.toString()} color="blue" />
          <StatCard icon={<Package size={16} />} label="Total Sales" value={stats.total.toString()} color="stone" />
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
        { activeTab === 'manual' && <ManualSalesManager manualSales={manualSales} /> }
        { activeTab === 'inventoryTracking' && <InventoryTracker inventoryProducts={inventoryProducts} manualSales={manualSales} expenses={expenses} /> }
        { activeTab === 'settings' && <StoreSettingsManager settings={settings} /> }

        {(isAddingProduct || editingProduct) && <ProductForm product={editingProduct} onClose={() => { setIsAddingProduct(false); setEditingProduct(null); }} />}
      </div>
    </div>
  );
};

const ProductAdminRow = ({ product, onEdit }: any) => {
  const { categories } = useAppContext();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to remove "${product.name}"? This cannot be undone.`)) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'products', product.id));
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(`Failed to delete product: ${err.message || 'Unknown error'}`);
    }
    setIsDeleting(false);
  };

  return (
    <div className="bg-white border border-stone-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm group">
      <div className="w-12 h-14 bg-stone-50 rounded-lg overflow-hidden shrink-0">
        <img src={optimizeImage(product.images?.[0], 200)} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-stone-900 text-xs">{product.name}</h3>
        <p className="text-[8px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">
          {categories.find(c => c.id === product.categoryId)?.name} • {product.variants?.length || 0} Variants
        </p>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} disabled={isDeleting} className="p-2 text-stone-300 hover:text-stone-900 rounded-lg transition-all disabled:opacity-30">
          <Edit3 size={16} />
        </button>
        <button 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="p-2 text-stone-200 hover:text-red-500 rounded-lg transition-all disabled:opacity-30"
        >
          {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        </button>
      </div>
    </div>
  );
};

const CategoryManager = ({ categories }: { categories: Category[] }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Delete category "${categoryName}"? This will not remove products in this category, but they will become uncategorized.`)) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err: any) {
      console.error("Delete category error:", err);
      alert(`Failed to delete category: ${err.message}`);
    }
    setDeletingId(null);
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
                <button 
                  onClick={() => handleDelete(c.id, c.name)} 
                  disabled={deletingId === c.id}
                  className="text-stone-200 hover:text-red-500 disabled:opacity-30 transition-all"
                >
                  {deletingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
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

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Remove promotion "${code}"?`)) return;
    try {
      await deleteDoc(doc(db, 'promotions', id));
    } catch (err: any) {
      alert(`Failed to delete promotion: ${err.message}`);
    }
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
                <button onClick={() => handleDelete(p.id, p.code || '')} className="text-stone-200 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreSettingsManager = ({ settings }: { settings: StoreSettings | null }) => {
  const [form, setForm] = useState({
    tickerText: settings?.tickerText || '',
    heroTitle: settings?.heroTitle || "MEN'S FASHION",
    heroSubtitle: settings?.heroSubtitle || "Min. 35-70% Off",
    heroImage: settings?.heroImage || "https://images.unsplash.com/photo-1519085185758-2ad98035527e?auto=format&fit=crop&q=80&w=1000",
    heroCtaText: settings?.heroCtaText || "Shop Now",
    heroSecondaryCtaText: settings?.heroSecondaryCtaText || "Read More",
    banner1Title: settings?.banner1Title || "Women's Wear",
    banner1Subtitle: settings?.banner1Subtitle || "Min. 35-70% Off",
    banner1Image: settings?.banner1Image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    banner2Title: settings?.banner2Title || "Men's Fashion",
    banner2Subtitle: settings?.banner2Subtitle || "Flat 70% Off",
    banner2Image: settings?.banner2Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800",
    // Promo Grid
    promo1Title: settings?.promo1Title || "Women's Style",
    promo1Subtitle: settings?.promo1Subtitle || "Up to 70% Off",
    promo1Image: settings?.promo1Image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
    promo1Badge: settings?.promo1Badge || "New Arrivals",
    promo1Link: settings?.promo1Link || "",
    promo2Title: settings?.promo2Title || "Men's Fashion",
    promo2Subtitle: settings?.promo2Subtitle || "Flat 50% Off",
    promo2Image: settings?.promo2Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800",
    promo2Badge: settings?.promo2Badge || "Trending Now",
    promo2Link: settings?.promo2Link || "",
    promo3Title: settings?.promo3Title || "Handbag",
    promo3Subtitle: settings?.promo3Subtitle || "Shop Now",
    promo3Image: settings?.promo3Image || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
    promo3Badge: settings?.promo3Badge || "25% Off",
    promo3Link: settings?.promo3Link || "",
    promo4Title: settings?.promo4Title || "Watch",
    promo4Subtitle: settings?.promo4Subtitle || "Shop Now",
    promo4Image: settings?.promo4Image || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
    promo4Badge: settings?.promo4Badge || "45% Off",
    promo4Link: settings?.promo4Link || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        tickerText: settings.tickerText || '',
        heroTitle: settings.heroTitle || "MEN'S FASHION",
        heroSubtitle: settings.heroSubtitle || "Min. 35-70% Off",
        heroImage: settings.heroImage || "https://images.unsplash.com/photo-1519085185758-2ad98035527e?auto=format&fit=crop&q=80&w=1000",
        heroCtaText: settings.heroCtaText || "Shop Now",
        heroSecondaryCtaText: settings.heroSecondaryCtaText || "Read More",
        banner1Title: settings.banner1Title || "Women's Wear",
        banner1Subtitle: settings.banner1Subtitle || "Min. 35-70% Off",
        banner1Image: settings.banner1Image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
        banner2Title: settings.banner2Title || "Men's Fashion",
        banner2Subtitle: settings.banner2Subtitle || "Flat 70% Off",
        banner2Image: settings.banner2Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800",
        promo1Title: settings.promo1Title || "Women's Style",
        promo1Subtitle: settings.promo1Subtitle || "Up to 70% Off",
        promo1Image: settings.promo1Image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        promo1Badge: settings.promo1Badge || "New Arrivals",
        promo1Link: settings.promo1Link || "",
        promo2Title: settings.promo2Title || "Men's Fashion",
        promo2Subtitle: settings.promo2Subtitle || "Flat 50% Off",
        promo2Image: settings.promo2Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800",
        promo2Badge: settings.promo2Badge || "Trending Now",
        promo2Link: settings.promo2Link || "",
        promo3Title: settings.promo3Title || "Handbag",
        promo3Subtitle: settings.promo3Subtitle || "Shop Now",
        promo3Image: settings.promo3Image || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
        promo3Badge: settings.promo3Badge || "25% Off",
        promo3Link: settings.promo3Link || "",
        promo4Title: settings.promo4Title || "Watch",
        promo4Subtitle: settings.promo4Subtitle || "Shop Now",
        promo4Image: settings.promo4Image || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
        promo4Badge: settings.promo4Badge || "45% Off",
        promo4Link: settings.promo4Link || "",
      });
    }
  }, [settings]);

  const handleUpload = async (field: string, file: File) => {
    setSaving(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(prev => ({ ...prev, [field]: url }));
    } catch (e) { alert("Upload failed"); }
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store_config'), { ...form, isTickerActive: true }, { merge: true });
      alert("Storefront updated successfully.");
    } catch (e) { alert("Error saving settings"); }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="bg-white border border-stone-100 rounded-2xl p-8 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <h3 className="text-lg font-serif font-bold uppercase text-stone-900">Storefront Customization</h3>
             <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Don't forget to publish your changes to make them live</p>
           </div>
           <button onClick={saveSettings} disabled={saving} className="px-8 py-3 bg-[#0052D4] text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-[#004aad] transition-all shadow-lg">
            {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Publish Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ticker & Hero */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase text-stone-400 tracking-widest border-b border-stone-50 pb-2">Announcement & Hero</h4>
            <div className="space-y-4">
              <Input label="Ticker Message" value={form.tickerText} onChange={(v: string) => setForm({...form, tickerText: v})} />
              <Input label="Hero Title" value={form.heroTitle} onChange={(v: string) => setForm({...form, heroTitle: v})} />
              <Input label="Hero Subtitle" value={form.heroSubtitle} onChange={(v: string) => setForm({...form, heroSubtitle: v})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Primary CTA" value={form.heroCtaText} onChange={(v: string) => setForm({...form, heroCtaText: v})} />
                <Input label="Secondary CTA" value={form.heroSecondaryCtaText} onChange={(v: string) => setForm({...form, heroSecondaryCtaText: v})} />
              </div>
              <div className="space-y-2">
                <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest block">Hero Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-stone-50 border border-stone-100 overflow-hidden shrink-0">
                    <img src={form.heroImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="flex-grow h-10 border-2 border-dashed border-stone-100 rounded-xl flex items-center justify-center cursor-pointer hover:border-stone-900 transition-all">
                    <span className="text-[8px] font-bold uppercase text-stone-400">
                      {saving ? 'Uploading...' : 'Change Image'}
                    </span>
                    <input type="file" className="hidden" disabled={saving} onChange={e => e.target.files?.[0] && handleUpload('heroImage', e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Banners */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase text-stone-400 tracking-widest border-b border-stone-50 pb-2">Bottom Banners</h4>
            <div className="space-y-6">
              {/* Banner 1 */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-4">
                <p className="text-[8px] font-bold uppercase text-stone-300">Banner Left</p>
                <Input label="Title" value={form.banner1Title} onChange={(v: string) => setForm({...form, banner1Title: v})} />
                <Input label="Subtitle" value={form.banner1Subtitle} onChange={(v: string) => setForm({...form, banner1Subtitle: v})} />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0">
                    <img src={form.banner1Image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="flex-grow h-8 border border-dashed border-stone-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-stone-900 transition-all bg-white">
                    <span className="text-[7px] font-bold uppercase text-stone-400">Upload</span>
                    <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('banner1Image', e.target.files[0])} />
                  </label>
                </div>
              </div>

              {/* Banner 2 */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-4">
                <p className="text-[8px] font-bold uppercase text-stone-300">Banner Right</p>
                <Input label="Title" value={form.banner2Title} onChange={(v: string) => setForm({...form, banner2Title: v})} />
                <Input label="Subtitle" value={form.banner2Subtitle} onChange={(v: string) => setForm({...form, banner2Subtitle: v})} />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0">
                    <img src={form.banner2Image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="flex-grow h-8 border border-dashed border-stone-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-stone-900 transition-all bg-white">
                    <span className="text-[7px] font-bold uppercase text-stone-400">Upload</span>
                    <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload('banner2Image', e.target.files[0])} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Promo Grid Customization */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold uppercase text-stone-400 tracking-widest border-b border-stone-50 pb-2">Promo Grid (4 Banners)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(num => (
              <div key={num} className="p-6 bg-stone-50 rounded-2xl space-y-4">
                <p className="text-[8px] font-bold uppercase text-stone-300">Promo Banner {num}</p>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Title" value={(form as any)[`promo${num}Title`]} onChange={(v: string) => setForm({...form, [`promo${num}Title`]: v})} />
                  <Input label="Subtitle" value={(form as any)[`promo${num}Subtitle`]} onChange={(v: string) => setForm({...form, [`promo${num}Subtitle`]: v})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Badge" value={(form as any)[`promo${num}Badge`]} onChange={(v: string) => setForm({...form, [`promo${num}Badge`]: v})} />
                  <Input label="Link (Category/Product ID)" value={(form as any)[`promo${num}Link`]} onChange={(v: string) => setForm({...form, [`promo${num}Link`]: v})} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-white border border-stone-200 overflow-hidden shrink-0">
                    <img src={(form as any)[`promo${num}Image`]} className="w-full h-full object-cover" alt="" />
                  </div>
                  <label className="flex-grow h-10 border border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-stone-900 transition-all bg-white">
                    <span className="text-[8px] font-bold uppercase text-stone-400">Upload Image</span>
                    <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(`promo${num}Image`, e.target.files[0])} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
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
  const [newColor, setNewColor] = useState({ name: '', hex: '#1a1a1a', image: '' });
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    categoryId: product?.categoryId || categories[0]?.id || '',
    basePrice: product?.basePrice || 0,
    isFeatured: product?.isFeatured || false
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    try {
      const uploadPromises = Array.from(e.target.files).map(file => uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...urls]);
    } catch (err: any) { 
      console.error("Upload failed:", err);
      alert(`Upload error: ${err.message || 'Unknown error'}. Please check your internet connection.`); 
    }
    setLoading(false);
  };

  const generateVariants = (applyToAll = false) => {
    const colorNames = applyToAll 
      ? Array.from(new Set(variants.map(v => v.colorName || 'Standard')))
      : [newColor.name || 'Standard'];

    if (colorNames.length === 0 && applyToAll) {
      alert("No existing colors to apply to.");
      return;
    }

    const sizesToAdd = selectedSizes.length > 0 ? selectedSizes : ['No Size'];
    const newBatch: any[] = [];

    colorNames.forEach(colorName => {
      const existingForColor = variants.find(v => v.colorName === colorName);
      const hexColor = existingForColor?.hexColor || newColor.hex || '#1a1a1a';
      const colorImages = existingForColor?.images || (newColor.image ? [newColor.image] : []);

      sizesToAdd.forEach(size => {
        // Check if this variant already exists to avoid duplicates
        const exists = variants.some(v => v.colorName === colorName && v.size === (size === 'No Size' ? null : size));
        if (!exists) {
          newBatch.push({
            id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sku: `${form.name.slice(0, 2).toUpperCase()}-${colorName.slice(0, 2).toUpperCase()}-${size.slice(0, 2).toUpperCase()}`,
            colorName: colorName,
            hexColor: hexColor,
            images: colorImages,
            size: size === 'No Size' ? null : size,
            price: form.basePrice,
            stock: 10,
            leadTime: '',
            isComingSoon: false
          });
        }
      });
    });

    if (newBatch.length > 0) {
      setVariants(prev => [...prev, ...newBatch]);
    }
    setSelectedSizes([]);
    setNewColor({ name: '', hex: '#1a1a1a', image: '' });
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
    if (images.length === 0) return alert("Please upload at least one photo for the gallery.");
    if (variants.length === 0) return alert("Please add at least one variant (use the Batcher or Add as Single Item).");
    
    setLoading(true);
    try {
      // Clean up variants to remove any undefined values that Firestore rejects
      const cleanVariants = variants.map(v => {
        const clean: any = {};
        Object.keys(v).forEach(key => {
          const val = (v as any)[key];
          if (val !== undefined) clean[key] = val;
        });
        return clean;
      });

      const productData = {
        ...form,
        images,
        variants: cleanVariants,
        updatedAt: new Date().toISOString()
      };

      if (product) {
        await updateDoc(doc(db, 'products', product.id), productData);
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: new Date().toISOString()
        });
      }
      alert(`Product ${product ? 'updated' : 'created'} successfully!`);
      onClose();
    } catch (err: any) { 
      console.error("Save error details:", err);
      alert(`Save error: ${err.message || 'Unknown error'}. Check console for details.`); 
    }
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
                  <input type="file" className="hidden" multiple onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 rounded-2xl p-6 text-white space-y-6 shadow-xl">
             <div className="flex items-center gap-3">
                <Palette className="text-[#F2994A]" size={20} />
                <h4 className="text-sm font-serif font-bold uppercase tracking-tight">Colorway Batcher</h4>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-4">
                   <Input label="Name" value={newColor.name} onChange={v => setNewColor({...newColor, name: v})} placeholder="Midnight" />
                   <div className="flex items-center gap-3">
                      <input type="color" className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-none p-0 overflow-hidden" value={newColor.hex} onChange={e => setNewColor({...newColor, hex: e.target.value})} />
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{newColor.hex}</span>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[8px] font-bold uppercase text-stone-500 block tracking-widest">Color Photo (Optional)</label>
                   <label className="flex items-center gap-3 p-3 bg-stone-800 border border-stone-700 rounded-xl cursor-pointer hover:border-[#F2994A] transition-all group">
                      <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-stone-500 group-hover:text-white transition-colors overflow-hidden">
                         {newColor.image ? <img src={newColor.image} className="w-full h-full object-cover" /> : <ImageIcon size={16} />}
                      </div>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-stone-500 group-hover:text-white">
                         {newColor.image ? 'Change' : 'Upload'}
                      </span>
                      <input type="file" className="hidden" onChange={async (e) => {
                         if (!e.target.files?.[0]) return;
                         setLoading(true);
                         try {
                            const url = await uploadToCloudinary(e.target.files[0]);
                            setNewColor({...newColor, image: url});
                         } catch (err) { alert("Upload failed"); }
                         setLoading(false);
                      }} />
                   </label>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[8px] font-bold uppercase text-stone-500 block tracking-widest">Sizes (Optional)</label>
                      <button 
                        type="button" 
                        onClick={() => setSelectedSizes(prev => prev.length === STANDARD_SIZES.length ? [] : [...STANDARD_SIZES])}
                        className="text-[7px] font-bold uppercase text-[#F2994A] hover:underline"
                      >
                        {selectedSizes.length === STANDARD_SIZES.length ? 'Deselect All' : 'Select All'}
                      </button>
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {STANDARD_SIZES.map(s => (
                        <button key={s} type="button" onClick={() => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${selectedSizes.includes(s) ? 'bg-[#F2994A] text-white border-[#F2994A]' : 'bg-stone-800 text-stone-500 border-stone-700'}`}>{s}</button>
                      ))}
                   </div>
                </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button" 
                      onClick={() => generateVariants(false)} 
                      className="w-full py-3 bg-white text-stone-900 rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-[#0052D4] hover:text-white transition-all shadow-sm"
                    >
                      {newColor.name ? 'Append Colorway' : 'Add Standard Variant'}
                    </button>
                    {Object.keys(groupedVariants).length > 0 && selectedSizes.length > 0 && (
                      <button 
                        type="button" 
                        onClick={() => generateVariants(true)} 
                        className="w-full py-2 bg-stone-800 text-[#F2994A] rounded-xl font-bold uppercase text-[7px] tracking-widest hover:bg-stone-700 transition-all"
                      >
                        Apply Sizes to All Colors
                      </button>
                    )}
                    <button 
                      type="button" 
                      onClick={() => {
                        if (images.length === 0) {
                          alert("Please upload at least one gallery image first.");
                          return;
                        }
                        setVariants([{
                          id: `v-${Date.now()}`,
                          sku: `${form.name.slice(0, 3).toUpperCase()}-BASE`,
                          colorName: null,
                          hexColor: '#1a1a1a',
                          images: images,
                          size: null,
                          price: form.basePrice,
                          stock: 10,
                          leadTime: '',
                          isComingSoon: false
                        }]);
                      }}
                      className="w-full py-2 bg-stone-800 text-emerald-400 rounded-xl font-bold uppercase text-[7px] tracking-widest hover:bg-stone-700 transition-all border border-emerald-400/20"
                    >
                      Add as Single Item (No Size/Color)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setSelectedSizes([...STANDARD_SIZES]);
                        setNewColor({ name: 'Standard', hex: '#1a1a1a', image: images[0] || '' });
                        setTimeout(() => generateVariants(false), 0);
                      }}
                      className="w-full py-2 bg-stone-800 text-stone-400 rounded-xl font-bold uppercase text-[7px] tracking-widest hover:text-white transition-all"
                    >
                      Quick Add: All Sizes (Standard)
                    </button>
                  </div>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-stone-50">
              <h4 className="text-sm font-serif font-bold text-stone-900 uppercase tracking-tight">Piece Inventory</h4>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => {
                    if(confirm("Set all variants to base price?")) {
                      setVariants(prev => prev.map(v => ({ ...v, price: form.basePrice })));
                    }
                  }}
                  className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[7px] font-bold uppercase text-stone-400 hover:text-stone-900 transition-all"
                >
                  Sync Prices
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    if(confirm("Set all variants stock to 10?")) {
                      setVariants(prev => prev.map(v => ({ ...v, stock: 10 })));
                    }
                  }}
                  className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[7px] font-bold uppercase text-stone-400 hover:text-stone-900 transition-all"
                >
                  Sync Stock (10)
                </button>
              </div>
            </div>
            {Object.keys(groupedVariants).length === 0 ? (
              <p className="text-[8px] text-stone-300 uppercase tracking-widest text-center py-10">Use Batcher to add variants.</p>
            ) : (
              <div className="space-y-8">
                {(Object.entries(groupedVariants) as [string, any[]][]).map(([color, colorVariants]) => (
                  <div key={color} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colorVariants[0].hexColor }} />
                        <h5 className="font-bold text-[10px] uppercase text-stone-900 tracking-widest">{color}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                         <label className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 border border-stone-100 rounded-lg cursor-pointer hover:bg-white hover:border-stone-900 transition-all group">
                            {loading ? <Loader2 size={10} className="animate-spin" /> : <ImageIcon size={10} className="text-stone-400 group-hover:text-stone-900" />}
                            <span className="text-[7px] font-bold uppercase text-stone-400 group-hover:text-stone-900 tracking-widest">Add Color Image</span>
                            <input type="file" className="hidden" multiple onChange={async (e) => {
                               if (!e.target.files || e.target.files.length === 0) return;
                               setLoading(true);
                               try {
                                 const uploadPromises = Array.from(e.target.files).map(file => uploadToCloudinary(file));
                                 const urls = await Promise.all(uploadPromises);
                                 colorVariants.forEach(v => {
                                   const currentImages = v.images || [];
                                   updateVariant(v.originalIndex, { images: [...currentImages, ...urls] });
                                 });
                               } catch (err) { alert("Upload failed"); }
                               setLoading(false);
                            }} />
                         </label>
                      </div>
                    </div>

                    {colorVariants[0].images && colorVariants[0].images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {colorVariants[0].images.map((img: string, imgIdx: number) => (
                          <div key={imgIdx} className="w-12 h-16 rounded-lg overflow-hidden relative group">
                            <img src={img} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => {
                               colorVariants.forEach(v => {
                                 const newImages = (v.images || []).filter((_, i) => i !== imgIdx);
                                 updateVariant(v.originalIndex, { images: newImages });
                               });
                            }} className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {colorVariants.map((v: any) => (
                        <div key={v.id} className="p-4 bg-stone-50 rounded-xl border border-stone-100 relative group">
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[14px] font-bold text-stone-900">{v.size || 'STD'}</span>
                            <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== v.originalIndex))} className="text-stone-200 hover:text-red-500 transition-colors"><Trash2 size={12} /></button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input label="Cost Price" type="number" value={v.costPrice || 0} onChange={val => updateVariant(v.originalIndex, { costPrice: parseInt(val) || 0 })} />
                            <Input label="Sale Price" type="number" value={v.price} onChange={val => updateVariant(v.originalIndex, { price: parseInt(val) || 0 })} />
                          </div>
                          <div className="mt-2">
                            <Input label="Stock" type="number" value={v.stock} onChange={val => updateVariant(v.originalIndex, { stock: parseInt(val) || 0 })} />
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
            <button 
              type="submit"
              disabled={loading} 
              className={`flex-[2] py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
                (images.length === 0 || variants.length === 0) 
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed' 
                : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
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

const OrdersTable = ({ orders, updateStatus }: { orders: Order[], updateStatus: any }) => {
  const [deliveryFeeModal, setDeliveryFeeModal] = useState<{order: Order, fee: string} | null>(null);

  const sendWhatsAppConfirmation = (order: Order, fee: number) => {
    console.log('🚀 Sending WhatsApp confirmation for order:', order.id);
    console.log('💰 Delivery fee:', fee);
    console.log('👤 Customer phone:', order.customerPhone);
    
    const totalWithDelivery = order.totalAmount + fee;
    const message = `Thank you for your order 🙏🏾

🚚 Delivery fee to ${order.deliveryAddress.split(',')[0]} is GHS ${fee}.

Total Amount: GHS ${totalWithDelivery.toLocaleString()}

Please confirm so we dispatch immediately.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${order.customerPhone.startsWith('0') ? '233' + order.customerPhone.substring(1) : order.customerPhone}?text=${encodedMessage}`;
    
    console.log('📱 Opening WhatsApp URL:', whatsappUrl);
    console.log('🔄 Redirecting customer to WhatsApp...');
    
    window.open(whatsappUrl, '_blank');
    setDeliveryFeeModal(null);
  };

  return (
    <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm w-full relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[10px]">
          <thead className="bg-stone-50/50 border-b border-stone-50">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Ref</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Customer</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Amount</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Status</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Actions</th>
              <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400"></th>
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
                <td className="px-6 py-4 flex items-center gap-2">
                  <select className="bg-stone-50 border border-stone-50 rounded px-2 py-1 outline-none text-[8px] font-bold uppercase" value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}>
                    {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                  <button 
                    onClick={() => setDeliveryFeeModal({order, fee: ''})}
                    className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                    title="Send WhatsApp Confirmation"
                  >
                    <MessageCircle size={14} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={async () => {
                      if (confirm(`Delete order #${order.id.slice(-6).toUpperCase()}?`)) {
                        try {
                          await deleteDoc(doc(db, 'orders', order.id));
                        } catch (err: any) {
                          alert(`Failed to delete order: ${err.message}`);
                        }
                      }
                    }} 
                    className="text-stone-200 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deliveryFeeModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-sm" onClick={() => setDeliveryFeeModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-xs animate-in zoom-in-95 duration-200">
            <h4 className="text-sm font-serif font-bold text-stone-900 mb-4 uppercase">Confirm Delivery Fee</h4>
            <div className="space-y-4">
              <Input 
                label="Delivery Fee (GHS)" 
                type="number" 
                value={deliveryFeeModal.fee} 
                onChange={(v:any) => setDeliveryFeeModal({...deliveryFeeModal, fee: v})} 
                placeholder="e.g. 20"
              />
              <button 
                onClick={() => sendWhatsAppConfirmation(deliveryFeeModal.order, parseInt(deliveryFeeModal.fee) || 0)}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-[9px] tracking-widest hover:bg-green-700 transition-all"
              >
                Generate & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InventoryTracker = ({ inventoryProducts, manualSales, expenses }: { inventoryProducts: InventoryProduct[], manualSales: ManualSale[], expenses: Expense[] }) => {
  const [productForm, setProductForm] = useState({ name: '', quantityBought: 0, totalInvestment: 0, unitCost: 0, defaultSellingPrice: 0 });
  const [editingInventoryProduct, setEditingInventoryProduct] = useState<InventoryProduct | null>(null);
  const [saleForm, setSaleForm] = useState({ inventoryProductId: '', quantity: 1, salePrice: 0 });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: 0 });
  const [saving, setSaving] = useState(false);

  const addInventoryProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.quantityBought) return;
    setSaving(true);
    try {
      const finalInvestment = productForm.totalInvestment || (productForm.unitCost * productForm.quantityBought);
      
      if (editingInventoryProduct) {
        await updateDoc(doc(db, 'inventory', editingInventoryProduct.id), {
          name: productForm.name,
          quantityBought: productForm.quantityBought,
          totalInvestment: finalInvestment,
          defaultSellingPrice: productForm.defaultSellingPrice,
          // Update remaining stock if qty bought changed? 
          // For now keep it simple: only update basic info.
          // Or: remainingStock = newQtyBought - (oldQtyBought - oldRemainingStock)
          remainingStock: productForm.quantityBought - (editingInventoryProduct.quantityBought - editingInventoryProduct.remainingStock)
        });
      } else {
        await addDoc(collection(db, 'inventory'), {
          name: productForm.name,
          quantityBought: productForm.quantityBought,
          totalInvestment: finalInvestment,
          defaultSellingPrice: productForm.defaultSellingPrice,
          remainingStock: productForm.quantityBought,
          createdAt: new Date().toISOString()
        });
      }
      setProductForm({ name: '', quantityBought: 0, totalInvestment: 0, unitCost: 0, defaultSellingPrice: 0 });
      setEditingInventoryProduct(null);
    } catch (e) { alert("Error saving product"); }
    setSaving(false);
  };

  const startEditing = (p: InventoryProduct) => {
    setEditingInventoryProduct(p);
    setProductForm({
      name: p.name,
      quantityBought: p.quantityBought,
      totalInvestment: p.totalInvestment,
      unitCost: p.totalInvestment / p.quantityBought,
      defaultSellingPrice: p.defaultSellingPrice || 0
    });
  };

  const addManualSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.inventoryProductId || !saleForm.quantity) return;
    const product = inventoryProducts.find(p => p.id === saleForm.inventoryProductId);
    if (!product) return;
    if (product.remainingStock < saleForm.quantity) {
      alert("Not enough stock!");
      return;
    }

    setSaving(true);
    try {
      const costPerItem = product.totalInvestment / product.quantityBought;
      const profit = (saleForm.salePrice - costPerItem) * saleForm.quantity;
      
      await addDoc(collection(db, 'manualSales'), {
        itemName: product.name,
        quantity: saleForm.quantity,
        salePrice: saleForm.salePrice,
        costPrice: costPerItem,
        profit,
        channel: 'Offline Tracking',
        inventoryProductId: product.id,
        createdAt: new Date().toISOString()
      });

      await updateDoc(doc(db, 'inventory', product.id), {
        remainingStock: product.remainingStock - saleForm.quantity
      });

      setSaleForm({ inventoryProductId: '', quantity: 1, salePrice: 0 });
    } catch (e) { alert("Error recording sale"); }
    setSaving(false);
  };

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'expenses'), {
        ...expenseForm,
        createdAt: new Date().toISOString()
      });
      setExpenseForm({ description: '', amount: 0 });
    } catch (e) { alert("Error adding expense"); }
    setSaving(false);
  };

  const filteredSales = manualSales.filter(s => s.inventoryProductId);

  const productStats = inventoryProducts.map(p => {
    const productSales = filteredSales.filter(s => s.inventoryProductId === p.id);
    const qtySold = productSales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = productSales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0);
    const profit = productSales.reduce((sum, s) => sum + s.profit, 0);
    return { ...p, qtySold, revenue, profit };
  });

  const totals = {
    investment: inventoryProducts.reduce((sum, p) => sum + p.totalInvestment, 0),
    revenue: filteredSales.reduce((sum, s) => sum + (s.salePrice * s.quantity), 0),
    profit: filteredSales.reduce((sum, s) => sum + s.profit, 0),
    expenses: expenses.reduce((sum, e) => sum + e.amount, 0),
  };
  const netProfit = totals.revenue - (inventoryProducts.reduce((sum, p) => {
    return 0; // dummy
  }, 0));
  
  const finalNetProfit = totals.profit - totals.expenses;

  return (
    <div className="space-y-10 animate-in fade-in pb-20">
      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Layers size={16} />} label="Total Investment" value={`GH₵ ${totals.investment.toLocaleString()}`} color="stone" />
        <StatCard icon={<TrendingUp size={16} />} label="Total Revenue" value={`GH₵ ${totals.revenue.toLocaleString()}`} color="orange" />
        <StatCard icon={<DollarSign size={16} />} label="Gross Profit" value={`GH₵ ${totals.profit.toLocaleString()}`} color="green" />
        <StatCard icon={<AlertCircle size={16} />} label="Net Profit (After Exp)" value={`GH₵ ${finalNetProfit.toLocaleString()}`} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Forms Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">{editingInventoryProduct ? <Edit3 size={14} /> : <Plus size={14} />} {editingInventoryProduct ? 'Edit Inventory' : 'New Inventory Product'}</span>
              {editingInventoryProduct && <button onClick={() => { setEditingInventoryProduct(null); setProductForm({name: '', quantityBought: 0, totalInvestment: 0, unitCost: 0, defaultSellingPrice: 0}); }} className="text-[7px] text-stone-400 hover:text-stone-900 uppercase">Cancel</button>}
            </h3>
            <form onSubmit={addInventoryProduct} className="space-y-4">
              <Input label="Product Name" value={productForm.name} onChange={(v:any) => setProductForm({...productForm, name: v})} placeholder="e.g. Waffle Round-Neck" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Qty Bought" type="number" value={productForm.quantityBought} onChange={(v:any) => {
                  const qty = parseInt(v) || 0;
                  setProductForm({...productForm, quantityBought: qty, totalInvestment: qty * productForm.unitCost });
                }} />
                <Input label="Cost per Piece" type="number" value={productForm.unitCost} onChange={(v:any) => {
                  const unit = parseInt(v) || 0;
                  setProductForm({...productForm, unitCost: unit, totalInvestment: unit * productForm.quantityBought });
                }} />
              </div>
              <Input label="Total Investment" type="number" value={productForm.totalInvestment} onChange={(v:any) => {
                const total = parseInt(v) || 0;
                setProductForm({...productForm, totalInvestment: total, unitCost: productForm.quantityBought > 0 ? total / productForm.quantityBought : 0 });
              }} />
              <button disabled={saving} className={`w-full py-3 ${editingInventoryProduct ? 'bg-[#0052D4]' : 'bg-stone-900'} text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:opacity-90`}>
                {saving ? <Loader2 size={12} className="animate-spin mx-auto" /> : (editingInventoryProduct ? 'Update Product' : 'Add Product')}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
              <Sparkles size={14} /> Record Offline Sale
            </h3>
            <form onSubmit={addManualSale} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest block">Select Product</label>
                <select 
                  className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-xs" 
                  value={saleForm.inventoryProductId} 
                  onChange={e => {
                    setSaleForm({...saleForm, inventoryProductId: e.target.value, salePrice: 0 });
                  }}
                >
                  <option value="">Choose item...</option>
                  {inventoryProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.remainingStock} in stock)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Qty Sold" type="number" value={saleForm.quantity} onChange={(v:any) => setSaleForm({...saleForm, quantity: parseInt(v) || 0})} />
                <Input label="Price per Item" type="number" value={saleForm.salePrice} onChange={(v:any) => setSaleForm({...saleForm, salePrice: parseInt(v) || 0})} />
              </div>
              <button disabled={saving || !saleForm.inventoryProductId} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-green-700 disabled:opacity-50">
                {saving ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Log Sale'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
              <DollarSign size={14} /> Add Expense
            </h3>
            <form onSubmit={addExpense} className="space-y-4">
              <Input label="Ex. Boxes, Shipping" value={expenseForm.description} onChange={(v:any) => setExpenseForm({...expenseForm, description: v})} />
              <Input label="Amount" type="number" value={expenseForm.amount} onChange={(v:any) => setExpenseForm({...expenseForm, amount: parseInt(v) || 0})} />
              <button disabled={saving} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-stone-800">
                {saving ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>

        {/* Tables Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Inventory Table */}
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-50 bg-stone-50/50">
              <h4 className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">Product Stock & Profit</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-stone-50/30 border-b border-stone-50">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Product</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Cost</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Stock</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Sold</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Revenue</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Profit</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {productStats.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/20 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-bold text-stone-900">{p.name}</p>
                      </td>
                      <td className="px-4 py-4 font-mono">GH₵ {(p.totalInvestment / p.quantityBought).toFixed(2)}</td>
                      <td className="px-4 py-4">
                        <span className={`font-mono font-bold ${p.remainingStock < 5 ? 'text-red-500' : 'text-stone-900'}`}>
                          {p.remainingStock} / {p.quantityBought}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono">{p.qtySold}</td>
                      <td className="px-4 py-4 font-bold">GH₵ {p.revenue.toLocaleString()}</td>
                      <td className="px-4 py-4 font-bold text-green-600">GH₵ {p.profit.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => startEditing(p)} className="text-stone-300 hover:text-stone-900 transition-all">
                            <Edit3 size={12} />
                          </button>
                          <button onClick={async () => {
                            if (confirm(`Delete "${p.name}"? This will not delete past sales.`)) {
                              await deleteDoc(doc(db, 'inventory', p.id));
                            }
                          }} className="text-stone-200 hover:text-red-500 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {inventoryProducts.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-stone-300 uppercase text-[8px] tracking-widest font-bold">No items tracked yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-50 bg-stone-50/50">
              <h4 className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">Recent Inventory Sales</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-stone-50/30 border-b border-stone-50">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Date</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Product</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Qty</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Revenue</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Profit</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-stone-50/20 transition-colors">
                      <td className="px-4 py-4 text-stone-400">{new Date(sale.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-bold text-stone-900">{sale.itemName}</td>
                      <td className="px-4 py-4 font-mono">{sale.quantity}</td>
                      <td className="px-4 py-4 font-bold">GH₵ {(sale.salePrice * sale.quantity).toLocaleString()}</td>
                      <td className="px-4 py-4 font-bold text-green-600">GH₵ {sale.profit.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <button onClick={async () => {
                          if (confirm(`Remove entry for "${sale.itemName}"?`)) {
                            await deleteDoc(doc(db, 'manualSales', sale.id));
                          }
                        }} className="text-stone-200 hover:text-red-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-10 text-stone-300 uppercase text-[8px] tracking-widest font-bold">No inventory sales logged yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-stone-50 bg-stone-50/50">
              <h4 className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">General Expenses</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-stone-50/30 border-b border-stone-50">
                  <tr>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Description</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Date</th>
                    <th className="px-4 py-3 font-bold uppercase tracking-widest text-stone-400">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-stone-50/20 transition-colors">
                      <td className="px-4 py-4 font-bold text-stone-900">{e.description}</td>
                      <td className="px-4 py-4 text-stone-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 font-bold text-red-500">GH₵ {e.amount.toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <button onClick={async () => {
                          if (confirm(`Remove this expense entry?`)) {
                            await deleteDoc(doc(db, 'expenses', e.id));
                          }
                        }} className="text-stone-200 hover:text-red-500 transition-all">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-stone-300 uppercase text-[8px] tracking-widest font-bold">No expenses logged yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManualSalesManager = ({ manualSales }: { manualSales: ManualSale[] }) => {
  const { products } = useAppContext();
  const [form, setForm] = useState({ itemName: '', quantity: 1, salePrice: 0, costPrice: 0, channel: 'WhatsApp' });
  const [saving, setSaving] = useState(false);

  const addSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.salePrice) return;
    setSaving(true);
    try {
      const profit = (form.salePrice - form.costPrice) * form.quantity;
      await addDoc(collection(db, 'manualSales'), {
        ...form,
        profit,
        createdAt: new Date().toISOString()
      });
      setForm({ itemName: '', quantity: 1, salePrice: 0, costPrice: 0, channel: 'WhatsApp' });
    } catch (e) { alert("Error recording sale"); }
    setSaving(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white rounded-2xl p-8 border border-stone-100 shadow-sm">
        <h3 className="text-xl font-serif font-bold text-stone-900 uppercase mb-6">Record Manual Sale</h3>
        <form onSubmit={addSale} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
          <Input label="Item Name" value={form.itemName} onChange={(v:any) => setForm({...form, itemName: v})} placeholder="e.g. Custom Tote" />
          <Input label="Qty" type="number" value={form.quantity} onChange={(v:any) => setForm({...form, quantity: parseInt(v) || 1})} />
          <Input label="Sale Price" type="number" value={form.salePrice} onChange={(v:any) => setForm({...form, salePrice: parseInt(v) || 0})} />
          <Input label="Cost Price" type="number" value={form.costPrice} onChange={(v:any) => setForm({...form, costPrice: parseInt(v) || 0})} />
          <div className="space-y-1.5">
            <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest block">Channel</label>
            <select className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-xs" value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Instagram">Instagram</option>
              <option value="In-Person">In-Person</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button disabled={saving} className="md:col-span-3 lg:col-span-1 py-3.5 bg-stone-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-stone-800 shadow-lg">
            {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Log Sale'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-stone-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-stone-50 flex justify-between items-center">
          <h4 className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Recent Manual Entries</h4>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[7px] font-bold uppercase text-stone-400">Total Manual Profit</p>
              <p className="text-sm font-bold text-green-600">GH₵ {manualSales.reduce((s, a) => s + a.profit, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-stone-50/50 border-b border-stone-50">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Date</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Item</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Channel</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Revenue</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Profit</th>
                <th className="px-6 py-4 font-bold uppercase tracking-widest text-stone-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {manualSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-stone-50/20 transition-colors">
                  <td className="px-6 py-4 text-stone-400">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-900">{sale.itemName}</p>
                    <p className="text-[8px] opacity-40 uppercase">Qty: {sale.quantity}</p>
                  </td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-stone-100 rounded text-[7px] font-bold uppercase">{sale.channel}</span></td>
                  <td className="px-6 py-4 font-bold">GH₵ {(sale.salePrice * sale.quantity).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-green-600">GH₵ {sale.profit.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={async () => {
                        if (confirm(`Remove entry for "${sale.itemName}"?`)) {
                          try {
                            // If it was linked to inventory, restore the stock
                            if (sale.inventoryProductId) {
                              const product = inventoryProducts.find(p => p.id === sale.inventoryProductId);
                              if (product) {
                                const newStock = product.remainingStock + sale.quantity;
                                console.log(`🔄 Restoring ${sale.quantity} units to ${product.name}. New stock: ${newStock}`);
                                
                                await updateDoc(doc(db, 'inventory', product.id), {
                                  remainingStock: newStock
                                });
                              }
                            }
                            
                            await deleteDoc(doc(db, 'manualSales', sale.id));
                            console.log('Deleted sale: ' + sale.itemName + ' (' + sale.quantity + ' units)');
                          } catch (err: any) {
                            alert(`Failed to delete entry: ${err.message}`);
                          }
                        }
                      }} 
                      className="text-stone-200 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: any) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600 border-orange-50',
    blue: 'bg-blue-50 text-blue-600 border-blue-50',
    stone: 'bg-stone-50 text-stone-600 border-stone-100',
    green: 'bg-green-50 text-green-600 border-green-50'
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

const Input = ({ label, value, onChange, placeholder, type = 'text', min }: any) => (
  <div className="space-y-1.5">
    <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest block">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl outline-none font-bold text-stone-900 text-[11px] placeholder:text-stone-200 shadow-sm" />
  </div>
);

export default AdminDashboard;
