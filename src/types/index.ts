export type ProductVariant = {
  _key: string;
  attributes: {
    attributeName: string;
    attributeValue: string
  }[];
  stock: number;
  price: number;
  discountedPrice?: number;
  image: SanityImage;
};

export type FlatVariant = {
  flatAttributes: Record<string, string | number>;
  stock: number;
  price: number;
  discountedPrice?: number | undefined;
  image: SanityImage;
  key?: string
}

export type ProductData = {
  _id?: string;
  title: string;
  slug: Slug
  description: any[];
  hasVariants: boolean;
  baseImages?: SanityImage[];
  baseVideo?: SanityVideo;
  baseOriginalPrice?: number;
  baseDiscountedPrice?: number;
  baseStock?: number;
  variants?: ProductVariant[];
  collection: { title: string };
  tags?: string[];
  brand: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isBestSelling?: boolean;
  averageRating?: number;
  totalReviewsCount?: number;

  // Specification (New Field)
  specification?: Specification[];
};

export interface Specification {
  title?: string;
  description?: string;
  tags?: string[];
  image?: SanityImage
}

export type OnlyCollections = {
  _id: string;
  title: string;
  image: SanityImage;
  slug: Slug;
  description?: string;
};

export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: "reference";
    url?: string;
  };
}

export interface SanityVideo {
  _type: 'file';
  asset: {
    url: string;
  };
}

export interface Slug {
  _type: 'slug';
  current: string;
}

export interface CartItem {
  _id: string,
  title: string,
  slug: string,
  variant?: string,
  originalPrice: number,
  discountedPrice?: number,
  stockLevel: number,
  quantity: number,
  imageUrl: string,
  variantKey?: string
}

export type Review = {
  _id: number;
  rating: number;
  comment: string;
  reviewImages?: string[];
  reviewerName: string;
  reviewerEmail: string;
  date: string;
  approved: boolean;
};

export interface Order {
  _id: string;
  orderId: string;
  _createdAt: string;
  customer: {
    _id: string;
    name: string;
    number: string;
    address: string;
    city: string;
    province: string;
    email?: string;
    postalCode?: string;
  };
  orderItems: {
    _key: string;
    title: string;
    variant?: string;
    variantKey?: string;
    price: number;
    quantity: number;
    discountPrice?: number;
    productId?: string;
    imageUrl?: string;
    slug?: string;
  }[];
  billingInfo?: {
    name: string;
    number?: string;
    address: string;
    city: string;
    postalCode?: string;
  };
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingMethod: string;
  shippingCost?: number;
  subtotalAmount: number;
  totalAmount: number;
  discountCode?: string;
  discountAmount?: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

export type PaymentStatus = 'paid' | 'unpaid'