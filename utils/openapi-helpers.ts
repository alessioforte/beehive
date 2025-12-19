import { Schema, OpenAPISpec, Operation } from "@/types/openapi";

export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    get: "blue",
    post: "green",
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

export function resolveRef(ref: string, spec: OpenAPISpec): unknown {
  const parts = ref.replace("#/", "").split("/");
  let result: unknown = spec as unknown;
  for (const part of parts) {
    result = (result as Record<string, unknown>)[part];
    if (!result) return null;
  }
  return result;
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
    const methods = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head",
    ];

    methods.forEach((method) => {
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
