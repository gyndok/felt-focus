-- Update existing tournaments to have sample locations for testing
UPDATE tournaments 
SET location = CASE 
  WHEN id = (SELECT id FROM tournaments WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed' ORDER BY created_at DESC LIMIT 1 OFFSET 0) THEN 'Aria'
  WHEN id = (SELECT id FROM tournaments WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed' ORDER BY created_at DESC LIMIT 1 OFFSET 1) THEN 'Bellagio'
  WHEN id = (SELECT id FROM tournaments WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed' ORDER BY created_at DESC LIMIT 1 OFFSET 2) THEN 'WSOP'
  ELSE location
END
WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed' 
AND location IS NULL;