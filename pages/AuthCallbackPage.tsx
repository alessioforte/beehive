import { useEffect, useState } from "react";
import { Alert, Button, Center, Loader, Stack, Text } from "@mantine/core";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/lib/auth";

type CallbackState =
  { status: "loading"; message: string } | { status: "error"; message: string };

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { completeSignIn, signIn } = useAuth();
  const [callbackState, setCallbackState] = useState<CallbackState>({
    status: "loading",
    message: "Completing sign in",
  });

  useEffect(() => {
    let cancelled = false;
    const searchParams = new URLSearchParams(location.search);

    void completeSignIn({
      code: searchParams.get("code"),
      error: searchParams.get("error"),
      errorDescription: searchParams.get("error_description"),
      state: searchParams.get("state"),
    })
      .then((returnPath) => {
        if (!cancelled) navigate(returnPath, { replace: true });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setCallbackState({
          status: "error",
          message:
            error instanceof Error ? error.message : "Authentication failed",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [completeSignIn, location.search, navigate]);

  if (callbackState.status === "error") {
    return (
      <Center mih="100vh" p="md">
        <Stack w={420}>
          <Alert color="red" title="Authentication error">
            {callbackState.message}
          </Alert>
          <Button onClick={() => void signIn("/")}>Sign in again</Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Center mih="100vh">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">{callbackState.message}</Text>
      </Stack>
    </Center>
  );
}
