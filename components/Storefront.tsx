import React, { useState } from 'react';
import { ShoppingBag, Star, Clock, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../constants';
import { Product, ProductVariant } from '../types';
import { optimizeImage } from '../cloudinary';

interface StorefrontProps {
  addToCart: (productId: string, variantId: string, quantity: number) => void;
}

const Storefront: React.FC<StorefrontProps> = ({ addToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.categoryId === activeCategory);

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-stone-900">
        <img 
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Premium African Fashion"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/20 via-stone-950/40 to-stone-950/80" />
        <div className="relative z-10 text-center px-4 max-w-3xl animate-fade-in">
          <span className="text-orange-400 font-bold tracking-[0.4em] text-[10px] uppercase mb-6 block">Kazi Collection 2025</span>
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight">Essence of the Hustle.</h2>
          <button 
            onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-stone-900 px-10 py-5 rounded-full font-bold hover:scale-105 transition-all shadow-2xl"
          >
            Shop the Collection
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section id="collection" className="px-4 py-12 flex justify-center sticky top-16 z-40 bg-[#fcfcf9]/90 backdrop-blur-md border-b border-stone-100">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeCategory === 'all' ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeCategory === cat.id ? 'bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-900/20' : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 mt-12 grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
        ))}
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} />}
    </div>
  );
};

const ProductCard = ({ product, onClick }: { product: Product, onClick: () => void }) => {
  const isComingSoon = product.variants.every(v => v.isComingSoon);
  const isOutOfStock = !isComingSoon && product.variants.every(v => v.stock === 0);

  return (
    <div 
      className="group bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]"
      onClick={onClick}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
        <img 
          src={optimizeImage(product.images[0], 600)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out"
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isComingSoon && (
            <span className="bg-stone-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-xl">Coming Soon</span>
          )}
          {isOutOfStock && (
            <span className="bg-stone-100 text-stone-500 text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-xl">Out of Stock</span>
          )}
          {product.isFeatured && !isComingSoon && !isOutOfStock && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase shadow-xl">Featured</span>
          )}
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif font-bold text-stone-900 text-lg md:text-xl group-hover:text-orange-600 transition-colors">{product.name}</h3>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Starting from</p>
            <span className="font-bold text-stone-900 text-lg">UGX {product.basePrice.toLocaleString()}</span>
          </div>
          <div className="flex -space-x-1.5">
            {Array.from(new Set(product.variants.map(v => v.hexColor))).map(color => (
              <div key={color} className="w-4 h-4 rounded-full border-2 border-white ring-1 ring-stone-100 shadow-sm" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductModal = ({ product, onClose, addToCart }: any) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants.find((v:any) => v.stock > 0 && !v.isComingSoon) || product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const colors = Array.from(new Set(product.variants.map((v: any) => v.colorName))).map(name => 
    product.variants.find((v: any) => v.colorName === name)!
  );

  const sizesForColor = product.variants.filter((v: any) => v.colorName === selectedVariant?.colorName);

  const canPurchase = selectedVariant.stock > 0 && !selectedVariant.isComingSoon;

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-700 ease-out">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur p-3 rounded-full text-stone-900 hover:bg-white transition-all shadow-lg"><X size={20} /></button>
        
        <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
          {/* Gallery Side */}
          <div className="w-full lg:w-1/2 aspect-square lg:aspect-auto bg-stone-50 overflow-hidden">
            <img src={optimizeImage(product.images[0], 1200)} className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-110" />
          </div>

          {/* Details Side */}
          <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col">
            <nav className="mb-6 flex gap-2">
              {CATEGORIES.filter(c => c.id === product.categoryId).map(c => (
                <span key={c.id} className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{c.name}</span>
              ))}
            </nav>

            <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">{product.name}</h2>
            <div className="flex items-baseline gap-4 mb-8">
              <p className="text-3xl font-bold text-stone-900">UGX {selectedVariant.price.toLocaleString()}</p>
              {selectedVariant.isComingSoon && <span className="text-orange-500 font-bold uppercase tracking-widest text-[10px] bg-orange-50 px-3 py-1 rounded-full">Coming Soon</span>}
            </div>

            <p className="text-stone-500 text-sm leading-loose mb-10">{product.description}</p>
            
            {/* Color Select */}
            <div className="mb-10">
              <label className="text-[10px] font-bold uppercase text-stone-400 block mb-4 tracking-[0.2em]">Select Color: <span className="text-stone-900">{selectedVariant.colorName}</span></label>
              <div className="flex gap-4">
                {colors.map((c: any) => (
                  <button 
                    key={c.id} 
                    onClick={() => {
                      const firstAvail = product.variants.find((v:any) => v.colorName === c.colorName && v.stock > 0 && !v.isComingSoon) || 
                                         product.variants.find((v:any) => v.colorName === c.colorName);
                      setSelectedVariant(firstAvail);
                    }} 
                    className={`w-12 h-12 rounded-full border-2 p-1 transition-all ${selectedVariant.colorName === c.colorName ? 'border-stone-900 scale-110' : 'border-transparent hover:border-stone-200'}`}
                  >
                    <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: c.hexColor }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Select */}
            {sizesForColor.some((s: any) => s.size) && (
              <div className="mb-12">
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-4 tracking-[0.2em]">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {sizesForColor.map((s: any) => {
                    const isDisabled = s.stock === 0 || s.isComingSoon;
                    return (
                      <button 
                        key={s.id} 
                        disabled={isDisabled}
                        onClick={() => setSelectedVariant(s)} 
                        className={`min-w-[4rem] px-6 py-4 text-xs font-bold border-2 rounded-2xl transition-all ${selectedVariant.id === s.id ? 'bg-stone-900 text-white border-stone-900 shadow-xl shadow-stone-900/20' : isDisabled ? 'opacity-30 border-stone-100 cursor-not-allowed line-through' : 'bg-white border-stone-100 hover:border-stone-300'}`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-auto space-y-6">
              <div className="flex gap-4">
                <div className="flex items-center bg-stone-50 border border-stone-100 rounded-2xl px-3 h-16">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center font-bold text-stone-400 hover:text-stone-900 transition-colors">-</button>
                  <span className="w-10 text-center font-bold text-stone-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center font-bold text-stone-400 hover:text-stone-900 transition-colors">+</button>
                </div>
                
                <button 
                  disabled={!canPurchase}
                  onClick={() => { addToCart(product.id, selectedVariant.id, quantity); onClose(); }}
                  className={`flex-grow h-16 rounded-2xl font-bold flex items-center justify-center gap-4 transition-all shadow-2xl shadow-stone-900/10 ${canPurchase ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98]' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                >
                  <ShoppingBag size={20} />
                  <span>
                    {selectedVariant.isComingSoon ? 'Coming Soon' : selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Shopping Bag'}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-stone-400 text-[10px] font-bold uppercase tracking-widest bg-stone-50 p-4 rounded-2xl">
                  <ShieldCheck size={18} className="text-orange-500" />
                  <span>Quality Assured</span>
                </div>
                <div className="flex items-center gap-3 text-stone-400 text-[10px] font-bold uppercase tracking-widest bg-stone-50 p-4 rounded-2xl">
                  <Clock size={18} className="text-orange-500" />
                  <span>Fast Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storefront;