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