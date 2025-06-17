from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
import datetime
from datetime import timedelta
from database import db, migrate

# Initialize extensions KhaledHawil
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
    
    # Database configuration
    database_url = os.environ.get('DATABASE_URL', 'postgresql://islamic_user:islamic_pass123@localhost:5432/islamic_app')
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # CORS configuration
    cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=cors_origins, supports_credentials=True)
    
    # Import models (must be after db initialization)
    from models import User, UserPhrase, TasbehCount, UserLocation, UserPreference, UserReadingStats, UserAchievement
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.tasbeh import tasbeh_bp
    from routes.user import user_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tasbeh_bp, url_prefix='/api/tasbeh')
    app.register_blueprint(user_bp, url_prefix='/api/user')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        try:
            # Check database connection
            from sqlalchemy import text
            with db.engine.connect() as connection:
                result = connection.execute(text("SELECT 1"))
                result.fetchone()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {str(e)}"
        
        return {
            'status': 'healthy',
            'message': 'Islamic App Backend is running',
            'database': db_status,
            'timestamp': str(datetime.datetime.now())
        }, 200
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
