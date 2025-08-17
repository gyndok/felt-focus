-- Add reviewed field to feedback table
ALTER TABLE public.feedback 
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE NULL,
ADD COLUMN reviewed_by UUID NULL;

-- Create admin policy to allow viewing all feedback for gyndok@yahoo.com
CREATE POLICY "Admin can view all feedback" 
ON public.feedback 
FOR SELECT 
USING (
  auth.jwt() ->> 'email' = 'gyndok@yahoo.com'
  OR auth.uid() = user_id
);

-- Create admin policy to allow updating feedback as reviewed
CREATE POLICY "Admin can mark feedback as reviewed" 
ON public.feedback 
FOR UPDATE 
USING (auth.jwt() ->> 'email' = 'gyndok@yahoo.com')
WITH CHECK (auth.jwt() ->> 'email' = 'gyndok@yahoo.com');

-- Enable realtime for feedback table
ALTER TABLE public.feedback REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;