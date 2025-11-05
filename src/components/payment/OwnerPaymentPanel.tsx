import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

interface Payment {
  id: string;
  user_id: string;
  residence_id: string;
  payment_method: string;
  status: string;
  months_paid: number;
  moneda: string | null;
  monto_total: number | null;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
  residences: {
    title: string;
  };
}

interface OwnerPaymentPanelProps {
  ownerId: string;
}

export const OwnerPaymentPanel = ({ ownerId }: OwnerPaymentPanelProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingPayments();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('owner-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          fetchPendingPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  const fetchPendingPayments = async () => {
    try {
      // First get residence IDs
      const { data: residences } = await supabase
        .from("residences")
        .select("id")
        .eq("owner_id", ownerId);

      if (!residences || residences.length === 0) {
        setPayments([]);
        setLoading(false);
        return;
      }

      const residenceIds = residences.map(r => r.id);

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          profiles (full_name, email),
          residences (title)
        `)
        .eq("status", "pending")
        .in("residence_id", residenceIds)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data as any || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos pendientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          confirmed_by: ownerId,
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Pago confirmado",
        description: "El pago ha sido confirmado exitosamente",
      });

      fetchPendingPayments();
    } catch (error: any) {
      console.error("Error confirming payment:", error);
      toast({
        title: "Error",
        description: "No se pudo confirmar el pago",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (paymentId: string) => {
    const reason = rejectionReason[paymentId];
    if (!reason?.trim()) {
      toast({
        title: "Error",
        description: "Debes proporcionar una razón para rechazar el pago",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("payments")
        .update({ 
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Pago rechazado",
        description: "El pago ha sido rechazado",
      });

      setRejectionReason({ ...rejectionReason, [paymentId]: "" });
      fetchPendingPayments();
    } catch (error: any) {
      console.error("Error rejecting payment:", error);
      toast({
        title: "Error",
        description: "No se pudo rechazar el pago",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando pagos pendientes...</div>;
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagos Pendientes</CardTitle>
          <CardDescription>No hay pagos pendientes de confirmación</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pagos Pendientes de Confirmación</h2>
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{payment.residences.title}</CardTitle>
                <CardDescription>
                  {payment.profiles.full_name} ({payment.profiles.email})
                </CardDescription>
              </div>
              <Badge variant="secondary">Pendiente</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Método de Pago:</p>
                <p className="capitalize">{payment.payment_method.replace("_", " ")}</p>
              </div>
              <div>
                <p className="font-semibold">Meses Pagados:</p>
                <p>{payment.months_paid} {payment.months_paid === 1 ? "mes" : "meses"}</p>
              </div>
              {payment.payment_method === "efectivo" && (
                <>
                  <div>
                    <p className="font-semibold">Moneda:</p>
                    <p>{payment.moneda}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Monto Total:</p>
                    <p>{payment.monto_total}</p>
                  </div>
                </>
              )}
              <div>
                <p className="font-semibold">Fecha de Solicitud:</p>
                <p>{format(new Date(payment.created_at), "dd/MM/yyyy HH:mm")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder="Razón del rechazo (opcional)"
                value={rejectionReason[payment.id] || ""}
                onChange={(e) =>
                  setRejectionReason({ ...rejectionReason, [payment.id]: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleConfirm(payment.id)}
                className="flex-1"
                variant="default"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Pago
              </Button>
              <Button
                onClick={() => handleReject(payment.id)}
                className="flex-1"
                variant="destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar Pago
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
