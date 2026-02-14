
'use client';
import React from 'react';

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

export default Footer;
