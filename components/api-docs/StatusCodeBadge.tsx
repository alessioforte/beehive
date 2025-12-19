"use client";

import { Badge } from "@mantine/core";
import { getStatusCodeColor } from "@/utils/openapi-helpers";

interface StatusCodeBadgeProps {
  statusCode: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function StatusCodeBadge({
  statusCode,
  size = "sm",
}: StatusCodeBadgeProps) {
  const color = getStatusCodeColor(statusCode);

  return (
    <Badge
      color={color}
      variant="light"
      size={size}
      radius="sm"
      style={{ fontWeight: 600, minWidth: 50 }}
    >
      {statusCode}
    </Badge>
  );
}
