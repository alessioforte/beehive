import {
  Box,
  Card,
  Container,
  Stack,
  LoadingOverlay,
  Alert,
  Button,
  Tabs,
  Text,
  ScrollArea,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBook,
  IconSchema,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { OpenAPISpec, Operation } from "@/types/openapi";
import { ApiHeader } from "./ApiHeader";
import { ApiNavigation } from "./ApiNavigation";
import { OperationCard } from "./OperationCard";
import { ApiTesterDrawer } from "./ApiTesterDrawer";
import {
  detectOpenAPISpecSize,
  getOperationPathId,
  groupByTags,
} from "@/utils/openapi-helpers";
import { useMemo, useState, useCallback } from "react";
import styles from "./styles.module.css";
import { SchemaViewer } from "./SchemaViewer";

interface ApiDocumentationProps {
  spec: OpenAPISpec | null;
  specSourceSize?: number;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

interface OperationExpansionState {
  spec: OpenAPISpec | null;
  overrides: Map<string, boolean>;
}

const EMPTY_OPERATION_OVERRIDES = new Map<string, boolean>();

export function ApiDocumentation({
  spec,
  specSourceSize = 0,
  loading = false,
  error = null,
  onRetry,
}: ApiDocumentationProps) {
  const groupedEndpoints = useMemo(() => {
    if (!spec?.paths) return new Map();
    return groupByTags(spec.paths as Record<string, Record<string, unknown>>);
  }, [spec]);

  const deprecatedCount = useMemo(() => {
    if (!spec?.paths) return 0;
    let count = 0;
    Object.values(spec.paths).forEach((pathItem) => {
      ["get", "post", "put", "delete", "patch"].forEach((method) => {
        const operation = pathItem[method as keyof typeof pathItem] as
          Operation | undefined;
        if (operation?.deprecated) {
          count++;
        }
      });
    });
    return count;
  }, [spec]);

  const specSize = useMemo(
    () => (spec ? detectOpenAPISpecSize(spec, specSourceSize) : null),
    [spec, specSourceSize],
  );
  const defaultOperationOpened = !specSize?.isLarge;

  const [drawerOpened, setDrawerOpened] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>("endpoints");
  const [operationExpansion, setOperationExpansion] =
    useState<OperationExpansionState>({
      spec: null,
      overrides: new Map(),
    });
  const [selectedEndpoint, setSelectedEndpoint] = useState<{
    path: string;
    method: string;
    operation: Operation;
  } | null>(null);

  const handleTryIt = useCallback(
    (path: string, method: string, operation: Operation) => {
      setSelectedEndpoint({ path, method, operation });
      setDrawerOpened(true);
    },
    [],
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpened(false);
  }, []);

  const handleOperationToggle = useCallback(
    (pathId: string) => {
      setOperationExpansion((current) => {
        const overrides =
          current.spec === spec ? current.overrides : EMPTY_OPERATION_OVERRIDES;
        const currentlyOpened = overrides.get(pathId) ?? defaultOperationOpened;
        const nextOverrides = new Map(overrides);
        nextOverrides.set(pathId, !currentlyOpened);

        return { spec, overrides: nextOverrides };
      });
    },
    [defaultOperationOpened, spec],
  );

  const handleNavigate = useCallback(
    (pathId: string) => {
      setActiveTab("endpoints");
      setOperationExpansion((current) => {
        const overrides =
          current.spec === spec ? current.overrides : EMPTY_OPERATION_OVERRIDES;

        if ((overrides.get(pathId) ?? defaultOperationOpened) === true) {
          return current;
        }

        const nextOverrides = new Map(overrides);
        nextOverrides.set(pathId, true);
        return { spec, overrides: nextOverrides };
      });
    },
    [defaultOperationOpened, spec],
  );

  const operationOverrides =
    operationExpansion.spec === spec
      ? operationExpansion.overrides
      : EMPTY_OPERATION_OVERRIDES;

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
        <ApiNavigation spec={spec} onNavigate={handleNavigate} />
      </Box>

      <ScrollArea
        viewportProps={{ id: "api-content-scroll-container" }}
        style={{ flex: 1, overflow: "auto", height: "100%" }}
      >
        <Container size="xl" p={0}>
          <Stack gap="xl">
            <ApiHeader info={spec.info} servers={spec.servers} />

            <Tabs
              value={activeTab}
              onChange={setActiveTab}
              variant="default"
              keepMounted={false}
            >
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
                  {specSize?.isLarge && (
                    <Alert
                      icon={<IconAlertTriangle size={16} />}
                      color="blue"
                      title="Large specification mode"
                    >
                      <Text size="sm">
                        Detected {specSize.operationCount} operations and{" "}
                        {specSize.schemaCount} schemas. Operation details start
                        collapsed and open on demand.
                      </Text>
                    </Alert>
                  )}

                  {deprecatedCount > 0 && (
                    <Alert
                      icon={<IconAlertTriangle size={16} />}
                      color="yellow"
                      title="Deprecated Endpoints"
                    >
                      <Text size="sm">
                        This API has {deprecatedCount} deprecated endpoint
                        {deprecatedCount !== 1 ? "s" : ""}. Consider migrating
                        to newer alternatives.
                      </Text>
                    </Alert>
                  )}

                  {Array.from(groupedEndpoints.entries()).map(
                    ([tag, endpoints]) => {
                      const tagInfo = spec.tags?.find((t) => t.name === tag);

                      return (
                        <Box key={tag}>
                          <Box p="md" mb="md">
                            <Text size="xl" fw={700} mb="xs">
                              {tag}
                            </Text>
                            {tagInfo?.description && (
                              <Text size="sm" c="dimmed">
                                {tagInfo.description}
                              </Text>
                            )}
                          </Box>

                          <Stack gap="xl">
                            {endpoints.map(
                              (
                                endpoint: {
                                  path: string;
                                  method: string;
                                  operation: Operation;
                                },
                                index: number,
                              ) => {
                                const pathId = getOperationPathId(
                                  endpoint.path,
                                  endpoint.method,
                                );

                                return (
                                  <Box
                                    key={`${endpoint.path}-${endpoint.method}-${index}`}
                                    opacity={
                                      endpoint.operation.deprecated ? 0.7 : 1
                                    }
                                  >
                                    <OperationCard
                                      path={endpoint.path}
                                      method={endpoint.method}
                                      operation={endpoint.operation}
                                      opened={
                                        operationOverrides.get(pathId) ??
                                        defaultOperationOpened
                                      }
                                      onToggle={handleOperationToggle}
                                      spec={spec}
                                      onTryIt={handleTryIt}
                                    />
                                  </Box>
                                );
                              },
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
                        <Card
                          m="sm"
                          shadow="sm"
                          withBorder
                          radius="sm"
                          key={schemaName}
                          className={styles.schemaCard}
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
                            <SchemaViewer schema={schema} spec={spec} />
                            {/*<Text size="xs" fw={600} c="dimmed" mb="sm">
                              Schema Definition
                            </Text>
                            <Box component="pre" style={{ overflow: "auto" }}>
                              <CodeBox
                                value={JSON.stringify(schema, null, 2)}
                              />
                            </Box>*/}
                          </Box>
                        </Card>
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

      {drawerOpened &&
        selectedEndpoint &&
        spec.servers &&
        spec.servers.length > 0 && (
          <ApiTesterDrawer
            opened={drawerOpened}
            onClose={handleCloseDrawer}
            path={selectedEndpoint.path}
            method={selectedEndpoint.method}
            operation={selectedEndpoint.operation}
            spec={spec}
            servers={spec.servers}
          />
        )}
    </Box>
  );
}
