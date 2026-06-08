import { useState, useRef, useEffect } from "react";

type MicPermission = 'idle' |'granted' | 'denied';
type RecorderPhase = 'idle' | 'recording' | 'paused';

export type VoiceRecorder = {
  audioBlob: Blob | null;
  isRecording: boolean;
  micPermission: MicPermission;
  stream: MediaStream | null;
  phase: RecorderPhase;
  totalTime: number,
  start: () => Promise<void>;
  stop: () => Promise<void> | void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};

export default function useVoiceRecorder() {
    const [ audioBlob, setAudioBlob ] =  useState<Blob | null>(null);
    const [isRecording, setIsRecording ] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<MicPermission>('idle')

    const [ phase, setPhase ] = useState<RecorderPhase>('idle');
    const accumulatedMsRef = useRef<number>(0);
    const segmentStartMsRef = useRef<number | null>(null);

    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
        }
    }, []);

        async function handleStartRecording () {
        try {
            chunksRef.current = [];
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            accumulatedMsRef.current = 0;
            segmentStartMsRef.current = Date.now();
            setMicPermission('granted');
            setPhase('recording');
            streamRef.current = stream;

            recorderRef.current = new MediaRecorder(streamRef.current);
            recorderRef.current.ondataavailable = ( e ) => chunksRef.current.push(e.data);

            recorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: recorderRef.current!.mimeType })
                setAudioBlob(blob);
                setIsRecording(false);
            }

            setIsRecording(true);
            recorderRef.current.start();
        } catch (error : unknown) {
            setMicPermission('denied');
            console.error(error instanceof Error ? error.message : 'An unexpected error occured' )
        }
    }

    function handlePauseRecording () {
        const r = recorderRef.current;
        if (!r || r.state !== "recording") return;
        if (segmentStartMsRef.current !== null) {
            // accumulate the duration of the current segment
            accumulatedMsRef.current += Date.now() - segmentStartMsRef.current;
            segmentStartMsRef.current = null;
        };

        streamRef.current?.getAudioTracks().forEach(t => t.enabled = false);
        r.pause();
        setPhase('paused');
        setIsRecording(false);
    };

    function handleResumeRecording () {
        const r = recorderRef.current;
        if (!r || r.state !== 'paused') return;
        if (segmentStartMsRef.current == null) {
            segmentStartMsRef.current = Date.now();
        }

        streamRef.current?.getAudioTracks().forEach(t => t.enabled = true);
        r.resume();
        setPhase('recording');
        setIsRecording(true);
    };

    async function handleStopRecording () {
        const r = recorderRef.current;
        if (!r) return;
        // If currently recording, accumulate the last segment
        if (segmentStartMsRef.current != null) {
            accumulatedMsRef.current += Date.now() - segmentStartMsRef.current;
            segmentStartMsRef.current = null;
        }

        r.stop();
        streamRef.current?.getTracks().forEach(t => t.stop());
        setIsRecording(false);
        setPhase('idle');
    };

    function reset () {
        chunksRef.current = [];
        setAudioBlob(null);
        setIsRecording(false);
    };


    return { 
        audioBlob, 
        isRecording, 
        micPermission, 
        stream: streamRef.current, 
        phase,
        start: handleStartRecording, 
        stop: handleStopRecording, 
        pause: handlePauseRecording,
        resume: handleResumeRecording,
        totalTime: accumulatedMsRef.current,
        reset 
    }
}