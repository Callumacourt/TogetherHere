"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./AudioWave.module.css";
import { drawWaves, resizeCanvasToDisplay, resizePeaks } from "../../utils/drawingUtils";

type AudioWaveProps = {
    peaks: Array<{min : number, max: number}>,
    analyserNode: AnalyserNode | null,
    isPlaying: boolean,
}

export default function AudioWave ({peaks, analyserNode, isPlaying} : AudioWaveProps) {
    
    const canvasRef = useRef <HTMLCanvasElement> (null);
    const ctxRef = useRef <CanvasRenderingContext2D | null> (null);
    const rafID = useRef<number> (0);
    const [cssWidth, setCssWidth] = useState(0);
    const [cssHeight, setCssHeight] = useState(0);
    
    // get real dom dimensions
    useLayoutEffect(() => {
        const observer = new ResizeObserver((entries) => {
            if (!canvasRef.current) return;
            if (!entries[0]) return;
            setCssWidth(entries[0].contentRect.width);
            setCssHeight(entries[0].contentRect.height);
            console.log('calling')
        })

        if (canvasRef.current === null) return;
        observer.observe(canvasRef.current);
        return () => {
            observer.disconnect();
        }
    }, [])

    useEffect(() => {
        if (!canvasRef.current) return;
        if (!ctxRef.current) ctxRef.current = canvasRef.current.getContext("2d");
        if (!ctxRef.current) return;
        if (!analyserNode) return;

        resizeCanvasToDisplay(canvasRef.current, ctxRef.current, cssWidth, cssHeight);

        const barWidth = 2;
        const gap = 3;
        const radius = barWidth / 2;

        const resizedPeaks = resizePeaks({peaks, cssWidth, barWidth, gap});

        function drawBase() {
            const context = ctxRef.current;
            if (!context) return;
            if (!canvasRef.current) return;
            if (!resizedPeaks.length) return;
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0,0, cssWidth, cssHeight)
            drawWaves({cssHeight, resizedPeaks, barWidth, gap, context, radius});
        }

        drawBase();

        }, [peaks, cssWidth, cssHeight, analyserNode])
    

        // live drawing - when playing audio
        /*function draw () {
            analyserNode.getByteFrequencyData(dataArray)
            const context = ctxRef.current;
            if (!context) return;
            if (!canvasRef.current) return;
            context.fillStyle = "rgb(200,200,200)";
            context.fillRect(0,0, cssWidth.current, cssHeight.current)

            const barWidth = (100 / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                context.fillStyle = `rgb(${barHeight + 100} 50 50)`;
                context.fillRect(x, 100 - barHeight / 2, barWidth, barHeight / 2);
                x += barWidth + 1;
                }
            }

            rafID.current = requestAnimationFrame(draw);
            */

    return (
        <canvas className = {styles.canvas} ref = {canvasRef}/>
    )
}