import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ 
  position, 
  onLocationChange 
}: { 
  position: [number, number]; 
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position[0] !== 0 && position[1] !== 0 ? <Marker position={position} /> : null;
}

export const LocationPicker = ({ latitude, longitude, onLocationChange }: LocationPickerProps) => {
  const defaultCenter: [number, number] = [10, -66];
  const position: [number, number] = [latitude || defaultCenter[0], longitude || defaultCenter[1]];

  useEffect(() => {
    if (latitude === 0 && longitude === 0) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onLocationChange(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          console.log("Location access denied");
        }
      );
    }
  }, [latitude, longitude, onLocationChange]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        key={`${latitude}-${longitude}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={[latitude, longitude]} onLocationChange={onLocationChange} />
      </MapContainer>
    </div>
  );
};
