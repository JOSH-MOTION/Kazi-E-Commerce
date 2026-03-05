'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Heart, Star, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
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

  useEffect(() => {
    const foundProduct = products.find(p => p.id === params.id);
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedVariant(foundProduct.variants?.[0] || null);
      setSelectedImage(0);
    }
  }, [params.id, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Product Not Found</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-orange-500 text-white px-6 py-3 rounded-sm hover:bg-orange-600 transition-colors"
          >
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const variants = product.variants || [];
  const images = [...(product.images || []), ...(selectedVariant?.images || [])];
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg'];

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product.id, selectedVariant.id, quantity);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Store</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-sm bg-stone-50">
              <img 
                src={optimizeImage(displayImages[selectedImage], 800)} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {displayImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`shrink-0 w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-orange-500' : 'border-stone-200'
                  }`}
                >
                  <img 
                    src={optimizeImage(image, 100)} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < 4 ? "fill-orange-500 text-orange-500" : "text-stone-300"} />
                  ))}
                </div>
                <span className="text-stone-600">(124 reviews)</span>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-stone-900">
                  GH₵ {selectedVariant?.price || product.basePrice || 0}
                </span>
              </div>

              <p className="text-stone-600 leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div>
                <h3 className="font-semibold text-stone-900 mb-3">Select Variant</h3>
                <div className="grid grid-cols-2 gap-3">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-sm border-2 transition-colors ${
                        selectedVariant?.id === variant.id 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-sm font-medium text-stone-900">{variant.colorName}</div>
                      <div className="text-lg font-bold text-stone-900">GH₵ {variant.price}</div>
                      {variant.stock <= 5 && variant.stock > 0 && (
                        <div className="text-xs text-orange-600 font-medium">Only {variant.stock} left</div>
                      )}
                      {variant.isComingSoon && (
                        <div className="text-xs text-stone-500 font-medium">Coming Soon</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-900 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-semibold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-sm border border-stone-300 flex items-center justify-center hover:bg-stone-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.isComingSoon || selectedVariant.stock === 0}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-sm font-semibold hover:bg-orange-600 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={20} />
                  {selectedVariant?.isComingSoon ? 'Coming Soon' : selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-3 rounded-sm border-2 transition-colors ${
                    isInWishlist(product.id) 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-stone-300 hover:border-stone-400 text-stone-600'
                  }`}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-stone-600" />
                <span className="text-sm text-stone-600">Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-stone-600" />
                <span className="text-sm text-stone-600">1-year warranty included</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw size={20} className="text-stone-600" />
                <span className="text-sm text-stone-600">30-day return policy</span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones size={20} className="text-stone-600" />
                <span className="text-sm text-stone-600">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
