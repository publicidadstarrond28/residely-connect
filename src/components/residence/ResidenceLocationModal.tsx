import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface ResidenceLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  residenceName: string;
  latitude: number;
  longitude: number;
}

export const ResidenceLocationModal = ({
  open,
  onOpenChange,
  residenceName,
  latitude,
  longitude,
}: ResidenceLocationModalProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    // Wait a bit for the dialog animation to complete
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Initialize map
      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);
      mapRef.current = map;

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Create custom icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div class="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-background">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      // Add marker
      L.marker([latitude, longitude], { icon }).addTo(map);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [open, latitude, longitude]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Ubicación de {residenceName}
          </DialogTitle>
        </DialogHeader>
        <div ref={mapContainerRef} className="w-full h-[500px] rounded-lg overflow-hidden" />
      </DialogContent>
    </Dialog>
  );
};
