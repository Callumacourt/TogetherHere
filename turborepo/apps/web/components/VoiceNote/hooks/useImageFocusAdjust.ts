import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

type FocusPoint = {
    x: number;
    y: number;
};

type UseImageFocusAdjustOptions = {
    imageUrl: string | null;
    aspectRatio: number | null;
    focus: FocusPoint;
    frameAspectRatio?: number;
    desktopMinWidth?: number;
};

type UseImageFocusAdjustResult = {
    frameRef: RefObject<HTMLDivElement | null>;
    isAdjusting: boolean;
    isDragging: boolean;
    shouldContain: boolean;
    canAdjust: boolean;
    draftObjectPosition: string;
    beginAdjust: () => void;
    cancelAdjust: () => void;
    applyAdjust: (onApply: (focus: FocusPoint) => void) => void;
    stopAdjusting: () => void;
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLDivElement>) => void;
};

export default function useImageFocusAdjust({
    imageUrl,
    aspectRatio,
    focus,
    frameAspectRatio = 4 / 5,
    desktopMinWidth = 1024,
}: UseImageFocusAdjustOptions): UseImageFocusAdjustResult {
    const frameRef = useRef<HTMLDivElement | null>(null);
    const dragStartRef = useRef<{ x: number; y: number; focusX: number; focusY: number } | null>(null);

    const [isDesktop, setIsDesktop] = useState(false);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [draftFocus, setDraftFocus] = useState<FocusPoint>(focus);

    const tolerance = 0.02;
    const isPortrait = !!aspectRatio && aspectRatio < 1;
    const shouldContain = isDesktop && isPortrait;
    const hasOverflow = !!aspectRatio && !shouldContain && Math.abs(aspectRatio - frameAspectRatio) > tolerance;
    const canAdjust = !!imageUrl && hasOverflow;
    const canMoveX = !!aspectRatio && aspectRatio > frameAspectRatio + tolerance;
    const canMoveY = !!aspectRatio && aspectRatio < frameAspectRatio - tolerance;
    const draftObjectPosition = `${draftFocus.x}% ${draftFocus.y}%`;

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    useEffect(() => {
        if (!imageUrl) {
            setIsAdjusting(false);
            setIsDragging(false);
            setDraftFocus({ x: 50, y: 50 });
            dragStartRef.current = null;
        }
    }, [imageUrl]);

    useEffect(() => {
        if (!isAdjusting) {
            setDraftFocus(focus);
        }
    }, [focus, isAdjusting]);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${desktopMinWidth}px)`);
        const sync = () => setIsDesktop(mediaQuery.matches);

        sync();
        mediaQuery.addEventListener("change", sync);

        return () => mediaQuery.removeEventListener("change", sync);
    }, [desktopMinWidth]);

    useEffect(() => {
        if (!canAdjust && isAdjusting) {
            setIsAdjusting(false);
            setIsDragging(false);
            dragStartRef.current = null;
        }
    }, [canAdjust, isAdjusting]);

    function beginAdjust() {
        if (!canAdjust) return;
        setDraftFocus(focus);
        setIsAdjusting(true);
    }

    function cancelAdjust() {
        setDraftFocus(focus);
        setIsAdjusting(false);
    }

    function applyAdjust(onApply: (nextFocus: FocusPoint) => void) {
        onApply(draftFocus);
        setIsAdjusting(false);
    }

    function stopAdjusting() {
        setIsAdjusting(false);
        setIsDragging(false);
        dragStartRef.current = null;
    }

    function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
        if (!canAdjust || !isAdjusting) return;

        e.preventDefault();

        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            focusX: draftFocus.x,
            focusY: draftFocus.y,
        };

        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (!isAdjusting || !canAdjust || !dragStartRef.current || !frameRef.current) return;

        e.preventDefault();

        const rect = frameRef.current.getBoundingClientRect();
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        setDraftFocus({
            x: canMoveX ? clamp(dragStartRef.current.focusX - (deltaX / rect.width) * 100, 0, 100) : dragStartRef.current.focusX,
            y: canMoveY ? clamp(dragStartRef.current.focusY - (deltaY / rect.height) * 100, 0, 100) : dragStartRef.current.focusY,
        });
    }

    function releaseDrag(e: ReactPointerEvent<HTMLDivElement>) {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
        }

        dragStartRef.current = null;
        setIsDragging(false);
    }

    useEffect(() => {
        if (!isDragging) return;

        const previousUserSelect = document.body.style.userSelect;
        document.body.style.userSelect = "none";

        const onWindowPointerMove = (event: PointerEvent) => {
            if (!isAdjusting || !canAdjust || !dragStartRef.current || !frameRef.current) return;

            if (event.cancelable) {
                event.preventDefault();
            }

            const rect = frameRef.current.getBoundingClientRect();
            const deltaX = event.clientX - dragStartRef.current.x;
            const deltaY = event.clientY - dragStartRef.current.y;

            setDraftFocus({
                x: canMoveX ? clamp(dragStartRef.current.focusX - (deltaX / rect.width) * 100, 0, 100) : dragStartRef.current.focusX,
                y: canMoveY ? clamp(dragStartRef.current.focusY - (deltaY / rect.height) * 100, 0, 100) : dragStartRef.current.focusY,
            });
        };

        const stopWindowDrag = () => {
            dragStartRef.current = null;
            setIsDragging(false);
        };

        window.addEventListener("pointermove", onWindowPointerMove, { passive: false });
        window.addEventListener("pointerup", stopWindowDrag);
        window.addEventListener("pointercancel", stopWindowDrag);

        return () => {
            window.removeEventListener("pointermove", onWindowPointerMove);
            window.removeEventListener("pointerup", stopWindowDrag);
            window.removeEventListener("pointercancel", stopWindowDrag);
            document.body.style.userSelect = previousUserSelect;
        };
    }, [isDragging, isAdjusting, canAdjust, canMoveX, canMoveY]);

    return {
        frameRef,
        isAdjusting,
        isDragging,
        shouldContain,
        canAdjust,
        draftObjectPosition,
        beginAdjust,
        cancelAdjust,
        applyAdjust,
        stopAdjusting,
        onPointerDown,
        onPointerMove,
        onPointerUp: releaseDrag,
        onPointerCancel: releaseDrag,
    };
}
