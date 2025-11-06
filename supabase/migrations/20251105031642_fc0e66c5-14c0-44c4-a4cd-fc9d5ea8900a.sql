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