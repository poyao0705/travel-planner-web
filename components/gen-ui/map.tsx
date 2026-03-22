import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { mapAtom } from "@/state/mapAtom";
import { useAtomValue } from "jotai";

export function MapComponent() {
  // const mapState = mapAtom((state: UIBlock | undefined) => state);
  const map = useAtomValue(mapAtom);

  if (!map) {
    return null;
  }
  return (
    <Card className="w-full max-w-2xl h-[320px] p-0 overflow-hidden">
      <Map center={map?.center} zoom={map?.zoom}>
        <MapControls />
      </Map>
    </Card>
  );
}
