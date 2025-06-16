from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.user_phrase import UserPhrase
from models.user_preference import UserPreference
from models.user_location import UserLocation
from models.user_reading_stats import UserReadingStats
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get user profile with all related data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user preferences
        preferences = UserPreference.query.filter_by(user_id=user.id).first()
        
        # Get user location
        location = UserLocation.query.filter_by(user_id=user.id).first()
        
        # Get reading stats
        reading_stats = UserReadingStats.query.filter_by(user_id=user.id).first()
        
        return jsonify({
            'user': user.to_dict(),
            'preferences': preferences.to_dict() if preferences else None,
            'location': location.to_dict() if location else None,
            'reading_stats': reading_stats.to_dict() if reading_stats else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/phrases', methods=['GET'])
@jwt_required()
def get_user_phrases():
    """Get user's custom phrases"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user phrases
        phrases = UserPhrase.query.filter_by(user_id=user.id).order_by(UserPhrase.created_at.desc()).all()
        
        phrases_data = [phrase.to_dict() for phrase in phrases]
        
        return jsonify({
            'phrases': phrases_data,
            'total': len(phrases_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/phrases', methods=['POST'])
@jwt_required()
def add_phrase():
    """Add a new custom phrase"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        phrase_text = data.get('phrase', '').strip()
        
        if not phrase_text:
            return jsonify({'error': 'Phrase text is required'}), 400
        
        # Create new phrase
        phrase = UserPhrase(
            user_id=user.id,
            phrase=phrase_text
        )
        
        db.session.add(phrase)
        db.session.commit()
        
        return jsonify({
            'message': 'Phrase added successfully',
            'phrase': phrase.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/phrases/<int:phrase_id>', methods=['DELETE'])
@jwt_required()
def delete_phrase(phrase_id):
    """Delete a custom phrase"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Find and delete phrase
        phrase = UserPhrase.query.filter_by(
            id=phrase_id,
            user_id=user.id
        ).first()
        
        if not phrase:
            return jsonify({'error': 'Phrase not found'}), 404
        
        db.session.delete(phrase)
        db.session.commit()
        
        return jsonify({
            'message': 'Phrase deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Get user preferences"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        preferences = UserPreference.query.filter_by(user_id=user.id).first()
        
        if not preferences:
            # Create default preferences
            preferences = UserPreference(user_id=user.id)
            db.session.add(preferences)
            db.session.commit()
        
        return jsonify({
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        preferences = UserPreference.query.filter_by(user_id=user.id).first()
        
        if not preferences:
            preferences = UserPreference(user_id=user.id)
            db.session.add(preferences)
        
        # Update preferences
        if 'theme' in data:
            preferences.theme = data['theme']
        if 'daily_goal' in data:
            preferences.daily_goal = data['daily_goal']
        if 'sound_enabled' in data:
            preferences.sound_enabled = data['sound_enabled']
        if 'volume_level' in data:
            preferences.volume_level = data['volume_level']
        if 'prayer_notifications' in data:
            preferences.prayer_notifications = data['prayer_notifications']
        if 'language_preference' in data:
            preferences.language_preference = data['language_preference']
        if 'quran_audio_favorites' in data:
            preferences.quran_audio_favorites = data['quran_audio_favorites']
        if 'hadith_favorites' in data:
            preferences.hadith_favorites = data['hadith_favorites']
        if 'azkar_favorites' in data:
            preferences.azkar_favorites = data['azkar_favorites']
        if 'last_reciter' in data:
            preferences.last_reciter = data['last_reciter']
        if 'last_server' in data:
            preferences.last_server = data['last_server']
        
        preferences.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': preferences.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/location', methods=['GET'])
@jwt_required()
def get_location():
    """Get user location"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        location = UserLocation.query.filter_by(user_id=user.id).first()
        
        return jsonify({
            'location': location.to_dict() if location else None
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/location', methods=['PUT'])
@jwt_required()
def update_location():
    """Update user location"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        location = UserLocation.query.filter_by(user_id=user.id).first()
        
        if not location:
            location = UserLocation(user_id=user.id)
            db.session.add(location)
        
        # Update location data
        if 'city' in data:
            location.city = data['city']
        if 'country' in data:
            location.country = data['country']
        if 'latitude' in data:
            location.latitude = data['latitude']
        if 'longitude' in data:
            location.longitude = data['longitude']
        if 'timezone' in data:
            location.timezone = data['timezone']
        
        location.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Location updated successfully',
            'location': location.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard():
    """Get user dashboard data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_phrases = UserPhrase.query.filter_by(user_id=user.id).count()
        
        # Get tasbeh statistics
        from models.tasbeh_count import TasbehCount
        tasbeh_counts = TasbehCount.query.filter_by(user_id=user.id).all()
        total_dhikr = sum(count.count for count in tasbeh_counts)
        
        # Get reading stats
        reading_stats = UserReadingStats.query.filter_by(user_id=user.id).first()
        
        # Get recent activity (last 5 phrases)
        recent_phrases = UserPhrase.query.filter_by(user_id=user.id).order_by(
            UserPhrase.created_at.desc()
        ).limit(5).all()
        
        dashboard_data = {
            'user': user.to_dict(),
            'statistics': {
                'total_phrases': total_phrases,
                'total_dhikr': total_dhikr,
                'total_tasbeh_phrases': len(tasbeh_counts),
                'quran_verses_read': reading_stats.quran_verses_read if reading_stats else 0,
                'reading_streak': reading_stats.daily_reading_streak if reading_stats else 0
            },
            'recent_phrases': [phrase.to_dict() for phrase in recent_phrases]
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
