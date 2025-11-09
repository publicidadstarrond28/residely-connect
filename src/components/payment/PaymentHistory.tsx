import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { generatePaymentReceipt } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  residence_id: string;
  payment_method: string;
  status: string;
  months_paid: number;
  banco_origen: string | null;
  numero_referencia: string | null;
  telefono_origen: string | null;
  cedula: string | null;
  fecha_pago: string | null;
  moneda: string | null;
  monto_total: number | null;
  created_at: string;
  confirmed_at: string | null;
  rejection_reason: string | null;
  residences: {
    title: string;
    address: string;
  } | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  rooms: {
    room_number: string;
  } | null;
}

interface PaymentHistoryProps {
  userId: string;
}

export const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel('user-payments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          residences (title, address),
          profiles (full_name, email),
          rooms (room_number)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="default">Confirmado</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      toast({
        title: "Generando recibo...",
        description: "Tu recibo PDF se descargará en un momento",
      });

      await generatePaymentReceipt({
        payment_id: payment.id,
        user_name: payment.profiles?.full_name || "Usuario",
        user_email: payment.profiles?.email || "",
        residence_title: payment.residences?.title || "Residencia",
        residence_address: payment.residences?.address || "",
        room_number: payment.rooms?.room_number || undefined,
        payment_method: payment.payment_method,
        amount: payment.monto_total || 0,
        currency: payment.moneda || "USD",
        months_paid: payment.months_paid,
        payment_date: payment.fecha_pago || payment.created_at,
        reference_number: payment.numero_referencia || undefined,
        bank: payment.banco_origen || undefined,
        phone: payment.telefono_origen || undefined,
        cedula: payment.cedula || undefined,
        status: payment.status,
      });

      toast({
        title: "Recibo descargado",
        description: "El recibo ha sido descargado exitosamente",
      });
    } catch (error) {
      console.error("Error downloading receipt:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el recibo",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando historial de pagos...</div>;
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos</CardTitle>
          <CardDescription>No has realizado ningún pago aún</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Historial de Pagos</h2>
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle>{payment.residences?.title || "Residencia"}</CardTitle>
                <CardDescription>
                  {payment.months_paid} {payment.months_paid === 1 ? "mes" : "meses"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(payment.status)}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadReceipt(payment)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Método:</p>
                <p className="capitalize">{payment.payment_method.replace("_", " ")}</p>
              </div>
              {payment.payment_method === "pago_movil" && (
                <>
                  <div>
                    <p className="font-semibold">Banco:</p>
                    <p>{payment.banco_origen}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Referencia:</p>
                    <p>{payment.numero_referencia}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Fecha de Pago:</p>
                    <p>{payment.fecha_pago && format(new Date(payment.fecha_pago), "dd/MM/yyyy")}</p>
                  </div>
                </>
              )}
              {payment.payment_method === "efectivo" && (
                <>
                  <div>
                    <p className="font-semibold">Moneda:</p>
                    <p>{payment.moneda}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Monto:</p>
                    <p>{payment.monto_total}</p>
                  </div>
                </>
              )}
              <div>
                <p className="font-semibold">Fecha de Solicitud:</p>
                <p>{format(new Date(payment.created_at), "dd/MM/yyyy")}</p>
              </div>
              {payment.confirmed_at && (
                <div>
                  <p className="font-semibold">Confirmado:</p>
                  <p>{format(new Date(payment.confirmed_at), "dd/MM/yyyy")}</p>
                </div>
              )}
            </div>
            {payment.rejection_reason && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                <p className="text-sm font-semibold text-destructive">Razón del rechazo:</p>
                <p className="text-sm">{payment.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
