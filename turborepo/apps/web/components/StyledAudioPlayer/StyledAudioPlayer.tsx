"use client";
import { useState } from "react";
import Image from "next/image";
import styles from "./StyledAudioPlayer.module.css";
import useAudioPlayer from "./hooks/UseAudioPlayer";

type Props = { src: string; duration?: number };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function StyledAudioPlayer({ src, duration: propDuration }: Props) {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration: hookDuration, 
    volume,
    handlePlayPause,
    handleSeek,
    handleVolume,
    handleEnded,
  } = useAudioPlayer(src);

  const [showVolume, setShowVolume] = useState(false);
  const finalDuration = hookDuration || propDuration || 1;
  const filled = `${(currentTime / finalDuration) * 100}%`;

  return (
    <div className={styles.player}>
      {/* Kept as a dummy node for DOM layout compliance — Web Audio API emits the sound */}
      <audio ref={audioRef} onEnded={handleEnded} />

      <button className={styles.playBtn} type="button" onClick={handlePlayPause}>
        <Image
          src={isPlaying ? "/icons/pause.svg" : "/icons/play.svg"}
          width={20}
          height={20}
          alt={isPlaying ? "Pause" : "Play"}
        />
      </button>

      <input
        className={styles.progress}
        type="range"
        min={0}
        max={finalDuration}
        step={0.01}
        value={currentTime}
        onChange={handleSeek}
        style={{ "--filled": filled } as React.CSSProperties}
      />

      <div
        className={styles.volumeWrapper}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <button className={styles.volumeBtn} type="button">
          <Image src="/icons/volume.svg" width={20} height={20} alt="Volume" />
        </button>

        {showVolume && (
          <div className={styles.volumePopup}>
            <input
              className={styles.volumeSlider}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              style={{ "--filled": `${volume * 100}%` } as React.CSSProperties}
            />
          </div>
        )}
      </div>

      <span className={styles.time}>
        {formatTime(currentTime)} / {formatTime(finalDuration)}
      </span>
    </div>
  );
}