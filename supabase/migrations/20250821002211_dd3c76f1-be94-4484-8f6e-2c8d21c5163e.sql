-- Add fields to poker_sessions table for live session tracking
ALTER TABLE public.poker_sessions 
ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;