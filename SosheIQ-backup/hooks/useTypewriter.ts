
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TypewriterOptions {
  speed?: number; // Kept for interface compatibility, but not used for typing delay
  onComplete?: () => void;
  enabled?: boolean; 
}

interface AnimatedChar {
  char: string;
  key: string;
  isVisible: boolean;
}

export const useLetterFadeInTypewriter = (
  text: string,
  options: TypewriterOptions = {}
) => {
  const { onComplete, enabled = true } = options;
  const [animatedChars, setAnimatedChars] = useState<AnimatedChar[]>([]);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!enabled) {
      // If not enabled, display the full text statically (all visible) or clear it
      setAnimatedChars(text ? text.split('').map(char => ({ char, key: uuidv4(), isVisible: true })) : []);
      setIsTypingComplete(true);
      if (onCompleteRef.current && text) {
        onCompleteRef.current();
      }
      return;
    }

    // When text or enabled status changes, set all characters to visible immediately
    const newChars = text ? text.split('').map(char => ({ char, key: uuidv4(), isVisible: true })) : [];
    setAnimatedChars(newChars);
    setIsTypingComplete(true); // Typing is considered complete immediately

    if (text && text.length > 0) {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    } else {
      // No text, also considered complete
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, [text, enabled]); // Rerun effect if text or enabled status changes

  return { animatedChars, isTypingComplete };
};
