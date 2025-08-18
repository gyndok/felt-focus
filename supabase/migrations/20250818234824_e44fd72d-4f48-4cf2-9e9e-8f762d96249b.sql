-- Create function to delete user account and all associated data
CREATE OR REPLACE FUNCTION public.delete_user_account(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to delete their own account
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'You can only delete your own account';
  END IF;

  -- Delete all user data in correct order (respecting foreign keys)
  DELETE FROM public.tournament_updates 
  WHERE tournament_id IN (SELECT id FROM public.tournaments WHERE user_id = user_id_to_delete);
  
  DELETE FROM public.tournaments WHERE user_id = user_id_to_delete;
  DELETE FROM public.poker_sessions WHERE user_id = user_id_to_delete;
  DELETE FROM public.feedback WHERE user_id = user_id_to_delete;
  DELETE FROM public.profiles WHERE id = user_id_to_delete;
  
  -- Note: The auth.users deletion will be handled by the application
  -- since we can't delete from auth schema in a function
END;
$$;