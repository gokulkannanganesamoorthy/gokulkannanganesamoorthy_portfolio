import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { professionalData } from '../data';
import { useScrambleText } from '../hooks/useScrambleText';
import useSfx from '../hooks/useSfx';
import CircularAudioToggle from './CircularAudioToggle';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const subTextRef = useRef(null);
  const contentRef = useRef(null);
  
  // Split Logic: Supports "GOKUL KANNAN GANESAMOORTHY" -> "GOKUL KANNAN" / "GANESAMOORTHY"
  const nameParts = professionalData.name.split(' ');
  const line1Text = nameParts.length > 2 ? `${nameParts[0]} ${nameParts[1]}` : nameParts[0];
  const line2Text = nameParts.length > 2 ? nameParts.slice(2).join(' ') : nameParts.slice(1).join(' ');

  const { ref: ref1, text: text1, replay: replay1 } = useScrambleText(line1Text);
  const { ref: ref2, text: text2, replay: replay2 } = useScrambleText(line2Text);
  
  const { isPlaying } = useSfx();

  const replay = () => {
      replay1();
      // Slight stagger for cool factor
      setTimeout(replay2, 50);
  };

  // Force replay when sound is enabled
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        replay();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, replay1, replay2]); // Added specific deps

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Initial State
      gsap.set([textRef.current, subTextRef.current], { autoAlpha: 1 });

      // Initial Reveal
      tl.from(textRef.current, {
        autoAlpha: 0,
        scale: 0.5,
        y: 100,
        duration: 1.5,
        ease: 'power3.out'
      })
      .from(subTextRef.current, {
        autoAlpha: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      }, '-=1');

      // Scroll Effect (Zoom Through with Overlap)
      // We pin the container but allow the next section to be seen by making this transparent at the end
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=100%', // Sync with Work section padding (100vh)
          scrub: 1,
          pin: true,
          pinSpacing: false, // Allow next section to scroll underneath
          anticipatePin: 1,
        }
      });

      scrollTl.to(contentRef.current, {
        scale: 100, 
        opacity: 0, 
        ease: 'power2.inOut', // Smoother acceleration
        duration: 1
      });

      // Ensure container fades out slightly earlier to reveal what's behind
      // Ensure container fades out earlier (starting at ~70%) to reveal Work underneath
      scrollTl.to(containerRef.current, {
        opacity: 0,
        duration: 0.5, // Longer fade for smoothness
        ease: 'power1.inOut' // S curve
      }, '<0.5'); // Start at 0.5s into the 1s main animation (mid-zoom)

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: 'transparent', // Transparent to see behind if needed, but usually covered by white
      position: 'relative',
      overflow: 'hidden',
      zIndex: 10,
      // We use a white background on a pseudo-element or inner div to fade it out
    }}>
      {/* Background layer that fades out */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--color-bg)',
        zIndex: -1
      }} />

      <div ref={contentRef} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'transform, opacity'
      }}>
        <h1 ref={textRef} style={{
          fontSize: 'clamp(3rem, 10vw, 12rem)', // Slightly smaller max to fit two lines better
          fontWeight: 700,
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          marginBottom: '1rem',
          color: 'var(--color-text)',
          background: 'var(--color-text-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          whiteSpace: 'nowrap',
          display: 'flex',
          flexDirection: 'column', // Stacks them
          alignItems: 'center'
        }}>
          {/* Static H1 for SEO */}
          <span className="sr-only">{professionalData.name}</span>
          
          {/* Visual Scramble Effect (Hidden from Screen Readers to avoid double read) */}
          <span aria-hidden="true" ref={ref1}>{text1}</span>
          <span aria-hidden="true" ref={ref2}>{text2}</span>
        </h1>
        
        <p ref={subTextRef} style={{
          fontSize: 'clamp(1.5rem, 3vw, 3rem)',
          fontWeight: 500,
          color: 'var(--color-black)',
          maxWidth: '800px',
          lineHeight: 1.2
        }}>
          Pro. Beyond.
        </p>

        <div style={{ marginTop: '3rem' }}>
          <CircularAudioToggle />
        </div>
      </div>
    </section>
  );
};

export default Hero;
