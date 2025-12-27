import React, { createContext, useState, useCallback, useEffect } from 'react';

export const SfxContext = createContext({
  isPlaying: false,
  toggleSound: () => {},
  unlockAudio: () => Promise.resolve(false),
  getAudioContext: () => null,
});

// Singleton outside component to prevent re-creation
let audioCtxSingleton;

const getAudioContext = () => {
  if (!audioCtxSingleton) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtxSingleton = new AudioContext();
  }
  return audioCtxSingleton;
};

export const SfxProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const unlockAudio = useCallback(() => {
    const ctx = getAudioContext();
    
    // Safari/iOS requires resume to be called directly from user interaction
    if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
      return ctx.resume().then(() => {
        // Safari fix: Create and play a silent buffer after resume
        try {
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch (e) {
          // Ignore errors in buffer creation
        }
        return true;
      }).catch(e => {
        console.error('AudioContext resume failed:', e);
        return false;
      });
    }
    
    // If already running, ensure it stays active
    if (ctx.state === 'running') {
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
        // Ignore errors
      }
    }
    
    return Promise.resolve(true);
  }, []);

  const toggleSound = useCallback(() => {
    if (!isPlaying) {
        unlockAudio().then(() => {
            setIsPlaying(true);
        });
    } else {
        setIsPlaying(false);
    }
  }, [isPlaying, unlockAudio]);

  // Global Unlock Listener
  useEffect(() => {
    const globalUnlock = () => {
        unlockAudio().then((success) => {
            if (success) {
                // Do NOT force isPlaying to true here. 
                // Only clean up listeners. The user must manually toggle sound OR we rely on initial state.
                // However, without auto-play on first click, sound might be confusingly off.
                // We should only set true IF it hasn't been set yet (maybe check against a 'userInteraction' flag?)
                // For now, removing the auto-enable to respect explicit "OFF" state if user toggles it off.
                // Actually, let's just make sure we don't OVERRIDE.
                // But initially isPlaying is false.
                // Let's rely on the toggle button for explicit control.
                
                document.removeEventListener('click', globalUnlock);
                document.removeEventListener('touchstart', globalUnlock);
                document.removeEventListener('keydown', globalUnlock);
            }
        });
    };

    document.addEventListener('click', globalUnlock);
    document.addEventListener('touchstart', globalUnlock);
    document.addEventListener('keydown', globalUnlock);

    if (audioCtxSingleton && audioCtxSingleton.state === 'running') {
        setIsPlaying(true);
    }

    return () => {
        document.removeEventListener('click', globalUnlock);
        document.removeEventListener('touchstart', globalUnlock);
        document.removeEventListener('keydown', globalUnlock);
    };
  }, [unlockAudio]);

  return (
    <SfxContext.Provider value={{ isPlaying, toggleSound, unlockAudio, getAudioContext }}>
      {children}
    </SfxContext.Provider>
  );
};
