import { useState, useRef, useEffect } from "react";

type MicPermission = 'idle' | 'granted' | 'denied';
type RecorderPhase = 'idle' | 'recording' | 'paused';

export type VoiceRecorder = {
  audioBlob: Blob | null;
  isRecording: boolean;
  micPermission: MicPermission;
  stream: MediaStream | null;
  phase: RecorderPhase;
  totalTime: number;
  previewUrl: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void> | void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

type UseVoiceRecorderOptions = {
  active?: boolean;
}

export default function useVoiceRecorder(
  { active = true}: UseVoiceRecorderOptions = {}
): VoiceRecorder {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<MicPermission>('idle');
  const [phase, setPhase] = useState<RecorderPhase>('idle');
  const accumulatedMsRef = useRef<number>(0);
  const segmentStartMsRef = useRef<number | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isPauseFlushRef = useRef<boolean>(false);

  // Revoke existing audio URL and replace with new
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
  
  // Pause helper
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

  // --Recording Functions -- //

  async function handleStartRecording() {
    try {
      cleanupStreamAndRecorder();
      chunksRef.current = [];
      accumulatedMsRef.current = 0;
      segmentStartMsRef.current = Date.now();
      isPauseFlushRef.current = false;
      setAudioBlob(null);
      replacePreviewUrl(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }

        // Build an audioURL of chunks up to that point when pausing
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
  
    // If paused, resume normally
    if (r && r.state === 'paused') {
        if (segmentStartMsRef.current == null) {
            segmentStartMsRef.current = Date.now();
        }
        streamRef.current?.getAudioTracks().forEach(t => (t.enabled = true));
        try { r.resume(); } catch { return; }
        setPhase('recording');
        setIsRecording(true);
        return;
    }
    
    // If idle but stream exists (back nav from review), restart recording on same stream
    if (r && r.state === 'inactive' && streamRef.current) {
        if (segmentStartMsRef.current == null) {
            segmentStartMsRef.current = Date.now();
        }
        streamRef.current.getAudioTracks().forEach(t => (t.enabled = true));
        try { r.resume(); } catch {  }
        setPhase('recording');
        setIsRecording(true);
        return;
    }
  }

  // Auto pause when leaving the tab/app view
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        pauseInternal();
      }
    };

    const onPageHide = () => {
      pauseInternal();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, []);

  // Auto pause when navigating out of voice recording phase
  useEffect(() => {
    if (!active && phase === "recording") {
      pauseInternal();
    }
  }, [active, phase]);

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