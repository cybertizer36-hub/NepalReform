-- Add missing columns to agendas table
ALTER TABLE agendas 
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft',
ADD COLUMN IF NOT EXISTS proposed_solutions TEXT[],
ADD COLUMN IF NOT EXISTS expected_outcomes TEXT[],
ADD COLUMN IF NOT EXISTS stakeholders TEXT[],
ADD COLUMN IF NOT EXISTS implementation_timeline TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS references TEXT[];

-- Add constraints for priority_level
ALTER TABLE agendas 
ADD CONSTRAINT agendas_priority_level_check 
CHECK (priority_level IN ('High', 'Medium', 'Low'));

-- Add constraints for status
ALTER TABLE agendas 
ADD CONSTRAINT agendas_status_check 
CHECK (status IN ('Draft', 'Under Review', 'Approved', 'Implemented'));

-- Create index for better performance on status and priority queries
CREATE INDEX IF NOT EXISTS idx_agendas_status ON agendas(status);
CREATE INDEX IF NOT EXISTS idx_agendas_priority ON agendas(priority_level);
CREATE INDEX IF NOT EXISTS idx_agendas_category ON agendas(category);

-- Update existing records to have default values
UPDATE agendas 
SET 
  priority_level = 'Medium',
  status = 'Draft'
WHERE priority_level IS NULL OR status IS NULL;
