/**
 * moinmoin — Landing Page
 * Three.js hero (floating 3D letter tiles) + GSAP ScrollTrigger animations
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Hammer,
  Brain,
  BookOpen,
  GraduationCap,
  ClipboardList,
  Flame,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Star,
  RotateCcw,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── German letter tiles data ──────────────────────────────────────────────
const GERMAN_WORDS = [
  "Hallo", "Danke", "Bitte", "Ja", "Nein",
  "Guten", "Tag", "Welt", "Lernen", "Deutsch",
  "der", "die", "das", "ein", "und",
  "ich", "du", "wir", "sie", "er",
  "A1", "A2", "B1", "XP", "🔥",
];

// ─── Features data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    Icon: Brain,
    title: "Spaced Repetition",
    desc: "FSRS algorithm surfaces cards at the exact moment before you forget. Science-backed, not guesswork.",
    color: "#818cf8",
  },
  {
    Icon: BookOpen,
    title: "Grammar Mastery",
    desc: "60+ chapters from A1 to B1 — theory, tables, examples, and exercises. Not just vocabulary.",
    color: "#34d399",
  },
  {
    Icon: GraduationCap,
    title: "Structured Path",
    desc: "Zigzag lesson path that unlocks levels as you go. Build knowledge in the right order.",
    color: "#60a5fa",
  },
  {
    Icon: ClipboardList,
    title: "Goethe Exam Prep",
    desc: "Full mock exams: Hören, Lesen, Schreiben, Sprechen. Know exactly where you stand.",
    color: "#f472b6",
  },
  {
    Icon: Flame,
    title: "Streaks & XP",
    desc: "Daily goals, level progression, and badges. The motivation loop that actually works.",
    color: "#fb923c",
  },
  {
    Icon: Smartphone,
    title: "Web & Mobile",
    desc: "PWA on any browser, native app on iOS and Android. Your progress syncs everywhere.",
    color: "#a78bfa",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add Words",
    desc: "Paste any German word or phrase. AI enriches it with gender, articles, conjugations, and example sentences.",
  },
  {
    num: "02",
    title: "Study Daily",
    desc: "Flash cards appear at the perfect moment — just before you'd forget. 5 minutes a day compounds fast.",
  },
  {
    num: "03",
    title: "Track Everything",
    desc: "XP, streaks, grammar chapters completed, exam scores. See your German actually improving.",
  },
];

// ─── Three.js Hero Canvas ─────────────────────────────────────────────────
function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x0f172a, 1);
    el.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0x818cf8, 2.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x34d399, 1.2);
    rimLight.position.set(-8, -4, -3);
    scene.add(rimLight);

    // Helper: make canvas texture with a word
    function makeLetterTexture(word: string): THREE.CanvasTexture {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#1e1b4b");
      grad.addColorStop(1, "#312e81");
      ctx.fillStyle = grad;
      ctx.roundRect(8, 8, size - 16, size - 16, 24);
      ctx.fill();

      // Border
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 3;
      ctx.roundRect(8, 8, size - 16, size - 16, 24);
      ctx.stroke();

      // Text
      const fontSize = word.length <= 3 ? 80 : word.length <= 6 ? 52 : 38;
      ctx.font = `bold ${fontSize}px system-ui, sans-serif`;
      ctx.fillStyle = "#e0e7ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(word, size / 2, size / 2);

      return new THREE.CanvasTexture(canvas);
    }

    // Create tiles
    const tiles: Array<{
      mesh: THREE.Mesh;
      speed: number;
      offset: number;
      radius: number;
      phi: number;
      thetaSpeed: number;
    }> = [];

    GERMAN_WORDS.forEach((word, i) => {
      const geo = new THREE.BoxGeometry(1.8, 1.8, 0.12);
      const tex = makeLetterTexture(word);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4,
        metalness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute in a sphere shell
      const phi = Math.acos(-1 + (2 * i) / GERMAN_WORDS.length);
      const theta = Math.sqrt(GERMAN_WORDS.length * Math.PI) * phi;
      const radius = 5 + Math.random() * 2.5;

      mesh.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.7,
        radius * Math.cos(phi) - 2
      );
      mesh.rotation.set(
        Math.random() * 0.4,
        Math.random() * Math.PI * 2,
        Math.random() * 0.4
      );
      mesh.scale.setScalar(0);
      scene.add(mesh);

      tiles.push({
        mesh,
        speed: 0.15 + Math.random() * 0.25,
        offset: Math.random() * Math.PI * 2,
        radius,
        phi,
        thetaSpeed: (Math.random() - 0.5) * 0.008,
      });

      // Entrance animation
      gsap.to(mesh.scale, {
        x: 1, y: 1, z: 1,
        duration: 0.8,
        delay: 0.05 * i,
        ease: "back.out(1.7)",
      });
    });

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    let rafId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Lerp camera to mouse
      targetX += (mouseX * 1.5 - targetX) * 0.04;
      targetY += (mouseY * 0.8 - targetY) * 0.04;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Float tiles
      tiles.forEach((tile, i) => {
        const floatY = Math.sin(t * tile.speed + tile.offset) * 0.18;
        tile.mesh.position.y += floatY * 0.015;
        tile.mesh.rotation.y += tile.thetaSpeed;
        tile.mesh.rotation.x += tile.thetaSpeed * 0.3;
        // Slow global orbit
        const baseAngle = t * 0.04 + (i / tiles.length) * Math.PI * 2;
        tile.mesh.position.x += Math.cos(baseAngle) * 0.002;
        tile.mesh.position.z += Math.sin(baseAngle) * 0.001;
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}

// ─── Main Landing Page ────────────────────────────────────────────────────
export default function LandingPage() {
  const [, navigate] = useLocation();

  // Refs for GSAP targets
  const heroContentRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero: staggered fade+rise on load ──
      gsap.fromTo(
        ".hero-item",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out", delay: 0.3 }
      );

      // ── Stats: count up ──
      ScrollTrigger.create({
        trigger: statsRef.current,
        start: "top 85%",
        onEnter: () => {
          document.querySelectorAll(".stat-num").forEach((el) => {
            const target = parseInt(el.getAttribute("data-target") || "0", 10);
            gsap.fromTo(
              el,
              { innerText: 0 },
              {
                innerText: target,
                duration: 1.8,
                ease: "power2.out",
                snap: { innerText: 1 },
                onUpdate() {
                  el.textContent = Math.round(parseFloat(el.textContent || "0")).toString() + (el.getAttribute("data-suffix") || "");
                },
              }
            );
          });
          gsap.fromTo(
            ".stat-card",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power2.out" }
          );
        },
        once: true,
      });

      // ── Features: stagger reveal ──
      gsap.fromTo(
        ".feature-card",
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.65, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 80%" },
        }
      );

      // ── How it works: line draw + steps pop ──
      gsap.fromTo(
        ".steps-line",
        { scaleX: 0 },
        {
          scaleX: 1, duration: 1.2, ease: "power2.inOut",
          scrollTrigger: { trigger: stepsRef.current, start: "top 75%" },
        }
      );
      gsap.fromTo(
        ".step-item",
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.2, ease: "back.out(1.4)",
          scrollTrigger: { trigger: stepsRef.current, start: "top 75%" },
        }
      );

      // ── App Preview ──
      gsap.fromTo(
        ".preview-copy",
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: previewRef.current, start: "top 80%" },
        }
      );
      gsap.fromTo(
        ".preview-mock",
        { opacity: 0, x: 40, rotateY: -12 },
        {
          opacity: 1, x: 0, rotateY: 0, duration: 0.9, ease: "power2.out",
          scrollTrigger: { trigger: previewRef.current, start: "top 80%" },
        }
      );

      // ── Quote ──
      gsap.fromTo(
        ".quote-block",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: quoteRef.current, start: "top 82%" },
        }
      );

      // ── Final CTA ──
      gsap.fromTo(
        ".cta-block",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: ctaRef.current, start: "top 85%" },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "linear-gradient(to bottom, rgba(15,23,42,0.95), transparent)" }}>
        <div className="flex items-center gap-2">
          <Hammer size={22} className="text-indigo-400" strokeWidth={2.5} />
          <span className="text-lg font-black tracking-tight text-white">moinmoin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Section 1: Hero ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950 pointer-events-none" />

        <div ref={heroContentRef} className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <div className="hero-item inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
            <Hammer size={14} className="text-indigo-400" strokeWidth={2.5} />
            <span className="text-indigo-300 text-sm font-semibold tracking-wide">moinmoin</span>
          </div>

          <h1 className="hero-item text-5xl md:text-7xl font-black leading-tight tracking-tight mb-5">
            Learn German.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
              Actually remember it.
            </span>
          </h1>

          <p className="hero-item text-lg md:text-xl text-slate-300 max-w-xl mx-auto mb-8 leading-relaxed">
            Spaced repetition · 60+ grammar chapters · Structured lesson paths · Goethe exam prep. Everything you need from A1 to B1.
          </p>

          <div className="hero-item flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/signup")}
              className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base px-7 py-3.5 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-600/30"
            >
              Get Started Free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-slate-300 hover:text-white font-medium text-base px-7 py-3.5 rounded-xl transition-all hover:bg-white/5"
            >
              Sign In
            </button>
          </div>

          <p className="hero-item text-slate-500 text-sm mt-5">Free to use · No credit card needed</p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <div className="w-5 h-8 border border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Section 2: Stats bar ── */}
      <section ref={statsRef} className="py-16 border-y border-white/5"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 md:gap-12">
          {[
            { value: 500, suffix: "+", label: "Words covered" },
            { value: 3, suffix: "", label: "CEFR levels" },
            { value: 60, suffix: "+", label: "Grammar chapters" },
          ].map(({ value, suffix, label }) => (
            <div key={label} className="stat-card text-center opacity-0">
              <div className="text-3xl md:text-5xl font-black text-white mb-1">
                <span className="stat-num" data-target={value} data-suffix={suffix}>
                  {value}{suffix}
                </span>
              </div>
              <p className="text-slate-400 text-sm md:text-base">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Features ── */}
      <section ref={featuresRef} className="py-24 px-6 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
              Everything you need to master German
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Not just flashcards. A complete system built around how language learning actually works.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div
                key={title}
                className="feature-card opacity-0 bg-slate-900 border border-white/8 rounded-2xl p-6 hover:border-indigo-500/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: color + "18" }}
                >
                  <Icon size={24} style={{ color }} strokeWidth={1.8} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: How it works ── */}
      <section
        ref={stepsRef}
        className="py-24 px-6"
        style={{ background: "linear-gradient(180deg, #0f172a 0%, #0c0f1d 100%)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">How it works</h2>
            <p className="text-slate-400 text-lg">Three steps. Real progress.</p>
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block relative mb-8">
            <div
              className="steps-line absolute top-6 left-[calc(16.66%)] right-[calc(16.66%)] h-0.5 origin-left"
              style={{ background: "linear-gradient(90deg, #4f46e5, #818cf8, #60a5fa)" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="step-item opacity-0 text-center md:text-left">
                <div className="flex md:flex-col items-start md:items-center gap-4 md:gap-0">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm md:mb-6 relative z-10">
                    {num}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl mb-2 md:mt-0">{title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: App Preview (mock UI) ── */}
      <section ref={previewRef} className="py-24 px-6 bg-slate-950">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Copy */}
          <div className="preview-copy opacity-0 flex-1 md:max-w-sm">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wide">Live dashboard</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
              Your progress,<br />at a glance
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              See your streak, XP, review queue, and daily goal the moment you open the app. No fluff, just what matters.
            </p>
            <ul className="space-y-3">
              {["Streak tracker — never break the chain", "XP level bar — always know where you stand", "Due cards counter — review at the right time"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-slate-300 text-sm">
                  <CheckCircle2 size={15} className="text-indigo-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock UI */}
          <div
            className="preview-mock opacity-0 flex-1 w-full max-w-md"
            style={{ perspective: "1000px" }}
          >
            <div
              className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/20"
              style={{ transform: "rotateY(-4deg) rotateX(2deg)" }}
            >
              {/* Mock sidebar strip */}
              <div className="flex">
                <div className="w-2 bg-indigo-600/60" />
                <div className="flex-1 p-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/8">
                    <Hammer size={16} className="text-indigo-400" strokeWidth={2.5} />
                    <span className="text-white font-black text-sm">moinmoin</span>
                  </div>
                  {/* Welcome */}
                  <div className="mb-5">
                    <h3 className="text-white font-bold text-base">Welcome back, Lena</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Keep forging your German skills</p>
                  </div>
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { Icon: Star, label: "Level", value: "12", color: "text-yellow-400 bg-yellow-400/10" },
                      { Icon: Flame, label: "Streak", value: "14d", color: "text-orange-400 bg-orange-400/10" },
                      { Icon: BookOpen, label: "Words", value: "284", color: "text-blue-400 bg-blue-400/10" },
                      { Icon: RotateCcw, label: "Reviews", value: "941", color: "text-green-400 bg-green-400/10" },
                    ].map(({ Icon, label, value, color }) => (
                      <div key={label} className="bg-slate-800/60 rounded-xl p-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-1.5 ${color.split(" ")[1]}`}>
                          <Icon size={12} className={color.split(" ")[0]} strokeWidth={2} />
                        </div>
                        <p className="text-white font-bold text-sm leading-none">{value}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {/* XP bar */}
                  <div className="bg-slate-800/60 rounded-xl p-3 mb-3">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-slate-400">Level 12 Progress</span>
                      <span className="text-xs text-slate-500">1,240 / 2,000 XP</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: "62%" }} />
                    </div>
                  </div>
                  {/* CTA strip */}
                  <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-xs">23 cards due</p>
                      <p className="text-indigo-200 text-[10px]">Review your vocabulary now</p>
                    </div>
                    <span className="bg-white text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg">Study</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Quote ── */}
      <section
        ref={quoteRef}
        className="py-24 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%)" }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)" }}
          />
        </div>
        <div ref={quoteRef} className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="quote-block opacity-0">
            <div className="text-5xl text-indigo-400 font-black mb-4 leading-none">"</div>
            <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed mb-6">
              The only German learning app that feels like it was built for people who actually want to learn grammar, not just phrases.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">M</div>
              <span className="text-slate-400 text-sm">A learner on their path to B1</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Final CTA ── */}
      <section ref={ctaRef} className="py-28 px-6 bg-slate-950">
        <div className="cta-block opacity-0 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <Hammer size={28} className="text-indigo-400" strokeWidth={2.5} />
            <span className="text-2xl font-black text-white">moinmoin</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Start learning German today
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
            Free to use. No credit card. Just open it and start forging.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="group inline-flex items-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg px-9 py-4 rounded-2xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/40"
          >
            Get Started Free
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="text-slate-600 text-sm mt-4">
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              Sign in
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hammer size={16} className="text-indigo-400" strokeWidth={2.5} />
            <span className="text-white font-black text-sm">moinmoin</span>
            <span className="text-slate-600 text-xs ml-2">— Moin! That's "hello" in northern German 👋</span>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={() => navigate("/login")} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Sign In</button>
            <button onClick={() => navigate("/signup")} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">Sign Up</button>
            <span className="text-slate-700 text-xs">© 2025 moinmoin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
