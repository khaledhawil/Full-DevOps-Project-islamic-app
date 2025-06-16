from flask import Blueprint, jsonify

quran_bp = Blueprint('quran', __name__)

@quran_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Quran endpoint working', 'status': 'success'})