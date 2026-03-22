import { UIBlock } from "@/types/ui-schema";
import { atom } from "jotai";
import { mapAtom } from "@/state/atoms/mapAtom";

// export const planAtom = atom<UIBlock | undefined>(undefined);

export const uiAtom = atom((get) => ({
  map: get(mapAtom),
  // plan: get(planAtom),
}));
