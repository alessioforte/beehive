"use client";

import {
  Box,
  NavLink,
  Text,
  TextInput,
  Stack,
  Badge,
  Divider,
  Group,
  ScrollArea,
} from "@mantine/core";
import { IconSearch, IconTag } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { OpenAPISpec } from "@/types/openapi";
import { groupByTags } from "@/utils/openapi-helpers";
import { MethodBadge } from "./MethodBadge";

interface ApiNavigationProps {
  spec: OpenAPISpec;
  onNavigate?: (pathId: string) => void;
}

export function ApiNavigation({ spec, onNavigate }: ApiNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const groupedEndpoints = useMemo(() => {
    return groupByTags(spec.paths as Record<string, Record<string, unknown>>);
  }, [spec.paths]);

  const filteredEndpoints = useMemo(() => {
    if (!searchQuery.trim()) {
      return groupedEndpoints;
    }

    const query = searchQuery.toLowerCase();
    const filtered = new Map<
      string,
      Array<{
        path: string;
        method: string;
        operation: { summary?: string; description?: string };
      }>
    >();

    groupedEndpoints.forEach((endpoints, tag) => {
      const matchingEndpoints = endpoints.filter((endpoint) => {
        const pathMatch = endpoint.path.toLowerCase().includes(query);
        const methodMatch = endpoint.method.toLowerCase().includes(query);
        const operation = endpoint.operation as {
          summary?: string;
          description?: string;
        };
        const summaryMatch = operation.summary?.toLowerCase().includes(query);
        const descriptionMatch = operation.description
          ?.toLowerCase()
          .includes(query);

        return pathMatch || methodMatch || summaryMatch || descriptionMatch;
      });

      if (matchingEndpoints.length > 0) {
        filtered.set(tag, matchingEndpoints);
      }
    });

    return filtered;
  }, [groupedEndpoints, searchQuery]);

  const handleEndpointClick = (path: string, method: string) => {
    const pathId = `${method}-${path}`.replace(/[^a-zA-Z0-9]/g, "-");
    const element = document.getElementById(pathId);

    if (element) {
      // Find the scrollable container by ID
      const scrollContainer = document.getElementById(
        "api-content-scroll-container",
      );

      if (scrollContainer) {
        // Calculate the element's position relative to the scroll container
        const containerRect = scrollContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        // Current scroll position + element position relative to container top
        const targetScroll =
          scrollContainer.scrollTop +
          (elementRect.top - containerRect.top) -
          20;

        // Scroll to the calculated position
        scrollContainer.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      } else {
        // Fallback to default behavior
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (onNavigate) {
      onNavigate(pathId);
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box p="md" style={{ flexShrink: 0 }}>
        <Text size="lg" fw={700} mb="md">
          API Endpoints
        </Text>
        <TextInput
          placeholder="Search endpoints..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          mb="md"
        />
      </Box>

      <Divider />

      <ScrollArea
        style={{ flex: 1, overflow: "auto", minHeight: 0, height: "100%" }}
      >
        <Stack gap="md">
          {Array.from(filteredEndpoints.entries()).map(([tag, endpoints]) => {
            const tagInfo = spec.tags?.find((t) => t.name === tag);

            return (
              <Box key={tag}>
                <NavLink
                  label={
                    <Group gap="xs" wrap="nowrap">
                      <IconTag size={16} />
                      <Text size="sm" fw={600}>
                        {tag}
                      </Text>
                      <Badge size="xs" variant="light">
                        {endpoints.length}
                      </Badge>
                    </Group>
                  }
                  description={tagInfo?.description}
                  childrenOffset={0}
                  defaultOpened
                >
                  <Stack gap={4} mt="xs">
                    {endpoints.map((endpoint, index) => (
                      <NavLink
                        key={`${endpoint.path}-${endpoint.method}-${index}`}
                        label={
                          <Box>
                            <Group gap="xs" wrap="nowrap" mb={4}>
                              <MethodBadge method={endpoint.method} size="xs" />
                              <Text
                                size="xs"
                                ff="monospace"
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {endpoint.path}
                              </Text>
                            </Group>
                            {(endpoint.operation as { summary?: string })
                              .summary && (
                              <Text size="xs" c="dimmed" lineClamp={1} pl="md">
                                {
                                  (endpoint.operation as { summary?: string })
                                    .summary
                                }
                              </Text>
                            )}
                          </Box>
                        }
                        onClick={() =>
                          handleEndpointClick(endpoint.path, endpoint.method)
                        }
                        style={{ cursor: "pointer" }}
                      />
                    ))}
                  </Stack>
                </NavLink>
              </Box>
            );
          })}

          {filteredEndpoints.size === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              No endpoints found
            </Text>
          )}
        </Stack>
      </ScrollArea>
    </Box>
  );
}
