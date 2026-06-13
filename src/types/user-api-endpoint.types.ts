export type EndpointProviderType = "openai" | "fal";

export interface EndpointCapabilities {
  textToImage: boolean;
  imageToImage: boolean;
  sizes: string[];
}

export interface UserApiEndpoint {
  uuid: string;
  name: string;
  providerType: EndpointProviderType;
  presetId: string;
  endpointUrl: string;
  apiKeyLastFour: string;
  modelId: string;
  capabilities: EndpointCapabilities;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserApiEndpointParams {
  name: string;
  providerType: EndpointProviderType;
  presetId: string;
  endpointUrl: string;
  apiKey: string;
  modelId: string;
  capabilities: EndpointCapabilities;
}

export interface UpdateUserApiEndpointParams {
  uuid: string;
  name?: string;
  endpointUrl?: string;
  apiKey?: string;
  modelId?: string;
  capabilities?: EndpointCapabilities;
}
