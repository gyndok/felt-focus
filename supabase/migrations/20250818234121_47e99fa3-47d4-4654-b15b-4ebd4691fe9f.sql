-- Add DELETE policy for admins to delete feedback
CREATE POLICY "Admin can delete feedback" 
ON public.feedback 
FOR DELETE 
USING ((auth.jwt() ->> 'email'::text) = 'gyndok@yahoo.com'::text);