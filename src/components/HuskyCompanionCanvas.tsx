import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SoundEngine } from '../services/soundEffects';
import { hapticSelect } from '../services/haptics';

export interface HuskyCompanionCanvasProps {
  isDragging?: boolean;
  isSelected?: boolean;
  isConverting?: boolean;
  isCompleted?: boolean;
  isDarkMode?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  caption?: string;
}

export const HuskyCompanionCanvas: React.FC<HuskyCompanionCanvasProps> = ({
  isDragging = false,
  isSelected = false,
  isConverting = false,
  isCompleted = false,
  isDarkMode = true,
  className = '',
  size = 'md',
  caption
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const isDraggingRef = useRef(isDragging);
  const isSelectedRef = useRef(isSelected);
  const isConvertingRef = useRef(isConverting);
  const isCompletedRef = useRef(isCompleted);
  const isDarkRef = useRef(isDarkMode);

  isDraggingRef.current = isDragging;
  isSelectedRef.current = isSelected;
  isConvertingRef.current = isConverting;
  isCompletedRef.current = isCompleted;
  isDarkRef.current = isDarkMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || (size === 'sm' ? 120 : size === 'lg' ? 220 : 160);
    const height = container.clientHeight || (size === 'sm' ? 120 : size === 'lg' ? 220 : 160);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.25, 3.4);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const isDark = isDarkRef.current;

    // Siberian Husky Materials
    const furBrown = new THREE.MeshStandardMaterial({
      color: isDark ? 0x6e3d23 : 0x7a4325,
      roughness: 0.75,
      metalness: 0.1
    });

    const furCream = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf4eee4 : 0xfdfaf4,
      roughness: 0.7,
      metalness: 0.05
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.2
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.6 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4, metalness: 0.3 });
    const clipMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });

    // Root Mascot Group
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0, -0.22, 0);
    scene.add(mascotGroup);

    // Torso / Body (Sitting posture)
    const torsoGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.55, 18);
    const torsoMesh = new THREE.Mesh(torsoGeo, furBrown);
    torsoMesh.position.y = 0.18;
    torsoMesh.castShadow = true;
    mascotGroup.add(torsoMesh);

    // Cream Chest & Belly
    const chestGeo = new THREE.SphereGeometry(0.22, 16, 16, 0, Math.PI);
    chestGeo.rotateY(Math.PI / 2);
    const chestMesh = new THREE.Mesh(chestGeo, furCream);
    chestMesh.position.set(0, 0.2, 0.08);
    mascotGroup.add(chestMesh);

    // Aviator Collar
    const collarGeo = new THREE.TorusGeometry(0.21, 0.03, 12, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.y = 0.42;
    mascotGroup.add(collarMesh);

    const tagMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.015, 12), clipMat);
    tagMesh.position.set(0, 0.38, 0.22);
    mascotGroup.add(tagMesh);

    // Front Paws (Clean sitting stance)
    const pawL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.38, 12), furCream);
    pawL.position.set(-0.11, 0.08, 0.16);
    mascotGroup.add(pawL);
    const footL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), furCream);
    footL.position.set(-0.11, -0.09, 0.2);
    mascotGroup.add(footL);

    const pawR = pawL.clone();
    pawR.position.x = 0.11;
    mascotGroup.add(pawR);
    const footR = footL.clone();
    footR.position.x = 0.11;
    mascotGroup.add(footR);

    // Hind Leg Thighs (Bulging sitting haunches)
    const haunchL = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), furBrown);
    haunchL.scale.set(0.9, 1.2, 1.1);
    haunchL.position.set(-0.22, 0.05, -0.04);
    mascotGroup.add(haunchL);
    const haunchR = haunchL.clone();
    haunchR.position.x = 0.22;
    mascotGroup.add(haunchR);

    // Fluffy Siberian Sickle Tail
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.02, -0.2);
    for (let i = 0; i < 5; i++) {
      const tMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.09 - i * 0.01, 12, 12),
        i === 4 ? furCream : furBrown
      );
      tMesh.position.set(0, (i + 1) * 0.09, -(i * 0.05));
      tailGroup.add(tMesh);
    }
    mascotGroup.add(tailGroup);

    // Articulated Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.58, 0.08);
    mascotGroup.add(headGroup);

    // Head Skull
    const skullGeo = new THREE.SphereGeometry(0.22, 22, 22);
    const skullMesh = new THREE.Mesh(skullGeo, furBrown);
    skullMesh.castShadow = true;
    headGroup.add(skullMesh);

    // Cream Muzzle & Cheeks
    const muzzleGeo = new THREE.ConeGeometry(0.12, 0.2, 16);
    muzzleGeo.rotateX(Math.PI / 2);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, furCream);
    muzzleMesh.position.set(0, -0.05, 0.22);
    headGroup.add(muzzleMesh);

    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 14, 14), furCream);
    cheekL.position.set(-0.09, -0.06, 0.12);
    headGroup.add(cheekL);
    const cheekR = cheekL.clone();
    cheekR.position.set(0.09, -0.06, 0.12);
    headGroup.add(cheekR);

    // Siberian Mask Markings
    const maskGeo = new THREE.BoxGeometry(0.06, 0.16, 0.06);
    const maskMesh = new THREE.Mesh(maskGeo, furBrown);
    maskMesh.position.set(0, 0.06, 0.2);
    headGroup.add(maskMesh);

    // Black Nose Tip
    const noseGeo = new THREE.SphereGeometry(0.038, 12, 12);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.set(0, -0.04, 0.32);
    headGroup.add(noseMesh);

    // Upright Triangular Husky Ears
    const leftEar = new THREE.Group();
    leftEar.position.set(-0.12, 0.18, 0);
    const earOuterL = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 12), furBrown);
    leftEar.add(earOuterL);
    const earInnerL = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 8), innerEarMat);
    earInnerL.position.z = 0.025;
    leftEar.add(earInnerL);
    leftEar.rotation.set(-0.1, -0.15, 0.22);
    headGroup.add(leftEar);

    const rightEar = new THREE.Group();
    rightEar.position.set(0.12, 0.18, 0);
    const earOuterR = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 12), furBrown);
    rightEar.add(earOuterR);
    const earInnerR = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 8), innerEarMat);
    earInnerR.position.z = 0.025;
    rightEar.add(earInnerR);
    rightEar.rotation.set(-0.1, 0.15, -0.22);
    headGroup.add(rightEar);

    // Expressive Ice-Blue Husky Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), eyeMat);
    eyeL.position.set(-0.075, 0.03, 0.19);
    headGroup.add(eyeL);
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), pupilMat);
    pupilL.position.set(-0.075, 0.03, 0.22);
    headGroup.add(pupilL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), eyeMat);
    eyeR.position.set(0.075, 0.03, 0.19);
    headGroup.add(eyeR);
    const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), pupilMat);
    pupilR.position.set(0.075, 0.03, 0.22);
    headGroup.add(pupilR);

    // Aviator Goggles resting on forehead
    const goggleGroup = new THREE.Group();
    goggleGroup.position.set(0, 0.14, 0.14);
    const goggleL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), eyeMat);
    goggleL.rotateX(Math.PI / 2);
    goggleL.position.x = -0.075;
    goggleGroup.add(goggleL);
    const goggleR = goggleL.clone();
    goggleR.position.x = 0.075;
    goggleGroup.add(goggleR);
    const goggleBridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.02), clipMat);
    goggleGroup.add(goggleBridge);
    const goggleStrap = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.02, 8, 24), clipMat);
    goggleStrap.position.set(0, -0.02, -0.08);
    goggleGroup.add(goggleStrap);
    headGroup.add(goggleGroup);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.0 : 2.4);
    dirLight.position.set(3, 4, 3);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, isDark ? 1.5 : 0.8);
    rimLight.position.set(-2, -1, -2);
    scene.add(rimLight);

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePosRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const isDraggingNow = isDraggingRef.current;
      const isSelectedNow = isSelectedRef.current;
      const isCompletedNow = isCompletedRef.current;
      const mouse = mousePosRef.current;

      // Tail wag speed
      const tailSpeed = isCompletedNow ? 16 : isSelectedNow ? 12 : isDraggingNow ? 10 : 5;
      const tailAmp = isCompletedNow ? 0.45 : isSelectedNow ? 0.35 : 0.2;
      tailGroup.rotation.z = Math.sin(elapsed * tailSpeed) * tailAmp;

      // Breathing
      mascotGroup.scale.x = 1 + Math.sin(elapsed * 2.2) * 0.015;
      mascotGroup.scale.z = 1 + Math.sin(elapsed * 2.2) * 0.015;

      if (isDraggingNow) {
        // Highly alert! Looks up towards the incoming dragged file
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.3, 0.1);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, mouse.x * 0.4, 0.1);
        leftEar.rotation.z = 0.32;
        rightEar.rotation.z = -0.32;
      } else if (isSelectedNow) {
        // Happy nodding approval
        const nod = Math.sin(elapsed * 6) * 0.1;
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, nod, 0.15);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
        leftEar.rotation.z = 0.26;
        rightEar.rotation.z = -0.26;
      } else if (isCompletedNow) {
        // Joyful victory bob
        headGroup.position.y = 0.58 + Math.sin(elapsed * 8) * 0.03;
        headGroup.rotation.y = Math.sin(elapsed * 5) * 0.15;
        leftEar.rotation.z = 0.3 + Math.sin(elapsed * 10) * 0.05;
        rightEar.rotation.z = -0.3 - Math.sin(elapsed * 10) * 0.05;
      } else {
        // Natural curious tracking of user cursor
        const targetHeadX = -mouse.y * 0.25;
        const targetHeadY = mouse.x * 0.45;
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadX, 0.05);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadY, 0.05);
        leftEar.rotation.z = 0.22;
        rightEar.rotation.z = -0.22;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      try {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      } catch {}
    };
  }, [size]);

  const handleCompanionClick = () => {
    SoundEngine.playHuskyGreeting();
    hapticSelect();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none group cursor-pointer ${className}`}
      onClick={handleCompanionClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Barnaby the Siberian Husky · ConvertAnyFile Mascot (Click to say hi!)"
    >
      <div
        ref={mountRef}
        style={{
          width: size === 'sm' ? 100 : size === 'lg' ? 200 : 140,
          height: size === 'sm' ? 100 : size === 'lg' ? 200 : 140,
          touchAction: 'none'
        }}
        className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
      />
      {caption && (
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors group-hover:text-slate-800 dark:group-hover:text-slate-200">
          {caption}
        </span>
      )}
    </div>
  );
};
