'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, ShieldCheck, User as UserIcon, Package, Search, Heart, Menu, Phone, Mail, ChevronDown, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AdminGate from './AdminGate';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

interface NavbarProps {
  navigate?: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
  const { user, profile, totalItems, setIsCartOpen, setIsAuthOpen, searchQuery, setSearchQuery, cartTotal } = useAppContext();
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const safeNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    if (navigate) {
      navigate(path);
      return;
    }

    let target = path === 'store' ? '/' : `/${path}`;
    if (['support', 'track-order', 'momo-guide', 'returns'].includes(path)) {
      target = `/info/${path}`;
    }
    
    router.push(target);
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
    <header className="w-full z-[100] bg-white">
      {/* Main Header */}
      <nav className="sticky top-0 bg-white border-b border-stone-100 w-full h-20 flex items-center shadow-sm">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 flex justify-between items-center">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-stone-900 hover:text-orange-500 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <button
            onClick={() => { safeNavigate('store'); setSearchQuery(''); }}
            className="flex items-center gap-1.5 group"
          >
            <span className="text-2xl font-black tracking-tighter text-stone-900 uppercase">
              Cartly<span className="text-orange-500">.</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 text-[10px] font-bold uppercase tracking-widest text-stone-900">
            <button onClick={() => { safeNavigate('store'); setSearchQuery(''); }} className="hover:text-orange-500 transition relative group">
              Home
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all" />
            </button>
            <button onClick={() => { safeNavigate('store'); setSearchQuery(''); }} className="hover:text-orange-500 transition relative group">
              Shop <ChevronDown size={10} className="inline ml-0.5" />
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all" />
            </button>
            <button onClick={() => safeNavigate('momo-guide')} className="hover:text-orange-500 transition relative group">
              Payment Guide
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all" />
            </button>
            {user && (
              <button
                onClick={() => safeNavigate('orders')}
                className="hover:text-orange-500 transition relative group flex items-center gap-1"
              >
                Orders
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all" />
              </button>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center bg-stone-50 rounded-full px-4 py-1.5 transition-all duration-300 ${isSearchVisible ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
              <Search size={14} className="text-stone-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) {
                    document.getElementById('collection-anchor')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="bg-transparent border-none outline-none text-[10px] font-bold text-stone-900 ml-2 w-full"
              />
            </div>
            <button 
              onClick={() => setIsSearchVisible(!isSearchVisible)}
              className="p-2 text-stone-900 hover:text-orange-500 transition-all"
            >
              <Search size={20} />
            </button>
            
            <div className="hidden sm:flex items-center gap-1">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-[9px] font-bold text-stone-900 leading-tight">
                      {profile?.fullName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-[7px] font-bold uppercase tracking-widest text-stone-400 leading-none">
                      {profile?.role === 'ADMIN' ? 'Admin' : 'Account'}
                    </p>
                  </div>
                  <button onClick={() => profile?.role === 'ADMIN' ? safeNavigate('admin') : null} className="p-2 text-stone-900 hover:text-orange-500 transition-all relative">
                    <UserIcon size={20} />
                    {profile?.role === 'ADMIN' && <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />}
                  </button>
                  <button onClick={handleLogout} className="p-2 text-stone-900 hover:text-red-500 transition-all">
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="p-2 text-stone-900 hover:text-orange-500 transition-all"
                >
                  <UserIcon size={20} />
                </button>
              )}
            </div>

            <button className="hidden sm:block p-2 text-stone-900 hover:text-orange-500 transition-all relative">
              <Heart size={20} />
              <span className="absolute top-1 right-1 h-3.5 w-3.5 bg-orange-500 text-white text-[7px] font-bold flex items-center justify-center rounded-full border border-white">0</span>
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-900 hover:text-orange-500 transition-all flex items-center gap-2"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-orange-500 text-white text-[7px] font-bold flex items-center justify-center rounded-full border border-white">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[7px] font-bold uppercase tracking-widest text-stone-400 leading-none">Your Cart</p>
                <p className="text-[9px] font-bold text-stone-900 leading-tight">GH₵ {cartTotal.toLocaleString()}</p>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {isAdminGateOpen && user && (
        <AdminGate
          uid={user.uid}
          onSuccess={() => { setIsAdminGateOpen(false); safeNavigate('admin'); }}
          onClose={() => setIsAdminGateOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            <div className="p-6 border-b border-stone-100 flex justify-between items-center">
              <span className="text-xl font-black tracking-tighter text-stone-900 uppercase">
                Cartly<span className="text-orange-500">.</span>
              </span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-stone-400 hover:text-stone-900">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Navigation</p>
                <div className="flex flex-col gap-4">
                  <button onClick={() => safeNavigate('store')} className="text-left font-bold text-stone-900 hover:text-orange-500 transition-colors">Home</button>
                  <button onClick={() => safeNavigate('store')} className="text-left font-bold text-stone-900 hover:text-orange-500 transition-colors">Shop</button>
                  <button onClick={() => safeNavigate('momo-guide')} className="text-left font-bold text-stone-900 hover:text-orange-500 transition-colors">Payment Guide</button>
                  {user && (
                    <button onClick={() => safeNavigate('orders')} className="text-left font-bold text-stone-900 hover:text-orange-500 transition-colors">My Orders</button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">Account</p>
                <div className="flex flex-col gap-4">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500">
                          <UserIcon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{profile?.fullName || 'User'}</p>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{profile?.role || 'Customer'}</p>
                        </div>
                      </div>
                      {profile?.role === 'ADMIN' && (
                        <button onClick={() => safeNavigate('admin')} className="text-left font-bold text-orange-500 flex items-center gap-2">
                          <ShieldCheck size={18} /> Admin Panel
                        </button>
                      )}
                      <button onClick={handleLogout} className="text-left font-bold text-red-500 flex items-center gap-2">
                        <LogOut size={18} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); setIsAuthOpen(true); }}
                      className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <UserIcon size={18} /> Sign In / Join
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-stone-100 bg-stone-50">
              <div className="flex items-center gap-4 text-stone-400">
                <Phone size={16} />
                <span className="text-xs font-bold">Support: 233 55 123 4567</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;