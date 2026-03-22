import { uiAtom } from "@/state/uiAtom";
import { UIBlock } from "@/types/ui-schema";
import { atom } from "jotai";

// Derived atom for map state: we only update the map part of the UI state, and we can read it directly without having to deal with the rest of the UI state.
export const mapAtom = atom(
  (get) => get(uiAtom).map,
  (_, set, newMap: UIBlock | undefined) => {
    set(uiAtom, (prev) => ({ ...prev, map: newMap }));
  },
);
