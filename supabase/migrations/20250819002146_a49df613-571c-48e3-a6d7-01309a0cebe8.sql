-- Create function to securely delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verify the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete all user data in correct order (respecting foreign keys)
  DELETE FROM public.tournament_updates 
  WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE user_id = auth.uid());
  
  DELETE FROM public.tournaments WHERE user_id = auth.uid();
  DELETE FROM public.poker_sessions WHERE user_id = auth.uid();
  DELETE FROM public.feedback WHERE user_id = auth.uid();
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- Note: The auth.users deletion will be handled by the application
  -- since we can't delete from auth schema in a function
END;
$$;