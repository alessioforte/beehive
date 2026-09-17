import { ApiRequest, ResponseState } from "@/types/api-tester";

export function buildRequestUrl(
  baseUrl: string,
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string {
  let url = path;

  Object.entries(pathParams).forEach(([key, value]) => {
    if (value) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }
  });

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const fullUrl = new URL(url.replace(/^\//, ""), normalizedBaseUrl);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      fullUrl.searchParams.append(key, value);
    }
  });

  return fullUrl.toString();
}

export async function executeRequest(
  request: ApiRequest,
): Promise<ResponseState> {
  const startedAt = performance.now();
  const method = request.method.toUpperCase();
  const requestInit: RequestInit = {
    method,
    headers: request.headers,
  };

  if (request.body && method !== "GET" && method !== "HEAD") {
    requestInit.body = request.body;
  }

  const response = await fetch(request.url, requestInit);
  const responseText = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  let body = responseText;

  if (contentType.includes("json") && responseText) {
    try {
      body = JSON.stringify(JSON.parse(responseText), null, 2);
    } catch {
      // Keep malformed JSON visible exactly as the API returned it.
    }
  }

  const headers = Object.fromEntries(response.headers.entries());

  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body,
    timing: Math.round(performance.now() - startedAt),
  };
}

export function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}
