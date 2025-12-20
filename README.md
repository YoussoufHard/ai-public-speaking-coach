# AI Public Speaking Coach

AI Public Speaking Coach avatar is an intelligent system designed to analyze public speaking performances using multimodal data.

The system observes a presentation through video and audio inputs, extracts objective non-verbal and vocal metrics such as posture stability, gestures, speech rate, fillers, and voice modulation, and transforms these metrics into clear numerical scores.

Based on these scores, the system generates structured, human-like feedback along with actionable recommendations to help speakers improve their delivery. Results are visualized through a web-based dashboard featuring a video player, performance scores, feedback summaries, and a timeline of key speaking events.

This project follows an incremental development approach and is intended for academic evaluation, focusing on clarity, interpretability, and practical usefulness rather than complex deep learning models.


## Project Structure

- vision/     : Pose estimation and non-verbal analysis (Group 1)
- audio/      : Speech and audio analysis (Group 2)
- scoring/    : Metrics to scores conversion
- feedback/   : LLM-based feedback generation
- backend/    : API and integration
- ui/         : Web dashboard (React)

## Increment 0 – Setup & Pose Visualization

Goal:
- Load a presentation video
- Visualize body keypoints using MediaPipe Pose

Status:
- Project structure initialized
- Vision pipeline ready

## Incrément 1 – Sauvegarde des métriques non verbales

Contexte :

Les keypoints ont déjà été détectés  via MediaPipe Pose.

Ajouts réalisés :

Analyse des keypoints pour extraire des métriques :

posture_score_raw : score de la posture (basé sur l’angle épaules-hanches)

gesture_activity : amplitude des mouvements des bras

head_orientation : orientation de la tête (front, left, right)

Génération automatique d’un fichier JSON contenant toutes les métriques par frame :

Chaque vidéo produit un fichier JSON unique, ex. metrics_videoplayback.json

Le JSON est structuré et prêt pour un traitement ultérieur dans les modules de scoring et de feedback

Mise à jour du .gitignore pour ignorer :

Les fichiers JSON générés (metrics_*.json)

Le modèle pose_landmarker_lite.task

L’environnement virtuel .venv

Impact :

Permet de séparer le traitement de vision (keypoints) du traitement de scoring (métriques)

Facilite l’intégration dans le pipeline global et le tableau de bord web
