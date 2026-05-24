export type AiModelMetadata = {
  id: string;
  name: string;
};

export type AiProviderMetadata = {
  id: string;
  models: AiModelMetadata[];
  name: string;
};
