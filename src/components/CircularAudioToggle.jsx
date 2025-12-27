import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useSfx from '../hooks/useSfx';

const CircularAudioToggle = () => {
  const { toggleSound, isPlaying, playClick } = useSfx();
  const containerRef = useRef(null);
  const textRingRef = useRef(null);
  const coreRef = useRef(null);
  const beatTween = useRef(null);
  const rotateTween = useRef(null);

  // Magnetic Hover Effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const xTo = gsap.quickTo(container, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(container, "y", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      // Magnetic pull strength
      xTo(x * 0.3);
      yTo(y * 0.3);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Rotation Animation
  useEffect(() => {
    if (!textRingRef.current) return;

    // Create a timeline that rotates infinitely
    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "none" } });
    
    tl.to(textRingRef.current, {
      rotation: 360,
      duration: 10,
    });

    rotateTween.current = tl;

    return () => {
      tl.kill();
    };
  }, []);

  // Adjust rotation speed based on state
  useEffect(() => {
    if (rotateTween.current) {
      gsap.to(rotateTween.current, {
        timeScale: isPlaying ? 5 : 2.5, // Speed up when ON
        duration: 0.5
      });
    }
  }, [isPlaying]);

  // Beat Animation (Core)
  useEffect(() => {
    if (!coreRef.current) return;

    if (isPlaying) {
      beatTween.current = gsap.to(coreRef.current, {
        scale: 1.5,
        duration: 0.4,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut"
      });
    } else {
      if (beatTween.current) beatTween.current.kill();
      gsap.to(coreRef.current, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out"
      });
    }

    return () => {
      if (beatTween.current) beatTween.current.kill();
    };
  }, [isPlaying]);

  const handleClick = () => {
    toggleSound();

    // Squish Effect
    gsap.to(containerRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleClick}
      className="relative cursor-pointer rounded-full shadow-lg transition-transform duration-300"
      style={{ width: '120px', height: '120px', zIndex: 999 }}
    >
      
      {/* Container for centering */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Rotating Text Ring */}
        <div ref={textRingRef} className="absolute inset-0 w-full h-full">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {/* Background Ring */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              fill="none" 
              strokeWidth="20"
              className="stroke-[var(--color-text)] transition-colors duration-300"
            />
            
            <path
              id="circlePath"
              d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
              fill="none"
            />
            <text className="font-bold uppercase tracking-widest fill-[var(--color-bg)] text-[10.5px]">
              <textPath href="#circlePath" startOffset="0%" spacing="auto" textLength="232">
                {isPlaying ? "SOUND ON • SOUND ON • SOUND ON • " : "SOUND OFF • SOUND OFF • SOUND OFF • "}
              </textPath>
            </text>
          </svg>
        </div>

        {/* Inner Core */}
        <div 
          ref={coreRef}
          className={`w-4 h-4 rounded-full transition-colors duration-300 bg-[var(--color-bg)] ${isPlaying ? '' : 'opacity-50'}`}
        />
      </div>
    </div>
  );
};

export default CircularAudioToggle;
