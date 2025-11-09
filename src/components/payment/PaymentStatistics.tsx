import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, TrendingUp, Bell } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PaymentStats {
  onTimeRate: number;
  averageDelay: number;
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
}

interface ReminderHistory {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  resident_name: string;
  residence_title: string;
}

export const PaymentStatistics = ({ ownerId }: { ownerId: string }) => {
  const [stats, setStats] = useState<PaymentStats>({
    onTimeRate: 0,
    averageDelay: 0,
    totalPayments: 0,
    onTimePayments: 0,
    latePayments: 0,
  });
  const [reminderHistory, setReminderHistory] = useState<ReminderHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Obtener todas las residencias del propietario
        const { data: residences } = await supabase
          .from("residences")
          .select("id")
          .eq("owner_id", ownerId);

        if (!residences || residences.length === 0) {
          setLoading(false);
          return;
        }

        const residenceIds = residences.map((r) => r.id);

        // Obtener pagos confirmados con información de aplicaciones
        const { data: payments } = await supabase
          .from("payments")
          .select(`
            *,
            residence_applications!inner(
              next_payment_due,
              applicant_id,
              profiles!residence_applications_applicant_id_fkey(full_name),
              residences!inner(title)
            )
          `)
          .in("residence_id", residenceIds)
          .eq("status", "confirmed")
          .not("confirmed_at", "is", null);

        if (payments && payments.length > 0) {
          let onTimeCount = 0;
          let totalDelay = 0;
          let lateCount = 0;

          payments.forEach((payment: any) => {
            if (payment.confirmed_at && payment.residence_applications?.next_payment_due) {
              const confirmedDate = new Date(payment.confirmed_at);
              const dueDate = new Date(payment.residence_applications.next_payment_due);
              
              const delayDays = Math.ceil(
                (confirmedDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
              );

              if (delayDays <= 0) {
                onTimeCount++;
              } else {
                lateCount++;
                totalDelay += delayDays;
              }
            }
          });

          const onTimeRate = payments.length > 0 ? (onTimeCount / payments.length) * 100 : 0;
          const averageDelay = lateCount > 0 ? totalDelay / lateCount : 0;

          setStats({
            onTimeRate: Math.round(onTimeRate),
            averageDelay: Math.round(averageDelay),
            totalPayments: payments.length,
            onTimePayments: onTimeCount,
            latePayments: lateCount,
          });
        }

        // Obtener historial de recordatorios enviados
        const { data: applications } = await supabase
          .from("residence_applications")
          .select(`
            applicant_id,
            residence_id,
            profiles!residence_applications_applicant_id_fkey(id, full_name),
            residences!inner(id, title)
          `)
          .in("residence_id", residenceIds)
          .eq("status", "accepted");

        if (applications && applications.length > 0) {
          const applicantIds = applications.map((app: any) => app.profiles?.id).filter(Boolean);

          if (applicantIds.length > 0) {
            const { data: reminders } = await supabase
              .from("notifications")
              .select(`
                id,
                type,
                title,
                message,
                created_at,
                user_id
              `)
              .in("user_id", applicantIds)
              .in("type", ["payment_reminder", "payment_overdue"])
              .order("created_at", { ascending: false })
              .limit(50);

            if (reminders) {
              // Enriquecer con nombres de residentes y residencias
              const enrichedReminders = reminders.map((reminder: any) => {
                const app = applications.find(
                  (a: any) => a.profiles?.id === reminder.user_id
                );
                return {
                  ...reminder,
                  resident_name: app?.profiles?.full_name || "Desconocido",
                  residence_title: Array.isArray(app?.residences) 
                    ? app.residences[0]?.title 
                    : app?.residences?.title || "Residencia",
                };
              });

              setReminderHistory(enrichedReminders);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payment statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [ownerId]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tasa de Pagos a Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.onTimePayments} de {stats.totalPayments} pagos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Retraso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.averageDelay}</div>
            <p className="text-xs text-muted-foreground mt-1">
              días de retraso promedio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              Pagos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.latePayments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalPayments > 0 
                ? `${Math.round((stats.latePayments / stats.totalPayments) * 100)}%`
                : "0%"} del total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Historial de Recordatorios
          </CardTitle>
          <CardDescription>
            Últimos recordatorios de pago enviados a tus residentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminderHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay recordatorios enviados
            </p>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {reminderHistory.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="border-l-4 border-primary/30 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              reminder.type === "payment_overdue"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {reminder.type === "payment_overdue"
                              ? "Vencido"
                              : "Recordatorio"}
                          </Badge>
                          <span className="text-sm font-medium">
                            {reminder.resident_name}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reminder.residence_title}
                        </p>
                        <p className="text-sm">{reminder.message}</p>
                      </div>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(reminder.created_at), "dd MMM yyyy HH:mm", {
                          locale: es,
                        })}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
