import { lazy, Suspense, useMemo } from "react";
import { Center, Loader } from "@mantine/core";
import { Navigate, Route, Routes } from "react-router";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import HomePage from "@/pages/HomePage";
import AuthCallbackPage from "@/pages/AuthCallbackPage";
import AuthenticatedHomePage from "@/pages/AuthenticatedHomePage";
import { createAppOAuthClient, isAuthenticationEnabled } from "./auth";

const ApiDocsPage = lazy(() => import("@/pages/ApiDocsPage"));
const ViewerPage = lazy(() => import("@/pages/ViewerPage"));
const authenticationEnabled = isAuthenticationEnabled();

function DefaultRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/api-docs" element={<ApiDocsPage />} />
      <Route path="/api-docs/viewer" element={<ViewerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AuthenticatedRoutes() {
  const oauthClient = useMemo(() => createAppOAuthClient(), []);

  return (
    <AuthProvider client={oauthClient}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/" element={<AuthenticatedHomePage />} />
          <Route path="/api-docs" element={<ApiDocsPage />} />
          <Route path="/api-docs/viewer" element={<ViewerPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <Suspense
      fallback={
        <Center mih="100vh">
          <Loader size="lg" />
        </Center>
      }
    >
      {authenticationEnabled ? <AuthenticatedRoutes /> : <DefaultRoutes />}
    </Suspense>
  );
}
