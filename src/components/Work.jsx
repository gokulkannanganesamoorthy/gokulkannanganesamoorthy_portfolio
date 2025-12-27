import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { professionalData } from '../data';
import MagneticButton from './MagneticButton';
import SpotlightCard from './SpotlightCard';
import './CircularGallery.css';

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Reveal (Emerging from back)
      gsap.fromTo(headerRef.current,
        { scale: 0.5, opacity: 0, z: -500 },
        {
          scale: 1,
          opacity: 1,
          z: 0,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom', // Start when top of section hits bottom of viewport
            end: 'top 20%',
            scrub: 1
          }
        }
      );

      // Zero Gravity Cards
      cardsRef.current.forEach((el, index) => {
        // Random starting positions for "floating" feel
        const randomX = (Math.random() - 0.5) * 200;
        const randomY = (Math.random() - 0.5) * 200;
        const randomRotation = (Math.random() - 0.5) * 30;

        gsap.fromTo(el,
          { 
            opacity: 0, 
            x: randomX, 
            y: 100 + randomY, 
            rotation: randomRotation, 
            scale: 0.8 
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.5,
            ease: 'back.out(1.2)', // Bouncy arrival
            scrollTrigger: {
              trigger: el,
              start: 'top 110%', // Start before it enters viewport
              end: 'top 70%',
              scrub: 1
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <section id="work" ref={containerRef} className="section-padding container" style={{ 
      position: 'relative', 
      zIndex: 5,
      paddingTop: '100vh', // Content starts below fold, slides up perfectly as Hero pins for 100% height
      perspective: '1000px' // For 3D effects
    }}>
      <div ref={headerRef} style={{ marginBottom: '8rem', textAlign: 'center', willChange: 'transform, opacity' }}>
        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 600, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Selected Work.
        </h2>
        <p style={{ fontSize: '1.8rem', color: 'var(--color-black)' }}>
          Zero Gravity. Infinite Possibilities.
        </p>
      </div>
      
      <div className="bento-grid" style={{ perspective: '1000px' }}>
        {professionalData.projects.map((project, index) => (
          <SpotlightCard 
            key={project.id} 
            ref={addToRefs} 
            className="bento-card"
            spotlightColor="rgba(134, 134, 139, 0.2)" // Apple-like gray glow
            // We need to pass the style prop down or handle it in the wrapper. 
            // Since SpotlightCard has its own styles, we might need to adjust.
            // Let's modify SpotlightCard to accept style or merge it.
            // Actually, for now, let's just apply the grid styles to the wrapper.
          >
            <div 
             style={{
              gridColumn: index === 0 ? 'span 2' : 'span 1',
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transformStyle: 'preserve-3d', 
              willChange: 'transform',
              height: '100%' // Ensure full height
            }}>
              <div style={{ marginBottom: '2rem', zIndex: 2, position: 'relative', transform: 'translateZ(20px)', padding: '2rem' }}>
                <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 600 }}>{project.title}</h3>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-black)', lineHeight: 1.4 }}>
                  {project.description}
                </p>
              </div>
              
              <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                zIndex: 1,
                transform: 'translateZ(0px)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 40%)',
                  zIndex: 2
                }} />
              </div>

              <div style={{ marginTop: '2rem', textAlign: 'right', zIndex: 2, position: 'relative', transform: 'translateZ(30px)', padding: '2rem' }}>
                 <MagneticButton href={project.url} target="_blank" rel="noopener noreferrer" className="apple-link" style={{ fontSize: '1.2rem', display: 'inline-block' }}>
                  View Project <span>›</span>
                </MagneticButton>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
};

export default Work;
