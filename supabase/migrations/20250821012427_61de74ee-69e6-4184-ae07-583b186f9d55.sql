-- Add start_time and end_time columns to poker_sessions table
ALTER TABLE public.poker_sessions 
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;