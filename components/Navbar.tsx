
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AuthModal from './Auth';
import AdminGate from './AdminGate';
import { signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { auth } from '../firebase';

const Navbar = () => {
  const { user, profile, totalItems, setIsCartOpen } = useAppContext();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminGateOpen, setIsAdminGateOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('admin-page') && user) {
      setIsAdminGateOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [user]);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold tracking-tighter font-serif text-stone-900">
            KAZI
          </Link>

          <div className="hidden md:flex space-x-8 text-sm font-medium text-stone-600">
            <Link href="/" className={`hover:text-stone-900 transition ${pathname === '/' ? 'text-stone-900' : ''}`}>Collection</Link>
            <Link href="#" className="hover:text-stone-900 transition">Journal</Link>
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
                
                {profile?.role === 'ADMIN' && (
                  <Link 
                    href="/admin"
                    className={`p-2.5 rounded-full transition-all ${pathname === '/admin' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    <ShieldCheck size={20} className="text-orange-500" />
                  </Link>
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

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isAdminGateOpen && user && (
        <AdminGate 
          uid={user.uid} 
          onSuccess={() => { setIsAdminGateOpen(false); window.location.href = '/admin'; }} 
          onClose={() => setIsAdminGateOpen(false)} 
        />
      )}
    </nav>
  );
};

export default Navbar;
