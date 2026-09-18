function requiredUrl(name: string, value: string | undefined) {
  const cleaned = value?.trim();
  if (!cleaned) throw new Error(`Missing application configuration: ${name}`);

  try {
    return new URL(cleaned, window.location.origin).toString();
  } catch {
    throw new Error(`Invalid URL configured for ${name}`);
  }
}

export function getOpenApiCatalogUrl() {
  return requiredUrl(
    "VITE_OPENAPI_CATALOG_URL",
    import.meta.env.VITE_OPENAPI_CATALOG_URL,
  );
}

function configuredOrigin(value: string | undefined) {
  const cleaned = value?.trim();
  if (!cleaned) return null;

  try {
    return new URL(cleaned, window.location.origin).origin;
  } catch {
    return null;
  }
}

export function canSendAccessTokenTo(url: string) {
  const targetOrigin = configuredOrigin(url);
  if (!targetOrigin) return false;

  const configuredOrigins = [
    configuredOrigin(import.meta.env.VITE_API_URL),
    configuredOrigin(import.meta.env.VITE_OPENAPI_CATALOG_URL),
    ...(import.meta.env.VITE_OPENAPI_AUTHORIZED_ORIGINS ?? "")
      .split(",")
      .map(configuredOrigin),
  ].filter((origin): origin is string => Boolean(origin));

  return new Set(configuredOrigins).has(targetOrigin);
}
