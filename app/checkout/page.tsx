
'use client';
import { useRouter } from 'next/navigation';
import Checkout from '../../components/Checkout';
import { useAppContext } from '../../context/AppContext';

export default function CheckoutPage() {
  const { cart, cartTotal, profile, clearCart } = useAppContext();
  const router = useRouter();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4">Your bag is empty</h2>
        <p className="text-stone-500 mb-8">Add some essentials before checking out.</p>
        <button onClick={() => router.push('/')} className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <Checkout 
      cart={cart} 
      total={cartTotal} 
      userProfile={profile}
      onComplete={() => { clearCart(); router.push('/'); }}
      onCancel={() => router.push('/')} 
    />
  );
}
