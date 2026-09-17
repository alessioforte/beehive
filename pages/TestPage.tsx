import { useState } from "react";
import {
  Box,
  Button,
  Group,
  Text,
  Stack,
  Card,
  Badge,
  Code,
  Loader,
  Alert,
} from "@mantine/core";
import { IconCheck, IconX, IconInfoCircle } from "@tabler/icons-react";
import useStore from "@/store/store";

export default function TestPage() {
  const spec = useStore((state) => state.openAPISpec);
  const loading = useStore((state) => state.openAPILoading);
  const error = useStore((state) => state.openAPIError);
  const fetchOpenAPISpec = useStore((state) => state.fetchOpenAPISpec);

  const [testResults, setTestResults] = useState<{
    yaml: boolean | null;
    json: boolean | null;
    stargate: boolean | null;
  }>({
    yaml: null,
    json: null,
    stargate: null,
  });

  const testYaml = async () => {
    setTestResults((prev) => ({ ...prev, yaml: null }));
    try {
      await fetchOpenAPISpec("/samples/petstore.yaml");
      setTestResults((prev) => ({ ...prev, yaml: true }));
    } catch {
      setTestResults((prev) => ({ ...prev, yaml: false }));
    }
  };

  const testJson = async () => {
    setTestResults((prev) => ({ ...prev, json: null }));
    try {
      await fetchOpenAPISpec(
        "https://petstore3.swagger.io/api/v3/openapi.json",
      );
      setTestResults((prev) => ({ ...prev, json: true }));
    } catch {
      setTestResults((prev) => ({ ...prev, json: false }));
    }
  };

  const testStargate = async () => {
    setTestResults((prev) => ({ ...prev, stargate: null }));
    try {
      await fetchOpenAPISpec("/samples/stargate.json");
      setTestResults((prev) => ({ ...prev, stargate: true }));
    } catch {
      setTestResults((prev) => ({ ...prev, stargate: false }));
    }
  };

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Box>
          <Text size="xl" fw={700} mb="md">
            OpenAPI Spec Format Test
          </Text>
          <Alert
            icon={<IconInfoCircle size={16} />}
            title="Test Information"
            color="blue"
          >
            This page tests whether the store can correctly parse OpenAPI
            specifications in both YAML and JSON formats.
          </Alert>
        </Box>

        <Group gap="md">
          <Button
            onClick={testYaml}
            loading={loading && testResults.yaml === null}
          >
            Test YAML Format (Local)
          </Button>
          <Button
            onClick={testJson}
            loading={loading && testResults.json === null}
          >
            Test JSON Format (Remote)
          </Button>
          <Button
            onClick={testStargate}
            loading={loading && testResults.stargate === null}
          >
            Test Stargate (allOf/oneOf)
          </Button>
        </Group>

        <Group gap="md">
          <Card withBorder p="md" style={{ flex: 1 }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>YAML Test</Text>
              {testResults.yaml === true && (
                <Badge color="green" leftSection={<IconCheck size={12} />}>
                  Success
                </Badge>
              )}
              {testResults.yaml === false && (
                <Badge color="red" leftSection={<IconX size={12} />}>
                  Failed
                </Badge>
              )}
              {testResults.yaml === null && loading && <Loader size="xs" />}
            </Group>
            <Code block>/samples/petstore.yaml</Code>
          </Card>

          <Card withBorder p="md" style={{ flex: 1 }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>JSON Test</Text>
              {testResults.json === true && (
                <Badge color="green" leftSection={<IconCheck size={12} />}>
                  Success
                </Badge>
              )}
              {testResults.json === false && (
                <Badge color="red" leftSection={<IconX size={12} />}>
                  Failed
                </Badge>
              )}
              {testResults.json === null && loading && <Loader size="xs" />}
            </Group>
            <Code block>https://petstore3.swagger.io/api/v3/openapi.json</Code>
          </Card>

          <Card withBorder p="md" style={{ flex: 1 }}>
            <Group justify="space-between" mb="sm">
              <Text fw={600}>Stargate Test (Compositions)</Text>
              {testResults.stargate === true && (
                <Badge color="green" leftSection={<IconCheck size={12} />}>
                  Success
                </Badge>
              )}
              {testResults.stargate === false && (
                <Badge color="red" leftSection={<IconX size={12} />}>
                  Failed
                </Badge>
              )}
              {testResults.stargate === null && loading && <Loader size="xs" />}
            </Group>
            <Code block>/samples/stargate.json</Code>
          </Card>
        </Group>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {spec && (
          <Card withBorder p="md">
            <Text fw={600} mb="sm">
              Loaded Spec Information
            </Text>
            <Stack gap="xs">
              <Group>
                <Text size="sm" c="dimmed" style={{ minWidth: 100 }}>
                  Title:
                </Text>
                <Text size="sm">{spec.info?.title || "N/A"}</Text>
              </Group>
              <Group>
                <Text size="sm" c="dimmed" style={{ minWidth: 100 }}>
                  Version:
                </Text>
                <Text size="sm">{spec.info?.version || "N/A"}</Text>
              </Group>
              <Group>
                <Text size="sm" c="dimmed" style={{ minWidth: 100 }}>
                  Description:
                </Text>
                <Text size="sm" lineClamp={2}>
                  {spec.info?.description || "N/A"}
                </Text>
              </Group>
              <Group>
                <Text size="sm" c="dimmed" style={{ minWidth: 100 }}>
                  Paths:
                </Text>
                <Text size="sm">
                  {spec.paths ? Object.keys(spec.paths).length : 0}
                </Text>
              </Group>
              <Group>
                <Text size="sm" c="dimmed" style={{ minWidth: 100 }}>
                  Tags:
                </Text>
                <Text size="sm">{spec.tags?.length || 0}</Text>
              </Group>
            </Stack>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
