import os
from pathlib import Path

import cv2


def convert_bmp_to_png(directory):
    """
    Convert all BMP files in the specified directory to PNG format.
    
    Args:
        directory (str): Path to the directory containing BMP files
    """
    # Get all BMP files in the directory
    bmp_files = list(Path(directory).glob('**/*.bmp'))
    
    if not bmp_files:
        print(f"No BMP files found in {directory}")
        return
    
    print(f"Found {len(bmp_files)} BMP files to convert")
    
    # Convert each BMP file to PNG
    for bmp_file in bmp_files:
        try:
            # Read the BMP image
            img = cv2.imread(str(bmp_file))
            
            if img is None:
                print(f"Failed to read {bmp_file}")
                continue
            
            # Create PNG filename
            png_file = bmp_file.with_suffix('.png')
            
            # Save as PNG
            cv2.imwrite(str(png_file), img)
            
            # Remove the original BMP file
            os.remove(bmp_file)
            
            print(f"Converted: {bmp_file} -> {png_file}")
        except Exception as e:
            print(f"Error converting {bmp_file}: {str(e)}")

if __name__ == "__main__":
    train_dir = "train"
    convert_bmp_to_png(train_dir)
    print("Conversion complete!")
