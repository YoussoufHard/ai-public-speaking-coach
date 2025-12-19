"""
Increment 0 - Pose Visualization
Group 1: Youssouf & Hajar

This script loads a presentation video and visualizes body keypoints
using MediaPipe Pose. Compatible with MediaPipe v0.10.x
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import urllib.request
import os
import numpy as np

VIDEO_PATH = "data/videos/videoplayback.mp4"
MODEL_PATH = "pose_landmarker_lite.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"

POSE_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10), (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21), (17, 19),
    (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (11, 23), (12, 24), (23, 24),
    (23, 25), (25, 27), (27, 29), (29, 31),
    (24, 26), (26, 28), (28, 30), (30, 32),
    (25, 26)
]

def download_model():
    if not os.path.exists(MODEL_PATH):
        print("Downloading pose landmarker model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Model downloaded.")

def main():
    download_model()

    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        cap = cv2.VideoCapture(VIDEO_PATH)

        if not cap.isOpened():
            print("Error: Cannot open video file.")
            return

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Create MP Image
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

            # Process pose
            timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
            pose_landmarker_result = landmarker.detect_for_video(mp_image, timestamp_ms)

            # Draw keypoints
            if pose_landmarker_result.pose_landmarks:
                h, w, _ = frame.shape
                for pose_landmarks in pose_landmarker_result.pose_landmarks:
                    # Draw landmarks
                    for landmark in pose_landmarks:
                        x = int(landmark.x * w)
                        y = int(landmark.y * h)
                        cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)

                    # Draw connections
                    for connection in POSE_CONNECTIONS:
                        start_idx, end_idx = connection
                        start = pose_landmarks[start_idx]
                        end = pose_landmarks[end_idx]
                        start_x = int(start.x * w)
                        start_y = int(start.y * h)
                        end_x = int(end.x * w)
                        end_y = int(end.y * h)
                        cv2.line(frame, (start_x, start_y), (end_x, end_y), (0, 255, 0), 2)

            # Display
            cv2.imshow("Increment 0 - Pose Visualization", frame)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
