import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    // Refs for animation control to access them inside the loop without dependencies issues
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const isPlayingRef = useRef(isPlaying);
    const isRecordingRef = useRef(isRecording);
    const animationIdRef = useRef<number>(0);
    const lastBlinkRef = useRef<number>(0);
    useEffect(() => {
        console.log("Avatar Debug Update (Url/State):", { audioUrl, isPlaying, isRecording });
        isPlayingRef.current = isPlaying;
        isRecordingRef.current = isRecording;
        if (audioRef.current) {
            // Update source if changed
            if (audioUrl && audioRef.current.src !== audioUrl) {
                console.log("Avatar: Loading new audio source", audioUrl);
                audioRef.current.src = audioUrl;
                audioRef.current.load(); // Force load
            }
            if (isPlaying && audioUrl) {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (analyserRef.current && (analyserRef.current.context as any).state === 'suspended') {
                    (analyserRef.current.context as any).resume();
                }
                // Only play if paused or source changed
                audioRef.current.play().catch(e => {
                    if (e.name !== 'AbortError') console.error("Play failed", e);
                });
            } else {
                audioRef.current.pause();
                if (!isPlaying) audioRef.current.currentTime = 0;
            }
        }
    }, [audioUrl, isPlaying, isRecording]);
    useEffect(() => {
        if (!mountRef.current) return;
        /* ================= AUDIO SETUP ================= */
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        if (audioUrl) audio.src = audioUrl;
        audioRef.current = audio;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaElementSource(audio);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyserRef.current = analyser;
        // Cast to any to avoid ArrayBuffer types mismatch in strict mode
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount) as any;
        audio.onended = () => {
            if (onEnded) onEnded();
        };
        console.log("Avatar: Starting initialization...");
        /* ================= SCÈNE ================= */
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a); // Match app dark theme
        scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);
        /* ================= CAMÉRA ================= */
        const camera = new THREE.PerspectiveCamera(
            50,
            mountRef.current.clientWidth / mountRef.current.clientHeight || 1,
            0.1,
            1000
        );
        camera.position.set(0, 1.6, 2.5);
        camera.lookAt(0, 1.5, 0);
        /* ================= RENDERER ================= */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(
            mountRef.current.clientWidth || 300,
            mountRef.current.clientHeight || 300
        );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // THOROUGHLY CLEAN MOUNT BEFORE APPENDING
        if (mountRef.current) {
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
        }
        console.log("Avatar: New WebGLRenderer appended to cleared DOM");
        /* ================= LUMIÈRES ================= */
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
        sunLight.position.set(5, 10, 5);
        sunLight.castShadow = true;
        scene.add(sunLight);
        const blueLight = new THREE.DirectionalLight(0x06b6d4, 0.8); // Cyan tint for "AI" feel
        blueLight.position.set(-5, 5, 5);
        scene.add(blueLight);
        /* ================= SOL (Optional for dashboard view, maybe invisible) ================= */
        // Removing ground for cleaner UI integration or keeping it dark
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                roughness: 0.8,
                metalness: 0.5
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);
        /* ================= AVATAR (From original code) ================= */
        const avatar = new THREE.Group();
        const skin = new THREE.MeshStandardMaterial({
            color: 0xffc9a3,
            roughness: 0.6,
        });
        const hair = new THREE.MeshStandardMaterial({ color: 0x2a1810 });
        const shirt = new THREE.MeshStandardMaterial({ color: 0x06b6d4 }); // Cyan shirt to match UI
        const pants = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
        /* Tête */
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 64, 64),
            skin
        );
        head.position.y = 1.65;
        avatar.add(head);
        /* Cheveux */
        const hairTop = new THREE.Mesh(
            new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6),
            hair
        );
        hairTop.position.y = 1.78;
        avatar.add(hairTop);
        /* Yeux */
        const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const irisMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
        const leftEye = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 16, 16),
            eyeWhiteMat
        );
        leftEye.position.set(-0.12, 1.7, 0.3);
        const rightEye = leftEye.clone();
        rightEye.position.x = 0.12;
        const leftIris = new THREE.Mesh(
            new THREE.SphereGeometry(0.05, 16, 16),
            irisMat
        );
        leftIris.position.set(-0.12, 1.7, 0.37);
        const rightIris = leftIris.clone();
        rightIris.position.x = 0.12;
        avatar.add(leftEye, rightEye, leftIris, rightIris);
        /* Bouche (Added for Animation) */
        const mouthGeo = new THREE.BoxGeometry(0.1, 0.02, 0.02);
        const mouthMat = new THREE.MeshStandardMaterial({ color: 0x5a3a2a });
        const mouth = new THREE.Mesh(mouthGeo, mouthMat);
        mouth.position.set(0, 1.55, 0.32);
        avatar.add(mouth);
        /* Corps */
        const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.7, 0.35),
            shirt
        );
        torso.position.y = 0.8;
        avatar.add(torso);
        /* Jambes */
        const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 16);
        const leftLeg = new THREE.Mesh(legGeo, pants);
        leftLeg.position.set(-0.13, -0.05, 0);
        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.13;
        avatar.add(leftLeg, rightLeg);
        scene.add(avatar);
        setIsLoaded(true);
        /* ================= RESIZE HANDLING (ResizeObserver) ================= */
        const updateSize = () => {
            if (!mountRef.current) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            if (width > 0 && height > 0) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        };
        const resizeObserver = new ResizeObserver(updateSize);
        if (mountRef.current) {
            resizeObserver.observe(mountRef.current);
            updateSize(); // Initial call
        }
        /* ================= ANIMATION ================= */
        console.log("Avatar: Starting animation loop...");
        let frameCount = 0;
        let lastTime = performance.now();
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            frameCount++;
            const now = performance.now();
            const time = now * 0.001;
            const delta = (now - lastTime) * 0.001;
            lastTime = now;
            if (!avatar || !head || !mouth || !torso) {
                if (frameCount % 100 === 0) console.warn("Avatar: Critical objects missing!", { avatar: !!avatar, head: !!head, mouth: !!mouth, torso: !!torso });
                return;
            }
            // 1. Idle breathing & torso sway (Natural)
            const breathing = Math.sin(time * 2) * 0.012;
            const swayX = Math.sin(time * 0.6) * 0.008;
            if (frameCount % 600 === 0) {
                console.log("Avatar Loop Active:", { frameCount, isPlaying: isPlayingRef.current, breathing: breathing.toFixed(4) });
            }
            avatar.position.y = breathing;
            avatar.rotation.z = swayX;
            // Removed diagnostic rotation
            torso.scale.y = 1 + (breathing * 2);
            // 2. Head movement (Subtle & Human)
            let targetRotY = Math.sin(time * 0.4) * 0.12 + Math.cos(time * 0.1) * 0.05;
            let targetRotX = Math.cos(time * 0.3) * 0.08 + Math.sin(time * 0.2) * 0.03;
            let targetPosY = 1.65;
            // 3. Recording Mode (Attentive / Listening)
            if (isRecordingRef.current) {
                targetRotY = Math.sin(time * 1.5) * 0.05;
                targetRotX = 0.1 + Math.sin(time * 4) * 0.08;
                head.rotation.z = Math.sin(time * 2) * 0.03;
            }
            // 4. Blinking
            if (time - lastBlinkRef.current > 3 + Math.random() * 4) {
                leftEye.scale.y = 0.1;
                rightEye.scale.y = 0.1;
                if (time - lastBlinkRef.current > 3.1) lastBlinkRef.current = time;
            } else {
                leftEye.scale.y = THREE.MathUtils.lerp(leftEye.scale.y, 1, 0.3);
                rightEye.scale.y = THREE.MathUtils.lerp(rightEye.scale.y, 1, 0.3);
            }
            // 5. Talking Animation (Lip Sync)
            if (analyserRef.current && dataArrayRef.current && isPlayingRef.current && !audio.paused) {
                try {
                    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
                    const data = dataArrayRef.current;
                    let sum = 0;
                    for (let i = 0; i < 30; i++) sum += data[i];
                    const avg = sum / 30;
                    // Balanced mouth movement: not too subtle, not screaming
                    const openAmount = 1 + Math.min((avg / 256) * 3.5, 0.7);
                    mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, openAmount, 0.5);
                    targetPosY = 1.65 + (avg / 256) * 0.05; // More subtle
                    targetRotX += (avg / 256) * 0.2; // More subtle head movement during speech
                } catch (e) { /* ignore analyser errors */ }
            } else {
                mouth.scale.y = THREE.MathUtils.lerp(mouth.scale.y, 1, 0.15);
            }
            // Apply smooth transitions
            head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, targetRotY, 0.08);
            head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, targetRotX, 0.08);
            head.position.y = THREE.MathUtils.lerp(head.position.y, targetPosY, 0.18);
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            resizeObserver.disconnect();
            if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
            renderer.dispose();
            audio.pause();
            audioCtx.close();
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);
    return (
        <div
            ref={mountRef}
            className="w-full h-full relative"
            style={{ minHeight: '300px' }}
        >
            {/* Subtle HUD Overlay for AI Coach */}
            <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
                    <span className="text-cyan-500 text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Neural Link Active</span>
                </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-sm border border-cyan-500/50 rotate-45"></div>
                <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">
                    AI Coach v2.1
                </span>
            </div>
        </div>
    );
};
export default RealisticAvatarIntegrated;