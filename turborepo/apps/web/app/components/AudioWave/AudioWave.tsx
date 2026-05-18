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
} from "../../utils/drawingUtils";

type AudioWaveProps = {
  playedPercent: number;
  handleSkip: (time: number) => void;
  peaks: Array<{ min: number; max: number }>;
  isPlaying: boolean;
};

export type AudioWaveHandle = {
  update: (playedPercent: number) => void;
};

const AudioWave = forwardRef(function AudioWave(
  { playedPercent, handleSkip, peaks, isPlaying }: AudioWaveProps,
  ref: React.Ref<AudioWaveHandle | null>
) {
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const overlayCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [cssWidth, setCssWidth] = useState(0);
  const [cssHeight, setCssHeight] = useState(0);

  const barWidth = 2;
  const gap = 3;
  const radius = barWidth / 2;

  const resizedPeaks = useMemo(() => {
    return resizePeaks({ peaks, cssWidth, barWidth, gap });
  }, [peaks, cssWidth, barWidth, gap]);

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
    baseCtx.fillStyle = "rgb(0,0,0)";
    baseCtx.fillRect(0, 0, cssWidth, cssHeight);

    drawWaves({ cssHeight, resizedPeaks, barWidth, gap, context: baseCtx, radius });
  }, [cssWidth, cssHeight, resizedPeaks]);

  // Redraw overlay in response to prop changes (initial mount, skip while paused)
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    if (!overlayCtxRef.current) overlayCtxRef.current = canvas.getContext("2d");
    const ctx = overlayCtxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    drawOverlay({ cssHeight, playedPercent, resizedPeaks, barWidth, gap, context: ctx, radius });
  }, [playedPercent, cssWidth, cssHeight, resizedPeaks]);

  // RAFdriven overlay update which bypasses React render cycle for 60fps animation
  useImperativeHandle(
    ref,
    () => ({
      update(p: number) {
        const canvas = overlayCanvasRef.current;
        if (!canvas) return;

        if (!overlayCtxRef.current) overlayCtxRef.current = canvas.getContext("2d");
        const ctx = overlayCtxRef.current;
        if (!ctx) return;

        ctx.clearRect(0, 0, cssWidth, cssHeight);
        drawOverlay({ cssHeight, playedPercent: p, resizedPeaks, barWidth, gap, context: ctx, radius });
      },
    }),
    [cssWidth, cssHeight, resizedPeaks, barWidth, gap, radius]
  );

  return (
    <div style={{ position: "relative" }}>
      <canvas className={styles.canvas} ref={baseCanvasRef} />
      <canvas className={styles.playCanvas} ref={overlayCanvasRef} />
    </div>
  );
});

export default AudioWave;
