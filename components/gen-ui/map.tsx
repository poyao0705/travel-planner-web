import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

export function MapComponent() {
  return (
    <Card className="w-full max-w-2xl h-[320px] p-0 overflow-hidden">
      <Map center={[-74.006, 40.7128]} zoom={11}>
        <MapControls />
      </Map>
    </Card>
  );
}
