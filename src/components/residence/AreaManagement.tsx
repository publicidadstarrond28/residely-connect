import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { AreaPhotoUpload } from "./AreaPhotoUpload";

export interface Area {
  area_type: string;
  area_name: string;
  photos: Array<{ file: File; preview: string; isPrimary: boolean }>;
}

interface AreaManagementProps {
  areas: Area[];
  onChange: (areas: Area[]) => void;
}

export const AreaManagement = ({ areas, onChange }: AreaManagementProps) => {
  const [newArea, setNewArea] = useState<Area>({
    area_type: "",
    area_name: "",
    photos: [],
  });

  const addArea = () => {
    if (!newArea.area_type) return;

    onChange([...areas, { ...newArea }]);
    setNewArea({
      area_type: "",
      area_name: "",
      photos: [],
    });
  };

  const removeArea = (index: number) => {
    onChange(areas.filter((_, i) => i !== index));
  };

  const areaTypeLabels: Record<string, string> = {
    sala: "Sala",
    cocina: "Cocina",
    baño: "Baño",
    habitacion: "Habitación",
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Gestión de Áreas del Apartamento</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Define las diferentes áreas que componen tu apartamento con sus respectivas galerías de imágenes
        </p>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">Añadir Nueva Área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="area-type">Tipo de Área *</Label>
                <Select
                  value={newArea.area_type}
                  onValueChange={(value) => setNewArea({ ...newArea, area_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sala">Sala</SelectItem>
                    <SelectItem value="cocina">Cocina</SelectItem>
                    <SelectItem value="baño">Baño</SelectItem>
                    <SelectItem value="habitacion">Habitación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="area-name">Nombre del Área (Opcional)</Label>
                <Input
                  id="area-name"
                  value={newArea.area_name}
                  onChange={(e) => setNewArea({ ...newArea, area_name: e.target.value })}
                  placeholder="Ej: Habitación principal, Baño de visitas"
                />
              </div>
            </div>

            <AreaPhotoUpload
              photos={newArea.photos}
              onChange={(photos) => setNewArea({ ...newArea, photos })}
              areaIndex={-1}
            />

            <Button
              type="button"
              onClick={addArea}
              disabled={!newArea.area_type}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Área
            </Button>
          </CardContent>
        </Card>
      </div>

      {areas.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Áreas Agregadas ({areas.length})</h4>
          {areas.map((area, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-medium">
                      {areaTypeLabels[area.area_type] || area.area_type}
                      {area.area_name && ` - ${area.area_name}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {area.photos.length} foto{area.photos.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArea(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {area.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {area.photos.slice(0, 3).map((photo, photoIndex) => (
                      <img
                        key={photoIndex}
                        src={photo.preview}
                        alt={`${area.area_type} ${photoIndex + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                    {area.photos.length > 3 && (
                      <div className="flex items-center justify-center bg-muted rounded text-sm text-muted-foreground">
                        +{area.photos.length - 3} más
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
