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