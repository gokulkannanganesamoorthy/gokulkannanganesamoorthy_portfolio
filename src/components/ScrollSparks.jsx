import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';

const ScrollSparks = ({ scrollContainerRef = null }) => {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const rafRef = useRef(null);
    const scrollState = useRef({ progress: 0, velocity: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const container = scrollContainerRef?.current || window;
        const isWindow = container === window;

        // Configuration
        let width = canvas.width = 60;
        let height = canvas.height = isWindow ? window.innerHeight : container.clientHeight;

        const handleResize = () => {
             if (isWindow) {
                height = canvas.height = window.innerHeight;
             } else {
                height = canvas.height = container.clientHeight;
             }
        };
        
        // Listen to resize on window even for container to be safe, or ResizeObserver for container
        if (isWindow) {
             window.addEventListener('resize', handleResize);
        } else {
             // Simple fallback for container resize
             window.addEventListener('resize', handleResize);
        }

        let lastScrollY = isWindow ? window.scrollY : container.scrollTop;
        
        const updateScrollAuth = () => {
            let currentY, totalHeight, viewportHeight;

            if (isWindow) {
                currentY = window.scrollY;
                viewportHeight = window.innerHeight;
                totalHeight = document.documentElement.scrollHeight - viewportHeight;
            } else {
                currentY = container.scrollTop;
                viewportHeight = container.clientHeight;
                totalHeight = container.scrollHeight - viewportHeight;
            }

            const progress = totalHeight > 0 ? Math.min(Math.max(currentY / totalHeight, 0), 1) : 0;
            const velocity = Math.abs(currentY - lastScrollY);
            lastScrollY = currentY;

            scrollState.current = { progress, velocity };
        };

        // Render Loop
        const render = () => {
            // Clear entire canvas
            ctx.clearRect(0, 0, width, height);

            const { progress, velocity } = scrollState.current;
            
            // Calculate Thumb Position
            const thumbY = progress * (height - 36); // Subtract tyre height to keep it in bounds
            // Align to right edge
            const tyreWidth = 14; 
            const tyreHeight = 36;
            const thumbX = width - tyreWidth - 2; 

            // Draw Tyre (Top View / Tread View)
            ctx.save();
            ctx.translate(thumbX, thumbY);
            
            // 1. Tyre Body (Black Rubber)
            ctx.beginPath();
            ctx.roundRect(0, 0, tyreWidth, tyreHeight, 6);
            ctx.fillStyle = '#1a1a1a';
            ctx.fill();
            
            // 2. Tread Pattern (Intermediate "Grooves")
            ctx.beginPath();
            ctx.roundRect(0, 0, tyreWidth, tyreHeight, 6);
            ctx.clip(); // Clip treads to tyre body

            ctx.strokeStyle = '#333'; // Dark grey grooves
            ctx.lineWidth = 2;
            
            const treadSpacing = 8;
            const scrollOffset = (lastScrollY * 0.5) % treadSpacing;
            
            // Draw moving lines
            for (let y = -treadSpacing; y < tyreHeight + treadSpacing; y += treadSpacing) {
                const lineY = y + scrollOffset;
                
                // V-shape tread
                ctx.beginPath();
                ctx.moveTo(0, lineY - 4);
                ctx.lineTo(tyreWidth / 2, lineY);
                ctx.lineTo(tyreWidth, lineY - 4);
                ctx.stroke();
            }
            
            // Highlight / Shine (Glossy rubber)
            ctx.beginPath();
            ctx.moveTo(4, 0);
            ctx.lineTo(4, tyreHeight);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();

            // Spark Emission
            const extraSparks = Math.min(Math.floor(velocity / 2), 20);
            const totalSparks = (Math.random() < 0.3) ? 1 : extraSparks;

            if ((totalSparks > 0 || velocity > 1) && velocity > 0.1) {
                 const count = velocity > 1 ? extraSparks : 1;
                 
                for (let i = 0; i < count; i++) {
                    particles.current.push({
                        // Emit from bottom/back of tyre contact patch
                        x: width - 2, 
                        y: thumbY + tyreHeight - 4 + (Math.random() * 4), 
                        vx: -(Math.random() * 1.5 + 0.5), // Drift LEFT slowly
                        vy: (Math.random() - 0.5) * 1.5, // Billow
                        life: 1.0,
                        color: Math.random() > 0.5 ? '#cccccc' : '#eeeeee', // Grey/White smoke
                        size: Math.random() * 3 + 2 // Start puffy
                    });
                }
            } else {
                // IDLE SMOKE (Minimal)
                if (Math.random() > 0.92) { // Less frequent than moving
                    particles.current.push({
                        x: width - 2,
                        y: thumbY + tyreHeight - 6 + (Math.random() * 4),
                        vx: -(Math.random() * 0.5 + 0.1), // Very slow drift left
                        vy: (Math.random() - 0.5) * 0.5, // Slight wobble
                        life: 1.2, // Lives longer
                        color: 'rgba(200, 200, 200, 0.4)', // Faint grey
                        size: Math.random() * 2 + 1 // Smaller
                    });
                }
            }

            // Update & Draw Particles
            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];
                
                p.x += p.vx;
                p.y += p.vy;
                p.vy -= 0.02; // Slight rise (smoke)
                p.size += 0.2; // Expand
                p.life -= 0.03; // Fade out slowly

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    i--;
                    continue;
                }

                ctx.beginPath();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Keep loop running
            rafRef.current = requestAnimationFrame(render);
        };

        // If using window, we can use GSAP ticker, else use requestAnimationFrame loop or manual scroll listener
        // Because container scroll might not happen on every frame, a scroll listener is better for 'updateScrollAuth' in container mode
        // But for consistency let's stick to GSAP ticker for the update logic as it handles checking scrollTop nicely.
        gsap.ticker.add(updateScrollAuth);
        rafRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            gsap.ticker.remove(updateScrollAuth);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [scrollContainerRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: scrollContainerRef ? 'absolute' : 'fixed',
                top: 0,
                right: 0,
                width: '60px',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999, // Should be above content in chatbot
            }}
        />
    );
};

export default ScrollSparks;
