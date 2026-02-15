
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
  price: number;
  stock: number;
  isComingSoon: boolean;
  leadTime?: string; // e.g. "7-14 days", "2 weeks", "1 month"
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
