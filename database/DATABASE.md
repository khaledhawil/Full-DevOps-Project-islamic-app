# Database Documentation

## Overview
The database layer provides PostgreSQL schema initialization, migrations, and data management for the Islamic App. It includes user management, Islamic features data, and application preferences.

## Database Schema

### Core Tables

#### Users Table
Primary user authentication and profile data:
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    public_id UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

#### User Preferences Table
User-specific application settings:
```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    prayer_notifications BOOLEAN DEFAULT TRUE,
    preferred_quran_reciter VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tasbeh Counts Table
Digital prayer counter data:
```sql
CREATE TABLE tasbeh_counts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    phrase VARCHAR(200) NOT NULL,
    count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phrase)
);
```

#### User Locations Table
Geographic data for prayer times:
```sql
CREATE TABLE user_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    city VARCHAR(100),
    country VARCHAR(100),
    latitude REAL,
    longitude REAL,
    timezone VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Reading Stats Table
Quran reading progress tracking:
```sql
CREATE TABLE user_reading_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    surah_number INTEGER NOT NULL,
    ayah_number INTEGER NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reading_time_seconds INTEGER DEFAULT 0
);
```

#### User Achievements Table
Gamification and progress tracking:
```sql
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points INTEGER DEFAULT 0
);
```

## Database Files

### 1. init.sql
**Purpose**: Initial database schema creation
**Usage**: Run once when setting up a new database instance

```bash
# Initialize new database
psql -U postgres -d islamic_app -f database/init.sql
```

**Features**:
- Creates all core tables with proper relationships
- Sets up UUID extension for secure public IDs
- Establishes foreign key constraints
- Configures default values and timestamps
- Creates necessary indexes for performance

### 2. migrate.sh
**Purpose**: Database migration script for schema updates
**Usage**: Apply schema changes to existing databases

```bash
# Make script executable
chmod +x database/migrate.sh

# Run migration
./database/migrate.sh
```

**Environment Variables**:
- `DB_NAME`: Database name (default: islamic_app)
- `DB_USER`: Database user (default: postgres)
- `DB_HOST`: Database host (default: localhost)
- `DB_PORT`: Database port (default: 5432)

**Features**:
- Validates database connection
- Applies migration files in order
- Provides rollback capabilities
- Logs migration status

### 3. migration_add_user_preferences.sql
**Purpose**: Specific migration to add user preferences functionality
**Usage**: Executed by migrate.sh or manually

```bash
# Apply specific migration
psql -U postgres -d islamic_app -f database/migration_add_user_preferences.sql
```

**Changes**:
- Adds new columns to user_preferences table
- Creates indexes for performance
- Sets default values for existing users

### 4. migrations/ Directory
**Purpose**: Contains versioned migration files
**Structure**: Organized chronologically for proper application order

```
migrations/
├── 001_initial_schema.sql
├── 002_add_user_preferences.sql
├── 003_add_achievements.sql
└── ...
```

## Database Setup and Management

### Initial Setup

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE islamic_app;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE islamic_app TO app_user;
\q
```

#### 3. Initialize Schema
```bash
# Apply initial schema
psql -U app_user -d islamic_app -f database/init.sql
```

### Migration Management

#### Apply Migrations
```bash
# Run all pending migrations
./database/migrate.sh

# Apply specific migration
psql -U app_user -d islamic_app -f database/migrations/specific_migration.sql
```

#### Create New Migration
```bash
# Create new migration file
touch database/migrations/$(date +%Y%m%d_%H%M%S)_description.sql

# Add migration SQL
cat << EOF > database/migrations/$(date +%Y%m%d_%H%M%S)_add_new_feature.sql
-- Migration: Add new feature
-- Created: $(date)

BEGIN;

-- Add new table or modify existing
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);

-- Create index if needed
CREATE INDEX idx_users_new_field ON users(new_field);

COMMIT;
EOF
```

### Backup and Restore

#### Database Backup
```bash
# Full database backup
pg_dump -U app_user -h localhost islamic_app > backup_$(date +%Y%m%d).sql

# Schema only backup
pg_dump -U app_user -h localhost --schema-only islamic_app > schema_backup.sql

# Data only backup
pg_dump -U app_user -h localhost --data-only islamic_app > data_backup.sql
```

#### Database Restore
```bash
# Restore from backup
psql -U app_user -d islamic_app < backup_20241201.sql

# Restore to new database
createdb islamic_app_restore
psql -U app_user -d islamic_app_restore < backup_20241201.sql
```

## Performance Optimization

### Indexes
Key indexes for performance:
```sql
-- User lookup indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_public_id ON users(public_id);

-- Prayer times lookup
CREATE INDEX idx_user_locations_coordinates ON user_locations(latitude, longitude);

-- Tasbeh performance
CREATE INDEX idx_tasbeh_user_phrase ON tasbeh_counts(user_id, phrase);

-- Reading stats queries
CREATE INDEX idx_reading_stats_user_surah ON user_reading_stats(user_id, surah_number);
```

### Query Optimization
```sql
-- Use EXPLAIN to analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Optimize frequent queries
CREATE MATERIALIZED VIEW user_reading_summary AS
SELECT 
    user_id,
    COUNT(DISTINCT surah_number) as surahs_read,
    SUM(reading_time_seconds) as total_reading_time
FROM user_reading_stats 
GROUP BY user_id;
```

## Security Considerations

### Access Control
```sql
-- Create read-only user for reporting
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE islamic_app TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

### Data Protection
- All passwords stored as hashes (never plaintext)
- UUID public IDs to prevent enumeration attacks
- Foreign key constraints ensure data integrity
- Cascade deletes for user data cleanup

### Connection Security
```bash
# Use SSL connections in production
export DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

## Monitoring and Maintenance

### Database Health Checks
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('islamic_app'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'islamic_app';
```

### Regular Maintenance
```bash
# Vacuum and analyze
psql -U app_user -d islamic_app -c "VACUUM ANALYZE;"

# Reindex for performance
psql -U app_user -d islamic_app -c "REINDEX DATABASE islamic_app;"
```

## Integration with Application

### Environment Configuration
```env
# Database connection settings
DATABASE_URL=postgresql://app_user:password@localhost:5432/islamic_app
DB_POOL_SIZE=20
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### Flask-SQLAlchemy Integration
```python
# database.py configuration
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    migrate.init_app(app, db)
```

## Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if database exists
psql -U postgres -l | grep islamic_app

# Test connection
psql -U app_user -h localhost -d islamic_app -c "SELECT 1;"
```

#### Migration Failures
```bash
# Check migration status
psql -U app_user -d islamic_app -c "SELECT * FROM alembic_version;"

# Rollback failed migration
psql -U app_user -d islamic_app -c "BEGIN; [rollback SQL]; COMMIT;"
```

#### Performance Issues
```bash
# Check slow queries
psql -U app_user -d islamic_app -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# Analyze table statistics
psql -U app_user -d islamic_app -c "SELECT * FROM pg_stat_user_tables;"
```

## Docker Integration

### PostgreSQL Container
```yaml
# docker-compose.yml
postgres:
  image: postgres:13
  environment:
    POSTGRES_DB: islamic_app
    POSTGRES_USER: app_user
    POSTGRES_PASSWORD: secure_password
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
  ports:
    - "5432:5432"
```

### Kubernetes Deployment
```yaml
# PostgreSQL StatefulSet with persistent storage
# Automated backups and monitoring
# High availability configuration
```
