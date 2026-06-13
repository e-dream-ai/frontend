import type {
  EndpointProviderType,
  EndpointCapabilities,
} from "@/types/user-api-endpoint.types";

export interface EndpointPreset {
  id: string;
  name: string;
  providerType: EndpointProviderType;
  endpointUrl: string;
  modelId: string;
  capabilities: EndpointCapabilities;
  description: string;
  keyUrl: string;
}

export const ENDPOINT_PRESETS: EndpointPreset[] = [
  {
    id: "flux-schnell",
    name: "FAL — Flux Schnell",
    providerType: "fal",
    endpointUrl: "https://fal.run/fal-ai/flux/schnell",
    modelId: "fal-ai/flux/schnell",
    capabilities: {
      textToImage: true,
      imageToImage: true,
      sizes: ["1024x1024", "1280x720", "720x1280"],
    },
    description: "Fast image generation & i2i · ~$0.003/image",
    keyUrl: "https://fal.ai/dashboard/keys",
  },
  {
    id: "flux-pro",
    name: "FAL — Flux Pro",
    providerType: "fal",
    endpointUrl: "https://fal.run/fal-ai/flux-pro",
    modelId: "fal-ai/flux-pro",
    capabilities: {
      textToImage: true,
      imageToImage: true,
      sizes: ["1024x1024", "1280x720", "720x1280"],
    },
    description: "Higher quality, slower · ~$0.05/image",
    keyUrl: "https://fal.ai/dashboard/keys",
  },
  {
    id: "openai-gpt-image-1",
    name: "OpenAI — gpt-image-1",
    providerType: "openai",
    endpointUrl: "https://api.openai.com/v1",
    modelId: "gpt-image-1",
    capabilities: {
      textToImage: true,
      imageToImage: true,
      sizes: ["1024x1024", "1536x1024", "1024x1536"],
    },
    description: "High quality image generation & editing · ~$0.02–0.19/image",
    keyUrl: "https://platform.openai.com/api-keys",
  },
];
