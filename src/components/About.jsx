import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { professionalData } from '../data';
import { useScrambleText } from '../hooks/useScrambleText';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const containerRef = useRef(null);
  const headerWrapperRef = useRef(null); // Ref for pinning
  const sectionsRef = useRef([]);
  
  const { ref: headerRef, text: headerText } = useScrambleText("Holographic Data.");
  const { ref: overviewRef, text: overviewText } = useScrambleText("Overview");
  const { ref: capabilitiesRef, text: capabilitiesText } = useScrambleText("Capabilities");
  const { ref: experienceRef, text: experienceText } = useScrambleText("Experience");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pinning the Header
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: headerWrapperRef.current,
        pinSpacing: false, // Don't push content down, just pin the header
        scrub: true
      });

      // Holographic Stack Effect
      sectionsRef.current.forEach((el, index) => {
        gsap.fromTo(el,
          { 
            opacity: 0, 
            scale: 0.9, 
            y: 50, 
            filter: 'blur(10px)' 
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 1
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  return (
    <section id="about" ref={containerRef} className="section-padding container" style={{ position: 'relative', zIndex: 5 }}>
      <div className="about-responsive-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 2fr', 
        gap: '4rem',
        alignItems: 'start'
      }}>
        <div ref={headerWrapperRef} style={{ position: 'relative', height: 'fit-content', zIndex: 0 }}>
          <h2 ref={headerRef} style={{ fontSize: '3rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>{headerText}</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', opacity: 0.8 }}>
            Decoded specifications.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem', position: 'relative', zIndex: 10 }}>
          {/* About Text */}
          <div ref={addToRefs} className="about-card">
            <h3 ref={overviewRef} style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-black)' }}>{overviewText}</h3>
            <p style={{ fontSize: '1.8rem', lineHeight: 1.4, fontWeight: 500 }}>
              {professionalData.aboutpara}
            </p>
          </div>

          {/* Services as Specs */}
          <div ref={addToRefs} className="about-card">
            <h3 ref={capabilitiesRef} style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--color-black)' }}>{capabilitiesText}</h3>
            <div style={{ display: 'grid', gap: '2rem' }}>
              {professionalData.services.map((service) => (
                <div key={service.id} className="about-responsive-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr', 
                  borderBottom: '1px solid #e5e5e5', 
                  paddingBottom: '1.5rem',
                  gap: '1rem' 
                }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{service.title}</h4>
                  <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: 1.5 }}>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Resume / Experience */}
           <div ref={addToRefs} className="about-card">
            <h3 ref={experienceRef} style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--color-black)' }}>{experienceText}</h3>
            <div style={{ display: 'grid', gap: '2rem' }}>
              {professionalData.resume.experiences.map((exp) => (
                <div key={exp.id} className="about-responsive-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 2fr', 
                  borderBottom: '1px solid #e5e5e5', 
                  paddingBottom: '1.5rem',
                  gap: '1rem' 
                }}>
                  <div>
                     <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{exp.dates}</h4>
                     <p style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>{exp.type}</p>
                  </div>
                  <div>
                    <h5 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{exp.position}</h5>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.2rem', color: 'var(--color-text)' }}>
                        {exp.bullets.map((bullet, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.4 }}>{bullet}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
