import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Users, DollarSign, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";

const ResidenceDetails = () => {
  const { residenceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [residence, setResidence] = useState<any>(null);
  const [applyingRooms, setApplyingRooms] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchResidence = async () => {
      try {
        const { data, error } = await supabase
          .from("residences")
          .select(`
            *,
            profiles:owner_id (
              id,
              full_name,
              email,
              phone
            ),
            residence_photos (
              id,
              photo_url,
              is_primary
            ),
            rooms (
              id,
              room_number,
              capacity,
              current_occupants,
              is_available,
              price_per_month
            ),
            ratings (
              rating,
              comment,
              profiles:user_id (
                full_name
              )
            )
          `)
          .eq("id", residenceId)
          .single();

        if (error) throw error;
        setResidence(data);

        // Check if current user is the owner
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();
          
          if (profile && data.profiles?.id === profile.id) {
            setIsOwner(true);
          }
        }
      } catch (error: any) {
        toast.error("Error al cargar la residencia");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (residenceId) {
      fetchResidence();
    }
  }, [residenceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!residence) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Residencia no encontrada</h1>
            <Button onClick={() => navigate("/")}>Volver al inicio</Button>
          </div>
        </main>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    residence: "Residencia",
    hotel: "Hotel",
    apartment: "Apartamento",
    room: "Habitación",
    studio: "Estudio",
  };

  const genderLabels: Record<string, string> = {
    male: "Solo hombres",
    female: "Solo mujeres",
    mixed: "Sin preferencia",
  };

  const primaryPhoto = residence.residence_photos?.find((p: any) => p.is_primary)?.photo_url;
  const imageUrl = primaryPhoto || "/placeholder.svg";

  const averageRating =
    residence.ratings && residence.ratings.length > 0
      ? residence.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / residence.ratings.length
      : 0;

  const handleApplyRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Debes iniciar sesión para solicitar");
      navigate("/auth");
      return;
    }

    setApplyingRooms(prev => new Set(prev).add(roomId));
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        toast.error("Error al obtener perfil");
        return;
      }

      // Check if already applied to this room
      const { data: existingApplication } = await supabase
        .from("residence_applications")
        .select("id")
        .eq("residence_id", residenceId)
        .eq("applicant_id", profile.id)
        .eq("room_id", roomId)
        .single();

      if (existingApplication) {
        toast.info("Ya has solicitado esta habitación");
        return;
      }

      // Create application
      const { error } = await supabase
        .from("residence_applications")
        .insert({
          residence_id: residenceId,
          applicant_id: profile.id,
          room_id: roomId,
          status: "pending",
        });

      if (error) throw error;

      toast.success("Solicitud enviada exitosamente");
    } catch (error: any) {
      console.error("Error al solicitar:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setApplyingRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete(roomId);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="relative h-96 overflow-hidden rounded-t-lg">
                <img
                  src={imageUrl}
                  alt={residence.title}
                  className="w-full h-full object-cover"
                />
                {residence.status === "occupied" && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
                      Ocupada
                    </Badge>
                  </div>
                )}
                {residence.status === "available" && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-accent-foreground">Disponible</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{residence.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {residence.address}, {residence.city}, {residence.state}
                      </span>
                    </div>
                  </div>
                </div>

                {residence.description && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                    <p className="text-muted-foreground">{residence.description}</p>
                  </div>
                )}

                {residence.amenities && residence.amenities.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Comodidades</h2>
                    <div className="flex flex-wrap gap-2">
                      {residence.amenities.map((amenity: string) => (
                        <Badge key={amenity} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {residence.rooms && residence.rooms.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Habitaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {residence.rooms.map((room: any) => (
                        <Card key={room.id}>
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold">Habitación {room.room_number}</h3>
                              <Badge variant={room.is_available ? "default" : "secondary"}>
                                {room.is_available ? "Disponible" : "Ocupada"}
                              </Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>
                                  {room.current_occupants}/{room.capacity} personas
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-primary font-semibold">
                                <DollarSign className="h-4 w-4" />
                                <span>{room.price_per_month}/mes</span>
                              </div>
                            </div>
                            {room.is_available && !isOwner && (
                              <Button
                                size="sm"
                                onClick={(e) => handleApplyRoom(room.id, e)}
                                disabled={applyingRooms.has(room.id)}
                                className="w-full"
                              >
                                {applyingRooms.has(room.id) ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Solicitar
                                  </>
                                )}
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <DollarSign className="h-6 w-6 text-primary" />
                    <span className="text-3xl font-bold text-primary">
                      {residence.price_per_month.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{typeLabels[residence.residence_type]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Género:</span>
                    <span className="font-medium">{genderLabels[residence.gender_preference]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacidad:</span>
                    <span className="font-medium">
                      {residence.current_occupants}/{residence.capacity}
                    </span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Calificación:</span>
                      <span className="font-medium">⭐ {averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" onClick={() => navigate(`/chat/${residence.id}`)}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Ir al Chat
                </Button>
              </CardContent>
            </Card>

            {residence.profiles && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Contacto del dueño</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nombre:</span>
                      <p className="font-medium">{residence.profiles.full_name}</p>
                    </div>
                    {residence.profiles.email && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{residence.profiles.email}</p>
                      </div>
                    )}
                    {residence.profiles.phone && (
                      <div>
                        <span className="text-muted-foreground">Teléfono:</span>
                        <p className="font-medium">{residence.profiles.phone}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResidenceDetails;
