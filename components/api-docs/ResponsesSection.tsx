import { Box, Text, Stack, Accordion, Group, Code } from "@mantine/core";
import {
  Responses,
  OpenAPISpec,
  Response as OpenAPIResponse,
  Header,
} from "@/types/openapi";
import { StatusCodeBadge } from "./StatusCodeBadge";
import { SchemaViewer } from "./SchemaViewer";

interface ResponsesSectionProps {
  responses: Responses;
  spec?: OpenAPISpec;
}

export function ResponsesSection({ responses, spec }: ResponsesSectionProps) {
  if (!responses || Object.keys(responses).length === 0) {
    return null;
  }

  return (
    <Box>
      <Text size="sm" fw={600} mb="sm">
        Responses
      </Text>
      <Accordion variant="separated" radius="sm">
        {Object.entries(responses).map(
          ([statusCode, response]: [string, OpenAPIResponse]) => {
            const statusDescription = response.description || "No description";

            return (
              <Accordion.Item key={statusCode} value={statusCode}>
                <Accordion.Control>
                  <Group gap="md">
                    <StatusCodeBadge statusCode={statusCode} />
                    <Text size="sm" c="dimmed">
                      {statusDescription}
                    </Text>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="md">
                    {response.content &&
                      Object.keys(response.content).length > 0 && (
                        <Box>
                          <Stack gap="md">
                            {Object.entries(response.content).map(
                              ([contentType, mediaType]) => (
                                <Box key={contentType}>
                                  <Code mb="xs">{contentType}</Code>
                                  {mediaType.schema && (
                                    <Box mt="lg">
                                      <Text
                                        size="xs"
                                        fw={600}
                                        mb="sm"
                                        c="dimmed"
                                      >
                                        Schema
                                      </Text>
                                      <SchemaViewer
                                        schema={mediaType.schema}
                                        spec={spec}
                                      />
                                    </Box>
                                  )}
                                  {mediaType.example !== undefined && (
                                    <Box mt="sm">
                                      <Text
                                        size="xs"
                                        fw={600}
                                        mb="xs"
                                        c="dimmed"
                                      >
                                        Example Response
                                      </Text>
                                      <Code block>
                                        {typeof mediaType.example === "string"
                                          ? mediaType.example
                                          : JSON.stringify(
                                              mediaType.example,
                                              null,
                                              2,
                                            )}
                                      </Code>
                                    </Box>
                                  )}
                                  {mediaType.examples &&
                                    Object.keys(mediaType.examples).length >
                                      0 && (
                                      <Box mt="sm">
                                        <Text
                                          size="xs"
                                          fw={600}
                                          mb="xs"
                                          c="dimmed"
                                        >
                                          Examples
                                        </Text>
                                        <Stack gap="xs">
                                          {Object.entries(
                                            mediaType.examples,
                                          ).map(([exampleName, example]) => (
                                            <Box key={exampleName}>
                                              <Text
                                                size="xs"
                                                fw={500}
                                                c="blue"
                                                mb={4}
                                              >
                                                {exampleName}
                                              </Text>
                                              <Code block>
                                                {typeof example === "string"
                                                  ? example
                                                  : JSON.stringify(
                                                      example,
                                                      null,
                                                      2,
                                                    )}
                                              </Code>
                                            </Box>
                                          ))}
                                        </Stack>
                                      </Box>
                                    )}
                                </Box>
                              ),
                            )}
                          </Stack>
                        </Box>
                      )}

                    {response.headers &&
                      Object.keys(response.headers).length > 0 && (
                        <Box>
                          <Text size="sm" fw={500} mb="xs">
                            Response Headers
                          </Text>
                          <Stack gap="xs">
                            {Object.entries(response.headers).map(
                              ([headerName, header]: [
                                string,
                                Header | unknown,
                              ]) => {
                                const typedHeader = header as Header;
                                return (
                                  <Group key={headerName} gap="xs">
                                    <Code>{headerName}</Code>
                                    {typedHeader.description && (
                                      <Text size="xs" c="dimmed">
                                        {typedHeader.description}
                                      </Text>
                                    )}
                                  </Group>
                                );
                              },
                            )}
                          </Stack>
                        </Box>
                      )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            );
          },
        )}
      </Accordion>
    </Box>
  );
}
