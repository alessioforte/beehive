import { lazy, Suspense } from "react";
import { Center, Loader } from "@mantine/core";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "@/pages/HomePage";

const ApiDocsPage = lazy(() => import("@/pages/ApiDocsPage"));
const ViewerPage = lazy(() => import("@/pages/ViewerPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <Center mih="100vh">
          <Loader size="lg" />
        </Center>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/api-docs" element={<ApiDocsPage />} />
        <Route path="/api-docs/viewer" element={<ViewerPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
