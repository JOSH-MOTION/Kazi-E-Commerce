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

const isNextJs = (): boolean => {
  try {
    return typeof window !== 'undefined' && !!(window as any).__NEXT_DATA__;
  } catch {
    return false;
  }
};

const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
  const { user, profile, totalItems, setIsCartOpen, setIsAuthOpen } = useAppContext();
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);

  const safeNavigate = (path: string) => {
    if (navigate) {
      navigate(path);
    } else if (isNextJs()) {
      const target = path === 'store' ? '/' : `/${path}`;
      window.location.href = target;
    } else {
      window.location.hash = path === 'store' ? '' : path;
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
    <nav className="sticky top-0 z-[100] bg-white/90 backdrop-blur-md border-b border-stone-100 w-full h-14 flex items-center">
      <div className="w-full px-4 md:px-10 flex justify-between items-center">
        <button
          onClick={() => safeNavigate('store')}
          className="text-lg font-bold tracking-tighter font-serif text-stone-900"
        >
          J&B MARKET
        </button>

        <div className="hidden md:flex space-x-6 text-[8px] font-bold uppercase tracking-widest text-stone-400">
          <button onClick={() => safeNavigate('store')} className="hover:text-stone-900 transition">
            Store
          </button>
          <button onClick={() => safeNavigate('momo-guide')} className="hover:text-stone-900 transition">
            Payment Guide
          </button>
          {user && (
            <button
              onClick={() => safeNavigate('orders')}
              className="hover:text-stone-900 transition flex items-center gap-1.5"
            >
              <Package size={10} /> Orders
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-right mr-1">
                <p className="text-[6px] font-bold uppercase tracking-widest text-stone-400 leading-none">
                  {profile?.role === 'ADMIN' ? 'Administrator' : 'Collector'}
                </p>
                <p className="text-[9px] font-bold text-stone-900 leading-tight">
                  {profile?.fullName?.split(' ')[0] || 'User'}
                </p>
              </div>

              {profile?.role === 'ADMIN' && (
                <button
                  onClick={() => safeNavigate('admin')}
                  className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-50 transition-all"
                  title="Admin Dashboard"
                >
                  <ShieldCheck size={16} className="text-orange-500" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="p-1.5 text-stone-500 hover:bg-stone-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-all font-bold text-[8px] uppercase tracking-widest"
            >
              <UserIcon size={10} />
              <span>Login</span>
            </button>
          )}

          <div className="w-px h-3 bg-stone-100 mx-1" />

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1.5 text-stone-900 hover:bg-stone-100 rounded-lg transition-all"
          >
            <ShoppingCart size={16} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-orange-600 text-white text-[7px] font-bold flex items-center justify-center rounded-full border border-white">
                {totalItems}
              </span>
            )}
          </button>
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