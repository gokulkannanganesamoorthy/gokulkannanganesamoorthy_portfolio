import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import useSfx from './useSfx';

const chars = 'ABCDEFGHIJKLTUVWXYZ0156789!@#$%^&*()';

export const useScrambleText = (text, trigger = null) => {
  const [display, setDisplay] = useState(text);
  const elementRef = useRef(null);
  const { playScramble, isPlaying } = useSfx();
  const intervalRef = useRef(null);

  const scramble = useCallback((shouldPlaySound = true) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let iteration = 0;
    
    intervalRef.current = setInterval(() => {
      // Play sound every few frames to avoid chaos
      if (shouldPlaySound && iteration % 2 === 0) {
          playScramble();
      }

      setDisplay(
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }

      iteration += 1; // Reveal 1 character per interval (faster)
    }, 30);
  }, [text, playScramble]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: trigger || el,
        start: 'top 80%',
        onEnter: () => scramble(isPlaying),
        onEnterBack: () => scramble(isPlaying)
      });
    });

    return () => {
      ctx.revert();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, trigger, scramble, isPlaying]);

  return { ref: elementRef, text: display, replay: scramble };
};
