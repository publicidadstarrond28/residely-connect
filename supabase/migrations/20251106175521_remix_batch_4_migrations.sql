
-- Migration: 20251105022244

-- Migration: 20251030011501
-- Create enum types
CREATE TYPE user_role AS ENUM ('resident', 'owner');
CREATE TYPE residence_type AS ENUM ('residence', 'hotel', 'apartment');
CREATE TYPE residence_gender AS ENUM ('male', 'female', 'mixed');
CREATE TYPE residence_status AS ENUM ('available', 'occupied');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'resident',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create residences table
CREATE TABLE public.residences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  price_per_month DECIMAL(10, 2) NOT NULL,
  residence_type residence_type NOT NULL,
  gender_preference residence_gender NOT NULL,
  status residence_status DEFAULT 'available' NOT NULL,
  capacity INTEGER DEFAULT 1 NOT NULL,
  current_occupants INTEGER DEFAULT 0 NOT NULL,
  amenities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create residence_photos table
CREATE TABLE public.residence_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(residence_id, user_id)
);

-- Create residence_applications table
CREATE TABLE public.residence_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  residence_id UUID REFERENCES public.residences(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residence_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.residence_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for residences
CREATE POLICY "Anyone can view available residences" ON public.residences FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert residences" ON public.residences FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid() AND role = 'owner'));
CREATE POLICY "Owners can update own residences" ON public.residences FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid()));
CREATE POLICY "Owners can delete own residences" ON public.residences FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = owner_id AND user_id = auth.uid()));

-- RLS Policies for residence_photos
CREATE POLICY "Anyone can view residence photos" ON public.residence_photos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owners can insert photos for own residences" ON public.residence_photos FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Owners can delete photos from own residences" ON public.residence_photos FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid()));
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND user_id = auth.uid()));

-- RLS Policies for residence_applications
CREATE POLICY "Users can view own applications" ON public.residence_applications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = applicant_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert own applications" ON public.residence_applications FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = applicant_id AND user_id = auth.uid()));
CREATE POLICY "Owners can update applications for own residences" ON public.residence_applications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));

-- RLS Policies for messages
CREATE POLICY "Users can view messages for their residences" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.residences r JOIN public.profiles p ON r.owner_id = p.id WHERE r.id = residence_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = sender_id AND user_id = auth.uid()));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND profiles.user_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id AND profiles.user_id = auth.uid()));

-- Create function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'resident')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_residences_updated_at BEFORE UPDATE ON public.residences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_residence_applications_updated_at BEFORE UPDATE ON public.residence_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Migration: 20251031144805
-- Crear tabla de habitaciones (rooms)
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
  room_number TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_month NUMERIC NOT NULL,
  current_occupants INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Políticas para rooms
CREATE POLICY "Todos pueden ver habitaciones" 
ON public.rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Dueños pueden insertar habitaciones propias" 
ON public.rooms 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = rooms.residence_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Dueños pueden actualizar habitaciones propias" 
ON public.rooms 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = rooms.residence_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Dueños pueden eliminar habitaciones propias" 
ON public.rooms 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM residences r
    JOIN profiles p ON r.owner_id = p.id
    WHERE r.id = rooms.residence_id AND p.user_id = auth.uid()
  )
);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_rooms_updated_at
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Modificar tabla messages para soportar archivos
ALTER TABLE public.messages 
ADD COLUMN file_url TEXT,
ADD COLUMN file_type TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size INTEGER;

-- Crear bucket de storage para archivos de chat
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-files', 'chat-files', false);

-- Políticas para storage de chat-files
CREATE POLICY "Usuarios autenticados pueden subir archivos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'chat-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios pueden ver archivos de sus conversaciones" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'chat-files' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios pueden eliminar sus propios archivos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'chat-files' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Migration: 20251101135455
-- Agregar room_id a residence_applications
ALTER TABLE public.residence_applications 
ADD COLUMN room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL;

-- Función para actualizar disponibilidad de habitaciones
CREATE OR REPLACE FUNCTION public.update_room_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si la aplicación fue aceptada
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' AND NEW.room_id IS NOT NULL THEN
    -- Incrementar current_occupants
    UPDATE rooms
    SET current_occupants = current_occupants + 1,
        is_available = CASE 
          WHEN current_occupants + 1 >= capacity THEN false 
          ELSE true 
        END
    WHERE id = NEW.room_id;
    
    -- Actualizar estado de la residencia si es necesario
    UPDATE residences r
    SET status = CASE 
      WHEN (
        SELECT COUNT(*) FROM rooms 
        WHERE residence_id = r.id AND is_available = true
      ) = 0 THEN 'occupied'::residence_status
      ELSE 'available'::residence_status
    END
    WHERE id = NEW.residence_id;
  END IF;
  
  -- Si la aplicación fue rechazada o el residente se fue
  IF (NEW.status = 'rejected' OR NEW.status = 'left') 
     AND OLD.status = 'accepted' 
     AND NEW.room_id IS NOT NULL THEN
    -- Decrementar current_occupants
    UPDATE rooms
    SET current_occupants = GREATEST(0, current_occupants - 1),
        is_available = true
    WHERE id = NEW.room_id;
    
    -- Actualizar estado de la residencia
    UPDATE residences r
    SET status = CASE 
      WHEN (
        SELECT COUNT(*) FROM rooms 
        WHERE residence_id = r.id AND is_available = true
      ) > 0 THEN 'available'::residence_status
      ELSE 'occupied'::residence_status
    END
    WHERE id = NEW.residence_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para actualizar disponibilidad
CREATE TRIGGER trigger_update_room_availability
AFTER UPDATE ON public.residence_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_room_availability();

-- Migration: 20251101141231
-- Actualizar enum residence_type para incluir los tipos faltantes
ALTER TYPE residence_type ADD VALUE IF NOT EXISTS 'room';
ALTER TYPE residence_type ADD VALUE IF NOT EXISTS 'studio';

-- Migration: 20251101141557
-- Crear bucket para fotos de residencias
INSERT INTO storage.buckets (id, name, public)
VALUES ('residence-photos', 'residence-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para el bucket de fotos de residencias
CREATE POLICY "Cualquiera puede ver fotos de residencias"
ON storage.objects FOR SELECT
USING (bucket_id = 'residence-photos');

CREATE POLICY "Dueños pueden subir fotos de sus residencias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'residence-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Dueños pueden actualizar fotos de sus residencias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'residence-photos' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Dueños pueden eliminar fotos de sus residencias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'residence-photos' AND
  auth.uid() IS NOT NULL
);

-- Migration: 20251102005544
-- Crear tabla de conversaciones 1-a-1 entre cliente y dueño
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residence_id UUID NOT NULL,
  client_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(residence_id, client_id, owner_id)
);

-- Habilitar RLS en conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversations: solo participantes pueden ver
CREATE POLICY "Participants can view conversations"
ON public.conversations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = conversations.client_id AND profiles.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = conversations.owner_id AND profiles.user_id = auth.uid()
  )
);

-- Política para crear conversaciones (clientes pueden iniciarlas)
CREATE POLICY "Clients can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = conversations.client_id AND profiles.user_id = auth.uid()
  )
);

-- Agregar conversation_id a la tabla messages (mantener residence_id por compatibilidad)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID;

-- Actualizar RLS de messages para usar conversation_id
DROP POLICY IF EXISTS "Users can view messages for their residences" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

CREATE POLICY "Participants can view conversation messages"
ON public.messages
FOR SELECT
USING (
  conversation_id IS NULL OR
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.client_id AND profiles.user_id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.owner_id AND profiles.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.client_id AND profiles.user_id = auth.uid())
      OR
      EXISTS (SELECT 1 FROM profiles WHERE profiles.id = c.owner_id AND profiles.user_id = auth.uid())
    )
  )
);

-- Trigger para actualizar updated_at en conversations
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear notificación cuando llega un mensaje
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  -- Obtener el nombre del remitente
  SELECT full_name INTO sender_name
  FROM profiles
  WHERE id = NEW.sender_id;

  -- Obtener el destinatario (el otro participante de la conversación)
  SELECT CASE
    WHEN c.client_id = NEW.sender_id THEN c.owner_id
    ELSE c.client_id
  END INTO recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Crear notificación para el destinatario
  IF recipient_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      recipient_id,
      'new_message',
      'Nuevo mensaje',
      sender_name || ' te ha enviado un mensaje'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para notificaciones de mensajes
DROP TRIGGER IF EXISTS notify_message_trigger ON public.messages;
CREATE TRIGGER notify_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Habilitar realtime para conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Migration: 20251103030841
-- Crear función para notificar al dueño cuando hay una nueva solicitud de habitación
CREATE OR REPLACE FUNCTION public.notify_application_to_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_profile_id UUID;
  applicant_name TEXT;
  room_number TEXT;
BEGIN
  -- Obtener el profile_id del dueño
  SELECT p.id INTO owner_profile_id
  FROM residences r
  JOIN profiles p ON r.owner_id = p.id
  WHERE r.id = NEW.residence_id;

  -- Obtener el nombre del solicitante
  SELECT full_name INTO applicant_name
  FROM profiles
  WHERE id = NEW.applicant_id;

  -- Obtener el número de habitación
  SELECT rooms.room_number INTO room_number
  FROM rooms
  WHERE id = NEW.room_id;

  -- Crear notificación para el dueño
  IF owner_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      owner_profile_id,
      'new_application',
      'Nueva solicitud de habitación',
      applicant_name || ' ha solicitado la habitación ' || COALESCE(room_number, 'sin número')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Crear trigger para ejecutar la función cuando se inserta una nueva solicitud
DROP TRIGGER IF EXISTS on_application_created ON residence_applications;

CREATE TRIGGER on_application_created
  AFTER INSERT ON residence_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_to_owner();

-- Migration: 20251103031011
-- Crear función para notificar al dueño cuando hay una nueva solicitud de habitación
CREATE OR REPLACE FUNCTION public.notify_application_to_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_profile_id UUID;
  applicant_name TEXT;
  room_number TEXT;
BEGIN
  -- Obtener el profile_id del dueño
  SELECT p.id INTO owner_profile_id
  FROM residences r
  JOIN profiles p ON r.owner_id = p.id
  WHERE r.id = NEW.residence_id;

  -- Obtener el nombre del solicitante
  SELECT full_name INTO applicant_name
  FROM profiles
  WHERE id = NEW.applicant_id;

  -- Obtener el número de habitación
  SELECT rooms.room_number INTO room_number
  FROM rooms
  WHERE id = NEW.room_id;

  -- Crear notificación para el dueño
  IF owner_profile_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      owner_profile_id,
      'new_application',
      'Nueva solicitud de habitación',
      applicant_name || ' ha solicitado la habitación ' || COALESCE(room_number, 'sin número')
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Crear trigger para ejecutar la función cuando se inserta una nueva solicitud
DROP TRIGGER IF EXISTS on_application_created ON residence_applications;

CREATE TRIGGER on_application_created
  AFTER INSERT ON residence_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_application_to_owner();

-- Migration: 20251104002601
-- Add rejection counter to residence_applications
ALTER TABLE public.residence_applications 
ADD COLUMN IF NOT EXISTS rejection_count integer NOT NULL DEFAULT 0;

-- Add constraint to ensure rejection_count is never negative
ALTER TABLE public.residence_applications 
ADD CONSTRAINT rejection_count_positive CHECK (rejection_count >= 0);

-- Create or replace function to increment rejection counter when status changes to rejected
CREATE OR REPLACE FUNCTION public.increment_rejection_counter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If status changed from accepted/pending to rejected, increment counter
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejection_count = OLD.rejection_count + 1;
  END IF;
  
  -- If status changed from rejected to pending, keep the counter
  IF NEW.status = 'pending' AND OLD.status = 'rejected' THEN
    NEW.rejection_count = OLD.rejection_count;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_application_status_change ON public.residence_applications;
CREATE TRIGGER on_application_status_change
  BEFORE UPDATE ON public.residence_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_rejection_counter();

-- Migration: 20251105014833
-- Add rejection counter to residence_applications
ALTER TABLE public.residence_applications 
ADD COLUMN IF NOT EXISTS rejection_count integer NOT NULL DEFAULT 0;

-- Drop constraint if exists and recreate
ALTER TABLE public.residence_applications 
DROP CONSTRAINT IF EXISTS rejection_count_positive;

ALTER TABLE public.residence_applications 
ADD CONSTRAINT rejection_count_positive CHECK (rejection_count >= 0);

-- Create or replace function to increment rejection counter when status changes to rejected
CREATE OR REPLACE FUNCTION public.increment_rejection_counter()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If status changed from accepted/pending to rejected, increment counter
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    NEW.rejection_count = OLD.rejection_count + 1;
  END IF;
  
  -- If status changed from rejected to pending, keep the counter
  IF NEW.status = 'pending' AND OLD.status = 'rejected' THEN
    NEW.rejection_count = OLD.rejection_count;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_application_status_change ON public.residence_applications;
CREATE TRIGGER on_application_status_change
  BEFORE UPDATE ON public.residence_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_rejection_counter();

-- Migration: 20251105020931
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


-- Migration: 20251105031640
-- Actualizar el enum de tipos de residencia  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'residence_type') THEN
    ALTER TYPE residence_type RENAME TO residence_type_old;
  END IF;
  
  CREATE TYPE residence_type AS ENUM ('apartment', 'house', 'room', 'hotel');
  
  ALTER TABLE residences ALTER COLUMN residence_type TYPE residence_type USING residence_type::text::residence_type;
  
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'residence_type_old') THEN
    DROP TYPE residence_type_old;
  END IF;
END $$;

-- Agregar columna de género a las habitaciones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rooms' AND column_name = 'gender_preference'
  ) THEN
    ALTER TABLE rooms ADD COLUMN gender_preference text DEFAULT 'mixed' CHECK (gender_preference IN ('mixed', 'male', 'female'));
  END IF;
END $$;

-- Crear tabla para fotos de habitaciones
CREATE TABLE IF NOT EXISTS room_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'room_photos' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE room_photos ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- RLS policies para room_photos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_photos' AND policyname = 'Todos pueden ver fotos de habitaciones'
  ) THEN
    CREATE POLICY "Todos pueden ver fotos de habitaciones"
      ON room_photos FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_photos' AND policyname = 'Dueños pueden insertar fotos de habitaciones propias'
  ) THEN
    CREATE POLICY "Dueños pueden insertar fotos de habitaciones propias"
      ON room_photos FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM rooms r
          JOIN residences res ON r.residence_id = res.id
          JOIN profiles p ON res.owner_id = p.id
          WHERE r.id = room_photos.room_id AND p.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'room_photos' AND policyname = 'Dueños pueden eliminar fotos de habitaciones propias'
  ) THEN
    CREATE POLICY "Dueños pueden eliminar fotos de habitaciones propias"
      ON room_photos FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM rooms r
          JOIN residences res ON r.residence_id = res.id
          JOIN profiles p ON res.owner_id = p.id
          WHERE r.id = room_photos.room_id AND p.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Migration: 20251106162955
-- Crear tabla para áreas de apartamentos
CREATE TABLE IF NOT EXISTS public.apartment_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL CHECK (area_type IN ('sala', 'cocina', 'baño', 'habitacion')),
  area_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para fotos de áreas de apartamentos
CREATE TABLE IF NOT EXISTS public.apartment_area_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.apartment_areas(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.apartment_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apartment_area_photos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para apartment_areas
CREATE POLICY "Todos pueden ver áreas de apartamentos"
  ON public.apartment_areas FOR SELECT
  USING (true);

CREATE POLICY "Dueños pueden insertar áreas en apartamentos propios"
  ON public.apartment_areas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden actualizar áreas en apartamentos propios"
  ON public.apartment_areas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden eliminar áreas en apartamentos propios"
  ON public.apartment_areas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

-- Políticas RLS para apartment_area_photos
CREATE POLICY "Todos pueden ver fotos de áreas"
  ON public.apartment_area_photos FOR SELECT
  USING (true);

CREATE POLICY "Dueños pueden insertar fotos en áreas propias"
  ON public.apartment_area_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM apartment_areas aa
      JOIN residences r ON aa.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE aa.id = apartment_area_photos.area_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden eliminar fotos de áreas propias"
  ON public.apartment_area_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM apartment_areas aa
      JOIN residences r ON aa.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE aa.id = apartment_area_photos.area_id
        AND p.user_id = auth.uid()
    )
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_apartment_areas_updated_at
  BEFORE UPDATE ON public.apartment_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251106163233
-- Las tablas ya existen, solo necesitamos asegurarnos que las políticas estén bien configuradas

-- Eliminar políticas existentes si existen y recrearlas
DROP POLICY IF EXISTS "Todos pueden ver áreas de apartamentos" ON public.apartment_areas;
DROP POLICY IF EXISTS "Dueños pueden insertar áreas en apartamentos propios" ON public.apartment_areas;
DROP POLICY IF EXISTS "Dueños pueden actualizar áreas en apartamentos propios" ON public.apartment_areas;
DROP POLICY IF EXISTS "Dueños pueden eliminar áreas en apartamentos propios" ON public.apartment_areas;
DROP POLICY IF EXISTS "Todos pueden ver fotos de áreas" ON public.apartment_area_photos;
DROP POLICY IF EXISTS "Dueños pueden insertar fotos en áreas propias" ON public.apartment_area_photos;
DROP POLICY IF EXISTS "Dueños pueden eliminar fotos de áreas propias" ON public.apartment_area_photos;

-- Políticas RLS para apartment_areas
CREATE POLICY "Todos pueden ver áreas de apartamentos"
  ON public.apartment_areas FOR SELECT
  USING (true);

CREATE POLICY "Dueños pueden insertar áreas en apartamentos propios"
  ON public.apartment_areas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden actualizar áreas en apartamentos propios"
  ON public.apartment_areas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden eliminar áreas en apartamentos propios"
  ON public.apartment_areas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = apartment_areas.residence_id
        AND p.user_id = auth.uid()
    )
  );

-- Políticas RLS para apartment_area_photos
CREATE POLICY "Todos pueden ver fotos de áreas"
  ON public.apartment_area_photos FOR SELECT
  USING (true);

CREATE POLICY "Dueños pueden insertar fotos en áreas propias"
  ON public.apartment_area_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM apartment_areas aa
      JOIN residences r ON aa.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE aa.id = apartment_area_photos.area_id
        AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Dueños pueden eliminar fotos de áreas propias"
  ON public.apartment_area_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM apartment_areas aa
      JOIN residences r ON aa.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE aa.id = apartment_area_photos.area_id
        AND p.user_id = auth.uid()
    )
  );
