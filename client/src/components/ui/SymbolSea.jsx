import React, { useEffect, useRef } from "react";
import "./SymbolSea.css";

const SYMBOLS = "{}[]<>=>/*+-|\\;:!?#@&$%^~_.01";

export default function SymbolSea({ errorTrigger = 0, isLightMode = false }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const errorEffectRef = useRef(0);

  useEffect(() => {
    if (errorTrigger > 0) {
      errorEffectRef.current = 1.0;
    }
  }, [errorTrigger]);

  const isLightModeRef = useRef(isLightMode);
  useEffect(() => {
    isLightModeRef.current = isLightMode;
  }, [isLightMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const fov = 400;
    const numParticles = 2500;
    const points = [];
    
    for (let i = 0; i < numParticles; i++) {
      const radius = 50 + Math.random() * 2500;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 3000;
      
      points.push({
        radius: radius,
        angle: angle,
        baseY: height,
        speed: (2500 - radius) * 0.000004 + 0.0005,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        changeTimer: Math.random() * 200,
        opacityOffset: Math.random() * 0.1,
        vx: 0,
        vy: 0,
        vz: 0
      });
    }
    particlesRef.current = points;

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    let time = 0;
    const animate = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "12px 'JetBrains Mono', monospace";

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      if (errorEffectRef.current > 0) {
        errorEffectRef.current *= 0.97;
        if (errorEffectRef.current < 0.01) errorEffectRef.current = 0;
      }
      const err = errorEffectRef.current;
      const TILT = 0.25;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const speedBoost = 1 + err * 5;
        p.angle += p.speed * speedBoost;
        
        const currentY = p.baseY + Math.sin(p.angle * 2 + time) * 100;
        let currentRadius = p.radius;
        
        if (err > 0.5) {
          currentRadius += (Math.random() - 0.5) * 100 * (err - 0.5);
          p.angle += (Math.random() - 0.5) * 0.05 * (err - 0.5);
        }

        const x = currentRadius * Math.cos(p.angle);
        const z = currentRadius * Math.sin(p.angle);
        const y = currentY;

        let rx = x;
        let ry = y * Math.cos(TILT) - z * Math.sin(TILT);
        let rz = y * Math.sin(TILT) + z * Math.cos(TILT);
        rz += 1200;

        if (rz < 1) continue;

        const scale = fov / rz;
        let screenX = cx + rx * scale;
        let screenY = cy + ry * scale;

        const dx = screenX - mx;
        const dy = screenY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const safeRadius = 150;
        if (dist < safeRadius) {
          const force = (1 - dist / safeRadius);
          const push = force * 60;
          screenX += (dx / dist) * push;
          screenY += (dy / dist) * push;
        }

        let opacity = Math.max(0, Math.min(1, 1 - (rz - 400) / 2500));
        const distToMouseNorm = Math.min(1, dist / 400);
        const hoverBrightness = (1 - distToMouseNorm) * 0.4;
        opacity = opacity * 0.3 + p.opacityOffset + hoverBrightness;
        
        if (opacity <= 0.01) continue;

        p.changeTimer--;
        if (p.changeTimer <= 0) {
          p.char = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          p.changeTimer = 100 + Math.random() * 300;
        }

        const isLight = isLightModeRef.current;
        const baseColor = isLight ? 0 : 255;
        const r = Math.floor(baseColor + (255 - baseColor) * err);
        const g = Math.floor(baseColor * Math.pow(1 - err, 2.5));
        const b = Math.floor(baseColor * Math.pow(1 - err, 2.5));

        const themeOpacityMult = isLight ? 1.4 : 1.0;
        const finalOpacity = Math.min(1, opacity * themeOpacityMult);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
        ctx.fillText(p.char, screenX, screenY);
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="symbol-sea">
      <canvas ref={canvasRef} />
    </div>
  );
}
