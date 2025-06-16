-- Migration to add new user preference columns
-- Run this to update existing user_preferences table with new columns

-- Add new columns to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS volume_level FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS quran_audio_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hadith_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS azkar_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_reciter VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_server VARCHAR(50);

-- Update existing records to have default values for new columns
UPDATE user_preferences 
SET 
    volume_level = COALESCE(volume_level, 1.0),
    quran_audio_favorites = COALESCE(quran_audio_favorites, '[]'),
    hadith_favorites = COALESCE(hadith_favorites, '[]'),
    azkar_favorites = COALESCE(azkar_favorites, '[]')
WHERE volume_level IS NULL OR quran_audio_favorites IS NULL OR hadith_favorites IS NULL OR azkar_favorites IS NULL;

COMMIT;
