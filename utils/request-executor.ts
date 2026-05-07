import { ProxyRequestBody, ProxyResponse } from "@/types/api-tester";

export function buildRequestUrl(
  baseUrl: string,
  path: string,
  pathParams: Record<string, string>,
  queryParams: Record<string, string>,
): string {
  console.log("baseUrl", baseUrl);
  console.log("path", path);
  console.log("pathParams", pathParams);
  console.log("queryParams", queryParams);

  let url = path;

  Object.entries(pathParams).forEach(([key, value]) => {
    if (value) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }
  });

  const fullUrl = new URL(`${baseUrl}${url}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value) {
      fullUrl.searchParams.append(key, value);
    }
  });

  return fullUrl.toString();
}

export async function executeRequest(
  request: ProxyRequestBody,
): Promise<ProxyResponse> {
  const response = await fetch("/api/proxy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Proxy request failed: ${response.statusText}`);
  }

  return response.json();
}

export function extractPathParams(path: string): string[] {
  const matches = path.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}
