import { useState, useEffect } from 'react';

export function useMobileLandscape() {
    const [isMobileLandscape, setIsMobileLandscape] = useState(false);
    useEffect(() => {
        function check() {
            const isMobile = window.innerWidth <= 900;
            const isLandscape = window.innerWidth > window.innerHeight;
            setIsMobileLandscape(isMobile && isLandscape);
        }
        check();
        window.addEventListener('resize', check);
        window.addEventListener('orientationchange', check);
        return () => {
            window.removeEventListener('resize', check);
            window.removeEventListener('orientationchange', check);
        };
    }, []);
    return isMobileLandscape;
}
