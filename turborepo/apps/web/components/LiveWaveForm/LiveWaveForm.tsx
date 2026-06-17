import { useEffect, useRef } from "react";
import { resizeCanvasToDisplay } from "../../utils/drawingUtils";
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

    function drawWaves() {
        const ctx = canvasCtxRef.current;
        const canvas = canvasEleRef.current;
        const analyser = analyserRef.current;
        const dataArray = dataArrayRef.current;
        if (!ctx || !canvas || !analyser || !dataArray) return;

        rafRef.current = requestAnimationFrame(drawWaves);
        analyser.getByteTimeDomainData(dataArrayRef.current as Uint8Array<ArrayBuffer>);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.lineWidth = 2;

        const centerY = canvas.height / 2;

        let max = 0;

        for (let i = 0; i < dataArray.length; i++) {
            max = Math.max(max, dataArray[i]);
        }

        peaksRef.current.push(max);
        const maxBars = Math.floor(canvas.width / (barWidth + gap));
        if (peaksRef.current.length > maxBars) peaksRef.current.shift();
    
        for (let i = 0; i < peaksRef.current.length; i++) {
            const bar = peaksRef.current[i];
            if (bar === undefined) continue;
            const amplitude = Math.abs(bar - 128) / 128;
            const barHeight = Math.max(2, amplitude * centerY);

            ctx.fillRect(i * (barWidth + gap), centerY - barHeight / 2, barWidth, barHeight);
        }
    }

    function drawBase() {
        const ctx = canvasCtxRef.current;
        const canvas = canvasEleRef.current;
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        const centerY = canvas.height / 2;
        const maxBars = Math.floor(canvas.width / (barWidth + gap))
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
            } else if (!peaksRef.current) {
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