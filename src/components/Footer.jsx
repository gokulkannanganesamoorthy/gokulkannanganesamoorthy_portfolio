import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { professionalData } from '../data';
import MagneticButton from './MagneticButton';
import useSfx from '../hooks/useSfx';
import { useScrambleText } from '../hooks/useScrambleText';

gsap.registerPlugin(ScrollTrigger);



const Footer = () => {
  const containerRef = useRef(null);
  const portalRef = useRef(null);
  const contentRef = useRef(null);
  // Refs for the two crossing flags
  const leftFlagRef = useRef(null);
  const rightFlagRef = useRef(null);
  
  const { isPlaying } = useSfx();
  const { ref: nameRef, text: scrambledName, replay: replayName } = useScrambleText(professionalData.name);

  useEffect(() => {
    if (isPlaying) {
        replayName();
    }
  }, [isPlaying, replayName]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Portal Reveal: Crossed Flags Wipe (Diagonal)
      // Two flags enter from bottom corners, cross in the center, and exit top corners
      
      // Animation Timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'top top',
          scrub: 1, // Smooth standard scrub
        }
      });

      // Left Flag: Bottom-Left to Top-Right
      // REMOVED Skew for "Realism" / "Broadcast Style"
      tl.fromTo(leftFlagRef.current,
        { x: '-100%', y: '100%' }, 
        { 
          x: '100%', 
          y: '-100%', 
          ease: 'power1.inOut' // Linear/Smooth motion, no bounce/elasticity
        }, 
        0
      );

      // Right Flag: Bottom-Right to Top-Left
      tl.fromTo(rightFlagRef.current,
        { x: '100%', y: '100%' }, 
        { 
          x: '-100%', 
          y: '-100%', 
          ease: 'power1.inOut'
        }, 
        0
      );

      // Content Fade In
      // Content fades in as the flags cross and leave
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 40%', 
            end: 'top 10%',
            scrub: 1
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Shared Flag Style
  const flagStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200vmax', // Use vmax to ensure coverage on any screen aspect ratio
    height: '200vmax',
    // F1 Checkered Pattern WITH Fabric Texture Overlay
    // Layer 1: Fabric Folds (Linear Gradient with transparency)
    // Layer 2: Checkered Pattern (Conic Gradient)
    backgroundImage: `
      repeating-linear-gradient(
        45deg,
        rgba(0,0,0,0) 0px,
        rgba(0,0,0,0.15) 40px,
        rgba(255,255,255,0.05) 80px,
        rgba(0,0,0,0) 120px
      ),
      conic-gradient(from 0deg, var(--footer-text) 0deg 90deg, transparent 90deg 180deg, var(--footer-text) 180deg 270deg, transparent 270deg)
    `,
    backgroundColor: 'var(--footer-bg)',
    backgroundSize: '200px 200px, 100px 100px', // Folds overlay matches scale roughly
    boxShadow: '0 0 50px rgba(0,0,0,0.8)', // Strong shadow for depth
    zIndex: 3,
    willChange: 'transform'
  };

  return (
    <footer ref={containerRef} style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      marginTop: '10rem',
      backgroundColor: 'var(--footer-bg)'
    }}>
      {/* Left Flag: Rotated 45deg to wipe diagonally */}
      <div ref={leftFlagRef} style={{
        ...flagStyle,
        transform: 'translate(-50%, -50%) rotate(45deg)', // Centered base, rotated
      }} />

      {/* Right Flag: Rotated -45deg to wipe diagonally */}
      <div ref={rightFlagRef} style={{
        ...flagStyle,
        transform: 'translate(-50%, -50%) rotate(-45deg)',
      }} />

      <div ref={contentRef} className="container footer-content-center" style={{
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        color: 'var(--footer-text)'
      }}>
        <h2 ref={nameRef} style={{ 
          fontSize: 'clamp(2rem, 8vw, 6rem)', 
          fontWeight: 600, 
          marginBottom: '2rem',
          width: '100%',
          padding: '0 1rem',
          wordBreak: 'break-word'
        }}>
           <span className="sr-only">{professionalData.name}</span>
           <span aria-hidden="true">{scrambledName}</span>
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            <MagneticButton href={`mailto:${professionalData.socials.find(s => s.title === 'Email').link.replace('mailto:', '')}`} 
               className="apple-link" style={{ color: 'var(--footer-text)', display: 'inline-block', padding: '1rem' }}>
              Email <span>›</span>
            </MagneticButton>

            {professionalData.socials.filter(s => s.title !== 'Email').map((social) => (
              <MagneticButton key={social.id} href={social.link} target="_blank" rel="noopener noreferrer" 
                 className="apple-link" style={{ color: 'var(--footer-text)', display: 'inline-block', padding: '1rem' }}>
                {social.title} <span>›</span>
              </MagneticButton>
            ))}
        </div>

        <p className="footer-copyright-mobile" style={{ fontSize: '0.8rem', color: '#888' }}>
  <span>
    Copyright © {new Date().getFullYear()} <span href="#">{professionalData.name}</span>.
  </span>
  <span className="only-mobile-break"> All rights reserved.</span>
</p>
      </div>
    </footer>
  );
};

export default Footer;
