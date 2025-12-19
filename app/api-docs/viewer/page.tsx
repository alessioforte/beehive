"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, ActionIcon, Tooltip, Group, Text, Loader } from "@mantine/core";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { ApiDocumentation } from "@/components/api-docs";
import ColortSchemeToggle from "@/components/colorscheme-toggle";
import useStore from "@/store";
import { useOpenAPISpec } from "@/hooks/useOpenAPISpec";

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const specUrl = searchParams.get("url") || "";
  const { spec, loading, error, refetch } = useOpenAPISpec(specUrl);
  const { theme, setTheme } = useStore();

  const topNavHeight = "60px";

  return (
    <Box
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "1px solid var(--mantine-color-gray-3)",
          padding: "0.75rem 1rem",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          height: topNavHeight,
          flexShrink: 0,
        }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Tooltip label="Back to selection" withArrow>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => router.push("/api-docs")}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
            {spec && (
              <Box
                style={{ maxWidth: "calc(100vw - 200px)", overflow: "hidden" }}
              >
                <Text size="sm" fw={600} truncate>
                  {spec.info.title}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {decodeURIComponent(specUrl)}
                </Text>
              </Box>
            )}
          </Group>
          <Group>
            <ColortSchemeToggle theme={theme} onClick={setTheme} />
            {specUrl && (
              <Tooltip label="Open spec URL" withArrow>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  component="a"
                  href={specUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconExternalLink size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Box>

      <ApiDocumentation
        spec={spec}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </Box>
  );
}

export default function ViewerPage() {
  return (
    <Suspense
      fallback={
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <Loader size="xl" />
        </Box>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
