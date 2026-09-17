import { Group, Table, Badge, Text, Code, Stack, Box } from "@mantine/core";
import { Parameter, OpenAPISpec } from "@/types/openapi";
import { getSchemaType } from "@/utils/openapi-helpers";
import TypeBadge from "./TypeBadge";

interface ParametersTableProps {
  parameters: Parameter[];
  spec?: OpenAPISpec;
  title?: string;
}

export function ParametersTable({
  parameters,
  spec,
  title = "Parameters",
}: ParametersTableProps) {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  return (
    <Box>
      <Text size="sm" fw={600} mb="sm">
        {title}
      </Text>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Location</Table.Th>
            <Table.Th>Description</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {parameters.map((param, index) => {
            const schemaType = param.schema
              ? getSchemaType(param.schema, spec)
              : "any";

            return (
              <Table.Tr key={`${param.name}-${index}`}>
                <Table.Td>
                  <Group gap={5}>
                    <Text size="sm" fw={500} c="blue">
                      {param.name}
                    </Text>
                    {param.required && (
                      <Text component="span" c="red">
                        *
                      </Text>
                    )}
                    {param.deprecated && (
                      <Badge size="xs" color="orange" variant="light">
                        deprecated
                      </Badge>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <TypeBadge type={schemaType} />
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="transparent" color="gray" p={0}>
                    {param.in}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    {param.description && (
                      <Text size="sm" c="dimmed">
                        {param.description}
                      </Text>
                    )}
                    {param.example !== undefined && (
                      <Box>
                        <Text size="xs" fw={500} c="dimmed">
                          Example:
                        </Text>
                        <Code block mt={4}>
                          {typeof param.example === "string"
                            ? param.example
                            : JSON.stringify(param.example, null, 2)}
                        </Code>
                      </Box>
                    )}
                    {param.schema?.enum && (
                      <Box>
                        <Text size="xs" fw={500} c="dimmed">
                          Allowed values:
                        </Text>
                        <Text size="xs" c="dimmed">
                          {param.schema.enum.join(", ")}
                        </Text>
                      </Box>
                    )}
                  </Stack>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
