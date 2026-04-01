// import {
//   Map,
//   MapMarker,
//   MapPopup,
//   MapTileLayer,
//   MapZoomControl,
// } from "@/components/ui/map";

// import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";
import { mapAtom } from "@/state/atoms/mapAtom";
import { useAtomValue } from "jotai";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

export function MapComponent() {
  // const mapState = mapAtom((state: UIBlock | undefined) => state);
  const map = useAtomValue(mapAtom);

  // if (!map) {
  //   return null;
  // }
  return (
    <Card className="w-full max-w-2xl h-[320px] p-0 overflow-hidden">
      {/* <Map center={map?.center} zoom={map?.zoom}>
        <MapTileLayer />
        <MapZoomControl />
      </Map> */}
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultZoom={3}
          defaultCenter={{ lat: 22.54992, lng: 0 }}
          gestureHandling={"greedy"}
          disableDefaultUI={true}
        />
      </APIProvider>
    </Card>
  );
}
