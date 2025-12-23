import cv2
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import numpy as np
import os

MODEL_PATH = "pose_landmarker_lite.task"
MODEL_URL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"

def download_model():
    """Download the MediaPipe model if not present"""
    if not os.path.exists(MODEL_PATH):
        import urllib.request
        print("Downloading pose landmarker model...")
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Model downloaded.")

def calculate_angle(a, b, c):
    """Calculate angle in degrees between three points (a-b-c)"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

def head_orientation(landmarks):
    """Detect head orientation: front / left / right"""
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
    """Analyze a frame and return metrics"""
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

def extract_vision_metrics(video_path: str) -> dict:
    """Extract vision metrics from video"""
    download_model()

    # Initialize PoseLandmarker
    base_options = python.BaseOptions(model_asset_path=MODEL_PATH)
    options = vision.PoseLandmarkerOptions(
        base_options=base_options,
        running_mode=vision.RunningMode.VIDEO,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5
    )

    with vision.PoseLandmarker.create_from_options(options) as landmarker:
        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise ValueError("Cannot open video file.")

        metrics_list = []
        frame_count = 0
        max_frames = 900  # Limit to 900 frames for processing

        while cap.isOpened() and frame_count < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            # Convert BGR to RGB
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)

            # Detect pose
            timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
            pose_landmarker_result = landmarker.detect_for_video(mp_image, timestamp_ms)

            # If landmarks detected
            if pose_landmarker_result.pose_landmarks:
                for pose_landmarks in pose_landmarker_result.pose_landmarks:
                    metrics = analyze_frame(pose_landmarks)
                    metrics_list.append(metrics)

            frame_count += 1

        cap.release()

        if not metrics_list:
            raise ValueError("No pose detected in video")

        # Aggregate metrics
        posture_scores = [m["posture_score_raw"] for m in metrics_list]
        gesture_activities = [m["gesture_activity"] for m in metrics_list]
        head_orientations = [m["head_orientation"] for m in metrics_list]

        # Use most common head orientation
        most_common_head = max(set(head_orientations), key=head_orientations.count)

        return {
            "posture_score_raw": round(np.mean(posture_scores), 2),
            "gesture_activity": round(np.mean(gesture_activities), 2),
            "head_orientation": most_common_head
        }