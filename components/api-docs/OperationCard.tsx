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
  Button,
  Collapse,
} from "@mantine/core";
import ReactMarkdown from "react-markdown";
import {
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { memo } from "react";
import { Operation, OpenAPISpec } from "@/types/openapi";
import { getOperationPathId } from "@/utils/openapi-helpers";
import { MethodBadge } from "./MethodBadge";
import { ParametersTable } from "./ParametersTable";
import { RequestBodySection } from "./RequestBodySection";
import { ResponsesSection } from "./ResponsesSection";
import styles from "./styles.module.css";

interface OperationCardProps {
  path: string;
  method: string;
  operation: Operation;
  opened: boolean;
  onToggle: (pathId: string) => void;
  spec?: OpenAPISpec;
  onTryIt?: (path: string, method: string, operation: Operation) => void;
}

export const OperationCard = memo(function OperationCard({
  path,
  method,
  operation,
  opened,
  onToggle,
  spec,
  onTryIt,
}: OperationCardProps) {
  const pathId = getOperationPathId(path, method);
  const detailsId = `${pathId}-details`;

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
      <>
        <Group justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Group gap="xs" wrap="nowrap">
                <MethodBadge method={method} size="md" />
                <Text
                  size="md"
                  fw={600}
                  style={{
                    fontFamily: "var(--app-font-mono)",
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

          <Group gap="sm">
            {operation.deprecated && (
              <Badge color="orange" variant="filled">
                Deprecated
              </Badge>
            )}
            {onTryIt && (
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPlayerPlay size={14} />}
                onClick={() => onTryIt(path, method, operation)}
              >
                Try It
              </Button>
            )}
            <Tooltip label={opened ? "Collapse operation" : "Expand operation"}>
              <ActionIcon
                variant="subtle"
                size="lg"
                aria-expanded={opened}
                aria-controls={detailsId}
                aria-label={
                  opened
                    ? "Collapse operation details"
                    : "Expand operation details"
                }
                onClick={() => onToggle(pathId)}
              >
                <IconChevronDown
                  size={18}
                  className={styles.operationChevron}
                  data-opened={opened || undefined}
                />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <Collapse expanded={opened} keepMounted={false}>
          <Stack gap="md" mt="md" id={detailsId}>
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
              <RequestBodySection
                requestBody={operation.requestBody}
                spec={spec}
              />
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
        </Collapse>
      </>
    </Card>
  );
});
