from flask import Flask, request, jsonify
from deepface import DeepFace
import os
from werkzeug.utils import secure_filename
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def index():
    return "Face Verification API is running!"

@app.route('/verify', methods=['POST'])
def verify():
    if 'id_image' not in request.files or 'selfie_image' not in request.files:
        return jsonify({'error': 'Both ID image and selfie image are required'}), 400

    id_file = request.files['id_image']
    selfie_file = request.files['selfie_image']

    id_filename = secure_filename(id_file.filename)
    selfie_filename = secure_filename(selfie_file.filename)

    id_path = os.path.join(app.config['UPLOAD_FOLDER'], id_filename)
    selfie_path = os.path.join(app.config['UPLOAD_FOLDER'], selfie_filename)

    id_file.save(id_path)
    selfie_file.save(selfie_path)

    try:
        result = DeepFace.verify(
            img1_path=id_path,
            img2_path=selfie_path,
            model_name='ArcFace',
            distance_metric='cosine',
            enforce_detection=True
        )
        
        
        # os.remove(id_path)
        # os.remove(selfie_path)

        response = {
            'verified': result['verified'],
            'distance': result['distance'],
            'threshold': result['threshold'],
            'confidence': round((1 - result['distance']) * 100, 2)
        }

    except Exception as e:
        response = {'error': str(e)}

    # Optionally delete images after processing
    os.remove(id_path)
    os.remove(selfie_path)

    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5000, debug=True)