import { useRef, useState, useEffect } from "react";
import { computePeaks } from "./drawingUtils";
import type { AudioWaveHandle } from "../AudioWave";

type Peak = { min: number; max: number };

export const peakCache = new Map<string, Peak[]>();

export default function useAudioPlayer(audioUrl: string) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafID = useRef<number>(0);
    const lastStateSync = useRef<number>(0);
    const waveRef = useRef<AudioWaveHandle | null>(null);
    const [duration, setDuration] = useState(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [peaks, setPeaks] = useState<Peak[]>([]);
    const [playbackPercent, setPlaybackPercent] = useState(0);

    async function fetchPeaks(urlToFetch: string) {
        if (peakCache.has(urlToFetch)) {
            setPeaks(peakCache.get(urlToFetch)!);
            return;
        }
        try {
            const buf = await fetch(urlToFetch).then(r => r.arrayBuffer());
            const decoded = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(buf);
            const channelData = decoded.getChannelData(0);
            if (!channelData.length) return;

            const bucketCount = Math.max(1, Math.round(300 * window.devicePixelRatio));
            const computed = computePeaks(channelData, bucketCount);
            if (!computed.length) return;

            // Only update cache/state if the active url hasn't changed while we were fetching
            if (audioUrl === urlToFetch) {
                peakCache.set(urlToFetch, computed);
                setPeaks(computed);
            }
        } catch (err: any) {
            console.log(`Unable to fetch audio: ${err.message}`);
        }
    }

    useEffect(() => {
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        audio.preload = "auto";
        audioRef.current = audio;

        setIsPlaying(false);
        setPlaybackPercent(0);
        fetchPeaks(audioUrl);

        const onEnded = () => {
            cancelAnimationFrame(rafID.current);
            setIsPlaying(false);
            setPlaybackPercent(1);
        };
        
        const onLoadedMetadata = () => {
            if (Number.isFinite(audio.duration)) {
                setDuration(audio.duration);
            }
        };

        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        // If metadata is already loaded implicitly
        if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
            setDuration(audio.duration);
        }

        return () => {
            cancelAnimationFrame(rafID.current);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            try { audio.pause(); audio.src = ""; } catch {} 
            audioContextRef.current?.close().catch(() => {});
            audioRef.current = null;
            audioContextRef.current = null;
        };
    }, [audioUrl]);

    async function handlePlay() {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (audioContextRef.current?.state === "suspended") {
            await audioContextRef.current.resume();
        }

        const audio = audioRef.current;
        if (!audio) return;

        // Ensure we have a valid duration before evaluating skip resets
        const actualDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;

        if (actualDuration > 0 && audio.currentTime >= actualDuration) {
            audio.currentTime = 0;
            setPlaybackPercent(0);
        }

        cancelAnimationFrame(rafID.current);

        try {
            await audio.play();
            setIsPlaying(true);

            // Synchronous setup block to eliminate first frame animation race conditions
            let currentId: number;
            
            const animate = (t?: number) => {
                if (rafID.current !== currentId) return;
                const a = audioRef.current;
                if (!a || a.paused || a.ended) return;

                const currentDuration = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : duration;
                const percent = currentDuration > 0 ? a.currentTime / currentDuration : 0;

                waveRef.current?.update(percent);

                if (!lastStateSync.current || (t && t - lastStateSync.current > 100)) {
                    setPlaybackPercent(percent);
                    lastStateSync.current = t ?? Date.now();
                }

                currentId = requestAnimationFrame(animate);
                rafID.current = currentId;
            };

            currentId = requestAnimationFrame(animate);
            rafID.current = currentId;
        } catch (err) {
            console.log(err);
        }
    }

    function handlePause() {
        audioRef.current?.pause();
        cancelAnimationFrame(rafID.current);
        setIsPlaying(false);
    }

    function handleSkip(audioFraction: number) {
        const audio = audioRef.current;
        const currentDuration = audio && Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : duration;
        if (!audio || currentDuration <= 0) return;

        const time = audioFraction * currentDuration;
        audio.currentTime = time;
        setPlaybackPercent(audioFraction);
    }

    return { duration, isPlaying, peaks, playbackPercent, waveRef, handlePlay, handlePause, handleSkip };
}