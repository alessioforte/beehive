import { useEffect, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBook2,
  IconCalendar,
  IconLogout,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router";
import ColorSchemeToggle from "@/components/colorscheme-toggle";
import { useAuth } from "@/lib/auth";
import {
  fetchOpenApiCatalog,
  OpenApiCatalogError,
} from "@/services/openapi-catalog";
import { getOpenApiCatalogUrl } from "@/src/config";
import useStore from "@/store";
import type { OpenApiCatalogItem } from "@/types/openapi-catalog";
import styles from "./AuthenticatedHomePage.module.css";

type CatalogState =
  | { status: "loading"; items: OpenApiCatalogItem[] }
  | { status: "ready"; items: OpenApiCatalogItem[] }
  | { status: "error"; items: OpenApiCatalogItem[]; message: string };

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function catalogErrorMessage(error: unknown) {
  if (error instanceof OpenApiCatalogError && error.status === 401) {
    return "Your session is not authorized to load the API catalog.";
  }

  return error instanceof Error ? error.message : "Unable to load API catalog";
}

interface CatalogCardProps {
  item: OpenApiCatalogItem;
  onOpen: (item: OpenApiCatalogItem) => void;
}

function CatalogCard({ item, onOpen }: CatalogCardProps) {
  return (
    <UnstyledButton
      className={styles.catalogCard}
      onClick={() => onOpen(item)}
      aria-label={`Open ${item.title}`}
    >
      <Paper className={styles.cardPaper} p="lg" radius="lg" withBorder>
        <Stack gap="md" h="100%">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" align="flex-start">
              <ThemeIcon variant="light" size="lg">
                <IconBook2 size={20} />
              </ThemeIcon>
              <Box>
                <Text fw={700} size="lg" lineClamp={2}>
                  {item.title}
                </Text>
                {item.version && (
                  <Text size="xs" c="dimmed" mt={2}>
                    Version {item.version}
                  </Text>
                )}
              </Box>
            </Group>
            <IconArrowRight size={18} />
          </Group>

          <Text
            className={styles.description}
            size="sm"
            c={item.description ? undefined : "dimmed"}
            lineClamp={4}
          >
            {item.description || "No description provided."}
          </Text>

          {(item.specification || item.format || item.tags?.length) && (
            <Group gap="xs">
              {item.specification && (
                <Badge variant="light">{item.specification}</Badge>
              )}
              {item.format && (
                <Badge color="gray" variant="light">
                  {item.format.toUpperCase()}
                </Badge>
              )}
              {item.tags?.map((tag) => (
                <Badge key={tag} color="orange" variant="outline">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}

          {(item.owner || item.updatedAt) && (
            <Group gap="lg">
              {item.owner && (
                <Group gap={6} wrap="nowrap">
                  <IconUser size={14} />
                  <Text size="xs" c="dimmed">
                    {item.owner}
                  </Text>
                </Group>
              )}
              {item.updatedAt && (
                <Group gap={6} wrap="nowrap">
                  <IconCalendar size={14} />
                  <Text size="xs" c="dimmed">
                    {formatUpdatedAt(item.updatedAt)}
                  </Text>
                </Group>
              )}
            </Group>
          )}

          <Group gap="xs" wrap="nowrap">
            <Text className={styles.specUrl} size="xs" ff="monospace" truncate>
              {item.specUrl}
            </Text>
            <IconArrowRight size={14} />
          </Group>
        </Stack>
      </Paper>
    </UnstyledButton>
  );
}

export default function AuthenticatedHomePage() {
  const navigate = useNavigate();
  const { getAccessToken, signOut } = useAuth();
  const { theme, setTheme } = useStore();
  const [reloadKey, setReloadKey] = useState(0);
  const [catalog, setCatalog] = useState<CatalogState>({
    status: "loading",
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken)
          throw new Error("Your authentication session expired.");

        const response = await fetchOpenApiCatalog({
          accessToken,
          endpoint: getOpenApiCatalogUrl(),
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setCatalog({ status: "ready", items: response.items });
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setCatalog({
          status: "error",
          items: [],
          message: catalogErrorMessage(error),
        });
      }
    }

    void loadCatalog();
    return () => controller.abort();
  }, [getAccessToken, reloadKey]);

  const reloadCatalog = () => {
    setCatalog((current) => ({
      status: "loading",
      items: current.items,
    }));
    setReloadKey((value) => value + 1);
  };

  const openViewer = (item: OpenApiCatalogItem) => {
    const params = new URLSearchParams({
      url: item.specUrl,
      from: "catalog",
    });
    navigate(`/api-docs/viewer?${params.toString()}`);
  };

  return (
    <Box className={styles.page}>
      <Box className={styles.header} py="md">
        <Container size="xl">
          <Group justify="space-between" wrap="nowrap">
            <Group gap="sm">
              <IconBook2 size={28} color="var(--mantine-color-orange-6)" />
              <Text fw={700} size="lg">
                Beehive
              </Text>
            </Group>
            <Group gap="xs" wrap="nowrap">
              <Tooltip label="Reload catalog">
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  aria-label="Reload catalog"
                  loading={catalog.status === "loading"}
                  onClick={reloadCatalog}
                >
                  <IconRefresh size={19} />
                </ActionIcon>
              </Tooltip>
              <ColorSchemeToggle theme={theme} onClick={setTheme} />
              <Tooltip label="Sign out">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="lg"
                  aria-label="Sign out"
                  onClick={() => void signOut()}
                >
                  <IconLogout size={19} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Container>
      </Box>

      <Container size="xl" py={{ base: "xl", sm: 48 }}>
        <Stack gap="xl">
          <Box>
            <Title order={1}>API catalog</Title>
            <Text c="dimmed" mt="xs" maw={700}>
              Browse the available OpenAPI specifications and open their
              interactive documentation.
            </Text>
          </Box>

          {catalog.status === "error" && (
            <Alert color="red" title="Could not load the catalog">
              <Stack gap="sm" align="flex-start">
                <Text size="sm">{catalog.message}</Text>
                <Button size="xs" variant="light" onClick={reloadCatalog}>
                  Try again
                </Button>
              </Stack>
            </Alert>
          )}

          {catalog.status === "loading" && catalog.items.length === 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} h={272} radius="lg" />
              ))}
            </SimpleGrid>
          )}

          {catalog.status === "ready" && catalog.items.length === 0 && (
            <Center py={80}>
              <Stack align="center" gap="sm">
                <IconBook2 size={42} stroke={1.4} />
                <Text fw={600}>No APIs available</Text>
                <Text size="sm" c="dimmed">
                  The catalog endpoint returned an empty list.
                </Text>
              </Stack>
            </Center>
          )}

          {catalog.items.length > 0 && (
            <>
              <Group justify="space-between">
                <Text fw={600}>
                  {catalog.items.length} API
                  {catalog.items.length === 1 ? "" : "s"}
                </Text>
                {catalog.status === "loading" && <Loader size="sm" />}
              </Group>
              <SimpleGrid
                className={styles.catalogGrid}
                cols={{ base: 1, sm: 2, lg: 3 }}
                spacing="lg"
              >
                {catalog.items.map((item) => (
                  <CatalogCard key={item.id} item={item} onOpen={openViewer} />
                ))}
              </SimpleGrid>
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
