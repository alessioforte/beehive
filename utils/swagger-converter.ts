import type {
  OpenAPISpec,
  Components,
  Schema,
  Parameter,
  RequestBody,
  Operation,
  Responses,
  Response,
  PathItem,
  SecurityScheme,
  Server,
} from "../types/openapi";

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the given value looks like a Swagger 2.0 document
 * (i.e. it has a top-level `swagger` field whose value is `"2.0"`).
 */
export function isSwagger2(spec: unknown): boolean {
  if (spec == null || typeof spec !== "object") return false;
  return (spec as Record<string, unknown>).swagger === "2.0";
}

/**
 * Best-effort conversion of a Swagger 2.0 spec object into an OpenAPI 3.0
 * shape that the rest of the app's rendering components understand.
 *
 * The input is typed as `any` on purpose – we cannot trust the shape at
 * compile time because it comes from user-supplied JSON / YAML.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertSwagger2ToOpenAPI3(swagger2: any): OpenAPISpec {
  if (!swagger2 || typeof swagger2 !== "object") {
    return emptySpec();
  }

  try {
    const result: OpenAPISpec = {
      openapi: "3.0.0",
      info: swagger2.info ?? { title: "", version: "" },
      servers: buildServers(swagger2),
      paths: {},
      tags: Array.isArray(swagger2.tags) ? swagger2.tags : undefined,
      components: buildComponents(swagger2),
    };

    // Global `produces` / `consumes` – used as fallback when the operation
    // itself does not declare them.
    const globalProduces: string[] = Array.isArray(swagger2.produces)
      ? swagger2.produces
      : ["application/json"];
    const globalConsumes: string[] = Array.isArray(swagger2.consumes)
      ? swagger2.consumes
      : ["application/json"];

    // Convert paths --------------------------------------------------------
    const swaggerPaths = swagger2.paths;
    if (swaggerPaths && typeof swaggerPaths === "object") {
      for (const pathKey of Object.keys(swaggerPaths)) {
        const pathItem = swaggerPaths[pathKey];
        if (!pathItem || typeof pathItem !== "object") continue;

        const converted: PathItem = {};

        if (pathItem.summary) converted.summary = pathItem.summary;
        if (pathItem.description) converted.description = pathItem.description;

        // Path-level parameters
        if (Array.isArray(pathItem.parameters)) {
          converted.parameters = convertParameters(pathItem.parameters);
        }

        const httpMethods = ["get", "put", "post", "delete", "patch"] as const;
        for (const method of httpMethods) {
          const op = pathItem[method];
          if (!op || typeof op !== "object") continue;
          (converted as Record<string, unknown>)[method] = convertOperation(
            op,
            globalProduces,
            globalConsumes,
          );
        }

        result.paths[pathKey] = converted;
      }
    }

    // Final pass – rewrite all $ref strings from #/definitions/… to
    // #/components/schemas/… throughout the entire tree.
    deepRewriteRefs(result);

    return result;
  } catch {
    // If anything goes wrong, return a minimal valid spec so the UI doesn't
    // blow up.
    return emptySpec();
  }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function emptySpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "", version: "" },
    paths: {},
  };
}

// -- Servers ---------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildServers(swagger2: any): Server[] {
  const schemes: string[] = Array.isArray(swagger2.schemes)
    ? swagger2.schemes
    : ["https"];
  const host: string = typeof swagger2.host === "string" ? swagger2.host : "";
  const basePath: string =
    typeof swagger2.basePath === "string" ? swagger2.basePath : "";

  return schemes.map((scheme) => ({
    url: host ? `${scheme}://${host}${basePath}` : basePath,
  }));
}

// -- Components ------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildComponents(swagger2: any): Components | undefined {
  const components: Components = {};
  let hasContent = false;

  // definitions → components.schemas
  if (swagger2.definitions && typeof swagger2.definitions === "object") {
    components.schemas = swagger2.definitions as Record<string, Schema>;
    hasContent = true;
  }

  // securityDefinitions → components.securitySchemes
  if (
    swagger2.securityDefinitions &&
    typeof swagger2.securityDefinitions === "object"
  ) {
    components.securitySchemes = convertSecurityDefinitions(
      swagger2.securityDefinitions,
    );
    hasContent = true;
  }

  return hasContent ? components : undefined;
}

// -- Security definitions --------------------------------------------------

function convertSecurityDefinitions(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defs: Record<string, any>,
): Record<string, SecurityScheme> {
  const out: Record<string, SecurityScheme> = {};

  for (const [name, def] of Object.entries(defs)) {
    if (!def || typeof def !== "object") continue;

    if (def.type === "basic") {
      // Swagger 2.0 "basic" → OpenAPI 3.0 http/basic
      out[name] = {
        type: "http",
        scheme: "basic",
        ...(def.description ? { description: def.description } : {}),
      };
    } else if (def.type === "apiKey") {
      out[name] = {
        type: "apiKey",
        name: def.name,
        in: def.in,
        ...(def.description ? { description: def.description } : {}),
      };
    } else if (def.type === "oauth2") {
      // OAuth2 has a very different shape in 3.0 but for our rendering
      // purposes we just carry the type and description across.
      out[name] = {
        type: "oauth2",
        ...(def.description ? { description: def.description } : {}),
      } as SecurityScheme;
    } else {
      // Unknown type – copy what we can
      out[name] = {
        type: def.type,
        ...(def.description ? { description: def.description } : {}),
      } as SecurityScheme;
    }
  }

  return out;
}

// -- Parameters ------------------------------------------------------------

/**
 * Converts an array of Swagger 2.0 parameters, stripping out `body` and
 * `formData` params (those are handled separately as `requestBody`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertParameters(params: any[]): Parameter[] {
  const out: Parameter[] = [];

  for (const p of params) {
    if (!p || typeof p !== "object") continue;
    if (p.in === "body" || p.in === "formData") continue;

    const converted: Parameter = {
      name: p.name ?? "",
      in: p.in,
    };

    if (p.description) converted.description = p.description;
    if (p.required != null) converted.required = !!p.required;
    if (p.deprecated != null) converted.deprecated = !!p.deprecated;
    if (p.example !== undefined) converted.example = p.example;

    // Swagger 2.0 puts type/format directly on the parameter; OpenAPI 3.0
    // wraps them in a `schema` object.
    if (p.schema) {
      converted.schema = p.schema as Schema;
    } else if (p.type) {
      const schema: Schema = { type: p.type };
      if (p.format) schema.format = p.format;
      if (p.enum) schema.enum = p.enum;
      if (p.default !== undefined) schema.default = p.default;
      if (p.minimum !== undefined) schema.minimum = p.minimum;
      if (p.maximum !== undefined) schema.maximum = p.maximum;
      if (p.minLength !== undefined) schema.minLength = p.minLength;
      if (p.maxLength !== undefined) schema.maxLength = p.maxLength;
      if (p.pattern) schema.pattern = p.pattern;
      if (p.items) schema.items = p.items;
      converted.schema = schema;
    }

    out.push(converted);
  }

  return out;
}

// -- Operations ------------------------------------------------------------

function convertOperation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  op: any,
  globalProduces: string[],
  globalConsumes: string[],
): Operation {
  const produces: string[] = Array.isArray(op.produces)
    ? op.produces
    : globalProduces;
  const consumes: string[] = Array.isArray(op.consumes)
    ? op.consumes
    : globalConsumes;

  const converted: Operation = {
    responses: convertResponses(op.responses, produces),
  };

  // Straightforward copies
  if (op.tags) converted.tags = op.tags;
  if (op.summary) converted.summary = op.summary;
  if (op.description) converted.description = op.description;
  if (op.operationId) converted.operationId = op.operationId;
  if (op.deprecated != null) converted.deprecated = !!op.deprecated;
  if (op.security) converted.security = op.security;

  // Parameters (non-body, non-formData)
  if (Array.isArray(op.parameters)) {
    const params = convertParameters(op.parameters);
    if (params.length > 0) {
      converted.parameters = params;
    }

    // Request body from `in: "body"` parameter
    const bodyParam = op.parameters.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p && p.in === "body",
    );

    // Request body from `in: "formData"` parameters
    const formDataParams = op.parameters.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p: any) => p && p.in === "formData",
    );

    if (bodyParam) {
      converted.requestBody = buildBodyRequestBody(bodyParam, consumes);
    } else if (formDataParams.length > 0) {
      converted.requestBody = buildFormDataRequestBody(formDataParams);
    }
  }

  return converted;
}

// -- Request bodies --------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildBodyRequestBody(param: any, consumes: string[]): RequestBody {
  const contentType = consumes[0] || "application/json";
  const requestBody: RequestBody = {
    content: {
      [contentType]: {
        schema: (param.schema as Schema) ?? {},
      },
    },
  };
  if (param.description) requestBody.description = param.description;
  if (param.required != null) requestBody.required = !!param.required;
  return requestBody;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildFormDataRequestBody(params: any[]): RequestBody {
  const properties: Record<string, Schema> = {};
  const requiredFields: string[] = [];
  let hasFile = false;

  for (const p of params) {
    if (!p || typeof p !== "object") continue;

    const name: string = p.name ?? "";
    if (p.type === "file") {
      hasFile = true;
      properties[name] = { type: "string", format: "binary" };
    } else {
      const schema: Schema = {};
      if (p.type) schema.type = p.type;
      if (p.format) schema.format = p.format;
      if (p.enum) schema.enum = p.enum;
      if (p.default !== undefined) schema.default = p.default;
      if (p.description) schema.description = p.description;
      if (p.items) schema.items = p.items;
      properties[name] = schema;
    }

    if (p.required) {
      requiredFields.push(name);
    }
  }

  const schema: Schema = {
    type: "object",
    properties,
  };
  if (requiredFields.length > 0) {
    schema.required = requiredFields;
  }

  const contentType = hasFile
    ? "multipart/form-data"
    : "application/x-www-form-urlencoded";

  return {
    content: {
      [contentType]: { schema },
    },
  };
}

// -- Responses -------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertResponses(responses: any, produces: string[]): Responses {
  const out: Responses = {};

  if (!responses || typeof responses !== "object") return out;

  for (const [code, resp] of Object.entries(responses)) {
    if (!resp || typeof resp !== "object") continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = resp as any;

    const converted: Response = {
      description: r.description ?? "",
    };

    // Swagger 2.0 puts `schema` directly on the response object.
    if (r.schema) {
      const contentType = produces[0] || "application/json";
      converted.content = {
        [contentType]: {
          schema: r.schema as Schema,
        },
      };
    }

    // Convert response headers
    if (r.headers && typeof r.headers === "object") {
      const headers: Record<string, { description?: string; schema?: Schema }> =
        {};
      for (const [headerName, headerDef] of Object.entries(r.headers)) {
        if (!headerDef || typeof headerDef !== "object") continue;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const h = headerDef as any;
        const hConverted: { description?: string; schema?: Schema } = {};
        if (h.description) hConverted.description = h.description;
        if (h.type) {
          const schema: Schema = { type: h.type };
          if (h.format) schema.format = h.format;
          if (h.enum) schema.enum = h.enum;
          hConverted.schema = schema;
        }
        headers[headerName] = hConverted;
      }
      if (Object.keys(headers).length > 0) {
        converted.headers = headers;
      }
    }

    out[code] = converted;
  }

  return out;
}

// -- $ref rewriting --------------------------------------------------------

const DEFINITIONS_REF_RE = /^#\/definitions\//;

/**
 * Recursively walks the object tree and rewrites every `$ref` value that
 * points to `#/definitions/…` so it points to `#/components/schemas/…`
 * instead.
 */
function deepRewriteRefs(obj: unknown): void {
  if (obj == null || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      deepRewriteRefs(item);
    }
    return;
  }

  const record = obj as Record<string, unknown>;

  if (typeof record.$ref === "string" && DEFINITIONS_REF_RE.test(record.$ref)) {
    record.$ref = record.$ref.replace(
      DEFINITIONS_REF_RE,
      "#/components/schemas/",
    );
  }

  for (const value of Object.values(record)) {
    deepRewriteRefs(value);
  }
}
