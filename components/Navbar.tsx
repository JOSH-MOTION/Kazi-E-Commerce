
'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, ShieldCheck, User as UserIcon, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AdminGate from './AdminGate';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from '../firebase';

interface NavbarProps {
  navigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
  const { user, profile, totalItems, setIsCartOpen, setIsAuthOpen } = useAppContext();
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);

  const safeNavigate = (path: string) => {
    if (navigate) {
      navigate(path);
    } else {
      const target = path === 'store' ? '/' : `/${path}`;
      window.location.hash = target === '/' ? 'store' : target.replace('/', '');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin-page') && user) {
      setIsAdminGateOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
    safeNavigate('store');
  };

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={() => safeNavigate('store')} className="text-2xl font-bold tracking-tighter font-serif text-stone-900">
            KAZI
          </button>

          <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-600">
            <button onClick={() => safeNavigate('store')} className="hover:text-stone-900 transition">Collection</button>
            {user && <button onClick={() => safeNavigate('orders')} className="hover:text-stone-900 transition flex items-center gap-2"><Package size={14}/> My Orders</button>}
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            {user ? (
              <div className="flex items-center gap-1 md:gap-2">
                <div className="hidden md:block mr-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    {profile?.role === 'ADMIN' ? 'Principal' : 'Member'}
                  </p>
                  <p className="text-xs font-bold text-stone-900 line-clamp-1 max-w-[120px]">{profile?.fullName || user.displayName || 'Account'}</p>
                </div>
                
                {profile?.role === 'ADMIN' && (
                  <button 
                    onClick={() => safeNavigate('admin')}
                    className="p-2.5 rounded-full text-stone-600 hover:bg-stone-100 transition-all"
                  >
                    <ShieldCheck size={20} className="text-orange-500" />
                  </button>
                )}

                <button onClick={handleLogout} className="p-2.5 text-stone-600 hover:bg-stone-100 rounded-full transition-all">
                  <LogOut size={20} />
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

      {isAdminGateOpen && user && (
        <AdminGate 
          uid={user.uid} 
          onSuccess={() => { setIsAdminGateOpen(false); safeNavigate('admin'); }} 
          onClose={() => setIsAdminGateOpen(false)} 
        />
      )}
    </nav>
  );
};

export default Navbar;
