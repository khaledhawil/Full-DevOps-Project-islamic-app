from database import db
from datetime import datetime

class TasbehCount(db.Model):
    __tablename__ = 'tasbeh_counts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    phrase = db.Column(db.String(200), nullable=False)
    count = db.Column(db.Integer, default=0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Unique constraint for user and phrase combination
    __table_args__ = (db.UniqueConstraint('user_id', 'phrase', name='unique_user_phrase'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'phrase': self.phrase,
            'count': self.count,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }
    
    def __repr__(self):
        return f'<TasbehCount {self.phrase}: {self.count}>'
