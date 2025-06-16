-- Migration to add user preferences columns for storing user data in database
-- This replaces localStorage with database storage for user preferences

-- Add new columns to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS volume_level FLOAT DEFAULT 1.0,
ADD COLUMN IF NOT EXISTS quran_audio_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS hadith_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS azkar_favorites JSON DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_reciter VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_server VARCHAR(50);

-- Update existing records to have default values
UPDATE user_preferences 
SET 
    volume_level = COALESCE(volume_level, 1.0),
    quran_audio_favorites = COALESCE(quran_audio_favorites, '[]'::json),
    hadith_favorites = COALESCE(hadith_favorites, '[]'::json),
    azkar_favorites = COALESCE(azkar_favorites, '[]'::json)
WHERE 
    volume_level IS NULL 
    OR quran_audio_favorites IS NULL 
    OR hadith_favorites IS NULL 
    OR azkar_favorites IS NULL;

-- Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add comment to document the purpose
COMMENT ON TABLE user_preferences IS 'Stores all user preferences including theme, favorites, audio settings, and last used options. Replaces localStorage for better data persistence across devices.';
