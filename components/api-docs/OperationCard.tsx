"use client";

import {
  Card,
  Group,
  Text,
  Stack,
  Divider,
  Badge,
  Accordion,
  Box,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Operation, OpenAPISpec } from "@/types/openapi";
import { MethodBadge } from "./MethodBadge";
import { ParametersTable } from "./ParametersTable";
import { RequestBodySection } from "./RequestBodySection";
import { ResponsesSection } from "./ResponsesSection";

interface OperationCardProps {
  path: string;
  method: string;
  operation: Operation;
  spec?: OpenAPISpec;
}

export function OperationCard({
  path,
  method,
  operation,
  spec,
}: OperationCardProps) {
  const pathId = `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, "-");

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      id={pathId}
      style={{ scrollMarginTop: "80px" }}
    >
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <MethodBadge method={method} size="md" />
                <Text
                  size="md"
                  fw={600}
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    wordBreak: "break-all",
                  }}
                >
                  {path}
                </Text>
                <CopyButton value={path} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? "Copied" : "Copy path"} withArrow>
                      <ActionIcon
                        color={copied ? "teal" : "gray"}
                        variant="subtle"
                        onClick={copy}
                        size="sm"
                      >
                        {copied ? (
                          <IconCheck size={16} />
                        ) : (
                          <IconCopy size={16} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              {operation.summary && (
                <Text size="sm" c="dimmed" mt={4}>
                  {operation.summary}
                </Text>
              )}
            </Box>
          </Group>

          {operation.deprecated && (
            <Badge color="orange" variant="filled">
              Deprecated
            </Badge>
          )}
        </Group>

        {/* Description */}
        {operation.description &&
          operation.description !== operation.summary && (
            <>
              <Divider />
              <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
                {operation.description}
              </Text>
            </>
          )}

        {/* Operation ID */}
        {operation.operationId && (
          <Box>
            <Text size="xs" c="dimmed" fw={500}>
              Operation ID:{" "}
              <Text component="span" ff="monospace">
                {operation.operationId}
              </Text>
            </Text>
          </Box>
        )}

        <Divider />

        {/* Details Accordion */}
        <Accordion
          variant="separated"
          multiple
          defaultValue={["parameters", "responses"]}
        >
          {/* Parameters */}
          {operation.parameters && operation.parameters.length > 0 && (
            <Accordion.Item value="parameters">
              <Accordion.Control>
                <Group gap="xs">
                  <Text fw={600}>Parameters</Text>
                  <Badge size="sm" variant="light">
                    {operation.parameters.length}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <ParametersTable
                  parameters={operation.parameters}
                  spec={spec}
                />
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {/* Request Body */}
          {operation.requestBody && (
            <Accordion.Item value="request-body">
              <Accordion.Control>
                <Text fw={600}>Request Body</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <RequestBodySection
                  requestBody={operation.requestBody}
                  spec={spec}
                />
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {/* Responses */}
          {operation.responses && (
            <Accordion.Item value="responses">
              <Accordion.Control>
                <Group gap="xs">
                  <Text fw={600}>Responses</Text>
                  <Badge size="sm" variant="light">
                    {Object.keys(operation.responses).length}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <ResponsesSection responses={operation.responses} spec={spec} />
              </Accordion.Panel>
            </Accordion.Item>
          )}

          {/* Security */}
          {operation.security && operation.security.length > 0 && (
            <Accordion.Item value="security">
              <Accordion.Control>
                <Text fw={600}>Security</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="xs">
                  {operation.security.map((secReq, index) => (
                    <Box key={index}>
                      {Object.entries(secReq).map(([name, scopes]) => (
                        <Group key={name} gap="xs">
                          <Badge variant="light" color="indigo">
                            {name}
                          </Badge>
                          {scopes.length > 0 && (
                            <Text size="sm" c="dimmed">
                              Scopes: {scopes.join(", ")}
                            </Text>
                          )}
                        </Group>
                      ))}
                    </Box>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          )}
        </Accordion>
      </Stack>
    </Card>
  );
}
