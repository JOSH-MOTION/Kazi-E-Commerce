
'use client';
import Storefront from '../components/Storefront';
import { useAppContext } from '../context/AppContext';

export default function Home() {
  const { addToCart } = useAppContext();
  return <Storefront addToCart={addToCart} />;
}
