
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Info, Loader2, CheckCircle2, ShieldCheck, User, Phone, Copy, Ticket, X } from 'lucide-react';
import { CartItem, Order, OrderStatus } from '../types';
import { PRODUCTS, MOMO_CONFIG } from '../constants';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import LocationSearch from './LocationSearch';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  userProfile?: any;
  onComplete: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total: subtotal, userProfile, onComplete, onCancel }) => {
  const { promotions, products: liveProducts } = useAppContext();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [activePromo, setActivePromo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: userProfile?.fullName || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    detailedAddress: '',
    momoId: '',
  });

  const discountAmount = useMemo(() => {
    if (!activePromo) return 0;
    if (activePromo.type === 'PERCENT') return subtotal * (activePromo.value / 100);
    return activePromo.value;
  }, [activePromo, subtotal]);

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyPromo = () => {
    const promo = promotions.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (promo) {
      setActivePromo(promo);
    } else {
      alert("Invalid promotion code.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(MOMO_CONFIG.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart,
        subtotal: subtotal,
        discount: discountAmount,
        totalAmount: finalTotal,
        status: OrderStatus.PENDING_VERIFICATION,
        momoTransactionId: form.momoId.toUpperCase(),
        createdAt: new Date().toISOString(),
        customerName: form.name,
        customerPhone: form.phone,
        deliveryAddress: `${form.city}, ${form.detailedAddress}`,
        userId: userProfile?.uid || 'guest'
      });
      setStep(3);
    } catch (err) {
      alert('Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
        <CheckCircle2 className="text-green-500" size={48} />
      </div>
      <h2 className="text-5xl font-serif font-bold text-stone-900 mb-4">Medaase! (Thank You)</h2>
      <p className="text-stone-500 mb-12 text-lg">We've received your order. Our team will verify the payment and contact you shortly for delivery.</p>
      <button onClick={onComplete} className="w-full bg-stone-900 text-white py-6 rounded-2xl font-bold shadow-2xl shadow-stone-900/20 hover:scale-[1.02] transition-all">
        Back to the Collection
      </button>
    </div>
  );

  const currentProducts = liveProducts.length > 0 ? liveProducts : PRODUCTS;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 lg:p-16">
      <button onClick={onCancel} className="group flex items-center gap-3 text-stone-400 hover:text-stone-900 mb-12 font-bold text-[10px] uppercase tracking-[0.3em] transition-all">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Bag
      </button>
      
      <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
        <div className="lg:col-span-7 space-y-12">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 1 ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-400'}`}>1</div>
               <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 1 ? 'text-stone-900' : 'text-stone-400'}`}>Delivery</span>
             </div>
             <div className="w-16 h-px bg-stone-100" />
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= 2 ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-400'}`}>2</div>
               <span className={`text-[10px] font-bold uppercase tracking-widest ${step === 2 ? 'text-stone-900' : 'text-stone-400'}`}>Payment</span>
             </div>
          </div>

          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-left duration-500">
              <h2 className="text-4xl font-serif font-bold text-stone-900">Where should we deliver?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input icon={<User size={18}/>} label="Receiver Name" value={form.name} onChange={(v:any) => setForm({...form, name: v})} placeholder="Kofi Mensah" />
                <Input icon={<Phone size={18}/>} label="Phone Number" type="tel" value={form.phone} onChange={(v:any) => setForm({...form, phone: v})} placeholder="0XX XXX XXXX" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">City / Neighborhood</label>
                <LocationSearch value={form.city} onChange={(val) => setForm({...form, city: val})} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Street & Landmarks</label>
                <textarea 
                  className="w-full p-6 border-2 border-stone-50 rounded-3xl outline-none focus:border-stone-900 focus:bg-white transition-all min-h-[140px] text-sm font-bold text-stone-900 bg-stone-50/50" 
                  placeholder="e.g. Near Sapieman Junction, House No. 12" 
                  value={form.detailedAddress} 
                  onChange={e => setForm({...form, detailedAddress: e.target.value})}
                />
              </div>
              <button 
                disabled={!form.name || !form.phone || !form.city || !form.detailedAddress} 
                onClick={() => setStep(2)} 
                className="w-full bg-stone-900 text-white py-6 rounded-3xl font-bold hover:bg-stone-800 disabled:bg-stone-100 disabled:text-stone-300 transition-all shadow-2xl shadow-stone-900/10"
              >
                Proceed to Secure Payment
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in slide-in-from-right duration-500">
              <h2 className="text-4xl font-serif font-bold text-stone-900">Secure Payment</h2>
              
              <div className="bg-stone-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-6">Payment Method: MTN / Telecel / AT Money</p>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                      <p className="text-stone-400 text-xs mb-2 uppercase tracking-widest font-bold">Transfer Amount</p>
                      <h3 className="text-4xl font-serif font-bold text-orange-400">GH₵ {finalTotal.toLocaleString()}</h3>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                      <p className="text-stone-400 text-xs mb-2 uppercase tracking-widest font-bold">Joshua Doe</p>
                      <div className="flex items-center gap-4 bg-white/10 px-6 py-4 rounded-2xl border border-white/10 group cursor-pointer active:scale-95 transition-all" onClick={copyToClipboard}>
                        <span className="text-2xl font-mono font-bold tracking-wider">{MOMO_CONFIG.number}</span>
                        <Copy size={18} className={copied ? "text-green-400" : "text-stone-500"} />
                      </div>
                      {copied && <span className="text-[9px] text-green-400 font-bold uppercase mt-2 animate-pulse">Copied to Clipboard</span>}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-600/10 rounded-full blur-[80px]" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">MoMo Transaction ID / Reference</label>
                <input 
                  autoFocus 
                  className="w-full p-6 border-2 border-stone-100 rounded-3xl outline-none focus:border-stone-900 transition-all text-2xl font-mono font-bold text-stone-900 bg-white shadow-inner" 
                  placeholder="ID87236592" 
                  value={form.momoId} 
                  onChange={e => setForm({...form, momoId: e.target.value})}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <button onClick={() => setStep(1)} className="px-10 py-6 border-2 border-stone-100 rounded-3xl font-bold text-stone-600 hover:bg-stone-50 transition-all">Edit Delivery</button>
                <button 
                  disabled={loading || !form.momoId} 
                  onClick={handleFinish} 
                  className="flex-grow bg-stone-900 text-white py-6 rounded-3xl font-bold flex items-center justify-center gap-4 hover:bg-stone-800 transition-all shadow-2xl shadow-stone-900/10"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : 'Confirm Order & Pay'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <div className="bg-stone-50 p-10 rounded-[3rem] border border-stone-100/60 sticky top-28">
            <h3 className="text-2xl font-serif font-bold text-stone-900 mb-10">Summary</h3>
            
            <div className="space-y-6 mb-10">
              {cart.map((item, idx) => {
                const product = currentProducts.find(p => p.id === item.productId);
                const variant = product?.variants?.find(v => v.id === item.variantId);
                return (
                  <div key={idx} className="flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-stone-200 rounded-xl overflow-hidden shrink-0">
                        <img src={product?.images[0]} className="w-full h-full object-cover" alt={product?.name} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-900 line-clamp-1">{product?.name}</p>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest">Qty: {item.quantity} • {variant?.size || 'OS'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm">GH₵ {((variant?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="pt-8 border-t border-stone-200/60 space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-stone-200 rounded-2xl outline-none focus:border-stone-900 transition-all text-xs font-bold uppercase tracking-widest"
                  />
                </div>
                <button onClick={applyPromo} className="bg-stone-900 text-white px-6 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-all">Apply</button>
              </div>
              {activePromo && (
                <div className="flex items-center justify-between bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">PROMO: {activePromo.code}</span>
                  <button onClick={() => { setActivePromo(null); setPromoCode(''); }} className="text-orange-300 hover:text-orange-700 transition-colors"><X size={14}/></button>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-sm text-stone-400 font-medium">
                <span>Subtotal</span>
                <span>GH₵ {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-orange-600 font-bold">
                  <span>Discount</span>
                  <span>- GH₵ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-3xl font-serif font-bold text-stone-900 pt-6">
                <span>Total</span>
                <span className="text-stone-900 tracking-tight">GH₵ {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', icon }: any) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block transition-colors group-focus-within:text-stone-900">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors">{icon}</div>}
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-16' : 'px-6'} py-6 border-2 border-stone-50 bg-stone-50/50 focus:bg-white rounded-3xl outline-none focus:border-stone-900 transition-all text-sm font-bold text-stone-900 placeholder:text-stone-200 shadow-sm`}
      />
    </div>
  </div>
);

export default Checkout;
