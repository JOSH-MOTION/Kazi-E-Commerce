
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Star, Clock, ShieldCheck, X, AlertTriangle, ChevronLeft, ChevronRight, Tag, CalendarClock, Zap, Ticket, Sparkle, Check, Loader2, Image as ImageIcon, Truck, CreditCard, RotateCcw, Headphones, Search, Heart, User, Menu } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { optimizeImage } from '../cloudinary';
import { useAppContext } from '../context/AppContext';

interface StorefrontProps {
  addToCart: (productId: string, variantId: string, quantity: number) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ addToCart }) => {
  const { products, categories, settings, promotions, searchQuery, setSearchQuery } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'new' | 'best' | 'top'>('new');

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query) ||
        categories.find(c => c.id === p.categoryId)?.name?.toLowerCase().includes(query)
      );
    } else {
      if (activeCategory !== 'all') {
        result = result.filter(p => p.categoryId === activeCategory);
      }
      
      // Apply tab filtering when not searching
      if (activeTab === 'best' || activeTab === 'top') {
        result = result.filter(p => p.isFeatured);
      }
    }
    
    return result;
  }, [products, activeCategory, searchQuery, categories, activeTab]);

  const displayItems = useMemo(() => {
    const items: { product: Product, colorName: string, variants: ProductVariant[] }[] = [];
    
    filteredProducts.forEach(product => {
      const colorGroups: Record<string, ProductVariant[]> = {};
      product.variants.forEach(v => {
        if (!colorGroups[v.colorName]) colorGroups[v.colorName] = [];
        colorGroups[v.colorName].push(v);
      });

      Object.entries(colorGroups).forEach(([colorName, variants]) => {
        items.push({
          product,
          colorName,
          variants
        });
      });
    });

    return items;
  }, [filteredProducts]);

  const tickerMessage = settings?.tickerText || "Cartly • Your Effortless Shop • Accra 2025";

  return (
    <div className="w-full bg-white">
      {/* Hero Section - Immersive Background Style */}
      <section className="relative h-[500px] md:h-[700px] bg-stone-900 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            key={settings?.heroImage || 'default'}
            src={settings?.heroImage || "https://images.unsplash.com/photo-1519085185758-2ad98035527e?auto=format&fit=crop&q=80&w=1000"} 
            className="w-full h-full object-cover animate-in fade-in duration-1000"
            alt="Hero Background"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
        </div>

        <div className="max-w-[1400px] mx-auto h-full flex flex-col justify-center px-6 md:px-12 relative z-20">
          <div className="w-full md:w-2/3 lg:w-1/2 animate-in slide-in-from-left duration-700">
            <span className="text-orange-500 font-serif italic text-xl md:text-2xl mb-4 block">Season Sale</span>
            <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[0.9] uppercase tracking-tighter">
              {settings?.heroTitle?.split(' ').map((word, i) => (
                <React.Fragment key={i}>
                  {word} {i === 0 && <br />}
                </React.Fragment>
              )) || <>MEN'S <br /> FASHION</>}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 font-medium max-w-md">{settings?.heroSubtitle || "Min. 35-70% Off"}</p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-orange-500 text-white px-10 py-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all shadow-2xl shadow-orange-500/20"
              >
                {settings?.heroCtaText || "Shop Now"}
              </button>
              <button 
                onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-4 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-stone-900 transition-all"
              >
                {settings?.heroSecondaryCtaText || "Read More"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Slider Dots - Decorative */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          <div className="w-12 h-1 bg-orange-500 rounded-full shadow-sm" />
          <div className="w-12 h-1 bg-white/20 rounded-full shadow-sm" />
          <div className="w-12 h-1 bg-white/20 rounded-full shadow-sm" />
        </div>
      </section>

      {/* Features Bar */}
      <section className="max-w-[1400px] mx-auto py-12 px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 border-b border-stone-100">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-50 rounded-full text-orange-500"><Truck size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">Free Shipping</h4>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">On All Orders Over $99</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-50 rounded-full text-orange-500"><CreditCard size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">Secure Payment</h4>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">We ensure secure payment</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-50 rounded-full text-orange-500"><RotateCcw size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">100% Money Back</h4>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">30 Days Return Policy</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-stone-50 rounded-full text-orange-500"><Headphones size={24} /></div>
          <div>
            <h4 className="font-bold text-sm text-stone-900">Online Support</h4>
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">24/7 Dedicated Support</p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="collection-anchor" className="max-w-[1400px] mx-auto py-16 px-6">
        <div className="text-center mb-12">
          {searchQuery ? (
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-2">Search Results</h2>
              <p className="text-stone-400 text-sm">Showing results for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 text-orange-500 text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-6">Featured Products</h2>
              <div className="flex justify-center gap-8 border-b border-stone-100">
                {['New Arrival', 'Best Selling', 'Top Rated'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0] as any)}
                    className={`pb-4 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.toLowerCase().split(' ')[0] ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase().split(' ')[0] && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {displayItems.length > 0 ? (
            displayItems.slice(0, 15).map((item, idx) => (
              <ProductCard 
                key={`${item.product.id}-${item.colorName}-${idx}`} 
                product={item.product} 
                colorName={item.colorName}
                variants={item.variants}
                onClick={() => setSelectedProduct({ ...item.product, initialColor: item.colorName } as any)} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-stone-300" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No products found</h3>
              <p className="text-stone-400 text-[10px] uppercase tracking-widest font-bold mb-6">Try adjusting your search or filters</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="bg-stone-900 text-white px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500 transition-all"
              >
                Show All Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Promo Banners Grid */}
      <section className="max-w-[1400px] mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Promo 1 - Large */}
        <div className="md:col-span-2 md:row-span-2 relative h-[400px] md:h-auto bg-stone-900 rounded-sm overflow-hidden group">
          <img src={settings?.promo1Image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" alt="Promo 1" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute top-12 left-12 z-10">
            <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2 block">{settings?.promo1Badge || "New Arrivals"}</span>
            <h3 className="text-4xl md:text-5xl font-black text-white mb-2 uppercase tracking-tighter">
              {settings?.promo1Title?.split(' ').map((w, i) => <React.Fragment key={i}>{w}{i === 0 && <br />}</React.Fragment>) || <>Women's<br />Style</>}
            </h3>
            <p className="text-white/80 mb-6 font-medium">{settings?.promo1Subtitle || "Up to 70% Off"}</p>
            <button 
              onClick={() => {
                if (settings?.promo1Link) {
                  const cat = categories.find(c => c.id === settings.promo1Link);
                  if (cat) setActiveCategory(cat.id);
                  else {
                    const prod = products.find(p => p.id === settings.promo1Link);
                    if (prod) setSelectedProduct(prod);
                  }
                } else {
                  const womenCat = categories.find(c => c.name.toLowerCase().includes('women'))?.id;
                  if (womenCat) setActiveCategory(womenCat);
                }
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-stone-900 px-8 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-lg"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* Promo 2 - Wide */}
        <div className="md:col-span-2 relative h-[250px] bg-stone-900 rounded-sm overflow-hidden group">
          <img src={settings?.promo2Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" alt="Promo 2" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute top-8 left-8 z-10">
            <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-1 block">{settings?.promo2Badge || "Trending Now"}</span>
            <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">{settings?.promo2Title || "Men's Fashion"}</h3>
            <p className="text-white/80 mb-4 text-xs font-medium">{settings?.promo2Subtitle || "Flat 50% Off"}</p>
            <button 
              onClick={() => {
                if (settings?.promo2Link) {
                  const cat = categories.find(c => c.id === settings.promo2Link);
                  if (cat) setActiveCategory(cat.id);
                  else {
                    const prod = products.find(p => p.id === settings.promo2Link);
                    if (prod) setSelectedProduct(prod);
                  }
                } else {
                  const menCat = categories.find(c => c.name.toLowerCase().includes('men'))?.id;
                  if (menCat) setActiveCategory(menCat);
                }
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all border-b border-white pb-1"
            >
              Shop Collection <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Promo 3 */}
        <div className="relative h-[250px] bg-stone-100 rounded-sm overflow-hidden group">
          <img src={settings?.promo3Image || "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo 3" />
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] font-bold px-2 py-1 rounded-sm uppercase">{settings?.promo3Badge || "25% Off"}</div>
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-1">{settings?.promo3Title || "Handbag"}</h3>
            <button 
              onClick={() => {
                if (settings?.promo3Link) {
                  const cat = categories.find(c => c.id === settings.promo3Link);
                  if (cat) setActiveCategory(cat.id);
                  else {
                    const prod = products.find(p => p.id === settings.promo3Link);
                    if (prod) setSelectedProduct(prod);
                  }
                }
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-orange-500 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              {settings?.promo3Subtitle || "Shop Now"} <ChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* Promo 4 */}
        <div className="relative h-[250px] bg-stone-100 rounded-sm overflow-hidden group">
          <img src={settings?.promo4Image || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Promo 4" />
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-[8px] font-bold px-2 py-1 rounded-sm uppercase">{settings?.promo4Badge || "45% Off"}</div>
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm p-4 rounded-sm border border-stone-100">
            <h3 className="text-lg font-bold text-stone-900 mb-1">{settings?.promo4Title || "Watch"}</h3>
            <button 
              onClick={() => {
                if (settings?.promo4Link) {
                  const cat = categories.find(c => c.id === settings.promo4Link);
                  if (cat) setActiveCategory(cat.id);
                  else {
                    const prod = products.find(p => p.id === settings.promo4Link);
                    if (prod) setSelectedProduct(prod);
                  }
                }
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-orange-500 font-bold text-[9px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              {settings?.promo4Subtitle || "Shop Now"} <ChevronRight size={10} />
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Banners */}
      <section className="max-w-[1400px] mx-auto py-12 px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative h-[350px] bg-stone-900 rounded-sm overflow-hidden group">
          <img src={settings?.banner1Image || "https://images.unsplash.com/photo-1488161628813-244768e7f63e?auto=format&fit=crop&q=80&w=800"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70" alt="Banner 1" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-12 z-10">
            <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2 block">Weekend Sale</span>
            <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{settings?.banner1Title || "Men's Fashion"}</h3>
            <p className="text-white/80 font-bold mb-6 uppercase text-[10px] tracking-widest">{settings?.banner1Subtitle || "Flat 70% Off"}</p>
            <button 
              onClick={() => {
                const menCat = categories.find(c => c.name.toLowerCase().includes('men'))?.id;
                if (menCat) setActiveCategory(menCat);
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-stone-900 px-10 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
            >
              Shop Now
            </button>
          </div>
        </div>
        <div className="relative h-[350px] bg-stone-900 rounded-sm overflow-hidden group">
          <img src={settings?.banner2Image || "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800"} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70" alt="Banner 2" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-12 z-10">
            <span className="text-orange-500 font-bold text-[10px] uppercase tracking-widest mb-2 block">Fashion Style</span>
            <h3 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">{settings?.banner2Title || "Women's Wear"}</h3>
            <p className="text-white/80 font-bold mb-6 uppercase text-[10px] tracking-widest">{settings?.banner2Subtitle || "Min. 35-70% Off"}</p>
            <button 
              onClick={() => {
                const womenCat = categories.find(c => c.name.toLowerCase().includes('women'))?.id;
                if (womenCat) setActiveCategory(womenCat);
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-stone-900 px-10 py-3 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all"
            >
              Shop Now
            </button>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="categories" className="max-w-[1400px] mx-auto py-16 px-6 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-12">Featured Categories</h2>
        <div className="flex flex-wrap justify-center gap-12">
          {categories
            .sort((a, b) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();
              if (aName.includes('men') || aName.includes('women')) return -1;
              if (bName.includes('men') || bName.includes('women')) return 1;
              return 0;
            })
            .slice(0, 8)
            .map(cat => (
            <button 
              key={cat.id} 
              onClick={() => {
                setActiveCategory(cat.id);
                document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="group flex flex-col items-center gap-4"
            >
              <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:border-orange-500 transition-all overflow-hidden">
                <img src={`https://picsum.photos/seed/${cat.slug}/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={cat.name} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-stone-900">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} />}
    </div>
  );
};

const ProductCard: React.FC<{ product: Product, colorName: string, variants: ProductVariant[], onClick: () => void }> = ({ product, colorName, variants, onClick }) => {
  const isComingSoon = variants?.every(v => v.isComingSoon) || false;
  const hasInStock = variants?.some(v => v.stock > 0 && !v.isComingSoon);
  const displayImage = variants[0]?.images?.[0] || product.images[0];
  const minPrice = Math.min(...variants.map(v => v.price));
  const maxPrice = Math.max(...variants.map(v => v.price));

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f9f9f9] rounded-sm mb-4">
        <img 
          src={optimizeImage(displayImage, 500)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isComingSoon && <span className="bg-stone-900 text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">Soon</span>}
          {variants[0].stock < 5 && hasInStock && <span className="bg-orange-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">Featured</span>}
          {variants[0].price < 100 && <span className="bg-green-600 text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">15% Off</span>}
        </div>
        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm flex justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="p-2 text-stone-600 hover:text-orange-500 transition-colors"
          >
            <Search size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); alert("Added to Wishlist!"); }}
            className="p-2 text-stone-600 hover:text-red-500 transition-colors"
          >
            <Heart size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="p-2 text-stone-600 hover:text-orange-500 transition-colors"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">{product.categoryId}</p>
        <h3 className="font-bold text-stone-900 text-xs group-hover:text-orange-500 transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-0.5 text-orange-400">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i <= 4 ? "currentColor" : "none"} />)}
          <span className="text-[9px] text-stone-400 ml-1">(2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-900 text-xs">
            GH₵ {minPrice === maxPrice ? minPrice.toLocaleString() : `${minPrice.toLocaleString()} - GH₵ ${maxPrice.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProductModal = ({ product, onClose, addToCart }: any) => {
  const { categories } = useAppContext();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(() => {
    const initialColor = (product as any).initialColor;
    if (initialColor) {
      return product.variants.find((v: any) => v.colorName === initialColor && (v.stock > 0 || v.leadTime) && !v.isComingSoon) || 
             product.variants.find((v: any) => v.colorName === initialColor) ||
             product.variants[0];
    }
    return product.variants?.find((v:any) => (v.stock > 0 || v.leadTime) && !v.isComingSoon) || product.variants?.[0];
  });
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Combine product images with color-specific images, removing duplicates
  const allImages = useMemo(() => {
    const colorImages = selectedVariant?.images || [];
    const productImages = product.images || [];
    // Prioritize color images, then add product images, filtering out duplicates
    const combined = [...colorImages, ...productImages];
    return Array.from(new Set(combined)).filter(Boolean);
  }, [product.images, selectedVariant]);

  const colors = Array.from(new Set(product.variants?.map((v: any) => v.colorName) || [])).map(name => 
    product.variants?.find((v: any) => v.colorName === name)!
  );
  const sizesForColor = product.variants?.filter((v: any) => v.colorName === selectedVariant?.colorName) || [];
  const isInStock = selectedVariant?.stock > 0 && !selectedVariant?.isComingSoon;
  const isPreOrder = selectedVariant?.stock === 0 && !!selectedVariant?.leadTime && !selectedVariant?.isComingSoon;
  const canPurchase = isInStock || isPreOrder;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Reset image index when variant (color) changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [selectedVariant?.colorName]);

  const [isAdding, setIsAdding] = useState(false);
  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product.id, selectedVariant.id, 1);
    setTimeout(() => {
      setIsAdding(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white sm:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 mx-auto sm:my-8">
        <button onClick={onClose} className="absolute top-3 right-3 z-40 bg-white/70 backdrop-blur-lg p-2 rounded-full text-stone-900 shadow-sm hover:bg-white transition-all"><X size={16} /></button>
        <div className="flex flex-col lg:flex-row max-h-[85vh] lg:max-h-[75vh] overflow-y-auto">
          {/* Gallery Section */}
          <div className="w-full lg:w-1/2 relative bg-stone-50 overflow-hidden group/gallery">
            <div className="aspect-[1/1] sm:aspect-[4/5] w-full max-h-[40vh] md:max-h-none overflow-hidden flex items-center justify-center bg-stone-50">
              <img 
                src={optimizeImage(allImages[activeImageIdx], 800)} 
                className="w-full h-full object-contain transition-all duration-500" 
                alt={product.name} 
              />
            </div>
            
            {allImages.length > 1 && (
              <>
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur border border-stone-100 flex items-center justify-center text-stone-900 shadow-md z-30 hover:bg-white transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur border border-stone-100 flex items-center justify-center text-stone-900 shadow-md z-30 hover:bg-white transition-all"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Thumbnail Strip */}
                <div className="absolute bottom-4 left-0 right-0 px-4 z-20">
                  <div className="flex justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
                    {allImages.map((img: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={(e) => { e.stopPropagation(); setActiveImageIdx(i); }} 
                        className={`relative w-10 h-12 rounded-md overflow-hidden border-2 transition-all shrink-0 ${i === activeImageIdx ? 'border-stone-900 scale-110 shadow-md' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      >
                        <img src={optimizeImage(img, 100)} className="w-full h-full object-cover" alt="" />
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-8 flex flex-col bg-white">
            <span className="text-[7px] font-bold uppercase tracking-widest text-stone-400 mb-1">{categories.find(c => c.id === product.categoryId)?.name}</span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-stone-900 mb-2 uppercase tracking-tight">{product.name}</h2>
            <div className="flex items-center gap-3 mb-5">
              <p className="text-lg md:text-xl font-bold text-stone-900">GH₵ {selectedVariant?.price.toLocaleString()}</p>
              {isPreOrder && <span className="bg-[#F2994A]/10 text-[#F2994A] text-[7px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-[#F2994A]/20">Ships in {selectedVariant.leadTime}</span>}
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed mb-6 font-medium tracking-wide">{product.description}</p>
            
            <div className="space-y-6 mb-8">
              {colors.length > 1 && (
                <div>
                  <label className="text-[7px] font-bold uppercase text-stone-400 block mb-2 tracking-widest">
                    {selectedVariant?.colorName && selectedVariant.colorName !== 'Standard' ? `Colorway: ${selectedVariant.colorName}` : 'Select Color'}
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c: any) => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedVariant(product.variants.find((v:any) => v.colorName === c.colorName)!)} 
                        className={`w-7 h-7 rounded-full border transition-all p-0.5 ${selectedVariant?.colorName === c.colorName ? 'border-stone-900 ring-2 ring-stone-900/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hexColor || '#1a1a1a' }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizesForColor.some((s: any) => s.size && s.size !== 'No Size') && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[7px] font-bold uppercase text-stone-400 tracking-widest">Select Size</label>
                    <span className="text-[6px] font-bold text-stone-300 uppercase tracking-widest">Size Guide</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sizesForColor.map((s: any) => {
                      const available = (s.stock > 0 || !!s.leadTime) && !s.isComingSoon;
                      const isSelected = selectedVariant?.id === s.id;
                      return (
                        <button 
                          key={s.id} 
                          disabled={!available} 
                          onClick={() => setSelectedVariant(s)} 
                          className={`relative h-10 flex items-center justify-center text-[10px] font-bold border rounded-xl transition-all ${
                            isSelected 
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md scale-105 z-10' 
                            : 'bg-white text-stone-900 border-stone-100 hover:border-stone-300 disabled:opacity-20 disabled:bg-stone-50'
                          }`}
                        >
                          {s.size}
                          {isSelected && <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center border border-white"><Check size={6} className="text-white" /></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <button 
                disabled={!canPurchase || isAdding} 
                onClick={handleAddToCart} 
                className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${
                  canPurchase 
                  ? 'bg-stone-900 text-white hover:bg-orange-500 active:scale-95' 
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
                }`}
              >
                {isAdding ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : canPurchase ? (
                  <>
                    <ShoppingBag size={16} />
                    <span className="text-[11px] uppercase tracking-[0.15em]">Add to Collection</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span className="text-[11px] uppercase tracking-[0.15em]">
                      {selectedVariant?.isComingSoon ? 'Coming Soon' : 'Out of Stock'}
                    </span>
                  </>
                )}
              </button>
              {!canPurchase && !selectedVariant?.isComingSoon && (
                <p className="text-[7px] text-center text-stone-400 mt-2 uppercase font-bold tracking-widest">
                  This size is currently unavailable. Check back soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storefront;
