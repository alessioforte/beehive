"use client";

import { Box, Text, Stack, Group, Badge, Collapse } from "@mantine/core";
import { useState } from "react";
import { Schema, OpenAPISpec } from "@/types/openapi";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { getSchemaType, resolveRef } from "@/utils/openapi-helpers";
// import CodeBox from "./CodeBox";

interface SchemaViewerProps {
  schema: Schema;
  spec?: OpenAPISpec;
  level?: number;
  name?: string;
}

export function SchemaViewer({
  schema,
  spec,
  level = 0,
  name,
}: SchemaViewerProps) {
  const [expanded, setExpanded] = useState(level < 2);

  if (!schema) {
    return (
      <Text size="sm" c="dimmed">
        No schema defined
      </Text>
    );
  }

  // Handle $ref
  if (schema.$ref && spec) {
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) {
      return (
        <SchemaViewer schema={resolved} spec={spec} level={level} name={name} />
      );
    }
  }

  const schemaType = getSchemaType(schema, spec);
  const indent = level * 5;

  // Render simple types
  if (schema.type && !schema.properties && schema.type !== "array") {
    console.log(schema);
    return (
      <Box pl={indent}>
        <Group gap="xs" wrap="nowrap">
          {name && (
            <Text size="sm" fw={500} c="blue">
              {name}:
              {schema.required?.includes(name || "") ? (
                <Text component="span" c="red" ml={4}>
                  *
                </Text>
              ) : (
                ""
              )}
            </Text>
          )}
          <Badge size="xs" variant="dot" color="orange" radius="xs">
            {schemaType}
          </Badge>
          {/*{schema.required?.includes(name || "") && (
            <Badge size="xs" color="red" variant="light" radius="xs">
              required
            </Badge>
          )}*/}
          {schema.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {schema.description}
            </Text>
          )}
        </Group>
        {schema.enum && (
          <Text size="xs" c="dimmed" pl="md">
            Enum: [{schema.enum.join(", ")}]
          </Text>
        )}
        {schema.default !== undefined && (
          <Text size="xs" c="dimmed" pl="md">
            Default: {JSON.stringify(schema.default)}
          </Text>
        )}
        {/*{schema.example !== undefined && (
          // <CodeBox value={JSON.stringify(schema.example, null, 2)} />
          <Text size="xs" c="dimmed" pl="md">
            {JSON.stringify(schema.example, null, 2)}
          </Text>
        )}*/}
      </Box>
    );
  }

  // Render array types
  if (schema.type === "array" && schema.items) {
    return (
      <Box pl={indent}>
        <Group gap="xs" wrap="nowrap">
          {name && (
            <Text size="sm" fw={500} c="blue">
              {name}:
            </Text>
          )}
          <Badge size="xs" variant="dot" color="violet" radius="xs">
            array
          </Badge>
          {schema.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {schema.description}
            </Text>
          )}
        </Group>
        <Box mt="xs">
          <Text size="xs" c="dimmed" mb="xs">
            Items:
          </Text>
          <SchemaViewer
            schema={schema.items as Schema}
            spec={spec}
            level={level + 1}
          />
        </Box>
      </Box>
    );
  }

  // Render object types with properties
  if (schema.properties || schema.type === "object") {
    return (
      <Box pl={indent}>
        <Box
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer" }}
        >
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" c="dimmed">
              {expanded ? (
                <IconChevronDown size={14} />
              ) : (
                <IconChevronRight size={14} />
              )}
            </Text>
            {name && (
              <Text size="sm" fw={500} c="blue">
                {name}:
              </Text>
            )}
            <Badge size="xs" variant="dot" color="teal" radius="xs">
              object
            </Badge>
            {schema.description && (
              <Text size="xs" c="dimmed" lineClamp={1}>
                {schema.description}
              </Text>
            )}
          </Group>
        </Box>
        <Collapse in={expanded}>
          <Stack gap="xs" mt="xs" pl="md">
            {schema.properties &&
              Object.entries(schema.properties).map(
                ([propName, propSchema]) => (
                  <Box key={propName}>
                    <SchemaViewer
                      schema={propSchema as Schema}
                      spec={spec}
                      level={level + 1}
                      name={propName}
                    />
                    {/*{schema.required?.includes(propName) && (
                      <Badge
                        size="xs"
                        color="red"
                        variant="light"
                        ml="xs"
                        radius="xs"
                      >
                        required
                      </Badge>
                    )}*/}
                  </Box>
                ),
              )}
            {!schema.properties && (
              <Text size="xs" c="dimmed">
                Additional properties allowed
              </Text>
            )}
          </Stack>
        </Collapse>
      </Box>
    );
  }

  // Fallback
  return (
    <Box pl={indent}>
      <Group gap="xs">
        {name && (
          <Text size="sm" fw={500} c="blue">
            {name}:
          </Text>
        )}
        <Badge size="xs" variant="dot" radius="xs">
          {schemaType}
        </Badge>
        {schema.description && (
          <Text size="xs" c="dimmed">
            {schema.description}
          </Text>
        )}
      </Group>
    </Box>
  );
}
