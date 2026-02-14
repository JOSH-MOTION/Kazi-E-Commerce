
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, Loader2, CheckCircle2, ShieldCheck, Camera, MapPin, User, Phone } from 'lucide-react';
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

  // Pre-fill form if profile updates
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
      const orderData = {
        items: cart,
        totalAmount: total,
        status: OrderStatus.PENDING_VERIFICATION,
        momoTransactionId: form.momoId.toUpperCase(),
        createdAt: new Date().toISOString(),
        customerName: form.name,
        customerPhone: form.phone,
        deliveryAddress: `${form.city}, ${form.detailedAddress}`,
        userId: userProfile?.uid || 'guest'
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      setStep(3);
    } catch (err) {
      alert('Failed to place order. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
          <CheckCircle2 className="text-green-500" size={48} />
        </div>
        <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4">Order Received</h2>
        <p className="text-stone-600 mb-10 text-lg">Thank you, {form.name.split(' ')[0]}. We'll verify your payment and start processing your essentials within the hour.</p>
        <button 
          onClick={onComplete} 
          className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 transition-all active:scale-[0.98]"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 lg:p-12">
      <button 
        onClick={onCancel} 
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 mb-10 font-bold text-sm uppercase tracking-widest transition-colors"
      >
        <ChevronLeft size={20} /> Back to Bag
      </button>
      
      <div className="grid lg:grid-cols-5 gap-16">
        <div className="lg:col-span-3 space-y-10">
          
          {/* Progress Banner */}
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
              <h2 className="text-3xl font-serif font-bold text-stone-900">Where should we deliver?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input icon={<User size={18}/>} label="Full Name" value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Receiver Name" />
                <Input icon={<Phone size={18}/>} label="Phone Number" type="tel" value={form.phone} onChange={v => setForm({...form, phone: v})} placeholder="07XX XXX XXX" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">City / Neighborhood</label>
                <LocationSearch 
                  value={form.city} 
                  onChange={(val) => setForm({...form, city: val})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">House / Building / Office No.</label>
                <textarea 
                  className="w-full p-4 border border-stone-200 rounded-2xl outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all min-h-[100px] text-sm font-medium" 
                  placeholder="e.g. Apartment 4B, Kisementi Mall..."
                  value={form.detailedAddress} onChange={e => setForm({...form, detailedAddress: e.target.value})}
                />
              </div>
              <button 
                disabled={!form.name || !form.phone || !form.city || !form.detailedAddress}
                onClick={() => setStep(2)} 
                className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold shadow-xl shadow-stone-900/10 hover:bg-stone-800 disabled:bg-stone-200 disabled:cursor-not-allowed transition-all"
              >
                Continue to Payment
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Complete Payment</h2>
              <div className="bg-orange-50/50 p-8 rounded-3xl border border-orange-100 space-y-4">
                <div className="flex items-center gap-3 text-orange-800">
                  <Info size={20} />
                  <p className="font-bold">Manual MoMo Verification</p>
                </div>
                <div className="text-sm text-orange-700/80 leading-relaxed">
                  1. Send <span className="font-bold text-stone-900 underline underline-offset-2">UGX {total.toLocaleString()}</span> to <span className="font-bold text-stone-900 select-all">{MOMO_CONFIG.number}</span>.<br/>
                  2. Registered Name: <span className="font-bold text-stone-900">{MOMO_CONFIG.name}</span>.<br/>
                  3. Paste the <span className="font-bold text-stone-900">Transaction ID</span> from your MoMo SMS below.
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Transaction ID (TxID)</label>
                <input 
                  autoFocus
                  className="w-full p-5 border-2 border-stone-200 rounded-2xl outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 transition-all text-xl font-mono font-bold tracking-widest placeholder:opacity-30" 
                  placeholder="ID87236592"
                  value={form.momoId} onChange={e => setForm({...form, momoId: e.target.value})}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-8 py-5 border-2 border-stone-200 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-all"
                >
                  Edit Address
                </button>
                <button 
                  disabled={loading || !form.momoId}
                  onClick={handleFinish}
                  className="flex-grow bg-stone-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 disabled:bg-stone-200 shadow-xl shadow-stone-900/10 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Secure Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary (Fixed-ish) */}
        <div className="lg:col-span-2">
          <div className="bg-stone-50 p-8 md:p-10 rounded-[2.5rem] border border-stone-200/60 sticky top-24">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-8">Summary</h3>
            
            <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item: any, i: number) => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                const variant = product?.variants.find(v => v.id === item.variantId);
                return (
                  <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-stone-100">
                      <img src={product?.images[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <div className="flex justify-between text-sm font-bold text-stone-900">
                        <span className="line-clamp-1">{product?.name}</span>
                        <span className="shrink-0 ml-4">UGX {(variant!.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                        {item.quantity} Unit{item.quantity > 1 ? 's' : ''} • {variant?.colorName} {variant?.size ? `• ${variant.size}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 pt-8 border-t border-stone-200">
              <div className="flex justify-between text-stone-500 text-sm">
                <span>Subtotal</span>
                <span>UGX {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-sm">
                <span>Delivery Charge</span>
                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest bg-green-50 px-2 py-1 rounded-md">Complimentary</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-serif font-bold text-stone-900 pt-4">
                <span>Total</span>
                <span>UGX {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white rounded-3xl border border-stone-100 shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900 mb-1">Buyer Protection</p>
                <p className="text-[10px] text-stone-400 leading-relaxed">Your transaction is manually reviewed to ensure stock availability and payment accuracy.</p>
              </div>
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
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 transition-colors group-focus-within:text-orange-600">{icon}</div>}
      <input 
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full ${icon ? 'pl-12' : 'px-4'} py-4 border border-stone-200 bg-white rounded-2xl outline-none focus:border-stone-900 focus:ring-4 focus:ring-stone-900/5 transition-all text-sm font-semibold`}
      />
    </div>
  </div>
);

export default Checkout;
