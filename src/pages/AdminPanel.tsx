import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, FileText, MessageCircle, CheckCircle, XCircle, Home } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  residence_id: string;
  room_id: string;
  residences: {
    title: string;
  };
  rooms: {
    room_number: string;
  };
  profiles: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

interface Residence {
  id: string;
  title: string;
  address: string;
  city: string;
  status: string;
  price_per_month: number;
  current_occupants: number;
  capacity: number;
  rooms: { id: string; is_available: boolean }[];
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [residences, setResidences] = useState<Residence[]>([]);
  const [processingApp, setProcessingApp] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("user_id", user.id)
      .single();

    if (profile?.role !== "owner") {
      toast.error("Acceso denegado");
      navigate("/");
      return;
    }

    await fetchData(profile.id);
    setLoading(false);
  };

  const fetchData = async (profileId: string) => {
    // Fetch applications
    const { data: apps } = await supabase
      .from("residence_applications")
      .select(`
        *,
        residences!inner(title, owner_id),
        rooms(room_number),
        profiles!residence_applications_applicant_id_fkey(full_name, email, phone)
      `)
      .eq("residences.owner_id", profileId)
      .order("created_at", { ascending: false });

    if (apps) setApplications(apps as Application[]);

    // Fetch residences
    const { data: res } = await supabase
      .from("residences")
      .select(`
        id,
        title,
        address,
        city,
        status,
        price_per_month,
        current_occupants,
        capacity,
        rooms(id, is_available)
      `)
      .eq("owner_id", profileId);

    if (res) setResidences(res as Residence[]);
  };

  const handleApplicationStatus = async (appId: string, status: "accepted" | "rejected") => {
    setProcessingApp(appId);
    try {
      const { error } = await supabase
        .from("residence_applications")
        .update({ status })
        .eq("id", appId);

      if (error) throw error;

      toast.success(status === "accepted" ? "Solicitud aceptada" : "Solicitud rechazada");
      
      // Refresh data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (profile) await fetchData(profile.id);
      }
    } catch (error: any) {
      toast.error("Error al procesar la solicitud");
      console.error(error);
    } finally {
      setProcessingApp(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingApplications = applications.filter(a => a.status === "pending");
  const processedApplications = applications.filter(a => a.status !== "pending");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panel Administrativo</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="h-4 w-4 mr-2" />
            Inicio
          </Button>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications" className="gap-2">
              <FileText className="h-4 w-4" />
              Solicitudes
              {pendingApplications.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingApplications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="residences" className="gap-2">
              <Building2 className="h-4 w-4" />
              Mis Residencias
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Mensajes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Pendientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingApplications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay solicitudes pendientes
                  </p>
                ) : (
                  pendingApplications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{app.profiles?.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {app.residences?.title} - Habitación {app.rooms?.room_number}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {app.profiles?.email} {app.profiles?.phone && `• ${app.profiles.phone}`}
                            </p>
                          </div>
                          <Badge variant="outline">Pendiente</Badge>
                        </div>
                        {app.message && (
                          <p className="text-sm mb-3 p-2 bg-muted rounded-md">
                            {app.message}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApplicationStatus(app.id, "accepted")}
                            disabled={processingApp === app.id}
                            className="flex-1"
                          >
                            {processingApp === app.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApplicationStatus(app.id, "rejected")}
                            disabled={processingApp === app.id}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {processedApplications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Solicitudes Procesadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {processedApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{app.profiles?.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.residences?.title} - Habitación {app.rooms?.room_number}
                        </p>
                      </div>
                      <Badge
                        variant={app.status === "accepted" ? "default" : "secondary"}
                      >
                        {app.status === "accepted" ? "Aceptada" : "Rechazada"}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="residences" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mis Residencias</h2>
              <Button onClick={() => navigate("/create-residence")}>
                <Building2 className="h-4 w-4 mr-2" />
                Nueva Residencia
              </Button>
            </div>
            {residences.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No tienes residencias creadas
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {residences.map((res) => (
                  <Card
                    key={res.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/residence/${res.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{res.title}</h3>
                        <Badge
                          variant={res.status === "available" ? "default" : "secondary"}
                        >
                          {res.status === "available" ? "Disponible" : "Ocupada"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {res.address}, {res.city}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Ocupación: {res.current_occupants}/{res.capacity}
                        </span>
                        <span className="font-semibold text-primary">
                          ${res.price_per_month}/mes
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {res.rooms?.filter(r => r.is_available).length} habitaciones disponibles
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Sistema de mensajes disponible próximamente
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;