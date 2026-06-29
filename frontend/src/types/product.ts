import type { ProviderId, StyleId } from "@/types/generation";

export type ProductStatus = "uploaded" | "processing" | "completed" | "failed";

export type ProductImage = {
  id: number;
  status: ProductStatus;
  style: string | null;
  provider: string | null;
  scene_prompt: string | null;
  error_message: string | null;
  original_url: string;
  enhanced_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductListResponse = {
  items: ProductImage[];
  total: number;
};

export type EnhanceProductPayload = {
  product_id: number;
  style: StyleId;
  scene_prompt?: string | null;
  provider?: ProviderId | null;
};
