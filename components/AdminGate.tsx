
import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowRight, Loader2, X } from 'lucide-react';
import { db } from '../firebase';
import { updateDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ADMIN_MASTER_PIN } from '../constants';

interface AdminGateProps {
  uid: string;
  onSuccess: () => void;
  onClose: () => void;
}

const AdminGate: React.FC<AdminGateProps> = ({ uid, onSuccess, onClose }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    if (pin === ADMIN_MASTER_PIN) {
      try {
        // Elevate user in Firestore
        await updateDoc(doc(db, 'users', uid), {
          role: 'ADMIN',
          elevatedAt: new Date().toISOString()
        });
        onSuccess();
      } catch (err) {
        console.error("Elevation failed:", err);
      }
    } else {
      setError(true);
      setPin('');
      // Haptic-like shake handled via CSS
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-sm" onClick={onClose} />
      
      <div className={`relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-[2rem] p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300 ${error ? 'animate-shake' : ''}`}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-600 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-stone-700">
          <Lock size={28} className={error ? 'text-red-500' : 'text-orange-500'} />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Security Challenge</h2>
        <p className="text-stone-500 text-xs mb-8 uppercase tracking-widest leading-relaxed">
          Enter Master Admin Key to access Operations Dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              autoFocus
              type="password"
              maxLength={4}
              value={pin}
              // FIX: Use setPin instead of non-existent setQuery. Removed redundant onInput.
              onChange={e => setPin(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-4 text-center text-3xl font-mono tracking-[0.5em] text-orange-500 focus:border-orange-500/50 outline-none transition-all placeholder:text-stone-800"
              placeholder="••••"
            />
          </div>

          <button 
            disabled={loading || pin.length < 4}
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Verify Identity</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="mt-6 text-red-500 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            Access Denied. Incorrect Key.
          </p>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-10px); }
          40%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdminGate;
