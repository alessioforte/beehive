"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box, ActionIcon, Tooltip, Group, Text, Loader } from "@mantine/core";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { ApiDocumentation } from "@/components/api-docs";
import ColortSchemeToggle from "@/components/colorscheme-toggle";
import useStore from "@/store";
import { useOpenAPISpec } from "@/hooks/useOpenAPISpec";
import styles from "./page.module.css";

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const specUrl = searchParams.get("url") || "";
  const { spec, loading, error, refetch } = useOpenAPISpec(specUrl);
  const { theme, setTheme } = useStore();

  return (
    <Box className={styles.viewerContainer}>
      <Box className={styles.header}>
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
        <Box className={styles.loaderContainer}>
          <Loader size="xl" />
        </Box>
      }
    >
      <ViewerContent />
    </Suspense>
  );
}
