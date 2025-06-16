from database import db
from datetime import datetime, date

class UserReadingStats(db.Model):
    __tablename__ = 'user_reading_stats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    quran_verses_read = db.Column(db.Integer, default=0)
    hadiths_read = db.Column(db.Integer, default=0)
    daily_reading_streak = db.Column(db.Integer, default=0)
    total_reading_days = db.Column(db.Integer, default=0)
    last_reading_date = db.Column(db.Date)
    favorite_reciter = db.Column(db.String(50), default='ar.alafasy')
    
    def to_dict(self):
        return {
            'id': self.id,
            'quran_verses_read': self.quran_verses_read,
            'hadiths_read': self.hadiths_read,
            'daily_reading_streak': self.daily_reading_streak,
            'total_reading_days': self.total_reading_days,
            'last_reading_date': self.last_reading_date.isoformat() if self.last_reading_date else None,
            'favorite_reciter': self.favorite_reciter
        }
    
    def __repr__(self):
        return f'<UserReadingStats Quran:{self.quran_verses_read} Hadith:{self.hadiths_read}>'
