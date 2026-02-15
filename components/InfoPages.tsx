'use client';
import React from 'react';
import { ShieldCheck, HelpCircle, RefreshCcw, Package, Clock, Smartphone, CheckCircle, Info } from 'lucide-react';

type PageType = 'support' | 'track-order' | 'momo-guide' | 'returns';

const InfoPages: React.FC<{ type: PageType }> = ({ type }) => {
  const content = {
    'support': {
      title: 'Help Center',
      icon: <HelpCircle className="text-orange-500" size={16} />,
      body: (
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-serif font-bold text-stone-900 uppercase">Direct Concierge</h3>
            <p className="text-[10px] text-stone-500 leading-relaxed uppercase tracking-wider font-medium">Our support team is available Mon-Sat, 8AM-8PM GMT.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-[7px] font-bold uppercase tracking-widest text-stone-400 mb-1">WhatsApp Channel</p>
                <p className="text-[11px] font-bold text-stone-900">+233 24 240 3450</p>
              </div>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                <p className="text-[7px] font-bold uppercase tracking-widest text-stone-400 mb-1">Inquiries</p>
                <p className="text-[11px] font-bold text-stone-900">care@jbmarket.com</p>
              </div>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-serif font-bold text-stone-900 uppercase">Common Inquiries</h3>
            <div className="space-y-2">
              {[
                { q: "Delivery Timeline?", a: "Accra orders arrive within 24-48 hours. Nationwide takes 3-5 days." },
                { q: "Manual MoMo Security?", a: "Every J&B transaction is manually verified by a concierge agent for absolute security." }
              ].map((item, i) => (
                <div key={i} className="p-4 border border-stone-50 rounded-lg">
                  <p className="text-[8px] font-bold text-stone-900 mb-0.5 uppercase tracking-widest">{item.q}</p>
                  <p className="text-[9px] text-stone-500 uppercase tracking-tight">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )
    },
    'track-order': {
      title: 'Track Order',
      icon: <Package className="text-orange-500" size={16} />,
      body: (
        <div className="space-y-6 text-center">
          <div className="p-8 bg-stone-900 rounded-[2rem] text-white space-y-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-stone-500">Real-time Fulfillment Tracking</p>
            <div className="max-w-xs mx-auto relative">
              <input className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-base font-mono text-center outline-none focus:border-orange-500 transition-all uppercase" placeholder="Enter Ref ID" />
              <button className="mt-4 w-full bg-white text-stone-900 py-3 rounded-xl font-bold uppercase text-[8px] tracking-widest shadow-xl">Track Status</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="space-y-1 opacity-40">
                <div className="mx-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center"><Clock size={12}/></div>
                <p className="text-[7px] font-bold uppercase tracking-widest">Verified</p>
             </div>
             <div className="space-y-1 opacity-40">
                <div className="mx-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center"><Smartphone size={12}/></div>
                <p className="text-[7px] font-bold uppercase tracking-widest">Processing</p>
             </div>
             <div className="space-y-1 opacity-40">
                <div className="mx-auto w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center"><CheckCircle size={12}/></div>
                <p className="text-[7px] font-bold uppercase tracking-widest">Delivered</p>
             </div>
          </div>
        </div>
      )
    },
    'momo-guide': {
      title: 'MoMo Guide',
      icon: <Smartphone className="text-orange-500" size={16} />,
      body: (
        <div className="space-y-8">
          <p className="text-[9px] text-stone-500 leading-relaxed max-w-sm uppercase font-bold tracking-widest">J&B uses high-trust manual verification to ensure artisanal quality control.</p>
          <div className="space-y-4">
             {[
               { step: "01", text: "Proceed to secure checkout." },
               { step: "02", text: "Note total amount and MoMo number." },
               { step: "03", text: "Transfer via your provider (MTN/Telecel/AT)." },
               { step: "04", text: "Input Transaction ID in the checkout form." },
               { step: "05", text: "Verification completes in ~10 mins." }
             ].map((s) => (
               <div key={s.step} className="flex gap-4 items-start">
                  <div className="w-8 h-8 shrink-0 bg-stone-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">{s.step}</div>
                  <p className="text-[9px] font-bold text-stone-900 uppercase tracking-widest mt-2">{s.text}</p>
               </div>
             ))}
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-start gap-3">
             <Info className="text-orange-500 shrink-0" size={14} />
             <p className="text-[8px] font-bold text-orange-900 uppercase tracking-widest leading-relaxed">Identity Protection: J&B will never ask for your MoMo PIN.</p>
          </div>
        </div>
      )
    },
    'returns': {
      title: 'Policy & Terms',
      icon: <RefreshCcw className="text-orange-500" size={16} />,
      body: (
        <div className="space-y-8">
          <section className="space-y-2">
            <h3 className="text-sm font-serif font-bold text-stone-900 uppercase">Return Window</h3>
            <p className="text-[10px] text-stone-500 leading-relaxed uppercase font-medium tracking-tight">Exchanges are accepted within 48 hours for items in pristine, tagged condition.</p>
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-serif font-bold text-stone-900 uppercase">Exceptions</h3>
            <p className="text-[10px] text-stone-500 leading-relaxed uppercase font-medium tracking-tight">Artisanal leather goods are custom-made and final sale unless damaged upon arrival.</p>
          </section>
          <div className="p-6 bg-stone-900 rounded-2xl text-white">
             <h4 className="text-[8px] font-bold uppercase tracking-widest text-stone-500 mb-2">Privacy Promise</h4>
             <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed opacity-80">J&B Market secures all metadata. Your location and contact details are used strictly for order logistics.</p>
          </div>
        </div>
      )
    }
  };

  const current = content[type];

  return (
    <div className="w-full py-10 px-4 md:px-10 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100">
            {current.icon}
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-900 uppercase tracking-tight">{current.title}</h1>
        </div>
        <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-stone-100 shadow-sm min-h-[40vh]">
          {current.body}
        </div>
      </div>
    </div>
  );
};

export default InfoPages;