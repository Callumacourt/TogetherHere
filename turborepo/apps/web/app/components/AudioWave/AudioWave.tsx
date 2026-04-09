"use client";

import { useEffect, useRef } from "react";
import styles from "./AudioWave.module.css";

export default function AudioWave ({analyserNode, isPlaying} : { analyserNode : AnalyserNode, isPlaying : boolean}) {
    
    const canvasRef = useRef <HTMLCanvasElement | null> (null);
    const ctxRef = useRef <CanvasRenderingContext2D | null> (null);
    const rafID = useRef<number> (1);

    useEffect(() => {
        if (!canvasRef.current) return
        if (!ctxRef.current) ctxRef.current = canvasRef.current.getContext("2d")
        if (!ctxRef.current) return;
        if (!analyserNode) return;

        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        function draw () {
            rafID.current = requestAnimationFrame(() => {
                analyserNode.getByteFrequencyData(dataArray)
                const canvas = ctxRef.current;
                console.log("getting here")
                if (!canvas) return;
                canvas.fillStyle = "rgb(200,200,200)";
                canvas.fillRect(0,0, 100, 100)
                draw();
            })
        }

        draw();

        return () => {
            cancelAnimationFrame(rafID.current);
        }
    }, [analyserNode])

    return (
        <canvas id="canvas" ref = {canvasRef} width={300} height={150}>
        
        </canvas>
    )
}