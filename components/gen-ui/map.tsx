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
import { APIProvider, Map, Marker, useMap } from "@vis.gl/react-google-maps";
import { useEffect } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

// TODO: tests
const markers = [
  { lat: -33.8688, lng: 151.2093 }, // Sydney CBD
  { lat: -33.8731, lng: 151.2065 }, // Town Hall
  { lat: -33.8568, lng: 151.2153 }, // Opera House
  { lat: -33.8523, lng: 151.2108 }, // Circular Quay
  { lat: -33.8908, lng: 151.2743 }, // Bondi Beach
  { lat: -33.9173, lng: 151.2313 }, // UNSW
  { lat: -33.8737, lng: 151.268 }, // Centennial Park
];
function MapController() {
  const map = useMap();
  useEffect(() => {
    if (!map || markers.length === 0) return;

    if (markers.length === 1) {
      map.setCenter(markers[0]);
      map.setZoom(14); // reasonable default
      return;
    }

    const bounds = new google.maps.LatLngBounds();

    markers.forEach((marker) => {
      bounds.extend(marker);
    });

    map.fitBounds(bounds);
  }, [map]);

  return null;
}

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
          disableDefaultUI={false}
        >
          <MapController />
          {markers.map((position, i) => (
            <Marker key={i} position={position} />
          ))}
        </Map>
      </APIProvider>
    </Card>
  );
}
