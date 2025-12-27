import React, { useRef, useState, useEffect } from 'react';
import { Undo, Redo } from 'lucide-react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// Custom Icons to match the reference image exactly
const PencilIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} style={{ transform: 'rotate(15deg)' }}>
        <path d="M17 3L21 7L7 21H3V17L17 3Z" />
        <path d="M15 5L19 9" />
    </svg>
);

const FrameIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <rect x="6" y="6" width="12" height="12" rx="0.5" />
    </svg>
);

const StickyNoteIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="16" height="16" rx="1" />
        <path d="M19 19L15 15L19 19Z" fill="currentColor" />
    </svg>
);

const TextIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Capital T letter */}
        <path d="M6 4H18" />
        <path d="M12 4V20" />
    </svg>
);

const ShapesGridIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {/* Square - top left */}
        <rect x="2" y="2" width="7" height="7" rx="0.5" />
        {/* Circle - top right */}
        <circle cx="16" cy="5.5" r="3" />
        {/* Triangle - bottom left */}
        <path d="M5.5 19L2 15L9 15L5.5 19Z" />
        {/* Arrow pointing diagonally up-right - bottom right */}
        <path d="M13 19L19 13" />
        <path d="M19 13H15" />
        <path d="M19 13V17" />
    </svg>
);

const DoubleDownArrowsIcon = ({ size = 20, strokeWidth = 1.5, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 13L12 18L17 13" />
        <path d="M7 6L12 11L17 6" />
    </svg>
);

const AsphaltOverlay = () => {
    const canvasRef = useRef(null);
    const [tool, setTool] = useState('pointer'); // 'pointer', 'tyre', 'eraser'
    // eslint-disable-next-line no-unused-vars
    const [color, setColor] = useState('#EF4444'); // Default: Soft (Red)
    // eslint-disable-next-line no-unused-vars
    const [lineWidth, setLineWidth] = useState(6);
    const [history, setHistory] = useState([]);
    const [historyStep, setHistoryStep] = useState(-1);

    const ctxRef = useRef(null);
    const isDrawing = useRef(false);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Resize function
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Restore context settings after resize
            const ctx = canvas.getContext('2d');
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctxRef.current = ctx;
            // Note: drawing is lost on resize for simplicity in this version
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Drawing Logic
    const startDrawing = (e) => {
        if (tool === 'pointer') return;
        
        const { offsetX, offsetY } = getCoordinates(e);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        isDrawing.current = true;
        
        ctxRef.current.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color; // Eraser logic handled by composite op
        ctxRef.current.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctxRef.current.lineWidth = tool === 'eraser' ? 30 : lineWidth;
    };

    const draw = (e) => {
        if (tool === 'pointer' || !isDrawing.current) return;
        const { offsetX, offsetY } = getCoordinates(e);
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    };

    const stopDrawing = () => {
        if (tool === 'pointer' || !isDrawing.current) return;
        ctxRef.current.closePath();
        isDrawing.current = false;
        
        // Save to History
        const canvas = canvasRef.current;
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(canvas.toDataURL());
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const getCoordinates = (e) => {
        if (e.nativeEvent.touches) {
            const touch = e.nativeEvent.touches[0];
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            };
        }
        return {
            offsetX: e.nativeEvent.offsetX,
            offsetY: e.nativeEvent.offsetY
        };
    };

    // Actions
    const undo = () => {
        if (historyStep > 0) {
            setHistoryStep(prev => prev - 1);
            restoreCanvas(history[historyStep - 1]);
        } else if (historyStep === 0) {
            clearCanvas(false);
            setHistoryStep(-1);
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            setHistoryStep(prev => prev + 1);
            restoreCanvas(history[historyStep + 1]);
        }
    };

    const restoreCanvas = (dataUrl) => {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
             const ctx = ctxRef.current;
             ctx.globalCompositeOperation = 'source-over';
             ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
             ctx.drawImage(img, 0, 0);
        };
    };

    const clearCanvas = (save = true) => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (save) {
             const newHistory = history.slice(0, historyStep + 1);
             newHistory.push(canvas.toDataURL()); 
             setHistory(newHistory);
             setHistoryStep(newHistory.length - 1);
        }
    };

    return (
        <>
            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`fixed top-0 left-0 w-full h-full transition-colors duration-300 ${tool === 'pointer' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
                style={{ zIndex: 90 }} 
            />

            {/* Persistent Vertical Toolbar - Exact Replica of Reference */}
            <motion.div
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4"
            >
                {/* Top Tools Container */}
                <div className="flex flex-col items-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2 px-1.5 w-[52px]">
                    
                    {/* Pencil Tool */}
                    <ToolButton 
                        active={tool === 'tyre'}
                        onClick={() => setTool('tyre')}
                        tooltip="Draw"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={tool === 'tyre' ? 'text-black' : 'text-gray-700'}>
                             <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                    </ToolButton>

                    {/* Layout/Grid Tool (Placeholder visual) */}
                    <ToolButton 
                        active={false}
                        onClick={() => {}}
                        tooltip="Templates"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                             <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                             <line x1="3" x2="21" y1="9" y2="9" />
                             <line x1="9" x2="9" y1="9" y2="21" />
                        </svg>
                    </ToolButton>

                    {/* Sticky Note Tool (Placeholder visual) */}
                    <ToolButton 
                        active={false}
                        onClick={() => {}}
                        tooltip="Note"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                             <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8l-6-6H8c-1.1 0-2 .9-2 2v16" />
                             <path d="M14 3v5h5" />
                         </svg>
                    </ToolButton>

                    {/* Text Tool (Placeholder visual) */}
                    <ToolButton 
                        active={false}
                        onClick={() => {}}
                        tooltip="Text"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                             <polyline points="4 7 4 4 20 4 20 7" />
                             <line x1="9" x2="15" y1="20" y2="20" />
                             <line x1="12" x2="12" y1="4" y2="20" />
                        </svg>
                    </ToolButton>

                    {/* Shapes Tool (Placeholder visual) */}
                    <ToolButton 
                        active={false}
                        onClick={() => {}}
                        tooltip="Shapes"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                            <rect width="7" height="7" x="3" y="3" rx="1" />
                            <circle cx="17.5" cy="6.5" r="3.5" />
                            <polygon points="5 14 2 20 8 20" />
                             {/* Small arrow for dropdown feel */}
                            <polyline points="14 17 17 20 20 17" /> 
                        </svg>
                    </ToolButton>

                     {/* More/Chevron Tool */}
                    <ToolButton 
                        active={false}
                        onClick={() => {}}
                        tooltip="More"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                            <polyline points="7 10 12 15 17 10" />
                        </svg>
                    </ToolButton>

                </div>

                {/* Bottom Undo/Redo Container */}
                <div className="flex flex-col items-center bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-2 px-1.5 w-[52px]">
                     <ToolButton 
                        active={false} 
                        onClick={undo} 
                        disabled={historyStep < 0}
                        tooltip="Undo"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={historyStep < 0 ? "text-gray-300" : "text-gray-700"}>
                            <path d="M9 14 4 9l5-5" />
                            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                        </svg>
                    </ToolButton>
                     <ToolButton 
                        active={false} 
                        onClick={redo} 
                        disabled={historyStep === history.length - 1}
                        tooltip="Redo"
                    >
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={historyStep === history.length - 1 ? "text-gray-300" : "text-gray-700"} style={{ transform: 'scaleX(-1)' }}>
                             <path d="M9 14 4 9l5-5" />
                             <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                        </svg>
                    </ToolButton>
                </div>

            </motion.div>

             {/* Mode Indicator/Exit Button - Since there's no visible "Cursor" tool in the ref image, we might need a way to stop drawing. 
                 The reference image implies the 'Pencil' toggles drawing. 
                 If Pencil is active -> Drawing. 
                 If Pencil click again or something else -> Cursor? 
                 For now, we keep the 'Pointer' concept but map it to deselecting the pencil. 
             */}
             <AnimatePresence>
                {tool === 'tyre' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                         className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] flex items-center gap-3 px-4 py-2 bg-black text-white rounded-full shadow-lg cursor-pointer hover:bg-black/90"
                         onClick={() => setTool('pointer')}
                    >
                        <MousePointer2 size={16} />
                        <span className="text-xs font-medium uppercase tracking-wider">
                            Exit Canvas
                        </span>
                    </motion.div>
                )}
             </AnimatePresence>

        </>
    );
};

// Helper Component for Buttons
const ToolButton = ({ children, active, onClick, disabled, className = "", tooltip }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`group relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center 
                ${active ? 'bg-black/5' : 'hover:bg-gray-50'} 
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            {children}
            {/* Tooltip */}
            {tooltip && (
                <span className="absolute left-full ml-3 px-2 py-1.5 rounded-md bg-gray-900 shadow-xl text-[10px] font-medium text-white tracking-wide opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                    {tooltip}
                </span>
            )}
        </button>
    );
};

export default AsphaltOverlay;
