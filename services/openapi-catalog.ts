import type {
  OpenApiCatalogItem,
  OpenApiCatalogResponse,
} from "@/types/openapi-catalog";

interface FetchOpenApiCatalogOptions {
  accessToken: string;
  endpoint: string;
  signal?: AbortSignal;
}

export class OpenApiCatalogError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "OpenApiCatalogError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseItem(
  value: unknown,
  index: number,
  endpoint: string,
): OpenApiCatalogItem {
  if (!isRecord(value)) {
    throw new OpenApiCatalogError(
      `Catalog item ${index + 1} is not an object.`,
    );
  }

  const id = optionalString(value.id);
  const title = optionalString(value.title);
  const rawSpecUrl = optionalString(value.specUrl);

  if (!id || !title || !rawSpecUrl) {
    throw new OpenApiCatalogError(
      `Catalog item ${index + 1} must include id, title, and specUrl.`,
    );
  }

  let specUrl: string;
  try {
    specUrl = new URL(rawSpecUrl, endpoint).toString();
  } catch {
    throw new OpenApiCatalogError(
      `Catalog item ${index + 1} contains an invalid specUrl.`,
    );
  }

  const format = optionalString(value.format)?.toLowerCase();
  if (format && format !== "json" && format !== "yaml") {
    throw new OpenApiCatalogError(
      `Catalog item ${index + 1} has an unsupported format.`,
    );
  }

  return {
    id,
    title,
    specUrl,
    description: optionalString(value.description),
    version: optionalString(value.version),
    specification: optionalString(value.specification),
    format: format as OpenApiCatalogItem["format"],
    owner: optionalString(value.owner),
    tags: Array.isArray(value.tags)
      ? value.tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : undefined,
    updatedAt: optionalString(value.updatedAt),
  };
}

function parseResponse(
  value: unknown,
  endpoint: string,
): OpenApiCatalogResponse {
  const items = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.items)
      ? value.items
      : null;

  if (!items) {
    throw new OpenApiCatalogError(
      "The catalog response must be an array or an object containing an items array.",
    );
  }

  return {
    items: items.map((item, index) => parseItem(item, index, endpoint)),
  };
}

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
    error_description?: string;
    message?: string;
  } | null;

  return new OpenApiCatalogError(
    body?.error_description ??
      body?.message ??
      body?.error ??
      `Unable to load the API catalog (${response.status}).`,
    response.status,
  );
}

export async function fetchOpenApiCatalog({
  accessToken,
  endpoint,
  signal,
}: FetchOpenApiCatalogOptions) {
  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    signal,
  });

  if (!response.ok) throw await responseError(response);

  const body: unknown = await response.json();
  return parseResponse(body, endpoint);
}
