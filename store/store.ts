import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { load as loadYaml } from "js-yaml";
import { State, Actions, FetchOpenAPISpecOptions } from "./types";
import {
  isSwagger2,
  convertSwagger2ToOpenAPI3,
} from "@/utils/swagger-converter";

const initialState: State = {
  loading: false,
  theme: "system",
  openAPISpec: null,
  openAPISpecSourceSize: 0,
  openAPILoading: false,
  openAPIError: null,
};

interface OpenAPIRequest {
  url: string;
  options?: FetchOpenAPISpecOptions;
}

let currentOpenAPIRequest: OpenAPIRequest | null = null;

async function loadOpenAPISpec(url: string, options?: FetchOpenAPISpecOptions) {
  const response = await fetch(url, {
    headers: options?.accessToken
      ? { Authorization: `Bearer ${options.accessToken}` }
      : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  let data;
  if (
    contentType.includes("yaml") ||
    contentType.includes("yml") ||
    url.endsWith(".yaml") ||
    url.endsWith(".yml")
  ) {
    data = loadYaml(text);
  } else {
    try {
      data = JSON.parse(text);
    } catch {
      data = loadYaml(text);
    }
  }

  if (isSwagger2(data)) {
    data = convertSwagger2ToOpenAPI3(data);
  }

  return { data, sourceSize: text.length };
}

export const store: StateCreator<State & Actions> = (set) => ({
  ...initialState,
  setTheme: (theme) => set(() => ({ theme })),

  setOpenAPISpecUrl: (url: string) => {
    currentOpenAPIRequest = { url };
  },

  fetchOpenAPISpec: async (url: string, options?: FetchOpenAPISpecOptions) => {
    currentOpenAPIRequest = { url, options };
    set({
      openAPILoading: true,
      openAPIError: null,
      openAPISpecSourceSize: 0,
    });

    try {
      const { data, sourceSize } = await loadOpenAPISpec(url, options);

      set({
        openAPISpec: data,
        openAPISpecSourceSize: sourceSize,
        openAPILoading: false,
      });
    } catch (err) {
      const errorMessage = getFetchErrorMessage(err);
      set({ openAPIError: errorMessage, openAPILoading: false });
      console.error("Error fetching OpenAPI spec:", err);
    }
  },

  refetchOpenAPISpec: async () => {
    if (!currentOpenAPIRequest) {
      console.warn("No OpenAPI URL set for refetch");
      return;
    }

    set({ openAPILoading: true, openAPIError: null });

    try {
      const { data, sourceSize } = await loadOpenAPISpec(
        currentOpenAPIRequest.url,
        currentOpenAPIRequest.options,
      );

      set({
        openAPISpec: data,
        openAPISpecSourceSize: sourceSize,
        openAPILoading: false,
      });
    } catch (err) {
      const errorMessage = getFetchErrorMessage(err);
      set({ openAPIError: errorMessage, openAPILoading: false });
      console.error("Error fetching OpenAPI spec:", err);
    }
  },
});

function getFetchErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "The browser could not load this specification. Check that the URL is correct and that its server allows cross-origin (CORS) requests.";
  }

  return error instanceof Error ? error.message : "Unknown error occurred";
}

export default create(devtools(store, { name: "store", store: "main" }));
