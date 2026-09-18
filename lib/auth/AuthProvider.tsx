import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { OAuthClient } from "./oauth-client";
import type { AuthStatus, OAuthCallbackParams, OAuthTokenSet } from "./types";
import { AuthContext, type AuthContextValue } from "./auth-context";

interface AuthProviderProps {
  client: OAuthClient;
  children: ReactNode;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed";
}

export function AuthProvider({ client, children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<OAuthTokenSet | null>(null);

  const checkSession = useCallback(async () => {
    setStatus("checking");
    setError(null);

    try {
      const nextTokens = await client.getValidTokens();
      setTokens(nextTokens);
      setStatus(nextTokens ? "authenticated" : "unauthenticated");
      return Boolean(nextTokens);
    } catch (nextError) {
      setTokens(null);
      setError(errorMessage(nextError));
      setStatus("error");
      return false;
    }
  }, [client]);

  const signIn = useCallback(
    async (returnPath = "/") => {
      setStatus("redirecting");
      setError(null);

      try {
        await client.signIn(returnPath);
      } catch (nextError) {
        setError(errorMessage(nextError));
        setStatus("error");
      }
    },
    [client],
  );

  const completeSignIn = useCallback(
    async (params: OAuthCallbackParams) => {
      setStatus("checking");
      setError(null);

      try {
        const result = await client.completeSignIn(params);
        setTokens(result.tokens);
        setStatus("authenticated");
        return result.returnPath;
      } catch (nextError) {
        setTokens(null);
        setError(errorMessage(nextError));
        setStatus("error");
        throw nextError;
      }
    },
    [client],
  );

  const getAccessToken = useCallback(async () => {
    try {
      const nextTokens = await client.getValidTokens();
      setTokens(nextTokens);
      setStatus(nextTokens ? "authenticated" : "unauthenticated");
      return nextTokens?.access_token ?? null;
    } catch (nextError) {
      setTokens(null);
      setError(errorMessage(nextError));
      setStatus("error");
      throw nextError;
    }
  }, [client]);

  const signOut = useCallback(async () => {
    await client.signOut();
    setTokens(null);
    setError(null);
    setStatus("unauthenticated");
  }, [client]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      error,
      tokens,
      checkSession,
      completeSignIn,
      getAccessToken,
      signIn,
      signOut,
    }),
    [
      status,
      error,
      tokens,
      checkSession,
      completeSignIn,
      getAccessToken,
      signIn,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
