import React, { useEffect, useRef, useId, useState } from 'react';
import * as THREE from 'three';

export type SpaceAnimationStage =
  | 'idle'
  | 'dragging'
  | 'docking'
  | 'launching'
  | 'passing_gate'
  | 'galaxy_flight'
  | 'success'
  | 'error';

interface SpaceUploadAnimationProps {
  stage: SpaceAnimationStage;
  fileExtension?: string;
  fileName?: string;
  fileSizeFormatted?: string;
  onAnimationComplete?: () => void;
  onSkip?: () => void;
  showOverlayControls?: boolean;
}

export const SpaceUploadAnimation: React.FC<SpaceUploadAnimationProps> = ({
  stage,
  fileExtension = 'FILE',
  fileName,
  fileSizeFormatted,
  onAnimationComplete,
  onSkip,
  showOverlayControls = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // Keep latest stage in ref for access in requestAnimationFrame loop
  const stageRef = useRef<SpaceAnimationStage>(stage);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const extBadge = (fileExtension || 'FILE').toUpperCase().slice(0, 5);

  // Status text for clean, non-intrusive telemetry readout
  const stageInfo = (() => {
    switch (stage) {
      case 'dragging':
        return { code: 'TRAJECTORY-ARMED', label: 'Orbital gateway aligned · Release payload', pct: 20 };
      case 'docking':
        return { code: 'PAYLOAD-DOCK', label: `Securing ${extBadge} 3D data capsule...`, pct: 35 };
      case 'launching':
        return { code: 'IGNITION-ASCENT', label: 'Orbital thrusters at full power · Launching...', pct: 60 };
      case 'passing_gate':
        return { code: 'GATEWAY-TRANSIT', label: 'Transiting orbital relay gate...', pct: 80 };
      case 'galaxy_flight':
        return { code: 'HYPERLANE-VECTOR', label: 'Entering deep cosmic cloud galaxy...', pct: 95 };
      case 'success':
        return { code: 'ARRIVAL-CONFIRMED', label: 'Payload delivered to cloud · Ready to convert', pct: 100 };
      case 'error':
        return { code: 'ABORT-RESET', label: 'Launch aborted · Spacecraft docked', pct: 0 };
      case 'idle':
      default:
        return { code: 'LAUNCHPAD-STANDBY', label: 'Space launch portal active · Ready for files', pct: 0 };
    }
  })();

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !canvasRef.current || !containerRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const container = containerRef.current;
    let animId: number;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.25;
    } catch {
      setWebGlSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const updateSize = () => {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    updateSize();

    // 1. LIGHTING (Three-point studio lighting with metallic specular highlights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x38bdf8, 2.8);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.6);
    rimLight.position.set(-6, -3, -2);
    scene.add(rimLight);

    const engineLight = new THREE.PointLight(0x06b6d4, 2, 7);
    scene.add(engineLight);

    // 2. 3D ROCKET SPACECRAFT ASSEMBLY
    const rocketGroup = new THREE.Group();
    scene.add(rocketGroup);

    // Materials
    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep slate titanium
      metalness: 0.88,
      roughness: 0.22
    });

    const trimMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Electric cyan aerospace accents
      metalness: 0.92,
      roughness: 0.15
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan tinted reflective cockpit visor
      metalness: 0.95,
      roughness: 0.08,
      transparent: true,
      opacity: 0.85,
      emissive: 0x083344,
      emissiveIntensity: 0.4
    });

    const nozzleMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.95,
      roughness: 0.3
    });

    // Hull (Cylindrical fuselage with smooth chamfers)
    const hullGeometry = new THREE.CylinderGeometry(0.38, 0.44, 1.45, 32);
    const hullMesh = new THREE.Mesh(hullGeometry, hullMaterial);
    rocketGroup.add(hullMesh);

    // Nose Cone (Metallic aerodynamic tip)
    const noseGeometry = new THREE.ConeGeometry(0.38, 0.92, 32);
    const noseMesh = new THREE.Mesh(noseGeometry, trimMaterial);
    noseMesh.position.y = 1.185;
    rocketGroup.add(noseMesh);

    // Cockpit Window (Dimensional visor with glass-like specular curve)
    const visorGeometry = new THREE.SphereGeometry(0.24, 24, 24);
    const visorMesh = new THREE.Mesh(visorGeometry, glassMaterial);
    visorMesh.scale.set(0.85, 1.55, 0.9);
    visorMesh.position.set(0, 0.48, 0.3);
    rocketGroup.add(visorMesh);

    // Delta Stabilizer Fins (3 dimensional swept-back wings)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, 0);
    finShape.lineTo(0.55, -0.45);
    finShape.lineTo(0.35, -0.65);
    finShape.lineTo(0, -0.45);
    finShape.closePath();

    const finExtrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const finGeometry = new THREE.ExtrudeGeometry(finShape, finExtrudeSettings);

    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((angle) => {
      const finMesh = new THREE.Mesh(finGeometry, trimMaterial);
      finMesh.rotation.y = angle;
      finMesh.position.set(0, -0.25, 0);
      rocketGroup.add(finMesh);
    });

    // Engine Nozzle (Flared titanium thruster bell)
    const nozzleGeometry = new THREE.CylinderGeometry(0.25, 0.38, 0.32, 32, 1, true);
    const nozzleMesh = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzleMesh.position.y = -0.88;
    rocketGroup.add(nozzleMesh);

    // Volumetric Engine Flame (Multi-layered 3D cones)
    const flameGroup = new THREE.Group();
    flameGroup.position.y = -1.04;
    rocketGroup.add(flameGroup);

    // Inner White-Hot Core
    const flameCoreGeo = new THREE.ConeGeometry(0.12, 0.65, 16);
    const flameCoreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const flameCore = new THREE.Mesh(flameCoreGeo, flameCoreMat);
    flameCore.rotation.x = Math.PI;
    flameCore.position.y = -0.325;
    flameGroup.add(flameCore);

    // Mid Electric-Cyan Plasma Plume
    const flameMidGeo = new THREE.ConeGeometry(0.26, 1.35, 16);
    const flameMidMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.82
    });
    const flameMid = new THREE.Mesh(flameMidGeo, flameMidMat);
    flameMid.rotation.x = Math.PI;
    flameMid.position.y = -0.675;
    flameGroup.add(flameMid);

    // Outer Translucent Shroud
    const flameOuterGeo = new THREE.ConeGeometry(0.42, 1.9, 16);
    const flameOuterMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.35
    });
    const flameOuter = new THREE.Mesh(flameOuterGeo, flameOuterMat);
    flameOuter.rotation.x = Math.PI;
    flameOuter.position.y = -0.95;
    flameGroup.add(flameOuter);

    // 3. ENGINE EXHAUST PARTICLES (Streaming dimensional sparks)
    const sparkCount = 45;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities: { x: number; y: number; z: number; life: number }[] = [];

    for (let i = 0; i < sparkCount; i++) {
      sparkPositions[i * 3] = 0;
      sparkPositions[i * 3 + 1] = 0;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: -0.2 - Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.15,
        life: Math.random()
      });
    }

    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.85
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    flameGroup.add(sparkPoints);

    // 4. 3D FLOATING DATA CAPSULE POD
    const capsuleGroup = new THREE.Group();
    scene.add(capsuleGroup);

    const capsuleGeo = new THREE.CapsuleGeometry(0.18, 0.42, 16, 24);
    const capsuleMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant cyan-sapphire
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x0369a1,
      emissiveIntensity: 0.45
    });
    const capsuleMesh = new THREE.Mesh(capsuleGeo, capsuleMat);
    capsuleGroup.add(capsuleMesh);

    // Capsule Glowing Data Core Ring
    const capsuleRingGeo = new THREE.TorusGeometry(0.21, 0.025, 12, 32);
    const capsuleRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const capsuleRing = new THREE.Mesh(capsuleRingGeo, capsuleRingMat);
    capsuleRing.rotation.x = Math.PI / 2;
    capsuleGroup.add(capsuleRing);

    // 5. 3D ORBITAL SPACE GATEWAY
    const gateGroup = new THREE.Group();
    gateGroup.position.set(2.4, 1.2, -2.2);
    gateGroup.rotation.set(0.28, -0.48, 0.15);
    scene.add(gateGroup);

    // Outer Segmented Metallic Torus Ring
    const gateTorusGeo = new THREE.TorusGeometry(1.5, 0.09, 16, 64);
    const gateTorusMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.25
    });
    const gateTorus = new THREE.Mesh(gateTorusGeo, gateTorusMat);
    gateGroup.add(gateTorus);

    // Inner Glowing Energy Aperture Ring
    const gateApertureGeo = new THREE.RingGeometry(0.2, 1.38, 48);
    const gateApertureMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const gateAperture = new THREE.Mesh(gateApertureGeo, gateApertureMat);
    gateGroup.add(gateAperture);

    // 4 Orbital Strut Nodes
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const nodeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const nodeMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.2 });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(Math.cos(angle) * 1.5, Math.sin(angle) * 1.5, 0);
      gateGroup.add(nodeMesh);
    }

    // 6. 3D PARTICLE STARFIELD (Layered Foreground & Deep Space Depth)
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 35;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      starPositions[i * 3 + 2] = -45 + Math.random() * 55;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 0.065,
      transparent: true,
      opacity: 0.85
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 7. DISTANT ROTATING GALAXY CORE (in deep background z: -16)
    const galaxyGroup = new THREE.Group();
    galaxyGroup.position.set(3.8, 2.1, -16);
    scene.add(galaxyGroup);

    const galaxyRingGeo = new THREE.RingGeometry(0.4, 3.8, 48);
    const galaxyRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const galaxyRing = new THREE.Mesh(galaxyRingGeo, galaxyRingMat);
    galaxyGroup.add(galaxyRing);

    const galaxyCoreGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const galaxyCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff
    });
    const galaxyCore = new THREE.Mesh(galaxyCoreGeo, galaxyCoreMat);
    galaxyGroup.add(galaxyCore);

    // 8. DISTANT PLANET (Earth-like limb in bottom-left corner)
    const planetGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.65,
      metalness: 0.15
    });
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.position.set(-5.5, -3.8, -9);
    scene.add(planetMesh);

    // State Interpolation Coordinates
    // Idle Launch Pad Position:
    const padPos = new THREE.Vector3(-2.2, -1.3, 0);
    const gatePos = new THREE.Vector3(2.4, 1.2, -2.2);
    const galaxyPos = new THREE.Vector3(3.8, 2.1, -16);

    let flightT = 0; // 0 to 1 during flight
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();
      const curStage = stageRef.current;

      // 1. Starfield gentle drift
      starPoints.rotation.y = elapsed * 0.015;
      starPoints.rotation.x = elapsed * 0.008;

      // 2. Gateway continuous smooth rotation & flare
      gateGroup.rotation.z = elapsed * 0.25;
      const isAtGate = curStage === 'passing_gate';
      gateApertureMat.opacity = isAtGate ? 0.85 : 0.35 + Math.sin(elapsed * 2) * 0.12;
      gateGroup.scale.setScalar(isAtGate ? 1.18 : 1);

      // 3. Galaxy rotation
      galaxyGroup.rotation.z = elapsed * 0.15;
      const isAtGalaxy = curStage === 'galaxy_flight' || curStage === 'success';
      galaxyRingMat.opacity = isAtGalaxy ? 0.8 : 0.45;

      // 4. Update Engine Plume & Sparks
      const isEngineFull = ['launching', 'passing_gate', 'galaxy_flight'].includes(curStage);
      const isEngineCharging = curStage === 'dragging' || curStage === 'docking';
      const isSuccess = curStage === 'success';

      const flameScaleY = isEngineFull
        ? 1.4 + Math.sin(elapsed * 35) * 0.2
        : isEngineCharging
        ? 0.75 + Math.sin(elapsed * 15) * 0.1
        : 0.4 + Math.sin(elapsed * 6) * 0.06;

      flameGroup.scale.set(
        isSuccess ? 0 : 1,
        isSuccess ? 0 : flameScaleY,
        isSuccess ? 0 : 1
      );
      engineLight.intensity = isEngineFull ? 4.5 : isEngineCharging ? 2.2 : 0.8;

      // Animate trailing spark particles
      const positions = sparkGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < sparkCount; i++) {
        const vel = sparkVelocities[i];
        vel.life -= delta * (isEngineFull ? 2.5 : 1.2);

        if (vel.life <= 0) {
          positions[i * 3] = 0;
          positions[i * 3 + 1] = 0;
          positions[i * 3 + 2] = 0;
          vel.life = 1;
        } else {
          positions[i * 3] += vel.x;
          positions[i * 3 + 1] += vel.y * (isEngineFull ? 2.2 : 1);
          positions[i * 3 + 2] += vel.z;
        }
      }
      sparkGeo.attributes.position.needsUpdate = true;

      // 5. 3D Spacecraft Physical Motion
      if (curStage === 'idle') {
        flightT = 0;
        // Rest on launch pad with subtle 3D breathing bob
        rocketGroup.position.set(
          padPos.x,
          padPos.y + Math.sin(elapsed * 2) * 0.04,
          padPos.z
        );
        // Angled 3D isometric view (not flat)
        rocketGroup.rotation.set(0.38, 0.45, -0.65);
        rocketGroup.scale.setScalar(1);
        rocketGroup.visible = true;

        // Capsule hidden or docked
        capsuleGroup.visible = false;
      } else if (curStage === 'dragging') {
        rocketGroup.position.set(
          padPos.x,
          padPos.y + Math.sin(elapsed * 4) * 0.06,
          padPos.z
        );
        rocketGroup.rotation.set(0.35, 0.52, -0.62);
        capsuleGroup.visible = false;
      } else if (curStage === 'docking') {
        // 3D Capsule flies from foreground into the rocket's cargo bay
        capsuleGroup.visible = true;
        const dockProgress = Math.min(1, Math.max(0, Math.sin(elapsed * 3)));
        capsuleGroup.position.set(
          THREE.MathUtils.lerp(0.2, padPos.x + 0.15, dockProgress),
          THREE.MathUtils.lerp(-0.4, padPos.y + 0.1, dockProgress),
          THREE.MathUtils.lerp(2.8, padPos.z + 0.25, dockProgress)
        );
        capsuleGroup.rotation.y = elapsed * 4;
        capsuleGroup.rotation.x = elapsed * 2;
        capsuleGroup.scale.setScalar(THREE.MathUtils.lerp(1.2, 0.7, dockProgress));

        rocketGroup.position.set(padPos.x, padPos.y, padPos.z);
        rocketGroup.rotation.set(0.38, 0.45, -0.65);
      } else if (curStage === 'launching') {
        capsuleGroup.visible = false; // Safely locked in fuselage
        flightT = Math.min(0.45, flightT + delta * 0.45);

        // Parabolic trajectory between Pad -> Gate
        const p = new THREE.Vector3().lerpVectors(padPos, gatePos, flightT / 0.45);
        p.y += Math.sin((flightT / 0.45) * Math.PI) * 0.6; // Parabolic arc height
        rocketGroup.position.copy(p);

        // 3D banking attitude into the flight path
        rocketGroup.rotation.set(0.42, 0.32, -0.75 + flightT * 0.2);
        rocketGroup.scale.setScalar(1 - flightT * 0.3);
      } else if (curStage === 'passing_gate') {
        flightT = Math.min(0.72, flightT + delta * 0.4);
        const subT = (flightT - 0.45) / 0.27;

        // Passing right through the center of the 3D space gate
        const p = new THREE.Vector3().lerpVectors(gatePos, galaxyPos, subT * 0.25);
        rocketGroup.position.copy(p);
        rocketGroup.rotation.set(0.28, -0.45, -0.55);
        rocketGroup.scale.setScalar(0.7 - subT * 0.2);
      } else if (curStage === 'galaxy_flight') {
        flightT = Math.min(1.0, flightT + delta * 0.38);
        const subT = (flightT - 0.72) / 0.28;

        // Shrinking in 3D perspective as it travels away into deep space (z: -16)
        const p = new THREE.Vector3().lerpVectors(gatePos, galaxyPos, 0.25 + subT * 0.75);
        rocketGroup.position.copy(p);
        rocketGroup.rotation.set(0.2, -0.35, -0.45);
        rocketGroup.scale.setScalar(Math.max(0.12, 0.5 - subT * 0.38));
      } else if (curStage === 'success') {
        rocketGroup.visible = false;
        capsuleGroup.visible = false;
      }

      // Attach engine point light right behind the rocket nozzle
      engineLight.position.set(
        rocketGroup.position.x,
        rocketGroup.position.y - 0.5,
        rocketGroup.position.z
      );

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      // Dispose geometries & materials
      hullGeometry.dispose();
      noseGeometry.dispose();
      visorGeometry.dispose();
      finGeometry.dispose();
      nozzleGeometry.dispose();
      flameCoreGeo.dispose();
      flameMidGeo.dispose();
      flameOuterGeo.dispose();
      sparkGeo.dispose();
      capsuleGeo.dispose();
      gateTorusGeo.dispose();
      gateApertureGeo.dispose();
      starGeo.dispose();
      galaxyRingGeo.dispose();
      galaxyCoreGeo.dispose();
      planetGeo.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden rounded-2xl"
      aria-hidden="true"
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block object-cover"
      />

      {/* Subtle Deep Space Gradient Underlay */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />

      {/* Telemetry Micro-Bar (Simple, clean, using exact existing font) */}
      <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-10 px-3 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/5 font-sans">
        <div className="flex items-center space-x-2 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 font-bold tracking-wider">{stageInfo.code}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300 truncate">{stageInfo.label}</span>
        </div>

        {stage !== 'idle' && (
          <div className="flex items-center space-x-2.5 flex-shrink-0 ml-2">
            <span className="text-cyan-400 font-semibold">{stageInfo.pct}%</span>
            {showOverlayControls && onSkip && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkip();
                }}
                className="pointer-events-auto px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-colors cursor-pointer"
              >
                Skip ➔
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
