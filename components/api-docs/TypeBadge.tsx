import { Badge } from "@mantine/core";

const colors = {
  string: "teal",
  number: "yellow",
  integer: "yellow",
  boolean: "green",
  array: "violet",
  object: "orange",
};

const TypeBadge = ({ type }: { type: string }) => {
  const color = colors[type as keyof typeof colors] || "gray";
  return (
    <Badge size="xs" variant="transparent" color={color}>
      {type === "array" ? "[ ]" : type}
    </Badge>
  );
};

export default TypeBadge;
