import React, { useEffect } from 'react';
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
import BackgroundMesh from './components/BackgroundMesh';
import ScrollSparks from './components/ScrollSparks';
import RacingTrail from './components/RacingTrail';



import useSfx from './hooks/useSfx';

function App() {
  const [loading, setLoading] = React.useState(true);
  const { revEngine, isPlaying } = useSfx();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenis.on('scroll', (e) => {
      if (isPlaying) {
        // e.velocity is pixels per frame (approx)
        // Normalize: Typical fast scroll is ~10-20. Very fast is 50+.
        // We want revving to kick in easily.
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
      <ThemeToggle />
      <GrainOverlay />
      <RacingTrail />
      <CustomCursor />
      <ScrollSparks />
      <Chatbot />


      <main>
        <div id="hero">
            <Hero />
        </div>
        <div id="work">
            <Work />
        </div>
        <div id="about">
            <About />
        </div>

      </main>
      <Footer />
    </div>
  );
}

export default App;
