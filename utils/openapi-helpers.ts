import { Schema, OpenAPISpec, Operation } from "@/types/openapi";

const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "delete",
  "patch",
  "options",
  "head",
] as const;

export const LARGE_SPEC_THRESHOLDS = {
  sourceCharacters: 1_500_000,
  operations: 150,
  schemas: 250,
} as const;

export interface OpenAPISpecSize {
  isLarge: boolean;
  operationCount: number;
  schemaCount: number;
  sourceCharacters: number;
}

export function detectOpenAPISpecSize(
  spec: OpenAPISpec,
  sourceCharacters = 0,
): OpenAPISpecSize {
  const operationCount = Object.values(spec.paths).reduce(
    (count, pathItem) =>
      count +
      HTTP_METHODS.filter(
        (method) =>
          (pathItem as unknown as Record<string, unknown>)[method] !==
          undefined,
      ).length,
    0,
  );
  const schemaCount = Object.keys(spec.components?.schemas ?? {}).length;

  return {
    isLarge:
      sourceCharacters >= LARGE_SPEC_THRESHOLDS.sourceCharacters ||
      operationCount >= LARGE_SPEC_THRESHOLDS.operations ||
      schemaCount >= LARGE_SPEC_THRESHOLDS.schemas,
    operationCount,
    schemaCount,
    sourceCharacters,
  };
}

export function getOperationPathId(path: string, method: string): string {
  return `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, "-");
}

export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    get: "green",
    post: "blue",
    put: "orange",
    delete: "red",
    patch: "violet",
    options: "gray",
  };
  return colors[method.toLowerCase()] || "gray";
}

export function getStatusCodeColor(statusCode: string): string {
  const code = parseInt(statusCode);
  if (code >= 200 && code < 300) return "green";
  if (code >= 300 && code < 400) return "blue";
  if (code >= 400 && code < 500) return "orange";
  if (code >= 500) return "red";
  return "gray";
}

export function resolveRef(ref: string, spec: OpenAPISpec): Schema | null {
  const parts = ref.replace("#/", "").split("/");
  let result: unknown = spec as unknown;
  for (const part of parts) {
    result = (result as Record<string, unknown>)[part];
    if (!result) return null;
  }
  return result as Schema;
}

export function resolveSchema(
  schema: Schema | undefined,
  spec?: OpenAPISpec,
): Schema | null {
  if (!schema) return null;

  // Handle $ref
  if (schema.$ref && spec) {
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) return resolveSchema(resolved, spec);
  }

  return schema;
}

// Merge allOf schemas for simple cases (only use for display, not composition detection)
export function mergeAllOfSchemas(
  schemas: Schema[],
  spec?: OpenAPISpec,
): Schema {
  const merged: Schema = { type: "object" };

  schemas.forEach((subSchema) => {
    let resolved = subSchema;

    // Resolve $ref if present
    if (resolved.$ref && spec) {
      const refResolved = resolveRef(resolved.$ref, spec);
      if (refResolved) resolved = refResolved;
    }

    // Only merge simple properties, preserve compositions
    if (resolved.properties) {
      merged.properties = { ...merged.properties, ...resolved.properties };
    }
    if (resolved.required) {
      merged.required = [...(merged.required || []), ...resolved.required];
    }

    // Copy other simple fields (not compositions)
    Object.keys(resolved).forEach((key) => {
      if (
        !merged[key as keyof Schema] &&
        key !== "allOf" &&
        key !== "oneOf" &&
        key !== "anyOf" &&
        key !== "$ref"
      ) {
        (merged as Record<string, unknown>)[key] = (
          resolved as Record<string, unknown>
        )[key];
      }
    });
  });

  return merged;
}

export function getSchemaType(
  schema: Schema | undefined,
  spec?: OpenAPISpec,
): string {
  if (!schema) return "any";

  if (schema.$ref && spec) {
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) return getSchemaType(resolved, spec);
    const parts = schema.$ref.split("/");
    return parts[parts.length - 1];
  }

  // Handle allOf
  if (schema.allOf) {
    return "allOf";
  }

  // Handle oneOf
  if (schema.oneOf) {
    return "oneOf";
  }

  // Handle anyOf
  if (schema.anyOf) {
    return "anyOf";
  }

  if (schema.type === "array" && schema.items) {
    return `${getSchemaType(schema.items, spec)}[]`;
  }

  return schema.type || "object";
}

export function formatJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

export function groupByTags(
  paths: Record<string, Record<string, unknown>>,
): Map<string, Array<{ path: string; method: string; operation: Operation }>> {
  const grouped = new Map<
    string,
    Array<{ path: string; method: string; operation: Operation }>
  >();

  Object.entries(paths).forEach(([path, pathItem]) => {
    HTTP_METHODS.forEach((method) => {
      const operation = pathItem[method] as Operation | undefined;
      if (operation) {
        const tags = operation.tags || ["Untagged"];
        tags.forEach((tag: string) => {
          if (!grouped.has(tag)) {
            grouped.set(tag, []);
          }
          grouped.get(tag)!.push({
            path,
            method,
            operation,
          });
        });
      }
    });
  });

  return grouped;
}

export function extractSchemaExample(
  schema: Schema,
  spec?: OpenAPISpec,
): unknown {
  if (schema.example !== undefined) return schema.example;

  if (schema.$ref && spec) {
    const resolved = resolveRef(schema.$ref, spec);
    if (resolved) return extractSchemaExample(resolved, spec);
  }

  // Handle allOf - merge examples from all schemas
  if (schema.allOf && spec) {
    const merged = mergeAllOfSchemas(schema.allOf as Schema[], spec);
    return extractSchemaExample(merged, spec);
  }

  // Handle oneOf - use first option
  if (schema.oneOf && spec) {
    const firstOption = schema.oneOf[0] as Schema;
    return extractSchemaExample(firstOption, spec);
  }

  // Handle anyOf - use first option
  if (schema.anyOf && spec) {
    const firstOption = schema.anyOf[0] as Schema;
    return extractSchemaExample(firstOption, spec);
  }

  if (schema.type === "object" && schema.properties) {
    const example: Record<string, unknown> = {};
    Object.entries(schema.properties).forEach(([key, propSchema]) => {
      example[key] = extractSchemaExample(propSchema as Schema, spec);
    });
    return example;
  }

  if (schema.type === "array" && schema.items) {
    return [extractSchemaExample(schema.items as Schema, spec)];
  }

  if (schema.default !== undefined) return schema.default;
  if (schema.enum && schema.enum.length > 0) return schema.enum[0];

  const typeDefaults: Record<string, unknown> = {
    string: "string",
    number: 0,
    integer: 0,
    boolean: false,
    array: [],
    object: {},
  };

  return typeDefaults[schema.type || "string"];
}

export function isPrimitiveType(type?: string): boolean {
  if (!type) return false;
  return ["string", "number", "integer", "boolean"].includes(type);
}
