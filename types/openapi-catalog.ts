export interface OpenApiCatalogItem {
  id: string;
  title: string;
  description?: string;
  specUrl: string;
  version?: string;
  specification?: string;
  format?: "json" | "yaml";
  owner?: string;
  tags?: string[];
  updatedAt?: string;
}

export interface OpenApiCatalogResponse {
  items: OpenApiCatalogItem[];
}
