
'use client';
import React from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { PRODUCTS } from '../constants';

interface CartDrawerProps {
  navigate?: (path: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ navigate }) => {
  const { cart, cartTotal, totalItems, isCartOpen, setIsCartOpen, updateCartQuantity, removeFromCart } = useAppContext();

  const safeNavigate = (path: string) => {
    if (navigate) {
      navigate(path);
    } else {
      const target = path === 'store' ? '/' : `/${path}`;
      window.location.href = target;
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
          <div className="px-8 py-8 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold font-serif">Shopping Bag ({totalItems})</h2>
            <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-900 transition-colors"><X size={24} /></button>
          </div>
          <div className="flex-grow overflow-y-auto px-8 py-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
                <ShoppingCart size={48} strokeWidth={1} />
                <p className="font-medium">Your bag is empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="text-stone-900 font-bold underline underline-offset-4 decoration-stone-200">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-8">
                {cart.map((item: any) => {
                  const product = PRODUCTS.find(p => p.id === item.productId);
                  const variant = product?.variants.find(v => v.id === item.variantId);
                  return (
                    <div key={item.variantId} className="flex gap-6 animate-in fade-in slide-in-from-bottom-2">
                      <div className="w-24 h-32 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={product?.images[0]} className="w-full h-full object-cover" alt={product?.name} />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-stone-900">{product?.name}</h3>
                          <button onClick={() => removeFromCart(item.variantId)} className="text-stone-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                        <p className="text-xs text-stone-500 mb-4">{variant?.colorName} • {variant?.size || 'Standard Size'}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center bg-stone-100 rounded-lg p-1">
                            <button onClick={() => updateCartQuantity(item.variantId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all">-</button>
                            <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                            <button onClick={() => updateCartQuantity(item.variantId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all">+</button>
                          </div>
                          <span className="font-bold text-stone-900 text-sm">GH₵ {(variant!.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="p-8 bg-stone-50 border-t border-stone-100">
              <div className="flex justify-between mb-6">
                <span className="text-stone-500 font-medium">Estimated Total</span>
                <span className="text-2xl font-bold text-stone-900">GH₵ {cartTotal.toLocaleString()}</span>
              </div>
              <button onClick={() => { setIsCartOpen(false); safeNavigate('checkout'); }} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 transition-all active:scale-[0.98]">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
