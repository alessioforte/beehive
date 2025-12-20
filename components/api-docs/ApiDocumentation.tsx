"use client";

import {
  Box,
  Container,
  Stack,
  LoadingOverlay,
  Alert,
  Button,
  Tabs,
  Text,
  Paper,
  ScrollArea,
} from "@mantine/core";
import { IconAlertCircle, IconBook, IconSchema } from "@tabler/icons-react";
import { OpenAPISpec, Operation } from "@/types/openapi";
import { ApiHeader } from "./ApiHeader";
import { ApiNavigation } from "./ApiNavigation";
import { OperationCard } from "./OperationCard";
import { groupByTags } from "@/utils/openapi-helpers";
import CodeBox from "./CodeBox";
import { useMemo } from "react";
import styles from "./styles.module.css";

interface ApiDocumentationProps {
  spec: OpenAPISpec | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ApiDocumentation({
  spec,
  loading = false,
  error = null,
  onRetry,
}: ApiDocumentationProps) {
  const groupedEndpoints = useMemo(() => {
    if (!spec?.paths) return new Map();
    return groupByTags(spec.paths as Record<string, Record<string, unknown>>);
  }, [spec]);

  // Loading state
  if (loading) {
    return (
      <Box pos="relative" mih="100vh">
        <LoadingOverlay
          visible={true}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
          loaderProps={{ color: "blue", type: "bars" }}
        />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Error Loading API Documentation"
          color="red"
          variant="filled"
        >
          <Stack gap="md">
            <Text>{error}</Text>
            {onRetry && (
              <Button variant="white" color="red" onClick={onRetry}>
                Retry
              </Button>
            )}
          </Stack>
        </Alert>
      </Container>
    );
  }

  // No spec state
  if (!spec) {
    return (
      <Container size="md" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="No API Specification"
          color="yellow"
        >
          No OpenAPI specification available to display.
        </Alert>
      </Container>
    );
  }

  return (
    <Box className={styles.docsContainer}>
      <Box
        className={styles.apiNavigation}
        display={{ base: "none", md: "flex" }}
      >
        <ApiNavigation spec={spec} />
      </Box>

      <ScrollArea
        style={{
          flex: 1,
          overflow: "auto",
          height: "100%",
        }}
      >
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <ApiHeader info={spec.info} servers={spec.servers} />

            <Tabs defaultValue="endpoints" variant="outline">
              <Tabs.List>
                <Tabs.Tab
                  value="endpoints"
                  leftSection={<IconBook size={16} />}
                >
                  Endpoints
                </Tabs.Tab>
                <Tabs.Tab
                  value="schemas"
                  leftSection={<IconSchema size={16} />}
                >
                  Schemas
                </Tabs.Tab>
              </Tabs.List>

              {/* Endpoints Tab */}
              <Tabs.Panel value="endpoints" pt="xl">
                <Stack gap="xl">
                  {Array.from(groupedEndpoints.entries()).map(
                    ([tag, endpoints]) => {
                      const tagInfo = spec.tags?.find((t) => t.name === tag);

                      return (
                        <Box key={tag}>
                          <Paper p="md" mb="md" withBorder>
                            <Text size="xl" fw={700} mb="xs">
                              {tag}
                            </Text>
                            {tagInfo?.description && (
                              <Text size="sm" c="dimmed">
                                {tagInfo.description}
                              </Text>
                            )}
                          </Paper>

                          <Stack gap="md">
                            {endpoints.map(
                              (
                                endpoint: {
                                  path: string;
                                  method: string;
                                  operation: Operation;
                                },
                                index: number,
                              ) => (
                                <OperationCard
                                  key={`${endpoint.path}-${endpoint.method}-${index}`}
                                  path={endpoint.path}
                                  method={endpoint.method}
                                  operation={endpoint.operation}
                                  spec={spec}
                                />
                              ),
                            )}
                          </Stack>
                        </Box>
                      );
                    },
                  )}

                  {groupedEndpoints.size === 0 && (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue">
                      No endpoints defined in this API specification.
                    </Alert>
                  )}
                </Stack>
              </Tabs.Panel>

              {/* Schemas Tab */}
              <Tabs.Panel value="schemas" pt="xl">
                <Stack gap="md">
                  {spec.components?.schemas ? (
                    Object.entries(spec.components.schemas).map(
                      ([schemaName, schema]) => (
                        <Paper
                          key={schemaName}
                          shadow="sm"
                          p="lg"
                          radius="md"
                          withBorder
                        >
                          <Text size="lg" fw={600} mb="md" c="blue">
                            {schemaName}
                          </Text>
                          {schema.description && (
                            <Text size="sm" c="dimmed" mb="md">
                              {schema.description}
                            </Text>
                          )}
                          <Box>
                            <Text size="xs" fw={600} c="dimmed" mb="sm">
                              Schema Definition
                            </Text>
                            <Box component="pre" style={{ overflow: "auto" }}>
                              <CodeBox
                                value={JSON.stringify(schema, null, 2)}
                              />
                            </Box>
                          </Box>
                        </Paper>
                      ),
                    )
                  ) : (
                    <Alert icon={<IconAlertCircle size={16} />} color="blue">
                      No schemas defined in this API specification.
                    </Alert>
                  )}
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Container>
      </ScrollArea>
    </Box>
  );
}
