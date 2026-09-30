import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowRight, Sparkles, Layers, ShieldCheck, Zap } from 'lucide-react';

interface ThreeDHeroPortalProps {
  onStartConverting: () => void;
  onExploreTools: () => void;
  onSelectFormat?: (format: string) => void;
}

export const ThreeDHeroPortal: React.FC<ThreeDHeroPortalProps> = ({
  onStartConverting,
  onExploreTools,
  onSelectFormat
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFormat, setActiveFormat] = useState<string>('PDF');
  const [isHoveringPortal, setIsHoveringPortal] = useState<boolean>(false);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  const formats = ['PDF', 'DOCX', 'JPG', 'PNG', 'XLSX', 'PPTX'];

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 7;

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Three-point lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x06b6d4, 2.5); // Electric cyan key light
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8b5cf6, 2.0); // Violet fill light
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xe11d48, 1.8); // Ruby rim light
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Group for the interactive portal
    const portalGroup = new THREE.Group();
    scene.add(portalGroup);

    // Outer Torus Ring 1 (Cyan)
    const ring1Geo = new THREE.TorusGeometry(2.3, 0.03, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    portalGroup.add(ring1);

    // Inner Torus Ring 2 (Violet)
    const ring2Geo = new THREE.TorusGeometry(1.8, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x8b5cf6,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.8
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 4;
    portalGroup.add(ring2);

    // Innermost Transformation Core (Octahedron/Crystalline)
    const coreGeo = new THREE.OctahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.6,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      ior: 1.5,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.4
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    portalGroup.add(core);

    // Orbiting Floating Document Cards (representing file formats)
    const cardGroup = new THREE.Group();
    portalGroup.add(cardGroup);

    const cardGeo = new THREE.BoxGeometry(0.55, 0.75, 0.04);
    const cardColors = [0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xf59e0b, 0x06b6d4];
    const cards: THREE.Mesh[] = [];

    const numCards = 6;
    for (let i = 0; i < numCards; i++) {
      const angle = (i / numCards) * Math.PI * 2;
      const radius = 2.4;
      const mat = new THREE.MeshStandardMaterial({
        color: cardColors[i % cardColors.length],
        roughness: 0.25,
        metalness: 0.4,
        emissive: cardColors[i % cardColors.length],
        emissiveIntensity: 0.25
      });
      const card = new THREE.Mesh(cardGeo, mat);
      card.position.x = Math.cos(angle) * radius;
      card.position.y = Math.sin(angle) * radius * 0.5;
      card.position.z = Math.sin(angle) * 0.8;
      card.rotation.y = angle + Math.PI / 2;
      cardGroup.add(card);
      cards.push(card);
    }

    // Floating Stardust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 6;
      particleScales[i / 3] = Math.random() * 0.05 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Parallax Targets
    let targetRotX = 0;
    let targetRotY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.65;
      targetRotX = y * 0.45;
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!canvas || !renderer) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop with Smooth Damping (Lerping)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth interpolation for parallax
      portalGroup.rotation.y += (targetRotY - portalGroup.rotation.y) * 0.05;
      portalGroup.rotation.x += (-targetRotX - portalGroup.rotation.x) * 0.05;

      // Continuous subtle rotation of rings & core
      ring1.rotation.z = elapsed * 0.25;
      ring2.rotation.x = Math.PI / 4 + elapsed * 0.35;
      ring2.rotation.y = elapsed * 0.2;

      core.rotation.x = elapsed * 0.5;
      core.rotation.y = elapsed * 0.7;

      // Orbit cards around portal
      cardGroup.rotation.z = elapsed * 0.2;

      // Gentle floating bob
      portalGroup.position.y = Math.sin(elapsed * 1.5) * 0.12;

      // Subtle particle drift
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = elapsed * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      cardGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 text-white shadow-2xl transition-colors duration-200"
    >
      {/* 3D Perspective Grid Background */}
      <div className="absolute inset-0 bg-perspective-grid opacity-30 pointer-events-none" />

      {/* Atmospheric Radial Glow Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Hero Typography & High-Impact CTAs */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          {/* Spatial Trust Signal */}
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-3 py-1.5 rounded-lg shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>ConvertAnyFile 3D Universe Engine</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">Zero Server Retention</span>
          </div>

          {/* Unmistakable Headline with Balance */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display max-w-2xl text-balance">
            Every File Has <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-rose-400 bg-clip-text text-transparent">Another Form.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 dark:text-slate-300 max-w-xl font-normal leading-relaxed text-balance">
            Convert, transform, compress and enhance your documents, images, and data in seconds. Powered by client-side WebAssembly, spatial 3D rendering, and zero-leakage cryptographic privacy.
          </p>

          {/* Interactive Format Quick Switchers */}
          <div className="pt-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2.5">
              Select target format to transform:
            </span>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              {formats.map(fmt => (
                <button
                  key={fmt}
                  onClick={() => {
                    setActiveFormat(fmt);
                    onSelectFormat?.(fmt);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 transform hover:-translate-y-0.5 ${
                    activeFormat === fmt
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25 scale-105'
                      : 'bg-slate-900/60 text-slate-300 border-slate-700/60 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Primary & Secondary Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={onStartConverting}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 rounded-xl hover:from-cyan-300 hover:to-sky-200 transition-all duration-200 shadow-lg shadow-cyan-500/20 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-2 group"
            >
              <span>Start Converting</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onExploreTools}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Explore 50+ Tools</span>
            </button>
          </div>

          {/* Social Proof & Security Evidence Strip */}
          <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256-GCM Encrypted</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant In-Browser Processing</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>100% Client-Side Privacy</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D WebGL Conversion Portal */}
        <div
          className="flex-1 w-full max-w-lg lg:max-w-none flex items-center justify-center relative min-h-[380px] sm:min-h-[460px]"
          onMouseEnter={() => setIsHoveringPortal(true)}
          onMouseLeave={() => setIsHoveringPortal(false)}
        >
          {webGlSupported ? (
            <canvas
              ref={canvasRef}
              className="w-full h-[380px] sm:h-[460px] cursor-grab active:cursor-grabbing rounded-2xl"
              style={{ touchAction: 'none' }}
              title="Interactive 3D Transformation Portal. Move cursor to rotate in 3D space."
            />
          ) : (
            /* Fallback 2.5D CSS Holographic Portal */
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin [animation-duration:15s]" />
              <div className="absolute inset-4 rounded-full border border-violet-500/50 animate-spin [animation-duration:25s] [animation-direction:reverse]" />
              <div className="w-40 h-48 rounded-xl bg-slate-900/80 border border-slate-700 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center p-4 space-y-2 transform rotate-3 hover:rotate-0 transition-transform">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                  {activeFormat}
                </div>
                <span className="text-xs font-semibold text-slate-300">Document.{activeFormat.toLowerCase()}</span>
                <span className="text-[10px] text-slate-500 font-mono">Ready to Transform</span>
              </div>
            </div>
          )}

          {/* Floating Spatial Badge */}
          <div className="absolute bottom-2 right-4 glass-surface px-3 py-1.5 rounded-lg text-[11px] text-slate-400 flex items-center space-x-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Interactive 3D Portal {isHoveringPortal ? '· Active Focus' : '· Move Mouse'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
