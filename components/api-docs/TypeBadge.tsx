import { Center, Badge, Divider, Group } from "@mantine/core";

const colors = {
  string: "teal",
  number: "yellow",
  integer: "yellow",
  boolean: "green",
  array: "violet",
  object: "orange",
  allOf: "indigo",
  oneOf: "grape",
  anyOf: "pink",
};

const TypeBadge = ({ type }: { type: string | string[] }) => {
  if (Array.isArray(type)) {
    return (
      <Group gap="xs">
        {type.map((t, i) => (
          <Center key={t}>
            <Badge
              key={t}
              size="xs"
              variant="transparent"
              color={colors[t as keyof typeof colors] || "gray"}
            >
              {t === "array" ? "[ ]" : t}
            </Badge>
            {i < type.length - 1 && (
              <Divider orientation="vertical" size="sm" />
            )}
          </Center>
        ))}
      </Group>
    );
  }
  const color = colors[type as keyof typeof colors] || "gray";

  return (
    <Badge size="xs" variant="transparent" color={color}>
      {type === "array" ? "[ ]" : type}
    </Badge>
  );
};

export default TypeBadge;
