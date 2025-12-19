"use client";

import {
  Box,
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Paper,
  Anchor,
  Divider,
} from "@mantine/core";
import { IconMail, IconLink, IconScale } from "@tabler/icons-react";
import { Info, OpenAPISpec } from "@/types/openapi";

interface ApiHeaderProps {
  info: Info;
  servers?: OpenAPISpec["servers"];
}

export function ApiHeader({ info, servers }: ApiHeaderProps) {
  return (
    <Paper shadow="sm" p="xl" radius="md" withBorder>
      <Stack gap="lg">
        {/* Title and Version */}
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Box style={{ flex: 1 }}>
            <Title order={1} size="h1" mb="xs">
              {info.title}
            </Title>
            {info.description && (
              <Text size="lg" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
                {info.description}
              </Text>
            )}
          </Box>
          <Badge
            size="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
          >
            v{info.version}
          </Badge>
        </Group>

        {/* Contact and License Info */}
        {(info.contact || info.license) && (
          <>
            <Divider />
            <Group gap="xl" wrap="wrap">
              {info.contact && (
                <Stack gap="xs">
                  <Text size="sm" fw={600} c="dimmed">
                    Contact
                  </Text>
                  {info.contact.name && (
                    <Text size="sm">{info.contact.name}</Text>
                  )}
                  {info.contact.email && (
                    <Group gap="xs">
                      <IconMail size={16} />
                      <Anchor href={`mailto:${info.contact.email}`} size="sm">
                        {info.contact.email}
                      </Anchor>
                    </Group>
                  )}
                  {info.contact.url && (
                    <Group gap="xs">
                      <IconLink size={16} />
                      <Anchor href={info.contact.url} target="_blank" size="sm">
                        Website
                      </Anchor>
                    </Group>
                  )}
                </Stack>
              )}

              {info.license && (
                <Stack gap="xs">
                  <Text size="sm" fw={600} c="dimmed">
                    License
                  </Text>
                  <Group gap="xs">
                    <IconScale size={16} />
                    {info.license.url ? (
                      <Anchor href={info.license.url} target="_blank" size="sm">
                        {info.license.name}
                      </Anchor>
                    ) : (
                      <Text size="sm">{info.license.name}</Text>
                    )}
                  </Group>
                </Stack>
              )}
            </Group>
          </>
        )}

        {/* Servers */}
        {servers && servers.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="sm" fw={600} c="dimmed" mb="xs">
                Base URLs
              </Text>
              <Stack gap="xs">
                {servers.map((server, index) => (
                  <Group key={index} gap="xs" wrap="nowrap">
                    <Badge variant="light" color="teal">
                      Server {index + 1}
                    </Badge>
                    <Text
                      size="sm"
                      ff="monospace"
                      style={{ wordBreak: "break-all" }}
                    >
                      {server.url}
                    </Text>
                    {server.description && (
                      <Text size="sm" c="dimmed">
                        - {server.description}
                      </Text>
                    )}
                  </Group>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  );
}
