from database import db
from datetime import datetime

class UserPreference(db.Model):
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    
    # UI Preferences
    theme = db.Column(db.String(20), default='light')
    language_preference = db.Column(db.String(10), default='ar')
    
    # Audio Preferences
    sound_enabled = db.Column(db.Boolean, default=True)
    volume_level = db.Column(db.Float, default=1.0)
    
    # Prayer Settings
    prayer_notifications = db.Column(db.JSON, default=dict)
    
    # Goals and Targets
    daily_goal = db.Column(db.Integer, default=100)
    
    # Favorites - stored as JSON arrays
    quran_audio_favorites = db.Column(db.JSON, default=list)  # List of favorite reciters
    hadith_favorites = db.Column(db.JSON, default=list)      # List of favorite hadith IDs
    azkar_favorites = db.Column(db.JSON, default=list)       # List of favorite azkar
    
    # Last used settings
    last_reciter = db.Column(db.String(50), nullable=True)
    last_server = db.Column(db.String(50), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'theme': self.theme,
            'language_preference': self.language_preference,
            'sound_enabled': self.sound_enabled,
            'volume_level': self.volume_level,
            'prayer_notifications': self.prayer_notifications or {},
            'daily_goal': self.daily_goal,
            'quran_audio_favorites': self.quran_audio_favorites or [],
            'hadith_favorites': self.hadith_favorites or [],
            'azkar_favorites': self.azkar_favorites or [],
            'last_reciter': self.last_reciter,
            'last_server': self.last_server,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<UserPreference user_id:{self.user_id}, theme:{self.theme}>'
