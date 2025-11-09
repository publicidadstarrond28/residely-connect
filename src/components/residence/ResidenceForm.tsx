import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LocationPicker } from "./LocationPicker";
import { RoomManagement } from "./RoomManagement";
import { AreaManagement } from "./AreaManagement";
import { Loader2, Plus, X } from "lucide-react";
import { getCountries, getStatesByCountry, getCitiesByState } from "@/data/locations";

interface ResidenceFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export const ResidenceForm = ({ initialData, isEdit = false }: ResidenceFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "",
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    price_per_month: initialData?.price_per_month?.toString() || "",
    capacity: initialData?.capacity?.toString() || "1",
    residence_type: initialData?.residence_type || ("apartment" as const),
    gender_preference: initialData?.gender_preference || ("mixed" as const),
    amenities: initialData?.amenities || ([] as string[]),
  });
  const [rooms, setRooms] = useState<any[]>(initialData?.rooms || []);
  const [areas, setAreas] = useState<any[]>(initialData?.residence_areas || []);
  const [newAmenity, setNewAmenity] = useState("");

  // Location cascade state
  const [countries] = useState<string[]>(getCountries());
  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const availableStates = getStatesByCountry(formData.country);
      setStates(availableStates);
      // Reset state and city if country changed
      if (!availableStates.includes(formData.state)) {
        setFormData(prev => ({ ...prev, state: "", city: "" }));
        setCities([]);
      }
    } else {
      setStates([]);
      setCities([]);
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const availableCities = getCitiesByState(formData.country, formData.state);
      setCities(availableCities);
      // Reset city if state changed
      if (!availableCities.includes(formData.city)) {
        setFormData(prev => ({ ...prev, city: "" }));
      }
    } else {
      setCities([]);
    }
  }, [formData.country, formData.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

      if (!profile || profile.role !== "owner") {
        throw new Error("Solo los dueños pueden crear/editar residencias");
      }

      // Validación según tipo de residencia
      if (formData.residence_type === 'apartment') {
        if (areas.length === 0) {
          throw new Error("Debes agregar al menos un área al apartamento");
        }
      } else {
        if (rooms.length === 0) {
          throw new Error("Debes agregar al menos una habitación");
        }
        // Validar que para tipos que no sean apartamento, el precio sea en las habitaciones
        if (rooms.some(r => !r.price_per_month)) {
          throw new Error("Todas las habitaciones deben tener un precio");
        }
      }

      let residence;
      
      if (isEdit && initialData) {
        // Update residence
        const { data: updatedResidence, error } = await supabase
          .from("residences")
          .update({
            title: formData.title,
            description: formData.description,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            latitude: formData.latitude,
            longitude: formData.longitude,
            price_per_month: formData.residence_type === 'apartment' 
              ? parseFloat(formData.price_per_month) 
              : 0,
            capacity: formData.residence_type === 'apartment' 
              ? parseInt(formData.capacity) 
              : rooms.reduce((sum, room) => sum + room.capacity, 0),
            residence_type: formData.residence_type,
            gender_preference: formData.residence_type === 'apartment' 
              ? formData.gender_preference 
              : 'mixed',
            amenities: formData.amenities,
          })
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) throw error;
        residence = updatedResidence;

        // Delete existing rooms and areas to recreate them
        if (formData.residence_type !== 'apartment') {
          await supabase.from("rooms").delete().eq("residence_id", initialData.id);
        }
        if (formData.residence_type === 'apartment') {
          await supabase.from("residence_areas").delete().eq("residence_id", initialData.id);
        }
      } else {
        // Create residence
        const { data: newResidence, error } = await supabase
          .from("residences")
          .insert({
          owner_id: profile.id,
          title: formData.title,
          description: formData.description,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          latitude: formData.latitude,
          longitude: formData.longitude,
          // Solo usar precio de residencia para apartamentos
          price_per_month: formData.residence_type === 'apartment' 
            ? parseFloat(formData.price_per_month) 
            : 0,
          // Solo usar capacidad para apartamentos
          capacity: formData.residence_type === 'apartment' 
            ? parseInt(formData.capacity) 
            : rooms.reduce((sum, room) => sum + room.capacity, 0),
          residence_type: formData.residence_type,
          // Solo usar género de residencia para apartamentos
          gender_preference: formData.residence_type === 'apartment' 
            ? formData.gender_preference 
            : 'mixed',
            amenities: formData.amenities,
          })
          .select()
          .single();

        if (error) throw error;
        residence = newResidence;
      }

      // Create rooms (for non-apartment types)
      if (formData.residence_type !== 'apartment' && rooms.length > 0) {
        const roomsToInsert = rooms.map((room) => ({
          residence_id: residence.id,
          room_number: room.room_number,
          capacity: room.capacity,
          price_per_month: parseFloat(room.price_per_month),
          gender_preference: room.gender_preference || 'mixed',
        }));

        const { error: roomsError } = await supabase
          .from("rooms")
          .insert(roomsToInsert);

        if (roomsError) throw roomsError;
      }

      // Create areas (for apartments)
      if (formData.residence_type === 'apartment' && areas.length > 0) {
        for (const area of areas) {
          // Insert area
          const { data: areaData, error: areaError } = await supabase
            .from("residence_areas")
            .insert({
              residence_id: residence.id,
              area_type: area.area_type,
              area_name: area.area_name,
            })
            .select()
            .single();

          if (areaError) throw areaError;

          // Upload area photos
          if (area.photos && area.photos.length > 0) {
            for (const photo of area.photos) {
              const fileExt = photo.file.name.split('.').pop();
              const fileName = `${Math.random()}.${fileExt}`;
              const filePath = `${residence.id}/${areaData.id}/${fileName}`;

              const { error: uploadError } = await supabase.storage
                .from('residence-photos')
                .upload(filePath, photo.file);

              if (uploadError) throw uploadError;

              const { data: { publicUrl } } = supabase.storage
                .from('residence-photos')
                .getPublicUrl(filePath);

              const { error: photoError } = await supabase
                .from('area_photos')
                .insert({
                  area_id: areaData.id,
                  photo_url: publicUrl,
                  is_primary: photo.isPrimary,
                });

              if (photoError) throw photoError;
            }
          }
        }
      }

      // Upload room photos (for non-apartment types)
      if (formData.residence_type !== 'apartment' && rooms.length > 0) {
        // Get the created rooms to match with photos
        const { data: createdRooms } = await supabase
          .from('rooms')
          .select('id, room_number')
          .eq('residence_id', residence.id);

        if (createdRooms) {
          for (let i = 0; i < rooms.length; i++) {
            const room = rooms[i];
            const createdRoom = createdRooms.find(r => r.room_number === room.room_number);
            
            if (createdRoom && room.photos && room.photos.length > 0) {
              for (const photo of room.photos) {
                const fileExt = photo.file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${residence.id}/rooms/${createdRoom.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                  .from('residence-photos')
                  .upload(filePath, photo.file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                  .from('residence-photos')
                  .getPublicUrl(filePath);

                const { error: photoError } = await supabase
                  .from('room_photos')
                  .insert({
                    room_id: createdRoom.id,
                    photo_url: publicUrl,
                    is_primary: photo.isPrimary,
                  });

                if (photoError) throw photoError;
              }
            }
          }
        }
      }

      toast.success(isEdit ? "¡Residencia actualizada exitosamente!" : "¡Residencia creada exitosamente!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || (isEdit ? "Error al actualizar la residencia" : "Error al crear la residencia"));
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      });
      setNewAmenity("");
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((a) => a !== amenity),
    });
  };

  // Memoize location change handler to prevent unnecessary re-renders
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Residencia" : "Crear Nueva Residencia"}</CardTitle>
        <CardDescription>
          {isEdit ? "Actualiza los detalles de tu residencia" : "Completa los detalles de tu residencia para publicarla"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Apartamento céntrico cerca de la universidad"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe tu residencia..."
                rows={4}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ubicación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">País *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="state">Estado/Provincia *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                  disabled={!formData.country}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder={formData.country ? "Selecciona un estado" : "Primero selecciona un país"} />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  disabled={!formData.state}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={formData.state ? "Selecciona una ciudad" : "Primero selecciona un estado"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="address">Dirección Específica *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle, avenida, edificio, número"
                  required
                  disabled={!formData.city}
                />
              </div>
            </div>

            <div>
              <Label>Ubicación en el mapa (haz clic para seleccionar) *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Haz clic en el mapa para establecer la ubicación exacta
              </p>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleLocationChange}
              />
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Tipo de Residencia primero */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tipo de Propiedad</h3>
            <div>
              <Label htmlFor="type">Tipo de Residencia *</Label>
              <Select
                value={formData.residence_type}
                onValueChange={(value: any) => setFormData({ ...formData, residence_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Apartamento</SelectItem>
                  <SelectItem value="house">Casa por Habitación</SelectItem>
                  <SelectItem value="room">Habitación</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datos Generales del Apartamento */}
          {formData.residence_type === 'apartment' && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <h3 className="text-lg font-semibold">1. Datos Generales del Apartamento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Define los datos principales del apartamento completo
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Precio por Mes (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price_per_month}
                    onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                    placeholder="300.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Cantidad de Personas *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="4"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Preferencia de Género *</Label>
                  <Select
                    value={formData.gender_preference}
                    onValueChange={(value: any) => setFormData({ ...formData, gender_preference: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixto</SelectItem>
                      <SelectItem value="female">Solo Mujeres</SelectItem>
                      <SelectItem value="male">Solo Hombres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Gestión de Áreas para Apartamentos */}
          {formData.residence_type === 'apartment' && (
            <div className="border-t pt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">2. Gestión de Áreas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Añade las áreas específicas del apartamento con sus respectivas galerías de imágenes
                </p>
              </div>
              <AreaManagement areas={areas} onChange={setAreas} />
            </div>
          )}

          {/* Rooms - Para otros tipos */}
          {formData.residence_type !== 'apartment' && (
            <RoomManagement 
              rooms={rooms} 
              onChange={setRooms}
              residenceType={formData.residence_type}
            />
          )}

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comodidades</h3>
            
            <div className="flex gap-2">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Agregar comodidad (ej: WiFi, Estacionamiento...)"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
                  >
                    <span className="text-sm">{amenity}</span>
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading || formData.latitude === 0} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                isEdit ? "Actualizar Residencia" : "Crear Residencia"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
