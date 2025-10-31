import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

export const LocationPicker = ({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const getCenter = (): [number, number] => [latitude || 10, longitude || -66];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: getCenter(),
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Initialize marker if we already have coords
    if (latitude !== 0 && longitude !== 0) {
      markerRef.current = L.marker([latitude, longitude]).addTo(map);
    }

    // Map click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      onLocationChange(lat, lng);
    });

    // Try geolocation if empty
    if (latitude === 0 && longitude === 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 13);
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(map);
          } else {
            markerRef.current.setLatLng([lat, lng]);
          }
          onLocationChange(lat, lng);
        },
        () => {
          // Silent fallback
        }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Keep marker/view in sync when props change
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const center = getCenter();
    map.setView(center, map.getZoom());

    if (latitude !== 0 && longitude !== 0) {
      if (!markerRef.current) {
        markerRef.current = L.marker(center).addTo(map);
      } else {
        markerRef.current.setLatLng(center);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-border">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};
