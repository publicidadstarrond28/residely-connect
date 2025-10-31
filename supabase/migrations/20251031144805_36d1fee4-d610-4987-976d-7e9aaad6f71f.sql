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