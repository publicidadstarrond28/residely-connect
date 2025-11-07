-- Add next_payment_due field to residence_applications
ALTER TABLE residence_applications 
ADD COLUMN IF NOT EXISTS next_payment_due DATE;

-- Add reminder configuration
CREATE TABLE IF NOT EXISTS payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES residence_applications(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL DEFAULT 7,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

-- Owners can manage reminders for their residences
CREATE POLICY "Owners can view reminders for own residences"
ON payment_reminders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM residence_applications ra
    JOIN residences r ON ra.residence_id = r.id
    JOIN profiles p ON r.owner_id = p.id
    WHERE ra.id = payment_reminders.application_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update reminders for own residences"
ON payment_reminders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM residence_applications ra
    JOIN residences r ON ra.residence_id = r.id
    JOIN profiles p ON r.owner_id = p.id
    WHERE ra.id = payment_reminders.application_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can insert reminders for own residences"
ON payment_reminders FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM residence_applications ra
    JOIN residences r ON ra.residence_id = r.id
    JOIN profiles p ON r.owner_id = p.id
    WHERE ra.id = payment_reminders.application_id
    AND p.user_id = auth.uid()
  )
);

-- Trigger to update next_payment_due when payment is confirmed
CREATE OR REPLACE FUNCTION update_next_payment_due()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- When payment is confirmed, update next payment due date
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.application_id IS NOT NULL THEN
    UPDATE residence_applications
    SET next_payment_due = CURRENT_DATE + INTERVAL '1 month' * NEW.months_paid
    WHERE id = NEW.application_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_payment_confirmed_update_due
AFTER UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_next_payment_due();

-- Trigger to set initial next_payment_due when application is accepted
CREATE OR REPLACE FUNCTION set_initial_payment_due()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    NEW.next_payment_due = CURRENT_DATE + INTERVAL '1 month';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_application_accepted_set_due
BEFORE UPDATE ON residence_applications
FOR EACH ROW
EXECUTE FUNCTION set_initial_payment_due();