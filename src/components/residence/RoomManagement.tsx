import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Room {
  id: string;
  room_number: string;
  capacity: number;
  price_per_month: string;
}

interface RoomManagementProps {
  rooms: Room[];
  onChange: (rooms: Room[]) => void;
}

export const RoomManagement = ({ rooms, onChange }: RoomManagementProps) => {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: "",
    capacity: "1",
    price_per_month: "",
  });

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
    };

    onChange([...rooms, room]);
    setNewRoom({ room_number: "", capacity: "1", price_per_month: "" });
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
        <h3 className="text-lg font-semibold">Habitaciones</h3>
        <Button
          type="button"
          onClick={() => setShowAddRoom(!showAddRoom)}
          variant="outline"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Habitación
        </Button>
      </div>

      {showAddRoom && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nueva Habitación</CardTitle>
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

            <div className="flex gap-2">
              <Button type="button" onClick={addRoom} size="sm">
                Agregar
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
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{room.room_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.capacity} {room.capacity === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">${room.price_per_month}</span>
                      <span className="text-muted-foreground">/mes</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeRoom(room.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-sm text-muted-foreground">
            Total: {rooms.length} {rooms.length === 1 ? "habitación" : "habitaciones"}
          </p>
        </div>
      )}
    </div>
  );
};