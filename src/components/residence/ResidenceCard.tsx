import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Star, DollarSign, MessageCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface ResidenceCardProps {
  residence: {
    id: string;
    title: string;
    description: string;
    city: string;
    state: string;
    price_per_month: number;
    residence_type: string;
    gender_preference: string;
    status: string;
    capacity: number;
    current_occupants: number;
    photos?: Array<{ photo_url: string; is_primary: boolean }>;
    ratings?: Array<{ rating: number }>;
  };
}

export const ResidenceCard = ({ residence }: ResidenceCardProps) => {
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check authentication first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.info("Debes iniciar sesión para solicitar");
      navigate("/auth");
      return;
    }

    setApplying(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) throw new Error("Perfil no encontrado");

      // Check if already applied
      const { data: existing } = await supabase
        .from("residence_applications")
        .select("id")
        .eq("residence_id", residence.id)
        .eq("applicant_id", profile.id)
        .single();

      if (existing) {
        toast.info("Ya has enviado una solicitud para esta residencia");
        return;
      }

      const { error } = await supabase
        .from("residence_applications")
        .insert({
          residence_id: residence.id,
          applicant_id: profile.id,
          message: "Estoy interesado en esta residencia",
        });

      if (error) throw error;
      
      toast.success("Solicitud enviada exitosamente");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar solicitud");
    } finally {
      setApplying(false);
    }
  };

  const averageRating =
    residence.ratings && residence.ratings.length > 0
      ? residence.ratings.reduce((acc, r) => acc + r.rating, 0) / residence.ratings.length
      : 0;

  const primaryPhoto = residence.photos?.find((p) => p.is_primary)?.photo_url;
  const imageUrl = primaryPhoto || "/placeholder.svg";

  const typeLabels: Record<string, string> = {
    residence: "Residencia",
    hotel: "Hotel",
    apartment: "Apartamento",
  };

  const genderLabels: Record<string, string> = {
    male: "Caballeros",
    female: "Damas",
    mixed: "Mixto",
  };

  return (
    <Card className="overflow-hidden hover:shadow-[var(--shadow-card)] transition-all duration-300 group cursor-pointer">
      <div
        className="relative h-48 overflow-hidden"
        onClick={() => navigate(`/residence/${residence.id}`)}
      >
        <img
          src={imageUrl}
          alt={residence.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        {residence.status === "occupied" && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
              Ocupada
            </Badge>
          </div>
        )}
        {residence.status === "available" && (
          <div className="absolute top-2 right-2">
            <Badge className="bg-accent text-accent-foreground">Disponible</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-1">{residence.title}</h3>
            {averageRating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{residence.description}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {residence.city}, {residence.state}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>
                {residence.current_occupants}/{residence.capacity}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{typeLabels[residence.residence_type]}</Badge>
            <Badge variant="outline">{genderLabels[residence.gender_preference]}</Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {residence.price_per_month.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">/mes</span>
          </div>
        </div>
        <div className="flex gap-2 w-full">
          {residence.status === "available" && (
            <Button
              size="sm"
              onClick={handleApply}
              disabled={applying}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" />
              {applying ? "Enviando..." : "Solicitar"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chat/${residence.id}`);
            }}
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/residence/${residence.id}`)}
            className="flex-1"
          >
            Ver Detalles
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
