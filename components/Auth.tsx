'use client';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { X, Mail, Lock, Loader2, User, Phone, ArrowRight, ShieldCheck, Fingerprint } from 'lucide-react';
import LocationSearch from './LocationSearch';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    city: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        if (!formData.fullName || !formData.phone || !formData.city) {
          throw new Error("Please fill in all profile information.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: formData.fullName });
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          createdAt: new Date().toISOString(),
          role: 'CUSTOMER'
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message.replace('Firebase:', '').trim());
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
      {/* Immersive Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/90 backdrop-blur-2xl transition-opacity duration-700"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full h-full sm:h-[90vh] sm:max-w-6xl bg-white sm:rounded-[2.5rem] shadow-[0_32px_128px_-20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row animate-in fade-in zoom-in-95 duration-500">
        
        {/* Visual Brand Side */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden flex-col p-16 text-white shrink-0">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1539109132314-34a77bf4cd12?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover opacity-50 transition-transform duration-[10s] hover:scale-110" 
              alt="Editorial Fashion" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            {/* Grain Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          </div>
          
          <div className="relative z-10 h-full flex flex-col">
            <h1 className="text-4xl font-serif font-bold tracking-tighter mb-auto">KAZI</h1>
            <div className="space-y-8 max-w-xs">
              <div className="flex items-center gap-3">
                <Fingerprint className="text-orange-500" size={32} />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-orange-400">Identity First Retail</span>
              </div>
              <p className="text-3xl font-serif italic text-stone-100 leading-tight">
                "Curating the essence of African craftsmanship."
              </p>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-grow flex flex-col p-8 sm:p-16 lg:p-24 bg-white overflow-y-auto">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-all"
          >
            <X size={24} />
          </button>

          <div className="max-w-md mx-auto w-full flex flex-col justify-center min-h-full">
            <div className="mb-12">
              <h2 className="text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-stone-500 font-medium">
                {isLogin 
                  ? 'Enter your credentials to access the collection.' 
                  : 'Start your journey with premium African essentials.'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-orange-50 border-l-4 border-orange-500 text-orange-900 text-sm font-bold rounded-r-2xl flex items-center gap-4 animate-in slide-in-from-top duration-300">
                <ShieldCheck size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-8">
              {!isLogin && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AuthInput 
                    icon={<User size={20} />} 
                    label="Full Name" 
                    placeholder="e.g. Kofi Mensah" 
                    value={formData.fullName} 
                    onChange={v => updateField('fullName', v)} 
                  />
                  <div className="grid grid-cols-2 gap-8">
                    <AuthInput 
                      icon={<Phone size={20} />} 
                      label="Phone" 
                      placeholder="07XX..." 
                      value={formData.phone} 
                      onChange={v => updateField('phone', v)} 
                    />
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block">Area</label>
                      <LocationSearch 
                        value={formData.city} 
                        onChange={v => updateField('city', v)} 
                        minimal 
                      />
                    </div>
                  </div>
                </div>
              )}

              <AuthInput 
                icon={<Mail size={20} />} 
                label="Email Address" 
                placeholder="name@example.com" 
                value={formData.email} 
                onChange={v => updateField('email', v)} 
              />

              <AuthInput 
                icon={<Lock size={20} />} 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={v => updateField('password', v)} 
              />

              <button 
                disabled={loading}
                className="w-full h-16 bg-stone-900 text-white rounded-[1.25rem] font-bold flex items-center justify-center gap-4 hover:bg-stone-800 transition-all active:scale-[0.98] disabled:bg-stone-200 mt-10 shadow-2xl shadow-stone-900/20"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="text-lg">{isLogin ? 'Sign In' : 'Join the Collective'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                className="text-xs text-stone-400 font-bold uppercase tracking-[0.2em] hover:text-stone-900 transition-colors flex items-center justify-center gap-3 mx-auto group"
              >
                <div className="h-px w-8 bg-stone-100 group-hover:bg-stone-900 transition-colors" />
                {isLogin ? "Need an account? Join" : "Already a member? Sign In"}
                <div className="h-px w-8 bg-stone-100 group-hover:bg-stone-900 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthInput = ({ label, icon, placeholder, value, onChange, type = 'text' }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-bold uppercase text-stone-400 tracking-widest block group-focus-within:text-stone-900 transition-colors">
      {label}
    </label>
    <div className="relative flex items-center border-b-2 border-stone-100 group-focus-within:border-stone-900 transition-all">
      <div className="absolute left-0 text-stone-300 group-focus-within:text-stone-900 transition-colors">
        {icon}
      </div>
      <input 
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pb-4 bg-transparent outline-none text-base font-bold text-stone-900 placeholder:text-stone-200"
        required
      />
    </div>
  </div>
);

export default AuthModal;