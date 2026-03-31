import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import Script from 'next/script';


export const metadata: Metadata = {
  metadataBase: new URL("https://www.cartlygh.com"),
  title: {
    default: "CARTLY | Shop Premium Fashion, Apparel & Lifestyle Essentials in Ghana",
    template: "%s | CARTLY GH",
  },
  description:
    "Discover the best in fashion, premium clothing, and lifestyle essentials at Cartly. Your ultimate destination for top-quality apparel and accessories in Accra. Fast delivery across all regions in Ghana.",
  keywords: [
    "cartly gh",
    "cartly ghana",
    "online shopping ghana",
    "buy clothes online accra",
    "fashion store accra",
    "lifestyle essentials ghana",
    "accessories ghana",
    "quality apparel ghana",
    "premium streetwear accra",
    "clothing store ghana",
    "waffle shirts ghana",
    "canvas bags accra",
    "buy dresses online ghana",
    "womens fashion accra",
    "mens clothing ghana",
    "best online store ghana",
    "shopping app accra",
    "exclusive collections ghana",
  ],
  authors: [{ name: "Cartly GH", url: "https://www.cartlygh.com" }],
  creator: "Cartly GH",
  publisher: "Cartly GH",
  category: "Shopping",
  applicationName: "Cartly GH",
  
  alternates: {
    canonical: "https://www.cartlygh.com",
  },

  openGraph: {
    title: "CARTLY | Your Premier Fashion & Lifestyle Destination in Ghana",
    description:
      "Shop the latest in fashion, premium apparel, and lifestyle essentials at Cartly — Accra's most trusted online clothing destination.",
    url: "https://www.cartlygh.com",
    siteName: "Cartly GH",
    images: [
      {
        url: "https://www.cartlygh.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Cartly GH - Quality Apparel in Ghana",
      },
    ],
    locale: "en_GH",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CARTLY | Shop Fashion, Apparel & Essentials in Accra, Ghana",
    description:
      "Your ultimate destination for quality apparel shopping. From the latest fashion to essential lifestyle items. Delivery across Ghana.",
    images: ["https://www.cartlygh.com/og-image.jpg"],
    site: "@cartly_gh",
    creator: "@cartly_gh",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/favicon.png",
    },
  },

  verification: {
    google: "Ol2iqh_JBh4KR-CVvfJAafLMV69GKkunYFnZpupwDFo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Google Analytics */}
<Script
  id="google-analytics"
  strategy="afterInteractive"
  src="https://www.googletagmanager.com/gtag/js?id=G-1FLN96BM0J"
/>

<Script
  id="google-analytics-init"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-1FLN96BM0J');
    `,
  }}
/>

<Script
  id="structured-data"
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "Cartly GH",
      description:
        "Your premier online destination for fashion, premium apparel, and lifestyle essentials in Accra, Ghana.",
      url: "https://www.cartlygh.com",
      logo: "https://www.cartlygh.com/catly.png",
      image: "https://www.cartlygh.com/og-image.jpg",
      telephone: "+233242403450",
      email: "support@cartlygh.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Accra",
        addressLocality: "Accra",
        addressCountry: "GH",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 5.6037,
        longitude: -0.1870,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday","Tuesday","Wednesday",
          "Thursday","Friday","Saturday","Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      sameAs: [
        "https://www.instagram.com/cartly_gh",
        "https://twitter.com/cartly_gh",
      ],
      priceRange: "GH₵₵₵",
      currenciesAccepted: "GHS",
      paymentAccepted: "Mobile Money, Cash",
      areaServed: "Ghana",
    }),
  }}
/>
      <body className="antialiased font-sans bg-[#fcfcf9] text-stone-900" suppressHydrationWarning>
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
