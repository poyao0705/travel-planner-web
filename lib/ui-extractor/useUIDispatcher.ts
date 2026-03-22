import { useSetAtom } from "jotai";
import { uiRegistry } from "./uiRegistry";
import { UIBlock } from "@/types/ui-schema";

export function useUIDispatcher() {
  // build setters dynamically
  const setters = Object.fromEntries(
    Object.entries(uiRegistry).map(([key, atom]) => [key, useSetAtom(atom)]),
  ) as {
    [K in UIBlock["type"]]: (ui: Extract<UIBlock, { type: K }>) => void;
  };

  return (ui: UIBlock) => {
    const handler = setters[ui.type];

    if (!handler) {
      console.warn("No handler for UI type:", ui.type);
      return;
    }

    handler(ui as any); // safe due to typing above
  };
}
