export interface OAuthTokenSet {
  access_token: string;
  expires_in: number;
  expires_at: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}

export interface OAuthRequestState {
  codeVerifier: string;
  returnPath: string;
  state: string;
}

export interface OAuthEndpoints {
  authorize: string;
  hostedLogin: string;
  revoke: string;
  token: string;
}

export interface OAuthClientConfig {
  apiUrl: string;
  authUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
  storageKeyPrefix?: string;
  expiryBufferSeconds?: number;
  endpoints?: Partial<OAuthEndpoints>;
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export interface OAuthCallbackParams {
  code: string | null;
  error: string | null;
  errorDescription: string | null;
  state: string | null;
}

export interface OAuthCallbackResult {
  returnPath: string;
  tokens: OAuthTokenSet;
}

export type AuthStatus =
  | "idle"
  | "checking"
  | "redirecting"
  | "authenticated"
  | "unauthenticated"
  | "error";

export class OAuthFlowError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "OAuthFlowError";
    this.code = code;
  }
}
