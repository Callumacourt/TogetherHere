import { useRef, useState, useEffect, useCallback } from "react";
import { computePeaks } from "./drawingUtils";
import type { AudioWaveHandle } from "../AudioWave";

type Peak = { min: number; max: number };
type CacheEntry = { peaks: Peak[]; duration: number; buffer: AudioBuffer };
export const peakCache = new Map<string, CacheEntry>();

// Lets other features (e.g. the voice note recorder) silence all mounted players
const activePausers = new Set<() => void>();
export function pauseAllAudioPlayers() {
  activePausers.forEach((pause) => pause());
}

export default function useAudioPlayer(audioUrl: string) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const rafID = useRef<number>(0);
  const waveRef = useRef<AudioWaveHandle | null>(null);

  const durationRef = useRef(0);
  const startTimeRef = useRef(0); 
  const pausedTimeRef = useRef(0); // Tracks current playback position in seconds

  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [peaks, setPeaks] = useState<Peak[]>([]);
  const [playbackPercent, setPlaybackPercent] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Lazy initialize AudioContext safely
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  async function fetchPeaksAndDuration(urlToFetch: string) {
    const cached = peakCache.get(urlToFetch);
    if (cached) {
      setPeaks(cached.peaks);
      audioBufferRef.current = cached.buffer;
      durationRef.current = cached.duration;
      setDuration(cached.duration);
      return;
    }

    try {
      const buf = await fetch(urlToFetch).then(r => r.arrayBuffer());
      const ctx = getAudioContext();
      
      // Decodes raw WebM payload completely into an immutable PCM buffer
      const decoded = await ctx.decodeAudioData(buf);

      const peaks = computePeaks(
        decoded.getChannelData(0),
        Math.round(300 * window.devicePixelRatio)
      );

      const entry = { peaks, duration: decoded.duration, buffer: decoded };
      peakCache.set(urlToFetch, entry);

      setPeaks(peaks);
      audioBufferRef.current = decoded;
      durationRef.current = decoded.duration;
      setDuration(decoded.duration);
    } catch (err) {
      console.error("decode failed", err);
    }
  }

  useEffect(() => {
    if (!audioUrl) return;

    // Reset layout position states on source swap
    pausedTimeRef.current = 0;
    setCurrentTime(0);
    setPlaybackPercent(0);
    durationRef.current = 0;
    setDuration(0);

    fetchPeaksAndDuration(audioUrl);

    return () => {
      cancelAnimationFrame(rafID.current);
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }
    };
  }, [audioUrl]);

  const updatePlaybackUI = useCallback(() => {
    const ctx = getAudioContext();
    if (!audioBufferRef.current || ctx.state === "suspended") return;

    let current = ctx.currentTime - startTimeRef.current;
    const d = durationRef.current || 1;

    if (current >= d) {
      setIsPlaying(false);
      setPlaybackPercent(0);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      waveRef.current?.update(0);
      cancelAnimationFrame(rafID.current);
      return;
    }

    const p = current / d;
    setPlaybackPercent(p);
    setCurrentTime(current);
    waveRef.current?.update(p);

    rafID.current = requestAnimationFrame(updatePlaybackUI);
  }, []);

  async function handlePlay() {
    if (!audioBufferRef.current) return;
    const ctx = getAudioContext();
    
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(ctx.destination);

    if (pausedTimeRef.current >= durationRef.current) {
      pausedTimeRef.current = 0;
    }

    source.start(0, pausedTimeRef.current);
    startTimeRef.current = ctx.currentTime - pausedTimeRef.current;
    sourceRef.current = source;
    setIsPlaying(true);

    rafID.current = requestAnimationFrame(updatePlaybackUI);
  }

  function handlePause() {
    cancelAnimationFrame(rafID.current);
    setIsPlaying(false);

    if (sourceRef.current) {
      const ctx = getAudioContext();
      pausedTimeRef.current = ctx.currentTime - startTimeRef.current;
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
  }

  // handlePause only touches refs and setState, so the first instance stays valid
  useEffect(() => {
    activePausers.add(handlePause);
    return () => {
      activePausers.delete(handlePause);
    };
  }, []);

  const handleSkip = useCallback((fraction: number) => {
    const d = durationRef.current;
    if (!isFinite(d) || d <= 0 || !audioBufferRef.current) return;

    const clamped = Math.min(Math.max(fraction, 0), 1);
    const time = clamped * d;

    pausedTimeRef.current = time;
    setCurrentTime(time);
    setPlaybackPercent(clamped);
    waveRef.current?.update(clamped);

    // If already playing restart source node at the new time offset
    if (isPlaying) {
      handlePlay();
    }
  }, [isPlaying]);

  return {
    currentTime,
    duration,
    isPlaying,
    peaks,
    playbackPercent,
    waveRef,
    handlePlay,
    handlePause,
    handleSkip,
  };
}