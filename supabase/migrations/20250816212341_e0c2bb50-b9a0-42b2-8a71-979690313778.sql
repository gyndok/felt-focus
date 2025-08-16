-- Add percent_paid column to tournaments table
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS percent_paid DECIMAL(5,2) DEFAULT 15.0;

-- Update the percent_paid column to have a reasonable default and constraint
ALTER TABLE public.tournaments ADD CONSTRAINT percent_paid_range CHECK (percent_paid > 0 AND percent_paid <= 100);