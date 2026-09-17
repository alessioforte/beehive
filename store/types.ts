import { OpenAPISpec } from "@/types/openapi";

export interface State {
  loading: boolean;
  theme: "light" | "dark" | "system";
  openAPISpec: OpenAPISpec | null;
  openAPISpecSourceSize: number;
  openAPILoading: boolean;
  openAPIError: string | null;
}

export interface Actions {
  setTheme: (theme: "light" | "dark" | "system") => void;
  fetchOpenAPISpec: (url: string) => Promise<void>;
  refetchOpenAPISpec: () => Promise<void>;
  setOpenAPISpecUrl: (url: string) => void;
}
