import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

interface RealisticAvatarIntegratedProps {
    audioUrl: string | null;
    isPlaying: boolean;
    isRecording?: boolean;
    onEnded?: () => void;
}

const RealisticAvatarIntegrated: React.FC<RealisticAvatarIntegratedProps> = ({
    audioUrl,
    isPlaying,
    isRecording = false,
    onEnded
}) => {

    const createSimpleHead = () => {
        const headGroup = new THREE.Group();

        // Head sphere
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        headGroup.add(head);

        // Eyes
        const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.15, 0.1, 0.4);
        headGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.15, 0.1, 0.4);
        headGroup.add(rightEye);

        // Mouth
        const mouthGeometry = new THREE.BoxGeometry(0.2, 0.05, 0.01);
        const mouthMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const mouthMesh = new THREE.Mesh(mouthGeometry, mouthMaterial);
        mouthMesh.position.set(0, -0.2, 0.45);
        headGroup.add(mouthMesh);

        return { headGroup, mouthMesh };
    };
    const rootRef = useRef<HTMLDivElement>(null);
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    // Refs for animation control and audio analysis
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const actionsRef = useRef<{ [key: string]: THREE.AnimationAction }>({});
    const currentActionRef = useRef<string>("Idle");
    const jawBoneRef = useRef<THREE.Object3D | null>(null);
    const headBoneRef = useRef<THREE.Object3D | null>(null);
    const mouthMeshRef = useRef<THREE.Mesh | null>(null);
    const animationIdRef = useRef<number>(0);
    const clockRef = useRef(new THREE.Clock());

    const isPlayingRef = useRef(isPlaying);
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        isRecordingRef.current = isRecording;

        if (audioRef.current) {
            if (audioUrl && audioRef.current.src !== audioUrl) {
                audioRef.current.src = audioUrl;
                audioRef.current.load();
            }

            if (isPlaying && audioUrl) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (analyserRef.current && (analyserRef.current.context as any).state === 'suspended') {
                    (analyserRef.current.context as any).resume();
                }
                audioRef.current.play().catch(e => {
                    if (e.name !== 'AbortError') console.error("Play failed", e);
                });

                // Switch to Talking animation
                if (actionsRef.current["Talking"]) {
                    playAnimation("Talking");
                }
            } else {
                audioRef.current.pause();
                if (!isPlaying) {
                    audioRef.current.currentTime = 0;
                    // Switch back to Idle or Thinking if not recording
                    if (isRecordingRef.current) {
                        playAnimation("Thinking");
                    } else {
                        playAnimation("Idle");
                    }
                }
            }
        }
    }, [audioUrl, isPlaying, isRecording]);

    const playAnimation = (name: string) => {
        if (currentActionRef.current === name) return;

        const prevAction = actionsRef.current[currentActionRef.current];
        const nextAction = actionsRef.current[name];

        if (nextAction) {
            if (prevAction) prevAction.fadeOut(0.5);
            nextAction.reset().fadeIn(0.5).play();
            currentActionRef.current = name;
        }
    };

    useEffect(() => {
        if (!mountRef.current) return;
        let isMounted = true;

        /* ================= AUDIO SETUP ================= */
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        if (audioUrl) audio.src = audioUrl;
        audioRef.current = audio;

        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        audio.onended = () => {
            if (onEnded) onEnded();
        };

        /* ================= THREE.JS SCENE ================= */
        const scene = new THREE.Scene();
        scene.background = null;

        const camera = new THREE.PerspectiveCamera(
            35,
            mountRef.current.clientWidth / mountRef.current.clientHeight || 1,
            0.1,
            1000
        );
        camera.position.set(0, 1.6, 2.8);
        camera.lookAt(0, 1.4, 0);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }

        /* ================= LIGHTS ================= */
        scene.add(new THREE.AmbientLight(0xffffff, 1.0));

        const spotLight = new THREE.SpotLight(0xffffff, 15);
        spotLight.position.set(2, 5, 2);
        spotLight.castShadow = true;
        scene.add(spotLight);

        const pointLight = new THREE.PointLight(0x06b6d4, 3);
        pointLight.position.set(-2, 2, 1);
        scene.add(pointLight);

        /* ================= SEQUENTIAL FBX LOADING ================= */
        const loader = new FBXLoader();
        const modelsToLoad = ['Idle', 'Talking', 'Thankful', 'Thinking'];

        const loadSequentially = async () => {
            for (let i = 0; i < modelsToLoad.length; i++) {
                if (!isMounted) return;
                const name = modelsToLoad[i];

                try {
                    await new Promise<void>((resolve) => {
                        loader.load(`/assets/models/${name}.fbx`, (fbx: THREE.Group) => {
                            if (!isMounted) return resolve();

                            if (name === 'Idle') {
                                fbx.scale.set(0.01, 0.01, 0.01);
                                fbx.position.y = 0;
                                scene.add(fbx);

                                const mixer = new THREE.AnimationMixer(fbx);
                                mixerRef.current = mixer;

                                fbx.traverse((child: THREE.Object3D) => {
                                    // High-visibility logging for critical bones
                                    const boneName = child.name.toLowerCase();
                                    if (boneName.includes('jaw') || boneName.includes('mouth') || boneName.includes('head_jaw')) {
                                        jawBoneRef.current = child;
                                        console.warn(">>> AVATAR SYSTEM: Jaw bone detected as:", child.name);
                                    }
                                    if (boneName.includes('head') && !boneName.includes('top') && !boneName.includes('end')) {
                                        headBoneRef.current = child;
                                        console.warn(">>> AVATAR SYSTEM: Head bone detected as:", child.name);
                                    }

                                    // Replace head mesh with 3D head
                                    if (child instanceof THREE.Mesh && child.name.toLowerCase().includes('head') && child.parent) {
                                        const { headGroup, mouthMesh: newMouthMesh } = createSimpleHead();
                                        headGroup.scale.set(100, 100, 100);
                                        child.parent.add(headGroup);
                                        child.parent.remove(child);
                                        mouthMeshRef.current = newMouthMesh;
                                    }

                                    // Debug: Check all bone names if jaw is elusive
                                    if ((child as THREE.Bone).isBone) {
                                        // console.log("Bone found:", child.name); // Keep commented for performance
                                    }
                                    if (child instanceof THREE.Mesh) {
                                        child.castShadow = true;
                                        child.receiveShadow = true;
                                        if (child.geometry) child.geometry.computeBoundingSphere();
                                    }
                                });


                                if (fbx.animations.length > 0) {
                                    const action = mixer.clipAction(fbx.animations[0]);
                                    actionsRef.current[name] = action;
                                    action.play();
                                }
                            } else {
                                if (mixerRef.current && fbx.animations.length > 0) {
                                    const action = mixerRef.current.clipAction(fbx.animations[0]);

                                    // Gestures like 'Thankful' should only play once
                                    if (name === 'Thankful' || name === 'Thinking') {
                                        action.setLoop(THREE.LoopOnce, 1);
                                        action.clampWhenFinished = true;
                                    }

                                    // Reduce weight of 'Talking' to make it less "wild" and more realistic
                                    if (name === 'Talking') {
                                        action.setEffectiveWeight(0.4); // 40% gesture amplitude, mostly use Idle pose
                                    }

                                    actionsRef.current[name] = action;
                                }
                            }

                            if (isMounted) {
                                setLoadProgress(((i + 1) / modelsToLoad.length) * 100);
                                if (i === modelsToLoad.length - 1) setIsLoaded(true);
                            }
                            resolve();
                        }, undefined, (err) => {
                            console.error(`Failed to load ${name}:`, err);
                            resolve();
                        });
                    });
                } catch (e) {
                    console.error("Critical loader error:", e);
                }
            }
        };

        loadSequentially();

        /* ================= ANIMATION LOOP ================= */
        const animate = () => {
            if (!isMounted) return;
            animationIdRef.current = requestAnimationFrame(animate);
            const delta = clockRef.current.getDelta();

            if (mixerRef.current) {
                mixerRef.current.update(delta);
            }

            if (jawBoneRef.current && analyserRef.current && dataArrayRef.current && isPlayingRef.current) {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);

                // Exaggerated Jaw Movement Logic
                const speechBins = Array.from(dataArrayRef.current).slice(0, 8);
                let sum = 0;
                for (let val of speechBins) sum += val;
                const average = sum / speechBins.length;

                // Threshold to avoid jitters on background noise
                const threshold = 15;
                const adjustedAverage = average > threshold ? average : 0;

                // Amplify the movement significantly (multiplier = 1.0 instead of 0.6)
                const intensity = THREE.MathUtils.clamp(adjustedAverage / 40, 0, 1);
                const targetJawX = -intensity * 1.5; // High amplitude for visibility

                // Keep the lerp but make it snappy (0.5)
                jawBoneRef.current.rotation.x = THREE.MathUtils.lerp(jawBoneRef.current.rotation.x, targetJawX, 0.5);
            } else if (jawBoneRef.current) {
                // Return to closed position
                jawBoneRef.current.rotation.x = THREE.MathUtils.lerp(jawBoneRef.current.rotation.x, 0, 0.2);
            }

            // Mouth mesh animation
            if (mouthMeshRef.current) {
                if (isPlayingRef.current) {
                    mouthMeshRef.current.scale.y = 100 * (1 + Math.sin(Date.now() * 0.01) * 0.3);
                    mouthMeshRef.current.scale.x = 100 * (1 + Math.sin(Date.now() * 0.01 + Math.PI / 2) * 0.2);
                    mouthMeshRef.current.scale.z = 100;
                } else {
                    mouthMeshRef.current.scale.set(100, 100, 100);
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        /* ================= RESIZE ================= */
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationIdRef.current);
            renderer.dispose();
            audioCtx.close();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div ref={rootRef} className="w-full h-full relative overflow-hidden bg-slate-900/10 rounded-3xl">
            {/* Dedicated Three.js Mount Point */}
            <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

            {!isLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
                    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-cyan-500 transition-all duration-300"
                            style={{ width: `${loadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-cyan-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                        Synchronizing Neural Model... {Math.round(loadProgress)}%
                    </p>
                </div>
            )}

            {isLoaded && (
                <>
                    <div className="absolute top-6 left-6 animate-in fade-in duration-1000 z-10">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping absolute inset-0"></div>
                                <div className="w-3 h-3 rounded-full bg-cyan-400 relative z-10"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Connection</span>
                                <span className="text-white/40 text-[8px] font-medium uppercase tracking-[0.1em]">Humanoid Interface Unit #42</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 animate-in fade-in slide-in-from-right-4 duration-1000 z-10">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-0.5 h-3 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                                    ))}
                                </div>
                                <span className="text-white text-[10px] font-bold uppercase tracking-[0.15em]">AI Coach Active</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RealisticAvatarIntegrated;
