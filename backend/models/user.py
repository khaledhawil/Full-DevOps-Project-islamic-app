from database import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    country = db.Column(db.String(50), nullable=True)
    city = db.Column(db.String(50), nullable=True)
    date_of_birth = db.Column(db.Date, nullable=True)
    gender = db.Column(db.String(10), nullable=True)  # male, female
    profile_picture = db.Column(db.String(255), nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    email_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def __init__(self, **kwargs):
        super(User, self).__init__(**kwargs)
        if not self.public_id:
            self.public_id = str(uuid.uuid4())
    
    # Relationships
    phrases = db.relationship('UserPhrase', backref='user', lazy=True, cascade='all, delete-orphan')
    tasbeh_counts = db.relationship('TasbehCount', backref='user', lazy=True, cascade='all, delete-orphan')
    location = db.relationship('UserLocation', backref='user', uselist=False, cascade='all, delete-orphan')
    preferences = db.relationship('UserPreference', backref='user', uselist=False, cascade='all, delete-orphan')
    reading_stats = db.relationship('UserReadingStats', backref='user', uselist=False, cascade='all, delete-orphan')
    achievements = db.relationship('UserAchievement', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_tokens(self):
        access_token = create_access_token(identity=self.public_id)
        refresh_token = create_refresh_token(identity=self.public_id)
        return {
            'access_token': access_token,
            'refresh_token': refresh_token
        }
    
    def to_dict(self):
        return {
            'id': self.public_id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'country': self.country,
            'city': self.city,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'profile_picture': self.profile_picture,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }
    
    def __repr__(self):
        return f'<User {self.username}>'
