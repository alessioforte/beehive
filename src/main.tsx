import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router";
import App from "./App";
import theme from "@/theme";
import "@mantine/core/styles.css";
import "@/global.css";

const routerBaseName = import.meta.env.BASE_URL.replace(/\/+$/, "") || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <BrowserRouter basename={routerBaseName}>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
