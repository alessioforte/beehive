export interface OpenAPISpec {
  openapi: string;
  info: Info;
  servers?: Server[];
  paths: Paths;
  components?: Components;
  tags?: Tag[];
}

export interface Info {
  title: string;
  description?: string;
  version: string;
  contact?: { name?: string; url?: string; email?: string };
  license?: { name: string; url?: string };
}

export interface Server {
  url: string;
  description?: string;
}

export interface Paths {
  [path: string]: PathItem;
}

export interface PathItem {
  summary?: string;
  description?: string;
  get?: Operation;
  put?: Operation;
  post?: Operation;
  delete?: Operation;
  patch?: Operation;
  parameters?: Parameter[];
}

export interface Operation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Responses;
  deprecated?: boolean;
  security?: SecurityRequirement[];
}

export interface Parameter {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: Schema;
  example?: unknown;
}

export interface RequestBody {
  description?: string;
  content: Record<string, MediaType>;
  required?: boolean;
}

export interface MediaType {
  schema?: Schema;
  example?: unknown;
  examples?: Record<string, unknown>;
}

export interface Responses {
  [statusCode: string]: Response;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
  headers?: Record<string, Header>;
}

export interface Header {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  schema?: Schema;
}

export interface Tag {
  name: string;
  description?: string;
}

export interface Schema {
  type?: string;
  format?: string;
  description?: string;
  required?: string[];
  properties?: Record<string, Schema>;
  items?: Schema;
  enum?: unknown[];
  default?: unknown;
  example?: unknown;
  nullable?: boolean;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  $ref?: string;
}

export interface Components {
  schemas?: Record<string, Schema>;
  securitySchemes?: Record<string, SecurityScheme>;
}

export interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
}

export interface SecurityRequirement {
  [name: string]: string[];
}
