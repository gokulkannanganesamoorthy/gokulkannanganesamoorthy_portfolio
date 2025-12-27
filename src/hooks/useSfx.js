import { useCallback, useContext, useEffect, useRef } from 'react';
import { SfxContext } from '../context/SfxContext';

const useSfx = () => {
  const { isPlaying, toggleSound, getAudioContext } = useContext(SfxContext);
  
  // Persistent ref for the engine sound
  const engineRef = useRef(null);

  const playClick = useCallback(() => {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Safari fix: Ensure context is running before playing
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      ctx.resume().then(() => {
        // Play sound after resume
      }).catch(() => {});
      return; // Exit early if suspended, will play on next interaction
    }

    if (navigator.vibrate) navigator.vibrate(80); 

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  }, [isPlaying, getAudioContext]);

  const playHover = useCallback(() => {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      ctx.resume().catch(() => {});
      return;
    }

    if (navigator.vibrate) navigator.vibrate(50);

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  }, [isPlaying, getAudioContext]);

  // Dynamic Engine Revving
  const revEngine = useCallback((intensity) => {
    if (!isPlaying) return; // Guard at top level
    const ctx = getAudioContext();
    if (!ctx || ctx.state !== 'running') return;
    
    const now = ctx.currentTime;
    const baseFreq = 60 + (intensity * 300);
    const volume = Math.min(intensity + 0.1, 0.5);

    if (intensity > 0.05) {
        if (!engineRef.current) {
            const masterGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            const osc1 = ctx.createOscillator(); osc1.type = 'sawtooth';
            const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.detune.value = 10;
            const osc3 = ctx.createOscillator(); osc3.type = 'square';
            
            const g1 = ctx.createGain(); g1.gain.value = 0.4;
            const g2 = ctx.createGain(); g2.gain.value = 0.4;
            const g3 = ctx.createGain(); g3.gain.value = 0.2;

            osc1.connect(g1); osc2.connect(g2); osc3.connect(g3);
            g1.connect(filter); g2.connect(filter); g3.connect(filter);
            filter.connect(masterGain);
            masterGain.connect(ctx.destination);

            filter.type = 'lowpass'; filter.Q.value = 2;

            osc1.start(); osc2.start(); osc3.start();
            
            engineRef.current = { oscs: [osc1, osc2, osc3], gains: [g1, g2, g3], masterGain, filter };
            masterGain.gain.setValueAtTime(0, now);
            masterGain.gain.linearRampToValueAtTime(volume, now + 0.1);
        }

        const { oscs, masterGain, filter } = engineRef.current;
        oscs[0].frequency.setTargetAtTime(baseFreq, now, 0.1);
        oscs[1].frequency.setTargetAtTime(baseFreq * 1.01, now, 0.1);
        oscs[2].frequency.setTargetAtTime(baseFreq * 0.5, now, 0.1);
        
        const filterFreq = 100 + (intensity * 2000); 
        filter.frequency.setTargetAtTime(filterFreq, now, 0.1);
        masterGain.gain.setTargetAtTime(volume, now, 0.1);

    } else {
        if (engineRef.current) {
            const { oscs, masterGain } = engineRef.current;
            masterGain.gain.setTargetAtTime(0, now, 0.3);
            const currentEngine = engineRef.current;
            setTimeout(() => {
                if (engineRef.current === currentEngine) {
                   oscs.forEach(o => { try{ o.stop(); o.disconnect(); }catch(e){} });
                   masterGain.disconnect();
                   engineRef.current = null;
                }
            }, 350);
        }
    }
  }, [isPlaying, getAudioContext]);

  const playScramble = useCallback(() => {
    if (!isPlaying) return;
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended' || ctx.state === 'interrupted') return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'square';
    const freq = 800 + Math.random() * 400; 
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  }, [isPlaying, getAudioContext]);

  // Cleanup Engine when turned off
  useEffect(() => {
      if (!isPlaying && engineRef.current) {
          const { oscs, masterGain } = engineRef.current;
          const ctx = getAudioContext();
          try {
              masterGain.gain.cancelScheduledValues(0);
              masterGain.gain.setValueAtTime(0, ctx.currentTime);
              setTimeout(() => {
                  oscs.forEach(o => { try{ o.stop(); o.disconnect(); }catch(e){} });
                  masterGain.disconnect();
              }, 50);
          } catch (e) { console.error(e); }
          engineRef.current = null;
      }
  }, [isPlaying, getAudioContext]);

  const enableSound = useCallback(() => {
    if (!isPlaying) {
      toggleSound();
    }
  }, [isPlaying, toggleSound]);

  return { playClick, playHover, revEngine, toggleSound, enableSound, isPlaying, playScramble };
};

export default useSfx;
