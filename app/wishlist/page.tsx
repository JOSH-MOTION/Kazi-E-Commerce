'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Wishlist from '../../components/Wishlist';
import { useAppContext } from '../../context/AppContext';

export default function WishlistPage() {
  const { addToCart } = useAppContext();
  const router = useRouter();

  return (
    <Wishlist 
      navigate={(path) => router.push(`/${path === 'store' ? '' : path}`)} 
      addToCart={addToCart}
    />
  );
}
