import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CinematicImageRevealProps {
    src: string | null;
    alt: string;
    className?: string;
    onComplete?: () => void;
}

export const CinematicImageReveal: React.FC<CinematicImageRevealProps> = ({ src, alt, className = "", onComplete }) => {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        if (!src) return;

        // Sequence:
        // 0: Initial (Hidden)
        // 1: Scanlines / Grid (0.5s)
        // 2: Silhouette / Noise (1.0s)
        // 3: Full Reveal (1.5s)
        
        const t1 = setTimeout(() => setStage(1), 500);
        const t2 = setTimeout(() => setStage(2), 1500);
        const t3 = setTimeout(() => {
            setStage(3);
            if (onComplete) onComplete();
        }, 2500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [src]);

    if (!src) return null;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Base Image - Revealed at Stage 3 */}
            <motion.img 
                src={src} 
                alt={alt}
                className={`w-full h-full object-cover transition-all duration-1000 ${stage >= 3 ? 'opacity-100 grayscale-0 blur-0' : 'opacity-0 grayscale blur-xl'}`}
            />

            {/* Overlay: Digital Noise / Silhouette (Stage 2) */}
            <AnimatePresence>
                {stage === 2 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay"
                    >
                        <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay: Scanning Grid (Stage 1 & 2) */}
            <AnimatePresence>
                {stage >= 1 && stage < 3 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-10 pointer-events-none"
                    >
                        <div className="w-full h-full border-2 border-cyan-500/30 relative">
                            <motion.div 
                                initial={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                            />
                            <div className="absolute top-2 left-2 text-[10px] font-mono text-cyan-500">SCANNING TARGET...</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
