import React, { useEffect, useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, OrbitControls, Loader } from '@react-three/drei';
import * as THREE from 'three';

// --- CONSTANTS ---
// Using a professional-looking "Coach" avatar from Ready Player Me (Public URL)
// Generic Professional Male
const AVATAR_URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';

interface AvatarSceneProps {
    audioUrl: string | null;
    isPlaying: boolean;
    onEnded?: () => void;
}

const AvatarModel: React.FC<AvatarSceneProps> = ({ audioUrl, isPlaying, onEnded }) => {
    // This will suspend until loaded
    const { scene } = useGLTF(AVATAR_URL);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    // Cache meshes with morph targets for performance
    const morphMeshes = useMemo(() => {
        const meshes: THREE.Mesh[] = [];
        scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).morphTargetDictionary) {
                meshes.push(child as THREE.Mesh);
            }
        });
        return meshes;
    }, [scene]);

    // Setup Audio Context for Lip Sync
    useEffect(() => {
        if (!audioUrl) return;

        console.log("Initializing Audio Context for:", audioUrl);
        const audio = new Audio(audioUrl);
        // Important for CORS if using external audio, but here it's blob from backend usually
        audio.crossOrigin = "anonymous";
        audio.volume = 1.0;

        audioRef.current = audio;

        // Web Audio API setup to analyze frequency for lips
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();

        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyser.connect(audioCtx.destination); // Connect to speakers

        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        audio.onended = () => {
            if (onEnded) onEnded();
        };

        if (isPlaying) {
            audioCtx.resume().then(() => {
                audio.play().catch(e => console.error("Playback failed:", e));
            });
        }

        return () => {
            audio.pause();
            audio.src = '';
            audioCtx.close();
        };
    }, [audioUrl, isPlaying]);

    // Animation Loop
    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // 1. Idle Animation (Simulate Breathing / Head Bob)
        if (scene) {
            scene.rotation.y = Math.sin(t * 0.5) * 0.05; // Gentle sway
            scene.position.y = -1.5 + Math.sin(t * 1) * 0.005; // Breathing
        }

        // 2. Lip Sync Logic
        if (analyserRef.current && dataArrayRef.current && isPlaying && audioRef.current && !audioRef.current.paused) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);

            // Calculate energy in speech frequencies (roughly 300Hz - 3000Hz)
            const speechBins = dataArrayRef.current.slice(3, 35);
            const average = speechBins.reduce((a, b) => a + b, 0) / speechBins.length;

            // Normalize (0-255 -> 0-1) and smooth
            const targetOpen = Math.min(1, Math.max(0, (average - 20) / 100)); // Threshold filter

            morphMeshes.forEach((mesh) => {
                if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;

                // Priority: generic 'mouthOpen', then 'viseme_aa'
                const mouthOpenIdx = mesh.morphTargetDictionary['mouthOpen'] ?? mesh.morphTargetDictionary['viseme_aa'];

                if (mouthOpenIdx !== undefined) {
                    mesh.morphTargetInfluences[mouthOpenIdx] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[mouthOpenIdx],
                        targetOpen,
                        0.25 // Smoothness factor
                    );
                }
            });
        } else {
            // Close mouth
            morphMeshes.forEach((mesh) => {
                if (mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                    const idx = mesh.morphTargetDictionary['mouthOpen'] ?? mesh.morphTargetDictionary['viseme_aa'];
                    if (idx !== undefined) {
                        mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[idx], 0, 0.1);
                    }
                }
            });
        }
    });

    return <primitive object={scene} position={[0, -1.6, 0]} scale={1.2} />;
};

const Avatar3D: React.FC<AvatarSceneProps> = (props) => {
    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas shadows camera={{ position: [0, 0, 0.8], fov: 40 }}>
                {/* Lighting */}
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                {/* Environment Reflections */}
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <AvatarModel {...props} />
                </Suspense>

                {/* Controls (Disabled Zoom for static feel, enabled Rotate) */}
                <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 2.5} maxPolarAngle={Math.PI / 2} />

                <ContactShadows resolution={1024} scale={10} blur={2.5} opacity={0.5} far={10} color="#000000" />
            </Canvas>
            <Loader />
        </div>
    );
};

export default Avatar3D;
