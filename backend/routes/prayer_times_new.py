from flask import Blueprint, jsonify

prayer_times_bp = Blueprint('prayer_times', __name__)

@prayer_times_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Prayer times endpoint working', 'status': 'success'})