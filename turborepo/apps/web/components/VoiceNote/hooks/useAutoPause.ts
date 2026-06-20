import { useEffect } from "react";

export function useAutoPause(pause: () => void, active: boolean, phase: string) {
      // Auto pause when leaving the tab/app view
    useEffect(() => {
        const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
            pause();
        }
        };

        const onPageHide = () => {
        pause();
        };

        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('pagehide', onPageHide);

        return () => {
        document.removeEventListener('visibilitychange', onVisibilityChange);
        window.removeEventListener('pagehide', onPageHide);
        };
    }, []);

    // Auto pause when navigating out of voice recording phase
    useEffect(() => {
        if (!active && phase === "recording") {
        pause();
        }
    }, [active, phase]);
}