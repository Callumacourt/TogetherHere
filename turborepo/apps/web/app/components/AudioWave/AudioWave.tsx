"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import styles from "./AudioWave.module.css";

type AudioWaveProps = {
    peaks: Array<{min : number, max: number}>,
    analyserNode: AnalyserNode,
    isPlaying: boolean,
}

export default function AudioWave ({peaks, analyserNode, isPlaying} : AudioWaveProps) {
    
    const canvasRef = useRef <HTMLCanvasElement | null> (null);
    const ctxRef = useRef <CanvasRenderingContext2D | null> (null);
    const rafID = useRef<number> (0);
    let cssWidth = useRef<number>(0);
    let cssHeight = useRef<number>(0);
    
    // get real dom dimensions
    useLayoutEffect(() => {
        if (!canvasRef.current) return;
        cssWidth.current = canvasRef.current.clientWidth;
        cssHeight.current = canvasRef.current.clientHeight;
    }, [])

    useEffect(() => {
        if (!canvasRef.current) return
        if (!ctxRef.current) ctxRef.current = canvasRef.current.getContext("2d")
        if (!ctxRef.current) return;
        if (!analyserNode) return;

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const dpr = window.devicePixelRatio || 1;
        canvasRef.current.width = Math.round(cssWidth.current * dpr);
        canvasRef.current.height = Math.round(cssHeight.current * dpr);
        canvasRef.current.style.width = `${cssWidth.current}px`;
        canvasRef.current.style.height = `${cssHeight.current}px`
        ctxRef.current.setTransform(1,0,0,1,0,0)
        ctxRef.current.scale(dpr, dpr);

        const barWidth = 3;
        const gap = 3;
        const radius = barWidth / 2;


        const targetBucketCount = Math.round(cssWidth.current / (barWidth + gap))
        const remappedArray = [];
        const p = peaks.length;
        if (p === 0) return;
        for (let col = 0; col < targetBucketCount; col+=1) {
            const start = Math.floor((col * p)  / targetBucketCount);
            let end = Math.floor((col + 1) * p / targetBucketCount);
            if (end === start) end = Math.min(p, start + 1);
            let min = Infinity;
            let max = -Infinity
            for (let j = start; j < end; j+=1) {
                if (peaks[j].min < min) min = peaks[j].min;
                if (peaks[j].max > max) max = peaks[j].max;
            }
            if (min === Infinity) min = 0;
            if (max === -Infinity) max = 0; 
            remappedArray.push({min : min, max: max});
        }

        function drawBase() {
            const context = ctxRef.current;
            if (!context) return;
            if (!canvasRef.current) return;
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0,0, cssWidth.current, cssHeight.current)
            const center = cssHeight.current / 2;

            for (let i = 0; i < remappedArray.length; i += 1) {
                const x = i * (barWidth + gap);
                const yTop = center - (remappedArray[i].max * center);
                const yBottom = center - (remappedArray[i].min * center);
                const height = Math.max(2, yBottom - yTop);
                context.fillStyle = "rgb(255,255,255)";
                context.beginPath();
                context.roundRect(x, yTop, barWidth, height, radius);
                context.fill();
            }

        }

        drawBase();


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

        return () => {
            cancelAnimationFrame(rafID.current);
        }
    }, [analyserNode, peaks])
    
    return (
        <canvas id="canvas" ref = {canvasRef} width={300} height={150}>
        
        </canvas>
    )
}