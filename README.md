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
