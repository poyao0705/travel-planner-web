export type UIBlock = {
  type: "map";
  center: [number, number];
  zoom: number;
  markers?: { position: [number, number]; label?: string }[];
};
