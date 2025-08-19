-- Set up webhook for custom email verification
-- This will configure the auth.send_email webhook to call our custom edge function

-- First, let's insert the webhook configuration
INSERT INTO auth.hooks (id, hook_name, hook_url, events, created_at)
VALUES (
  gen_random_uuid(),
  'send-email',
  concat(current_setting('app.settings.api_external_url', true), '/functions/v1/send-email'),
  '{"user.confirmation.requested"}',
  now()
) ON CONFLICT (hook_name) DO UPDATE SET
  hook_url = EXCLUDED.hook_url,
  events = EXCLUDED.events;