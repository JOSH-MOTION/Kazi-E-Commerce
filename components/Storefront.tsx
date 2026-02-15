
import React, { useState } from 'react';
import { ShoppingBag, Star, Clock, ShieldCheck, X, AlertTriangle, ChevronLeft, ChevronRight, Tag, CalendarClock, Zap, Ticket, Sparkle, Image as ImageIcon } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { optimizeImage } from '../cloudinary';
import { useAppContext } from '../context/AppContext';

interface StorefrontProps {
  addToCart: (productId: string, variantId: string, quantity: number) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ addToCart }) => {
  const { products, categories, settings, promotions } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  const tickerMessage = settings?.tickerText || "J&B Market • Premium African Retail • Accra 2025";

  return (
    <div className="w-full pb-12">
      {/* Dynamic Announcement Ticker - Full Width */}
      {settings?.isTickerActive !== false && (
        <div className="bg-stone-900 text-white overflow-hidden py-1.5 border-b border-white/5">
          <div className="flex animate-[scroll_50s_linear_infinite] whitespace-nowrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((_, idx) => (
              <span key={idx} className="inline-flex items-center gap-2.5 mx-6 text-[7px] font-bold uppercase tracking-[0.2em]">
                <SparkleIcon /> {tickerMessage}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hero Section - Limitless Width */}
      <section className="relative h-[25vh] md:h-[40vh] flex items-center justify-center overflow-hidden bg-stone-900 w-full">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          alt="Premium African Fashion"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-stone-950/40 to-stone-950/90" />
        <div className="relative z-10 text-center px-6 max-w-lg animate-fade-in">
          <span className="text-orange-500 font-bold tracking-[0.4em] text-[7px] uppercase mb-2 block">Boutique Collective</span>
          <h2 className="text-xl md:text-3xl font-serif text-white mb-4 tracking-tight leading-tight uppercase">Authentic Crafts. Refined Design.</h2>
          <button 
            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-stone-900 px-6 py-2 rounded-full font-bold hover:scale-105 transition-all shadow-xl text-[8px] uppercase tracking-widest"
          >
            Explore Catalogue
          </button>
        </div>
      </section>

      {/* Promotions Banner - Scaled down */}
      {promotions.length > 0 && (
        <section className="px-4 md:px-10 mt-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {promotions.map(p => (
              <div key={p.id} className="bg-white border border-stone-100 rounded-xl overflow-hidden flex h-20 md:h-24 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-1/4 bg-stone-50 shrink-0 overflow-hidden">
                  {p.imageUrl ? (
                    <img src={optimizeImage(p.imageUrl, 400)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.code} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-200">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </div>
                <div className="p-2 md:p-3 flex flex-col justify-center flex-grow">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[6px] font-mono font-bold text-orange-600 bg-orange-50 px-1 py-0.5 rounded tracking-widest">{p.code}</span>
                    <span className="text-[6px] font-bold uppercase text-stone-400">{p.value}% OFF</span>
                  </div>
                  <h4 className="text-[9px] font-bold text-stone-900 uppercase tracking-widest line-clamp-1">{p.description}</h4>
                  <p className="text-[6px] text-stone-400 mt-0.5 uppercase tracking-widest">Limited Offer</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Filter - Sticky Full Width */}
      <section id="collection" className="px-4 md:px-10 py-3 flex justify-center sticky top-14 z-40 bg-[#fcfcf9]/95 backdrop-blur-md border-b border-stone-100 mt-2 w-full">
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[7px] font-bold uppercase tracking-widest border transition-all ${activeCategory === 'all' ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[7px] font-bold uppercase tracking-widest border transition-all ${activeCategory === cat.id ? 'bg-stone-900 text-white border-stone-900 shadow-md' : 'bg-white text-stone-400 border-stone-100 hover:border-stone-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid - Denser Full Width */}
      <section className="px-4 md:px-10 mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 w-full">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
        ))}
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} />}
      
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

const SparkleIcon = () => (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500">
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

const ProductCard: React.FC<{ product: Product, onClick: () => void }> = ({ product, onClick }) => {
  const isComingSoon = product.variants?.every(v => v.isComingSoon) || false;
  const isOutOfStock = !isComingSoon && (product.variants?.every(v => v.stock === 0 && !v.leadTime) || false);
  const hasInStock = product.variants?.some(v => v.stock > 0 && !v.isComingSoon);
  const hasPreOrder = product.variants?.some(v => v.stock === 0 && !!v.leadTime && !v.isComingSoon);

  return (
    <div 
      className="group bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border border-stone-100 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-stone-50">
        <img 
          src={optimizeImage(product.images[0], 500)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-0.5">
          {isComingSoon && <span className="bg-stone-900 text-white text-[5px] md:text-[6px] font-bold px-1 py-0.5 rounded tracking-widest uppercase">Soon</span>}
          {hasInStock && <span className="bg-green-600 text-white text-[5px] md:text-[6px] font-bold px-1 py-0.5 rounded tracking-widest uppercase flex items-center gap-0.5 shadow-sm"><Zap size={5} fill="currentColor" /> Ready</span>}
          {hasPreOrder && !hasInStock && <span className="bg-orange-600 text-white text-[5px] md:text-[6px] font-bold px-1 py-0.5 rounded tracking-widest uppercase flex items-center gap-0.5 shadow-sm"><CalendarClock size={5} /> Pre</span>}
        </div>
      </div>
      <div className="p-2 md:p-2.5">
        <h3 className="font-serif font-bold text-stone-900 text-[10px] md:text-[11px] group-hover:text-orange-600 transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex items-end justify-between mt-1">
          <span className="font-bold text-stone-900 text-[9px] md:text-[10px]">GH₵ {product.basePrice.toLocaleString()}</span>
          <div className="flex -space-x-1">
            {Array.from(new Set(product.variants?.map(v => v.hexColor) || [])).slice(0, 3).map(color => (
              <div key={color} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border border-white ring-1 ring-stone-100 shadow-sm" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductModal = ({ product, onClose, addToCart }: any) => {
  const { categories } = useAppContext();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants?.find((v:any) => (v.stock > 0 || v.leadTime) && !v.isComingSoon) || product.variants?.[0]
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const colors = Array.from(new Set(product.variants?.map((v: any) => v.colorName) || [])).map(name => 
    product.variants?.find((v: any) => v.colorName === name)!
  );
  const sizesForColor = product.variants?.filter((v: any) => v.colorName === selectedVariant?.colorName) || [];
  const isInStock = selectedVariant?.stock > 0 && !selectedVariant?.isComingSoon;
  const isPreOrder = selectedVariant?.stock === 0 && !!selectedVariant?.leadTime && !selectedVariant?.isComingSoon;
  const canPurchase = isInStock || isPreOrder;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev + 1) % product.images.length);
  };
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
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
                src={optimizeImage(product.images[activeImageIdx], 800)} 
                className="w-full h-full object-contain transition-all duration-500" 
                alt={product.name} 
              />
            </div>
            
            {product.images.length > 1 && (
              <>
                {/* Fixed Navigation Arrows - Prominent on Mobile */}
                <button 
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-stone-200 flex items-center justify-center text-stone-900 shadow-lg z-20 hover:scale-110 active:scale-95 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur border border-stone-200 flex items-center justify-center text-stone-900 shadow-lg z-20 hover:scale-110 active:scale-95 transition-all"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Indicators - Larger Touch Area */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 px-4 py-2 rounded-full bg-white/40 backdrop-blur-md z-20 border border-white/50">
                  {product.images.map((_:any, i:number) => (
                    <button 
                      key={i} 
                      onClick={(e) => { e.stopPropagation(); setActiveImageIdx(i); }} 
                      className={`h-2 rounded-full transition-all ${i === activeImageIdx ? 'bg-stone-900 w-5' : 'bg-stone-400 w-2 hover:bg-stone-600'}`} 
                    />
                  ))}
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
              {isPreOrder && <span className="bg-orange-50 text-orange-700 text-[7px] font-bold px-2 py-1 rounded-full uppercase tracking-widest border border-orange-100">Ships in {selectedVariant.leadTime}</span>}
            </div>
            <p className="text-stone-500 text-[11px] leading-relaxed mb-6 font-medium tracking-wide">{product.description}</p>
            
            <div className="space-y-6 mb-8">
              {colors.length > 0 && (
                <div>
                  <label className="text-[7px] font-bold uppercase text-stone-400 block mb-2 tracking-widest">Colorway: {selectedVariant?.colorName}</label>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c: any) => (
                      <button 
                        key={c.id} 
                        onClick={() => setSelectedVariant(product.variants.find((v:any) => v.colorName === c.colorName)!)} 
                        className={`w-7 h-7 rounded-full border transition-all p-0.5 ${selectedVariant?.colorName === c.colorName ? 'border-stone-900 ring-2 ring-stone-900/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hexColor }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizesForColor.some((s: any) => s.size && s.size !== 'No Size') && (
                <div>
                  <label className="text-[7px] font-bold uppercase text-stone-400 block mb-2 tracking-widest">Available Sizes</label>
                  <div className="flex flex-wrap gap-1.5">
                    {sizesForColor.map((s: any) => {
                      const available = (s.stock > 0 || !!s.leadTime) && !s.isComingSoon;
                      return (
                        <button 
                          key={s.id} 
                          disabled={!available} 
                          onClick={() => setSelectedVariant(s)} 
                          className={`px-3 py-1.5 text-[9px] font-bold border rounded-lg transition-all ${selectedVariant?.id === s.id ? 'bg-stone-900 text-white border-stone-900 shadow-sm' : 'bg-white border-stone-100 hover:border-stone-300 disabled:opacity-20'}`}
                        >
                          {s.size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-auto">
              <button 
                disabled={!canPurchase} 
                onClick={() => { addToCart(product.id, selectedVariant.id, 1); onClose(); }} 
                className={`w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl ${canPurchase ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-100 text-stone-300'}`}
              >
                <ShoppingBag size={16} />
                <span className="text-[11px] uppercase tracking-[0.15em]">Add to Collection</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storefront;
