-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  buy_in NUMERIC NOT NULL,
  house_rake NUMERIC NOT NULL DEFAULT 0,
  starting_chips NUMERIC NOT NULL,
  guarantee NUMERIC,
  total_players INTEGER,
  small_blind NUMERIC NOT NULL,
  big_blind NUMERIC NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  players_left INTEGER,
  current_chips NUMERIC NOT NULL,
  avg_stack NUMERIC,
  bb_stack NUMERIC,
  status TEXT NOT NULL DEFAULT 'active', -- active, finished, eliminated
  prize_won NUMERIC DEFAULT 0,
  final_position INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament updates table for tracking progress
CREATE TABLE public.tournament_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  small_blind NUMERIC NOT NULL,
  big_blind NUMERIC NOT NULL,
  current_chips NUMERIC NOT NULL,
  players_left INTEGER,
  avg_stack NUMERIC,
  bb_stack NUMERIC,
  notes TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "Users can view their own tournaments" 
ON public.tournaments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tournaments" 
ON public.tournaments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create policies for tournament updates
CREATE POLICY "Users can view their own tournament updates" 
ON public.tournament_updates 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.tournaments WHERE id = tournament_id));

CREATE POLICY "Users can create tournament updates" 
ON public.tournament_updates 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.tournaments WHERE id = tournament_id));

CREATE POLICY "Users can update their own tournament updates" 
ON public.tournament_updates 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.tournaments WHERE id = tournament_id));

CREATE POLICY "Users can delete their own tournament updates" 
ON public.tournament_updates 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.tournaments WHERE id = tournament_id));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tournaments_updated_at
BEFORE UPDATE ON public.tournaments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();