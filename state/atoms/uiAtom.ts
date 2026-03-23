import { atom } from "jotai";
import { mapAtom } from "@/state/atoms/mapAtom";
import { planAtom } from "@/state/atoms/planAtom";

export const uiAtom = atom((get) => ({
  map: get(mapAtom),
  plan: get(planAtom),
}));
