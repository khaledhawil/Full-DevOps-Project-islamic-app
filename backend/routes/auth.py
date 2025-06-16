from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from database import db
from models.user import User
from models.user_preference import UserPreference
from models.user_reading_stats import UserReadingStats
from datetime import datetime
import re
import uuid

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} مطلوب'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Optional fields
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        phone = data.get('phone', '').strip()
        country = data.get('country', '').strip()
        city = data.get('city', '').strip()
        gender = data.get('gender', '').strip()
        
        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'صيغة البريد الإلكتروني غير صحيحة'}), 400
        
        # Validate password strength
        if not validate_password(password):
            return jsonify({'error': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                return jsonify({'error': 'اسم المستخدم مستخدم بالفعل'}), 409
            else:
                return jsonify({'error': 'البريد الإلكتروني مستخدم بالفعل'}), 409
        
        # Create new user
        user = User(
            username=username,
            email=email,
            public_id=str(uuid.uuid4()),
            first_name=first_name or None,
            last_name=last_name or None,
            phone=phone or None,
            country=country or None,
            city=city or None,
            gender=gender if gender in ['male', 'female'] else None
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.flush()  # Flush to get the user ID
        
        # Create default preferences
        preferences = UserPreference(user_id=user.id)
        db.session.add(preferences)
        
        # Create default reading stats
        reading_stats = UserReadingStats(user_id=user.id)
        db.session.add(reading_stats)
        
        db.session.commit()
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return jsonify({
            'message': 'تم إنشاء الحساب بنجاح',
            'user': user.to_dict(),
            'tokens': tokens
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Registration error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء إنشاء الحساب'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'البيانات مطلوبة'}), 400
        
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'اسم المستخدم وكلمة المرور مطلوبان'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user:
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401
        
        if not user.check_password(password):
            return jsonify({'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'الحساب غير مفعل'}), 401
        
        # Update last login time
        user.last_login_at = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens
        tokens = user.generate_tokens()
        
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'user': user.to_dict(),
            'tokens': tokens
        }), 200
        
    except Exception as e:
        print(f"Login error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء تسجيل الدخول'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user or not user.is_active:
            return jsonify({'error': 'المستخدم غير موجود أو غير مفعل'}), 404
        
        # Generate new access token
        access_token = create_access_token(identity=current_user_id)
        
        return jsonify({
            'access_token': access_token
        }), 200
        
    except Exception as e:
        print(f"Refresh error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء تحديث الرمز المميز'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        return jsonify({
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Get profile error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء جلب البيانات'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'username' in data:
            username = data['username'].strip()
            if username != user.username:
                # Check if username is already taken
                if User.query.filter_by(username=username).first():
                    return jsonify({'error': 'اسم المستخدم مستخدم بالفعل'}), 409
                user.username = username
        
        if 'email' in data:
            email = data['email'].strip().lower()
            if not validate_email(email):
                return jsonify({'error': 'صيغة البريد الإلكتروني غير صحيحة'}), 400
            if email != user.email:
                # Check if email is already taken
                if User.query.filter_by(email=email).first():
                    return jsonify({'error': 'البريد الإلكتروني مستخدم بالفعل'}), 409
                user.email = email
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث الملف الشخصي بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Update profile error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء تحديث البيانات'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        data = request.get_json()
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        
        if not current_password or not new_password:
            return jsonify({'error': 'كلمة المرور الحالية والجديدة مطلوبتان'}), 400
        
        if not user.check_password(current_password):
            return jsonify({'error': 'كلمة المرور الحالية غير صحيحة'}), 401
        
        if not validate_password(new_password):
            return jsonify({'error': 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'}), 400
        
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'message': 'تم تغيير كلمة المرور بنجاح'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Change password error: {str(e)}")  # For debugging
        return jsonify({'error': 'حدث خطأ أثناء تغيير كلمة المرور'}), 500
