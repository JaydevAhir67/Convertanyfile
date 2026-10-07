import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type RocketFlightStage =
  | 'docking'
  | 'preparing'
  | 'startup'
  | 'launch'
  | 'space_travel'
  | 'galaxy_arrival'
  | 'complete'
  | 'error';

export interface ThreeDRocketCanvasProps {
  progress: number;
  stage?: RocketFlightStage;
  fileExtension?: string;
  isDarkMode?: boolean;
  className?: string;
}

export const ThreeDRocketCanvas: React.FC<ThreeDRocketCanvasProps> = ({
  progress,
  stage = 'space_travel',
  fileExtension = 'FILE',
  isDarkMode = true,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const stageRef = useRef(stage);
  const isDarkRef = useRef(isDarkMode);

  progressRef.current = progress;
  stageRef.current = stage;
  isDarkRef.current = isDarkMode;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 280;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.2);

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

    // Master Groups
    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);

    const galaxyGroup = new THREE.Group();
    galaxyGroup.position.set(0.6, 0.4, -6.0);
    scene.add(galaxyGroup);

    // ==========================================
    // MATERIALS CONFIGURATION
    // ==========================================
    const isDark = isDarkRef.current;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xe2e8f0 : 0xf8fafc,
      roughness: 0.25,
      metalness: 0.35
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xe11d48 : 0xdc2626,
      roughness: 0.3,
      metalness: 0.2
    });

    const finMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0x334155,
      roughness: 0.4,
      metalness: 0.6
    });

    const nozzleMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.8
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x38bdf8 : 0x0284c7,
      roughness: 0.1,
      metalness: 0.9,
      emissive: isDark ? 0x0284c7 : 0x0369a1,
      emissiveIntensity: 0.35
    });

    const capsuleMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x059669,
      emissiveIntensity: 0.45
    });

    // Brown Siberian Husky Materials
    const huskyFurBrown = new THREE.MeshStandardMaterial({
      color: isDark ? 0x6e3d23 : 0x7a4325, // Rich warm chocolate brown
      roughness: 0.75,
      metalness: 0.1
    });

    const huskyFurCream = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf4eee4 : 0xfdfaf4, // Warm Siberian cream / ivory
      roughness: 0.7,
      metalness: 0.05
    });

    const huskyNoseMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.35,
      metalness: 0.2
    });

    const huskyEyeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Striking ice-blue Husky eye
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0x0284c7,
      emissiveIntensity: 0.3
    });

    const huskyPupilMat = new THREE.MeshBasicMaterial({
      color: 0x09090b
    });

    const huskyInnerEarMat = new THREE.MeshStandardMaterial({
      color: 0xfca5a5, // Soft pink inner ear
      roughness: 0.6
    });

    const huskyGoggleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.15,
      transparent: true,
      opacity: 0.85
    });

    const huskyGoggleFrameMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.3
    });

    const huskyCollarMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Ruby safety aviator harness
      roughness: 0.4,
      metalness: 0.3
    });

    // ==========================================
    // 3D ROCKET ASSEMBLY
    // ==========================================
    // 1. Fuselage Body
    const bodyGeo = new THREE.CylinderGeometry(0.32, 0.35, 1.4, 32);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.castShadow = true;
    rocketGroup.add(bodyMesh);

    // 2. Aerodynamic Nose Cone
    const noseGeo = new THREE.ConeGeometry(0.32, 0.75, 32);
    const noseMesh = new THREE.Mesh(noseGeo, noseMat);
    noseMesh.position.y = 1.07;
    noseMesh.castShadow = true;
    rocketGroup.add(noseMesh);

    // Needle probe
    const tipGeo = new THREE.CylinderGeometry(0.02, 0.04, 0.25, 16);
    const tipMesh = new THREE.Mesh(tipGeo, finMat);
    tipMesh.position.y = 1.5;
    rocketGroup.add(tipMesh);

    // 3. Cockpit Porthole Window
    const windowRingGeo = new THREE.TorusGeometry(0.12, 0.025, 16, 32);
    const windowRingMesh = new THREE.Mesh(windowRingGeo, finMat);
    windowRingMesh.position.set(0, 0.35, 0.33);
    rocketGroup.add(windowRingMesh);

    const windowGlassGeo = new THREE.SphereGeometry(0.11, 24, 24);
    const windowGlassMesh = new THREE.Mesh(windowGlassGeo, glassMat);
    windowGlassMesh.position.set(0, 0.35, 0.31);
    rocketGroup.add(windowGlassMesh);

    // 4. Secondary Porthole
    const windowSmallGeo = new THREE.SphereGeometry(0.07, 16, 16);
    const windowSmallMesh = new THREE.Mesh(windowSmallGeo, glassMat);
    windowSmallMesh.position.set(0, 0.05, 0.33);
    rocketGroup.add(windowSmallMesh);

    // 5. Tail Engine Nozzle
    const nozzleGeo = new THREE.CylinderGeometry(0.24, 0.32, 0.3, 32, 1, true);
    const nozzleMesh = new THREE.Mesh(nozzleGeo, nozzleMat);
    nozzleMesh.position.y = -0.8;
    rocketGroup.add(nozzleMesh);

    // 6. Aerodynamic Stabilizer Fins (3 fins placed 120 deg apart)
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const finGroup = new THREE.Group();
      finGroup.rotation.y = angle;

      const finShape = new THREE.Shape();
      finShape.moveTo(0, -0.6);
      finShape.lineTo(0.48, -0.9);
      finShape.lineTo(0.38, -0.3);
      finShape.lineTo(0, 0.1);
      finShape.closePath();

      const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
      const finGeo = new THREE.ExtrudeGeometry(finShape, extrudeSettings);
      finGeo.center();
      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.position.set(0.38, -0.5, 0);
      finMesh.castShadow = true;
      finGroup.add(finMesh);

      rocketGroup.add(finGroup);
    }

    // 7. Rocket Grab Handle for Siberian Husky (Side safety attachment)
    const handleGroup = new THREE.Group();
    handleGroup.position.set(0.32, -0.05, 0.12);
    const handleBarGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 16);
    handleBarGeo.rotateZ(Math.PI / 2);
    const handleBarMesh = new THREE.Mesh(handleBarGeo, finMat);
    handleGroup.add(handleBarMesh);
    const mount1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.08, 12), finMat);
    mount1.rotateX(Math.PI / 2);
    mount1.position.set(-0.16, 0, -0.04);
    handleGroup.add(mount1);
    const mount2 = mount1.clone();
    mount2.position.set(0.16, 0, -0.04);
    handleGroup.add(mount2);
    rocketGroup.add(handleGroup);

    // ==========================================
    // 3D SIBERIAN HUSKY COMPANION RIG
    // ==========================================
    const huskyGroup = new THREE.Group();
    // Positioned at the grab handle on the rocket side
    huskyGroup.position.set(0.44, -0.05, 0.12);
    huskyGroup.scale.set(0.85, 0.85, 0.85);
    rocketGroup.add(huskyGroup);

    // Body Rig (Pivots from the grip point like a pendulum)
    const huskyBodyRig = new THREE.Group();
    huskyGroup.add(huskyBodyRig);

    // Torso / Body (Brown back, cream belly)
    const huskyTorsoGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.35, 16);
    const huskyTorsoMesh = new THREE.Mesh(huskyTorsoGeo, huskyFurBrown);
    huskyTorsoMesh.position.y = -0.2;
    huskyTorsoMesh.castShadow = true;
    huskyBodyRig.add(huskyTorsoMesh);

    // Cream Chest & Belly
    const chestGeo = new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI);
    chestGeo.rotateY(Math.PI / 2);
    const chestMesh = new THREE.Mesh(chestGeo, huskyFurCream);
    chestMesh.position.set(0, -0.17, 0.05);
    huskyBodyRig.add(chestMesh);

    // Aviator Safety Collar
    const collarGeo = new THREE.TorusGeometry(0.12, 0.02, 12, 24);
    collarGeo.rotateX(Math.PI / 2);
    const collarMesh = new THREE.Mesh(collarGeo, huskyCollarMat);
    collarMesh.position.y = -0.04;
    huskyBodyRig.add(collarMesh);

    // Metallic Carabiner Clip
    const clipMesh = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.008, 8, 16), nozzleMat);
    clipMesh.position.set(0, -0.06, 0.13);
    huskyBodyRig.add(clipMesh);

    // Articulated Head
    const huskyHead = new THREE.Group();
    huskyHead.position.set(0, 0.06, 0.06);
    huskyBodyRig.add(huskyHead);

    // Head Skull (Brown)
    const skullGeo = new THREE.SphereGeometry(0.14, 20, 20);
    const skullMesh = new THREE.Mesh(skullGeo, huskyFurBrown);
    skullMesh.castShadow = true;
    huskyHead.add(skullMesh);

    // Cream Muzzle & Cheeks
    const muzzleGeo = new THREE.ConeGeometry(0.08, 0.13, 16);
    muzzleGeo.rotateX(Math.PI / 2);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, huskyFurCream);
    muzzleMesh.position.set(0, -0.03, 0.14);
    huskyHead.add(muzzleMesh);

    const cheekL = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), huskyFurCream);
    cheekL.position.set(-0.06, -0.04, 0.07);
    huskyHead.add(cheekL);
    const cheekR = cheekL.clone();
    cheekR.position.set(0.06, -0.04, 0.07);
    huskyHead.add(cheekR);

    // Siberian Mask Markings
    const maskGeo = new THREE.BoxGeometry(0.04, 0.11, 0.04);
    const maskMesh = new THREE.Mesh(maskGeo, huskyFurBrown);
    maskMesh.position.set(0, 0.04, 0.13);
    huskyHead.add(maskMesh);

    // Black Leather Nose
    const huskyNoseGeo = new THREE.SphereGeometry(0.026, 12, 12);
    const huskyNoseMesh = new THREE.Mesh(huskyNoseGeo, huskyNoseMat);
    huskyNoseMesh.position.set(0, -0.02, 0.21);
    huskyHead.add(huskyNoseMesh);

    // Upright Triangular Husky Ears
    const leftEar = new THREE.Group();
    leftEar.position.set(-0.075, 0.11, 0);
    const earGeo = new THREE.ConeGeometry(0.06, 0.14, 12);
    const earOuterL = new THREE.Mesh(earGeo, huskyFurBrown);
    leftEar.add(earOuterL);
    const earInnerL = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.1, 8), huskyInnerEarMat);
    earInnerL.position.z = 0.02;
    leftEar.add(earInnerL);
    leftEar.rotation.set(-0.1, -0.15, 0.25);
    huskyHead.add(leftEar);

    const rightEar = new THREE.Group();
    rightEar.position.set(0.075, 0.11, 0);
    const earOuterR = new THREE.Mesh(earGeo, huskyFurBrown);
    rightEar.add(earOuterR);
    const earInnerR = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.1, 8), huskyInnerEarMat);
    earInnerR.position.z = 0.02;
    rightEar.add(earInnerR);
    rightEar.rotation.set(-0.1, 0.15, -0.25);
    huskyHead.add(rightEar);

    // Striking Expressive Ice-Blue Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), huskyEyeMat);
    eyeL.position.set(-0.05, 0.02, 0.12);
    huskyHead.add(eyeL);
    const pupilL = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), huskyPupilMat);
    pupilL.position.set(-0.05, 0.02, 0.14);
    huskyHead.add(pupilL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.028, 16, 16), huskyEyeMat);
    eyeR.position.set(0.05, 0.02, 0.12);
    huskyHead.add(eyeR);
    const pupilR = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 12), huskyPupilMat);
    pupilR.position.set(0.05, 0.02, 0.14);
    huskyHead.add(pupilR);

    // Aviator Goggles on Forehead
    const goggleGroup = new THREE.Group();
    goggleGroup.position.set(0, 0.09, 0.09);
    const goggleL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 16), huskyGoggleMat);
    goggleL.rotateX(Math.PI / 2);
    goggleL.position.x = -0.048;
    goggleGroup.add(goggleL);
    const goggleR = goggleL.clone();
    goggleR.position.x = 0.048;
    goggleGroup.add(goggleR);
    const goggleBridge = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 0.012), huskyGoggleFrameMat);
    goggleGroup.add(goggleBridge);
    const goggleStrap = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.012, 8, 24), huskyGoggleFrameMat);
    goggleStrap.position.set(0, -0.01, -0.05);
    goggleGroup.add(goggleStrap);
    huskyHead.add(goggleGroup);

    // Front Paws (Firmly gripping the rocket safety handle)
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.08, 0, 0.02);
    const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.16, 12), huskyFurCream);
    armLMesh.position.y = 0.05;
    leftArm.add(armLMesh);
    const pawL = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), huskyFurCream);
    pawL.position.set(0, 0.11, 0);
    leftArm.add(pawL);
    huskyBodyRig.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.08, 0, 0.02);
    const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.036, 0.16, 12), huskyFurCream);
    armRMesh.position.y = 0.05;
    rightArm.add(armRMesh);
    const pawR = new THREE.Mesh(new THREE.SphereGeometry(0.036, 12, 12), huskyFurCream);
    pawR.position.set(0, 0.11, 0);
    rightArm.add(pawR);
    huskyBodyRig.add(rightArm);

    // Hind Legs
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.2, 12), huskyFurCream);
    legL.position.set(-0.06, -0.36, -0.02);
    huskyBodyRig.add(legL);
    const legR = legL.clone();
    legR.position.x = 0.06;
    huskyBodyRig.add(legR);

    // Fluffy Sickle Tail
    const huskyTail = new THREE.Group();
    huskyTail.position.set(0, -0.32, -0.11);
    const tailCount = 4;
    for (let i = 0; i < tailCount; i++) {
      const tMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.055 - i * 0.007, 12, 12),
        i === tailCount - 1 ? huskyFurCream : huskyFurBrown
      );
      tMesh.position.set(0, (i + 1) * 0.055, -(i * 0.035));
      huskyTail.add(tMesh);
    }
    huskyBodyRig.add(huskyTail);

    // ==========================================
    // DATA CAPSULE & EFFECTS
    // ==========================================
    // 8. Data Capsule (Payload Pod carrying file)
    const capsuleGroup = new THREE.Group();
    const capBodyGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.22, 16);
    const capTopGeo = new THREE.SphereGeometry(0.1, 16, 16);
    const capBodyMesh = new THREE.Mesh(capBodyGeo, capsuleMat);
    const capTopMesh = new THREE.Mesh(capTopGeo, capsuleMat);
    capTopMesh.position.y = 0.11;
    const capBottomMesh = new THREE.Mesh(capTopGeo, capsuleMat);
    capBottomMesh.position.y = -0.11;

    capsuleGroup.add(capBodyMesh);
    capsuleGroup.add(capTopMesh);
    capsuleGroup.add(capBottomMesh);
    capsuleGroup.position.set(0.9, -0.1, 0.5);
    capsuleGroup.scale.set(0.7, 0.7, 0.7);
    scene.add(capsuleGroup);

    // 9. Engine Thrust Flame Plume
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.85
    });
    const flameInnerMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.95
    });

    const flameGeo = new THREE.ConeGeometry(0.18, 0.9, 16);
    flameGeo.rotateX(Math.PI);
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.y = -1.35;
    rocketGroup.add(flameMesh);

    const flameInnerGeo = new THREE.ConeGeometry(0.09, 0.55, 16);
    flameInnerGeo.rotateX(Math.PI);
    const flameInnerMesh = new THREE.Mesh(flameInnerGeo, flameInnerMat);
    flameInnerMesh.position.y = -1.18;
    rocketGroup.add(flameInnerMesh);

    // 10. Particle Stream (Exhaust trail)
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 0.25;
      particlePos[i * 3 + 1] = -1.0 - Math.random() * 2.0;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
      particleSpeeds[i] = 0.04 + Math.random() * 0.06;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.07,
      transparent: true,
      opacity: 0.75
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rocketGroup.add(particleSystem);

    // 11. Background Ambient Starfield
    const bgStarsCount = 90;
    const bgStarsGeo = new THREE.BufferGeometry();
    const bgStarsPos = new Float32Array(bgStarsCount * 3);
    for (let i = 0; i < bgStarsCount; i++) {
      bgStarsPos[i * 3] = (Math.random() - 0.5) * 16;
      bgStarsPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      bgStarsPos[i * 3 + 2] = -3 - Math.random() * 9;
    }
    bgStarsGeo.setAttribute('position', new THREE.BufferAttribute(bgStarsPos, 3));
    const bgStarsMat = new THREE.PointsMaterial({
      color: isDark ? 0x94a3b8 : 0x64748b,
      size: 0.045,
      transparent: true,
      opacity: isDark ? 0.65 : 0.3
    });
    const bgStars = new THREE.Points(bgStarsGeo, bgStarsMat);
    scene.add(bgStars);

    // 12. Spiral Galaxy Destination
    const galaxyArms = 3;
    const galaxyPointsCount = 200;
    const galaxyPositions = new Float32Array(galaxyPointsCount * 3);
    for (let i = 0; i < galaxyPointsCount; i++) {
      const arm = i % galaxyArms;
      const r = (i / galaxyPointsCount) * 2.2;
      const angle = (arm * (Math.PI * 2 / galaxyArms)) + r * 2.0;
      galaxyPositions[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.25;
      galaxyPositions[i * 3 + 1] = Math.sin(angle) * r * 0.45 + (Math.random() - 0.5) * 0.2;
      galaxyPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    const galaxyMat = new THREE.PointsMaterial({
      color: isDark ? 0x818cf8 : 0x6366f1,
      size: 0.05,
      transparent: true,
      opacity: 0.5
    });
    const galaxyMesh = new THREE.Points(galaxyGeo, galaxyMat);
    galaxyGroup.add(galaxyMesh);

    // ==========================================
    // LIGHTING SETUP
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 1.35);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.2 : 2.5);
    dirLight.position.set(4, 5, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xf43f5e, isDark ? 1.6 : 0.9);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    const engineLight = new THREE.PointLight(0xf97316, 2.8, 3.5);
    engineLight.position.set(0, -1.0, 0);
    rocketGroup.add(engineLight);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 340;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // CINEMATIC ANIMATION LOOP
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const elapsed = clock.getElapsedTime();
      const currentProgress = progressRef.current;
      const currentStage = stageRef.current;

      // Rotate destination galaxy slowly
      galaxyGroup.rotation.z = elapsed * 0.08;

      // 1. DATA CAPSULE ANIMATION
      if (currentStage === 'docking' || currentStage === 'preparing') {
        const t = Math.min(1, currentProgress / 18);
        capsuleGroup.position.x = THREE.MathUtils.lerp(0.9, 0, t);
        capsuleGroup.position.y = THREE.MathUtils.lerp(-0.1, 0.1, t);
        capsuleGroup.position.z = THREE.MathUtils.lerp(0.5, 0.1, t);
        capsuleGroup.scale.setScalar(THREE.MathUtils.lerp(0.7, 0.15, t));
        capsuleGroup.rotation.y = elapsed * 3;
      } else if (currentStage !== 'complete' && currentStage !== 'error') {
        capsuleGroup.position.copy(rocketGroup.position);
        capsuleGroup.position.x += 0.45;
        capsuleGroup.position.y -= 0.1;
        capsuleGroup.position.z += 0.25;
        capsuleGroup.rotation.z = Math.sin(elapsed * 12) * 0.1;
        capsuleGroup.rotation.y = elapsed * 2;
        capsuleGroup.scale.setScalar(0.15);
      } else if (currentStage === 'complete') {
        capsuleGroup.position.x = THREE.MathUtils.lerp(capsuleGroup.position.x, -0.65, 0.05);
        capsuleGroup.position.y = THREE.MathUtils.lerp(capsuleGroup.position.y, 0.45, 0.05);
        capsuleGroup.position.z = THREE.MathUtils.lerp(capsuleGroup.position.z, 0.55, 0.05);
        capsuleGroup.scale.setScalar(THREE.MathUtils.lerp(capsuleGroup.scale.x, 0.85, 0.05));
        capsuleGroup.rotation.y = elapsed * 3;
      } else {
        capsuleGroup.position.set(0, 0.1, 0.1);
        capsuleGroup.scale.setScalar(0.01);
      }

      // 2. FLAME & THRUST DYNAMICS
      if (currentStage === 'docking' || currentStage === 'preparing') {
        const idlePulse = 0.25 + Math.sin(elapsed * 10) * 0.08;
        flameMesh.scale.set(idlePulse, idlePulse * 0.4, idlePulse);
        flameInnerMesh.scale.set(idlePulse * 0.8, idlePulse * 0.5, idlePulse * 0.8);
        engineLight.intensity = 0.6;
      } else if (currentStage === 'startup') {
        const spinPulse = 0.55 + Math.sin(elapsed * 22) * 0.15;
        flameMesh.scale.set(spinPulse, spinPulse * 0.8, spinPulse);
        flameInnerMesh.scale.set(spinPulse * 0.9, spinPulse * 0.9, spinPulse * 0.9);
        engineLight.intensity = 1.6;
      } else if (currentStage === 'launch' || currentStage === 'space_travel') {
        const flamePulse = 0.9 + Math.sin(elapsed * 28) * 0.22;
        flameMesh.scale.set(flamePulse, flamePulse * 1.6, flamePulse);
        flameInnerMesh.scale.set(flamePulse * 0.9, flamePulse * 1.8, flamePulse * 0.9);
        engineLight.intensity = 3.2 + Math.sin(elapsed * 32) * 0.9;
      } else if (currentStage === 'galaxy_arrival') {
        const flarePulse = 1.1 + Math.sin(elapsed * 16) * 0.2;
        flameMesh.scale.set(flarePulse, flarePulse * 1.3, flarePulse);
        flameInnerMesh.scale.set(flarePulse * 0.9, flarePulse * 1.4, flarePulse * 0.9);
        engineLight.intensity = 2.4;
      } else if (currentStage === 'complete') {
        flameMesh.scale.set(0.3, 0.3, 0.3);
        flameInnerMesh.scale.set(0.2, 0.2, 0.2);
        engineLight.intensity = 0.8;
      } else if (currentStage === 'error') {
        flameMesh.scale.set(0.08, 0.08, 0.08);
        flameInnerMesh.scale.set(0.05, 0.05, 0.05);
        engineLight.intensity = 0.2;
      }

      // 3. EXHAUST PARTICLE TRAIL
      const positions = particleGeo.attributes.position.array as Float32Array;
      const thrustVelocity = currentStage === 'space_travel' || currentStage === 'launch' ? 2.4 : 1.0;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] -= particleSpeeds[i] * thrustVelocity;
        if (positions[i * 3 + 1] < -3.6) {
          positions[i * 3 + 1] = -0.9;
          positions[i * 3] = (Math.random() - 0.5) * 0.25;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // 4. STARFIELD STREAMING
      const starPos = bgStarsGeo.attributes.position.array as Float32Array;
      const starSpeed =
        currentStage === 'space_travel'
          ? 0.06
          : currentStage === 'launch'
          ? 0.035
          : currentStage === 'galaxy_arrival'
          ? 0.02
          : 0.008;

      for (let i = 0; i < bgStarsCount; i++) {
        starPos[i * 3 + 1] -= starSpeed;
        if (starPos[i * 3 + 1] < -6) {
          starPos[i * 3 + 1] = 6;
        }
      }
      bgStarsGeo.attributes.position.needsUpdate = true;

      // 5. ROCKET PITCH, BANKING & GALAXY FLY-BY
      if (currentStage === 'error') {
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, -0.05, 0.05);
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, -0.1, 0.05);
      } else if (currentStage === 'docking' || currentStage === 'preparing') {
        const hoverY = Math.sin(elapsed * 2.5) * 0.04;
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, hoverY - 0.1, 0.06);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, -0.04, 0.05);
        rocketGroup.rotation.y = THREE.MathUtils.lerp(rocketGroup.rotation.y, 0.15, 0.05);
      } else if (currentStage === 'startup') {
        const rumble = (Math.random() - 0.5) * 0.025;
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, -0.1 + rumble, 0.1);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, -0.08, 0.05);
      } else if (currentStage === 'launch') {
        const ascendY = Math.sin(elapsed * 3.5) * 0.04 + 0.15;
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, ascendY, 0.05);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, -0.22, 0.05);
        rocketGroup.rotation.y = Math.sin(elapsed * 1.5) * 0.12;
      } else if (currentStage === 'space_travel') {
        const spaceY = Math.sin(elapsed * 2.8) * 0.07 + 0.1;
        const bankAngle = -0.25 + Math.sin(elapsed * 1.8) * 0.1;
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, spaceY, 0.05);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, bankAngle, 0.05);
        rocketGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.2;
      } else if (currentStage === 'galaxy_arrival') {
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, 0.05, 0.04);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, -0.12, 0.04);
        rocketGroup.rotation.y = THREE.MathUtils.lerp(rocketGroup.rotation.y, 0.35, 0.04);
      } else if (currentStage === 'complete') {
        rocketGroup.position.y = THREE.MathUtils.lerp(rocketGroup.position.y, 0.15, 0.04);
        rocketGroup.rotation.z = THREE.MathUtils.lerp(rocketGroup.rotation.z, 0.02, 0.04);
        rocketGroup.rotation.y = THREE.MathUtils.lerp(rocketGroup.rotation.y, 0.05, 0.04);
      }

      // ==========================================
      // 6. SIBERIAN HUSKY COMPANION ANIMATION & PHYSICS
      // ==========================================
      // Universal life: tail wag & natural breathing
      const tailWagSpeed = currentStage === 'complete' ? 18 : currentStage === 'startup' ? 12 : 6;
      const tailWagAmp = currentStage === 'complete' ? 0.45 : 0.2;
      huskyTail.rotation.z = Math.sin(elapsed * tailWagSpeed) * tailWagAmp;

      huskyBodyRig.scale.x = 1 + Math.sin(elapsed * 2.5) * 0.015;
      huskyBodyRig.scale.z = 1 + Math.sin(elapsed * 2.5) * 0.015;

      if (currentStage === 'docking') {
        // Husky observes the file capsule entering with an intrigued head tilt
        huskyHead.rotation.y = THREE.MathUtils.lerp(huskyHead.rotation.y, 0.35, 0.08);
        huskyHead.rotation.z = THREE.MathUtils.lerp(huskyHead.rotation.z, 0.15, 0.08);
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, 0, 0.1);
        leftEar.rotation.z = 0.25;
        rightEar.rotation.z = -0.25;
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 0, 0.1);
      } else if (currentStage === 'preparing') {
        // Husky grips the handle firmly, alert and eager
        huskyHead.rotation.y = THREE.MathUtils.lerp(huskyHead.rotation.y, 0.05, 0.08);
        huskyHead.rotation.z = THREE.MathUtils.lerp(huskyHead.rotation.z, -0.05, 0.08);
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, 0.04, 0.1);
      } else if (currentStage === 'startup') {
        // Engine vibration: Husky body and ears flutter with the engine rumble
        const jitter = Math.sin(elapsed * 45) * 0.035;
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, jitter, 0.25);
        huskyHead.rotation.y = Math.sin(elapsed * 30) * 0.03;
        leftEar.rotation.z = 0.35 + Math.sin(elapsed * 40) * 0.07;
        rightEar.rotation.z = -0.35 + Math.sin(elapsed * 40) * 0.07;
      } else if (currentStage === 'launch') {
        // High G-Force Acceleration: Husky body swings back on the handle like a pendulum
        const swingAngle = -0.35 + Math.sin(elapsed * 8) * 0.06;
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, swingAngle, 0.12);
        huskyHead.rotation.y = THREE.MathUtils.lerp(huskyHead.rotation.y, -0.15, 0.1);
        // Ears pinned back against the rush of acceleration
        leftEar.rotation.x = THREE.MathUtils.lerp(leftEar.rotation.x, -0.35, 0.15);
        rightEar.rotation.x = THREE.MathUtils.lerp(rightEar.rotation.x, -0.35, 0.15);
      } else if (currentStage === 'space_travel') {
        // Zero-G Deep Space Travel: Husky floats weightlessly, looking around at the stars
        const floatSwing = Math.sin(elapsed * 1.8) * 0.12;
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, floatSwing, 0.05);
        huskyHead.rotation.y = Math.sin(elapsed * 1.4) * 0.35; // Curious glance around
        huskyHead.rotation.x = Math.sin(elapsed * 1.1) * 0.12;
        leftEar.rotation.x = THREE.MathUtils.lerp(leftEar.rotation.x, 0, 0.1);
        rightEar.rotation.x = THREE.MathUtils.lerp(rightEar.rotation.x, 0, 0.1);
      } else if (currentStage === 'galaxy_arrival') {
        // Approaching destination: Husky leans eagerly forward toward the glowing galaxy
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, 0.22, 0.08);
        huskyHead.rotation.y = THREE.MathUtils.lerp(huskyHead.rotation.y, 0.4, 0.1);
        huskyHead.rotation.z = THREE.MathUtils.lerp(huskyHead.rotation.z, -0.1, 0.1);
        leftEar.rotation.z = 0.32;
        rightEar.rotation.z = -0.32;
      } else if (currentStage === 'complete') {
        // Mission complete: Happy head bob, paw wave celebration, joyous wag
        huskyBodyRig.rotation.z = THREE.MathUtils.lerp(huskyBodyRig.rotation.z, 0.05, 0.1);
        huskyHead.position.y = 0.06 + Math.sin(elapsed * 9) * 0.02; // Triumphant bob
        huskyHead.rotation.y = Math.sin(elapsed * 5) * 0.15;
        // Right paw lets go to pump in the air in victory!
        rightArm.rotation.z = THREE.MathUtils.lerp(rightArm.rotation.z, 1.4 + Math.sin(elapsed * 8) * 0.2, 0.15);
        rightArm.rotation.x = -0.3;
      } else if (currentStage === 'error') {
        // Gentle sympathetic head tilt
        huskyHead.rotation.z = THREE.MathUtils.lerp(huskyHead.rotation.z, 0.25, 0.08);
        huskyHead.rotation.y = THREE.MathUtils.lerp(huskyHead.rotation.y, -0.15, 0.08);
        leftEar.rotation.z = 0.1;
        rightEar.rotation.z = -0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      try {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      } catch {}
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[220px] flex items-center justify-center ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
