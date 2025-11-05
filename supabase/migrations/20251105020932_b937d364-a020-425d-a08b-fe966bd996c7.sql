-- Create payment method enum
CREATE TYPE payment_method AS ENUM ('pago_movil', 'efectivo');

-- Create payment status enum
CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'rejected');

-- Create currency enum
CREATE TYPE currency_type AS ENUM ('BS', 'USD');

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.residence_applications(id) ON DELETE SET NULL,
  
  -- Payment details
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  months_paid INTEGER NOT NULL CHECK (months_paid >= 1 AND months_paid <= 12),
  
  -- Pago Móvil fields
  banco_origen TEXT,
  cedula TEXT,
  numero_referencia TEXT,
  fecha_pago DATE,
  telefono_origen TEXT,
  comprobante_url TEXT,
  
  -- Efectivo fields
  moneda currency_type,
  monto_total NUMERIC,
  
  -- Confirmation tracking
  confirmed_at TIMESTAMP WITH TIME ZONE,
  confirmed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view own payments"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = payments.user_id
    AND profiles.user_id = auth.uid()
  )
);

-- Owners can view payments for their residences
CREATE POLICY "Owners can view residence payments"
ON public.payments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = payments.residence_id
    AND p.user_id = auth.uid()
  )
);

-- Users can create payments
CREATE POLICY "Users can create payments"
ON public.payments
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = payments.user_id
    AND profiles.user_id = auth.uid()
  )
);

-- Owners can update payment status for their residences
CREATE POLICY "Owners can update residence payments"
ON public.payments
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = payments.residence_id
    AND p.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle payment confirmation
CREATE OR REPLACE FUNCTION public.handle_payment_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- If payment was confirmed
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Update application to accepted if exists
    IF NEW.application_id IS NOT NULL THEN
      UPDATE residence_applications
      SET status = 'accepted'
      WHERE id = NEW.application_id;
    END IF;
    
    -- Send notification to user
    INSERT INTO notifications (user_id, type, title, message)
    SELECT 
      p.id,
      'payment_confirmed',
      'Pago confirmado',
      'Tu pago ha sido confirmado. La residencia ha sido asignada.'
    FROM profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  
  -- If payment was rejected
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO notifications (user_id, type, title, message)
    SELECT 
      p.id,
      'payment_rejected',
      'Pago rechazado',
      COALESCE('Tu pago ha sido rechazado. Razón: ' || NEW.rejection_reason, 'Tu pago ha sido rechazado.')
    FROM profiles p
    WHERE p.id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for payment confirmation
CREATE TRIGGER on_payment_status_change
AFTER UPDATE ON public.payments
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.handle_payment_confirmation();

-- Create indexes for better performance
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_residence_id ON public.payments(residence_id);
CREATE INDEX idx_payments_status ON public.payments(status);