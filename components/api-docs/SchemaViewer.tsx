"use client";

import {
  Box,
  Divider,
  Text,
  Stack,
  Group,
  Collapse,
  Center,
  Badge,
} from "@mantine/core";
import { useState } from "react";
import { Schema, OpenAPISpec } from "@/types/openapi";
import {
  IconChevronDown,
  IconChevronRight,
  IconArrowIteration,
} from "@tabler/icons-react";
import {
  getSchemaType,
  resolveRef,
  mergeAllOfSchemas,
  isPrimitiveType,
} from "@/utils/openapi-helpers";
import TypeBadge from "./TypeBadge";

const INDENT_SIZE = 10;

interface SchemaViewerProps {
  schema: Schema;
  spec?: OpenAPISpec;
  level?: number;
  name?: string;
  required?: boolean;
  visitedRefs?: Set<string>;
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

/**
 * Small helper that renders a "circular reference" indicator instead of
 * recursing infinitely when we detect a $ref we have already visited in
 * the current render branch.
 */
const CircularRefBadge = ({
  refPath,
  name,
  indent = 0,
}: {
  refPath: string;
  name?: string;
  indent?: number;
}) => {
  const refName = refPath.split("/").pop() || refPath;
  return (
    <Box pl={indent}>
      <Group gap={5} wrap="nowrap">
        <Center w={14} h={14} />
        {name && (
          <Text size="sm" fw={500} c="blue">
            {name}:
          </Text>
        )}
        <Badge
          size="sm"
          variant="light"
          color="orange"
          leftSection={<IconArrowIteration size={12} />}
        >
          {refName} (circular)
        </Badge>
      </Group>
    </Box>
  );
};

export function SchemaViewer({
  schema,
  spec,
  level = 0,
  name,
  required = false,
  visitedRefs = new Set(),
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
    // Circular reference detected – stop recursing
    if (visitedRefs.has(schema.$ref)) {
      return (
        <CircularRefBadge
          refPath={schema.$ref}
          name={name}
          indent={level * INDENT_SIZE}
        />
      );
    }

    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) {
      const nextVisited = new Set(visitedRefs);
      nextVisited.add(schema.$ref);
      return (
        <SchemaViewer
          schema={resolved}
          spec={spec}
          level={level}
          name={name}
          required={required}
          visitedRefs={nextVisited}
        />
      );
    }
  }

  // Handle allOf - show all parts
  if (schema.allOf && spec) {
    return (
      <AllOfViewer
        schema={schema}
        spec={spec}
        level={level}
        name={name}
        required={required}
        visitedRefs={visitedRefs}
      />
    );
  }

  // Handle oneOf - show options
  if (schema.oneOf && spec) {
    return (
      <OneOfViewer
        schema={schema}
        spec={spec}
        level={level}
        name={name}
        required={required}
        visitedRefs={visitedRefs}
      />
    );
  }

  // Handle anyOf - show options
  if (schema.anyOf && spec) {
    return (
      <AnyOfViewer
        schema={schema}
        spec={spec}
        level={level}
        name={name}
        required={required}
        visitedRefs={visitedRefs}
      />
    );
  }

  const schemaType = getSchemaType(schema, spec);
  const indent = level * INDENT_SIZE;

  // Render array types
  if (
    (schema.type === "array" || schema.type?.includes("array")) &&
    schema.items
  ) {
    return (
      <FieldArrayViewer
        schema={schema}
        spec={spec}
        level={level}
        name={name}
        required={required}
        visitedRefs={visitedRefs}
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
          <Stack gap="xs" mt="xs">
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
                      visitedRefs={visitedRefs}
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
  visitedRefs = new Set(),
}: SchemaViewerProps) => {
  let itemsSchema = schema.items as Schema;

  if (itemsSchema.$ref && spec) {
    // Circular reference in array items
    if (visitedRefs.has(itemsSchema.$ref)) {
      const indent = level * INDENT_SIZE;
      return (
        <Box pl={indent}>
          <Group gap={0} wrap="nowrap">
            <FieldHeader name={name} type="array" required={required} />
            <CircularRefBadge refPath={itemsSchema.$ref} />
          </Group>
        </Box>
      );
    }
    const resolved = resolveRef(itemsSchema.$ref, spec);
    if (resolved) {
      // We don't add to visitedRefs here because the resolution happens
      // at the array-items level; the children will track it when they
      // encounter their own $ref.
      const nextVisited = new Set(visitedRefs);
      nextVisited.add(itemsSchema.$ref);
      itemsSchema = resolved;
      // Use nextVisited for children below
      return (
        <FieldArrayViewerResolved
          schema={schema}
          itemsSchema={itemsSchema}
          spec={spec}
          level={level}
          name={name}
          required={required}
          visitedRefs={nextVisited}
        />
      );
    }
  }

  return (
    <FieldArrayViewerResolved
      schema={schema}
      itemsSchema={itemsSchema}
      spec={spec}
      level={level}
      name={name}
      required={required}
      visitedRefs={visitedRefs}
    />
  );
};

interface FieldArrayViewerResolvedProps {
  schema: Schema;
  itemsSchema: Schema;
  spec?: OpenAPISpec;
  level: number;
  name?: string;
  required?: boolean;
  visitedRefs: Set<string>;
}

const FieldArrayViewerResolved = ({
  schema,
  itemsSchema,
  spec,
  level,
  name,
  required = false,
  visitedRefs,
}: FieldArrayViewerResolvedProps) => {
  const indent = level * INDENT_SIZE;
  const [expanded, setExpanded] = useState(false);

  return (
    <Box pl={indent}>
      <Group gap={0} wrap="nowrap">
        <FieldHeader
          name={name}
          type="array"
          required={required}
          expandable={!isPrimitiveType(itemsSchema.type)}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
        <TypeBadge type={getSchemaType(itemsSchema, spec)} />
        {schema.description && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {schema.description}
          </Text>
        )}
      </Group>
      {!isPrimitiveType(itemsSchema.type) && (
        <Collapse in={expanded}>
          <Stack gap="xs" mt="xs">
            {itemsSchema.properties &&
              Object.entries(itemsSchema.properties).map(
                ([propName, propSchema]) => {
                  const isRequired =
                    itemsSchema.required?.includes(propName) || false;
                  return (
                    <SchemaViewer
                      key={propName}
                      schema={propSchema as Schema}
                      spec={spec}
                      level={level + 1}
                      name={propName}
                      required={isRequired}
                      visitedRefs={visitedRefs}
                    />
                  );
                },
              )}
            {itemsSchema.allOf &&
              itemsSchema.allOf.map((subSchema, index) => (
                <Box key={index}>
                  <SchemaViewer
                    schema={subSchema as Schema}
                    spec={spec}
                    level={level}
                    required={false}
                    visitedRefs={visitedRefs}
                  />
                </Box>
              ))}
          </Stack>
        </Collapse>
      )}
    </Box>
  );
};

const OneOfViewer = ({
  schema,
  spec,
  level = 0,
  name,
  required = false,
  visitedRefs = new Set(),
}: SchemaViewerProps) => {
  const indent = level * INDENT_SIZE;
  const [expanded, setExpanded] = useState(level < 2);
  const [selectedOption, setSelectedOption] = useState(0);

  if (!schema.oneOf || !spec) return null;

  let selectedSchema = schema.oneOf[selectedOption] as Schema;

  if (selectedSchema.$ref && spec) {
    if (visitedRefs.has(selectedSchema.$ref)) {
      return (
        <CircularRefBadge
          refPath={selectedSchema.$ref}
          name={name}
          indent={indent}
        />
      );
    }
    const resolved = resolveRef(selectedSchema.$ref, spec);
    if (resolved) {
      selectedSchema = resolved;
    }
  }

  const schemaTypes = schema.oneOf.map((subSchema) =>
    getSchemaType(subSchema as Schema, spec),
  );

  return (
    <Box pl={indent}>
      <Group gap="xs" align="center">
        <FieldHeader
          name={name}
          type="oneOf"
          description={schema.description}
          required={required}
          expandable={!!selectedSchema.properties}
          expanded={expanded}
          onToggle={() => setExpanded(!expanded)}
        />
        {schemaTypes.map((type, i) => (
          <Group key={i} gap="xs" onClick={() => setSelectedOption(i)}>
            <TypeBadge key={i} type={type} />
            {i < schemaTypes.length - 1 && (
              <Divider orientation="vertical" size="sm" />
            )}
          </Group>
        ))}
      </Group>
      <Collapse in={expanded}>
        {selectedSchema.properties && (
          <Stack gap="xs" mt="xs">
            {Object.entries(selectedSchema.properties).map(
              ([propName, propSchema]) => {
                const isRequired = schema.required?.includes(propName) || false;
                return (
                  <SchemaViewer
                    key={propName}
                    schema={propSchema as Schema}
                    spec={spec}
                    level={level + 1}
                    name={propName}
                    required={isRequired}
                    visitedRefs={visitedRefs}
                  />
                );
              },
            )}
          </Stack>
        )}
      </Collapse>
    </Box>
  );
};

const AnyOfViewer = ({
  schema,
  spec,
  level = 0,
  name,
  required = false,
  visitedRefs = new Set(),
}: SchemaViewerProps) => {
  const indent = level * INDENT_SIZE;
  const [expanded, setExpanded] = useState(level < 2);

  if (!schema.anyOf || !spec) return null;

  return (
    <Box pl={indent}>
      <FieldHeader
        name={name}
        type="anyOf"
        description={schema.description}
        required={required}
        expandable={true}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
      <Collapse in={expanded}>
        <Stack gap="md" mt="xs">
          <Text size="xs" c="dimmed">
            Any of the following:
          </Text>
          {schema.anyOf.map((subSchema, index) => (
            <Box key={index}>
              <Text size="xs" c="dimmed" mb="xs">
                Option {index + 1}:
              </Text>
              <SchemaViewer
                schema={subSchema as Schema}
                spec={spec}
                level={level + 1}
                required={false}
                visitedRefs={visitedRefs}
              />
            </Box>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

const AllOfViewer = ({
  schema,
  spec,
  level = 0,
  name,
  required = false,
  visitedRefs = new Set(),
}: SchemaViewerProps) => {
  const indent = level * INDENT_SIZE;
  const [expanded, setExpanded] = useState(level < 2);

  if (!schema.allOf || !spec) return null;

  // Check if any sub-schema has compositions (oneOf, anyOf)
  const hasCompositions = schema.allOf.some((subSchema) => {
    const s = subSchema as Schema;
    if (s.$ref && spec) {
      if (visitedRefs.has(s.$ref)) return false;
      const resolved = resolveRef(s.$ref, spec);
      return resolved && (resolved.oneOf || resolved.anyOf);
    }
    return s.oneOf || s.anyOf;
  });

  // If there are compositions, show each part separately
  if (hasCompositions) {
    return (
      <Box pl={indent}>
        <Collapse in={expanded}>
          <Stack gap="sm" mt="xs">
            <Text size="xs" c="dimmed">
              All of the following (combined):
            </Text>
            {schema.allOf.map((subSchema, index) => (
              <Box key={index}>
                <SchemaViewer
                  schema={subSchema as Schema}
                  spec={spec}
                  level={level}
                  required={false}
                  visitedRefs={visitedRefs}
                />
              </Box>
            ))}
          </Stack>
        </Collapse>
      </Box>
    );
  }

  // No compositions - merge and display as unified object
  const merged = mergeAllOfSchemas(schema.allOf as Schema[], spec);

  return (
    <Box pl={indent}>
      <FieldHeader
        name={name}
        type="object"
        description={schema.description || merged.description}
        required={required}
        expandable={true}
        expanded={expanded}
        onToggle={() => setExpanded(!expanded)}
      />
      <Collapse in={expanded}>
        <Stack gap="xs" mt="xs">
          {merged.properties &&
            Object.entries(merged.properties).map(([propName, propSchema]) => {
              const isRequired = merged.required?.includes(propName) || false;
              return (
                <SchemaViewer
                  key={propName}
                  schema={propSchema as Schema}
                  spec={spec}
                  level={level + 1}
                  name={propName}
                  required={isRequired}
                  visitedRefs={visitedRefs}
                />
              );
            })}
          {!merged.properties && (
            <Text size="xs" c="dimmed">
              Additional properties allowed
            </Text>
          )}
        </Stack>
      </Collapse>
    </Box>
  );
};
