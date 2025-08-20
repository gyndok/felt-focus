-- Add starting_bankroll column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN starting_bankroll numeric DEFAULT 0;