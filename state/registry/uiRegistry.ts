import { mapAtom } from "@/state/atoms/mapAtom";
// import { chartAtom } from "@/state/chartAtom";
import { UIBlock } from "@/types/ui-schema";

export const uiRegistry = {
  map: mapAtom,
  //   chart: chartAtom,
} satisfies {
  [K in UIBlock["type"]]: any;
};
