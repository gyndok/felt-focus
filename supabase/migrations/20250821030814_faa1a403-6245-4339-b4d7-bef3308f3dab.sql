-- Add more diverse tournament locations for testing the dropdown
UPDATE tournaments 
SET location = CASE 
  WHEN ROW_NUMBER() OVER (ORDER BY created_at DESC) = 1 THEN 'Bellagio'
  WHEN ROW_NUMBER() OVER (ORDER BY created_at DESC) = 2 THEN 'WSOP'
  WHEN ROW_NUMBER() OVER (ORDER BY created_at DESC) = 3 THEN 'Venetian'
  WHEN ROW_NUMBER() OVER (ORDER BY created_at DESC) = 4 THEN 'Borgata'
  ELSE 'Aria'
END
WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed';