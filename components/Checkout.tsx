
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, Loader2, CheckCircle2, ShieldCheck, User, Phone } from 'lucide-react';
import { CartItem, Order, OrderStatus } from '../types';
import { PRODUCTS, MOMO_CONFIG } from '../constants';
import { db } from '../firebase';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import LocationSearch from './LocationSearch';

interface CheckoutProps {
  cart: CartItem[];
  total: number;
  userProfile?: any;
  onComplete: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, total, userProfile, onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: userProfile?.fullName || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    detailedAddress: '',
    momoId: '',
  });

  useEffect(() => {
    if (userProfile) {
      setForm(prev => ({
        ...prev,
        name: prev.name || userProfile.fullName || '',
        phone: prev.phone || userProfile.phone || '',
        city: prev.city || userProfile.city || '',
      }));
    }
  }, [userProfile]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart,
        totalAmount: total,
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
    <div className="max-w-xl mx-auto py-24 px-4 text-center animate-in zoom-in duration-300">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
        <CheckCircle2 className="text-green-500" size={48} />
      </div>
      <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Order Received</h2>
      <p className="text-stone-600 mb-10 text-lg">Thank you. We'll verify your payment and start processing your order.</p>
      <button onClick={onComplete} className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 transition-all">
        Return to Collection
      </button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
      <button onClick={onCancel} className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 font-bold text-sm uppercase tracking-widest transition-colors">
        <ChevronLeft size={20} /> Back to Bag
      </button>
      
      <div className="grid lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-10">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>1</div>
               <span className={`text-xs font-bold uppercase tracking-widest ${step === 1 ? 'text-stone-900' : 'text-stone-400'}`}>Delivery</span>
             </div>
             <div className="w-12 h-px bg-stone-200" />
             <div className="flex items-center gap-3">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2 ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'}`}>2</div>
               <span className={`text-xs font-bold uppercase tracking-widest ${step === 2 ? 'text-stone-900' : 'text-stone-400'}`}>Payment</span>
             </div>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input icon={<User size={18}/>} label="Full Name" value={form.name} onChange={(v:any) => setForm({...form, name: v})} placeholder="Receiver Name" />
                <Input icon={<Phone size={18}/>} label="Phone" type="tel" value={form.phone} onChange={(v:any) => setForm({...form, phone: v})} placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">City / Neighborhood</label>
                <LocationSearch value={form.city} onChange={(val) => setForm({...form, city: val})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Detailed Address</label>
                <textarea 
                  className="w-full p-4 border border-stone-200 rounded-2xl outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all min-h-[100px] text-sm font-bold text-black bg-stone-50/30" 
                  placeholder="Street name, house number, apartment..." 
                  value={form.detailedAddress} 
                  onChange={e => setForm({...form, detailedAddress: e.target.value})}
                />
              </div>
              <button 
                disabled={!form.name || !form.phone || !form.city || !form.detailedAddress} 
                onClick={() => setStep(2)} 
                className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold hover:bg-stone-800 disabled:bg-stone-200 transition-all"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Payment</h2>
              <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100 text-sm text-orange-700/80 leading-relaxed">
                Send <span className="font-bold text-stone-900 underline underline-offset-2">UGX {total.toLocaleString()}</span> to <span className="font-bold text-stone-900 select-all">{MOMO_CONFIG.number}</span> ({MOMO_CONFIG.name}). Paste TxID below.
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">MoMo Transaction ID</label>
                <input 
                  autoFocus 
                  className="w-full p-5 border-2 border-stone-200 rounded-2xl outline-none focus:border-orange-600 transition-all text-xl font-mono font-bold text-black bg-white" 
                  placeholder="ID87236592" 
                  value={form.momoId} 
                  onChange={e => setForm({...form, momoId: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="px-8 py-5 border-2 border-stone-200 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-all">Edit Address</button>
                <button 
                  disabled={loading || !form.momoId} 
                  onClick={handleFinish} 
                  className="flex-grow bg-stone-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-200/60 sticky top-24">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-8">Summary</h3>
            <div className="space-y-4 mb-6">
              {cart.map((item, idx) => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                const variant = product?.variants.find(v => v.id === item.variantId);
                return (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">{product?.name} x {item.quantity}</span>
                    <span className="font-bold text-stone-900">UGX {((variant?.price || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-3 pt-8 border-t border-stone-200 flex justify-between items-center text-xl font-serif font-bold text-stone-900">
              <span>Total</span>
              <span>UGX {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', icon }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-stone-900">{icon}</div>}
      <input 
        type={type} 
        value={value} 
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-12' : 'px-4'} py-4 border border-stone-200 bg-stone-50/50 focus:bg-white rounded-2xl outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all text-sm font-bold text-black`}
      />
    </div>
  </div>
);

export default Checkout;
