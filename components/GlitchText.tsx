import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface GlitchTextProps {
    text: string;
    className?: string;
    as?: React.ElementType;
    triggerOnHover?: boolean;
    scrambleOnMount?: boolean;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

export const GlitchText: React.FC<GlitchTextProps> = ({ 
    text, 
    className = "", 
    as: Component = "span",
    triggerOnHover = true,
    scrambleOnMount = false
}) => {
    const [displayText, setDisplayText] = useState(text);
    const [isGlitching, setIsGlitching] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const originalText = text;

    const scramble = () => {
        let iteration = 0;
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            setDisplayText(prev => 
                originalText
                    .split("")
                    .map((char, index) => {
                        if (index < iteration) {
                            return originalText[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("")
            );

            if (iteration >= originalText.length) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                setIsGlitching(false);
            }

            iteration += 1 / 3;
        }, 30);
    };

    useEffect(() => {
        if (scrambleOnMount) {
            scramble();
        }
    }, []);

    const handleMouseEnter = () => {
        if (triggerOnHover && !isGlitching) {
            setIsGlitching(true);
            scramble();
        }
    };

    return (
        <Component 
            className={`${className} ${isGlitching ? 'animate-glitch-subtle' : ''}`}
            onMouseEnter={handleMouseEnter}
        >
            {displayText}
        </Component>
    );
};
