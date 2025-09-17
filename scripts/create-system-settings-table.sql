-- Create system_settings table for application configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  auto_approve_suggestions BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one row exists in this table
  CONSTRAINT single_row_constraint CHECK (id = 1)
);

-- Insert default settings if not exists
INSERT INTO public.system_settings (id, auto_approve_suggestions)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Create or replace trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment to document the table
COMMENT ON TABLE public.system_settings IS 'Global application configuration settings (singleton table)';
COMMENT ON COLUMN public.system_settings.auto_approve_suggestions IS 'Whether suggestions are automatically approved (true) or require manual approval (false)';
