#!/bin/bash

# Database migration script to add new user preferences columns
# Run this script to update existing databases with the new schema

# Set database connection variables
DB_NAME=${DB_NAME:-islamic_app}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "Running database migration to add user preferences columns..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"

# Execute migration SQL
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/add_user_preferences_columns.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo "User preferences table now supports:"
    echo "  - volume_level: Audio volume preference"
    echo "  - quran_audio_favorites: Favorite reciters"
    echo "  - hadith_favorites: Favorite hadiths"
    echo "  - azkar_favorites: Favorite azkar"
    echo "  - last_reciter: Last used reciter"
    echo "  - last_server: Last used server"
else
    echo "❌ Migration failed!"
    exit 1
fi
