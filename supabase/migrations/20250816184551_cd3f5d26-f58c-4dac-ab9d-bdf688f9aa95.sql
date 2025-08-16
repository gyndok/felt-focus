-- Add game_type column to tournaments table
ALTER TABLE public.tournaments 
ADD COLUMN game_type text NOT NULL DEFAULT 'NLH';