'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Instagram, MessageCircle, Twitter, ArrowUpRight } from 'lucide-react';
import Image from "next/image";

interface FooterProps {
  navigate?: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const router = useRouter();

  const safeNavigate = (path: string) => {
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

  return (
    <footer className="bg-gray-100 text-stone-500 py-10 px-4 md:px-10 mt-auto w-full border-t border-stone-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        <div className="col-span-1 md:col-span-1">
          <button
            onClick={() => safeNavigate("store")}
            className="mb-3 inline-block"
          >
            <Image
              src="/catly.png"  
              alt="Cartly Logo"
              width={130}
              height={45}
              className="object-contain"
            />
          </button>
          <p className="text-[8px] uppercase tracking-widest font-bold text-stone-400 mb-6 leading-relaxed max-w-[200px]">
            Curated Essentials • Modern African Retail • Accra 2025
          </p>
          <div className="flex gap-3">
            <a href="https://instagram.com/jb_market" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all border border-stone-200">
              <Instagram size={12} />
            </a>
            <a href="https://whatsapp.com/channel/0029VaDPD65J3jus6T8N8X3R" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all border border-stone-200">
              <MessageCircle size={12} />
            </a>
            <a href="https://twitter.com/jb_market" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-all border border-stone-200">
              <Twitter size={12} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-stone-800 text-[7px] font-bold uppercase tracking-[0.2em] mb-4">Customer Care</h4>
          <ul className="text-[8px] space-y-2.5 font-bold uppercase tracking-widest">
            <li><button onClick={() => safeNavigate('track-order')} className="hover:text-stone-900 transition-colors flex items-center gap-1 group">Order Status <ArrowUpRight size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button></li>
            <li><button onClick={() => safeNavigate('support')} className="hover:text-stone-900 transition-colors flex items-center gap-1 group">Contact Support <ArrowUpRight size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button></li>
            <li><button onClick={() => safeNavigate('momo-guide')} className="hover:text-stone-900 transition-colors flex items-center gap-1 group">MoMo Verification <ArrowUpRight size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" /></button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-stone-800 text-[7px] font-bold uppercase tracking-[0.2em] mb-4">The Collective</h4>
          <ul className="text-[8px] space-y-2.5 font-bold uppercase tracking-widest">
            <li><button onClick={() => safeNavigate('returns')} className="hover:text-stone-900 transition-colors">Shipping & Returns</button></li>
            <li><button onClick={() => safeNavigate('returns')} className="hover:text-stone-900 transition-colors">Privacy & Security</button></li>
            <li><button onClick={() => safeNavigate('returns')} className="hover:text-stone-900 transition-colors">Terms of Service</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-stone-800 text-[7px] font-bold uppercase tracking-[0.2em] mb-4">Newsletter</h4>
          <p className="text-[8px] mb-3 font-bold uppercase tracking-widest leading-relaxed">Early access to collection drops.</p>
          <div className="flex gap-2">
            <input className="bg-white border border-stone-300 rounded px-2.5 py-1.5 text-[8px] text-stone-800 outline-none focus:border-orange-500 flex-grow" placeholder="Enter Email" />
            <button className="bg-stone-900 text-white rounded px-3 py-1.5 text-[7px] font-bold uppercase hover:bg-stone-700 transition-colors">Join</button>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-stone-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[6px] uppercase tracking-[0.3em] font-bold text-stone-400">
        <span>© 2025 J&B MARKET RETAIL CO. ACCRA GHANA.</span>
        <div className="flex gap-4">
          <span>ESTABLISHED 2024</span>
          <span>SECURED MoMo CHECKOUT</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;