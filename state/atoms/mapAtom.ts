// import { createUIFieldAtom } from "@/state/atoms/uiAtom";
import { atom } from "jotai";
import { UIBlock } from "@/types/ui-schema";

// Derived atom for map state: we only update the map part of the UI state, and we can read it directly without having to deal with the rest of the UI state.
export const mapAtom = atom<UIBlock | undefined>(undefined);
