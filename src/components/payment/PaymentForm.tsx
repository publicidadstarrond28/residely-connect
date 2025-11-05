import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const BANCOS_VENEZUELA = [
  "Banesco",
  "Mercantil",
  "Provincial",
  "BDV (Banco de Venezuela)",
  "Bicentenario",
  "Tesoro",
  "Venezuela",
  "Exterior",
  "BNC",
  "BOD",
  "Sofitasa",
  "Plaza",
  "Activo",
  "Bancaribe",
  "Fondo Común",
];

const pagoMovilSchema = z.object({
  payment_method: z.literal("pago_movil"),
  banco_origen: z.string().min(1, "Selecciona un banco"),
  cedula: z.string().regex(/^\d+$/, "Solo números").min(6, "Mínimo 6 dígitos"),
  months_paid: z.coerce.number().min(1).max(12),
  numero_referencia: z.string().regex(/^\d+$/, "Solo números").min(4, "Mínimo 4 dígitos"),
  fecha_pago: z.date(),
  telefono_origen: z.string().regex(/^\d{11}$/, "Formato: 04XX1234567"),
  comprobante: z.any().optional(),
});

const efectivoSchema = z.object({
  payment_method: z.literal("efectivo"),
  months_paid: z.coerce.number().min(1).max(12),
  moneda: z.enum(["BS", "USD"]),
  monto_total: z.coerce.number().positive("Monto debe ser positivo"),
});

interface PaymentFormProps {
  residenceId: string;
  roomId?: string;
  applicationId?: string;
  userId: string;
  onSuccess: () => void;
}

export const PaymentForm = ({ residenceId, roomId, applicationId, userId, onSuccess }: PaymentFormProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"pago_movil" | "efectivo">("pago_movil");
  const [loading, setLoading] = useState(false);

  const schema = paymentMethod === "pago_movil" ? pagoMovilSchema : efectivoSchema;
  
  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: paymentMethod,
      months_paid: 1,
      moneda: "BS" as const,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      let comprobanteUrl = null;

      // Upload receipt if pago móvil
      if (paymentMethod === "pago_movil" && data.comprobante?.[0]) {
        const file = data.comprobante[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('residence-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('residence-photos')
          .getPublicUrl(filePath);

        comprobanteUrl = publicUrl;
      }

      const paymentData = {
        user_id: userId,
        residence_id: residenceId,
        room_id: roomId || null,
        application_id: applicationId || null,
        payment_method: paymentMethod,
        months_paid: data.months_paid,
        status: paymentMethod === "pago_movil" ? "confirmed" : "pending",
        ...(paymentMethod === "pago_movil" ? {
          banco_origen: data.banco_origen,
          cedula: data.cedula,
          numero_referencia: data.numero_referencia,
          fecha_pago: format(data.fecha_pago, "yyyy-MM-dd"),
          telefono_origen: data.telefono_origen,
          comprobante_url: comprobanteUrl,
        } : {
          moneda: data.moneda,
          monto_total: data.monto_total,
        }),
      };

      const { error } = await supabase.from("payments").insert([paymentData as any]);

      if (error) throw error;

      toast({
        title: paymentMethod === "pago_movil" ? "¡Pago confirmado!" : "Pago enviado",
        description: paymentMethod === "pago_movil" 
          ? "Tu pago móvil ha sido procesado exitosamente." 
          : "Tu pago en efectivo está pendiente de confirmación por el dueño.",
      });

      onSuccess();
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar el pago",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodChange = (value: "pago_movil" | "efectivo") => {
    setPaymentMethod(value);
    form.reset({
      payment_method: value,
      months_paid: 1,
      moneda: "BS" as const,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Método de Pago</h3>
        <RadioGroup
          value={paymentMethod}
          onValueChange={handlePaymentMethodChange}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pago_movil" id="pago_movil" />
            <label htmlFor="pago_movil" className="cursor-pointer">Pago Móvil</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="efectivo" id="efectivo" />
            <label htmlFor="efectivo" className="cursor-pointer">Efectivo</label>
          </div>
        </RadioGroup>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {paymentMethod === "pago_movil" ? (
            <>
              <FormField
                control={form.control}
                name="banco_origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco Origen</FormLabel>
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
                name="cedula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cédula</FormLabel>
                    <FormControl>
                      <Input placeholder="12345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="months_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meses Pagados</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "mes" : "meses"}
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
                name="numero_referencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Referencia</FormLabel>
                    <FormControl>
                      <Input placeholder="0000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_pago"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Pago</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : "Selecciona una fecha"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono_origen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono Origen</FormLabel>
                    <FormControl>
                      <Input placeholder="04121234567" maxLength={11} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comprobante"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Comprobante de Pago</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => onChange(e.target.files)}
                          {...field}
                        />
                        <Upload className="h-4 w-4" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="months_paid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meses Pagados</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(12)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "mes" : "meses"}
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
                name="moneda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moneda</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="BS" id="BS" />
                        <label htmlFor="BS" className="cursor-pointer">Bolívares (Bs)</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="USD" id="USD" />
                        <label htmlFor="USD" className="cursor-pointer">Dólares ($)</label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monto_total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Total</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
