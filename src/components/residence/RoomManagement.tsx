import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RoomPhotoUpload } from "./RoomPhotoUpload";

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  price_per_month: string;
  gender_preference?: string;
  photos?: Array<{ file: File; preview: string; isPrimary: boolean }>;
}

interface RoomManagementProps {
  rooms: Room[];
  onChange: (rooms: Room[]) => void;
  residenceType: 'apartment' | 'house' | 'room' | 'hotel';
}

export const RoomManagement = ({ rooms, onChange, residenceType }: RoomManagementProps) => {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    capacity: "1",
    price_per_month: "",
    gender_preference: "mixed",
    photos: [] as Array<{ file: File; preview: string; isPrimary: boolean }>,
  });

  const needsRoomDetails = residenceType === 'house' || residenceType === 'hotel';
  const isSingleRoom = residenceType === 'room';

  const addRoom = () => {
    if (!newRoom.room_number || !newRoom.price_per_month) {
      toast.error("Complete todos los campos de la habitación");
      return;
    }

    const room: Room = {
      id: crypto.randomUUID(),
      room_number: newRoom.room_number,
      capacity: parseInt(newRoom.capacity),
      price_per_month: newRoom.price_per_month,
      gender_preference: needsRoomDetails || isSingleRoom ? newRoom.gender_preference : undefined,
      photos: needsRoomDetails || isSingleRoom ? newRoom.photos : undefined,
    };

    onChange([...rooms, room]);
    setNewRoom({ 
      room_number: "", 
      capacity: "1", 
      price_per_month: "",
      gender_preference: "mixed",
      photos: [],
    });
    setShowAddRoom(false);
    toast.success("Habitación agregada");
  };

  const removeRoom = (id: string) => {
    onChange(rooms.filter((r) => r.id !== id));
    toast.success("Habitación eliminada");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {needsRoomDetails ? 'Habitaciones' : isSingleRoom ? 'Detalles de la Habitación' : 'Habitaciones'}
        </h3>
        {!isSingleRoom && (
          <Button
            type="button"
            onClick={() => setShowAddRoom(!showAddRoom)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Habitación
          </Button>
        )}
      </div>
      
      {isSingleRoom && rooms.length === 0 && (
        <Button
          type="button"
          onClick={() => setShowAddRoom(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Configurar Habitación
        </Button>
      )}

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isSingleRoom ? 'Configurar Habitación' : 'Nueva Habitación'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="room_number">Número/Nombre *</Label>
                <Input
                  id="room_number"
                  value={newRoom.room_number}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, room_number: e.target.value })
                  }
                  placeholder="Ej: 101, A, Azul"
                />
              </div>

              <div>
                <Label htmlFor="capacity">Capacidad *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={newRoom.capacity}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, capacity: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="room_price">Precio Mensual (USD) *</Label>
                <Input
                  id="room_price"
                  type="number"
                  step="0.01"
                  value={newRoom.price_per_month}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, price_per_month: e.target.value })
                  }
                  placeholder="300.00"
                />
              </div>
            </div>

            {(needsRoomDetails || isSingleRoom) && (
              <>
                <div>
                  <Label htmlFor="gender">Preferencia de Género *</Label>
                  <Select
                    value={newRoom.gender_preference}
                    onValueChange={(value) => setNewRoom({ ...newRoom, gender_preference: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Sin preferencia</SelectItem>
                      <SelectItem value="male">Solo hombres</SelectItem>
                      <SelectItem value="female">Solo mujeres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fotos de la Habitación</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Agrega fotos específicas de esta habitación
                  </p>
                  <RoomPhotoUpload
                    photos={newRoom.photos}
                    onChange={(photos) => setNewRoom({ ...newRoom, photos })}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="button" onClick={addRoom} size="sm">
                {isSingleRoom ? 'Guardar' : 'Agregar'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowAddRoom(false)}
                variant="outline"
                size="sm"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rooms.length > 0 && (
        <div className="space-y-2">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{room.room_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {room.capacity} {room.capacity === 1 ? "persona" : "personas"}
                          {room.gender_preference && ` · ${
                            room.gender_preference === 'mixed' ? 'Sin preferencia' :
                            room.gender_preference === 'male' ? 'Solo hombres' :
                            'Solo mujeres'
                          }`}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold">${room.price_per_month}</span>
                        <span className="text-muted-foreground">/mes</span>
                      </div>
                    </div>
                    {room.photos && room.photos.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {room.photos.slice(0, 3).map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo.preview}
                            alt={`Foto ${idx + 1}`}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ))}
                        {room.photos.length > 3 && (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-xs">
                            +{room.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {!isSingleRoom && (
                    <Button
                      type="button"
                      onClick={() => removeRoom(room.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!isSingleRoom && (
            <p className="text-sm text-muted-foreground">
              Total: {rooms.length} {rooms.length === 1 ? "habitación" : "habitaciones"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};