
import React, { useState } from 'react';
import { ShoppingBag, Star, Clock, ShieldCheck, X } from 'lucide-react';
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
      <section className="relative h-[45vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-stone-100">
        <img 
          src={optimizeImage("https://picsum.photos/seed/kazi-hero/1920/1080", 1200)} 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          alt="Premium African Fashion"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <span className="text-orange-400 font-bold tracking-widest text-xs uppercase mb-4 block">New Season Arrival</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Designed for the Modern African</h2>
          <button className="bg-white text-stone-900 px-8 py-4 rounded-full font-bold hover:bg-orange-50 transition-all">
            Explore Collection
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4 mt-8 overflow-x-auto scrollbar-hide flex justify-center">
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-6 py-2 rounded-full text-xs font-bold border transition ${activeCategory === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
          >
            All Items
          </button>
          {CATEGORIES.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2 rounded-full text-xs font-bold border transition ${activeCategory === cat.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 mt-12 grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {filteredProducts.map(product => (
          <div 
            key={product.id} 
            className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={optimizeImage(product.images[0], 600)} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              {product.variants.some(v => v.isComingSoon) && (
                <span className="absolute top-2 left-2 bg-orange-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">PRE-ORDER</span>
              )}
            </div>
            <div className="p-3 md:p-5">
              <h3 className="font-bold text-stone-900 text-sm md:text-lg mb-1">{product.name}</h3>
              <p className="text-xs text-stone-500 line-clamp-1 mb-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-stone-900 text-sm md:text-base">UGX {product.basePrice.toLocaleString()}</span>
                <div className="flex -space-x-1">
                  {Array.from(new Set(product.variants.map(v => v.hexColor))).slice(0, 3).map(color => (
                    <div key={color} className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} addToCart={addToCart} />}
    </div>
  );
};

const ProductModal = ({ product, onClose, addToCart }: any) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);

  const colors = Array.from(new Set(product.variants.map((v: any) => v.colorName))).map(name => 
    product.variants.find((v: any) => v.colorName === name)!
  );

  const sizes = product.variants.filter((v: any) => v.colorName === selectedVariant?.colorName);

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-white/50 backdrop-blur p-2 rounded-full text-stone-900"><X size={20} /></button>
        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
          <div className="w-full md:w-1/2 aspect-[4/5] bg-stone-100">
            <img src={optimizeImage(product.images[0], 800)} className="w-full h-full object-cover" />
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <h2 className="text-3xl font-serif font-bold mb-2">{product.name}</h2>
            <p className="text-2xl font-bold text-stone-900 mb-6">UGX {selectedVariant.price.toLocaleString()}</p>
            <p className="text-stone-600 text-sm mb-8 leading-relaxed">{product.description}</p>
            
            <div className="mb-6">
              <label className="text-[10px] font-bold uppercase text-stone-400 block mb-2">Color: {selectedVariant.colorName}</label>
              <div className="flex gap-2">
                {colors.map((c: any) => (
                  <button key={c.id} onClick={() => setSelectedVariant(c)} className={`w-8 h-8 rounded-full border-2 p-1 ${selectedVariant.colorName === c.colorName ? 'border-stone-900' : 'border-transparent'}`}>
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: c.hexColor }} />
                  </button>
                ))}
              </div>
            </div>

            {sizes.some((s: any) => s.size) && (
              <div className="mb-8">
                <label className="text-[10px] font-bold uppercase text-stone-400 block mb-2">Size</label>
                <div className="flex gap-2">
                  {sizes.map((s: any) => (
                    <button key={s.id} onClick={() => setSelectedVariant(s)} className={`px-4 py-2 text-xs font-bold border rounded-lg ${selectedVariant.id === s.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white border-stone-200'}`}>
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <div className="flex items-center border border-stone-200 rounded-xl px-2">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2">-</button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="p-2">+</button>
              </div>
              <button 
                onClick={() => { addToCart(product.id, selectedVariant.id, quantity); onClose(); }}
                className="flex-grow bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storefront;
