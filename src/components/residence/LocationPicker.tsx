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

function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LocationPicker = ({ latitude, longitude, onLocationChange }: LocationPickerProps) => {
  useEffect(() => {
    // Request user's current location if coordinates are at default
    if (latitude === 0 && longitude === 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationChange(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log("Location access denied, using default");
        }
      );
    }
  }, []);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[latitude || 10, longitude || -66]}
        zoom={13}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={onLocationChange} />
        {latitude !== 0 && longitude !== 0 && (
          <Marker position={[latitude, longitude]} />
        )}
      </MapContainer>
    </div>
  );
};
