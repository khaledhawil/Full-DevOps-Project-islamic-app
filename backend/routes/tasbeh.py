from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.tasbeh_count import TasbehCount
from datetime import datetime

tasbeh_bp = Blueprint('tasbeh', __name__)

# Islamic phrases for Tasbeh
ISLAMIC_PHRASES = [
    "سبحان الله",  # SubhanAllah
    "الحمد لله",   # Alhamdulillah
    "الله أكبر",   # Allahu Akbar
    "لا إله إلا الله",  # La ilaha illa Allah
    "اللهم صل على سيدنا محمد",  # Allahumma salli ala sayyidina Muhammad
    "أستغفر الله",  # Astaghfirullah
    "لا حول ولا قوة إلا بالله",  # La hawla wa la quwwata illa billah
    "بسم الله الرحمن الرحيم"  # Bismillah ar-Rahman ar-Raheem
]

@tasbeh_bp.route('/phrases', methods=['GET'])
@jwt_required()
def get_phrases():
    """Get all available Islamic phrases with user's counts"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's tasbeh counts
        user_counts = {}
        counts = TasbehCount.query.filter_by(user_id=user.id).all()
        for count in counts:
            user_counts[count.phrase] = count.to_dict()
        
        # Prepare phrases with counts
        phrases_data = []
        for phrase in ISLAMIC_PHRASES:
            count_data = user_counts.get(phrase, {
                'phrase': phrase,
                'count': 0,
                'last_updated': None
            })
            phrases_data.append(count_data)
        
        # Calculate total dhikr count
        total_dhikr = sum(phrase.get('count', 0) for phrase in phrases_data)
        
        return jsonify({
            'phrases': phrases_data,
            'total_dhikr': total_dhikr
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasbeh_bp.route('/count', methods=['POST'])
@jwt_required()
def increment_count():
    """Increment count for a specific phrase"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        phrase = data.get('phrase', '')
        amount = data.get('amount', 1)
        
        if phrase not in ISLAMIC_PHRASES:
            return jsonify({'error': 'Invalid phrase'}), 400
        
        if not isinstance(amount, int) or amount < 1:
            return jsonify({'error': 'Amount must be a positive integer'}), 400
        
        # Find or create tasbeh count record
        tasbeh_count = TasbehCount.query.filter_by(
            user_id=user.id, 
            phrase=phrase
        ).first()
        
        if tasbeh_count:
            tasbeh_count.count += amount
            tasbeh_count.last_updated = datetime.utcnow()
        else:
            tasbeh_count = TasbehCount(
                user_id=user.id,
                phrase=phrase,
                count=amount,
                last_updated=datetime.utcnow()
            )
            db.session.add(tasbeh_count)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Count updated successfully',
            'phrase': phrase,
            'count': tasbeh_count.count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasbeh_bp.route('/reset', methods=['POST'])
@jwt_required()
def reset_count():
    """Reset count for a specific phrase"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        phrase = data.get('phrase', '')
        
        if phrase not in ISLAMIC_PHRASES:
            return jsonify({'error': 'Invalid phrase'}), 400
        
        # Find and delete tasbeh count record
        tasbeh_count = TasbehCount.query.filter_by(
            user_id=user.id, 
            phrase=phrase
        ).first()
        
        if tasbeh_count:
            db.session.delete(tasbeh_count)
            db.session.commit()
        
        return jsonify({
            'message': 'Count reset successfully',
            'phrase': phrase,
            'count': 0
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasbeh_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    """Get user's tasbeh statistics"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all user's tasbeh counts
        counts = TasbehCount.query.filter_by(user_id=user.id).all()
        
        total_dhikr = sum(count.count for count in counts)
        total_phrases = len(counts)
        
        # Find most recited phrase
        most_recited = None
        if counts:
            most_recited_count = max(counts, key=lambda x: x.count)
            most_recited = {
                'phrase': most_recited_count.phrase,
                'count': most_recited_count.count
            }
        
        # Recent activity (last 7 days)
        recent_activity = []
        for count in counts:
            if count.last_updated:
                days_ago = (datetime.utcnow() - count.last_updated).days
                if days_ago <= 7:
                    recent_activity.append(count.to_dict())
        
        return jsonify({
            'total_dhikr': total_dhikr,
            'total_phrases': total_phrases,
            'most_recited': most_recited,
            'recent_activity': recent_activity
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasbeh_bp.route('/export', methods=['GET'])
@jwt_required()
def export_data():
    """Export user's tasbeh data"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all user's tasbeh counts
        counts = TasbehCount.query.filter_by(user_id=user.id).all()
        
        export_data = {
            'user': user.username,
            'export_date': datetime.utcnow().isoformat(),
            'tasbeh_counts': [count.to_dict() for count in counts],
            'total_dhikr': sum(count.count for count in counts)
        }
        
        return jsonify(export_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add missing endpoints for compatibility
@tasbeh_bp.route('/counts', methods=['GET'])
@jwt_required()
def get_user_counts():
    """Get user's tasbeh counts - compatibility endpoint"""
    return get_phrases()

@tasbeh_bp.route('/increment', methods=['POST'])
@jwt_required()
def increment_count_legacy():
    """Legacy increment endpoint"""
    return increment_count()
