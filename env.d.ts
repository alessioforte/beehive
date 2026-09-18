/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_AUTH_ENABLED?: string;
  readonly VITE_AUTH_URL?: string;
  readonly VITE_OAUTH_CLIENT_ID?: string;
  readonly VITE_OAUTH_REDIRECT_URI?: string;
  readonly VITE_OPENAPI_CATALOG_URL?: string;
  readonly VITE_OPENAPI_AUTHORIZED_ORIGINS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
