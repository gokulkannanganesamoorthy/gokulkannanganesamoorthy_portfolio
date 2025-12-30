import React, { useEffect, useState } from 'react'; // Added useState
import Lenis from 'lenis';

import Hero from './components/Hero';
import Work from './components/Work';
import About from './components/About';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import Chatbot from './components/Chatbot';
import GrainOverlay from './components/GrainOverlay';
import Preloader from './components/Preloader';
import ThemeToggle from './components/ThemeToggle';
// import BackgroundMesh from './components/BackgroundMesh'; // Imported but unused in JSX?
import ScrollSparks from './components/ScrollSparks';
import RacingTrail from './components/RacingTrail';

import useSfx from './hooks/useSfx';

function App() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false); // State for mobile detection
  const { revEngine, isPlaying } = useSfx();

  // Handle Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    lenis.on('scroll', (e) => {
      if (isPlaying) {
        const velocity = Math.abs(e.velocity || 0);
        const intensity = Math.min(velocity / 15, 1.0);
        revEngine(intensity);
      }
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isPlaying, revEngine]);

  return (
    <div className="app bg-[var(--color-bg)] min-h-screen">
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Persistent UI Elements */}
      <ThemeToggle />
      <GrainOverlay />
      <RacingTrail />
      <ScrollSparks />
      <Chatbot />
      
      {/* Conditional Cursor */}
      {!isMobile && <CustomCursor />}

      <main>
        <section id="hero">
          <Hero />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="work">
          <Work />
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;