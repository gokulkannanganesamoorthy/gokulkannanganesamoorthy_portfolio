import React, { useEffect, useRef } from 'react';

const TRAIL_LIFETIME = 800; // ms (User requested 0.5 - 1s)

class RacingLine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.points = [];
    this.lineWidth = 3; // Slightly thicker for impact
  }

  addPoint(x, y) {
    this.points.push({ x, y, time: Date.now() });
  }

  update(x, y, speed) {
    // Add new point if moving
    if (speed > 1) {
      this.addPoint(x, y);
    }

    // Prune dead points
    const now = Date.now();
    this.points = this.points.filter(p => now - p.time < TRAIL_LIFETIME);
  }

  draw() {
    if (this.points.length < 2) return;
    
    // Dynamic color matching
    const getTextColor = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      return computedStyle.getPropertyValue('--color-text').trim() || '#1d1d1f';
    };
    const textColor = getTextColor();
    
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = textColor;

    const now = Date.now();

    // Draw segment by segment to apply gradient opacity
    for (let i = 1; i < this.points.length; i++) {
        const prev = this.points[i - 1];
        const curr = this.points[i];
        
        const age = now - curr.time;
        const lifeRatio = 1 - (age / TRAIL_LIFETIME); // 1.0 (new) -> 0.0 (dead)
        
        if (lifeRatio <= 0) continue;

        this.ctx.globalAlpha = Math.max(0, lifeRatio); // Smooth fade
        this.ctx.lineWidth = this.lineWidth * lifeRatio; // Taper width
        
        this.ctx.beginPath();
        this.ctx.moveTo(prev.x, prev.y);
        this.ctx.lineTo(curr.x, curr.y);
        this.ctx.stroke();
    }
    this.ctx.globalAlpha = 1;
  }

  clear() {
    this.points = [];
  }
}

const RacingTrail = () => {
  const canvasRef = useRef(null);
  const racingLineRef = useRef(null);
  const animationFrameRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      racingLineRef.current?.clear();
    };
    resizeCanvas();
    racingLineRef.current = new RacingLine(canvas, ctx);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !racingLineRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    
    const animate = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const dx = mousePosRef.current.x - prevMousePosRef.current.x;
      const dy = mousePosRef.current.y - prevMousePosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      racingLineRef.current.update(mousePosRef.current.x, mousePosRef.current.y, speed);
      racingLineRef.current.draw();
      
      prevMousePosRef.current = { ...mousePosRef.current };
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Global mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9991,
        mixBlendMode: 'normal'
      }}
    />
  );
};

export default RacingTrail;
