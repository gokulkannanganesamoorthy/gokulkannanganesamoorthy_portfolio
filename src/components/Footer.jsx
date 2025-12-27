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
  
  const { isPlaying } = useSfx();
  const { ref: nameRef, text: scrambledName, replay: replayName } = useScrambleText(professionalData.name);

  useEffect(() => {
    if (isPlaying) {
        replayName();
    }
  }, [isPlaying, replayName]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Portal Reveal
      // The portal starts small and expands to fill the screen
      gsap.fromTo(portalRef.current,
        { scale: 0, borderRadius: '100%' },
        {
          scale: 50, // Massive scale to fill screen
          borderRadius: '0%',
          duration: 1,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'top top',
            scrub: 1
          }
        }
      );

      // Content Fade In
      gsap.fromTo(contentRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={containerRef} style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      overflow: 'hidden',
      marginTop: '10rem'
    }}>
      {/* The Portal Background */}
      <div ref={portalRef} style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100px',
        height: '100px',
        backgroundColor: '#000', // Black portal
        transform: 'translate(-50%, -50%)',
        zIndex: 1
      }} />

      <div ref={contentRef} className="container" style={{ 
        textAlign: 'center', 
        position: 'relative', 
        zIndex: 2,
        color: '#fff' // White text on black portal
      }}>
        <h2 ref={nameRef} style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 600, marginBottom: '2rem' }}>
          {scrambledName}
        </h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
           <MagneticButton href={`mailto:${professionalData.socials.find(s => s.title === 'Email').link.replace('mailto:', '')}`} 
               className="apple-link" style={{ color: '#fff', display: 'inline-block', padding: '1rem' }}>
              Email <span>›</span>
            </MagneticButton>

            {professionalData.socials.filter(s => s.title !== 'Email').map((social) => (
              <MagneticButton key={social.id} href={social.link} target="_blank" rel="noopener noreferrer" 
                 className="apple-link" style={{ color: '#fff', display: 'inline-block', padding: '1rem' }}>
                {social.title} <span>›</span>
              </MagneticButton>
            ))}
        </div>

        <p style={{ fontSize: '0.8rem', color: '#888' }}>
          Copyright © {new Date().getFullYear()} {professionalData.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
