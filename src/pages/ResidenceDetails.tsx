import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Users, DollarSign, MessageCircle, ArrowLeft, Send, CheckCircle, XCircle, Clock, CreditCard, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useRoomApplicationStatus } from "@/hooks/useRoomApplicationStatus";
import { PhotoGalleryModal } from "@/components/residence/PhotoGalleryModal";
import { RatingForm } from "@/components/residence/RatingForm";
import { RatingsList } from "@/components/residence/RatingsList";
import { ResidenceLocationModal } from "@/components/residence/ResidenceLocationModal";

const ResidenceDetails = () => {
  const { residenceId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [residence, setResidence] = useState<any>(null);
  const [applyingRooms, setApplyingRooms] = useState<Set<string>>(new Set());
  const [isOwner, setIsOwner] = useState(false);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<Array<{ id: string; photo_url: string; caption?: string }>>([]);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [canRate, setCanRate] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [ratingsData, setRatingsData] = useState<any[]>([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  
  const { applicationStatus } = useRoomApplicationStatus(residenceId, currentProfileId);

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

        // Fetch room photos if residence has rooms
        if (data.rooms && data.rooms.length > 0) {
          const roomIds = data.rooms.map((r: any) => r.id);
          const { data: roomPhotos } = await supabase
            .from('room_photos')
            .select('*')
            .in('room_id', roomIds);

          // Attach photos to each room
          data.rooms = data.rooms.map((room: any) => ({
            ...room,
            photos: roomPhotos?.filter((p: any) => p.room_id === room.id) || []
          }));
        }

        // Fetch areas with photos if residence type is apartment
        if (data.residence_type === 'apartment') {
          const { data: areasData } = await (supabase as any)
            .from('apartment_areas')
            .select(`
              *,
              apartment_area_photos (
                id,
                photo_url,
                is_primary
              )
            `)
            .eq('residence_id', residenceId);

          (data as any).areas = areasData || [];
        }
        console.log(data);
        setResidence(data);
        // Check if current user is the owner
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();
          
          if (profile) {
            setCurrentProfileId(profile.id);
            if (data.profiles?.id === profile.id) {
              setIsOwner(true);
            } else {
              // Check if user has an accepted application for this residence
              const { data: acceptedApp } = await supabase
                .from("residence_applications")
                .select("id")
                .eq("residence_id", residenceId)
                .eq("applicant_id", profile.id)
                .eq("status", "accepted")
                .maybeSingle();

              setCanRate(!!acceptedApp);

              // Check if user has already rated
              const { data: existingRating } = await supabase
                .from("ratings")
                .select("id")
                .eq("residence_id", residenceId)
                .eq("user_id", profile.id)
                .maybeSingle();

              setHasRated(!!existingRating);
            }
          }
        }

        setRatingsData(data.ratings || []);
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

  const primaryPhoto = residence.rooms[0].photos?.find((p: any) => p.is_primary)?.photo_url;
  const imageUrl = primaryPhoto || "/placeholder.svg";

  const averageRating =
    residence.ratings && residence.ratings.length > 0
      ? residence.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / residence.ratings.length
      : 0;

  const openGallery = (photos: Array<{ id: string; photo_url: string; caption?: string }>, index: number = 0) => {
    setGalleryPhotos(photos);
    setGalleryInitialIndex(index);
    setGalleryOpen(true);
  };

  const refreshRatings = async () => {
    const { data } = await supabase
      .from("ratings")
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq("residence_id", residenceId)
      .order("created_at", { ascending: false });

    if (data) {
      setRatingsData(data);
      setHasRated(data.some((r: any) => r.user_id === currentProfileId));
    }
  };

  const handleApplyRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Debes iniciar sesión para solicitar");
      navigate("/auth");
      return;
    }

    // Check if max rejections reached
    const currentApplication = applicationStatus[roomId];
    if (currentApplication?.rejection_count >= 3) {
      toast.error("Has alcanzado el límite de solicitudes para esta habitación");
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

      // Check if there's a rejected application to update
      if (currentApplication && currentApplication.status === "rejected") {
        // Update existing application back to pending
        const { error } = await supabase
          .from("residence_applications")
          .update({ status: "pending" })
          .eq("id", currentApplication.id);

        if (error) throw error;
        toast.success("Solicitud enviada nuevamente");
      } else {
        // Create new application
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
      }
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

  const handleApplyApartment = async () => {
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Debes iniciar sesión para solicitar");
      navigate("/auth");
      return;
    }

    // Check if max rejections reached for apartment application (use 'apartment' as key)
    const currentApplication = applicationStatus['apartment'];
    if (currentApplication?.rejection_count >= 3) {
      toast.error("Has alcanzado el límite de solicitudes para este apartamento");
      return;
    }

    setApplyingRooms(prev => new Set(prev).add('apartment'));
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

      // Check if there's a rejected application to update
      if (currentApplication && currentApplication.status === "rejected") {
        // Update existing application back to pending
        const { error } = await supabase
          .from("residence_applications")
          .update({ status: "pending" })
          .eq("id", currentApplication.id);

        if (error) throw error;
        toast.success("Solicitud enviada nuevamente");
      } else {
        // Create new application (without room_id for apartments)
        const { error } = await supabase
          .from("residence_applications")
          .insert({
            residence_id: residenceId,
            applicant_id: profile.id,
            room_id: null,
            status: "pending",
          });

        if (error) throw error;
        toast.success("Solicitud enviada exitosamente");
      }
    } catch (error: any) {
      console.error("Error al solicitar:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setApplyingRooms(prev => {
        const newSet = new Set(prev);
        newSet.delete('apartment');
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
              <div 
                className="relative h-96 overflow-hidden rounded-t-lg cursor-pointer group"
                /*onClick={() => {
                  const allPhotos = residence.rooms?.map((p: any) => ({
                    id: p.id,
                    photo_url: p.photos[0]?.photo_url,
                    caption: 'Foto de la residencia'
                  })) || [];
                  openGallery(allPhotos, 0);
                  {console.log(residence)}
                }}*/
              >
                <img
                  src={imageUrl}
                  alt={residence.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  {/*<span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg font-semibold">
                    Ver galería ({residence.residence_photos?.length || 1} fotos)
                  </span>*/}
                </div>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocationModalOpen(true)}
                      className="mt-3"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver ubicación en el mapa
                    </Button>
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

                {residence.residence_type === 'apartment' && residence.areas && residence.areas.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Áreas del Apartamento</h2>
                    <div className="grid grid-cols-1 gap-4">
                      {residence.areas.map((area: any) => (
                        <Card key={area.id}>
                          <CardContent className="p-4 space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg capitalize">{area.area_type}</h3>
                              {area.area_name && (
                                <p className="text-sm text-muted-foreground">{area.area_name}</p>
                              )}
                             </div>
                             {area.apartment_area_photos && area.apartment_area_photos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {area.apartment_area_photos.map((photo: any, photoIndex: number) => (
                                  <div 
                                    key={photo.id} 
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                    onClick={() => {
                                      const areaPhotos = area.apartment_area_photos.map((p: any) => ({
                                        id: p.id,
                                        photo_url: p.photo_url,
                                        caption: `${area.area_type}${area.area_name ? ` - ${area.area_name}` : ''}`
                                      }));
                                      openGallery(areaPhotos, photoIndex);
                                    }}
                                  >
                                    <img
                                      src={photo.photo_url}
                                      alt={`${area.area_type} - ${area.area_name || ''}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {photo.is_primary && (
                                      <Badge className="absolute top-2 left-2 text-xs">Principal</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
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
                            {room.photos && room.photos.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                {room.photos.slice(0, 4).map((photo: any, photoIndex: number) => (
                                  <div 
                                    key={photo.id} 
                                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                                    onClick={() => {
                                      const roomPhotos = room.photos.map((p: any) => ({
                                        id: p.id,
                                        photo_url: p.photo_url,
                                        caption: `Habitación ${room.room_number}`
                                      }));
                                      openGallery(roomPhotos, photoIndex);
                                    }}
                                  >
                                    <img
                                      src={photo.photo_url}
                                      alt={`Habitación ${room.room_number}`}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {photo.is_primary && (
                                      <Badge className="absolute top-1 left-1 text-xs">Principal</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
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
                              <div className="space-y-1">
                                <Button
                                  size="sm"
                                  onClick={(e) => handleApplyRoom(room.id, e)}
                                  disabled={
                                    applyingRooms.has(room.id) || 
                                    applicationStatus[room.id]?.status === "pending" ||
                                    applicationStatus[room.id]?.status === "accepted" ||
                                    (applicationStatus[room.id]?.rejection_count >= 3)
                                  }
                                  variant={
                                    applicationStatus[room.id]?.status === "accepted" 
                                      ? "default" 
                                      : applicationStatus[room.id]?.status === "rejected"
                                      ? "destructive"
                                      : applicationStatus[room.id]?.status === "pending"
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="w-full"
                                >
                                  {applyingRooms.has(room.id) ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Enviando...
                                    </>
                                  ) : applicationStatus[room.id]?.status === "accepted" ? (
                                    <>
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Aprobado
                                    </>
                                  ) : applicationStatus[room.id]?.rejection_count >= 3 ? (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Límite alcanzado
                                    </>
                                  ) : applicationStatus[room.id]?.status === "rejected" ? (
                                    <>
                                      <Send className="mr-2 h-4 w-4" />
                                      Reintentar ({3 - applicationStatus[room.id].rejection_count} restantes)
                                    </>
                                  ) : applicationStatus[room.id]?.status === "pending" ? (
                                    <>
                                      <Clock className="mr-2 h-4 w-4" />
                                      Solicitado
                                     </>
                                   ) : (
                                     <>
                                       <Send className="mr-2 h-4 w-4" />
                                       Solicitar
                                     </>
                                   )}
                                 </Button>
                                 {applicationStatus[room.id]?.rejection_count > 0 && applicationStatus[room.id]?.rejection_count < 3 && (
                                   <p className="text-xs text-muted-foreground text-center">
                                     {applicationStatus[room.id]?.rejection_count} rechazo(s)
                                   </p>
                                 )}
                                 {applicationStatus[room.id]?.status === "accepted" && (
                                   <Button
                                     size="sm"
                                     variant="secondary"
                                     onClick={() => navigate(`/payment?residence=${residenceId}&room=${room.id}&application=${applicationStatus[room.id].id}`)}
                                     className="w-full mt-2"
                                   >
                                     <CreditCard className="mr-2 h-4 w-4" />
                                     Realizar Pago
                                   </Button>
                                 )}
                               </div>
                             )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                   </div>
                 )}

                 <div>
                   <h2 className="text-xl font-semibold mb-4">Reseñas y Calificaciones</h2>
                   
                   {canRate && !hasRated && !isOwner && currentProfileId && (
                     <div className="mb-6">
                       <RatingForm
                         residenceId={residenceId!}
                         userId={currentProfileId}
                         onSuccess={refreshRatings}
                       />
                     </div>
                   )}

                   {hasRated && !isOwner && (
                     <Card className="mb-6">
                       <CardContent className="p-4 text-center text-muted-foreground">
                         Ya has dejado una reseña para esta residencia
                       </CardContent>
                     </Card>
                   )}

                   {!canRate && !isOwner && !hasRated && (
                     <Card className="mb-6">
                       <CardContent className="p-4 text-center text-muted-foreground">
                         Solo los residentes que se han hospedado pueden dejar reseñas
                       </CardContent>
                     </Card>
                   )}

                   <RatingsList ratings={ratingsData} />
                 </div>
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

                {isOwner ? (
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/edit-residence/${residence.id}`)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Residencia
                  </Button>
                ) : (
                  <>
                    {residence.residence_type === 'apartment' && residence.status === 'available' && (
                      <Button
                        className="w-full mb-2"
                        onClick={handleApplyApartment}
                        disabled={
                          applyingRooms.has('apartment') || 
                          applicationStatus['apartment']?.status === "pending" ||
                          applicationStatus['apartment']?.status === "accepted" ||
                          (applicationStatus['apartment']?.rejection_count >= 3)
                        }
                        variant={
                          applicationStatus['apartment']?.status === "accepted" 
                            ? "default" 
                            : applicationStatus['apartment']?.status === "rejected"
                            ? "destructive"
                            : applicationStatus['apartment']?.status === "pending"
                            ? "secondary"
                            : "default"
                        }
                      >
                        {applyingRooms.has('apartment') ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : applicationStatus['apartment']?.status === "accepted" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobado
                          </>
                        ) : applicationStatus['apartment']?.rejection_count >= 3 ? (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Límite alcanzado
                          </>
                        ) : applicationStatus['apartment']?.status === "rejected" ? (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Reintentar ({3 - applicationStatus['apartment'].rejection_count} restantes)
                          </>
                        ) : applicationStatus['apartment']?.status === "pending" ? (
                          <>
                            <Clock className="mr-2 h-4 w-4" />
                            Solicitado
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Solicitar Apartamento
                          </>
                        )}
                      </Button>
                    )}
                    {applicationStatus['apartment']?.status === "accepted" && residence.residence_type === 'apartment' && (
                      <Button
                        className="w-full mb-2"
                        variant="secondary"
                        onClick={() => navigate(`/payment?residence=${residenceId}&application=${applicationStatus['apartment'].id}`)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Realizar Pago
                      </Button>
                    )}
                    <Button className="w-full" onClick={() => navigate(`/chat/${residence.id}`)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Ir al Chat
                    </Button>
                  </>
                )}
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

      <PhotoGalleryModal
        photos={galleryPhotos}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryInitialIndex}
      />

      <ResidenceLocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        residenceName={residence.title}
        latitude={Number(residence.latitude)}
        longitude={Number(residence.longitude)}
      />
    </div>
  );
};

export default ResidenceDetails;
