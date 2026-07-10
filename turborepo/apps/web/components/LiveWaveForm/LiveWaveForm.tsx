import { useEffect, useRef } from "react";
import { resizeCanvasToDisplay } from "../AudioWave/Utils/drawingUtils";
import styles from "./LiveWaveForm.module.css"

type Props = {
    stream: MediaStream,
    isRecording: boolean

}

export default function LiveWaveForm ({ stream, isRecording } : Props) {

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const rafRef = useRef<number | null>(null);
    const canvasEleRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const mediaStreamRef = useRef<AudioNode | null>(null);
    const peaksRef = useRef<number[]>([])

    const barWidth = 2;
    const gap = 3;
    // Boosts quiet speech so bars visibly react; clamped so shouting can't overflow
    const gain = 2.5;

    function getCanvasCssSize(canvas: HTMLCanvasElement) {
        const dpr = window.devicePixelRatio || 1;
        const cssWidth = canvas.clientWidth || Math.round(canvas.width / dpr);
        const cssHeight = canvas.clientHeight || Math.round(canvas.height / dpr);
        return { cssWidth, cssHeight };
    }

    function drawWaves() {
        const ctx = canvasCtxRef.current;
        const canvas = canvasEleRef.current;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
        if (!ctx || !canvas || !analyser || !dataArray) return;

        const { cssWidth, cssHeight } = getCanvasCssSize(canvas);
        if (cssWidth <= 0 || cssHeight <= 0) return;

        rafRef.current = requestAnimationFrame(drawWaves);
        analyser.getByteTimeDomainData(dataArrayRef.current as Uint8Array<ArrayBuffer>);

        ctx.clearRect(0, 0, cssWidth, cssHeight);
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2;

        const centerY = cssHeight / 2;

        let max = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const sample = dataArray[i];
            if (sample === undefined) continue;
            max = Math.max(max, sample);
        }

        peaksRef.current.push(max);
        const maxBars = Math.floor(cssWidth / (barWidth + gap));
        if (peaksRef.current.length > maxBars) peaksRef.current.shift();
    
        for (let i = 0; i < peaksRef.current.length; i++) {
            const bar = peaksRef.current[i];
            if (bar === undefined) continue;
            const amplitude = Math.min(1, (Math.abs(bar - 128) / 128) * gain);
            const barHeight = Math.max(2, amplitude * cssHeight * 0.9);

            ctx.fillRect(i * (barWidth + gap), centerY - barHeight / 2, barWidth, barHeight);
        }
    }

    function drawBase() {
        const ctx = canvasCtxRef.current;
        const canvas = canvasEleRef.current;
        if (!ctx || !canvas) return;

        const { cssWidth, cssHeight } = getCanvasCssSize(canvas);
        if (cssWidth <= 0 || cssHeight <= 0) return;

        ctx.clearRect(0, 0, cssWidth, cssHeight);
        ctx.fillStyle = '#ffffff';
        const centerY = cssHeight / 2;
        const maxBars = Math.floor(cssWidth / (barWidth + gap))
        for (let i = 0; i < maxBars; i++) {
           const barHeight = 2;
            ctx.fillRect(i * (barWidth + gap), centerY - barHeight / 2, barWidth, barHeight);
        }
    }
    

    
    useEffect(() => {
        if (!audioContextRef.current) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            mediaStreamRef.current = source;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

            const canvas = canvasEleRef.current;
            const ctx = canvasCtxRef.current;
            if (canvas && ctx) {
                resizeCanvasToDisplay(canvas, ctx, canvas.offsetWidth, canvas.offsetHeight);
            };

            const audioCtx = audioContextRef.current!;

            if (isRecording) {
                audioContext.resume().then(() => {
                    if (!rafRef.current) drawWaves();
                }).catch(() => {});
            } else if (!isRecording) {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                }
                if (audioContext.state === 'running') audioContext.suspend().catch(() => {});
                drawBase();
            }
            
            return () => {
                if (rafRef.current) {
                    cancelAnimationFrame(rafRef.current);
                    rafRef.current = null;
                }
                try { mediaStreamRef.current?.disconnect();} catch {() => {}};
                try { analyserRef.current?.disconnect(); } catch{() => {}};
                if (audioContextRef.current) {
                    audioContextRef.current.close().catch(() => {})
                    audioContextRef.current = null;
                }
                analyserRef.current = null;
                mediaStreamRef.current = null;
            }
        }
    }, [stream, isRecording]);


    return (
        <>
            <canvas className = {styles.canvas} ref = {(el) => {
                canvasEleRef.current = el
                canvasCtxRef.current = el?.getContext('2d') ?? null
                }}
            />
        </>
    )
}