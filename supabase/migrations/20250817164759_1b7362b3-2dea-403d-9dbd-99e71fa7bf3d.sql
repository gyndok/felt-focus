-- Fix RLS policies for tournaments table to work with current auth setup
DROP POLICY IF EXISTS "Users can create their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can update their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can delete their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournaments" ON tournaments;

-- Create new policies that work with current authentication
CREATE POLICY "Users can create their own tournaments" 
ON tournaments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'sub')::uuid = user_id
);

CREATE POLICY "Users can view their own tournaments" 
ON tournaments 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'sub')::uuid = user_id
);

CREATE POLICY "Users can update their own tournaments" 
ON tournaments 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'sub')::uuid = user_id
);

CREATE POLICY "Users can delete their own tournaments" 
ON tournaments 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  (auth.jwt() ->> 'sub')::uuid = user_id
);