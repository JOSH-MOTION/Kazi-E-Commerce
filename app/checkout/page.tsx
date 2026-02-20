'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Checkout from '../../components/Checkout';
import { useAppContext } from '../../context/AppContext';

export default function CheckoutPage() {
  const { cart, cartTotal, profile, clearCart } = useAppContext();
  const router = useRouter();

  return (
    <Checkout 
      cart={cart} 
      total={cartTotal} 
      userProfile={profile} 
      onComplete={() => { 
        clearCart(); 
        router.push('/orders'); 
      }}
      onCancel={() => router.push('/')}
    />
  );
}
