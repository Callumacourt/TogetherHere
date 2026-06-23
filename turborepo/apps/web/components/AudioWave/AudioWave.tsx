"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./AudioWave.module.css";
import {
  drawWaves,
  resizeCanvasToDisplay,
  resizePeaks,
  drawOverlay,
  formatTime,
} from "./Utils/drawingUtils";
import ScrubTooltip from "../ScrubTooltip/ScrubTooltip";

const BAR_WIDTH = 2;
const GAP = 3;
const RADIUS = BAR_WIDTH / 2;

type AudioWaveProps = {
  variant: 'recording' | 'map';
  playedPercent: number;
  duration: number;
  isPlaying: boolean;
  handleSkip: (fraction: number) => void;
  handlePause: () => void;
  handlePlay: () => void;
  peaks: Array<{ min: number; max: number }>;
};

export type AudioWaveHandle = {
  update: (playedPercent: number) => void;
};

const AudioWave = forwardRef(function AudioWave(
  { variant, playedPercent, duration, isPlaying, handleSkip, handlePause, handlePlay, peaks }: AudioWaveProps,
  ref: React.Ref<AudioWaveHandle | null>
  ) {
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [cssWidth, setCssWidth] = useState(0);
  const [cssHeight, setCssHeight] = useState(0);
  const [scrubPercent, setScrubPercent] = useState<number | null>(null);
  const isScrubbing = useRef(false);
  const wasPlaying = useRef(false);

  const resizedPeaks = useMemo(
    () => resizePeaks({ peaks, cssWidth, barWidth: BAR_WIDTH, gap: GAP }),
    [peaks, cssWidth]
  );
  
  // 
  useLayoutEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setCssWidth(entry.contentRect.width);
      setCssHeight(entry.contentRect.height);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Resize both canvases and redraw the static base waveform when dimensions change
  useEffect(() => {
    const base = baseCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!base || !overlay) return;

    if (!baseCtxRef.current) baseCtxRef.current = base.getContext("2d");
    if (!overlayCtxRef.current) overlayCtxRef.current = overlay.getContext("2d");
    const baseCtx = baseCtxRef.current;
    const overlayCtx = overlayCtxRef.current;
    if (!baseCtx || !overlayCtx) return;

    resizeCanvasToDisplay(base, baseCtx, cssWidth, cssHeight);
    resizeCanvasToDisplay(overlay, overlayCtx, cssWidth, cssHeight);
    baseCtx.clearRect(0, 0, cssWidth, cssHeight);
    drawWaves({ cssHeight, resizedPeaks, barWidth: BAR_WIDTH, gap: GAP, context: baseCtx, radius: RADIUS });
  }, [cssWidth, cssHeight, resizedPeaks]);

  // Redraw overlay in response to prop changes (initial mount, skip while paused)
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    if (!overlayCtxRef.current) overlayCtxRef.current = canvas.getContext("2d");
    const ctx = overlayCtxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    drawOverlay({
      cssHeight,
      playedPercent,
      resizedPeaks,
      barWidth: BAR_WIDTH,
      gap: GAP,
      context: ctx,
      radius: RADIUS,
      scrubberHeight: variant === 'recording' ? 30 : cssHeight,
    });
  }, [playedPercent, cssWidth, cssHeight, resizedPeaks]);

  // RAF overlay update to bypass React render cycle giving 60fps animation
  useImperativeHandle(
    ref,
    () => ({
      update(p: number) {
        if (isScrubbing.current) return;
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;
        if (!overlayCtxRef.current) overlayCtxRef.current = canvas.getContext("2d");
        const ctx = overlayCtxRef.current;
        if (!ctx) return;
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        drawOverlay({
          cssHeight,
          playedPercent: p,
          resizedPeaks,
          barWidth: BAR_WIDTH,
          gap: GAP,
          context: ctx,
          radius: RADIUS,
          scrubberHeight: variant === 'recording' ? 30 : cssHeight,
        });
      },
    }),
    [cssWidth, cssHeight, resizedPeaks, variant]
  );

  const getFraction = (pointer: React.PointerEvent<HTMLCanvasElement>): number | undefined => {
    const rect = overlayCanvasRef.current?.getBoundingClientRect();
    if (!rect) return undefined;
    return Math.min(1, Math.max(0, (pointer.clientX - rect.left) / rect.width));
  };

  
  const handlePointerDown = (pointer: React.PointerEvent<HTMLCanvasElement>) => {
    isScrubbing.current = true;
    wasPlaying.current = isPlaying;
    if (isPlaying) handlePause();
    if (styles.scrubbing) overlayCanvasRef.current?.classList.add(styles.scrubbing);
    pointer.currentTarget.setPointerCapture(pointer.pointerId);
  };

  const handlePointerMove = (pointer: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isScrubbing.current) return;
    const fraction = getFraction(pointer);
    if (fraction === undefined) return;
    setScrubPercent(fraction);
    const ctx = overlayCtxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, cssWidth, cssHeight);
    drawOverlay({
      cssHeight,
      playedPercent: fraction,
      resizedPeaks,
      barWidth: BAR_WIDTH,
      gap: GAP,
      context: ctx,
      radius: RADIUS,
      scrubberHeight: variant === 'recording' ? 30 : cssHeight,
    });
  };

  const handlePointerUp = (pointer: React.PointerEvent<HTMLCanvasElement>) => {
    isScrubbing.current = false;
    if (styles.scrubbing) overlayCanvasRef.current?.classList.remove(styles.scrubbing);
    const fraction = getFraction(pointer);
    if (fraction === undefined) return;
    handleSkip(fraction);
    if (wasPlaying.current) handlePlay();
    wasPlaying.current = false;
    setScrubPercent(null);
  };

  const handlePointerCancel = () => {
    isScrubbing.current = false;
    wasPlaying.current = false;
    if (styles.scrubbing) overlayCanvasRef.current?.classList.remove(styles.scrubbing);
    setScrubPercent(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (!duration) return;
    const step = 5 / duration;
    if (e.key === "ArrowRight") handleSkip(Math.min(1, playedPercent + step));
    if (e.key === "ArrowLeft") handleSkip(Math.max(0, playedPercent - step));
  };

  const currentSeconds = (scrubPercent ?? playedPercent) * duration;

  if (variant === "map") {
    return (
      <div className={styles.mapStack}>
        <div className={styles.mapWaveStage}>
          <canvas className={styles.canvas} ref={baseCanvasRef} />
          <canvas
            className={styles.playCanvas}
            ref={overlayCanvasRef}
            role="slider"
            tabIndex={0}
            aria-label="Audio playback position"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentSeconds)}
            aria-valuetext={`${formatTime(currentSeconds)} of ${formatTime(duration)}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onKeyDown={handleKeyDown}
          />
        </div>
        <ScrubTooltip scrubPercent={scrubPercent} playedPercent={playedPercent} duration={duration} />
      </div>
    );
  }

  return (
    <div className={styles.recordingWrapper}>
      <canvas className={styles.recordingCanvas} ref={baseCanvasRef} />
      <canvas
        className={styles.recordingPlayCanvas}
        ref={overlayCanvasRef}
        role="slider"
        tabIndex={0}
        aria-label="Audio playback position"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentSeconds)}
        aria-valuetext={`${formatTime(currentSeconds)} of ${formatTime(duration)}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});

export default AudioWave;
