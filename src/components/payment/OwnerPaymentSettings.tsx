import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const BANCOS_VENEZUELA = [
  "Banesco", "Mercantil", "Provincial", "BDV (Banco de Venezuela)",
  "Bicentenario", "Tesoro", "Venezuela", "Exterior", "BNC", "BOD",
  "Sofitasa", "Plaza", "Activo", "Bancaribe", "Fondo Común"
];

const schema = z.object({
  pago_movil_enabled: z.boolean(),
  efectivo_enabled: z.boolean(),
  banco_destino: z.string().optional(),
  telefono_destino: z.string().regex(/^\d{11}$/, "Formato: 04XX1234567").optional().or(z.literal("")),
  cedula_titular: z.string().optional(),
  nombre_titular: z.string().optional(),
  precio_bs: z.coerce.number().positive().optional().or(z.literal("")),
  precio_usd: z.coerce.number().positive().optional().or(z.literal("")),
});

interface OwnerPaymentSettingsProps {
  residenceId: string;
}

export const OwnerPaymentSettings = ({ residenceId }: OwnerPaymentSettingsProps) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pago_movil_enabled: true,
      efectivo_enabled: true,
      banco_destino: "",
      telefono_destino: "",
      cedula_titular: "",
      nombre_titular: "",
      precio_bs: "",
      precio_usd: "",
    },
  });

  useEffect(() => {
    fetchConfig();
  }, [residenceId]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("residence_payment_config")
        .select("*")
        .eq("residence_id", residenceId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setConfig(data);
        form.reset({
          pago_movil_enabled: data.pago_movil_enabled,
          efectivo_enabled: data.efectivo_enabled,
          banco_destino: data.banco_destino || "",
          telefono_destino: data.telefono_destino || "",
          cedula_titular: data.cedula_titular || "",
          nombre_titular: data.nombre_titular || "",
          precio_bs: data.precio_bs?.toString() || "",
          precio_usd: data.precio_usd?.toString() || "",
        });
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        residence_id: residenceId,
        pago_movil_enabled: data.pago_movil_enabled,
        efectivo_enabled: data.efectivo_enabled,
        banco_destino: data.banco_destino || null,
        telefono_destino: data.telefono_destino || null,
        cedula_titular: data.cedula_titular || null,
        nombre_titular: data.nombre_titular || null,
        precio_bs: data.precio_bs || null,
        precio_usd: data.precio_usd || null,
      };

      if (config) {
        const { error } = await supabase
          .from("residence_payment_config")
          .update(payload)
          .eq("id", config.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("residence_payment_config")
          .insert([payload]);
        if (error) throw error;
      }

      toast({
        title: "Configuración guardada",
        description: "Los métodos de pago han sido actualizados",
      });
      fetchConfig();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Pagos</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="pago_movil_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Pago Móvil</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Permitir pagos por Pago Móvil
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("pago_movil_enabled") && (
                <div className="space-y-4 pl-4 border-l-2">
                  <FormField
                    control={form.control}
                    name="banco_destino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banco Destino</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu banco" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BANCOS_VENEZUELA.map((banco) => (
                              <SelectItem key={banco} value={banco}>
                                {banco}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefono_destino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Destino</FormLabel>
                        <FormControl>
                          <Input placeholder="04121234567" maxLength={11} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cedula_titular"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cédula del Titular</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nombre_titular"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Titular</FormLabel>
                        <FormControl>
                          <Input placeholder="Juan Pérez" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="efectivo_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Efectivo</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Permitir pagos en efectivo
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h4 className="font-semibold">Precios Mensuales</h4>
                <FormField
                  control={form.control}
                  name="precio_bs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio en Bolívares (Bs)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precio_usd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio en Dólares (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};