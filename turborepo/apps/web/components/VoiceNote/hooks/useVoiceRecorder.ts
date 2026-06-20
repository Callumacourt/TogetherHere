import { useState, useRef, useEffect } from "react";
import { useAutoPause } from "./useAutoPause";
import { 
  UseVoiceRecorderOptions,
   VoiceRecorder, MicPermission, 
   RecorderPhase 
  } from "../types/types";

export default function useVoiceRecorder(
 { active = true }: UseVoiceRecorderOptions = {}
): VoiceRecorder {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<MicPermission>('idle');
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const accumulatedMsRef = useRef<number>(0);
  const segmentStartMsRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isPauseFlushRef = useRef<boolean>(false);

  // -- Utils -- //
  function replacePreviewUrl(nextUrl: string | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewUrl(nextUrl);
  }
  
  // -- Clean up -- //
  function cleanupStreamAndRecorder() {
    const r = recorderRef.current;
    if (r) {
      r.ondataavailable = null;
      r.onstop = null;
      if (r.state !== 'inactive') {
        try { r.stop(); } catch {}
      }
    }

    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }

  useEffect(() => {
    return () => {
      cleanupStreamAndRecorder();
      replacePreviewUrl(null);
    };
  }, []);
  
  // -- Recording -- //
  function pauseInternal() {
    const r = recorderRef.current;
    if (!r || r.state !== "recording") return;

    if (segmentStartMsRef.current !== null) {
      accumulatedMsRef.current += Date.now() - segmentStartMsRef.current;
      segmentStartMsRef.current = null;
    }
  
    streamRef.current?.getAudioTracks().forEach(t => (t.enabled = false));

    setPhase('paused');
    setIsRecording(false);

    isPauseFlushRef.current = true;

    try { r.requestData(); } catch {} // Fetch the blob up until pause point (used to build <AudioWave/> with)
    try { r.pause(); } catch {}
  }

  async function handleStartRecording() {
    try {
      // Ensure all of these are reset
      cleanupStreamAndRecorder();
      chunksRef.current = [];
      accumulatedMsRef.current = 0;
      segmentStartMsRef.current = Date.now();
      isPauseFlushRef.current = false;
      setAudioBlob(null);
      replacePreviewUrl(null);

      // Init audio stream and recorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }

        // Build a Blob of chunks up to pause for AudioWave on pause
        if (isPauseFlushRef.current) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          replacePreviewUrl(url);
          setAudioBlob(blob);
          isPauseFlushRef.current = false;
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setIsRecording(false);
      };
      
      setMicPermission('granted');
      setPhase('recording');
      setIsRecording(true);
      recorder.start();
    } catch (error: unknown) {
      setMicPermission('denied');
      console.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  function handleResumeRecording() {
    const r = recorderRef.current;
    if (r && r.state === 'paused') {
        if (segmentStartMsRef.current == null) {
            segmentStartMsRef.current = Date.now();
        }
        streamRef.current?.getAudioTracks().forEach(t => (t.enabled = true));
        try { r.resume(); } catch { return; }
        setPhase('recording');
        setIsRecording(true);
        return;
    };
  };

  async function handleStopRecording() {
    const r = recorderRef.current;
    if (!r) return;

    if (r.state === "inactive") {
      setIsRecording(false);
      setPhase("idle");
      return;
    }

    if (r.state === "recording" && segmentStartMsRef.current != null) {
      accumulatedMsRef.current += Date.now() - segmentStartMsRef.current;
      segmentStartMsRef.current = null;
    }

    await new Promise<void>((resolve) => {
      r.addEventListener("stop", () => resolve(), { once: true });
      try { r.stop(); } catch { resolve(); }
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    setPhase("idle");
  }

  function reset() {
    cleanupStreamAndRecorder();
    chunksRef.current = [];
    isPauseFlushRef.current = false;
    accumulatedMsRef.current = 0;
    segmentStartMsRef.current = null;

    setAudioBlob(null);
    setIsRecording(false);
    setPhase('idle');
    setMicPermission('idle');
    replacePreviewUrl(null);
  }

  // -- Effects -- //
  useAutoPause(pauseInternal, active, phase);

  return {
    audioBlob,
    isRecording,
    micPermission,
    stream: streamRef.current,
    phase,
    totalTime: accumulatedMsRef.current,
    previewUrl,
    start: handleStartRecording,
    stop: handleStopRecording,
    pause: pauseInternal,
    resume: handleResumeRecording,
    reset
  };
}