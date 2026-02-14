
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Menu, X, Package, LogIn, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Product, CartItem, Order, UserRole } from './types';
import { PRODUCTS, MOMO_CONFIG } from './constants';
import Storefront from './components/Storefront';
import AdminDashboard from './components/AdminDashboard';
import Checkout from './components/Checkout';
import AuthModal from './components/Auth';
import AdminGate from './components/AdminGate';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const App: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | 'checkout'>('store');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Secret Admin Entrance Listener: Look for ?admin-page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin-page') && user) {
      setIsAdminGateOpen(true);
      // Clean URL after triggering to keep it secret
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Firestore Listener for Orders (Gated for Admins only)
  useEffect(() => {
    if (profile?.role !== 'ADMIN') {
      setOrders([]);
      return;
    }

    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
      },
      (error) => {
        console.warn('Orders sync restricted:', error.message);
      }
    );

    return () => unsubscribe();
  }, [profile]);

  // Cart Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('kazi_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('kazi_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (productId: string, variantId: string, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.variantId === variantId);
      if (existing) {
        return prev.map(item => item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { productId, variantId, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variantId !== variantId));
  };

  const updateCartQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.variantId === variantId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      const variant = product?.variants.find(v => v.id === item.variantId);
      return sum + (variant?.price || 0) * item.quantity;
    }, 0);
  }, [cart]);

  const handleCheckoutComplete = () => {
    setCart([]);
    setView('store');
  };

  const handleLogout = () => {
    signOut(auth);
    setProfile(null);
    setView('store');
  };

  const toggleAdminView = () => {
    if (profile?.role === 'ADMIN') {
      setView(view === 'admin' ? 'store' : 'admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <h1 
                onClick={() => setView('store')}
                className="text-2xl font-bold tracking-tighter font-serif cursor-pointer text-stone-900"
              >
                KAZI
              </h1>
            </div>

            <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-600">
              <button onClick={() => setView('store')} className="hover:text-stone-900 transition font-medium">Collection</button>
              <button className="hover:text-stone-900 transition font-medium">Journal</button>
            </div>

            <div className="flex items-center gap-1 md:gap-3">
              {user ? (
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="hidden md:block mr-2 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                      {profile?.role === 'ADMIN' ? 'Principal' : 'Member'}
                    </p>
                    <p className="text-xs font-bold text-stone-900">{profile?.fullName || user.displayName || 'Account'}</p>
                  </div>
                  
                  {/* ADMIN ICON: Only visible once promoted to Admin */}
                  {profile?.role === 'ADMIN' && (
                    <button 
                      onClick={toggleAdminView}
                      className={`p-2.5 rounded-full transition-all ${view === 'admin' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-600 hover:bg-stone-100'}`}
                      title="Operations Dashboard"
                    >
                      <ShieldCheck size={20} className="text-orange-500" />
                    </button>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-full transition-all group"
                    title="Logout"
                  >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-full transition-all font-bold text-xs"
                >
                  <UserIcon size={14} />
                  <span>Join / Login</span>
                </button>
              )}
              
              <div className="w-px h-6 bg-stone-200 mx-1 md:mx-2" />

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 text-stone-900 hover:bg-stone-100 rounded-full transition-all"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {view === 'store' && <Storefront addToCart={addToCart} />}
        {view === 'admin' && <AdminDashboard orders={orders} />}
        {view === 'checkout' && (
          <Checkout 
            cart={cart} 
            total={cartTotal} 
            userProfile={profile}
            onComplete={handleCheckoutComplete}
            onCancel={() => setView('store')} 
          />
        )}
      </main>

      {isCartOpen && <CartDrawer cart={cart} total={cartTotal} totalItems={totalItems} updateQty={updateCartQuantity} remove={removeFromCart} onClose={() => setIsCartOpen(false)} onCheckout={() => {setIsCartOpen(false); setView('checkout');}} />}
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      
      {isAdminGateOpen && user && (
        <AdminGate 
          uid={user.uid} 
          onSuccess={() => { setIsAdminGateOpen(false); setView('admin'); }} 
          onClose={() => setIsAdminGateOpen(false)} 
        />
      )}
      
      <Footer />
    </div>
  );
};

const CartDrawer = ({ cart, total, totalItems, updateQty, remove, onClose, onCheckout }: any) => (
  <div className="fixed inset-0 z-[100] overflow-hidden">
    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
    <div className="absolute inset-y-0 right-0 max-w-full flex">
      <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <div className="px-8 py-8 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-serif">Shopping Bag ({totalItems})</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-900 transition-colors"><X size={24} /></button>
        </div>
        <div className="flex-grow overflow-y-auto px-8 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-4">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="font-medium">Your bag is empty.</p>
              <button onClick={onClose} className="text-stone-900 font-bold underline underline-offset-4 decoration-stone-200">Start Shopping</button>
            </div>
          ) : (
            <div className="space-y-8">
              {cart.map((item: any) => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                const variant = product?.variants.find(v => v.id === item.variantId);
                return (
                  <div key={item.variantId} className="flex gap-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="w-24 h-32 bg-stone-100 rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={product?.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-stone-900">{product?.name}</h3>
                        <button onClick={() => remove(item.variantId)} className="text-stone-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                      </div>
                      <p className="text-xs text-stone-500 mb-4">{variant?.colorName} • {variant?.size || 'Standard Size'}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center bg-stone-100 rounded-lg p-1">
                          <button onClick={() => updateQty(item.variantId, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all">-</button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQty(item.variantId, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-md transition-all">+</button>
                        </div>
                        <span className="font-bold text-stone-900 text-sm">UGX {(variant!.price * item.quantity).toLocaleString()}</span>
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
              <span className="text-2xl font-bold text-stone-900">UGX {total.toLocaleString()}</span>
            </div>
            <button onClick={onCheckout} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 transition-all active:scale-[0.98]">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-stone-900 text-stone-400 py-16 px-4 mt-auto">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
      <div className="col-span-1 md:col-span-1">
        <h2 className="text-3xl font-serif text-white mb-6">KAZI</h2>
        <p className="text-sm max-w-xs mx-auto md:mx-0 leading-relaxed">Modern retail crafted for the African professional. High quality. Manual verification. Local trust.</p>
      </div>
      <div>
        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Support</h4>
        <ul className="text-xs space-y-3">
          <li><a href="#" className="hover:text-white transition-colors">Track Order</a></li>
          <li><a href="#" className="hover:text-white transition-colors">MoMo Guide</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-6">Connected</h4>
        <p className="text-xs mb-4">Follow our journal for season launches.</p>
        <div className="flex justify-center md:justify-start gap-4">
          <div className="w-8 h-8 bg-stone-800 rounded-full hover:bg-stone-700 cursor-pointer transition-colors" />
          <div className="w-8 h-8 bg-stone-800 rounded-full hover:bg-stone-700 cursor-pointer transition-colors" />
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-stone-800 text-[10px] text-center uppercase tracking-widest opacity-40">
      © 2024 Kazi Retail Limited. Secure Payments via MoMo.
    </div>
  </footer>
);

export default App;
