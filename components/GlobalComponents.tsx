'use client';
import React from 'react';
import { useAppContext } from '../context/AppContext';
import AuthModal from './Auth';

import { MessageCircle } from 'lucide-react';
import { MOMO_CONFIG } from '../constants';

const GlobalComponents = () => {
  const { isAuthOpen, setIsAuthOpen } = useAppContext();
  
  return (
    <>
      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      
      {/* Floating WhatsApp Button */}
      <a 
        href={`http://wa.me/${MOMO_CONFIG.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group"
        title="Chat with us on WhatsApp"
      >
        <MessageCircle size={24} fill="white" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-stone-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-stone-100">
          Chat with us
        </span>
      </a>
    </>
  );
};

export default GlobalComponents;
