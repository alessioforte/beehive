"use client";

import { useState, useEffect } from "react";
import { OpenAPISpec } from "@/types/openapi";

interface UseOpenAPISpecResult {
  spec: OpenAPISpec | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOpenAPISpec(url: string): UseOpenAPISpecResult {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch OpenAPI spec: ${response.statusText}`,
          );
        }

        const data = await response.json();
        setSpec(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching OpenAPI spec:", err);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchSpec();
    }
  }, [url]);

  const refetch = () => {
    if (url) {
      setLoading(true);
      setError(null);
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch OpenAPI spec: ${response.statusText}`,
            );
          }
          return response.json();
        })
        .then((data) => {
          setSpec(data);
          setLoading(false);
        })
        .catch((err) => {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error occurred";
          setError(errorMessage);
          console.error("Error fetching OpenAPI spec:", err);
          setLoading(false);
        });
    }
  };

  return {
    spec,
    loading,
    error,
    refetch,
  };
}
