import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SoundEngine } from '../services/soundEffects';
import { hapticRyno, hapticSelect } from '../services/haptics';

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

    const width = container.clientWidth || (size === 'sm' ? 180 : size === 'lg' ? 320 : 240);
    const height = container.clientHeight || (size === 'sm' ? 180 : size === 'lg' ? 320 : 240);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
    camera.position.set(0, 0.45, 5.5);

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
      emissiveIntensity: 0.45
    });

    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const innerEarMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.6 });
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.4, metalness: 0.3 });
    const clipMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });

    // Root Mascot Group
    const mascotGroup = new THREE.Group();
    mascotGroup.position.set(0, -0.2, 0);
    mascotGroup.scale.setScalar(1.7);
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
    headGroup.position.set(0, 0.58, 0.18);
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

    const pointerState = { x: 0, y: 0, active: false };

    const handlePointerMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;
      const x = (event.clientX - centerX) / (rect.width * 0.9 || 1);
      const y = (event.clientY - centerY) / (rect.height * 0.9 || 1);
      pointerState.x = THREE.MathUtils.clamp(x, -1.8, 1.8);
      pointerState.y = THREE.MathUtils.clamp(y, -1.8, 1.8);
      pointerState.active = true;
    };

    const handlePointerLeave = () => {
      pointerState.active = false;
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseleave', handlePointerLeave);

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
      const activePointerX = pointerState.active ? pointerState.x : 0;
      const activePointerY = pointerState.active ? pointerState.y : 0;
      const distance = Math.hypot(activePointerX, activePointerY);
      const engaged = pointerState.active ? THREE.MathUtils.clamp(1 - distance / 1.65, 0, 1) : 0;

      const tailSpeed = isCompletedNow ? 16 : isSelectedNow ? 12 : isDraggingNow ? 10 : 5;
      const tailAmp = isCompletedNow ? 0.45 : isSelectedNow ? 0.35 : 0.2;
      tailGroup.rotation.z = Math.sin(elapsed * tailSpeed) * tailAmp;

      const idleBreath = Math.sin(elapsed * 2.2) * 0.02;
      mascotGroup.position.y = THREE.MathUtils.lerp(mascotGroup.position.y, -0.2 + idleBreath, 0.08);
      mascotGroup.scale.x = 1 + Math.sin(elapsed * 2.2) * 0.015;
      mascotGroup.scale.z = 1 + Math.sin(elapsed * 2.2) * 0.015;

      const lookX = activePointerX * (0.85 + engaged * 1.2);
      const lookY = -activePointerY * (0.8 + engaged * 1.35);

      const targetHeadX = -lookY * 0.9 + Math.sin(elapsed * 1.4) * 0.12;
      const targetHeadY = lookX * 1.1 + Math.sin(elapsed * 1.1) * 0.08;
      const targetFaceZ = 0.18 + engaged * 0.24;

      headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, targetHeadX, 0.08);
      headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, targetHeadY, 0.08);
      headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, -lookX * 0.2, 0.08);
      headGroup.position.z = THREE.MathUtils.lerp(headGroup.position.z, targetFaceZ, 0.08);
      headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 0.58 + Math.sin(elapsed * 2.8) * 0.02 + engaged * 0.06, 0.08);
      headGroup.scale.setScalar(1 + engaged * 0.18);

      const eyeOffsetX = activePointerX * (0.08 + engaged * 0.14);
      const eyeOffsetY = -activePointerY * (0.07 + engaged * 0.15);
      const eyeDepth = 0.05 + engaged * 0.08;

      eyeL.position.x = THREE.MathUtils.lerp(eyeL.position.x, -0.075 + eyeOffsetX, 0.12);
      eyeL.position.y = THREE.MathUtils.lerp(eyeL.position.y, 0.03 + eyeOffsetY, 0.12);
      eyeL.position.z = THREE.MathUtils.lerp(eyeL.position.z, 0.19 + eyeDepth, 0.12);
      eyeL.scale.setScalar(1 + engaged * 0.25);

      eyeR.position.x = THREE.MathUtils.lerp(eyeR.position.x, 0.075 + eyeOffsetX, 0.12);
      eyeR.position.y = THREE.MathUtils.lerp(eyeR.position.y, 0.03 + eyeOffsetY, 0.12);
      eyeR.position.z = THREE.MathUtils.lerp(eyeR.position.z, 0.19 + eyeDepth, 0.12);
      eyeR.scale.setScalar(1 + engaged * 0.25);

      pupilL.position.x = THREE.MathUtils.lerp(pupilL.position.x, -0.075 + eyeOffsetX * 1.5, 0.1);
      pupilL.position.y = THREE.MathUtils.lerp(pupilL.position.y, 0.03 + eyeOffsetY * 1.45, 0.1);
      pupilL.position.z = THREE.MathUtils.lerp(pupilL.position.z, 0.22 + eyeDepth * 0.9, 0.1);
      pupilL.scale.setScalar(1 + engaged * 0.22);

      pupilR.position.x = THREE.MathUtils.lerp(pupilR.position.x, 0.075 + eyeOffsetX * 1.5, 0.1);
      pupilR.position.y = THREE.MathUtils.lerp(pupilR.position.y, 0.03 + eyeOffsetY * 1.45, 0.1);
      pupilR.position.z = THREE.MathUtils.lerp(pupilR.position.z, 0.22 + eyeDepth * 0.9, 0.1);
      pupilR.scale.setScalar(1 + engaged * 0.22);

      const earTarget = 0.22 + engaged * 0.25 + Math.sin(elapsed * 4.5) * 0.06;
      leftEar.rotation.z = THREE.MathUtils.lerp(leftEar.rotation.z, earTarget, 0.1);
      rightEar.rotation.z = THREE.MathUtils.lerp(rightEar.rotation.z, -earTarget, 0.1);
      leftEar.rotation.y = THREE.MathUtils.lerp(leftEar.rotation.y, -0.15 + lookX * 0.28, 0.08);
      rightEar.rotation.y = THREE.MathUtils.lerp(rightEar.rotation.y, 0.15 + lookX * 0.28, 0.08);

      if (isDraggingNow) {
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, -0.42 + engaged * 0.22, 0.08);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, lookX * 1.35, 0.08);
        headGroup.rotation.z = THREE.MathUtils.lerp(headGroup.rotation.z, -lookX * 0.2, 0.08);
      } else if (isSelectedNow) {
        const nod = Math.sin(elapsed * 6) * 0.12;
        headGroup.rotation.x = THREE.MathUtils.lerp(headGroup.rotation.x, nod, 0.12);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, 0, 0.1);
      } else if (isCompletedNow) {
        headGroup.position.y = THREE.MathUtils.lerp(headGroup.position.y, 0.62 + Math.sin(elapsed * 8) * 0.04 + engaged * 0.08, 0.08);
        headGroup.rotation.y = THREE.MathUtils.lerp(headGroup.rotation.y, Math.sin(elapsed * 5) * 0.2, 0.08);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
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
    hapticRyno();
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
          width: size === 'sm' ? 180 : size === 'lg' ? 320 : 240,
          height: size === 'sm' ? 180 : size === 'lg' ? 320 : 240,
          touchAction: 'none',
          pointerEvents: 'none'
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
