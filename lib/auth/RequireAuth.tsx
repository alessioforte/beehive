import { useEffect } from "react";
import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import { Outlet, useLocation } from "react-router";
import { useAuth } from "./auth-context";

export function RequireAuth() {
  const location = useLocation();
  const { status, error, checkSession, signIn } = useAuth();
  const returnPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void signIn(returnPath);
    }
  }, [returnPath, signIn, status]);

  if (status === "authenticated") return <Outlet />;

  if (status === "error") {
    return (
      <Center mih="100vh" p="md">
        <Stack w={420}>
          <Alert color="red" title="Authentication error">
            {error ?? "Unable to authenticate"}
          </Alert>
          <Button onClick={() => void signIn(returnPath)}>Try again</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Center mih="100vh">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">
          {status === "redirecting"
            ? "Redirecting to sign in"
            : "Checking session"}
        </Text>
      </Stack>
    </Center>
  );
}
