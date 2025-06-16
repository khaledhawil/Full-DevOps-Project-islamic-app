from database import db
from datetime import datetime

class UserAchievement(db.Model):
    __tablename__ = 'user_achievements'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    achievement_type = db.Column(db.String(50), nullable=False)
    achievement_name = db.Column(db.String(100), nullable=False)
    achievement_data = db.Column(db.JSON, default=dict)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'achievement_type': self.achievement_type,
            'achievement_name': self.achievement_name,
            'achievement_data': self.achievement_data,
            'earned_at': self.earned_at.isoformat() if self.earned_at else None
        }
    
    def __repr__(self):
        return f'<UserAchievement {self.achievement_name}>'
