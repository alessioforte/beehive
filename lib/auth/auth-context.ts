import { createContext, useContext } from "react";
import type { AuthStatus, OAuthCallbackParams, OAuthTokenSet } from "./types";

export interface AuthContextValue {
  status: AuthStatus;
  error: string | null;
  tokens: OAuthTokenSet | null;
  checkSession: () => Promise<boolean>;
  completeSignIn: (params: OAuthCallbackParams) => Promise<string>;
  getAccessToken: () => Promise<string | null>;
  signIn: (returnPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
