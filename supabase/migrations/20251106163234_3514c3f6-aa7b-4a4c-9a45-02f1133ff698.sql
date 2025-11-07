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