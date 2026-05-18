"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import styles from "./AudioWave.module.css";
import { drawWaves, resizeCanvasToDisplay, resizePeaks, drawOverlay } from "../../utils/drawingUtils";

type AudioWaveProps = {
    playedPercent: number,
    handleSkip: (time: number) => void,
    peaks: Array<{min : number, max: number}>,
    isPlaying: boolean,
}

export default function AudioWave ({playedPercent, handleSkip, peaks, isPlaying} : AudioWaveProps) {
    const baseCanvasRef = useRef<HTMLCanvasElement>(null);
    const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
    const baseCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [cssWidth, setCssWidth] = useState(0);
    const [cssHeight, setCssHeight] = useState(0);

    const barWidth = 2;
    const gap = 3;
    const radius = barWidth / 2;

    const resizedPeaks = useMemo(() => {
        return resizePeaks({ peaks, cssWidth, barWidth, gap });
    }, [peaks, cssWidth]);

    useLayoutEffect(() => {
        const canvas = baseCanvasRef.current;
        if (!canvas) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) return;

            setCssWidth(entry.contentRect.width);
            setCssHeight(entry.contentRect.height);
        });

        observer.observe(canvas);

        return () => observer.disconnect();
    }, []);

    // Draw base canvas
    useEffect(() => {
        const canvas = baseCanvasRef.current;
        if (!canvas) return;

        if (!baseCtxRef.current) {
            baseCtxRef.current = canvas.getContext("2d");
        }

        const context = baseCtxRef.current;
        if (!context) return;

        resizeCanvasToDisplay(canvas, context, cssWidth, cssHeight);

        context.clearRect(0, 0, cssWidth, cssHeight);
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, cssWidth, cssHeight);

        drawWaves({
            cssHeight,
            resizedPeaks,
            barWidth,
            gap,
            context,
            radius,
            playedPercent,
        });
    }, [cssWidth, cssHeight, resizedPeaks, playedPercent]);

    // Draw live canvas
    useEffect(() => {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;

        if (!overlayCtxRef.current) {
            overlayCtxRef.current = canvas.getContext("2d");
        }

        const context = overlayCtxRef.current;
        if (!context) return;

        resizeCanvasToDisplay(canvas, context, cssWidth, cssHeight);
        context.clearRect(0, 0, cssWidth, cssHeight);

        drawOverlay({
            cssHeight,
            playedPercent,
            resizedPeaks,
            barWidth,
            gap,
            context,
            radius,
        });
    }, [playedPercent, cssWidth, cssHeight, resizedPeaks]);

    return (
        <div style={{ position: "relative" }}>
            <canvas className={styles.canvas} ref={baseCanvasRef} />
            <canvas className={styles.playCanvas} ref={overlayCanvasRef} />
        </div>
    );
}