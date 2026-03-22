import { atom } from "jotai";
import { UIBlock } from "@/types/ui-schema";

// This is the global UI state atom. It can contain any UI-related state, such as the current map, the current plan, etc. We can derive specific atoms from this one for different parts of the UI, such as the mapAtom for the map state. This way, we can keep all UI-related state in one place and easily manage it.
export type UIState = {
  map?: UIBlock;
};

export const uiAtom = atom<UIState>({});
