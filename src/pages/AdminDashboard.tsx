import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, FileText, MessageSquare, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [residences, setResidences] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [updatingApp, setUpdatingApp] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
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
        toast.error("Solo los dueños pueden acceder a esta página");
        navigate("/");
        return;
      }

      setIsOwner(true);
      await fetchData(profile.id);
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (profileId: string) => {
    // Fetch residences
    const { data: residencesData } = await supabase
      .from("residences")
      .select(`
        *,
        rooms (
          id,
          room_number,
          is_available,
          capacity,
          current_occupants
        )
      `)
      .eq("owner_id", profileId)
      .order("created_at", { ascending: false });

    setResidences(residencesData || []);

    // Fetch applications for owner's residences
    const residenceIds = residencesData?.map(r => r.id) || [];
    if (residenceIds.length > 0) {
      const { data: appsData } = await supabase
        .from("residence_applications")
        .select(`
          *,
          profiles:applicant_id (
            full_name,
            email,
            phone
          ),
          residences (
            title
          ),
          rooms (
            room_number
          )
        `)
        .in("residence_id", residenceIds)
        .order("created_at", { ascending: false });

      setApplications(appsData || []);
    }

    // Fetch conversations
    const { data: convsData } = await supabase
      .from("conversations")
      .select(`
        *,
        profiles:client_id (
          full_name
        ),
        residences (
          title
        ),
        messages (
          id,
          created_at
        )
      `)
      .eq("owner_id", profileId)
      .order("updated_at", { ascending: false });

    setConversations(convsData || []);
  };

  const handleUpdateApplication = async (appId: string, status: string) => {
    setUpdatingApp(appId);
    try {
      const { error } = await supabase
        .from("residence_applications")
        .update({ status })
        .eq("id", appId);

      if (error) throw error;

      toast.success(`Solicitud ${status === "accepted" ? "aceptada" : "rechazada"}`);
      
      // Refresh data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          await fetchData(profile.id);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error("Error al actualizar solicitud");
    } finally {
      setUpdatingApp(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Panel Administrativo</h1>
          <p className="text-muted-foreground">Gestiona tus residencias, solicitudes y comunicaciones</p>
        </div>

        <Tabs defaultValue="residences" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="residences" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Residencias
            </TabsTrigger>
            <TabsTrigger value="applications" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Solicitudes
              {applications.filter(a => a.status === "pending").length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {applications.filter(a => a.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Mensajes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="residences" className="space-y-4">
            {residences.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes residencias creadas</p>
                  <Button className="mt-4" onClick={() => navigate("/create-residence")}>
                    Crear Primera Residencia
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {residences.map((residence) => (
                  <Card key={residence.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{residence.title}</CardTitle>
                          <CardDescription>
                            {residence.city}, {residence.state}
                          </CardDescription>
                        </div>
                        <Badge variant={residence.status === "available" ? "default" : "secondary"}>
                          {residence.status === "available" ? "Disponible" : "Ocupada"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Habitaciones:</span>
                          <span className="font-medium">{residence.rooms?.length || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Disponibles:</span>
                          <span className="font-medium">
                            {residence.rooms?.filter((r: any) => r.is_available).length || 0}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/residence/${residence.id}`)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay solicitudes aún</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {app.profiles?.full_name || "Usuario"}
                          </CardTitle>
                          <CardDescription>
                            {app.residences?.title} - Habitación {app.rooms?.room_number}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            app.status === "pending"
                              ? "outline"
                              : app.status === "accepted"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {app.status === "pending"
                            ? "Pendiente"
                            : app.status === "accepted"
                            ? "Aceptada"
                            : "Rechazada"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {app.profiles?.email && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Email: </span>
                            <span>{app.profiles.email}</span>
                          </div>
                        )}
                        {app.profiles?.phone && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Teléfono: </span>
                            <span>{app.profiles.phone}</span>
                          </div>
                        )}
                        {app.status === "pending" && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateApplication(app.id, "accepted")}
                              disabled={updatingApp === app.id}
                              className="flex-1"
                            >
                              {updatingApp === app.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleUpdateApplication(app.id, "rejected")}
                              disabled={updatingApp === app.id}
                              className="flex-1"
                            >
                              {updatingApp === app.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            {conversations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay conversaciones aún</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {conversations.map((conv) => (
                  <Card key={conv.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold mb-1">
                            {conv.profiles?.full_name || "Usuario"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {conv.residences?.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {conv.messages?.length || 0} mensajes
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/chat/${conv.residence_id}`)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Abrir Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;