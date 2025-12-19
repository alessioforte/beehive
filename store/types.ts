export interface State {
  loading: boolean;
  theme: "light" | "dark" | "system";
}

export interface Actions {
  setTheme: (theme: "light" | "dark" | "system") => void;
}
