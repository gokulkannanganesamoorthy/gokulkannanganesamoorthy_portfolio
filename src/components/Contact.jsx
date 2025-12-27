import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScrambleText } from '../hooks/useScrambleText';
import useSfx from '../hooks/useSfx';

gsap.registerPlugin(ScrollTrigger);

// Racing line animation class
class RacingLine {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.points = [];
    this.maxPoints = 100;
    this.lineWidth = 2;
  }

  addPoint(x, y) {
    this.points.push({ x, y, opacity: 1 });
    if (this.points.length > this.maxPoints) {
      this.points.shift();
    }
  }

  update(x, y, speed) {
    // Add point with spacing based on speed
    if (speed > 1) {
      this.addPoint(x, y);
    }

    // Fade out old points
    this.points.forEach((point, index) => {
      const age = index / this.points.length;
      point.opacity = 1 - age;
    });
  }

  draw() {
    if (this.points.length < 2) return;

    this.ctx.strokeStyle = 'var(--color-text)';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 1; i < this.points.length; i++) {
      const prev = this.points[i - 1];
      const curr = this.points[i];
      
      this.ctx.globalAlpha = curr.opacity * 0.3;
      this.ctx.lineWidth = this.lineWidth;
      
      this.ctx.beginPath();
      this.ctx.moveTo(prev.x, prev.y);
      this.ctx.lineTo(curr.x, curr.y);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1;
  }

  clear() {
    this.points = [];
  }
}

const Contact = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const canvasRef = useRef(null);
  const fieldRef = useRef(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const racingLineRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const { ref: headerRef, text: headerText } = useScrambleText("Pit Lane.");
  const { playClick, playHover } = useSfx();

  const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE';

  // Initialize canvas and racing line
  useEffect(() => {
    if (!canvasRef.current || !fieldRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = fieldRef.current.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    racingLineRef.current = new RacingLine(canvas, ctx);
    
    const handleResize = () => {
      if (!fieldRef.current) return;
      const newRect = fieldRef.current.getBoundingClientRect();
      canvas.width = newRect.width;
      canvas.height = newRect.height;
      racingLineRef.current.clear();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Racing line animation loop
  useEffect(() => {
    if (!canvasRef.current || !racingLineRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate mouse speed
      const dx = mousePosRef.current.x - prevMousePosRef.current.x;
      const dy = mousePosRef.current.y - prevMousePosRef.current.y;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      // Update racing line
      racingLineRef.current.update(mousePosRef.current.x, mousePosRef.current.y, speed);
      racingLineRef.current.draw();
      
      // Update previous position
      prevMousePosRef.current = { ...mousePosRef.current };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Mouse tracking for racing line
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!fieldRef.current) return;
      const rect = fieldRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };
    
    const field = fieldRef.current;
    if (field) {
      field.addEventListener('mousemove', handleMouseMove);
      return () => field.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Scroll animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'top 50%',
            scrub: 1
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitStatus) setSubmitStatus(null);
  };

  const handleFocus = (e) => {
    playHover();
    e.target.style.borderColor = '#ff3333'; // F1 Red
    e.target.style.boxShadow = '0 0 0 4px rgba(255, 51, 51, 0.1)';
    e.target.style.transform = 'scale(1.01)';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'rgba(0,0,0,0.1)';
    e.target.style.boxShadow = 'none';
    e.target.style.transform = 'scale(1)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    playClick();

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `Contact Form Submission from ${formData.name}`,
          from_name: formData.name,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitStatus(null), 5000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" ref={containerRef} className="section-padding container" style={{ position: 'relative', zIndex: 5 }}>
      <div style={{ 
        maxWidth: '700px', 
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '4rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h2 ref={headerRef} style={{ 
            fontSize: 'clamp(2.5rem, 6vw, 4rem)', 
            fontWeight: 600, 
            marginBottom: '1rem',
            color: 'var(--color-text)',
            letterSpacing: '-0.015em'
          }}>
            {headerText}
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--color-accent)',
            lineHeight: 1.5,
            letterSpacing: '-0.022em'
          }}>
            Enter the pit lane. Let's talk strategy.
          </p>
        </div>

        {/* Form with F1 Racing Theme */}
        <div
          ref={fieldRef}
          style={{
            position: 'relative',
            background: 'var(--color-card-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '30px',
            border: '2px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderTop: '2px solid var(--glass-highlight)',
            overflow: 'hidden'
          }}
        >
          {/* Checkered Flag Pattern Background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.03,
            backgroundImage: `
              linear-gradient(45deg, var(--color-text) 25%, transparent 25%),
              linear-gradient(-45deg, var(--color-text) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, var(--color-text) 75%),
              linear-gradient(-45deg, transparent 75%, var(--color-text) 75%)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
            pointerEvents: 'none',
            zIndex: 1
          }} />

          {/* Racing Line Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          {/* Racing Stripes (Side accents) */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #ff3333 0%, transparent 50%, #ff3333 100%)',
            opacity: 0.6,
            zIndex: 1
          }} />
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '4px',
            height: '100%',
            background: 'linear-gradient(180deg, #ff3333 0%, transparent 50%, #ff3333 100%)',
            opacity: 0.6,
            zIndex: 1
          }} />

          {/* Form Content */}
          <form 
            ref={formRef}
            onSubmit={handleSubmit}
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '3rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Driver Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  position: 'relative',
                  zIndex: 3
                }}
              />
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Radio Frequency
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  position: 'relative',
                  zIndex: 3
                }}
              />
            </div>

            {/* Message Field */}
            <div>
              <label 
                htmlFor="message"
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: '0.5rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
                rows={6}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  border: '2px solid rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  lineHeight: 1.5,
                  position: 'relative',
                  zIndex: 3
                }}
              />
            </div>

            {/* Submit Button - F1 Style */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '1.25rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #ff3333 0%, #cc0000 100%)', // F1 Red gradient
                border: 'none',
                borderRadius: '12px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                fontFamily: 'var(--font-primary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                WebkitAppearance: 'none',
                appearance: 'none',
                position: 'relative',
                zIndex: 3,
                boxShadow: '0 4px 16px rgba(255, 51, 51, 0.3)',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                playHover();
                if (!isSubmitting) {
                  e.target.style.transform = 'scale(1.02)';
                  e.target.style.boxShadow = '0 6px 24px rgba(255, 51, 51, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 16px rgba(255, 51, 51, 0.3)';
              }}
            >
              {isSubmitting ? 'Sending...' : 'Send Message →'}
            </button>

            {/* Status Message */}
            {submitStatus === 'success' && (
              <div style={{
                padding: '1rem',
                background: 'rgba(52, 199, 89, 0.1)',
                border: '2px solid rgba(52, 199, 89, 0.3)',
                borderRadius: '12px',
                color: '#34C759',
                fontSize: '0.95rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500
              }}>
                ✓ Message sent! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div style={{
                padding: '1rem',
                background: 'rgba(255, 59, 48, 0.1)',
                border: '2px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '12px',
                color: '#FF3B30',
                fontSize: '0.95rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 3,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 500
              }}>
                ✗ Transmission failed. Please try again or email directly.
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
