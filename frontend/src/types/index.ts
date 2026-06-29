export type StylePreset = {
  id: string;
  name: string;
  description: string;
};

export type GenerationRequest = {
  prompt: string;
  style?: string;
  provider?: "huggingface" | "replicate" | "stability";
};
