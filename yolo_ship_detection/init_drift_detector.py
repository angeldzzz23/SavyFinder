import os

import cv2
import numpy as np
from alibi_detect.cd import MMDDrift
from alibi_detect.saving import save_detector

DRIFT_DETECTOR_PATH = "drift_detector"
reference_data = None
drift_detector = None

def initialize_drift_detector(reference_images, n_samples):
    """Initialize the drift detector with reference data"""
    global reference_data, drift_detector
    
    # Process reference images to match the format expected by the drift detector
    # Resize and flatten images for drift detection
    processed_images = []
    for img in reference_images[:n_samples]:  # Limit to n_samples
        resized = cv2.resize(img, (64, 64))  # Resize to smaller dimension
        flattened = resized.reshape(-1).astype('float32') / 255  # Flatten to 1D array
        processed_images.append(flattened)
    
    reference_data = np.vstack(processed_images)
    print(f"Reference data shape: {reference_data.shape}")
    
    # Create and save the drift detector with PyTorch backend
    detector = MMDDrift(
        reference_data, 
        p_val=0.005,
        backend='pytorch',
        n_permutations=500,
    )
    save_detector(detector, DRIFT_DETECTOR_PATH)
    return detector

def load_reference_images(reference_dir):
    """Load reference images from directory"""
    reference_images = []
    for file in os.listdir(reference_dir):
        img = cv2.imread(os.path.join(reference_dir, file))
        if img is not None:
            reference_images.append(img)
    return reference_images

if __name__ == "__main__":
    # Load reference images from directory
    reference_dir = "/Users/mingjun/scratch/YOLOv8_ShipRSImageNet_BAL-2/train"
    reference_images = load_reference_images(reference_dir)
    print(f"Loaded {len(reference_images)} reference images")
    initialize_drift_detector(reference_images, len(reference_images))