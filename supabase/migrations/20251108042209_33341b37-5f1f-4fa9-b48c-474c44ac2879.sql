-- Create table for residence areas (for apartments)
CREATE TABLE public.residence_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  residence_id UUID NOT NULL REFERENCES public.residences(id) ON DELETE CASCADE,
  area_type TEXT NOT NULL,
  area_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.residence_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for residence_areas
CREATE POLICY "Anyone can view residence areas"
  ON public.residence_areas
  FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert areas for own residences"
  ON public.residence_areas
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = residence_areas.residence_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update areas for own residences"
  ON public.residence_areas
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = residence_areas.residence_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete areas for own residences"
  ON public.residence_areas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM residences r
      JOIN profiles p ON r.owner_id = p.id
      WHERE r.id = residence_areas.residence_id AND p.user_id = auth.uid()
    )
  );

-- Create table for area photos
CREATE TABLE public.area_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.residence_areas(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.area_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for area_photos
CREATE POLICY "Anyone can view area photos"
  ON public.area_photos
  FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert area photos"
  ON public.area_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM residence_areas ra
      JOIN residences r ON ra.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE ra.id = area_photos.area_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete area photos"
  ON public.area_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM residence_areas ra
      JOIN residences r ON ra.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE ra.id = area_photos.area_id AND p.user_id = auth.uid()
    )
  );

-- Create table for room photos
CREATE TABLE public.room_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.room_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_photos
CREATE POLICY "Anyone can view room photos"
  ON public.room_photos
  FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert room photos"
  ON public.room_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rooms rm
      JOIN residences r ON rm.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE rm.id = room_photos.room_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete room photos"
  ON public.room_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM rooms rm
      JOIN residences r ON rm.residence_id = r.id
      JOIN profiles p ON r.owner_id = p.id
      WHERE rm.id = room_photos.room_id AND p.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_residence_areas_residence_id ON public.residence_areas(residence_id);
CREATE INDEX idx_area_photos_area_id ON public.area_photos(area_id);
CREATE INDEX idx_room_photos_room_id ON public.room_photos(room_id);