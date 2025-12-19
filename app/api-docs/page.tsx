"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  TextInput,
  Button,
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Box,
} from "@mantine/core";
import { IconSearch, IconFileCode } from "@tabler/icons-react";
import Header from "./header";

export default function ApiDocsPage() {
  const [specUrl, setSpecUrl] = useState("");
  const router = useRouter();

  const handleLoadSpec = () => {
    if (specUrl.trim()) {
      const encodedUrl = encodeURIComponent(specUrl.trim());
      router.push(`/api-docs/viewer?url=${encodedUrl}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLoadSpec();
    }
  };

  const loadExample = (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    router.push(`/api-docs/viewer?url=${encodedUrl}`);
  };

  return (
    <Box>
      {/* Header Section */}
      <Header />

      {/* URL Input Section */}
      <Container size="lg" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="lg">
              Load OpenAPI Specification
            </Text>
            <Group align="flex-end" grow>
              <TextInput
                label="OpenAPI Spec URL"
                placeholder="https://api.example.com/openapi.json"
                value={specUrl}
                onChange={(e) => setSpecUrl(e.currentTarget.value)}
                onKeyPress={handleKeyPress}
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

            {/* Example URLs */}
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
                      "https://api.apis.guru/v2/specs/stripe.com/2020-08-27/openapi.yaml",
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

      {/* Welcome Message */}
      <Container size="md" py="xl">
        <Paper p="xl" radius="md" withBorder style={{ textAlign: "center" }}>
          <Stack gap="md" align="center">
            <IconFileCode size={64} stroke={1} opacity={0.3} />
            <Title order={3} c="dimmed">
              Load Your API Specification
            </Title>
            <Text c="dimmed" maw={500}>
              Enter an OpenAPI specification URL above to view beautiful,
              interactive API documentation in full-screen mode. You can use one
              of the example APIs or provide your own specification URL.
            </Text>
            <Box mt="md">
              <Text size="sm" fw={500} c="dimmed" mb="xs">
                Features:
              </Text>
              <Stack gap="xs" align="flex-start">
                <Text size="sm" c="dimmed">
                  ✨ Full-screen documentation viewer
                </Text>
                <Text size="sm" c="dimmed">
                  🔍 Searchable sidebar navigation
                </Text>
                <Text size="sm" c="dimmed">
                  📊 Interactive schema visualization
                </Text>
                <Text size="sm" c="dimmed">
                  🎨 Beautiful, responsive design
                </Text>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
