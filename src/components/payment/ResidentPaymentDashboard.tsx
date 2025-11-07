import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DollarSign, CheckCircle, Clock } from "lucide-react";

interface Payment {
  id: string;
  residence_id: string;
  room_id: string | null;
  payment_method: string;
  status: string;
  months_paid: number;
  created_at: string;
  confirmed_at: string | null;
  monto_total: number | null;
  moneda: string | null;
  residences: {
    title: string;
  };
  rooms?: {
    room_number: string;
  } | null;
}

interface ResidentPaymentDashboardProps {
  userId: string;
}

export const ResidentPaymentDashboard = ({ userId }: ResidentPaymentDashboardProps) => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('resident-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchData = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(`
          *,
          residences (title),
          rooms (room_number)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      const { data: applicationsData, error: applicationsError } = await supabase
        .from("residence_applications")
        .select(`
          *,
          residences:residence_id (
            id,
            title,
            price_per_month
          ),
          rooms:room_id (
            id,
            room_number,
            price_per_month
          )
        `)
        .eq("applicant_id", userId)
        .eq("status", "accepted");

      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = payments.filter(p => p.status === "pending");
  const confirmedPayments = payments.filter(p => p.status === "confirmed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Mis Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pendientes ({pendingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Pagados ({confirmedPayments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes pagos pendientes</p>
                </div>
              ) : (
                pendingPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{payment.residences.title}</h3>
                          {payment.rooms && (
                            <p className="text-sm text-muted-foreground">
                              Habitación: {payment.rooms.room_number}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-semibold">Meses:</p>
                          <p>{payment.months_paid}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Método:</p>
                          <p className="capitalize">{payment.payment_method.replace("_", " ")}</p>
                        </div>
                        {payment.monto_total && (
                          <div>
                            <p className="font-semibold">Monto:</p>
                            <p>{payment.monto_total} {payment.moneda}</p>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">Fecha:</p>
                          <p>{format(new Date(payment.created_at), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}

              {applications.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Residencias Aceptadas - Realizar Primer Pago</h3>
                  {applications.map((app) => (
                    <Card key={app.id} className="mb-3">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{app.residences.title}</h4>
                            {app.rooms && (
                              <p className="text-sm text-muted-foreground">
                                Habitación: {app.rooms.room_number} - $
                                {app.rooms.price_per_month}/mes
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/payment?residence=${app.residence_id}&room=${app.room_id}&application=${app.id}`
                              )
                            }
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4 mt-4">
              {confirmedPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No tienes pagos confirmados aún</p>
                </div>
              ) : (
                confirmedPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{payment.residences.title}</h3>
                          {payment.rooms && (
                            <p className="text-sm text-muted-foreground">
                              Habitación: {payment.rooms.room_number}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="font-semibold">Meses Pagados:</p>
                          <p>{payment.months_paid}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Método:</p>
                          <p className="capitalize">{payment.payment_method.replace("_", " ")}</p>
                        </div>
                        {payment.monto_total && (
                          <div>
                            <p className="font-semibold">Monto:</p>
                            <p>{payment.monto_total} {payment.moneda}</p>
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">Confirmado:</p>
                          <p>
                            {payment.confirmed_at
                              ? format(new Date(payment.confirmed_at), "dd/MM/yyyy")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};