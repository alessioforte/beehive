import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Box, ActionIcon, Tooltip, Group, Text } from "@mantine/core";
import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import { ApiDocumentation } from "@/components/api-docs";
import ColortSchemeToggle from "@/components/colorscheme-toggle";
import useStore from "@/store";
import styles from "./ViewerPage.module.css";

export default function ViewerPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const specUrl = searchParams.get("url") || "";

  const {
    openAPISpec,
    openAPISpecSourceSize,
    openAPILoading,
    openAPIError,
    fetchOpenAPISpec,
    refetchOpenAPISpec,
    theme,
    setTheme,
  } = useStore();

  useEffect(() => {
    if (specUrl) {
      fetchOpenAPISpec(specUrl);
    }
  }, [specUrl, fetchOpenAPISpec]);

  return (
    <Box className={styles.viewerContainer}>
      <Box className={styles.header}>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Tooltip label="Back to selection" withArrow>
              <ActionIcon
                variant="subtle"
                size="lg"
                onClick={() => navigate("/api-docs")}
              >
                <IconArrowLeft size={20} />
              </ActionIcon>
            </Tooltip>
            {openAPISpec && (
              <Box
                style={{ maxWidth: "calc(100vw - 200px)", overflow: "hidden" }}
              >
                <Text size="sm" fw={600} truncate>
                  {openAPISpec.info.title}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {specUrl}
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
        spec={openAPISpec}
        specSourceSize={openAPISpecSourceSize}
        loading={openAPILoading}
        error={openAPIError}
        onRetry={refetchOpenAPISpec}
      />
    </Box>
  );
}
