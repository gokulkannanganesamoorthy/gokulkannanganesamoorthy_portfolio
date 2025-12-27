import React, { useState, useRef, useEffect } from 'react';
import { generateAIResponse } from '../services/ai';
import { submitContactForm } from '../services/contact';
import gsap from 'gsap';
import useSfx from '../hooks/useSfx';
import ScrollSparks from './ScrollSparks';




// ... (keep usage of dynamicFallbacks if needed for offline mode, but mainly use AI)

const Chatbot = () => {
    // UI State
    const [isOpen, setIsOpen] = useState(false);

    // Conversation State
    const [messages, setMessages] = useState([
      {
        role: 'assistant',
        content: "Hi! I'm Gokul's AI assistant. You can ask me about his **projects**, **skills**, or just say **'Hire him'** to get in touch!"
      }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Contact Mode State
    const [contactMode, setContactMode] = useState(null); // 'name', 'email', 'message', 'submitting', 'done', null
    const [contactData, setContactData] = useState({ name: '', email: '', message: '' });

    // Refs
    const messagesEndRef = useRef(null);
    const chatWindowRef = useRef(null);
    const chatScrollRef = useRef(null);
    const buttonRef = useRef(null);
    const { playClick, playHover, playSuccess } = useSfx();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Animate chat window open/close
  useEffect(() => {
    if (isOpen && chatWindowRef.current) {
      gsap.fromTo(chatWindowRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);



  const toggleChat = () => {
    playClick();
    setIsOpen(!isOpen);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add User Message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // --- Contact Mode Logic ---
    if (contactMode) {
        handleContactFlow(userMessage);
        return;
    }

    // --- Normal AI Logic ---
    setIsLoading(true);

    // Check for Contact Intent Trigger
    if (['hire', 'contact', 'email', 'touch', 'project'].some(w => userMessage.toLowerCase().includes(w))) {
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: "Awesome! Let's get you connected. First, **what's your name?**" }]);
            setContactMode('name');
            setIsLoading(false);
        }, 500);
        return;
    }

    try {
        const historyForAi = messages.slice(1); 
        const response = await generateAIResponse(historyForAi, userMessage);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
        setMessages(prev => [...prev, { role: 'assistant', content: "My connection dropped. 📡 Try again?" }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleContactFlow = async (input) => {
      setIsLoading(true);
      // Simulate "typing" delay
      await new Promise(r => setTimeout(r, 600));

      if (contactMode === 'name') {
          setContactData(prev => ({ ...prev, name: input }));
          setMessages(prev => [...prev, { role: 'assistant', content: `Nice to meet you, ${input}! 👋 \n**What's your email address?**` }]);
          setContactMode('email');
      } 
      else if (contactMode === 'email') {
           setContactData(prev => ({ ...prev, email: input }));
           setMessages(prev => [...prev, { role: 'assistant', content: "Got it. 📧 \n**How can Gokul help you?** (Tell me about your project)" }]);
           setContactMode('message');
      }
      else if (contactMode === 'message') {
           setContactData(prev => ({ ...prev, message: input }));
           setMessages(prev => [...prev, { role: 'assistant', content: "Perfect. Sending your details to the pit crew... 🏎️💨" }]);
           setContactMode('submitting');
           
           // Submit to Web3Forms
           const finalData = { ...contactData, message: input };
           const result = await submitContactForm(finalData);
           
           if (result.success) {
               playSuccess?.();
               setMessages(prev => [...prev, { role: 'assistant', content: "✅ **Message Sent!** \nGokul will get back to you shortly. Want to ask me something else while you wait?" }]);
               setContactMode(null); // Reset to AI mode
               setContactData({ name: '', email: '', message: '' });
           } else {
               setMessages(prev => [...prev, { role: 'assistant', content: `❌ **Error**: ${result.message}. \n\nYou can email him directly at: gokulkannan.dev@gmail.com` }]);
               setContactMode(null);
           }
      }
      setIsLoading(false);
  };

  // Dynamic Phrases
  const thinkingPhrases = [
      "Want to know more? 💬", 
      "Have queries? 🤔", 
      "Hire me? 🚀", 
      "Say Hi! 👋"
  ];
  const [thinkingIndex, setThinkingIndex] = useState(0);

  // Cycle phrases
  useEffect(() => {
      if (isOpen) return;
      const interval = setInterval(() => {
          setThinkingIndex(prev => (prev + 1) % thinkingPhrases.length);
      }, 3000);
      return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <>
      {/* Dynamic Thinking Bubble */}
      {!isOpen && (
        <div style={{
            position: 'fixed',
            bottom: '7rem', // Above the button (which is at 2rem + 60px height)
            right: '2rem',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            padding: '0.5rem 1rem',
            borderRadius: '20px 20px 0 20px', // Speech bubble shape
            fontFamily: 'var(--font-primary)',
            fontSize: '0.9rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #000',
            zIndex: 9998,
            whiteSpace: 'nowrap',
            animation: 'float 3s ease-in-out infinite'
        }}>
            {thinkingPhrases[thinkingIndex]}
            {/* Little Arrow */}
            <div style={{
                position: 'absolute',
                bottom: '-6px',
                right: '24px',
                width: '12px',
                height: '12px',
                background: 'var(--color-bg)',
                borderRight: '1px solid #000',
                borderBottom: '1px solid #000',
                transform: 'rotate(45deg)'
            }} />
        </div>
      )}

      {/* Chat Trigger Button */}
      <button
        ref={buttonRef}
        onClick={toggleChat}
        className="chatbot-button"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'var(--color-text)',
          color: 'var(--color-bg)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
          zIndex: 9998,
          transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
          WebkitAppearance: 'none',
          appearance: 'none',
          fontFamily: 'var(--font-primary)'
        }}
        onMouseEnter={(e) => {
          playHover();
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.15)';
        }}
        aria-label="Toggle chatbot"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div
          ref={chatWindowRef}
          className="chatbot-window"
          style={{
            position: 'fixed',
            bottom: '6rem',
            right: '2rem',
            width: '400px',
            maxWidth: 'calc(100vw - 4rem)',
            height: '600px',
            maxHeight: 'calc(100vh - 8rem)',
            background: 'var(--color-card-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '30px',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderTop: '1px solid var(--glass-highlight)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden',
            position: 'fixed' // Ensure relative context for absolute ScrollSparks if needed, but here acts as fixed window
          }}
        >
          {/* Scroll Sparks for Chatbot */}
          <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '60px', pointerEvents: 'none', zIndex: 10 }}>
             <ScrollSparks scrollContainerRef={chatScrollRef} />
          </div>

          {/* Chat Header */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--color-text)',
              color: 'var(--color-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--color-text)',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {contactMode ? 'Contact Support' : 'AI Assistant'}
              </h3>
              <p style={{
                fontSize: '0.75rem',
                color: 'var(--color-black)',
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {contactMode ? 'Gokul is listening...' : 'Ask me anything'}
              </p>
            </div>
            {/* Clear Chat Option? */}
            <button 
                onClick={() => setMessages([{role: 'assistant', content: "Chat cleared. fresh start! 🧹"}])}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}
                title="Clear Chat"
            >
                🧹
            </button>
          </div>

          {/* Messages Container */}
          <div ref={chatScrollRef} className="chatbot-messages" data-lenis-prevent style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: message.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: message.role === 'user' 
                    ? 'var(--color-text)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  color: message.role === 'user' 
                    ? 'var(--color-bg)' 
                    : 'var(--color-text)',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  letterSpacing: '-0.01em',
                  fontFamily: 'var(--font-primary)',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-line'
                }}>
                  {message.content.split(/(\*\*.*?\*\*)/).map((part, i) => 
                      part.startsWith('**') && part.endsWith('**') 
                          ? <strong key={i}>{part.slice(2, -2)}</strong> 
                          : part
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start',
                maxWidth: '80%'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '20px 20px 20px 4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-text)',
                    opacity: 0.4,
                    animation: 'bounce 1.4s infinite'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-text)',
                    opacity: 0.4,
                    animation: 'bounce 1.4s infinite 0.2s'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--color-text)',
                    opacity: 0.4,
                    animation: 'bounce 1.4s infinite 0.4s'
                  }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--glass-border)',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={contactMode ? `Type your ${contactMode}...` : "Type your message..."}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-primary)',
                  color: 'var(--color-text)',
                  background: 'var(--color-bg)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '20px',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  letterSpacing: '-0.01em'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-text)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0,0,0,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'var(--color-text)',
                  color: 'var(--color-bg)',
                  border: 'none',
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  fontFamily: 'var(--font-primary)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputValue.trim()) {
                    playHover();
                    e.target.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                }}
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Animations & Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        /* Custom scrollbar for chat */
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chatbot-messages::-webkit-scrollbar-track {
          background: transparent;
        }

        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }

        /* Fix cursor visibility on chatbot */
        .chatbot-window * {
          cursor: auto !important;
        }

        @media (max-width: 640px) {
          .chatbot-window {
            bottom: 1rem !important;
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            height: calc(100vh - 8rem) !important;
          }
          .chatbot-button {
            bottom: 1rem !important;
            right: 1rem !important;
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
