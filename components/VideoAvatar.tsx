"use client";

import { useEffect, useRef, useState } from "react";

interface VideoAvatarProps {
  speaking: boolean;
  thinking: boolean;
}

export function VideoAvatar({ speaking, thinking }: VideoAvatarProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);

  useEffect(() => {
    const handler = () => setDevicePixelRatio(window.devicePixelRatio || 1);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let lastTimestamp = 0;
    let waveSeed = Math.random() * 1000;

    const render = (time: number) => {
      if (!canvas || !ctx) return;
      const width = canvas.clientWidth * devicePixelRatio;
      const height = canvas.clientHeight * devicePixelRatio;

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const dt = (time - lastTimestamp) / 16.7;
      lastTimestamp = time;

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(108, 142, 255, 0.84)");
      gradient.addColorStop(0.4, "rgba(70, 91, 255, 0.88)");
      gradient.addColorStop(1, "rgba(22, 32, 120, 0.95)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.52;

      const glowGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.min(width, height) * 0.05,
        centerX,
        centerY,
        Math.max(width, height) * 0.55
      );
      glowGradient.addColorStop(0, "rgba(255,255,255,0.9)");
      glowGradient.addColorStop(0.2, "rgba(210, 220, 255, 0.75)");
      glowGradient.addColorStop(1, "rgba(20, 28, 95, 0.35)");

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      const pulse = speaking ? 0.45 : thinking ? 0.25 : 0.12;
      const noise = Math.sin((time + waveSeed) / (speaking ? 75 : 140));
      const glowRadius = Math.max(width, height) * (0.3 + pulse * 0.45 + noise * 0.05);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const auraGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      auraGradient.addColorStop(0, "rgba(255,255,255,0.45)");
      auraGradient.addColorStop(0.5, "rgba(130,180,255,0.18)");
      auraGradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = auraGradient;
      ctx.fillRect(centerX - glowRadius, centerY - glowRadius, glowRadius * 2, glowRadius * 2);
      ctx.restore();

      const headWidth = width * 0.32;
      const headHeight = height * 0.42;
      const headX = centerX - headWidth / 2;
      const headY = centerY - headHeight / 1.6;

      ctx.save();
      ctx.fillStyle = "rgba(240, 244, 255, 0.95)";
      ctx.globalCompositeOperation = "screen";
      roundedRect(ctx, headX, headY, headWidth, headHeight, headWidth * 0.45);
      ctx.fill();
      ctx.restore();

      const eyeOffsetX = headWidth * 0.22;
      const eyeY = headY + headHeight * 0.38;
      const eyeRadius = headWidth * 0.075;
      const blink = Math.abs(Math.sin((time + waveSeed) / 340));
      const speakingBurst = speaking ? Math.abs(Math.sin(time / 90)) * 0.5 : 0;

      drawEye(ctx, centerX - eyeOffsetX, eyeY, eyeRadius, blink, speakingBurst);
      drawEye(ctx, centerX + eyeOffsetX, eyeY, eyeRadius, blink, speakingBurst);

      const mouthWidth = headWidth * 0.48;
      const mouthHeight = speaking ? headHeight * 0.26 : headHeight * 0.08;
      const mouthX = centerX - mouthWidth / 2;
      const mouthY = headY + headHeight * 0.66;

      const waveAmplitude = speaking ? 18 : 6;
      const waveFrequency = speaking ? 0.18 : 0.07;
      const waveOffset = speaking ? time / 80 : time / 140;

      ctx.save();
      ctx.strokeStyle = "rgba(74, 88, 255, 0.85)";
      ctx.lineWidth = speaking ? 8 : 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let x = 0; x <= mouthWidth; x += 4) {
        const y = Math.sin((x * waveFrequency + waveOffset) % (Math.PI * 2)) * waveAmplitude;
        if (x === 0) {
          ctx.moveTo(mouthX + x, mouthY + y);
        } else {
          ctx.lineTo(mouthX + x, mouthY + y);
        }
      }
      ctx.stroke();
      ctx.restore();

      waveSeed += dt * 0.6;
      animationFrame = requestAnimationFrame(render);
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [devicePixelRatio, speaking, thinking]);

  return (
    <div className="relative flex w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        className="aspect-video w-full max-w-xl rounded-[2.5rem] border border-white/10 bg-slate-900/80 shadow-[0_30px_120px_-35px_rgba(76,106,255,0.65)]"
      />
      <div className="pointer-events-none absolute bottom-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/80 backdrop-blur">
        {speaking ? "Responding" : thinking ? "Thinking" : "Idle"}
      </div>
    </div>
  );
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  blink: number,
  speakingBurst: number
) {
  ctx.save();
  ctx.fillStyle = "rgba(36, 46, 128, 0.85)";
  const squish = 1 - Math.pow(blink, 3);
  ctx.beginPath();
  ctx.ellipse(x, y, radius * (1.05 + speakingBurst * 0.2), radius * squish, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.18, y - radius * 0.2, radius * 0.35, radius * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
