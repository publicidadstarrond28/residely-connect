import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Photo {
  id: string;
  photo_url: string;
  caption?: string;
}

interface PhotoGalleryModalProps {
  photos: Photo[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export const PhotoGalleryModal = ({
  photos,
  isOpen,
  onClose,
  initialIndex = 0,
}: PhotoGalleryModalProps) => {
  if (photos.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 rounded-full bg-background/80 hover:bg-background"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex items-center justify-center h-full p-12">
          <Carousel
            opts={{
              align: "center",
              startIndex: initialIndex,
              loop: true,
            }}
            className="w-full h-full"
          >
            <CarouselContent className="h-full">
              {photos.map((photo, index) => (
                <CarouselItem key={photo.id} className="h-full">
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption || `Foto ${index + 1}`}
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                    {photo.caption && (
                      <p className="text-center text-muted-foreground">
                        {photo.caption}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {index + 1} / {photos.length}
                    </p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {photos.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
};
