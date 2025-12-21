"use client";

import { Box, Text, Stack, Group, Collapse, Center } from "@mantine/core";
import { useState } from "react";
import { Schema, OpenAPISpec } from "@/types/openapi";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import {
  getSchemaType,
  resolveRef,
  isPrimitiveType,
} from "@/utils/openapi-helpers";
import TypeBadge from "./TypeBadge";

interface SchemaViewerProps {
  schema: Schema;
  spec?: OpenAPISpec;
  level?: number;
  name?: string;
  required?: boolean;
}

interface FieldHeaderProps {
  name?: string;
  type: string;
  description?: string;
  required?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  schemaEnum?: unknown[];
  schemaDefault?: unknown;
}

const FieldHeader = ({
  name,
  type,
  description,
  required,
  expandable = false,
  expanded = false,
  onToggle,
  schemaEnum,
  schemaDefault,
}: FieldHeaderProps) => {
  const content = (
    <Group gap={5} wrap="nowrap">
      <Center w={14} h={14}>
        {expandable && (
          <>
            {expanded ? (
              <IconChevronDown size={14} />
            ) : (
              <IconChevronRight size={14} />
            )}
          </>
        )}
      </Center>
      {name && (
        <Text size="sm" fw={500} c="blue">
          {name}
          {required && (
            <Text component="span" c="red">
              *
            </Text>
          )}
          :
        </Text>
      )}
      <TypeBadge type={type} />
      {description && (
        <Text size="xs" c="dimmed" lineClamp={1}>
          {description}
        </Text>
      )}

      {schemaEnum && (
        <Text size="xs" c="dimmed" pl="md">
          Enum: [{schemaEnum.join(", ")}]
        </Text>
      )}
      {schemaDefault !== undefined && (
        <Text size="xs" c="dimmed" pl="md">
          Default: {JSON.stringify(schemaDefault)}
        </Text>
      )}
    </Group>
  );

  if (expandable && onToggle) {
    return (
      <Box onClick={onToggle} style={{ cursor: "pointer" }}>
        {content}
      </Box>
    );
  }

  return content;
};

export function SchemaViewer({
  schema,
  spec,
  level = 0,
  name,
  required = false,
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
        <SchemaViewer
          schema={resolved}
          spec={spec}
          level={level}
          name={name}
          required={required}
        />
      );
    }
  }

  const schemaType = getSchemaType(schema, spec);
  const indent = level * 5;

  // Render array types
  if (schema.type === "array" && schema.items) {
    return (
      <FieldArrayViewer
        schema={schema}
        spec={spec}
        level={level}
        name={name}
        required={required}
      />
    );
  }

  // Render object types with properties
  if (schema.properties || schema.type === "object") {
    return (
      <Box pl={indent}>
        <FieldHeader
          name={name}
          type={schema.type || "object"}
          description={schema.description}
          required={required}
          expandable={true}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
        <Collapse in={expanded}>
          <Stack gap="xs" mt="xs" pl="md">
            {schema.properties &&
              Object.entries(schema.properties).map(
                ([propName, propSchema]) => {
                  const isRequired =
                    schema.required?.includes(propName) || false;
                  return (
                    <SchemaViewer
                      key={propName}
                      schema={propSchema as Schema}
                      spec={spec}
                      level={level + 1}
                      name={propName}
                      required={isRequired}
                    />
                  );
                },
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
      <FieldHeader
        name={name}
        type={schemaType}
        required={required}
        description={schema.description}
        schemaEnum={schema.enum}
        schemaDefault={schema.default}
      />
    </Box>
  );
}

const FieldArrayViewer = ({
  schema,
  spec,
  level = 0,
  name,
  required = false,
}: SchemaViewerProps) => {
  const indent = level * 5;
  const [expanded, setExpanded] = useState(false);

  let itemsSchema = schema.items as Schema;
  if (itemsSchema.$ref && spec) {
    itemsSchema = resolveRef(itemsSchema.$ref, spec) as Schema;
  }

  return (
    <Box pl={indent}>
      <Group gap={0} wrap="nowrap">
        <FieldHeader
          name={name}
          type="array"
          description={schema.description}
          required={required}
          expandable={!isPrimitiveType(itemsSchema.type)}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
        <TypeBadge type={getSchemaType(itemsSchema, spec)} />
      </Group>
      {!isPrimitiveType(itemsSchema.type) && (
        <Collapse in={expanded}>
          <Stack gap="xs" mt="xs" pl="md">
            {itemsSchema.properties &&
              Object.entries(itemsSchema.properties).map(
                ([propName, propSchema]) => {
                  const isRequired =
                    schema.required?.includes(propName) || false;
                  return (
                    <SchemaViewer
                      key={propName}
                      schema={propSchema as Schema}
                      spec={spec}
                      level={level + 1}
                      name={propName}
                      required={isRequired}
                    />
                  );
                },
              )}
            {!itemsSchema.properties && (
              <Text size="xs" c="dimmed">
                Additional properties allowed
              </Text>
            )}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
};
