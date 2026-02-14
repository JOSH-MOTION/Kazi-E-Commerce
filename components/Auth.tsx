
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { setDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { X, Mail, Lock, Loader2, User, Phone, ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
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
        // Validation for registration
        if (!formData.fullName || !formData.phone || !formData.city) {
          throw new Error("Please fill in all profile information.");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        // Update Auth Profile for immediate UI feedback
        await updateProfile(user, { displayName: formData.fullName });

        // Persist extended user data to Firestore
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
      setError(err.message.replace('Firebase:', '').trim() || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-6 lg:p-12 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xl transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-5xl bg-white rounded-none sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col lg:flex-row min-h-[100vh] sm:min-h-0">
        
        {/* Brand Side Panel */}
        <div className="hidden lg:flex lg:w-5/12 relative bg-stone-950 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000"
              className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
              alt="Kazi Fashion"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
          </div>
          
          <div className="relative z-10 p-16 flex flex-col h-full text-white">
            <h1 className="text-4xl font-serif font-bold tracking-tighter mb-auto">KAZI</h1>
            
            <div className="space-y-8 max-w-xs">
              <div className="animate-in slide-in-from-left duration-700 delay-100">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={20} className="text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Premium Quality</span>
                </div>
                <h3 className="text-2xl font-serif font-bold">Refined Essentials</h3>
                <p className="text-stone-400 text-sm leading-relaxed mt-2">Elevated everyday wear, meticulously crafted for the urban professional.</p>
              </div>
              
              <div className="animate-in slide-in-from-left duration-700 delay-200">
                <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={20} className="text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Secure Payments</span>
                </div>
                <h3 className="text-2xl font-serif font-bold">Manual MoMo</h3>
                <p className="text-stone-400 text-sm leading-relaxed mt-2">Verified manual verification ensures your transaction is safe and trusted.</p>
              </div>
            </div>

            <div className="mt-24 pt-10 border-t border-white/10 opacity-60">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Crafted in Africa • For the World</p>
            </div>
          </div>
        </div>

        {/* Auth Form Side */}
        <div className="flex-grow p-8 sm:p-12 lg:p-20 relative bg-white overflow-y-auto">
          <button 
            onClick={onClose} 
            className="absolute top-8 right-10 p-3 text-stone-300 hover:text-stone-900 hover:bg-stone-50 rounded-full transition-all z-20"
          >
            <X size={24} />
          </button>
          
          <div className="max-w-md mx-auto">
            <div className="mb-12 text-center lg:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-100 text-stone-900 mb-6">
                {isLogin ? <User size={24} /> : <UserPlus size={24} />}
              </div>
              <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4 tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-stone-500 text-base leading-relaxed">
                {isLogin 
                  ? 'Sign in to access your dashboard and track your premium orders.' 
                  : 'Join Kazi to experience a new standard in African retail.'}
              </p>
            </div>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-[1.25rem] flex items-center gap-4 animate-shake">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                    <input 
                      required 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => updateField('fullName', e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-semibold"
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                      <input 
                        required 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => updateField('phone', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-semibold"
                        placeholder="MoMo Phone"
                      />
                    </div>
                    <LocationSearch 
                      value={formData.city} 
                      onChange={(val) => updateField('city', val)}
                      placeholder="Home Area"
                    />
                  </div>
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                <input 
                  required 
                  type="email" 
                  value={formData.email} 
                  onChange={e => updateField('email', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-semibold"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-stone-900 transition-colors" size={20} />
                <input 
                  required 
                  type="password" 
                  value={formData.password} 
                  onChange={e => updateField('password', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-100 bg-stone-50/50 focus:bg-white focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 outline-none transition-all text-sm font-semibold"
                  placeholder="Create Password"
                />
              </div>

              <button 
                disabled={loading}
                className="group w-full bg-stone-900 text-white py-5 mt-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-950 transition-all active:scale-[0.98] disabled:bg-stone-200 shadow-xl shadow-stone-900/10 relative overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In to Kazi' : 'Create Your Account'}</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-sm text-stone-500 font-medium">
                {isLogin ? "New to our community?" : "Already have an account?"}
                <button 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="ml-2 text-stone-900 font-bold hover:text-stone-700 transition-colors underline decoration-stone-200 underline-offset-8"
                >
                  {isLogin ? 'Join Kazi' : 'Sign in instead'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
