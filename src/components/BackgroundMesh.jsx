import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const BackgroundMesh = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const orbs = ['.orb-1', '.orb-2', '.orb-3'];

      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          x: 'random(-200, 200, 5)',
          y: 'random(-200, 200, 5)',
          scale: 'random(0.8, 1.2)',
          duration: 'random(10, 20)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 2,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="absolute inset-0 opacity-40 dark:opacity-20">
        {/* Soft Blue Orb */}
        <div className="orb-1 absolute top-[20%] left-[20%] w-[600px] h-[600px] rounded-full blur-[120px]" 
             style={{ background: 'radial-gradient(circle, rgba(100, 149, 237, 0.4) 0%, rgba(100, 149, 237, 0) 70%)' }} />
        
        {/* Violet Orb */}
        <div className="orb-2 absolute top-[60%] right-[20%] w-[500px] h-[500px] rounded-full blur-[100px]" 
             style={{ background: 'radial-gradient(circle, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0) 70%)' }} />
        
        {/* Lime Hint */}
        <div className="orb-3 absolute bottom-[-10%] left-[40%] w-[400px] h-[400px] rounded-full blur-[80px]" 
             style={{ background: 'radial-gradient(circle, rgba(204, 255, 0, 0.15) 0%, rgba(204, 255, 0, 0) 70%)' }} />
      </div>
      
      {/* Noise Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
};

export default BackgroundMesh;
