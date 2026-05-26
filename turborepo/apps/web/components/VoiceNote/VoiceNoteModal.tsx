import styles from "./VoiceNoteModal.module.css";
import { useEffect, useMemo, useRef, useState } from "react";

type Step = 'location' | 'record' | 'review';
type MicPermission = 'idle' |'granted' | 'denied';

export default function VoiceModal () {
    const [ step, setStep ] = useState<Step>('location');
    const [ pin, setPin ] = useState<{lat: number, lng: number} | null>(null);
    const [ audioBlob, setAudioBlob ] =  useState<Blob | null>(null);
    const [isRecording, setIsRecording ] = useState<boolean>(false);
    const [micPermission, setMicPermission] = useState<MicPermission>('idle')
    const streamRef = useRef<MediaStream | null>(null);
    const [ label, setLabel ] = useState('');

    const recorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    async function handleStartRecording () {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicPermission('granted');
            streamRef.current = stream;

            recorderRef.current = new MediaRecorder(streamRef.current);
            recorderRef.current.ondataavailable = ( e ) => chunksRef.current.push(e.data);

            recorderRef.current.onstop = ( e ) => {
                const blob = new Blob(chunksRef.current, { type: recorderRef.current!.mimeType })
                setAudioBlob(blob);
                setIsRecording(false);
                setStep('review');
            }

            setIsRecording(true);
            recorderRef.current.start();
        } catch (error : unknown) {
            setMicPermission('denied');
            console.error(error instanceof Error ? error.message : 'An unexpected error occured' )
        }
    }

    async function handleStopRecording () {
        try {
            recorderRef.current?.stop();
            streamRef.current?.getTracks().forEach(t => t.stop()); 
            setIsRecording(false);
        } catch (error: unknown) {
            console.error(error instanceof Error ? error.message : 'An unexpected error occured' )
        }
    }

    async function handleSubmit () {
        const data = new FormData();
        data.append('audio', audioBlob!);
        data.append('location', label);
        data.append('lat', String(pin!.lat));
        data.append('lon', String(pin!.lng));
    
        await fetch ('/api/voice-note', { method: 'POST', body: data });
    }

    useEffect(() => {
        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        }
    }, []);

    const audioURL : string | null = useMemo(() => audioBlob ? URL.createObjectURL(audioBlob) : null, [audioBlob])

    return (
        <>  
        {step === 'location' && (
            <>
            </>
        )}
        {step === 'record' && (
            <>
                <div className = {styles.waveformContainer}/>
                <div className={styles.btns}>
                    <button onClick={isRecording ? handleStartRecording : handleStartRecording}>
                    {isRecording ? 'play' : 'pause'} 
                    </button>
                    <button type="submit" onClick={handleSubmit}>Submit</button>
                </div>
            </>
        )}
        {step === 'review' && (
            <>
                
            </>
        )}
        </>
    )
}