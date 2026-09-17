import { Badge } from "@mantine/core";
import { getMethodColor } from "@/utils/openapi-helpers";

interface MethodBadgeProps {
  method: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function MethodBadge({ method, size = "sm" }: MethodBadgeProps) {
  const color = getMethodColor(method);

  return (
    <Badge
      color={color}
      variant="filled"
      size={size}
      radius="xs"
      style={{ fontWeight: 700, minWidth: 60, textAlign: "center" }}
    >
      {method.toUpperCase()}
    </Badge>
  );
}
