import { useRef, useState, useEffect, useCallback } from "react";

export default function useAudioPlayer(audioUrl?: string) {

  // -- Refs -- //
  const audioRef = useRef<HTMLAudioElement>(null); // Kept as a dummy ref to prevent JSX crashes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  // -- State -- //
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // -- Utils -- //
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  // -- Effects -- //

  // Automatically fetch and decode track into raw PCM data whenever the source updates
  useEffect(() => {
    if (!audioUrl) return;

    // Reset layout states cleanly on source swap
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    pausedTimeRef.current = 0;

    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }

    const decodeTrack = async () => {
      try {
        const res = await fetch(audioUrl);
        const arrayBuffer = await res.arrayBuffer();
        const ctx = getAudioContext();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

        audioBufferRef.current = decodedBuffer;
        setDuration(decodedBuffer.duration);
      } catch (err) {
        console.error("Failed to decode audio track payload:", err);
      }
    };

    decodeTrack();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }
    };
  }, [audioUrl]);

  // -- Playback -- //
  const tick = useCallback(() => {
    if (!audioBufferRef.current) return;
    const ctx = getAudioContext();

    const elapsed = ctx.currentTime - startTimeRef.current;
    const total = audioBufferRef.current.duration;

    if (elapsed >= total) {
      setIsPlaying(false);
      setCurrentTime(0);
      pausedTimeRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    setCurrentTime(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePlayPause = () => {
    if (!audioBufferRef.current) return;
    const ctx = getAudioContext();

    if (isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      pausedTimeRef.current = ctx.currentTime - startTimeRef.current;

      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
        sourceRef.current = null;
      }

      setIsPlaying(false);
    } else {
      if (ctx.state === "suspended") ctx.resume();

      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (pausedTimeRef.current >= audioBufferRef.current.duration) {
        pausedTimeRef.current = 0;
      }

      source.start(0, pausedTimeRef.current);
      startTimeRef.current = ctx.currentTime - pausedTimeRef.current;
      sourceRef.current = source;

      setIsPlaying(true);
      rafRef.current = requestAnimationFrame(tick);
    }
  };

  // -- Controls -- //
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioBufferRef.current) return;
    const ctx = getAudioContext();
    const t = Number(e.target.value);

    pausedTimeRef.current = t;
    setCurrentTime(t);

    if (isPlaying) {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch {}
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBufferRef.current;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start(0, t);
      startTimeRef.current = ctx.currentTime - t;
      sourceRef.current = source;
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = v;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    pausedTimeRef.current = 0;
  };

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    handlePlayPause,
    handleSeek,
    handleVolume,
    handleEnded,
  };
}