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