export type StyleId = "luxury" | "minimal" | "outdoor";

export type ProviderId = "huggingface" | "stability";

export type StylePreset = {
  id: StyleId;
  name: string;
  description: string;
};

export type TextToImagePayload = {
  prompt: string;
  style?: StyleId | null;
  provider?: ProviderId | null;
};

export type Generation = {
  id: number;
  prompt: string;
  style: string | null;
  provider: string;
  image_url: string;
  created_at: string;
};

export type GenerationListResponse = {
  items: Generation[];
  total: number;
};
