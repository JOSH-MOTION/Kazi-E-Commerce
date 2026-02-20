
import { Category, Product, Promotion } from './types';

// SECURITY: In a production environment, this would be handled via Firebase Functions 
// or custom claims, but for this blueprint, we use a Master Key approach.
export const ADMIN_MASTER_PIN = "2025"; 

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Waffle Shirts', slug: 'waffle-shirts' },
  { id: 'cat-2', name: 'Bags', slug: 'bags' },
  { id: 'cat-3', name: 'Accessories', slug: 'accessories' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Essential Waffle Knit',
    description: 'Premium textured cotton waffle knit. Breathable, durable, and crafted for everyday versatility in the Ghanaian climate.',
    categoryId: 'cat-1',
    basePrice: 180, 
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: true,
    variants: [
      { id: 'v-1-s-b', sku: 'WS-BLK-S', size: 'S', colorName: 'Obsidian', hexColor: '#1a1a1a', price: 180, costPrice: 100, stock: 12, isComingSoon: false },
      { id: 'v-1-m-b', sku: 'WS-BLK-M', size: 'M', colorName: 'Obsidian', hexColor: '#1a1a1a', price: 180, costPrice: 100, stock: 5, isComingSoon: false },
      { id: 'v-1-l-b', sku: 'WS-BLK-L', size: 'L', colorName: 'Obsidian', hexColor: '#1a1a1a', price: 180, costPrice: 100, stock: 0, isComingSoon: false, leadTime: '7-10 days' },
      { id: 'v-1-s-o', sku: 'WS-OLV-S', size: 'S', colorName: 'Olive Drab', hexColor: '#556b2f', price: 180, costPrice: 100, stock: 0, isComingSoon: false, leadTime: '2 weeks' },
      { id: 'v-1-m-o', sku: 'WS-OLV-M', size: 'M', colorName: 'Olive Drab', hexColor: '#556b2f', price: 195, costPrice: 110, stock: 3, isComingSoon: false }
    ]
  },
  {
    id: 'p-2',
    name: 'Day-to-Night Tote',
    description: 'A heavy-duty canvas bag designed for the Accra hustle. Reinforced straps and water-resistant lining.',
    categoryId: 'cat-2',
    basePrice: 350,
    images: [
      'https://images.unsplash.com/photo-1544816153-12ad5d7133a1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800'
    ],
    isFeatured: true,
    variants: [
      { id: 'v-2-tan', sku: 'BAG-TAN', colorName: 'Desert Tan', hexColor: '#d2b48c', price: 350, costPrice: 200, stock: 20, isComingSoon: false },
      { id: 'v-2-blu', sku: 'BAG-BLU', colorName: 'Indigo', hexColor: '#000080', price: 350, costPrice: 200, stock: 0, isComingSoon: false, leadTime: '1 month' }
    ]
  },
  {
    id: 'p-3',
    name: 'Urban Canvas Messenger',
    description: 'Sleek, minimalist messenger bag for your tech essentials.',
    categoryId: 'cat-2',
    basePrice: 420,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'],
    variants: [
      { id: 'v-3-gr', sku: 'MSG-GRY', colorName: 'Concrete', hexColor: '#808080', price: 420, costPrice: 250, stock: 0, isComingSoon: true }
    ]
  }
];

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    code: 'ACCRA_VIBES',
    description: 'Launch Discount for the Collective',
    type: 'PERCENT',
    value: 10,
    targetType: 'STORE',
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  }
];

export const MOMO_CONFIG = {
  number: '0242403450',
  name: 'Joshua Doe',
  instructions: 'Please pay the exact amount to Joshua Doe. Use your full name as the reference in your MoMo app. Works with MTN, Telecel, and AT.'
};
