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