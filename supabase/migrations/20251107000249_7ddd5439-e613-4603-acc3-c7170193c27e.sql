-- Tabla para configurar métodos de pago por residencia
CREATE TABLE IF NOT EXISTS public.residence_payment_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residence_id uuid NOT NULL REFERENCES residences(id) ON DELETE CASCADE,
  pago_movil_enabled boolean NOT NULL DEFAULT true,
  efectivo_enabled boolean NOT NULL DEFAULT true,
  banco_destino text,
  telefono_destino text,
  cedula_titular text,
  nombre_titular text,
  precio_bs numeric,
  precio_usd numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(residence_id)
);

-- Enable RLS
ALTER TABLE public.residence_payment_config ENABLE ROW LEVEL SECURITY;

-- Dueños pueden ver configuración de sus residencias
CREATE POLICY "Owners can view own residence payment config"
ON public.residence_payment_config
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = residence_payment_config.residence_id
    AND p.user_id = auth.uid()
  )
);

-- Dueños pueden insertar configuración de sus residencias
CREATE POLICY "Owners can insert own residence payment config"
ON public.residence_payment_config
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = residence_payment_config.residence_id
    AND p.user_id = auth.uid()
  )
);

-- Dueños pueden actualizar configuración de sus residencias
CREATE POLICY "Owners can update own residence payment config"
ON public.residence_payment_config
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = residence_payment_config.residence_id
    AND p.user_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_residence_payment_config_updated_at
BEFORE UPDATE ON public.residence_payment_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();