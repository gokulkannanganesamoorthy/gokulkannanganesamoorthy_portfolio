import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import useSfx from '../hooks/useSfx';

const CustomCursor = () => {
  const followerRef = useRef(null);
  const canvasRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const { revEngine, isPlaying } = useSfx(); // Import sound
  
  // Physics state
  const pos = useRef({ x: 0, y: 0 });
  const vel = useRef({ x: 0, y: 0 });
  const set = useRef({ x: 0, y: 0 });
  
  // Trail state
  const trailRef = useRef([]);

  useEffect(() => {
    const follower = followerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // GSAP QuickTo for buttery smooth performance (better than standard .to)
    // Follower has more lag/physics
    const xSetFollower = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3" });
    const ySetFollower = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3" });

    const moveCursor = (e) => {
      // Update target position
      set.current.x = e.clientX;
      set.current.y = e.clientY;
    };

    // Animation Loop for Physics (Velocity & Distortion)
    const loop = () => {
      // Calculate velocity
      const dt = 1.0 - Math.pow(1.0 - 0.1, gsap.ticker.deltaRatio()); 
      
      // Simple lerp for follower position tracking
      pos.current.x += (set.current.x - pos.current.x) * dt * 2.5; // Speed factor
      pos.current.y += (set.current.y - pos.current.y) * dt * 2.5;
      
      // Update follower visual pos
      xSetFollower(pos.current.x);
      ySetFollower(pos.current.y);

      // Calculate instantaneous velocity for distortion
      vel.current.x = set.current.x - pos.current.x;
      vel.current.y = set.current.y - pos.current.y;
      
      // Calculate angle of movement
      const angle = Math.atan2(vel.current.y, vel.current.x) * (180 / Math.PI);
      
      // Calculate stretch factor (capped)
      const speed = Math.sqrt(vel.current.x * vel.current.x + vel.current.y * vel.current.y);
      const stretch = Math.min(speed * 0.05, 0.5); // Max stretch 0.5
      
      // Apply distortion ONLY if not hovering (hover should be perfect circle)
      if (!isHovering) {
        gsap.set(follower, {
          rotation: angle,
          scaleX: 1 + stretch,
          scaleY: 1 - stretch * 0.5, // Maintain some volume
        });
      } else {
        // Reset rotation/scale smoothly when hovering
         gsap.to(follower, {
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 0.2,
          overwrite: 'auto'
        });
      }

      // --- Trail Logic ---
      // Add point if moving fast enough (lowered threshold for more continuity)
      if (speed > 0.5) {
          trailRef.current.push({
              x: pos.current.x,
              y: pos.current.y,
              age: 0,
              angle: angle,
              speed: speed 
          });
      }

      // --- Smoke / Exhaust Logic ---
      // Spawn particles if moving (or even just idle for cool effect, but let's stick to movement for "exhaust")
      
      // ENGINE SOUND: Rev based on speed
      // Normalize speed (0 to ~100) to 0.0 - 1.0 range
      const intensity = Math.min(speed / 40, 1.0);
      if (isPlaying) {
          revEngine(intensity);
      }

      if (speed > 2) { 
          // MOVING SMOKE (Heavy exhaust)
          // Calculate rear of car position (car is 60px long, rear is 30px behind center)
          const carLength = 60; 
          const rearOffsetDistance = carLength / 2; 
          const angleRad = angle * (Math.PI / 180);
          const rearAngleRad = angleRad + Math.PI;
          const rearOffsetX = Math.cos(rearAngleRad) * rearOffsetDistance;
          const rearOffsetY = Math.sin(rearAngleRad) * rearOffsetDistance;
          const rearX = pos.current.x + rearOffsetX;
          const rearY = pos.current.y + rearOffsetY;
          
          for (let i = 0; i < 5; i++) { // Reduced count slightly for performance
            trailRef.current.push({
                x: rearX + (Math.random() - 0.5) * 8, 
                y: rearY + (Math.random() - 0.5) * 8,
                vx: Math.cos(rearAngleRad) * 0.8 + (Math.random() - 0.5) * 1.0, 
                vy: Math.sin(rearAngleRad) * 0.8 + (Math.random() - 0.5) * 1.0,
                age: 0,
                life: Math.random() * 40 + 20, 
                size: Math.random() * 2 + 2,
                color: Math.random() > 0.5 ? '#4e4e4eff' : '#767474ff'
            });
          }
      } else {
          // IDLE SMOKE (Minimal, wispy)
          if (Math.random() > 0.85) { // Spawn occasionally
              const carLength = 60;
              const rearOffsetDistance = carLength / 2;
              // Use current rotation or default to 0 if completely still
              const currentAngle = gsap.getProperty(follower, "rotation") || 0;
              const angleRad = currentAngle * (Math.PI / 180);
              const rearAngleRad = angleRad + Math.PI;
              
              const rearX = pos.current.x + Math.cos(rearAngleRad) * rearOffsetDistance;
              const rearY = pos.current.y + Math.sin(rearAngleRad) * rearOffsetDistance;

              trailRef.current.push({
                  x: rearX + (Math.random() - 0.5) * 4,
                  y: rearY + (Math.random() - 0.5) * 4,
                  vx: (Math.random() - 0.5) * 0.2, // Very slow drift
                  vy: -0.5 - Math.random() * 0.5, // Float up
                  age: 0,
                  life: Math.random() * 60 + 40, // Live longer
                  size: Math.random() * 1.5 + 1, // Smaller start
                  color: 'rgba(120, 120, 120, 0.5)' // Lighter, transparent grey
              });
          }
      }

      // Render Particles
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < trailRef.current.length; i++) {
          const p = trailRef.current[i];
          p.age++;
          
          // Physics: Expand and move
          p.x += p.vx;
          p.y += p.vy;
          p.vy -= 0.05; // Rise like smoke
          p.size += 0.2; // Smoke expands
          
          if (p.age > p.life) {
              trailRef.current.splice(i, 1);
              i--;
              continue;
          }

          const alpha = (1 - p.age / p.life) * 0.4; // Fade out, max opacity 0.4
          
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.globalAlpha = 1.0;
      }
    };

    window.addEventListener('mousemove', moveCursor);
    gsap.ticker.add(loop);

    // Hover Listeners
    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    const addListeners = () => {
        const clickables = document.querySelectorAll('a, button, input, textarea, [role="button"], .cursor-pointer');
        // Also add chatbot window elements
        const chatbotElements = document.querySelectorAll('.chatbot-window, .chatbot-window *, .chatbot-button');
        const allElements = [...clickables, ...chatbotElements];
        
        allElements.forEach(el => {
            el.addEventListener('mouseenter', handleHoverStart);
            el.addEventListener('mouseleave', handleHoverEnd);
        });
        return allElements;
    };

    let clickables = addListeners();
    const observer = new MutationObserver(() => {
        clickables.forEach(el => {
            el.removeEventListener('mouseenter', handleHoverStart);
            el.removeEventListener('mouseleave', handleHoverEnd);
        });
        clickables = addListeners();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('resize', resizeCanvas);
      gsap.ticker.remove(loop);
      observer.disconnect();
      clickables.forEach(el => {
          el.removeEventListener('mouseenter', handleHoverStart);
          el.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, [isHovering]);

  // Visual State Changes based on Hover
  useEffect(() => {
    const follower = followerRef.current;
    
    if (isHovering) {
        // Reticle Focus Mode (Car stays visible but gets "Locked On")
        gsap.to(follower, {
            width: 50,
            height: 50,
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)', // Light backing
            borderWidth: '2px',
            borderColor: '#ff3333', // F1 Red targeting
            scale: 1,
            rotation: 0, // Snap to 0 for precision pointing
            duration: 0.3,
            ease: "power2.out"
        });
        


    } else {
        // Free Roam Car Mode
        gsap.to(follower, {
            width: 60, // F1 length
            height: 30, // F1 width
            borderRadius: '0%', 
            backgroundColor: 'transparent',
            borderWidth: '0px', 
            borderColor: 'transparent',
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        

    }
  }, [isHovering]);


  return (
    <>
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9990]"
        // style={{ mixBlendMode: 'difference' }} 
      />
      
      {/* Hidden standard dot */}


      <div
        ref={followerRef}
        className="cursor-follower"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '60px',
          height: '30px',
          pointerEvents: 'none',
          zIndex: 10000, // Above chatbot (9999)
          transform: 'translate(-50%, -50%)',
          willChange: 'transform, width, height',
          mixBlendMode: 'difference',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.8))' // Add shadow for visibility on light backgrounds
        }}
      >
        {/* F1 Car SVG Icon */}
        <div className="car-icon" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 50" fill="currentColor" style={{ width: '100%', height: '100%', transform: 'rotate(0deg)', color: 'white' }}>
                 {/* Detailed F1 Silhouette - Facing Right */}
                 
                 {/* Chassis / Nose Cone */}
                 <path d="M 20,22 L 60,20 L 95,23 L 100,25 L 95,27 L 60,30 L 20,28 Z" />

                 {/* Front Wing (Complex Aerodynamics) */}
                 <path d="M 85,8 L 92,8 L 92,18 L 90,23 L 90,27 L 92,32 L 92,42 L 85,42 L 82,30 L 82,20 Z" />
                 
                 {/* Sidepods (Coke Bottle Shape) */}
                 <path d="M 35,15 L 65,18 L 70,22 L 70,28 L 65,32 L 35,35 L 30,30 L 30,20 Z" />

                 {/* Rear Wing (DRS Flap style) */}
                 <path d="M 0,8 L 12,8 L 14,20 L 14,30 L 12,42 L 0,42 L 4,25 Z" />

                 {/* Front Wheels (Slicks) */}
                 <rect x="68" y="2" width="16" height="10" rx="3" fill="#333" />
                 <rect x="68" y="38" width="16" height="10" rx="3" fill="#333" />

                 {/* Rear Wheels (Wider Slicks) */}
                 <rect x="5" y="0" width="22" height="13" rx="4" fill="#333" />
                 <rect x="5" y="37" width="22" height="13" rx="4" fill="#333" />

                 {/* Cockpit / Halo */}
                 <path d="M 45,22 L 55,22 L 58,25 L 55,28 L 45,28 Z" fill="#111" />
                 
                 {/* Driver Helmet */}
                 <circle cx="52" cy="25" r="3.5" fill="#ff3333" stroke="#fff" strokeWidth="1" />
            </svg>
        </div>
      </div>
    </>
  );
};

export default CustomCursor;
