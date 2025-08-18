-- Remove user_email column from feedback table for security
-- Email addresses can be retrieved from auth.users when needed by admin
-- This follows the principle of least privilege and data minimization

ALTER TABLE public.feedback 
DROP COLUMN IF EXISTS user_email;