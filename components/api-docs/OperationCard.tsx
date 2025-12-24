"use client";

import {
  Card,
  Group,
  Text,
  Stack,
  Divider,
  Badge,
  Box,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { Operation, OpenAPISpec } from "@/types/openapi";
import { MethodBadge } from "./MethodBadge";
import { ParametersTable } from "./ParametersTable";
import { RequestBodySection } from "./RequestBodySection";
import { ResponsesSection } from "./ResponsesSection";
import styles from "./styles.module.css";

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
      m="sm"
      shadow="sm"
      withBorder
      radius="sm"
      id={pathId}
      style={{ scrollMarginTop: "80px" }}
      className={styles.operationCard}
    >
      <Stack gap="md">
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

        {operation.description &&
          operation.description !== operation.summary && (
            <>
              <Divider />
              <ReactMarkdown>{operation.description}</ReactMarkdown>
            </>
          )}

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

        {operation.parameters && operation.parameters.length > 0 && (
          <ParametersTable parameters={operation.parameters} spec={spec} />
        )}

        {operation.requestBody && (
          <RequestBodySection requestBody={operation.requestBody} spec={spec} />
        )}

        {operation.responses && (
          <ResponsesSection responses={operation.responses} spec={spec} />
        )}

        {operation.security && operation.security.length > 0 && (
          <Box>
            <Text size="sm" fw={600} mb="sm">
              Security
            </Text>

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
          </Box>
        )}
      </Stack>
    </Card>
  );
}
