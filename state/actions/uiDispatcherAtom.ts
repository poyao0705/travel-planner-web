import { atom, Getter, Setter } from "jotai";
import { uiRegistry } from "../registry/uiRegistry";
import { UIBlock } from "@/types/ui-schema";

type Registry = typeof uiRegistry;

export const uiDispatcherAtom = atom(
  null,
  <K extends keyof Registry>(
    get: Getter,
    set: Setter,
    ui: Extract<UIBlock, { type: K }>,
  ) => {
    const targetAtom = uiRegistry[ui.type];
    set(targetAtom, ui);
  },
);
