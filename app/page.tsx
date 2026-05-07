"use client";

import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Box,
  Paper,
  Group,
} from "@mantine/core";
import ColorSchemeToggle from "@/components/colorscheme-toggle";
import { IconBook, IconRocket, IconCode } from "@tabler/icons-react";
import useStore from "@/store";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { theme, setTheme } = useStore();

  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box style={{ position: "absolute", bottom: 10, left: 10, zIndex: 9 }}>
        <ColorSchemeToggle theme={theme} onClick={setTheme} />
      </Box>
      <Container size="md">
        <Paper p="xl" radius="lg" style={{ textAlign: "center" }}>
          <Stack gap="xl" align="center">
            <Box>
              <IconRocket size={80} stroke={1.5} color="orange" />
            </Box>

            <Box>
              <Title order={1} size="h1" mb="md">
                Welcome to Beehive
              </Title>
              <Text size="lg" c="dimmed" maw={600}>
                Your beautiful API documentation viewer powered by OpenAPI
              </Text>
            </Box>

            <Group gap="md" mt="lg">
              <Button
                size="lg"
                variant="gradient"
                leftSection={<IconBook size={20} />}
                onClick={() => router.push("/api-docs")}
                gradient={{ from: "orange", to: "yellow" }}
              >
                View API Docs
              </Button>

              <Button
                size="lg"
                leftSection={<IconCode size={20} />}
                variant="light"
                onClick={() => window.open("https://github.com", "_blank")}
              >
                GitHub
              </Button>
            </Group>

            <Box mt="xl">
              <Text size="sm" c="dimmed">
                Built with Next.js, React, TypeScript, and Mantine UI
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
