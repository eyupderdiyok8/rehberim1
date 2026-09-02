export type B2BVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "suspended";

export interface B2BMember {
  user_id: string;
  account_type: "buyer" | "wholesaler" | "admin";
  verification_status: B2BVerificationStatus;
  business_name: string | null;
  review_note: string | null;
}

export interface B2BWholesaler {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  cover_url: string | null;
  city: string | null;
  shipping_terms: string | null;
  rating: number;
  review_count: number;
}

export interface B2BProduct {
  id: string;
  wholesaler_id: string;
  name: string;
  slug: string;
  brand: string | null;
  category: string;
  description: string | null;
  image_urls: string[];
  specifications: Record<string, string | number | boolean>;
  minimum_order_quantity: number;
  unit: string;
  vat_included: boolean;
  stock_status: "in_stock" | "low_stock" | "preorder" | "out_of_stock";
  lead_time_days: number;
  wholesaler?: B2BWholesaler;
  price?: number;
  currency?: "TRY" | "USD" | "EUR";
}

