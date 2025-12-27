import { useState, useEffect } from 'react';

const TypingEffect = ({ text, speed = 50, delay = 0, showCursor = false, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [started, setStarted] = useState(delay === 0);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  // Handle initial delay without mutating the index (prevents duplicate first char)
  useEffect(() => {
    if (delay > 0) {
      const t = setTimeout(() => setStarted(true), delay);
      return () => clearTimeout(t);
    }
    setStarted(true);
  }, [delay]);

  // Typing loop
  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isComplete && text.length > 0) {
      setIsComplete(true);
      if (onComplete) onComplete();
    }
  }, [started, currentIndex, text, speed, isComplete, onComplete]);

  return (
    <span className="typing-text">
      {displayedText}
      {showCursor && (
        <span className={`cursor ${isComplete ? 'blink' : ''}`}>|</span>
      )}
    </span>
  );
};

export default TypingEffect;
