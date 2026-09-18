import { createOAuthClient } from "@/lib/auth";

const ENABLED_VALUES = new Set(["1", "true", "yes", "on"]);

function cleanValue(value: string | undefined) {
  const cleaned = value?.trim();
  return cleaned || null;
}

function cleanUrl(value: string | undefined) {
  return cleanValue(value)?.replace(/\/+$/, "") ?? null;
}

function requiredValue(name: string, value: string | undefined) {
  const cleaned = cleanValue(value);
  if (!cleaned) throw new Error(`Missing OAuth configuration: ${name}`);
  return cleaned;
}

export function isAuthenticationEnabled() {
  return ENABLED_VALUES.has(
    (import.meta.env.VITE_AUTH_ENABLED ?? "").trim().toLowerCase(),
  );
}

export function createAppOAuthClient() {
  const origin = window.location.origin;

  return createOAuthClient({
    apiUrl: cleanUrl(import.meta.env.VITE_API_URL) ?? origin,
    authUrl: cleanUrl(import.meta.env.VITE_AUTH_URL) ?? `${origin}/auth`,
    clientId: requiredValue(
      "VITE_OAUTH_CLIENT_ID",
      import.meta.env.VITE_OAUTH_CLIENT_ID,
    ),
    redirectUri:
      cleanUrl(import.meta.env.VITE_OAUTH_REDIRECT_URI) ??
      `${origin}/auth/callback`,
    storageKeyPrefix: "beehive.oauth",
  });
}
