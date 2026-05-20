/**
 * MoinMoin — Landing Page
 * Every section has its own Three.js scene + GSAP animations
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import {
  Hammer, Brain, BookOpen, GraduationCap, ClipboardList,
  Flame, Smartphone, ArrowRight, CheckCircle2, Star, RotateCcw,
  Sparkles,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

// ─── Shared palette ───────────────────────────────────────────────────────
const C = {
  bg:      0x020617, // slate-950
  indigo:  0x6366f1,
  violet:  0x8b5cf6,
  cyan:    0x22d3ee,
  emerald: 0x34d399,
  rose:    0xf43f5e,
  amber:   0xfbbf24,
};

// ═══════════════════════════════════════════════════════════════
//  CANVAS COMPONENTS — one per section
// ═══════════════════════════════════════════════════════════════

// ── 1. Hero — floating 3D word tiles ──────────────────────────
const GERMAN_WORDS = [
  "Hallo","Danke","Bitte","Guten","Tag",
  "Lernen","Deutsch","der","die","das",
  "ich","du","wir","A1","A2","B1",
  "Wort","Satz","Buch","Zeit","Welt",
  "XP","🔥","⭐","🧠","📖",
];

function makeWordTexture(word: string, accent = "#6366f1"): THREE.CanvasTexture {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d")!;
  // bg
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, "#0f0c29"); g.addColorStop(1, "#1a1560");
  ctx.fillStyle = g;
  ctx.roundRect(6, 6, S - 12, S - 12, 22); ctx.fill();
  // glow border
  ctx.shadowColor = accent; ctx.shadowBlur = 12;
  ctx.strokeStyle = accent + "99"; ctx.lineWidth = 2.5;
  ctx.roundRect(6, 6, S - 12, S - 12, 22); ctx.stroke();
  ctx.shadowBlur = 0;
  // text
  const fs = word.length <= 2 ? 96 : word.length <= 4 ? 72 : word.length <= 6 ? 52 : 38;
  ctx.font = `900 ${fs}px system-ui,sans-serif`;
  ctx.fillStyle = "#e0e7ff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(word, S / 2, S / 2);
  return new THREE.CanvasTexture(c);
}

function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(C.bg, 0.028);
    const cam = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 120);
    cam.position.set(0, 0, 16);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(C.bg, 1);
    el.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const d1 = new THREE.DirectionalLight(C.indigo, 3); d1.position.set(8, 12, 6); scene.add(d1);
    const d2 = new THREE.DirectionalLight(C.cyan, 1.8); d2.position.set(-10, -5, -4); scene.add(d2);
    const d3 = new THREE.PointLight(C.violet, 2, 25); d3.position.set(0, 0, 8); scene.add(d3);

    // Tiles
    const accents = ["#6366f1","#8b5cf6","#22d3ee","#34d399","#f43f5e","#fbbf24"];
    const tiles = GERMAN_WORDS.map((w, i) => {
      const geo = new THREE.BoxGeometry(1.75, 1.75, 0.1);
      const mat = new THREE.MeshStandardMaterial({ map: makeWordTexture(w, accents[i % accents.length]), roughness: 0.35, metalness: 0.25 });
      const mesh = new THREE.Mesh(geo, mat);
      const phi = Math.acos(-1 + (2 * i) / GERMAN_WORDS.length);
      const theta = Math.sqrt(GERMAN_WORDS.length * Math.PI) * phi;
      const r = 5.5 + Math.random() * 3;
      mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta) * 0.65, r * Math.cos(phi) - 1);
      mesh.rotation.set(Math.random() * 0.5, Math.random() * Math.PI * 2, Math.random() * 0.5);
      mesh.scale.setScalar(0);
      scene.add(mesh);
      gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1, delay: i * 0.04, ease: "elastic.out(1,0.6)" });
      return { mesh, sp: 0.12 + Math.random() * 0.22, off: Math.random() * Math.PI * 2, ts: (Math.random() - 0.5) * 0.007 };
    });

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 40;
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: C.indigo, size: 0.06, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(pGeo, pMat));

    let mx = 0, my = 0, tx = 0, ty = 0;
    const onMM = (e: MouseEvent) => { mx = (e.clientX / window.innerWidth - 0.5) * 2.5; my = -(e.clientY / window.innerHeight - 0.5) * 1.8; };
    window.addEventListener("mousemove", onMM);

    let raf: number;
    const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
      cam.position.x = tx; cam.position.y = ty; cam.lookAt(0, 0, 0);
      tiles.forEach((tile, i) => {
        tile.mesh.position.y += Math.sin(t * tile.sp + tile.off) * 0.012;
        tile.mesh.rotation.y += tile.ts;
        tile.mesh.rotation.x += tile.ts * 0.25;
        const ba = t * 0.035 + (i / tiles.length) * Math.PI * 2;
        tile.mesh.position.x += Math.cos(ba) * 0.0018;
        tile.mesh.position.z += Math.sin(ba) * 0.0009;
      });
      d3.position.set(Math.sin(t * 0.3) * 8, Math.cos(t * 0.2) * 5, 8);
      renderer.render(scene, cam);
    };
    loop();

    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMM); window.removeEventListener("resize", onResize);
      renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full" />;
}

// ── 2. Stats — flowing ribbon / aurora ────────────────────────
function StatsCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.z = 1;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Aurora plane via ShaderMaterial
    const mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { uTime: { value: 0 }, uRes: { value: new THREE.Vector2(el.clientWidth, el.clientHeight) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position,1.); }`,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uRes;
        varying vec2 vUv;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        void main(){
          vec2 uv=vUv;
          float n1=noise(uv*3.+vec2(uTime*0.18,uTime*0.09));
          float n2=noise(uv*5.-vec2(uTime*0.12,uTime*0.15));
          float a=n1*n2*0.5+0.05;
          vec3 col=mix(vec3(0.388,0.4,0.945),vec3(0.545,0.361,0.976),n1);
          col=mix(col,vec3(0.133,0.827,0.933),n2*0.4);
          gl_FragColor=vec4(col,a*0.55);
        }
      `,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(mesh);

    let raf: number; let t = 0;
    const loop = () => { raf = requestAnimationFrame(loop); t += 0.016; mat.uniforms.uTime.value = t; renderer.render(scene, cam); };
    loop();
    const onResize = () => { renderer.setSize(el.clientWidth, el.clientHeight); mat.uniforms.uRes.value.set(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 3. Features — drifting hex grid ───────────────────────────
function FeaturesCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 60);
    cam.position.set(0, 0, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Hex grid dots
    const geo = new THREE.CircleGeometry(0.04, 6);
    const colors = [C.indigo, C.violet, C.cyan, C.emerald];
    const dots: THREE.Mesh[] = [];
    for (let row = -8; row <= 8; row++) {
      for (let col = -12; col <= 12; col++) {
        const mat = new THREE.MeshBasicMaterial({ color: colors[Math.abs(row + col) % colors.length], transparent: true, opacity: 0.15 + Math.random() * 0.25 });
        const m = new THREE.Mesh(geo, mat);
        const ox = col % 2 === 0 ? 0 : 0.9;
        m.position.set(col * 1.8, row * 1.56 + ox, Math.random() * 2 - 1);
        dots.push(m);
        scene.add(m);
      }
    }

    let raf: number; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      dots.forEach((d, i) => {
        (d.material as THREE.MeshBasicMaterial).opacity = 0.08 + Math.abs(Math.sin(t * 0.4 + i * 0.15)) * 0.3;
        d.position.y += Math.sin(t * 0.2 + i) * 0.0008;
      });
      cam.position.x = Math.sin(t * 0.08) * 1.5;
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 4. Steps — flowing ribbon / lines ─────────────────────────
function StepsCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 60);
    cam.position.set(0, 0, 18);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Flowing tubes
    const tubes: Array<{ mesh: THREE.Mesh; speed: number; off: number }> = [];
    for (let i = 0; i < 12; i++) {
      const pts: THREE.Vector3[] = [];
      const startX = (Math.random() - 0.5) * 20;
      const startY = (Math.random() - 0.5) * 10;
      for (let j = 0; j < 6; j++) {
        pts.push(new THREE.Vector3(startX + j * 3 + (Math.random() - 0.5) * 2, startY + Math.sin(j * 1.2 + i) * 1.5, (Math.random() - 0.5) * 3));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const geo = new THREE.TubeGeometry(curve, 30, 0.02 + Math.random() * 0.02, 4, false);
      const mat = new THREE.MeshBasicMaterial({
        color: [C.indigo, C.violet, C.cyan][i % 3],
        transparent: true, opacity: 0.15 + Math.random() * 0.25,
      });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      tubes.push({ mesh, speed: 0.08 + Math.random() * 0.12, off: Math.random() * Math.PI * 2 });
    }

    let raf: number; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      tubes.forEach(tb => {
        tb.mesh.position.x += tb.speed * 0.012;
        if (tb.mesh.position.x > 12) tb.mesh.position.x = -12;
        (tb.mesh.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.abs(Math.sin(t * 0.5 + tb.off)) * 0.3;
      });
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 5. Preview — orbiting rings ────────────────────────────────
function PreviewCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 60);
    cam.position.set(0, 0, 14);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    const rings: THREE.Mesh[] = [];
    const ringData = [
      { r: 4.5, tube: 0.025, color: C.indigo, rx: 0.4, ry: 0, rz: 0 },
      { r: 6, tube: 0.02, color: C.violet, rx: 0, ry: 0.5, rz: 0.2 },
      { r: 3, tube: 0.03, color: C.cyan, rx: 1.0, ry: 0.3, rz: 0 },
      { r: 7.5, tube: 0.015, color: C.emerald, rx: 0.2, ry: 1.1, rz: 0.5 },
    ];
    ringData.forEach(rd => {
      const geo = new THREE.TorusGeometry(rd.r, rd.tube, 4, 100);
      const mat = new THREE.MeshBasicMaterial({ color: rd.color, transparent: true, opacity: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.set(rd.rx, rd.ry, rd.rz);
      rings.push(mesh);
      scene.add(mesh);
    });

    // Orbiting dots on rings
    const orbiters: Array<{ mesh: THREE.Mesh; ring: number; angle: number; speed: number }> = [];
    ringData.forEach((rd, ri) => {
      for (let i = 0; i < 3; i++) {
        const geo = new THREE.SphereGeometry(0.06, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: rd.color });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);
        orbiters.push({ mesh, ring: ri, angle: (i / 3) * Math.PI * 2, speed: 0.4 + Math.random() * 0.3 });
      }
    });

    let raf: number; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      rings.forEach((r, i) => { r.rotation.y += 0.003 * (i % 2 === 0 ? 1 : -1); r.rotation.x += 0.002; });
      orbiters.forEach(ob => {
        ob.angle += ob.speed * 0.012;
        const rd = ringData[ob.ring];
        const euler = new THREE.Euler(rd.rx, rd.ry, rd.rz);
        const q = new THREE.Quaternion().setFromEuler(euler);
        const pos = new THREE.Vector3(Math.cos(ob.angle) * rd.r, Math.sin(ob.angle) * rd.r, 0);
        pos.applyQuaternion(q);
        ob.mesh.position.copy(pos);
      });
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 6. Quote — galaxy particles ────────────────────────────────
function QuoteCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 80);
    cam.position.z = 12;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Galaxy arm particles
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const pColors = new Float32Array(count * 3);
    const armColors = [
      new THREE.Color(C.indigo), new THREE.Color(C.violet),
      new THREE.Color(C.cyan), new THREE.Color(C.emerald),
    ];
    for (let i = 0; i < count; i++) {
      const arm = i % 4;
      const t2 = Math.random();
      const angle = t2 * Math.PI * 4 + (arm * Math.PI * 0.5);
      const r = t2 * 6 + Math.random() * 0.6;
      positions[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 0.5;
      const c2 = armColors[arm];
      pColors[i * 3] = c2.r; pColors[i * 3 + 1] = c2.g; pColors[i * 3 + 2] = c2.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const mat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.6 });
    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    let raf: number; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      galaxy.rotation.y += 0.0015;
      galaxy.rotation.x = Math.sin(clock.getElapsedTime() * 0.1) * 0.15;
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 7. CTA — pulsing energy sphere ─────────────────────────────
function CtaCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 60);
    cam.position.z = 10;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Wireframe icosphere
    const geo = new THREE.IcosahedronGeometry(3, 2);
    const mat = new THREE.MeshBasicMaterial({ color: C.indigo, wireframe: true, transparent: true, opacity: 0.18 });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Inner glow sphere
    const igeo = new THREE.SphereGeometry(2.6, 32, 32);
    const imat = new THREE.MeshBasicMaterial({ color: C.violet, transparent: true, opacity: 0.06 });
    scene.add(new THREE.Mesh(igeo, imat));

    // Floating particles around it
    const pCount = 300;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi2 = Math.acos(Math.random() * 2 - 1);
      const r = 3.5 + Math.random() * 3;
      pPos[i * 3] = r * Math.sin(phi2) * Math.cos(theta);
      pPos[i * 3 + 1] = r * Math.sin(phi2) * Math.sin(theta);
      pPos[i * 3 + 2] = r * Math.cos(phi2);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: C.cyan, size: 0.05, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(pGeo, pMat));

    let raf: number; const clock = new THREE.Clock();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      sphere.rotation.y = t * 0.18; sphere.rotation.x = t * 0.09;
      const pulse = 1 + Math.sin(t * 1.8) * 0.04;
      sphere.scale.setScalar(pulse);
      mat.opacity = 0.12 + Math.sin(t * 1.5) * 0.06;
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── 8. Footer — wave grid ──────────────────────────────────────
function FooterCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 60);
    cam.position.set(0, 6, 14); cam.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0, 0);
    el.appendChild(renderer.domElement);

    // Wave grid
    const COLS = 28, ROWS = 14;
    const positions: Float32Array = new Float32Array(COLS * ROWS * 3);
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.PointsMaterial({ color: C.indigo, size: 0.08, transparent: true, opacity: 0.45 });

    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const idx = (r * COLS + c) * 3;
      positions[idx] = (c - COLS / 2) * 0.85;
      positions[idx + 1] = 0;
      positions[idx + 2] = (r - ROWS / 2) * 0.85;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const grid = new THREE.Points(geo, mat);
    scene.add(grid);

    let raf: number; let t = 0;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.025;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        pos.setY(idx, Math.sin(c * 0.4 + t) * Math.cos(r * 0.4 + t * 0.7) * 0.8);
      }
      pos.needsUpdate = true;
      mat.opacity = 0.3 + Math.sin(t * 0.5) * 0.15;
      renderer.render(scene, cam);
    };
    loop();
    const onResize = () => { cam.aspect = el.clientWidth / el.clientHeight; cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); renderer.dispose(); if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ═══════════════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════════════
const FEATURES = [
  { Icon: Brain,        title: "Spaced Repetition",  desc: "FSRS algorithm — cards surface at the exact moment before you forget. Science, not guesswork.",          color: "#818cf8" },
  { Icon: BookOpen,     title: "Grammar Mastery",    desc: "60+ chapters A1→B1. Theory, tables, examples, exercises. Actually understand German structure.",          color: "#34d399" },
  { Icon: GraduationCap,title: "Structured Path",    desc: "Zigzag lesson path that unlocks as you progress. Build knowledge in exactly the right order.",            color: "#60a5fa" },
  { Icon: ClipboardList,title: "Goethe Exam Prep",   desc: "Full mock exams: Hören, Lesen, Schreiben, Sprechen. Know where you stand before test day.",              color: "#f472b6" },
  { Icon: Flame,        title: "Streaks & XP",       desc: "Daily goals, level progression, badges. The motivation loop that actually keeps you going.",              color: "#fb923c" },
  { Icon: Smartphone,   title: "Web & Mobile",       desc: "PWA on any browser, native app on iOS/Android. Your progress follows you everywhere.",                   color: "#a78bfa" },
];

const STEPS = [
  { num: "01", title: "Add Words",     desc: "Paste any German word or phrase. AI enriches it with gender, articles, conjugations, and example sentences automatically." },
  { num: "02", title: "Study Daily",   desc: "Flash cards appear at the perfect moment — just before you'd forget. 5 focused minutes a day compounds into fluency." },
  { num: "03", title: "Track Growth",  desc: "XP, streaks, grammar chapters, exam scores. Watch your German actually improve week over week." },
];

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function LandingPage() {
  const [, navigate] = useLocation();

  const statsRef   = useRef<HTMLElement>(null);
  const featRef    = useRef<HTMLElement>(null);
  const stepsRef   = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLElement>(null);
  const quoteRef   = useRef<HTMLElement>(null);
  const ctaRef     = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // ── Nav glassmorphism on scroll
      ScrollTrigger.create({
        start: "top -60",
        end: 99999,
        toggleClass: { targets: "#mm-nav", className: "scrolled" },
      });

      // ── Hero
      const heroTl = gsap.timeline({ delay: 0.2 });
      heroTl
        .fromTo(".hero-badge",   { opacity: 0, y: 20, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(2)" })
        .fromTo(".hero-h1 .line1", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.2")
        .fromTo(".hero-h1 .line2", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.5")
        .fromTo(".hero-sub",     { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.4")
        .fromTo(".hero-cta",     { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .fromTo(".hero-note",    { opacity: 0 },         { opacity: 1, duration: 0.5 }, "-=0.1")
        .fromTo(".scroll-ind",   { opacity: 0, y: -10 }, { opacity: 0.5, y: 0, duration: 0.5 }, "-=0.2");

      // ── Stats count-up
      ScrollTrigger.create({
        trigger: statsRef.current, start: "top 82%", once: true,
        onEnter: () => {
          gsap.fromTo(".stat-card", { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, stagger: 0.12, duration: 0.7, ease: "back.out(1.5)" });
          document.querySelectorAll<HTMLElement>(".stat-num").forEach(el => {
            const target = +el.dataset.target!;
            const suffix = el.dataset.suffix ?? "";
            gsap.to({ val: 0 }, {
              val: target, duration: 2, ease: "power2.out",
              onUpdate() { el.textContent = Math.round((this as any)._targets[0].val) + suffix; },
            });
          });
        },
      });

      // ── Features
      gsap.fromTo(".feat-title", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.7,
        scrollTrigger: { trigger: featRef.current, start: "top 82%" },
      });
      gsap.fromTo(".feature-card", { opacity: 0, y: 60, scale: 0.92, rotateX: 8 }, {
        opacity: 1, y: 0, scale: 1, rotateX: 0,
        duration: 0.7, stagger: 0.09, ease: "power2.out",
        scrollTrigger: { trigger: ".feat-grid", start: "top 82%" },
      });

      // ── Steps
      gsap.fromTo(".steps-line", { scaleX: 0 }, {
        scaleX: 1, duration: 1.4, ease: "power2.inOut",
        scrollTrigger: { trigger: stepsRef.current, start: "top 78%" },
      });
      gsap.fromTo(".step-item", { opacity: 0, y: 50, scale: 0.9 }, {
        opacity: 1, y: 0, scale: 1, stagger: 0.2, duration: 0.75, ease: "back.out(1.4)",
        scrollTrigger: { trigger: stepsRef.current, start: "top 78%" },
      });

      // ── Preview
      gsap.fromTo(".preview-copy", { opacity: 0, x: -50 }, {
        opacity: 1, x: 0, duration: 0.85, ease: "power2.out",
        scrollTrigger: { trigger: previewRef.current, start: "top 80%" },
      });
      gsap.fromTo(".preview-mock", { opacity: 0, x: 50, rotateY: -15 }, {
        opacity: 1, x: 0, rotateY: -4, duration: 0.95, ease: "power2.out",
        scrollTrigger: { trigger: previewRef.current, start: "top 80%" },
      });

      // ── Quote
      gsap.fromTo(".quote-inner", { opacity: 0, scale: 0.9, y: 30 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: quoteRef.current, start: "top 80%" },
      });

      // ── CTA
      gsap.fromTo(".cta-inner", { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.3)",
        scrollTrigger: { trigger: ctaRef.current, start: "top 82%" },
      });

      // ── Footer
      gsap.fromTo(".footer-inner", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.7,
        scrollTrigger: { trigger: ".mm-footer", start: "top 90%" },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[#020617] text-white overflow-x-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Navbar ── */}
      <nav
        id="mm-nav"
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-14 py-4 transition-all duration-300"
        style={{ background: "linear-gradient(to bottom, rgba(2,6,23,0.9) 0%, transparent 100%)" }}
      >
        <style>{`
          #mm-nav.scrolled { background: rgba(2,6,23,0.85) !important; backdrop-filter: blur(18px); border-bottom: 1px solid rgba(99,102,241,0.15); }
        `}</style>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Hammer size={16} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">MoinMoin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/login")} className="text-sm font-medium text-slate-300 hover:text-white transition-all px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md">
            Sign In
          </button>
          <button onClick={() => navigate("/signup")} className="text-sm font-bold text-white px-5 py-2 rounded-xl border border-indigo-500/50 hover:border-indigo-400/80 bg-indigo-500/20 hover:bg-indigo-500/35 backdrop-blur-md transition-all hover:shadow-lg hover:shadow-indigo-500/20">
            Get Started
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-transparent to-[#020617] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/60 via-transparent to-[#020617]/60 pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="hero-badge opacity-0 inline-flex items-center gap-2 bg-indigo-600/15 border border-indigo-500/25 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Sparkles size={13} className="text-indigo-400" />
            <span className="text-indigo-300 text-sm font-semibold tracking-widest uppercase">MoinMoin</span>
            <span className="text-indigo-500 text-xs">· German Learning</span>
          </div>

          <h1 className="hero-h1 text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-7">
            <div className="line1 opacity-0">Learn German.</div>
            <div className="line2 opacity-0 bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Actually remember it.
            </div>
          </h1>

          <p className="hero-sub opacity-0 text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-9 leading-relaxed">
            Spaced repetition · 60+ grammar chapters · Structured lesson paths · Goethe exam prep.<br className="hidden md:block" />
            Everything you need from A1 to B1, in one place.
          </p>

          <div className="hero-cta opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/signup")}
              className="group relative flex items-center gap-2.5 text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] overflow-hidden border border-indigo-400/40 hover:border-indigo-300/60"
              style={{ background: "rgba(99,102,241,0.25)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              Get Started Free
              <ArrowRight size={18} className="relative transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            <a
              href="https://expo.dev/artifacts/eas/p2Jc2rN5TAPiSYDc6FALGw.apk"
              download
              className="group flex items-center gap-2.5 text-emerald-300 hover:text-white font-bold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.03] border border-emerald-400/30 hover:border-emerald-300/60"
              style={{ background: "rgba(16,185,129,0.12)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", boxShadow: "0 8px 32px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.08)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M5 14l7 7 7-7"/><path d="M3 21h18"/></svg>
              Download APK
            </a>
          </div>
          <p className="hero-note opacity-0 text-slate-600 text-sm mt-5">Free to use · No credit card needed</p>
        </div>

        <div className="scroll-ind opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-5 h-8 border border-white/20 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — STATS
      ══════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="relative py-20 overflow-hidden border-y border-white/[0.04]">
        <StatsCanvas />
        <div className="absolute inset-0 bg-[#020617]/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {[
              { value: 500, suffix: "+", label: "Words covered",      sub: "across A1–B1" },
              { value: 3,   suffix: "",  label: "CEFR levels",        sub: "A1, A2 & B1" },
              { value: 60,  suffix: "+", label: "Grammar chapters",   sub: "theory to exercises" },
            ].map(({ value, suffix, label, sub }) => (
              <div key={label} className="stat-card opacity-0 text-center group">
                <div
                  className="relative bg-white/[0.03] border border-white/[0.07] rounded-3xl px-4 md:px-8 py-7 md:py-10 hover:border-indigo-500/30 transition-all duration-300 hover:bg-indigo-600/5"
                >
                  <div className="text-4xl md:text-6xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-1">
                    <span className="stat-num" data-target={value} data-suffix={suffix}>0{suffix}</span>
                  </div>
                  <p className="text-slate-300 font-semibold text-sm md:text-base">{label}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — FEATURES
      ══════════════════════════════════════════════════════ */}
      <section ref={featRef} className="relative py-28 overflow-hidden">
        <FeaturesCanvas />
        <div className="absolute inset-0 bg-[#020617]/88" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="feat-title opacity-0 text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-5">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Full system</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">
              Everything to master<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">German grammar</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">Not just flashcards. A complete, science-backed system built around how language learning actually works.</p>
          </div>

          <div className="feat-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, desc, color }) => (
              <div
                key={title}
                className="feature-card opacity-0 relative group bg-white/[0.025] border border-white/[0.06] rounded-2xl p-7 hover:border-opacity-60 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                style={{ "--hover-color": color } as React.CSSProperties}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at top left, ${color}10 0%, transparent 60%)` }}
                />
                <div className="relative z-10">
                  <div className="w-13 h-13 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110" style={{ background: color + "15", width: 52, height: 52 }}>
                    <Icon size={26} style={{ color }} strokeWidth={1.7} />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2.5" style={{ color: "white" }}>{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ══════════════════════════════════════════════════════ */}
      <section ref={stepsRef} className="relative py-28 overflow-hidden">
        <StepsCanvas />
        <div className="absolute inset-0 bg-[#020617]/80" />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-3">
              How it{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">works</span>
            </h2>
            <p className="text-slate-500 text-lg">Three steps. Real, measurable progress.</p>
          </div>

          {/* Timeline */}
          <div className="hidden md:flex items-start justify-center gap-0 mb-0 relative">
            <div className="absolute top-[26px] left-[calc(16.7%+26px)] right-[calc(16.7%+26px)] h-px origin-left steps-line"
              style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)" }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {STEPS.map(({ num, title, desc }, i) => (
              <div key={num} className="step-item opacity-0 flex md:flex-col items-start gap-5 md:gap-0">
                <div className="relative flex-shrink-0">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center text-white font-black text-sm md:mb-7 relative z-10 shadow-lg"
                    style={{ width: 52, height: 52, background: `linear-gradient(135deg, #6366f1, #8b5cf6)`, boxShadow: "0 0 24px rgba(99,102,241,0.4)" }}
                  >
                    {num}
                  </div>
                </div>
                <div className="md:text-center">
                  <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 5 — APP PREVIEW
      ══════════════════════════════════════════════════════ */}
      <section ref={previewRef} className="relative py-28 overflow-hidden">
        <PreviewCanvas />
        <div className="absolute inset-0 bg-[#020617]/85" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-14 md:gap-20">

          {/* Copy */}
          <div className="preview-copy opacity-0 flex-1 md:max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-6">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Live dashboard</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-5">
              Your progress,<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">crystal clear</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-8 text-base">
              See your streak, XP level, cards due, and daily goal the moment you open the app. No noise — just what moves you forward.
            </p>
            <ul className="space-y-3.5">
              {[
                "Streak tracker — never break the chain",
                "XP level bar — always know where you stand",
                "Due cards counter — review at exactly the right moment",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={11} className="text-indigo-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Mock UI */}
          <div className="preview-mock opacity-0 flex-1 w-full max-w-lg" style={{ perspective: "1200px" }}>
            <div
              className="bg-[#0c0e1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              style={{ transform: "rotateY(-4deg) rotateX(2deg)", boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.05)" }}
            >
              {/* Topbar */}
              <div className="bg-[#080a14] px-5 py-3.5 flex items-center justify-between border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                    <Hammer size={13} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className="text-white font-black text-sm">MoinMoin</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
              </div>

              <div className="p-5">
                {/* Welcome */}
                <div className="mb-4">
                  <h3 className="text-white font-bold text-base">Welcome back, Lena 👋</h3>
                  <p className="text-slate-600 text-xs mt-0.5">Keep forging your German skills</p>
                </div>
                {/* Stat cards */}
                <div className="grid grid-cols-4 gap-2 mb-3.5">
                  {[
                    { Icon: Star,      label: "Level",   value: "12",   bg: "bg-yellow-500/10", tc: "text-yellow-400" },
                    { Icon: Flame,     label: "Streak",  value: "14d",  bg: "bg-orange-500/10", tc: "text-orange-400" },
                    { Icon: BookOpen,  label: "Words",   value: "284",  bg: "bg-blue-500/10",   tc: "text-blue-400" },
                    { Icon: RotateCcw, label: "Reviews", value: "941",  bg: "bg-emerald-500/10",tc: "text-emerald-400" },
                  ].map(({ Icon, label, value, bg, tc }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-2.5">
                      <div className={`w-6 h-6 ${bg} rounded-md flex items-center justify-center mb-1.5`}>
                        <Icon size={12} className={tc} strokeWidth={2} />
                      </div>
                      <p className="text-white font-bold text-sm leading-none">{value}</p>
                      <p className="text-slate-600 text-[10px] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                {/* XP bar */}
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Level 12 → 13</span>
                    <span className="text-xs text-slate-600">1,240 / 2,000 XP</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: "62%", background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
                  </div>
                </div>
                {/* Daily goal */}
                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-3">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Daily Goal</span>
                    <span className="text-xs text-slate-600">18 / 20 reviews</span>
                  </div>
                  <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "90%" }} />
                  </div>
                </div>
                {/* CTA */}
                <div className="rounded-xl p-3.5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}>
                  <div>
                    <p className="text-white font-bold text-xs">23 cards due</p>
                    <p className="text-indigo-200 text-[10px] mt-0.5">Review vocabulary now</p>
                  </div>
                  <span className="bg-white text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-lg">Study Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 6 — QUOTE
      ══════════════════════════════════════════════════════ */}
      <section ref={quoteRef} className="relative py-32 overflow-hidden">
        <QuoteCanvas />
        <div className="absolute inset-0 bg-[#020617]/75" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="quote-inner opacity-0">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-8"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 30px rgba(99,102,241,0.5)" }}
            >
              <span className="text-2xl font-black text-white leading-none">"</span>
            </div>
            <blockquote className="text-2xl md:text-3xl font-semibold text-slate-200 leading-relaxed mb-8">
              The only German learning app that feels like it was built for people who actually want to{" "}
              <span className="text-white font-bold">learn grammar</span>, not just phrases.
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>M</div>
              <div className="text-left">
                <p className="text-white text-sm font-semibold">MoinMoin user</p>
                <p className="text-slate-500 text-xs">On the path to B1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 7 — FINAL CTA
      ══════════════════════════════════════════════════════ */}
      <section ref={ctaRef} className="relative py-32 overflow-hidden">
        <CtaCanvas />
        <div className="absolute inset-0 bg-[#020617]/80" />
        {/* Glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[80px]"
            style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
          <div className="cta-inner opacity-0">
            <div className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <Hammer size={18} strokeWidth={2.5} className="text-white" />
              </div>
              <span className="text-2xl font-black">MoinMoin</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black leading-[0.95] tracking-tighter mb-5">
              Start learning<br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">German today</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto">
              Free to use. No credit card. Open it, add a word, and start building the habit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="group relative inline-flex items-center gap-3 text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.03] overflow-hidden border border-indigo-400/40 hover:border-indigo-300/60"
                style={{ background: "rgba(99,102,241,0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.12)" }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Get Started Free</span>
                <ArrowRight size={20} className="relative transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <a
                href="https://expo.dev/artifacts/eas/p2Jc2rN5TAPiSYDc6FALGw.apk"
                download
                className="group inline-flex items-center gap-2.5 text-emerald-300 hover:text-white font-bold text-lg px-10 py-5 rounded-2xl transition-all duration-200 hover:scale-[1.03] border border-emerald-400/30 hover:border-emerald-300/60"
                style={{ background: "rgba(16,185,129,0.12)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 8px 40px rgba(16,185,129,0.18), inset 0 1px 0 rgba(255,255,255,0.08)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v13M5 14l7 7 7-7"/><path d="M3 21h18"/></svg>
                Download APK
              </a>
            </div>
            <p className="text-slate-600 text-sm mt-5">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors">Sign in</button>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer className="mm-footer relative overflow-hidden border-t border-white/[0.04] py-14">
        <FooterCanvas />
        <div className="absolute inset-0 bg-[#020617]/90" />
        <div className="footer-inner opacity-0 relative z-10 max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <Hammer size={15} strokeWidth={2.5} className="text-white" />
                </div>
                <span className="text-white font-black text-lg">MoinMoin</span>
              </div>
              <p className="text-slate-600 text-xs">Moin! That's "hello" in northern German 👋</p>
              <p className="text-slate-700 text-xs">From A1 to B1 — one word at a time.</p>
            </div>

            {/* Links */}
            <div className="flex items-center gap-6">
              <button onClick={() => navigate("/login")} className="text-slate-500 hover:text-slate-200 text-sm transition-colors">Sign In</button>
              <button onClick={() => navigate("/signup")} className="text-slate-500 hover:text-slate-200 text-sm transition-colors">Sign Up</button>
              <button onClick={() => navigate("/login")} className="text-slate-500 hover:text-slate-200 text-sm transition-colors">Dashboard</button>
            </div>

            {/* Right */}
            <div className="text-center md:text-right">
              <p className="text-slate-700 text-xs">© 2025 MoinMoin</p>
              <p className="text-slate-800 text-xs mt-0.5">Built with ❤️ for German learners</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
