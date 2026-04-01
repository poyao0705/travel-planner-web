import { atom, Getter, Setter } from "jotai";
import { uiRegistry } from "../registry/uiRegistry";
import { UIBlock } from "@/types/ui-schema";

type Registry = typeof uiRegistry;

export const uiDispatcherAtom = atom(null, (get, set, ui: UIBlock) => {
  const targetAtom = uiRegistry[ui.type];
  set(targetAtom, ui);
});
