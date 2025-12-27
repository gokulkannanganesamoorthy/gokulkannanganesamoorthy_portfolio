import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import useSfx from '../hooks/useSfx';

const MagneticButton = ({ children, className = "", speed = 1, tol = 100, scale = 1.1, ...props }) => {
  const ref = useRef(null);
  const { playHover, playClick } = useSfx();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power4.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power4.out" });

    const mouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      const dist = Math.sqrt(x * x + y * y);

      if (dist < tol) {
        xTo(x * speed);
        yTo(y * speed);
        gsap.to(el, { scale: scale, duration: 0.3 });
      } else {
        xTo(0);
        yTo(0);
        gsap.to(el, { scale: 1, duration: 0.3 });
      }
    };

    const mouseLeave = () => {
      xTo(0);
      yTo(0);
      gsap.to(el, { scale: 1, duration: 0.3 });
    };

    const handleMouseEnter = () => {
        playHover();
    };

    const handleClick = () => {
        playClick();
    };

    window.addEventListener("mousemove", mouseMove);
    el.addEventListener("mouseleave", mouseLeave);
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      el.removeEventListener("mouseleave", mouseLeave);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("click", handleClick);
    };
  }, [speed, tol, scale, playHover, playClick]);

  const Component = props.href ? 'a' : 'button';

  return (
    <Component ref={ref} className={className} {...props}>
      {children}
    </Component>
  );
};

export default MagneticButton;
