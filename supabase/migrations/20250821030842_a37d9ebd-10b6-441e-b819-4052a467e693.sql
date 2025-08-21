-- Add diverse tournament locations using specific tournament IDs
WITH tournament_list AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
  FROM tournaments 
  WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed'
)
UPDATE tournaments 
SET location = CASE 
  WHEN tournaments.id = (SELECT id FROM tournament_list WHERE rn = 1) THEN 'Bellagio'
  WHEN tournaments.id = (SELECT id FROM tournament_list WHERE rn = 2) THEN 'WSOP'
  WHEN tournaments.id = (SELECT id FROM tournament_list WHERE rn = 3) THEN 'Venetian'
  WHEN tournaments.id = (SELECT id FROM tournament_list WHERE rn = 4) THEN 'Borgata'
  WHEN tournaments.id = (SELECT id FROM tournament_list WHERE rn = 5) THEN 'Commerce Casino'
  ELSE 'Aria'
END
WHERE user_id = '8c2363da-78ae-4a19-a9ae-0db53a489fed';