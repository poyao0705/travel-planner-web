import { LatLngExpression } from "leaflet";

export type UIBlock = {
  type: "map";
  center: LatLngExpression;
  zoom: number;
  markers?: { position: LatLngExpression; label?: string }[];
};
