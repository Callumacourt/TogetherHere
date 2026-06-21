import { useRef, useState, useEffect, useCallback } from "react";

export default function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  const tick = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setCurrentTime(audio.currentTime);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, tick]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Number(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextVolume = Number(e.target.value);
    audio.volume = nextVolume;
    setVolume(nextVolume);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    const audio = audioRef.current;
    if (audio) audio.currentTime = 0;
  };

  const showPopup = () => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    setShowVolume(true);
  };

  const hidePopup = () => {
    hideTimerRef.current = window.setTimeout(() => {
      setShowVolume(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const filled = `${(currentTime / (duration || 1)) * 100}%`;

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    showVolume,
    filled,
    handlePlayPause,
    handleSeek,
    handleVolume,
    showPopup,
    hidePopup,
    handleLoadedMetadata,
    handleEnded,
  };
}