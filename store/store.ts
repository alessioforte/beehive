import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { load as loadYaml } from "js-yaml";
import { State, Actions } from "./types";
import {
  isSwagger2,
  convertSwagger2ToOpenAPI3,
} from "@/utils/swagger-converter";

const initialState: State = {
  loading: false,
  theme: "system",
  openAPISpec: null,
  openAPILoading: false,
  openAPIError: null,
};

let currentOpenAPIUrl: string = "";

export const store: StateCreator<State & Actions> = (set) => ({
  ...initialState,
  setTheme: (theme) => set(() => ({ theme })),

  setOpenAPISpecUrl: (url: string) => {
    currentOpenAPIUrl = url;
  },

  fetchOpenAPISpec: async (url: string) => {
    currentOpenAPIUrl = url;
    set({ openAPILoading: true, openAPIError: null });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      let data;
      // Check if it's YAML based on content type or URL extension
      if (
        contentType.includes("yaml") ||
        contentType.includes("yml") ||
        url.endsWith(".yaml") ||
        url.endsWith(".yml")
      ) {
        data = loadYaml(text);
      } else {
        // Try to parse as JSON, fallback to YAML if it fails
        try {
          data = JSON.parse(text);
        } catch {
          data = loadYaml(text);
        }
      }

      // Convert Swagger 2.0 specs to OpenAPI 3.0 so rendering components work
      if (isSwagger2(data)) {
        data = convertSwagger2ToOpenAPI3(data);
      }

      set({ openAPISpec: data, openAPILoading: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      set({ openAPIError: errorMessage, openAPILoading: false });
      console.error("Error fetching OpenAPI spec:", err);
    }
  },

  refetchOpenAPISpec: async () => {
    if (!currentOpenAPIUrl) {
      console.warn("No OpenAPI URL set for refetch");
      return;
    }

    set({ openAPILoading: true, openAPIError: null });

    try {
      const response = await fetch(currentOpenAPIUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();

      let data;
      // Check if it's YAML based on content type or URL extension
      if (
        contentType.includes("yaml") ||
        contentType.includes("yml") ||
        currentOpenAPIUrl.endsWith(".yaml") ||
        currentOpenAPIUrl.endsWith(".yml")
      ) {
        data = loadYaml(text);
      } else {
        // Try to parse as JSON, fallback to YAML if it fails
        try {
          data = JSON.parse(text);
        } catch {
          data = loadYaml(text);
        }
      }

      // Convert Swagger 2.0 specs to OpenAPI 3.0 so rendering components work
      if (isSwagger2(data)) {
        data = convertSwagger2ToOpenAPI3(data);
      }

      set({ openAPISpec: data, openAPILoading: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      set({ openAPIError: errorMessage, openAPILoading: false });
      console.error("Error fetching OpenAPI spec:", err);
    }
  },
});

export default create(devtools(store, { name: "store", store: "main" }));
