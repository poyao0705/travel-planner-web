import { mapAtom } from "@/state/atoms/mapAtom";
import { planAtom } from "@/state/atoms/planAtom";
import { UIBlock } from "@/types/ui-schema";

export const uiRegistry = {
  map: mapAtom,
  plan: planAtom,
} satisfies {
  [K in UIBlock["type"]]: any;
};
