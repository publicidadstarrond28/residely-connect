import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface PhotoUploadProps {
  photos: Array<{ file: File; preview: string; isPrimary: boolean }>;
  onChange: (photos: Array<{ file: File; preview: string; isPrimary: boolean }>) => void;
}

export const PhotoUpload = ({ photos, onChange }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validar tamaño (máximo 5MB por foto)
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error("Algunas fotos superan el tamaño máximo de 5MB");
      return;
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidTypes = files.filter(file => !validTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }

    const newPhotos = files.map((file, index) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: photos.length === 0 && index === 0, // Primera foto es principal
    }));

    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);

    // Si eliminamos la foto principal y quedan fotos, hacer la primera como principal
    if (newPhotos.length > 0 && !newPhotos.some(p => p.isPrimary)) {
      newPhotos[0].isPrimary = true;
    }

    onChange(newPhotos);
  };

  const setPrimaryPhoto = (index: number) => {
    const newPhotos = photos.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="photos">Fotos de la Residencia</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Agrega fotos de tu residencia (máximo 5MB por foto)
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <div className="aspect-square relative">
              <img
                src={photo.preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimaryPhoto(index)}
                  disabled={photo.isPrimary}
                >
                  {photo.isPrimary ? "Principal" : "Hacer Principal"}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {photo.isPrimary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                  Principal
                </div>
              )}
            </div>
          </Card>
        ))}

        <label
          htmlFor="photo-upload"
          className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center px-2">
                Agregar fotos
              </span>
            </>
          )}
        </label>
      </div>

      {photos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No has agregado fotos aún. La primera foto que agregues será la principal.
        </p>
      )}
    </div>
  );
};
