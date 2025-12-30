# Avatar System - Technical Documentation

## Overview
The AI Public Speaking Coach features a realistic 3D human avatar integrated into the React frontend. The system uses **Three.js** for rendering and **FBX Models** for high-fidelity character animations.

## Core Component: `RealisticAvatarIntegrated.tsx`
This component is the main interface between the application state and the 3D engine.

### Key Responsibilities:
- **Scene Management**: Initializes the Three.js scene, camera (PerspectiveCamera), and lighting (Ambient + Spot + Point lights).
- **Asset Loading**: Uses `FBXLoader` to fetch the character and its animations.
- **Animation Orchestration**: Manages transitions between `Idle`, `Talking`, `Thankful`, and `Thinking` states using `AnimationMixer`.
- **Lip-Sync Sync**: Real-time synchronization of the character's jaw bone with audio intensity.

## Asset Architecture
Models are stored in `public/assets/models/` to be served as static assets:
- `Idle.fbx`: Base character with breathing and neutral movements.
- `Talking.fbx`: Animation used during TTS playback.
- `Thinking.fbx`: Used during analysis or wait states.
- `Thankful.fbx`: Used for positive feedback milestones.

## Technical Implementation Details

### 1. Sequential Loading & Stability
To avoid memory exhaustion and application crashes (especially with ~200MB of assets), the loader implements a sequential pattern:
```typescript
const loadSequentially = async () => {
    for (const name of modelsToLoad) {
        await new Promise((resolve) => {
            loader.load(`/assets/models/${name}.fbx`, (fbx) => {
                // Process model...
                resolve();
            });
        });
    }
};
```
The component is also wrapped in a `React.Suspense` boundary in `RecordSession.tsx` to handle the asynchronous initialization gracefully.

### 2. Real-time Lip-Sync
The system uses the Web Audio API to analyze the current playing audio:
- **AnalyserNode**: Configured with `fftSize: 64` for high temporal resolution.
- **Bone Manipulation**: Every frame, the `jawBone` (found via `fbx.traverse`) is rotated on its X-axis based on the average frequency volume.
- **Damping**: Sequential frames are smoothed using `THREE.MathUtils.lerp` to ensure natural movement.

### 3. Rendering Optimizations
- **Power Preference**: Configured with `high-performance` to prioritize discrete GPUs.
- **DPR Limiting**: Capped at `Math.min(window.devicePixelRatio, 2)` to maintain high frame rates on 4K/Retina displays.
- **Resource Cleanup**: Explicitly disposes of `renderer`, `geometries`, and `textures` on unmount to prevent memory leaks.

## Integration Flow
1. `App.tsx` routes to `/dashboard` or `/record`.
2. `RealisticAvatarIntegrated` starts loading `Idle.fbx`.
3. Once loaded, the "Neural Link Active" HUD appears.
4. When `isPlaying` is true (from TTS service), the `Talking` animation is cross-faded in.
5. Audio analysis drives the jaw bone in the `animate` loop.
6. On audio end, the mixer fades back to `Idle`.
