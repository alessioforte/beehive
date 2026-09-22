import {
  OAuthFlowError,
  type OAuthCallbackParams,
  type OAuthCallbackResult,
  type OAuthClientConfig,
  type OAuthEndpoints,
  type OAuthRequestState,
  type OAuthTokenResponse,
  type OAuthTokenSet,
} from "./types";

const DEFAULT_SCOPE = "openid email profile offline_access";
const DEFAULT_ENDPOINTS: OAuthEndpoints = {
  authorize: "/oauth/authorize",
  hostedLogin: "/login",
  revoke: "/oauth/revoke",
  token: "/oauth/token",
};

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function joinUrl(baseUrl: string, path: string) {
  return `${trimTrailingSlashes(baseUrl)}/${path.replace(/^\/+/, "")}`;
}

function base64UrlEncode(bytes: ArrayBuffer) {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function getBrowserCrypto() {
  const browserCrypto = window.crypto;

  if (!browserCrypto?.getRandomValues || !browserCrypto.subtle?.digest) {
    throw new OAuthFlowError(
      "OAuth PKCE requires Web Crypto. Use HTTPS or localhost and a browser that supports crypto.subtle.",
    );
  }

  return browserCrypto;
}

function randomString(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  getBrowserCrypto().getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function createCodeChallenge(codeVerifier: string) {
  const value = new TextEncoder().encode(codeVerifier);
  const digest = await getBrowserCrypto().subtle.digest("SHA-256", value);
  return base64UrlEncode(digest);
}

function safeReturnPath(returnPath: string) {
  try {
    const url = new URL(returnPath, window.location.origin);
    if (url.origin !== window.location.origin) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

function isOAuthRequestState(value: unknown): value is OAuthRequestState {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<OAuthRequestState>;
  return (
    typeof request.codeVerifier === "string" &&
    typeof request.returnPath === "string" &&
    typeof request.state === "string"
  );
}

function isOAuthTokenSet(value: unknown): value is OAuthTokenSet {
  if (!value || typeof value !== "object") return false;
  const tokens = value as Partial<OAuthTokenSet>;
  return (
    typeof tokens.access_token === "string" &&
    typeof tokens.expires_at === "number" &&
    typeof tokens.expires_in === "number" &&
    typeof tokens.token_type === "string"
  );
}

async function responseError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
    error_description?: string;
    message?: string;
  } | null;

  return new OAuthFlowError(
    body?.error_description ??
      body?.message ??
      body?.error ??
      `OAuth request failed with status ${response.status}`,
    body?.error,
  );
}

export class OAuthClient {
  private readonly config: Required<
    Pick<
      OAuthClientConfig,
      | "apiUrl"
      | "authUrl"
      | "clientId"
      | "redirectUri"
      | "scope"
      | "storageKeyPrefix"
      | "expiryBufferSeconds"
    >
  > & {
    endpoints: OAuthEndpoints;
    fetch?: OAuthClientConfig["fetch"];
  };

  private refreshPromise: Promise<OAuthTokenSet | null> | null = null;
  private callbackPromise: Promise<OAuthCallbackResult> | null = null;
  private redirecting = false;

  constructor(config: OAuthClientConfig) {
    this.config = {
      ...config,
      apiUrl: trimTrailingSlashes(config.apiUrl),
      authUrl: trimTrailingSlashes(config.authUrl),
      scope: config.scope ?? DEFAULT_SCOPE,
      storageKeyPrefix: config.storageKeyPrefix ?? "oauth",
      expiryBufferSeconds: config.expiryBufferSeconds ?? 30,
      endpoints: { ...DEFAULT_ENDPOINTS, ...config.endpoints },
    };
  }

  private get tokenStorageKey() {
    return `${this.config.storageKeyPrefix}.tokens`;
  }

  private get requestStorageKey() {
    return `${this.config.storageKeyPrefix}.request`;
  }

  private get fetcher() {
    return this.config.fetch ?? window.fetch.bind(window);
  }

  getStoredTokens(): OAuthTokenSet | null {
    try {
      const raw = window.localStorage.getItem(this.tokenStorageKey);
      if (!raw) return null;

      const tokens: unknown = JSON.parse(raw);
      if (isOAuthTokenSet(tokens)) return tokens;
    } catch {
      // Invalid or unavailable storage is treated as a missing session.
    }

    this.clearTokens();
    return null;
  }

  clearTokens() {
    window.localStorage.removeItem(this.tokenStorageKey);
  }

  clearSession() {
    this.clearTokens();
    window.sessionStorage.removeItem(this.requestStorageKey);
  }

  async getValidTokens(): Promise<OAuthTokenSet | null> {
    const tokens = this.getStoredTokens();
    if (!tokens) return null;

    const expiresWithBuffer =
      tokens.expires_at - this.config.expiryBufferSeconds * 1_000;
    if (Date.now() < expiresWithBuffer) return tokens;

    if (!tokens.refresh_token) {
      this.clearTokens();
      return null;
    }

    return this.refreshTokens(tokens.refresh_token);
  }

  async getAccessToken() {
    return (await this.getValidTokens())?.access_token ?? null;
  }

  async buildAuthorizeUrl(returnPath = "/") {
    const codeVerifier = randomString(64);
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = randomString(32);

    const request: OAuthRequestState = {
      codeVerifier,
      returnPath: safeReturnPath(returnPath),
      state,
    };
    window.sessionStorage.setItem(
      this.requestStorageKey,
      JSON.stringify(request),
    );

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `${joinUrl(this.config.apiUrl, this.config.endpoints.authorize)}?${params.toString()}`;
  }

  async signIn(returnPath = "/") {
    if (this.redirecting) return;
    this.redirecting = true;

    try {
      const authorizeUrl = await this.buildAuthorizeUrl(returnPath);
      window.location.assign(authorizeUrl);
    } catch (error) {
      this.redirecting = false;
      throw error;
    }
  }

  private async redirectToHostedLogin(returnPath: string) {
    this.redirecting = true;

    try {
      const authorizeUrl = await this.buildAuthorizeUrl(returnPath);
      const loginUrl = new URL(
        joinUrl(this.config.authUrl, this.config.endpoints.hostedLogin),
      );
      loginUrl.searchParams.set("return_to", authorizeUrl);
      window.location.assign(loginUrl.toString());
    } catch (error) {
      this.redirecting = false;
      throw error;
    }
  }

  completeSignIn(params: OAuthCallbackParams): Promise<OAuthCallbackResult> {
    if (this.callbackPromise) return this.callbackPromise;

    this.callbackPromise = this.completeSignInRequest(params).finally(() => {
      this.callbackPromise = null;
    });

    return this.callbackPromise;
  }

  private async completeSignInRequest(
    params: OAuthCallbackParams,
  ): Promise<OAuthCallbackResult> {
    const request = this.getOAuthRequest();

    if (!request || !params.state || request.state !== params.state) {
      this.clearSession();
      throw new OAuthFlowError(
        "The OAuth state is missing or invalid. Start the sign-in flow again.",
        "invalid_state",
      );
    }

    if (params.error) {
      if (params.error === "login_required") {
        await this.redirectToHostedLogin(request.returnPath);
        return { status: "redirecting" };
      }

      window.sessionStorage.removeItem(this.requestStorageKey);
      throw new OAuthFlowError(
        params.errorDescription ??
          `OAuth authorization failed: ${params.error}`,
        params.error,
      );
    }

    if (!params.code) {
      window.sessionStorage.removeItem(this.requestStorageKey);
      throw new OAuthFlowError(
        "The OAuth callback did not include an authorization code.",
        "missing_code",
      );
    }

    try {
      const tokens = await this.exchangeAuthorizationCode(
        params.code,
        request.codeVerifier,
      );
      window.sessionStorage.removeItem(this.requestStorageKey);
      return {
        status: "authenticated",
        tokens,
        returnPath: request.returnPath,
      };
    } catch (error) {
      this.clearSession();
      throw error;
    }
  }

  async signOut() {
    const tokens = this.getStoredTokens();

    if (tokens?.refresh_token) {
      await this.revokeToken(tokens.refresh_token, "refresh_token").catch(
        () => undefined,
      );
    }

    this.clearSession();
    this.redirecting = false;
  }

  private getOAuthRequest(): OAuthRequestState | null {
    try {
      const raw = window.sessionStorage.getItem(this.requestStorageKey);
      if (!raw) return null;

      const request: unknown = JSON.parse(raw);
      if (isOAuthRequestState(request)) return request;
    } catch {
      // Invalid or unavailable storage is handled below.
    }

    window.sessionStorage.removeItem(this.requestStorageKey);
    return null;
  }

  private async postTokenRequest(body: URLSearchParams) {
    const response = await this.fetcher(
      joinUrl(this.config.apiUrl, this.config.endpoints.token),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );

    if (!response.ok) throw await responseError(response);

    const tokenResponse = (await response.json()) as OAuthTokenResponse;
    if (
      !tokenResponse.access_token ||
      typeof tokenResponse.expires_in !== "number" ||
      !tokenResponse.token_type
    ) {
      throw new OAuthFlowError("The OAuth token response is invalid.");
    }

    return tokenResponse;
  }

  private storeTokens(
    response: OAuthTokenResponse,
    previousRefreshToken?: string,
  ) {
    const tokens: OAuthTokenSet = {
      ...response,
      refresh_token: response.refresh_token ?? previousRefreshToken,
      expires_at: Date.now() + response.expires_in * 1_000,
    };
    window.localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokens));
    return tokens;
  }

  private async exchangeAuthorizationCode(code: string, codeVerifier: string) {
    const response = await this.postTokenRequest(
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri,
        code,
        code_verifier: codeVerifier,
      }),
    );

    return this.storeTokens(response);
  }

  private refreshTokens(refreshToken: string) {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.postTokenRequest(
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: this.config.clientId,
        refresh_token: refreshToken,
      }),
    )
      .then((response) => this.storeTokens(response, refreshToken))
      .catch(() => {
        this.clearTokens();
        return null;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async revokeToken(token: string, tokenTypeHint: string) {
    const response = await this.fetcher(
      joinUrl(this.config.apiUrl, this.config.endpoints.revoke),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          token,
          token_type_hint: tokenTypeHint,
          client_id: this.config.clientId,
        }),
      },
    );

    if (!response.ok) throw await responseError(response);
  }
}

export function createOAuthClient(config: OAuthClientConfig) {
  return new OAuthClient(config);
}
