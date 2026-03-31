'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Heart, Star, Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Check } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { Product, ProductVariant } from '../../../types';
import { optimizeImage } from '../../../cloudinary';

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { products, addToCart, toggleWishlist, isInWishlist } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeColorName, setActiveColorName] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) { setIsLoading(false); return; }
    const foundProduct = products.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
      const firstVariant = foundProduct.variants?.[0] || null;
      setSelectedVariant(firstVariant);
      setActiveColorName(firstVariant?.colorName || null);
      setSelectedImage(0);
    }
    setIsLoading(false);
  }, [params.id, products]);

  // When color changes, auto-select first available size of that color
  const handleColorSelect = (colorName: string) => {
    setActiveColorName(colorName);
    if (!product) return;
    const variantsForColor = product.variants.filter(v => v.colorName === colorName);
    // Prefer in-stock, otherwise just first
    const best = variantsForColor.find(v => v.stock > 0 && !v.isComingSoon) || variantsForColor[0];
    setSelectedVariant(best || null);
    setSelectedImage(0);
  };

  // Unique colors
  const uniqueColors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Map(product.variants.map(v => [v.colorName, v])).values());
  }, [product]);

  // Sizes for current color
  const sizesForColor = useMemo(() => {
    if (!product || !activeColorName) return [];
    return product.variants.filter(v => v.colorName === activeColorName);
  }, [product, activeColorName]);

  const hasSizes = sizesForColor.some(v => v.size && v.size !== 'No Size' && v.size !== null);

  // Images: color-specific first, then product gallery
  const displayImages = useMemo(() => {
    if (!product) return [];
    const colorImgs = selectedVariant?.images || [];
    const productImgs = product.images || [];
    const combined = [...colorImgs, ...productImgs.filter(i => !colorImgs.includes(i))];
    return combined.length > 0 ? combined : ['https://via.placeholder.com/400x400/f9f9f9/999999?text=No+Image'];
  }, [product, selectedVariant]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Product Not Found</h1>
          <button onClick={() => router.push('/')} className="bg-orange-500 text-white px-6 py-3 rounded-sm hover:bg-orange-600 transition-colors">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product.id, selectedVariant.id, quantity);
    }
  };

  const isInStock = selectedVariant && selectedVariant.stock > 0 && !selectedVariant.isComingSoon;
  const isPreOrder = selectedVariant && selectedVariant.stock === 0 && !!selectedVariant.leadTime && !selectedVariant.isComingSoon;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => router.push('/')} className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Store</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-sm bg-stone-50">
              <img
                src={optimizeImage(displayImages[selectedImage], 800)}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x400/f9f9f9/999999?text=Image+Error'; }}
              />
            </div>
            {displayImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-orange-500' : 'border-stone-200'}`}
                  >
                    <img src={optimizeImage(image, 100)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-7">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < 4 ? "fill-orange-500 text-orange-500" : "text-stone-300"} />
                  ))}
                </div>
                <span className="text-stone-500 text-sm">(124 reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-stone-900">
                  GH₵ {selectedVariant?.price || product.basePrice || 0}
                </span>
                {isPreOrder && (
                  <span className="text-sm text-orange-500 font-bold">Ships in {selectedVariant?.leadTime}</span>
                )}
              </div>
              <p className="text-stone-600 leading-relaxed">{product.description}</p>
            </div>

            {/* ── Color Selector ── */}
            {uniqueColors.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Color:</span>
                  <span className="text-sm font-bold text-stone-900">{activeColorName}</span>
                </div>

                {/* Swatch strip */}
                <div className="flex flex-wrap gap-3">
                  {uniqueColors.map((colorVariant) => {
                    const isActive = colorVariant.colorName === activeColorName;
                    const swatchImage = colorVariant.images?.[0];
                    const outOfStock = !product.variants.some(v => v.colorName === colorVariant.colorName && (v.stock > 0 || v.leadTime) && !v.isComingSoon);

                    return (
                      <button
                        key={colorVariant.colorName}
                        onClick={() => handleColorSelect(colorVariant.colorName)}
                        title={colorVariant.colorName}
                        className={`relative group transition-all duration-200 ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                      >
                        {/* Swatch */}
                        <div className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${isActive ? 'border-stone-900 shadow-lg ring-2 ring-stone-900/20' : 'border-stone-200 hover:border-stone-400'} ${outOfStock ? 'opacity-40' : ''}`}>
                          {swatchImage ? (
                            <img src={optimizeImage(swatchImage, 80)} className="w-full h-full object-cover" alt={colorVariant.colorName} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colorVariant.hexColor || '#1a1a1a' }}>
                              {isActive && <Check size={16} className="text-white drop-shadow-sm" />}
                            </div>
                          )}
                        </div>
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-stone-900" />
                        )}
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[8px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                          {colorVariant.colorName}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected color info strip */}
                <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl border border-stone-100">
                  {selectedVariant?.images?.[0] ? (
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                      <img src={optimizeImage(selectedVariant.images[0], 60)} className="w-full h-full object-cover" alt="" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg shrink-0 border border-stone-200" style={{ backgroundColor: selectedVariant?.hexColor || '#1a1a1a' }} />
                  )}
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-stone-900">{activeColorName}</p>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                      {hasSizes ? `${sizesForColor.filter(v => v.stock > 0).length} sizes in stock` : 'One size'}
                    </p>
                  </div>
                  {selectedVariant && (
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                      isInStock ? 'bg-green-50 text-green-600' 
                      : isPreOrder ? 'bg-orange-50 text-orange-600'
                      : 'bg-stone-100 text-stone-400'
                    }`}>
                      {isInStock ? 'In Stock' : isPreOrder ? `Pre-order` : 'Out of Stock'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* ── Size Selector ── */}
            {hasSizes && (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Size</span>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {sizesForColor.filter(v => v.size && v.size !== 'No Size' && v.size !== null).map((v) => {
                    const available = (v.stock > 0 || !!v.leadTime) && !v.isComingSoon;
                    const isSelected = selectedVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        disabled={!available}
                        onClick={() => setSelectedVariant(v)}
                        className={`relative h-11 flex flex-col items-center justify-center text-[11px] font-bold rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                            : available
                              ? 'bg-white text-stone-900 border-stone-200 hover:border-stone-400'
                              : 'bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed line-through'
                        }`}
                      >
                        {v.size}
                        {v.leadTime && !isSelected && available && (
                          <span className="text-[6px] text-orange-400 font-bold uppercase leading-none">P.O.</span>
                        )}
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                            <Check size={8} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-500">Qty</span>
                <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600 font-bold">−</button>
                  <span className="w-12 text-center font-bold text-stone-900 text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-stone-50 transition-colors text-stone-600 font-bold">+</button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.isComingSoon || selectedVariant.stock === 0 && !selectedVariant.leadTime}
                  className="flex-1 bg-stone-900 text-white py-4 rounded-xl font-bold hover:bg-orange-500 transition-colors disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag size={20} />
                  {selectedVariant?.isComingSoon ? 'Coming Soon' 
                    : selectedVariant?.stock === 0 && !selectedVariant?.leadTime ? 'Out of Stock' 
                    : selectedVariant?.leadTime && selectedVariant?.stock === 0 ? 'Pre-order'
                    : 'Add to Cart'}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-xl border-2 transition-colors ${isInWishlist(product.id) ? 'border-red-500 bg-red-50 text-red-500' : 'border-stone-200 hover:border-stone-400 text-stone-600'}`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Info pills */}
            <div className="border-t pt-6 grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Truck size={18} className="text-stone-400 shrink-0" />
                <span>Delivery via Yango or available delivery apps — price varies by ride</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <CreditCard size={18} className="text-stone-400 shrink-0" />
                <span>Payment via Mobile Money only</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-600">
                <Headphones size={18} className="text-stone-400 shrink-0" />
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}