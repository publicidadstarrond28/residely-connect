import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AreaPhoto {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface AreaPhotoUploadProps {
  photos: AreaPhoto[];
  onChange: (photos: AreaPhoto[]) => void;
  areaIndex: number;
}

export const AreaPhotoUpload = ({ photos, onChange, areaIndex }: AreaPhotoUploadProps) => {
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: photos.length === 0,
    }));
    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    if (newPhotos.length > 0 && photos[index].isPrimary) {
      newPhotos[0].isPrimary = true;
    }
    onChange(newPhotos);
  };

  const setPrimary = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Fotos del Área</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Sube imágenes específicas de esta área
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoSelect}
          className="hidden"
          id={`area-photo-upload-${areaIndex}`}
        />
        <label htmlFor={`area-photo-upload-${areaIndex}`}>
          <Button type="button" variant="outline" className="w-full" asChild>
            <span>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Fotos
            </span>
          </Button>
        </label>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.preview}
                alt={`Vista previa ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
              {photo.isPrimary && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                  Principal
                </div>
              )}
              {!photo.isPrimary && (
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  className="absolute bottom-2 left-2 px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Marcar como principal
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
