import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Prevent re-initializing on hot reload in Next.js dev mode
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db   = getFirestore(app);
export const auth = getAuth(app);

// Collection references
export const ORDERS_REF    = collection(db, 'orders');
export const USERS_REF     = collection(db, 'users');
export const PRODUCTS_REF  = collection(db, 'products');
export const INVENTORY_REF = collection(db, 'inventory');
export const EXPENSES_REF  = collection(db, 'expenses');