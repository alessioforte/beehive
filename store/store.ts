import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { State, Actions } from "./types";

const initialState: State = {
  loading: false,
  theme: "system",
};

export const store: StateCreator<State & Actions> = (set) => ({
  ...initialState,
  setTheme: (theme) => set(() => ({ theme })),
});

export default create(devtools(store, { name: "store", store: "main" }));
