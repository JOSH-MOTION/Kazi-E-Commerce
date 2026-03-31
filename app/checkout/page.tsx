'use client';
import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, Info, Loader2, CheckCircle2, User, Phone,
  Copy, Ticket, X, MessageCircle, CreditCard, Smartphone,
  ShieldCheck, Lock, AlertCircle,
} from 'lucide-react';
import { CartItem, OrderStatus } from '../../types';
import { PRODUCTS, MOMO_CONFIG, PAYSTACK_PUBLIC_KEY } from '../../constants';
import { db, auth } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAppContext } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import LocationSearch from '../../components/LocationSearch';
import { optimizeImage } from '../../cloudinary';

type PaymentMethod = 'paystack' | 'momo_manual';

function loadPaystack(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).PaystackPop) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { cart, promotions, products: liveProducts } = useAppContext();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [activePromo, setActivePromo] = useState<any>(null);
  const [copied, setCopied]           = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [orderId, setOrderId]         = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paystack');
  const [payError, setPayError]       = useState('');

  const [form, setForm] = useState({
    name:            auth.currentUser?.displayName || '',
    phone:           '',
    email:           auth.currentUser?.email || '',
    city:            '',
    detailedAddress: '',
    momoId:          '',
  });

  const currentProducts = liveProducts.length > 0 ? liveProducts : PRODUCTS;

  const subtotal = useMemo(() => {
    return (cart || []).reduce((sum, item) => {
      const product = liveProducts.find(p => p.id === item.productId) || PRODUCTS.find(p => p.id === item.productId);
      const variant = product?.variants?.find(v => v.id === item.variantId);
      return sum + (variant?.price || 0) * item.quantity;
    }, 0);
  }, [cart, liveProducts]);

  const discountAmount = useMemo(() => {
    if (!activePromo) return 0;
    return activePromo.type === 'PERCENT'
      ? subtotal * (activePromo.value / 100)
      : activePromo.value;
  }, [activePromo, subtotal]);

  const finalTotal        = Math.max(0, subtotal - discountAmount);
  const finalTotalPesewas = Math.round(finalTotal * 100);

  const applyPromo = () => {
    const promo = promotions.find(p => p.code.toUpperCase() === promoCode.toUpperCase());
    if (promo) setActivePromo(promo);
    else alert('Invalid promotion code.');
  };

  const buildWhatsapp = (oid: string) => {
    const lines = cart.map(item => {
      const product = currentProducts.find(p => p.id === item.productId);
      const variant = product?.variants?.find(v => v.id === item.variantId);
      const color   = variant?.colorName && variant.colorName !== 'null' ? `\n🎨 Color: ${variant.colorName}` : '';
      const size    = variant?.size && variant.size !== 'No Size' ? `\n📏 Size: ${variant.size}` : '';
      return `🛍 ${product?.name || 'Item'}${color}${size}\n📦 Qty: ${item.quantity}`;
    }).join('\n\n');

    const msg = `Hello Cartly 👋\n\nMy name is ${form.name}\n\nI would like to order:\n\n${lines}\n\nPlease confirm delivery fee to ${form.city || 'Accra'}.\n\nThank you.\n\n---\n🧾 Order #${oid}\n📞 ${form.phone}\n📍 ${form.detailedAddress}`;
    setWhatsappUrl(`https://wa.me/${MOMO_CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`);
  };

  const saveOrder = async (txRef: string, status: OrderStatus) => {
    const uid = auth.currentUser?.uid || 'guest';
    const ref = await addDoc(collection(db, 'orders'), {
      items: cart, subtotal: subtotal, discount: discountAmount, totalAmount: finalTotal,
      status, paymentMethod, paystackRef: txRef,
      momoTransactionId: paymentMethod === 'momo_manual' ? form.momoId.toUpperCase() : '',
      createdAt: new Date().toISOString(),
      customerName: form.name, customerEmail: form.email, customerPhone: form.phone,
      deliveryAddress: `${form.city}, ${form.detailedAddress}`,
      userId: uid,
    });
    return ref.id.slice(-6).toUpperCase();
  };

  const verifyWithServer = async (reference: string): Promise<boolean> => {
    setVerifying(true);
    try {
      const res  = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      return data.verified === true;
    } catch (err) {
      console.error('Verify error:', err);
      return false;
    } finally {
      setVerifying(false);
    }
  };

  const handlePaystack = async () => {
    setPayError('');
    setLoading(true);
    if (!PAYSTACK_PUBLIC_KEY) {
      setPayError('Paystack is not configured. Please contact support.');
      setLoading(false);
      return;
    }
    try {
      await loadPaystack();
      const PaystackPop = (window as any).PaystackPop;
      const txRef = `cartly-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      PaystackPop.setup({
        key:      PAYSTACK_PUBLIC_KEY,
        email:    form.email || `${form.phone.replace(/\s/g, '')}@cartly.gh`,
        amount:   finalTotalPesewas,
        currency: 'GHS',
        ref:      txRef,
        label:    form.name,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: form.name },
            { display_name: 'Phone',         variable_name: 'phone',         value: form.phone },
            { display_name: 'Address',       variable_name: 'address',       value: `${form.city}, ${form.detailedAddress}` },
          ],
        },
        channels: ['card', 'mobile_money', 'bank', 'ussd'],
        onSuccess: async (transaction: any) => {
          try {
            await verifyWithServer(transaction.reference);
            const oid = await saveOrder(transaction.reference, OrderStatus.PENDING_VERIFICATION);
            setOrderId(oid);
            buildWhatsapp(oid);
            setStep(3);
          } catch (err) {
            setPayError(`Payment received (ref: ${transaction.reference}) but order save failed. Contact support.`);
          }
          setLoading(false);
        },
        onCancel: () => { setLoading(false); },
      }).openIframe();
    } catch (err) {
      setPayError('Failed to open payment. Please refresh and try again.');
      setLoading(false);
    }
  };

  const handleManualMomo = async () => {
    setPayError('');
    setLoading(true);
    try {
      const oid = await saveOrder(form.momoId, OrderStatus.PENDING_VERIFICATION);
      setOrderId(oid);
      buildWhatsapp(oid);
      setStep(3);
      setTimeout(() => { if (whatsappUrl) window.location.href = whatsappUrl; }, 1800);
    } catch (err) {
      setPayError('Failed to place order. Please check your connection.');
    }
    setLoading(false);
  };

  /* ── Step 3 ── */
  if (step === 3) return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
        <CheckCircle2 className="text-green-500" size={48} />
      </div>
      <h2 className="text-5xl font-serif font-bold text-stone-900 mb-3">Medaase!</h2>
      <p className="text-stone-500 mb-2 text-lg">Order <span className="font-mono font-bold text-orange-500">#{orderId}</span> confirmed.</p>
      <p className="text-stone-400 mb-10 text-sm leading-relaxed">
        {paymentMethod === 'paystack'
          ? "Payment verified. We'll reach out on WhatsApp to confirm delivery."
          : "Sending you to WhatsApp to confirm delivery details."}
      </p>
      <div className="space-y-4">
        <a href={whatsappUrl || `https://wa.me/${MOMO_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer"
          className="w-full py-5 bg-[#25D366] text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all shadow-xl shadow-green-500/20">
          <MessageCircle size={22} fill="white" /> Confirm on WhatsApp
        </a>
        <button onClick={() => router.push('/')} className="w-full bg-stone-100 text-stone-600 py-4 rounded-2xl font-bold hover:bg-stone-200 transition-all">
          Back to Collection
        </button>
      </div>
    </div>
  );

  /* ── Steps 1 & 2 ── */
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-12 lg:p-16">
      <button onClick={() => router.push('/cart')} className="group flex items-center gap-3 text-stone-400 hover:text-stone-900 mb-12 font-bold text-[10px] uppercase tracking-[0.3em] transition-all">
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Bag
      </button>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">

        {/* LEFT */}
        <div className="lg:col-span-7 space-y-10">

          {/* Step indicators */}
          <div className="flex items-center gap-6">
            {[{ n: 1, label: 'Delivery' }, { n: 2, label: 'Payment' }].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                {i > 0 && <div className="w-12 h-px bg-stone-100 shrink-0" />}
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= n ? 'bg-stone-900 text-white shadow' : 'bg-stone-100 text-stone-400'}`}>{n}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest hidden sm:block ${step === n ? 'text-stone-900' : 'text-stone-400'}`}>{label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-7 animate-in slide-in-from-left duration-400">
              <h2 className="text-4xl font-serif font-bold text-stone-900">Where should we deliver?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input icon={<User size={17}/>}  label="Receiver Name" value={form.name}  onChange={(v:string) => setForm({...form, name: v})}  placeholder="Kofi Mensah" />
                <Input icon={<Phone size={17}/>} label="Phone Number" type="tel" value={form.phone} onChange={(v:string) => setForm({...form, phone: v})} placeholder="0XX XXX XXXX" />
              </div>
              <Input icon={<span className="text-stone-300 text-xs font-bold">@</span>} label="Email (for payment receipt)" value={form.email} onChange={(v:string) => setForm({...form, email: v})} placeholder="name@example.com" type="email" />
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">City / Neighborhood</label>
                <LocationSearch value={form.city} onChange={val => setForm({...form, city: val})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Street & Landmarks</label>
                <textarea className="w-full p-6 border-2 border-stone-50 rounded-3xl outline-none focus:border-stone-900 focus:bg-white transition-all min-h-[130px] text-sm font-bold text-stone-900 bg-stone-50/50 resize-none"
                  placeholder="e.g. Near Sapieman Junction, House No. 12" value={form.detailedAddress}
                  onChange={e => setForm({...form, detailedAddress: e.target.value})} />
              </div>
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                <Info size={15} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">Delivery fee is confirmed via WhatsApp after order placement.</p>
              </div>
              <button disabled={!form.name || !form.phone || !form.city || !form.detailedAddress} onClick={() => setStep(2)}
                className="w-full bg-stone-900 text-white py-5 rounded-3xl font-bold hover:bg-stone-800 disabled:bg-stone-100 disabled:text-stone-300 transition-all shadow-xl">
                Proceed to Payment
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-7 animate-in slide-in-from-right duration-400">
              <h2 className="text-4xl font-serif font-bold text-stone-900">Secure Payment</h2>

              {/* Method selector */}
              <div className="grid grid-cols-2 gap-4">
                {([
                  { id: 'paystack'    as const, icon: <CreditCard size={20}/>, title: 'Paystack',    sub: 'Visa · MC · MoMo · Bank' },
                  { id: 'momo_manual' as const, icon: <Smartphone size={20}/>, title: 'Manual MoMo', sub: 'Transfer & screenshot' },
                ]).map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                    className={`relative p-5 rounded-2xl border-2 text-left transition-all ${paymentMethod === m.id ? 'border-stone-900 bg-stone-900 text-white shadow-xl' : 'border-stone-100 bg-white hover:border-stone-300 text-stone-700'}`}>
                    <div className={`mb-2 ${paymentMethod === m.id ? 'text-orange-400' : 'text-stone-400'}`}>{m.icon}</div>
                    <p className="font-bold text-sm mb-0.5">{m.title}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${paymentMethod === m.id ? 'text-stone-400' : 'text-stone-400'}`}>{m.sub}</p>
                    {paymentMethod === m.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center shadow">
                        <span className="text-white text-[9px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {payError && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-medium">{payError}</p>
                </div>
              )}

              {/* Paystack panel */}
              {paymentMethod === 'paystack' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="p-8 bg-stone-50 rounded-3xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={13} className="text-green-600" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">256-bit SSL · Secured by Paystack</span>
                    </div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-stone-500 font-medium">Total to pay</span>
                      <span className="text-3xl font-serif font-bold text-stone-900">GH₵ {finalTotal.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed mb-4">A secure Paystack popup will open. Choose your preferred method:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'VISA',       cls: 'bg-[#1a1f71] text-white' },
                        { label: 'Mastercard', cls: 'bg-[#eb001b] text-white' },
                        { label: 'MTN MoMo',   cls: 'bg-[#ffcc00] text-stone-900' },
                        { label: 'Telecel',    cls: 'bg-[#e60000] text-white' },
                        { label: 'AT Money',   cls: 'bg-[#00a0e3] text-white' },
                        { label: 'Bank',       cls: 'bg-stone-200 text-stone-700' },
                      ].map(b => (
                        <span key={b.label} className={`px-2.5 py-1 rounded text-[8px] font-black shadow-sm ${b.cls}`}>{b.label}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-7 py-5 border-2 border-stone-100 rounded-3xl font-bold text-stone-600 hover:bg-stone-50 transition-all text-sm">← Edit</button>
                    <button disabled={loading || verifying} onClick={handlePaystack}
                      className="flex-grow bg-stone-900 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-orange-500 transition-all shadow-xl disabled:bg-stone-300">
                      {loading || verifying
                        ? <><Loader2 className="animate-spin" size={20}/>{verifying ? 'Verifying...' : 'Opening...'}</>
                        : <><Lock size={17}/> Pay GH₵ {finalTotal.toLocaleString()} Securely</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Manual MoMo panel */}
              {paymentMethod === 'momo_manual' && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="bg-stone-900 rounded-[2rem] p-8 text-white relative overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-500 mb-5">Transfer via MTN / Telecel / AT Money</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      <div>
                        <p className="text-stone-400 text-[9px] mb-1 uppercase tracking-widest font-bold">Amount</p>
                        <h3 className="text-3xl font-serif font-bold text-orange-400">GH₵ {finalTotal.toLocaleString()}</h3>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <p className="text-stone-400 text-[9px] mb-2 uppercase tracking-widest font-bold">{MOMO_CONFIG.name}</p>
                        <button onClick={() => { navigator.clipboard.writeText(MOMO_CONFIG.number); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                          className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-xl border border-white/10 hover:bg-white/20 active:scale-95 transition-all">
                          <span className="text-xl font-mono font-bold tracking-wider">{MOMO_CONFIG.number}</span>
                          <Copy size={16} className={copied ? 'text-green-400' : 'text-stone-400'} />
                        </button>
                        {copied && <span className="text-[9px] text-green-400 font-bold uppercase mt-1.5 animate-pulse">Copied!</span>}
                      </div>
                    </div>
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">MoMo Transaction ID</label>
                    <input autoFocus className="w-full p-5 border-2 border-stone-100 rounded-2xl outline-none focus:border-stone-900 transition-all text-xl font-mono font-bold text-stone-900 bg-white"
                      placeholder="ID87236592" value={form.momoId} onChange={e => setForm({...form, momoId: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-7 py-5 border-2 border-stone-100 rounded-3xl font-bold text-stone-600 hover:bg-stone-50 transition-all text-sm">← Edit</button>
                    <button disabled={loading || !form.momoId} onClick={handleManualMomo}
                      className="flex-grow bg-stone-900 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all shadow-xl disabled:bg-stone-300">
                      {loading ? <Loader2 className="animate-spin" size={20}/> : 'Confirm & Place Order'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Summary */}
        <div className="lg:col-span-5">
          <div className="bg-stone-50 p-8 rounded-[2.5rem] border border-stone-100/60 sticky top-24">
            <h3 className="text-xl font-serif font-bold text-stone-900 mb-7">Order Summary</h3>

            <div className="space-y-5 mb-7">
              {cart.map((item, idx) => {
                const product  = currentProducts.find(p => p.id === item.productId);
                const variant  = product?.variants?.find(v => v.id === item.variantId);
                const img      = variant?.images?.[0] || product?.images[0];
                const hasColor = variant?.colorName && variant.colorName !== 'null' && variant.colorName !== 'Standard';
                const hasSize  = variant?.size && variant.size !== 'No Size' && variant.size !== null;

                return (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-14 h-[4.5rem] bg-stone-200 rounded-xl overflow-hidden shrink-0 border border-stone-100">
                      {img && <img src={optimizeImage(img, 80)} className="w-full h-full object-cover" alt={product?.name} />}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-stone-900 leading-snug mb-1.5 line-clamp-2">{product?.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {hasColor && (
                          <span className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-full px-2 py-0.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full shrink-0 border border-stone-200" style={{ backgroundColor: variant?.hexColor || '#1a1a1a' }} />
                            <span className="text-[7px] font-bold text-stone-600 uppercase tracking-widest">{variant?.colorName}</span>
                          </span>
                        )}
                        {hasSize && (
                          <span className="bg-stone-100 text-stone-600 rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest">{variant?.size}</span>
                        )}
                        <span className="bg-stone-100 text-stone-500 rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-widest">×{item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 text-sm shrink-0 pt-0.5">
                      GH₵ {((variant?.price || 0) * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Promo */}
            <div className="border-t border-stone-200/70 pt-5 space-y-3 mb-5">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                  <input type="text" placeholder="Promo Code" value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    className="w-full pl-9 pr-3 py-3 bg-white border border-stone-200 rounded-xl outline-none focus:border-stone-900 transition-all text-[10px] font-bold uppercase tracking-widest" />
                </div>
                <button onClick={applyPromo} className="bg-stone-900 text-white px-4 rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-stone-800 transition-all">Apply</button>
              </div>
              {activePromo && (
                <div className="flex items-center justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                  <span className="text-[9px] font-bold text-orange-700 uppercase tracking-widest">✓ {activePromo.code} — {activePromo.value}% off</span>
                  <button onClick={() => { setActivePromo(null); setPromoCode(''); }} className="text-orange-300 hover:text-orange-600 transition-colors"><X size={13}/></button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-stone-200/70 pt-5 space-y-2">
              <div className="flex justify-between text-sm text-stone-400 font-medium">
                <span>Subtotal</span><span>GH₵ {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-orange-600 font-bold">
                  <span>Discount</span><span>−GH₵ {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3">
                <span className="text-xl font-serif font-bold text-stone-900">Total</span>
                <span className="text-2xl font-serif font-bold text-stone-900">GH₵ {finalTotal.toLocaleString()}</span>
              </div>
              <p className="text-[8px] text-stone-400 uppercase tracking-widest font-bold">+ delivery (confirmed via WhatsApp)</p>
            </div>

            <div className="mt-5 pt-5 border-t border-stone-100 flex items-center justify-center gap-2">
              <ShieldCheck size={13} className="text-green-500" />
              <span className="text-[8px] font-bold uppercase tracking-widest text-stone-400">Secured by Paystack · SSL Encrypted</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const Input = ({ label, value, onChange, placeholder, type = 'text', icon }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block group-focus-within:text-stone-900 transition-colors">
      {label}
    </label>

    <div className="relative">
      {icon && (
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors">
          {icon}
        </div>
      )}

      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full py-5 pl-12 border-2 border-stone-50 bg-stone-50/50 focus:bg-white rounded-2xl outline-none focus:border-stone-900 transition-all text-sm font-bold text-stone-900 placeholder:text-stone-200"
      />
    </div>
  </div>
);
