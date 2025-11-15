import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface RoomPhotoUploadProps {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

export const RoomPhotoUpload = ({ photos, onChange, maxPhotos = 5 }: RoomPhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      toast.error(`Máximo ${maxPhotos} fotos por habitación`);
      e.target.value = '';
      return;
    }

    setUploading(true);

    try {
      // Validar tamaño (máximo 5MB por foto)
      const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error("Algunas fotos superan el tamaño máximo de 5MB");
        e.target.value = '';
        return;
      }

      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      const invalidTypes = files.filter(file => !validTypes.includes(file.type));
      if (invalidTypes.length > 0) {
        toast.error("Solo se permiten imágenes JPG, PNG o WEBP");
        e.target.value = '';
        return;
      }

      const newPhotos = files.map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        isPrimary: photos.length === 0 && index === 0,
      }));

      onChange([...photos, ...newPhotos]);
      toast.success(`${files.length} ${files.length === 1 ? 'foto agregada' : 'fotos agregadas'}`);
      e.target.value = '';
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].preview);
    newPhotos.splice(index, 1);

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
    <div className="space-y-2">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <div className="aspect-square relative">
              <img
                src={photo.preview}
                alt={`Foto ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setPrimaryPhoto(index)}
                  disabled={photo.isPrimary}
                  className="text-xs px-2 py-1 h-auto"
                >
                  {photo.isPrimary ? "Principal" : "Marcar Principal"}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                  className="h-7 w-7"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {photo.isPrimary && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                  ⭐ Principal
                </div>
              )}
            </div>
          </Card>
        ))}

        {photos.length < maxPhotos && (
          <label
            className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 hover:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ pointerEvents: uploading ? 'none' : 'auto' }}
          >
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Cargando...
                </span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground text-center px-2 font-medium">
                  Agregar Fotos
                </span>
                <span className="text-xs text-muted-foreground/70 text-center px-2 mt-1">
                  {photos.length}/{maxPhotos}
                </span>
              </>
            )}
          </label>
        )}
      </div>
      {photos.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Las fotos se subirán cuando guardes la residencia. Click en una foto para marcarla como principal.
        </p>
      )}
    </div>
  );
};