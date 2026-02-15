
import React from 'react';
import './globals.css';
import { Inter, Playfair_Display } from 'next/font/google';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'KAZI - African Premium Retail',
  description: 'Refined essentials for the modern African professional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#fcfcf9] text-stone-900`}>
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
