-- Update the receipts bucket to be public for easier viewing
UPDATE storage.buckets 
SET public = true 
WHERE id = 'receipts';