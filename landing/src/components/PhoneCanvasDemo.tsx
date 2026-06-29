import React, { useEffect, useRef } from 'react';

interface PhoneCanvasDemoProps {
  images: string[];
  activeIdx: number;
}

export function PhoneCanvasDemo({ images, activeIdx }: PhoneCanvasDemoProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });
  const targetSlideRef = useRef<number>(0);
  const currentSlideRef = useRef<number>(0);
  const loadedImagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    loadedImagesRef.current = images.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
  }, [images]);

  useEffect(() => {
    targetSlideRef.current = activeIdx;
    currentMouseRef.current.x += 0.15; 
  }, [activeIdx]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    targetMouseRef.current = {
      x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
    };
  };

  const handleMouseLeave = () => {
    targetMouseRef.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      currentMouseRef.current.x += (targetMouseRef.current.x - currentMouseRef.current.x) * 0.1;
      currentMouseRef.current.y += (targetMouseRef.current.y - currentMouseRef.current.y) * 0.1;
      const currentX = currentMouseRef.current.x;
      const currentY = currentMouseRef.current.y;

      currentSlideRef.current += (targetSlideRef.current - currentSlideRef.current) * 0.12;
      const slideProgress = currentSlideRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = 245;
      const height = 490;
      const radius = 38;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      const shadowOffsetX = currentX * 15;
      const shadowOffsetY = currentY * 15;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.25)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = shadowOffsetX;
      ctx.shadowOffsetY = shadowOffsetY + 6;

      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, radius);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.shadowColor = 'transparent';
      
      const borderThickness = 6;
      ctx.lineWidth = borderThickness;
      ctx.strokeStyle = '#1e293b'; 
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      const screenPadding = 4;
      ctx.roundRect(
        -width / 2 + screenPadding,
        -height / 2 + screenPadding,
        width - screenPadding * 2,
        height - screenPadding * 2,
        radius - screenPadding
      );
      ctx.clip();

      loadedImagesRef.current.forEach((img, idx) => {
        if (img && img.complete && img.naturalWidth > 0) {
          const xPos = (idx - slideProgress) * width;
          ctx.drawImage(img, -width / 2 + xPos, -height / 2, width, height);
        } else {
          const xPos = (idx - slideProgress) * width;
          ctx.fillStyle = '#020617';
          ctx.fillRect(-width / 2 + xPos, -height / 2, width, height);
        }
      });

      ctx.restore();

      ctx.beginPath();
      ctx.roundRect(-38, -height / 2 + 13, 76, 16, 8);
      ctx.fillStyle = '#000000';
      ctx.fill();
      
      const gradient = ctx.createLinearGradient(
        -width + currentX * 100,
        -height,
        width + currentX * 100,
        height
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
      gradient.addColorStop(0.25, 'rgba(255, 255, 255, 0.0)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.0)');
      gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.08)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, radius);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeIdx]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={600}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="cursor-grab transition-transform duration-300 ease-out hover:scale-102 active:cursor-grabbing"
    />
  );
}

