FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy the repository contents
COPY . /app/

# Install Python dependencies
RUN pip install --no-cache-dir ultralytics opencv-python-headless numpy flask alibi-detect

# Expose the port for the Flask server
EXPOSE 8080

# Set the entrypoint to run the Flask server
CMD ["python", "server.py"]
