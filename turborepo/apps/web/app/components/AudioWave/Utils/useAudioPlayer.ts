import { useRef, useState, useEffect } from "react";
import { computePeaks } from "../../../utils/drawingUtils";
import type { AudioWaveHandle } from "../AudioWave";

type Peak = { min: number; max: number };

// Persists across instances so reopening the same popup skips refetching
const peakCache = new Map<string, Peak[]>();

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

    async function fetchPeaks() {
        if (peakCache.has(audioUrl)) {
            setPeaks(peakCache.get(audioUrl)!);
            return;
        }
        try {
            const res = await fetch(audioUrl);
            if (!audioContextRef.current) return;

            const buffer = await audioContextRef.current.decodeAudioData(await res.arrayBuffer());
            const channelData = buffer.getChannelData(0);
            if (!channelData.length) return;

            const bucketCount = Math.max(1, Math.round(300 * window.devicePixelRatio));
            const computed = computePeaks(channelData, bucketCount);
            if (!computed.length) return;

            setPeaks(computed);
            peakCache.set(audioUrl, computed);
        } catch (err: any) {
            console.log(`Unable to fetch audio: ${err.message}`);
        }
    }

    // Setup audio element and context — reruns when audioUrl changes
    useEffect(() => {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        audioRef.current = new Audio(audioUrl);
        audioRef.current.preload = "auto";

        setIsPlaying(false);
        setPlaybackPercent(0);
        fetchPeaks();

        const onEnded = () => {
            cancelAnimationFrame(rafID.current);
            setIsPlaying(false);
            setPlaybackPercent(1);
        };
        
        const audio = audioRef.current;
        const onLoadedMetadata = () => setDuration(audio.duration);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            cancelAnimationFrame(rafID.current);
            try { audio.pause(); } catch {}
            audioContextRef.current?.close().catch(() => {});
            audioRef.current = null;
            audioContextRef.current = null;
        };
    }, [audioUrl]);

    async function handlePlay() {
        if (audioContextRef.current?.state === "suspended") {
            await audioContextRef.current.resume();
        }

        const audio = audioRef.current;
        if (!audio) return;

        if (audio.duration > 0 && audio.currentTime >= audio.duration) {
            audio.currentTime = 0;
            setPlaybackPercent(0);
        }

        cancelAnimationFrame(rafID.current);

        try {
            await audio.play();
            setIsPlaying(true);

            const animate = (t?: number) => {
                const a = audioRef.current;
                if (!a || a.paused || a.ended) return;

                const percent = Number.isFinite(a.duration) && a.duration > 0
                    ? a.currentTime / a.duration
                    : 0;

                waveRef.current?.update(percent);

                // throttle React state to ~10fps; canvas updates every frame via waveRef
                if (!lastStateSync.current || (t && t - lastStateSync.current > 100)) {
                    setPlaybackPercent(percent);
                    lastStateSync.current = t ?? Date.now();
                }

                rafID.current = requestAnimationFrame(animate);
            };

            rafID.current = requestAnimationFrame(animate);
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
        if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

        const time = audioFraction * audio.duration;
        audio.currentTime = time;
        setPlaybackPercent(audioFraction);
    }

    return {duration, isPlaying, peaks, playbackPercent, waveRef, handlePlay, handlePause, handleSkip };
}
