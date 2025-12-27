import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSfx from '../hooks/useSfx';

const SoundEnabler = () => {
  const [visible, setVisible] = useState(true);
  const { enableSound } = useSfx();

  const handleEnable = () => {
    enableSound();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={handleEnable}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.5 } }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group fixed bottom-8 left-1/2 -translate-x-1/2 outline-none"
          style={{ zIndex: 9999 }}
        >
          {/* Liquid Chrome Blob */}
          <motion.div
            className="relative flex h-16 w-40 items-center justify-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #e0e0e0 0%, #ffffff 50%, #a0a0a0 100%)',
              borderRadius: '30px',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.8), inset 0 -2px 5px rgba(0,0,0,0.2)',
            }}
            animate={{
              borderRadius: ["30px 30px 30px 30px", "35px 25px 35px 25px", "25px 35px 25px 35px", "30px 30px 30px 30px"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent opacity-50" style={{ clipPath: 'ellipse(150% 100% at 50% -20%)' }} />

            {/* Text Content */}
            <div className="relative z-10 flex items-center gap-2">
              <span className="font-bold tracking-widest text-black/80" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem' }}>
                Want AUDIO ?
              </span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-black/80"
              />
            </div>

            {/* Interactive Ripple on Hover */}
            <motion.div
              className="absolute inset-0 bg-white/30"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.5, opacity: 1 }}
              transition={{ duration: 0.4 }}
              style={{ borderRadius: 'inherit' }}
            />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default SoundEnabler;
