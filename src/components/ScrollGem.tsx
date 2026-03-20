import React, { useRef, useEffect, useCallback } from "react";

const ScrollGem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const shimmerRef = useRef(0);

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, frame: number, w: number, h: number, shimmer: number) => {
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, w * dpr, h * dpr);
    ctx.save();
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h * 0.48;
    const angle = (frame / 120) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const perspective = Math.abs(cosA);
    const gemW = 100 * perspective + 40;
    const gemH = 120;

    // Shadow
    ctx.beginPath();
    ctx.ellipse(cx, cy + gemH + 30, 60 * perspective + 20, 12, 0, 0, Math.PI * 2);
    const shadowGrad = ctx.createRadialGradient(cx, cy + gemH + 30, 0, cx, cy + gemH + 30, 80);
    shadowGrad.addColorStop(0, "rgba(0,0,0,0.12)");
    shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // Gem body
    const drawOctagon = (wMul: number, hMul: number) => {
      const gw = gemW * wMul;
      const gh = gemH * hMul;
      const cut = gw * 0.3;
      ctx.beginPath();
      ctx.moveTo(cx - gw + cut, cy - gh);
      ctx.lineTo(cx + gw - cut, cy - gh);
      ctx.lineTo(cx + gw, cy - gh + cut);
      ctx.lineTo(cx + gw, cy + gh - cut);
      ctx.lineTo(cx + gw - cut, cy + gh);
      ctx.lineTo(cx - gw + cut, cy + gh);
      ctx.lineTo(cx - gw, cy + gh - cut);
      ctx.lineTo(cx - gw, cy - gh + cut);
      ctx.closePath();
    };

    // Main gem fill
    ctx.save();
    drawOctagon(1, 1);
    ctx.clip();

    // Table facet
    const tableLight = 0.3 + 0.4 * Math.abs(Math.cos(angle + 0.3));
    ctx.fillStyle = `rgba(74,127,193,${0.6 + tableLight * 0.4})`;
    ctx.fillRect(cx - gemW, cy - gemH, gemW * 2, gemH * 0.5);

    // Left crown
    ctx.fillStyle = "#1B4F8A";
    ctx.beginPath();
    ctx.moveTo(cx - gemW, cy - gemH * 0.5);
    ctx.lineTo(cx, cy - gemH * 0.2);
    ctx.lineTo(cx - gemW, cy + gemH * 0.1);
    ctx.fill();

    // Right crown
    const rightLight = 0.2 * Math.sin(angle);
    ctx.fillStyle = `rgb(${45 + rightLight * 40},${107 + rightLight * 40},${173 + rightLight * 40})`;
    ctx.beginPath();
    ctx.moveTo(cx + gemW, cy - gemH * 0.5);
    ctx.lineTo(cx, cy - gemH * 0.2);
    ctx.lineTo(cx + gemW, cy + gemH * 0.1);
    ctx.fill();

    // Bottom pavilion
    ctx.fillStyle = "#0F2E52";
    ctx.beginPath();
    ctx.moveTo(cx - gemW * 0.8, cy + gemH * 0.1);
    ctx.lineTo(cx, cy + gemH);
    ctx.lineTo(cx + gemW * 0.8, cy + gemH * 0.1);
    ctx.fill();

    // Left pavilion
    ctx.fillStyle = "#143D6B";
    ctx.beginPath();
    ctx.moveTo(cx - gemW, cy + gemH * 0.1);
    ctx.lineTo(cx - gemW * 0.8, cy + gemH * 0.1);
    ctx.lineTo(cx, cy + gemH);
    ctx.lineTo(cx - gemW * 0.3, cy + gemH * 0.7);
    ctx.fill();

    // Right pavilion
    const rpLight = 0.15 * Math.cos(angle + 1);
    ctx.fillStyle = `rgb(${31 + rpLight * 60},${85 + rpLight * 60},${143 + rpLight * 60})`;
    ctx.beginPath();
    ctx.moveTo(cx + gemW, cy + gemH * 0.1);
    ctx.lineTo(cx + gemW * 0.8, cy + gemH * 0.1);
    ctx.lineTo(cx, cy + gemH);
    ctx.lineTo(cx + gemW * 0.3, cy + gemH * 0.7);
    ctx.fill();

    // Facet lines
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - gemH);
    ctx.lineTo(cx, cy + gemH);
    ctx.moveTo(cx - gemW, cy);
    ctx.lineTo(cx + gemW, cy);
    ctx.stroke();

    // Highlight
    const hlOpacity = 0.4 + 0.3 * Math.sin(angle * 2 + 1);
    const hlGrad = ctx.createRadialGradient(cx - gemW * 0.3, cy - gemH * 0.4, 0, cx - gemW * 0.3, cy - gemH * 0.4, gemW * 0.5);
    hlGrad.addColorStop(0, `rgba(255,255,255,${hlOpacity})`);
    hlGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hlGrad;
    ctx.fillRect(cx - gemW, cy - gemH, gemW * 2, gemH * 2);

    // Shimmer line
    const shimmerOpacity = 0.3 + 0.2 * Math.sin(shimmer);
    ctx.strokeStyle = `rgba(255,255,255,${shimmerOpacity})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - gemW * 0.6, cy - gemH * 0.6);
    ctx.lineTo(cx + gemW * 0.6, cy + gemH * 0.6);
    ctx.stroke();

    // Sparkles
    for (let i = 0; i < 3; i++) {
      const sparkleOpacity = Math.max(0, Math.sin(angle * 3 + i * 1.2));
      if (sparkleOpacity > 0.1) {
        const sx = cx + (i - 1) * gemW * 0.4;
        const sy = cy + (i - 1) * gemH * 0.2 - gemH * 0.1;
        const size = 3 + i * 2;
        ctx.strokeStyle = `rgba(255,255,255,${sparkleOpacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx - size, sy);
        ctx.lineTo(sx + size, sy);
        ctx.moveTo(sx, sy - size);
        ctx.lineTo(sx, sy + size);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = 440;
    const h = 500;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d")!;

    const handleScroll = () => {
      const progress = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight * 0.8)));
      frameRef.current = Math.floor(progress * 119);
    };

    let animId: number;
    const animate = () => {
      shimmerRef.current = Date.now() / 400;
      drawFrame(ctx, frameRef.current, w, h, shimmerRef.current);
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    animate();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animId);
    };
  }, [drawFrame]);

  return (
    <div className="relative flex flex-col items-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full bg-surface-2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-border" />
      <canvas ref={canvasRef} className="relative z-10 max-w-full" />
    </div>
  );
};

export default ScrollGem;
