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

export default function useVoiceRecorder(): VoiceRecorder {
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
  const previewUrlRef = useRef<string | null>(null);
  const isPauseFlushRef = useRef<boolean>(false);

  function replacePreviewUrl(nextUrl: string | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
  }

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

        if (isPauseFlushRef.current) {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          const url = URL.createObjectURL(blob);
          replacePreviewUrl(url);
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

  function handlePauseRecording(): void {
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
    r.pause();
    r.requestData();
  }

  function handleResumeRecording() {
    const r = recorderRef.current;
    if (!r || r.state !== 'paused') return;

    if (segmentStartMsRef.current == null) {
      segmentStartMsRef.current = Date.now();
    }

    streamRef.current?.getAudioTracks().forEach(t => (t.enabled = true));

    r.resume();
    setPhase('recording');
    setIsRecording(true);
  }

  async function handleStopRecording() {
    const r = recorderRef.current;
    if (!r) return;

    if (r.state === 'recording' && segmentStartMsRef.current != null) {
      accumulatedMsRef.current += Date.now() - segmentStartMsRef.current;
      segmentStartMsRef.current = null;
    }

    try { r.stop(); } catch {}
    streamRef.current?.getTracks().forEach(t => t.stop());
    setIsRecording(false);
    setPhase('idle');
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
    pause: handlePauseRecording,
    resume: handleResumeRecording,
    reset
  };
}