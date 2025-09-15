-- Add status column to suggestions table for content moderation
-- Add status column to suggestions table with proper constraints
ALTER TABLE public.suggestions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for better query performance on status filtering
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);

-- Update existing suggestions to have 'pending' status if they don't have one
UPDATE public.suggestions 
SET status = 'pending' 
WHERE status IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.suggestions.status IS 'Moderation status: pending (default), approved, or rejected';
