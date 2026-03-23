import { z } from "zod";

export const LatLngTupleSchema = z.tuple([z.number(), z.number()]);

export const MapMarkerSchema = z.object({
  position: LatLngTupleSchema,
  label: z.string().optional(),
});

export const MapBlockSchema = z.object({
  type: z.literal("map"),
  center: LatLngTupleSchema,
  zoom: z.number(),
  markers: z.array(MapMarkerSchema).optional(),
});

export const PlanBlockSchema = z.object({
  type: z.literal("plan"),
  data: z.unknown(),
});

export const UIBlockSchema = z.discriminatedUnion("type", [
  MapBlockSchema,
  PlanBlockSchema,
]);

export type LatLngTuple = z.infer<typeof LatLngTupleSchema>;
export type MapMarker = z.infer<typeof MapMarkerSchema>;
export type MapBlock = z.infer<typeof MapBlockSchema>;
export type PlanBlock = z.infer<typeof PlanBlockSchema>;
export type UIBlock = z.infer<typeof UIBlockSchema>;
