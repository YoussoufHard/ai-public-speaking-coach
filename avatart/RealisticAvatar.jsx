import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const RealisticAvatar = () => {
  const mountRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    /* ================= SCÈNE ================= */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 10, 50);

    /* ================= CAMÉRA ================= */
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.6, 3);
    camera.lookAt(0, 1.5, 0);

    /* ================= RENDERER ================= */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    /* ================= LUMIÈRES ================= */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const sunLight = new THREE.DirectionalLight(0xfff4e6, 1.2);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    scene.add(new THREE.DirectionalLight(0x4a90e2, 0.6));
    scene.add(new THREE.PointLight(0xffffff, 0.4));

    /* ================= SOL ================= */
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({
        color: 0x4a7c59,
        roughness: 0.8,
      })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* ================= AVATAR ================= */
    const avatar = new THREE.Group();

    const skin = new THREE.MeshStandardMaterial({
      color: 0xffc9a3,
      roughness: 0.6,
    });
    const hair = new THREE.MeshStandardMaterial({ color: 0x2a1810 });
    const shirt = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
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
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x2e5090 });

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

    /* ================= ANIMATION ================= */
    let t = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      t += 0.01;

      avatar.rotation.y = Math.sin(t * 0.3) * 0.15;
      torso.scale.y = 1 + Math.sin(t * 0.8) * 0.01;

      renderer.render(scene, camera);
    };
    animate();

    /* ================= RESIZE ================= */
    const onResize = () => {
      camera.aspect =
        mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current.clientWidth,
        mountRef.current.clientHeight
      );
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  /* ================= JSX ================= */
  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", position: "relative" }}
    >
      {isLoaded && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
          }}
        >
          <h3>🎮 Avatar 3D Réaliste</h3>
          <p>Style GTA</p>
          <p>🖱️ Glissez pour tourner</p>
        </div>
      )}
    </div>
  );
};

export default RealisticAvatar;
