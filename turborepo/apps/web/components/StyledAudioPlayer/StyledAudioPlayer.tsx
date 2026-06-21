"use client";

import Image from "next/image";
import styles from "./StyledAudioPlayer.module.css";
import useAudioPlayer from "./hooks/UseAudioPlayer";

type Props = { src: string };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function StyledAudioPlayer({ src }: Props) {
  const {
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
  } = useAudioPlayer();

  return (
    <div className={styles.player}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

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
        max={duration || 1}
        step={0.01}
        value={currentTime}
        onChange={handleSeek}
        style={{ "--filled": filled } as React.CSSProperties}
      />

      <div
        className={styles.volumeWrapper}
        onMouseEnter={showPopup}
        onMouseLeave={hidePopup}
      >
        <button className={styles.volumeBtn} type="button">
          <Image src="/icons/volume.svg" width={20} height={20} alt="Volume" />
        </button>

        {showVolume && (
          <div
            className={styles.volumePopup}
            onMouseEnter={showPopup}
            onMouseLeave={hidePopup}
          >
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
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}