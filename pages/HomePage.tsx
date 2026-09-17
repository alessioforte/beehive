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
import { useNavigate } from "react-router";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useStore();

  return (
    <Box className={styles.page}>
      <Box className={styles.themeToggle}>
        <ColorSchemeToggle theme={theme} onClick={setTheme} />
      </Box>
      <Container size="md">
        <Paper p="xl" radius="lg" className={styles.heroCard} withBorder>
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
                onClick={() => navigate("/api-docs")}
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
                Built with Vite, React, TypeScript, and Mantine UI
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
