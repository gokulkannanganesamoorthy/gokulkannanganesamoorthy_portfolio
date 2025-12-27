import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Texture, Mesh } from 'ogl';
import gsap from 'gsap';

const vertex = `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = `
  precision highp float;
  uniform sampler2D tMap;
  uniform float uTime;
  uniform float uHover;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    
    // Liquid distortion effect
    float noise = sin(uv.y * 10.0 + uTime) * 0.02 + cos(uv.x * 10.0 + uTime) * 0.02;
    uv += noise * uHover;

    // RGB Shift
    float shift = 0.02 * uHover;
    float r = texture2D(tMap, uv + vec2(shift, 0.0)).r;
    float g = texture2D(tMap, uv).g;
    float b = texture2D(tMap, uv - vec2(shift, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

const DistortionImage = ({ src, alt, className, style, loading = 'eager' }) => {
  const containerRef = useRef(null);
  const programRef = useRef(null);
  const rafRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');

  useEffect(() => {
    if (loading === 'eager' || shouldLoad) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { rootMargin: '50px' }); // Load just before entering viewport

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, shouldLoad]);

  useEffect(() => {
    if (!containerRef.current || !shouldLoad) return;
    
    // Disable on touch devices for performance
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.loading = loading; 
      containerRef.current.appendChild(img);
      return;
    }

    const renderer = new Renderer({ 
      alpha: true,
      dpr: Math.min(window.devicePixelRatio, 2) 
    });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);
    
    // Make canvas fill container
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    gl.canvas.style.display = 'block';

    const camera = new Camera(gl);
    camera.position.z = 1;

    const scene = new Transform();

    const texture = new Texture(gl);
    const img = new Image();
    img.src = src;
    img.crossOrigin = 'anonymous';
    
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tMap: { value: texture },
        uTime: { value: 0 },
        uHover: { value: 0 }
      },
      transparent: true
    });
    programRef.current = program;

    const geometry = new Plane(gl);
    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);

    let animationId;
    
    function resize() {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      renderer.setSize(width, height);
      
      // Scale mesh to cover
      if (img.width && img.height) {
        const imageAspect = img.width / img.height;
        const screenAspect = width / height;
        
        if (screenAspect > imageAspect) {
          mesh.scale.x = screenAspect / imageAspect;
          mesh.scale.y = 1;
        } else {
          mesh.scale.x = 1;
          mesh.scale.y = imageAspect / screenAspect;
        }
      }
    }

    img.onload = () => {
      texture.image = img;
      resize();
    };

    window.addEventListener('resize', resize);

    function update(t) {
      animationId = requestAnimationFrame(update);
      program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene, camera });
    }
    animationId = requestAnimationFrame(update);

    // Hover Events
    const handleMouseEnter = () => {
      gsap.to(program.uniforms.uHover, { value: 1, duration: 0.5, ease: 'power2.out' });
    };
    const handleMouseLeave = () => {
      gsap.to(program.uniforms.uHover, { value: 0, duration: 0.5, ease: 'power2.out' });
    };

    containerRef.current.addEventListener('mouseenter', handleMouseEnter);
    containerRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      containerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationId);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (containerRef.current && gl.canvas.parentNode === containerRef.current) {
        containerRef.current.removeChild(gl.canvas);
      }
    };
  }, [src, shouldLoad]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ ...style, position: 'relative', overflow: 'hidden' }} 
      aria-label={alt}
    />
  );
};

export default DistortionImage;
