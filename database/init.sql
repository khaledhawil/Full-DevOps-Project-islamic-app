-- Islamic App Database Initialization Script
-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    public_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create user_phrases table
CREATE TABLE IF NOT EXISTS user_phrases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phrase TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tasbeh_counts table
CREATE TABLE IF NOT EXISTS tasbeh_counts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phrase VARCHAR(200) NOT NULL,
    count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phrase)
);

-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude REAL,
    longitude REAL,
    timezone VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    daily_goal INTEGER DEFAULT 100,
    sound_enabled BOOLEAN DEFAULT TRUE,
    volume_level FLOAT DEFAULT 1.0,
    prayer_notifications JSONB DEFAULT '{}',
    language_preference VARCHAR(10) DEFAULT 'ar',
    quran_audio_favorites JSONB DEFAULT '[]',
    hadith_favorites JSONB DEFAULT '[]',
    azkar_favorites JSONB DEFAULT '[]',
    last_reciter VARCHAR(50),
    last_server VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quran_progress table
CREATE TABLE IF NOT EXISTS quran_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    total_ayahs_read INTEGER DEFAULT 0,
    last_read_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reading_streak INTEGER DEFAULT 0,
    UNIQUE(user_id, surah_number, ayah_number)
);

-- Create quran_bookmarks table
CREATE TABLE IF NOT EXISTS quran_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, surah_number, ayah_number)
);

-- Create hadith_favorites table
CREATE TABLE IF NOT EXISTS hadith_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    hadith_collection VARCHAR(100) NOT NULL,
    hadith_number INTEGER NOT NULL,
    hadith_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, hadith_collection, hadith_number)
);

-- Create user_reading_stats table
CREATE TABLE IF NOT EXISTS user_reading_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    quran_verses_read INTEGER DEFAULT 0,
    hadiths_read INTEGER DEFAULT 0,
    daily_reading_streak INTEGER DEFAULT 0,
    total_reading_days INTEGER DEFAULT 0,
    last_reading_date DATE,
    favorite_reciter VARCHAR(50) DEFAULT 'ar.alafasy'
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    achievement_data JSONB DEFAULT '{}',
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_public_id ON users(public_id);
CREATE INDEX IF NOT EXISTS idx_tasbeh_counts_user_id ON tasbeh_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_progress_user_id ON quran_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user_id ON quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_hadith_favorites_user_id ON hadith_favorites(user_id);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_locations_updated_at ON user_locations;
CREATE TRIGGER update_user_locations_updated_at
    BEFORE UPDATE ON user_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
