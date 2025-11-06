import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";

interface PaymentStatsWidgetProps {
  ownerId: string;
}

interface PaymentStats {
  totalReceived: number;
  totalPending: number;
  totalRejected: number;
  amountReceived: number;
}

export const PaymentStatsWidget = ({ ownerId }: PaymentStatsWidgetProps) => {
  const [stats, setStats] = useState<PaymentStats>({
    totalReceived: 0,
    totalPending: 0,
    totalRejected: 0,
    amountReceived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    const channel = supabase
      .channel('payment-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  const fetchStats = async () => {
    try {
      const { data: residences } = await supabase
        .from("residences")
        .select("id")
        .eq("owner_id", ownerId);

      if (!residences || residences.length === 0) {
        setLoading(false);
        return;
      }

      const residenceIds = residences.map(r => r.id);

      const { data: payments } = await supabase
        .from("payments")
        .select("status, monto_total")
        .in("residence_id", residenceIds);

      if (payments) {
        const confirmed = payments.filter(p => p.status === "confirmed");
        const pending = payments.filter(p => p.status === "pending");
        const rejected = payments.filter(p => p.status === "rejected");
        
        const totalAmount = confirmed.reduce((sum, p) => sum + (p.monto_total || 0), 0);

        setStats({
          totalReceived: confirmed.length,
          totalPending: pending.length,
          totalRejected: rejected.length,
          amountReceived: totalAmount,
        });
      }
    } catch (error) {
      console.error("Error fetching payment stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando estadísticas...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Estadísticas de Pagos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Confirmados</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalReceived}</p>
            <p className="text-xs text-muted-foreground">
              ${stats.amountReceived.toLocaleString()}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span>Pendientes</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalPending}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Rechazados</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalRejected}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Total</span>
            </div>
            <p className="text-2xl font-bold">
              {stats.totalReceived + stats.totalPending + stats.totalRejected}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
