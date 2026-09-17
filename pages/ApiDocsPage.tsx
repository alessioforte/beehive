import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Container,
  TextInput,
  Button,
  Stack,
  Group,
  Text,
  Paper,
  Box,
} from "@mantine/core";
import { IconSearch, IconFileCode } from "@tabler/icons-react";
import DocsLandingHeader from "@/components/api-docs/DocsLandingHeader";
import styles from "./ApiDocsPage.module.css";

export default function ApiDocsPage() {
  const [specUrl, setSpecUrl] = useState("");
  const navigate = useNavigate();

  const handleLoadSpec = () => {
    if (specUrl.trim()) {
      const encodedUrl = encodeURIComponent(specUrl.trim());
      navigate(`/api-docs/viewer?url=${encodedUrl}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLoadSpec();
    }
  };

  const loadExample = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    navigate(`/api-docs/viewer?url=${encodedUrl}`);
  };

  return (
    <Box className={styles.page}>
      <DocsLandingHeader />

      <Container size="lg" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="lg">
              Load OpenAPI Specification
            </Text>
            <Group align="flex-end" grow className={styles.loadControls}>
              <TextInput
                label="OpenAPI Spec URL"
                placeholder="https://api.example.com/openapi.json"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                leftSection={<IconSearch size={16} />}
                description="Enter the URL to your OpenAPI 3.0 specification (JSON or YAML)"
                style={{ flex: 1 }}
              />
              <Button
                onClick={handleLoadSpec}
                disabled={!specUrl.trim()}
                leftSection={<IconFileCode size={16} />}
              >
                Load Specification
              </Button>
            </Group>

            <Box>
              <Text size="sm" fw={500} mb="xs" c="dimmed">
                Try these examples:
              </Text>
              <Group gap="xs" wrap="wrap">
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => loadExample("/sample-openapi.json")}
                >
                  Demo API
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    loadExample(
                      "https://petstore3.swagger.io/api/v3/openapi.json",
                    )
                  }
                >
                  Petstore API
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    loadExample(
                      "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json",
                    )
                  }
                >
                  GitHub API
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  onClick={() =>
                    loadExample(
                      "https://raw.githubusercontent.com/stripe/openapi/refs/heads/master/openapi/spec3.yaml",
                    )
                  }
                >
                  Stripe API
                </Button>
              </Group>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
