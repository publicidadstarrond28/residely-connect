import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { ResidenceForm } from "@/components/residence/ResidenceForm";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const EditResidence = () => {
  const navigate = useNavigate();
  const { residenceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [residenceData, setResidenceData] = useState<any>(null);

  useEffect(() => {
    const loadResidence = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("user_id", user.id)
          .single();

        if (profile?.role !== "owner") {
          toast.error("No tienes permisos para editar residencias");
          navigate("/");
          return;
        }

        // Load residence data
        const { data: residence, error } = await supabase
          .from("residences")
          .select(`
            *,
            rooms (
              id,
              room_number,
              capacity,
              price_per_month,
              gender_preference
            ),
            residence_areas (
              id,
              area_type,
              area_name,
              area_photos (
                id,
                photo_url,
                is_primary
              )
            )
          `)
          .eq("id", residenceId)
          .eq("owner_id", profile.id)
          .single();

        if (error) throw error;

        if (!residence) {
          toast.error("Residencia no encontrada o no tienes permisos");
          navigate("/");
          return;
        }

        // Load room photos
        if (residence.rooms && residence.rooms.length > 0) {
          const roomIds = residence.rooms.map((r: any) => r.id);
          const { data: roomPhotos } = await supabase
            .from("room_photos")
            .select("*")
            .in("room_id", roomIds);

          if (roomPhotos) {
            residence.rooms = residence.rooms.map((room: any) => ({
              ...room,
              photos: roomPhotos.filter((p: any) => p.room_id === room.id)
            }));
          }
        }

        setResidenceData(residence);
        setLoading(false);
      } catch (error: any) {
        console.error("Error loading residence:", error);
        toast.error("Error al cargar la residencia");
        navigate("/");
      }
    };

    loadResidence();
  }, [navigate, residenceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <ResidenceForm initialData={residenceData} isEdit />
      </main>
    </div>
  );
};

export default EditResidence;
