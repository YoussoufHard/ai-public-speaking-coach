"""
Increment 0 - Pose Visualization + Metrics Extraction (Test 50 frames)
Group 1: Youssouf & Hajar

Ce script charge une vidéo, visualise les keypoints avec MediaPipe Pose
et calcule des métriques non-verbales :
- Posture (angle épaules → droite/penchée)
- Gestuelle (amplitude des mouvements de bras)
- Orientation tête (front / left / right)

Résultat sauvegardé dans metrics_test.json.
Traitement limité aux 50 premières frames pour tester.
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import urllib.request
import os
import numpy as np
import json

# --- Configuration ---
VIDEO_PATH = "data/videos/videoplayback.mp4"  # chemin vidéo
MODEL_PATH = "pose_landmarker_lite.task"        # chemin modèle
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

# --- Fonctions Utiles ---
def download_model():
    """Télécharge le modèle MediaPipe si non présent"""
    if not os.path.exists(MODEL_PATH):
        print("Downloading pose landmarker model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Model downloaded.")

def calculate_angle(a, b, c):
    """Calcule l'angle en degrés entre trois points (a-b-c)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    ba = a - b
    bc = c - b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

def head_orientation(landmarks):
    """
    Détecte l'orientation de la tête : front / left / right
    basé sur la position du nez par rapport au centre des épaules.
    """
    left_shoulder = [landmarks[11].x, landmarks[11].y]
    right_shoulder = [landmarks[12].x, landmarks[12].y]
    nose = [landmarks[0].x, landmarks[0].y]

    shoulder_mid = [(left_shoulder[0] + right_shoulder[0])/2,
                    (left_shoulder[1] + right_shoulder[1])/2]

    dx = nose[0] - shoulder_mid[0]
    if abs(dx) < 0.05:
        return "front"
    elif dx > 0:
        return "right"
    else:
        return "left"

def analyze_frame(landmarks):
    """
    Analyse un frame et retourne les métriques :
    - posture_score_raw : score normalisé de la posture
    - gesture_activity : amplitude gestuelle des bras
    - head_orientation : direction tête
    """
    left_shoulder = landmarks[11]
    right_shoulder = landmarks[12]
    left_hip = landmarks[23]
    right_hip = landmarks[24]

    shoulder_mid = [(left_shoulder.x + right_shoulder.x)/2, 
                    (left_shoulder.y + right_shoulder.y)/2]
    hip_mid = [(left_hip.x + right_hip.x)/2,
               (left_hip.y + right_hip.y)/2]

    posture_angle = calculate_angle([left_shoulder.x, left_shoulder.y], shoulder_mid, hip_mid)
    posture_score_raw = np.clip((180 - posture_angle)/90, 0, 1)

    left_wrist = landmarks[15]
    right_wrist = landmarks[16]

    gesture_activity = np.linalg.norm(np.array([left_wrist.x, left_wrist.y]) - np.array([left_shoulder.x, left_shoulder.y])) \
                     + np.linalg.norm(np.array([right_wrist.x, right_wrist.y]) - np.array([right_shoulder.x, right_shoulder.y]))

    head_dir = head_orientation(landmarks)

    return {
        "posture_score_raw": round(posture_score_raw, 2),
        "gesture_activity": round(gesture_activity, 2),
        "head_orientation": head_dir
    }

# --- Main ---
def main():
    download_model()

    # Initialisation du modèle PoseLandmarker
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

        metrics_list = []        # liste pour stocker les métriques par frame
        frame_count = 0          # compteur de frames
        max_frames = 900         # nombre de frames à tester

        while cap.isOpened() and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            # Convertir BGR → RGB
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

            # Détection pose
            timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
            pose_landmarker_result = landmarker.detect_for_video(mp_image, timestamp_ms)

            # Si landmarks détectés
            if pose_landmarker_result.pose_landmarks:
                for pose_landmarks in pose_landmarker_result.pose_landmarks:
                    # Calcul métriques
                    metrics = analyze_frame(pose_landmarks)
                    metrics_list.append(metrics)

                    # --- Visualisation keypoints ---
                    h, w, _ = frame.shape
                    for landmark in pose_landmarks:
                        x = int(landmark.x * w)
                        y = int(landmark.y * h)
                        cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)

                    for connection in POSE_CONNECTIONS:
                        start_idx, end_idx = connection
                        start = pose_landmarks[start_idx]
                        end = pose_landmarks[end_idx]
                        start_x = int(start.x * w)
                        start_y = int(start.y * h)
                        end_x = int(end.x * w)
                        end_y = int(end.y * h)
                        cv2.line(frame, (start_x, start_y), (end_x, end_y), (0, 255, 0), 2)

            # --- Redimensionner pour petite fenêtre ---
            small_frame = cv2.resize(frame, (640, 360))
            cv2.imshow("Pose Visualization + Metrics", small_frame)

            if cv2.waitKey(10) & 0xFF == ord("q"):
                break

            frame_count += 1  # incrémente compteur

        cap.release()
        cv2.destroyAllWindows()

        # --- Sauvegarde JSON ---
        with open("metrics_test.json", "w") as f:
            json.dump(metrics_list, f, indent=4)
        print(f"Metrics saved to metrics_test.json, total frames: {len(metrics_list)}")

if __name__ == "__main__":
    main()
