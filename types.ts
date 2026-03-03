
export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER'
}

export interface StoreSettings {
  id: string;
  tickerText: string;
  isTickerActive: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroCtaText?: string;
  heroSecondaryCtaText?: string;
  banner1Title?: string;
  banner1Subtitle?: string;
  banner1Image?: string;
  banner2Title?: string;
  banner2Subtitle?: string;
  banner2Image?: string;
  // Promo Grid
  promo1Title?: string;
  promo1Subtitle?: string;
  promo1Image?: string;
  promo1Badge?: string;
  promo1Link?: string;
  promo2Title?: string;
  promo2Subtitle?: string;
  promo2Image?: string;
  promo2Badge?: string;
  promo2Link?: string;
  promo3Title?: string;
  promo3Subtitle?: string;
  promo3Image?: string;
  promo3Badge?: string;
  promo3Link?: string;
  promo4Title?: string;
  promo4Subtitle?: string;
  promo4Image?: string;
  promo4Badge?: string;
  promo4Link?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size?: string;
  colorName: string;
  hexColor: string;
  images?: string[]; // Color-specific images
  price: number;
  costPrice: number;
  stock: number;
  isComingSoon: boolean;
  leadTime?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  basePrice: number;
  images: string[];
  variants: ProductVariant[];
  isFeatured?: boolean;
}

export interface CartItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface Promotion {
  id: string;
  code: string;
  description: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  targetType: 'STORE' | 'CATEGORY' | 'PRODUCT';
  targetId?: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  momoTransactionId?: string;
  momoScreenshotUrl?: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
}

export interface ManualSale {
  id: string;
  itemName: string;
  quantity: number;
  salePrice: number;
  costPrice: number;
  profit: number;
  channel: string; // e.g., 'WhatsApp', 'In-Person'
  createdAt: string;
}
