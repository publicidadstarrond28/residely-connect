import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, MapPin, DollarSign, MessageSquare } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [residences, setResidences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setProfile(profileData);

      if (profileData?.role === "resident") {
        const { data: applicationsData } = await supabase
          .from("residence_applications")
          .select(`
            *,
            residences:residence_id (
              title,
              address,
              city,
              price_per_month,
              residence_photos (photo_url)
            ),
            rooms:room_id (
              room_number,
              price_per_month
            )
          `)
          .eq("applicant_id", profileData.id)
          .order("created_at", { ascending: false });

        setApplications(applicationsData || []);
      } else if (profileData?.role === "owner") {
        const { data: residencesData } = await supabase
          .from("residences")
          .select(`
            *,
            residence_photos (photo_url)
          `)
          .eq("owner_id", profileData.id);

        setResidences(residencesData || []);
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      accepted: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{profile?.full_name}</CardTitle>
                <p className="text-muted-foreground">{profile?.email}</p>
                <Badge className="mt-2">{profile?.role}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        {profile?.role === "resident" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Mis Aplicaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {applications.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No has aplicado a ninguna residencia aún
                </p>
              ) : (
                applications.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {app.residences?.residence_photos?.[0] && (
                          <img
                            src={app.residences.residence_photos[0].photo_url}
                            alt={app.residences.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {app.residences?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {app.residences?.address}, {app.residences?.city}
                              </p>
                            </div>
                            {getStatusBadge(app.status)}
                          </div>
                          
                          {app.rooms && (
                            <p className="text-sm">
                              Habitación: {app.rooms.room_number} - $
                              {app.rooms.price_per_month}/mes
                            </p>
                          )}

                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/residence/${app.residence_id}`)}
                            >
                              Ver Residencia
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/chat/${app.residence_id}`)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Chat
                            </Button>

                            {app.status === "accepted" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/payment?residenceId=${app.residence_id}&roomId=${app.room_id}&applicationId=${app.id}`
                                  )
                                }
                              >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pagar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {profile?.role === "owner" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Mis Residencias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {residences.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No tienes residencias registradas
                  </p>
                  <Button onClick={() => navigate("/create-residence")}>
                    Crear Residencia
                  </Button>
                </div>
              ) : (
                residences.map((residence) => (
                  <Card key={residence.id}>
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        {residence.residence_photos?.[0] && (
                          <img
                            src={residence.residence_photos[0].photo_url}
                            alt={residence.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{residence.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {residence.address}, {residence.city}
                          </p>
                          <p className="text-sm mt-1">
                            ${residence.price_per_month}/mes
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/residence/${residence.id}`)}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin-panel`)}
                            >
                              Gestionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
