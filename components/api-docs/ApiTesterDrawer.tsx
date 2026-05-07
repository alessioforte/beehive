"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Drawer,
  Stack,
  Group,
  Text,
  Select,
  TextInput,
  Button,
  Accordion,
  Box,
  Badge,
  Divider,
  Loader,
  ScrollArea,
} from "@mantine/core";
import { IconSend, IconClock } from "@tabler/icons-react";
import { ApiTesterProps, ResponseState } from "@/types/api-tester";
import { MethodBadge } from "./MethodBadge";
import { StatusCodeBadge } from "./StatusCodeBadge";
import CodeBox from "./CodeBox";
import {
  buildRequestUrl,
  executeRequest,
  extractPathParams,
} from "@/utils/request-executor";
import { extractSchemaExample, formatJson } from "@/utils/openapi-helpers";

export function ApiTesterDrawer({
  opened,
  onClose,
  path,
  method,
  operation,
  spec,
  servers,
}: ApiTesterProps) {
  const [selectedServer, setSelectedServer] = useState<string>(
    servers?.[0]?.url || "",
  );
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [headerParams, setHeaderParams] = useState<Record<string, string>>({});
  const [authHeader, setAuthHeader] = useState("");
  const [requestBody, setRequestBody] = useState("");
  const [response, setResponse] = useState<ResponseState | null>(null);
  const [loading, setLoading] = useState(false);

  const pathParamNames = useMemo(() => extractPathParams(path), [path]);

  const queryParameters = useMemo(
    () => operation.parameters?.filter((p) => p.in === "query") || [],
    [operation.parameters],
  );

  const headerParameters = useMemo(
    () => operation.parameters?.filter((p) => p.in === "header") || [],
    [operation.parameters],
  );

  const initialRequestBody = useMemo(() => {
    if (!operation.requestBody?.content) return "";
    const jsonContent = operation.requestBody.content["application/json"];
    if (!jsonContent?.schema) return "";

    if (jsonContent.example) {
      return formatJson(jsonContent.example);
    }

    const example = extractSchemaExample(jsonContent.schema, spec);
    return formatJson(example);
  }, [operation.requestBody, spec]);

  const handleOpen = useCallback(() => {
    setRequestBody(initialRequestBody);
    setPathParams({});
    setQueryParams({});
    setHeaderParams({});
    setAuthHeader("");
    setResponse(null);
    setSelectedServer(servers?.[0]?.url || "");
  }, [initialRequestBody, servers]);

  useMemo(() => {
    if (opened) {
      handleOpen();
    }
  }, [opened, handleOpen]);

  const serverOptions = useMemo(
    () =>
      servers?.map((server) => ({
        value: server.url,
        label: server.description
          ? `${server.description} (${server.url})`
          : server.url,
      })) || [],
    [servers],
  );

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const url = buildRequestUrl(
        selectedServer,
        path,
        pathParams,
        queryParams,
      );

      const headers: Record<string, string> = {
        ...headerParams,
      };

      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      if (
        requestBody &&
        ["post", "put", "patch"].includes(method.toLowerCase())
      ) {
        headers["Content-Type"] = "application/json";
      }

      const result = await executeRequest({
        url,
        method: method.toUpperCase(),
        headers,
        body: requestBody || undefined,
      });

      setResponse(result);
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Error",
        headers: {},
        body: JSON.stringify(
          {
            error:
              error instanceof Error ? error.message : "Unknown error occurred",
          },
          null,
          2,
        ),
        timing: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePathParam = (key: string, value: string) => {
    setPathParams((prev) => ({ ...prev, [key]: value }));
  };

  const updateQueryParam = (key: string, value: string) => {
    setQueryParams((prev) => ({ ...prev, [key]: value }));
  };

  const updateHeaderParam = (key: string, value: string) => {
    setHeaderParams((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      title={
        <Group gap="sm">
          <MethodBadge method={method} size="md" />
          <Text
            size="sm"
            fw={600}
            style={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {path}
          </Text>
        </Group>
      }
      styles={{
        body: { padding: 0, height: "calc(100% - 60px)" },
      }}
    >
      <ScrollArea h="100%" p="md">
        <Stack gap="md">
          {serverOptions.length > 0 && (
            <Select
              label="Server"
              placeholder="Select a server"
              data={serverOptions}
              value={selectedServer}
              onChange={(value) => setSelectedServer(value || "")}
            />
          )}

          {pathParamNames.length > 0 && (
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Path Parameters
              </Text>
              <Stack gap="xs">
                {pathParamNames.map((param) => {
                  const paramDef = operation.parameters?.find(
                    (p) => p.in === "path" && p.name === param,
                  );
                  return (
                    <TextInput
                      key={param}
                      label={param}
                      description={paramDef?.description}
                      placeholder={`Enter ${param}`}
                      required={paramDef?.required}
                      value={pathParams[param] || ""}
                      onChange={(e) => updatePathParam(param, e.target.value)}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}

          {queryParameters.length > 0 && (
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Query Parameters
              </Text>
              <Stack gap="xs">
                {queryParameters.map((param) => (
                  <TextInput
                    key={param.name}
                    label={param.name}
                    description={param.description}
                    placeholder={`Enter ${param.name}`}
                    required={param.required}
                    value={queryParams[param.name] || ""}
                    onChange={(e) =>
                      updateQueryParam(param.name, e.target.value)
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}

          {headerParameters.length > 0 && (
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Header Parameters
              </Text>
              <Stack gap="xs">
                {headerParameters.map((param) => (
                  <TextInput
                    key={param.name}
                    label={param.name}
                    description={param.description}
                    placeholder={`Enter ${param.name}`}
                    required={param.required}
                    value={headerParams[param.name] || ""}
                    onChange={(e) =>
                      updateHeaderParam(param.name, e.target.value)
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}

          <TextInput
            label="Authorization"
            description="Authorization header value (e.g., Bearer token)"
            placeholder="Bearer your-token-here"
            value={authHeader}
            onChange={(e) => setAuthHeader(e.target.value)}
          />

          {operation.requestBody && (
            <Box>
              <Text size="sm" fw={600} mb="xs">
                Request Body
              </Text>
              <Box
                style={{
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: "var(--mantine-radius-sm)",
                  overflow: "hidden",
                }}
              >
                <CodeBox
                  value={requestBody}
                  language="json"
                  readOnly={false}
                  height="200px"
                  onChange={setRequestBody}
                />
              </Box>
            </Box>
          )}

          <Button
            leftSection={
              loading ? <Loader size={16} /> : <IconSend size={16} />
            }
            onClick={handleSendRequest}
            disabled={loading}
            fullWidth
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>

          {response && (
            <>
              <Divider />

              <Box>
                <Text size="sm" fw={600} mb="sm">
                  Response
                </Text>

                <Group gap="sm" mb="md">
                  <StatusCodeBadge statusCode={String(response.status)} />
                  <Text size="sm" c="dimmed">
                    {response.statusText}
                  </Text>
                  <Badge
                    variant="light"
                    color="gray"
                    leftSection={<IconClock size={12} />}
                  >
                    {response.timing}ms
                  </Badge>
                </Group>

                <Accordion variant="separated">
                  <Accordion.Item value="headers">
                    <Accordion.Control>
                      <Text size="sm" fw={500}>
                        Response Headers
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="xs">
                        {Object.entries(response.headers).map(
                          ([key, value]) => (
                            <Group key={key} gap="xs">
                              <Text size="xs" fw={600} c="dimmed">
                                {key}:
                              </Text>
                              <Text
                                size="xs"
                                style={{
                                  fontFamily: "var(--font-geist-mono)",
                                  wordBreak: "break-all",
                                }}
                              >
                                {value}
                              </Text>
                            </Group>
                          ),
                        )}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>

                <Box mt="md">
                  <Text size="sm" fw={500} mb="xs">
                    Response Body
                  </Text>
                  <Box
                    style={{
                      border: "1px solid var(--mantine-color-default-border)",
                      borderRadius: "var(--mantine-radius-sm)",
                      overflow: "hidden",
                    }}
                  >
                    <CodeBox
                      value={response.body}
                      language="json"
                      readOnly={true}
                      height="300px"
                    />
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Stack>
      </ScrollArea>
    </Drawer>
  );
}
