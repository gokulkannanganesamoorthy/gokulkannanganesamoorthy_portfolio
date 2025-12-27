import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          // Fade out preloader
          gsap.to(containerRef.current, {
            yPercent: -100,
            duration: 1.5,
            ease: 'power4.inOut',
            onComplete: onComplete
          });
        }
      });

      // Counter Animation
      let count = 0;
      const interval = setInterval(() => {
        count += Math.floor(Math.random() * 10) + 1;
        if (count > 100) count = 100;
        setCounter(count);
        
        if (count === 100) {
          clearInterval(interval);
          tl.to(textRef.current, {
            opacity: 0,
            duration: 0.5,
            delay: 0.5
          });
        }
      }, 30);

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div ref={containerRef} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000',
      color: '#fff',
      zIndex: 99999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <div ref={textRef} style={{
        fontSize: '10vw',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.05em'
      }}>
        {counter}%
      </div>
    </div>
  );
};

export default Preloader;
