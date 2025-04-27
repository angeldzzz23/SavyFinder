import base64
import json
import os
import time

import cv2
import numpy as np
import torch
from alibi_detect.saving import load_detector
from flask import Flask, jsonify, request
from ultralytics import YOLO

app = Flask(__name__)

# Initialize drift detector or load if it exists
DRIFT_DETECTOR_PATH = "drift_detector"
drift_detector = None

# Initialize predictions
PREDICTIONS_FILE = "predictions.json"
predictions = []

@app.route('/')
def index():
    return jsonify({"message": "YOLO Ship Detection API is running"})

@app.route('/detect', methods=['POST'])
def detect():
    global drift_detector
    
    # Set random seeds for deterministic behavior
    np.random.seed(42)
    torch.manual_seed(42)
    
    # Check if image was provided in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    # Get the image from the request
    image_file = request.files['image']
    
    # Read the image
    image_bytes = image_file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        return jsonify({"error": "Could not read image"}), 400
    
    # Get confidence threshold from request or use default
    conf = request.form.get('conf', 0.25, type=float)
    
    # Run inference
    results = model.predict(image, conf=conf)
    
    # Process results
    class_counts = {}
    for r in results:
        # Plot the detection results on the image
        annotated_img = r.plot()
        
        # Count detected classes
        if hasattr(r, 'obb') and r.obb is not None and hasattr(r.obb, 'cls') and len(r.obb.cls) > 0:
            for cls in r.obb.cls:
                class_name = r.names[cls.item()]
                class_counts[class_name] = class_counts.get(class_name, 0) + 1
        elif hasattr(r, 'boxes') and r.boxes is not None and len(r.boxes) > 0:
            for box in r.boxes:
                if hasattr(box, 'cls') and len(box.cls) > 0:
                    class_name = r.names[int(box.cls[0])]
                    class_counts[class_name] = class_counts.get(class_name, 0) + 1
    
    # Encode the annotated image to base64
    _, buffer = cv2.imencode('.jpg', annotated_img)
    encoded_image = base64.b64encode(buffer).decode('utf-8')
    
    ## Save the prediction
    # Create images directory if it doesn't exist
    images_dir = os.path.join(os.path.dirname(__file__), 'images')
    os.makedirs(images_dir, exist_ok=True)
    
    # Generate a unique filename using timestamp
    timestamp = int(time.time())
    image_filename = f"{timestamp}.jpg"
    image_path = os.path.join(images_dir, image_filename)
    
    # Save the original image
    cv2.imwrite(image_path, image)
    
    # Prepare data for predictions.json
    prediction = {
        "results": [json.loads(r.to_json()) for r in results],
        "detections": class_counts,
        "image": image_path
    }
    
    # Load existing predictions or create new one
    if os.path.exists(PREDICTIONS_FILE):
        try:
            with open(PREDICTIONS_FILE, 'r') as f:
                predictions = json.load(f)
        except json.JSONDecodeError:
            predictions = []
    else:
        predictions = []
    
    # Append new data and save
    predictions.append(prediction)
    with open(PREDICTIONS_FILE, 'w') as f:
        json.dump(predictions, f, indent=2)
    
    # Prepare the response
    response = jsonify({
        "results": [json.loads(r.to_json()) for r in results],
        "image": encoded_image,
        "detections": class_counts
    })
    
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', '*')
    response.headers.add('Access-Control-Allow-Methods', '*')
    return response, 200

@app.route('/detect_drift', methods=['POST'])
def detect_drift():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    # Check if image was provided in the request
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    # Get the image from the request
    image_file = request.files['image']
    
    # Read the image
    image_bytes = image_file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        return jsonify({"error": "Could not read image"}), 400
    
    # Check for drift if detector is initialized
    if drift_detector is None:
        return jsonify({"message": "Drift detector not initialized"}, 400)
    try:
        # Preprocess image for drift detection
        img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        resized = cv2.resize(img_rgb, (64, 64))
        flattened = resized.reshape(1, -1).astype('float32') / 255
        
        test_batch = np.vstack([flattened, flattened])
        print(f"Drift detection input shape: {test_batch.shape}")
        
        # Detect drift
        drift_preds = drift_detector.predict(test_batch)
        print(f"Drift detection raw result: {drift_preds}")
        
        response = jsonify({
            "is_drift": bool(drift_preds['data']['is_drift']),
            "p_value": float(drift_preds['data']['p_val']),
            "threshold": float(drift_preds['data']['threshold']),
            "distance": float(drift_preds['data']['distance']),
            "distance_threshold": float(drift_preds['data']['distance_threshold'])
        })
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', '*')
        response.headers.add('Access-Control-Allow-Methods', '*')
        return response, 200
    except Exception as e:
        # Log the error but continue with detection
        print(f"Drift detection error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Drift detection failed: {str(e)}",
            "is_drift": None
        }, 400)

if __name__ == "__main__":
    # Download the model and drift detector on startup
    if not os.path.exists("yolo-8m-shiprs.pt"):
        try:
            import urllib.request
            print("Downloading model from https://storage.googleapis.com/nsh25-yolo-ship-detection/yolo-8m-shiprs.pt")
            urllib.request.urlretrieve(
                "https://storage.googleapis.com/nsh25-yolo-ship-detection/yolo-8m-shiprs.pt",
                "yolo-8m-shiprs.pt"
            )
            print("Model download complete")
        except Exception as e:
            print(f"Error downloading model: {str(e)}")
            exit(1)
    if not os.path.exists(DRIFT_DETECTOR_PATH):
        os.makedirs(DRIFT_DETECTOR_PATH)
        try:
            import urllib.request
            print("Downloading drift detector from https://storage.googleapis.com/nsh25-yolo-ship-detection/drift_detector")
            urllib.request.urlretrieve(
                "https://storage.googleapis.com/nsh25-yolo-ship-detection/drift_detector/config.toml",
                f"{DRIFT_DETECTOR_PATH}/config.toml"
            )
            urllib.request.urlretrieve(
                "https://storage.googleapis.com/nsh25-yolo-ship-detection/drift_detector/x_ref.npy",
                f"{DRIFT_DETECTOR_PATH}/x_ref.npy"
            )
            print("Drift detector download complete")
        except Exception as e:
            print(f"Error downloading drift detector: {str(e)}")
            exit(1)

    # Load the model
    model = YOLO("yolo-8m-shiprs.pt")

    # Initialize drift detector
    drift_detector = load_detector(DRIFT_DETECTOR_PATH)

    # If the predictions.json file exists, load the predictions
    if os.path.exists(PREDICTIONS_FILE):
        with open(PREDICTIONS_FILE, 'r') as f:
            predictions = json.load(f)

    app.run(host="0.0.0.0", port=8080)
