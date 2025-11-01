-- Actualizar enum residence_type para incluir los tipos faltantes
ALTER TYPE residence_type ADD VALUE IF NOT EXISTS 'room';
ALTER TYPE residence_type ADD VALUE IF NOT EXISTS 'studio';