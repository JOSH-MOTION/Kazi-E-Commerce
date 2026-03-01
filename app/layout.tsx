import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import GlobalComponents from "../components/GlobalComponents";

export const metadata: Metadata = {
  title: "Cartly | Your Effortless Shop",
  description:
    "Your Effortless Shop. A high-performance, mobile-first e-commerce platform optimized for African markets.",
  keywords: [
    "Cartly",
    "ecommerce africa",
    "online shopping africa",
    "mobile first ecommerce",
    "african marketplace",
    "shop online ghana",
    "fast ecommerce platform",
  ],

  metadataBase: new URL("https://kazi-e-commerce.vercel.app/"), // ⚠️ replace with real domain

  icons: {
    icon: "/cartly.png", // ensure it's in /public
    shortcut: "/cartly.png",
    apple: "/cartly.png",
  },

  openGraph: {
    title: "Cartly | Your Effortless Shop",
    description:
      "A high-performance, mobile-first e-commerce platform optimized for African markets.",
    url: "https://kazi-e-commerce.vercel.app/", // replace
    siteName: "Cartly",
    images: [
      {
        url: "/cartly.png", // better to use relative when metadataBase is set
        width: 1200,
        height: 630,
        alt: "Cartly E-commerce Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Cartly | Your Effortless Shop",
    description:
      "Mobile-first e-commerce platform built for African markets.",
    images: ["/cartly.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  authors: [{ name: "Cartly Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="font-sans bg-[#fcfcf9] text-stone-900 antialiased"
        suppressHydrationWarning
      >
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <CartDrawer />
            <GlobalComponents />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}