import { useState, useRef, useEffect } from "react";

type MicPermission = 'idle' |'granted' | 'denied';


export default function useVoiceRecorder() {
    const [ audioBlob, setAudioBlob ] =  useState<Blob | null>(null);
    const [isRecording, setIsRecording ] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<MicPermission>('idle')

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
            setMicPermission('granted');
            streamRef.current = stream;

            recorderRef.current = new MediaRecorder(streamRef.current);
            recorderRef.current.ondataavailable = ( e ) => chunksRef.current.push(e.data);

            recorderRef.current.onstop = ( e ) => {
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

    function reset () {
        chunksRef.current = [];
        setAudioBlob(null);
        setIsRecording(false);
    };

    async function handleStopRecording () {
        try {
            recorderRef.current?.stop();
            streamRef.current?.getTracks().forEach(t => t.stop()); 
            setIsRecording(false);
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : 'An unexpected error occured' )
        }
    }


    return {  audioBlob, isRecording, micPermission, start: handleStartRecording, stop: handleStopRecording, reset}
}