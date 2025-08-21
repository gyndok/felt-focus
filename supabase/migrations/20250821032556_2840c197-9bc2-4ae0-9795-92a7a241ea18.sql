-- Update existing tournaments with game_type 'NLH' to 'NLHE'
UPDATE tournaments 
SET game_type = 'NLHE' 
WHERE game_type = 'NLH';