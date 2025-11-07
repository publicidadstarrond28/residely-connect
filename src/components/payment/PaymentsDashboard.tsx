import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { DollarSign, TrendingUp, AlertCircle, Clock } from "lucide-react";

interface PaymentsDashboardProps {
  ownerId: string;
}

interface MonthlyData {
  month: string;
  ingresos: number;
  pagos: number;
}

interface DashboardStats {
  ingresosTotal: number;
  ingresosMesActual: number;
  tasaMorosidad: number;
  pagosPendientes: number;
  montoPendiente: number;
  monthlyData: MonthlyData[];
  statusData: { name: string; value: number; color: string }[];
}

export const PaymentsDashboard = ({ ownerId }: PaymentsDashboardProps) => {
  const [stats, setStats] = useState<DashboardStats>({
    ingresosTotal: 0,
    ingresosMesActual: 0,
    tasaMorosidad: 0,
    pagosPendientes: 0,
    montoPendiente: 0,
    monthlyData: [],
    statusData: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    const channel = supabase
      .channel('payment-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ownerId]);

  const fetchDashboardData = async () => {
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
        .select("*")
        .in("residence_id", residenceIds)
        .order('created_at', { ascending: false });

      if (payments) {
        // Calcular estadísticas generales
        const confirmed = payments.filter(p => p.status === "confirmed");
        const pending = payments.filter(p => p.status === "pending");
        const rejected = payments.filter(p => p.status === "rejected");
        
        const ingresosTotal = confirmed.reduce((sum, p) => sum + (p.monto_total || 0), 0);
        const montoPendiente = pending.reduce((sum, p) => sum + (p.monto_total || 0), 0);

        // Ingresos del mes actual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const ingresosMesActual = confirmed
          .filter(p => {
            const date = new Date(p.confirmed_at || p.created_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, p) => sum + (p.monto_total || 0), 0);

        // Calcular tasa de morosidad (pagos rechazados / total pagos * 100)
        const totalPayments = payments.length;
        const tasaMorosidad = totalPayments > 0 ? (rejected.length / totalPayments) * 100 : 0;

        // Datos mensuales (últimos 6 meses)
        const monthlyData = generateMonthlyData(confirmed);

        // Datos por estado
        const statusData = [
          { 
            name: 'Confirmados', 
            value: confirmed.length, 
            color: 'hsl(var(--chart-1))' 
          },
          { 
            name: 'Pendientes', 
            value: pending.length, 
            color: 'hsl(var(--chart-2))' 
          },
          { 
            name: 'Rechazados', 
            value: rejected.length, 
            color: 'hsl(var(--chart-3))' 
          },
        ];

        setStats({
          ingresosTotal,
          ingresosMesActual,
          tasaMorosidad,
          pagosPendientes: pending.length,
          montoPendiente,
          monthlyData,
          statusData,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (confirmedPayments: any[]): MonthlyData[] => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const last6Months: MonthlyData[] = [];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthIndex = date.getMonth();
      const year = date.getFullYear();

      const monthPayments = confirmedPayments.filter(p => {
        const paymentDate = new Date(p.confirmed_at || p.created_at);
        return paymentDate.getMonth() === monthIndex && paymentDate.getFullYear() === year;
      });

      last6Months.push({
        month: months[monthIndex],
        ingresos: monthPayments.reduce((sum, p) => sum + (p.monto_total || 0), 0),
        pagos: monthPayments.length,
      });
    }

    return last6Months;
  };

  if (loading) {
    return <div className="text-center p-8">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ingresosTotal.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Acumulado histórico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Mes Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.ingresosMesActual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              Tasa de Morosidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasaMorosidad.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Pagos rechazados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pagosPendientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.montoPendiente.toLocaleString()} pendientes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="monthly">Ingresos Mensuales</TabsTrigger>
          <TabsTrigger value="status">Estado de Pagos</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos Últimos 6 Meses</CardTitle>
              <CardDescription>Evolución de ingresos confirmados por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="ingresos" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                    name="Ingresos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Pagos</CardTitle>
              <CardDescription>Cantidad de pagos procesados por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pagos" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    name="Cantidad de Pagos"
                    dot={{ fill: 'hsl(var(--accent))', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Proporción de pagos según su estado</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={stats.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {stats.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
