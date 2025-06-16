from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.models.user import User

def handle_errors(f):
    """Decorator to handle common API errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': 'Internal server error'}), 500
    return decorated_function

def get_current_user():
    """Get current user from JWT token"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_id).first()
        return user
    except:
        return None

def require_auth(f):
    """Decorator to require authentication and get current user"""
    @wraps(f)
    @jwt_required()
    def decorated_function(*args, **kwargs):
        current_user = get_current_user()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        return f(current_user, *args, **kwargs)
    return decorated_function

def validate_json(schema):
    """Decorator to validate JSON input with marshmallow schema"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if not request.is_json:
                    return jsonify({'error': 'Content-Type must be application/json'}), 400
                
                data = schema.load(request.get_json())
                return f(data, *args, **kwargs)
            except Exception as e:
                return jsonify({'error': str(e)}), 400
        return decorated_function
    return decorator

def success_response(data=None, message="Success", status_code=200):
    """Standard success response format"""
    response = {
        'success': True,
        'message': message
    }
    if data is not None:
        response['data'] = data
    return jsonify(response), status_code

def error_response(message="Error", status_code=400, errors=None):
    """Standard error response format"""
    response = {
        'success': False,
        'message': message
    }
    if errors:
        response['errors'] = errors
    return jsonify(response), status_code
