import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductVariant } from '../types';
import { optimizeImage } from '../cloudinary';
import { useAppContext } from '../context/AppContext';
import { Search, Heart, ShoppingBag, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  addToCart: (productId: string, variantId: string, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useAppContext();
  const variants = product.variants || [];

  // Get unique colors
  const uniqueColors = Array.from(
    new Map(variants.map(v => [v.colorName, v])).values()
  );

  // Track which color is being hovered/selected on the card
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const activeColorName = hoveredColor || uniqueColors[0]?.colorName;
  const activeVariant = variants.find(v => v.colorName === activeColorName) || variants[0];

  const isComingSoon = variants?.every(v => v.isComingSoon) || false;
  const hasInStock = variants?.some(v => v.stock > 0 && !v.isComingSoon);

  // Show the active color's image if it has one, otherwise fallback to product image
  const displayImage = activeVariant?.images?.[0] || product.images[0];

  const minPrice = Math.min(...variants.map(v => v.price));
  const maxPrice = Math.max(...variants.map(v => v.price));

  return (
    <div className="group cursor-pointer" onClick={() => router.push(`/product/${product.id}`)}>
      <div className="relative aspect-3/4 overflow-hidden bg-[#f9f9f9] rounded-sm mb-4">
        <img 
          src={optimizeImage(displayImage, 500)} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isComingSoon && <span className="bg-stone-900 text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">Soon</span>}
          {!isComingSoon && hasInStock && product.isFeatured && (
            <span className="bg-orange-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest">Featured</span>
          )}
        </div>

        {/* Color count badge — top right */}
        {uniqueColors.length > 1 && (
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm text-stone-600 text-[7px] font-bold px-1.5 py-0.5 rounded-full border border-stone-200 shadow-sm">
              {uniqueColors.length} colors
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm flex justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/product/${product.id}`); }}
            className="p-2 text-stone-600 hover:text-orange-500 transition-colors"
          >
            <Search size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            className={`p-2 transition-colors ${isInWishlist(product.id) ? 'text-red-500' : 'text-stone-600 hover:text-red-500'}`}
          >
            <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); router.push(`/product/${product.id}`); }}
            className="p-2 text-stone-600 hover:text-orange-500 transition-colors"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">{product.name}</h3>

        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={8} className={i < 4 ? "fill-orange-500 text-orange-500" : "text-stone-300"} />
          ))}
          <span className="text-[10px] text-stone-500 ml-1">(124)</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-stone-900">
            GH₵ {minPrice === maxPrice ? minPrice : `${minPrice}–${maxPrice}`}
          </span>
        </div>

        {/* Color swatches row */}
        {uniqueColors.length > 1 && (
          <div className="flex items-center gap-1.5 pt-1">
            {uniqueColors.slice(0, 6).map((colorVariant) => {
              const isActive = colorVariant.colorName === activeColorName;
              const swatchImage = colorVariant.images?.[0];
              return (
                <button
                  key={colorVariant.colorName}
                  title={colorVariant.colorName}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHoveredColor(colorVariant.colorName);
                  }}
                  onMouseEnter={() => setHoveredColor(colorVariant.colorName)}
                  onMouseLeave={() => setHoveredColor(null)}
                  className={`transition-all duration-150 rounded-full ${isActive ? 'ring-2 ring-offset-1 ring-stone-900 scale-110' : 'ring-1 ring-stone-200 hover:scale-105'}`}
                >
                  {swatchImage ? (
                    <div className="w-4 h-4 rounded-full overflow-hidden">
                      <img src={optimizeImage(swatchImage, 40)} className="w-full h-full object-cover" alt={colorVariant.colorName} />
                    </div>
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: colorVariant.hexColor || '#1a1a1a' }}
                    />
                  )}
                </button>
              );
            })}
            {uniqueColors.length > 6 && (
              <span className="text-[8px] text-stone-400 font-bold">+{uniqueColors.length - 6}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;