
import { initializeApp } from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyAEK4hIsbv7DAKNTimii1R1z0C3LWMYYXY",
  authDomain: "studio-572308010-90c24.firebaseapp.com",
  projectId: "studio-572308010-90c24",
  storageBucket: "studio-572308010-90c24.firebasestorage.app",
  messagingSenderId: "875954381628",
  appId: "1:875954381628:web:b1974abdd0b8b1e9543439"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Collection References
export const ORDERS_REF = collection(db, 'orders');
export const USERS_REF = collection(db, 'users');
export const PRODUCTS_REF = collection(db, 'products');
