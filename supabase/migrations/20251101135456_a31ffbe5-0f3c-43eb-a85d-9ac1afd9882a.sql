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