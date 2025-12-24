"use client";

import { Box, Text, Stack, Code, Tabs, SegmentedControl } from "@mantine/core";
import { useState } from "react";
import { RequestBody, OpenAPISpec, Schema } from "@/types/openapi";
import { SchemaViewer } from "./SchemaViewer";
import { extractSchemaExample, formatJson } from "@/utils/openapi-helpers";
import CodeBox from "./CodeBox";

interface RequestBodySectionProps {
  requestBody: RequestBody;
  spec?: OpenAPISpec;
}

export function RequestBodySection({
  requestBody,
  spec,
}: RequestBodySectionProps) {
  if (!requestBody || !requestBody.content) {
    return null;
  }

  const contentTypes = Object.keys(requestBody.content);

  if (contentTypes.length === 0) {
    return null;
  }

  return (
    <Box>
      <Text size="sm" fw={600} mb="sm">
        Request Body
        {requestBody.required && (
          <Text component="span" c="red" ml={4}>
            *
          </Text>
        )}
      </Text>

      {requestBody.description && (
        <Text size="sm" c="dimmed" mb="md">
          {requestBody.description}
        </Text>
      )}

      {contentTypes.length === 1 ? (
        <SingleContentType
          contentType={contentTypes[0]}
          mediaType={requestBody.content[contentTypes[0]]}
          spec={spec}
        />
      ) : (
        <Tabs defaultValue={contentTypes[0]} variant="outline">
          <Tabs.List>
            {contentTypes.map((contentType) => (
              <Tabs.Tab key={contentType} value={contentType}>
                {contentType}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {contentTypes.map((contentType) => (
            <Tabs.Panel key={contentType} value={contentType} pt="md">
              <SingleContentType
                contentType={contentType}
                mediaType={requestBody.content[contentType]}
                spec={spec}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      )}
    </Box>
  );
}

interface SingleContentTypeProps {
  contentType: string;
  mediaType: {
    schema?: Schema;
    example?: unknown;
    examples?: Record<string, unknown>;
  };
  spec?: OpenAPISpec;
}

function SingleContentType({
  contentType,
  mediaType,
  spec,
}: SingleContentTypeProps) {
  const [view, setView] = useState<string>("schema");

  const hasSchema = !!mediaType.schema;
  const hasExamples =
    mediaType.example !== undefined ||
    (mediaType.examples && Object.keys(mediaType.examples).length > 0) ||
    (mediaType.schema && spec);

  return (
    <Stack gap="md">
      {contentType.length === 1 && <Code>{contentType}</Code>}

      {hasSchema && hasExamples && (
        <Box>
          <SegmentedControl
            value={view}
            onChange={setView}
            size="xs"
            data={[
              { label: "Schema", value: "schema" },
              { label: "Examples", value: "examples" },
            ]}
          />
        </Box>
      )}

      {view === "schema" && mediaType.schema && (
        <SchemaViewer schema={mediaType.schema} spec={spec} />
      )}

      {view === "examples" && (
        <>
          {mediaType.example !== undefined && (
            <CodeBox value={formatJson(mediaType.example)} />
          )}

          {!mediaType.example && mediaType.schema && spec && (
            <CodeBox
              value={formatJson(extractSchemaExample(mediaType.schema, spec))}
            />
          )}

          {mediaType.examples && Object.keys(mediaType.examples).length > 0 && (
            <Box>
              <Text size="xs" fw={600} mb="xs" c="dimmed">
                Examples
              </Text>
              <Stack gap="xs">
                {Object.entries(mediaType.examples).map(
                  ([exampleName, example]: [string, unknown]) => {
                    const exampleObj = example as {
                      summary?: string;
                      description?: string;
                      value?: unknown;
                    };
                    return (
                      <Box key={exampleName}>
                        <Text size="xs" fw={500} c="blue" mb={4}>
                          {exampleName}
                        </Text>
                        {exampleObj.summary && (
                          <Text size="xs" c="dimmed" mb={4}>
                            {exampleObj.summary}
                          </Text>
                        )}
                        {exampleObj.description && (
                          <Text size="xs" c="dimmed" mb={4}>
                            {exampleObj.description}
                          </Text>
                        )}
                        <CodeBox
                          value={formatJson(exampleObj.value || example)}
                        />
                      </Box>
                    );
                  },
                )}
              </Stack>
            </Box>
          )}
        </>
      )}
    </Stack>
  );
}
