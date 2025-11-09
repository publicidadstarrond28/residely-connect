import { useEffect, useRef, useCallback } from "react";
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
  const isInitializedRef = useRef(false);
  const lastCoordsRef = useRef({ lat: latitude, lng: longitude });

  // Memoize the location change handler to prevent unnecessary re-renders
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    // Only call if coordinates actually changed
    if (lastCoordsRef.current.lat !== lat || lastCoordsRef.current.lng !== lng) {
      lastCoordsRef.current = { lat, lng };
      onLocationChange(lat, lng);
    }
  }, [onLocationChange]);

  const getCenter = useCallback((): [number, number] => {
    return [latitude || 10, longitude || -66];
  }, [latitude, longitude]);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || isInitializedRef.current) return;
    isInitializedRef.current = true;

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
      lastCoordsRef.current = { lat: latitude, lng: longitude };
    }

    // Map click handler - wrapped to prevent form reset
    map.on("click", (e: L.LeafletMouseEvent) => {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      
      const { lat, lng } = e.latlng;
      if (!markerRef.current) {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      } else {
        markerRef.current.setLatLng([lat, lng]);
      }
      handleLocationChange(lat, lng);
    });

    // Try geolocation only once on initial mount if coords are empty
    if (latitude === 0 && longitude === 0 && navigator.geolocation) {
      let hasSetLocation = false;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (hasSetLocation || !mapRef.current) return;
          hasSetLocation = true;
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          mapRef.current.setView([lat, lng], 13);
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
          }
          handleLocationChange(lat, lng);
        },
        () => {
          // Silent fallback
        }
      );
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []);

  // Update marker position when coordinates change externally (but don't recreate map)
  useEffect(() => {
    if (!mapRef.current || !isInitializedRef.current) return;
    
    // Only update if coordinates actually changed significantly
    const hasChanged = 
      Math.abs(lastCoordsRef.current.lat - latitude) > 0.0001 ||
      Math.abs(lastCoordsRef.current.lng - longitude) > 0.0001;
    
    if (hasChanged && latitude !== 0 && longitude !== 0) {
      const newCenter: [number, number] = [latitude, longitude];
      
      if (!markerRef.current) {
        markerRef.current = L.marker(newCenter).addTo(mapRef.current);
      } else {
        markerRef.current.setLatLng(newCenter);
      }
      
      // Only pan to new location if it's significantly different
      const currentCenter = mapRef.current.getCenter();
      const distance = Math.sqrt(
        Math.pow(currentCenter.lat - latitude, 2) + 
        Math.pow(currentCenter.lng - longitude, 2)
      );
      
      if (distance > 0.01) {
        mapRef.current.setView(newCenter, mapRef.current.getZoom(), {
          animate: true,
        });
      }
      
      lastCoordsRef.current = { lat: latitude, lng: longitude };
    }
  }, [latitude, longitude]);

  return (
    <div className="relative h-[400px] w-full rounded-lg overflow-hidden border border-border">
      <div ref={mapContainerRef} className="h-full w-full relative z-0" />
    </div>
  );
};
