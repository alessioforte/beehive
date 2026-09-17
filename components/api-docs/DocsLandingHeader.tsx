import { Container, Stack, Title, Text, Box } from "@mantine/core";
import { IconFileCode } from "@tabler/icons-react";
import styles from "./DocsLandingHeader.module.css";

const DocsLandingHeader = () => {
  return (
    <Box className={styles.header} py="xl">
      <Container size="lg">
        <Stack gap="md" align="center">
          <IconFileCode size={48} stroke={1.5} />
          <Title order={1} ta="center">
            API Documentation Viewer
          </Title>
          <Text size="lg" ta="center" maw={600}>
            Load and explore OpenAPI/Swagger specifications with a beautiful,
            interactive interface
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default DocsLandingHeader;
