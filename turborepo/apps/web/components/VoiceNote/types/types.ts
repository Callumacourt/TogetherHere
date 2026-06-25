export type MicPermission = 'idle' | 'granted' | 'denied';
export type RecorderPhase = 'idle' | 'recording' | 'paused';

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

export type UseVoiceRecorderOptions = {
  active?: boolean;
}

export type Step = 'location' | 'record' | 'photo' | 'review' | 'success';