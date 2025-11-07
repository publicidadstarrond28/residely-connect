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