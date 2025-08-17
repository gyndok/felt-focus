-- Add paused status and pause timestamps to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN is_paused BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resumed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN total_paused_duration INTEGER DEFAULT 0; -- in seconds

-- Update the status enum to include paused
ALTER TABLE public.tournaments 
DROP CONSTRAINT IF EXISTS tournaments_status_check;

ALTER TABLE public.tournaments 
ADD CONSTRAINT tournaments_status_check 
CHECK (status IN ('active', 'finished', 'eliminated', 'paused'));