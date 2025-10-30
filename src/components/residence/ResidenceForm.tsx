import { useState } from "react";
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
import { Loader2, Plus, X } from "lucide-react";

export const ResidenceForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "",
    latitude: 0,
    longitude: 0,
    price_per_month: "",
    capacity: "1",
    residence_type: "apartment" as const,
    gender_preference: "mixed" as const,
    amenities: [] as string[],
  });
  const [newAmenity, setNewAmenity] = useState("");

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
        throw new Error("Solo los dueños pueden crear residencias");
      }

      // Create residence
      const { data: residence, error } = await supabase
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
          price_per_month: parseFloat(formData.price_per_month),
          capacity: parseInt(formData.capacity),
          residence_type: formData.residence_type,
          gender_preference: formData.gender_preference,
          amenities: formData.amenities,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("¡Residencia creada exitosamente!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Error al crear la residencia");
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Crear Nueva Residencia</CardTitle>
        <CardDescription>
          Completa los detalles de tu residencia para publicarla
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
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle y número"
                  required
                />
              </div>

              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ciudad"
                  required
                />
              </div>

              <div>
                <Label htmlFor="state">Estado/Provincia *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Estado"
                  required
                />
              </div>

              <div>
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="País"
                  required
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
                onLocationChange={(lat, lng) => {
                  setFormData({ ...formData, latitude: lat, longitude: lng });
                }}
              />
              {formData.latitude !== 0 && formData.longitude !== 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Coordenadas: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio mensual (USD) *</Label>
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
                <Label htmlFor="capacity">Capacidad *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>

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
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="room">Habitación</SelectItem>
                    <SelectItem value="studio">Estudio</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="mixed">Sin preferencia</SelectItem>
                    <SelectItem value="male">Solo hombres</SelectItem>
                    <SelectItem value="female">Solo mujeres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

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
                  Creando...
                </>
              ) : (
                "Crear Residencia"
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
