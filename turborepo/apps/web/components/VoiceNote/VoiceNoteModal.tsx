import useVoiceRecorder from "./hooks/useVoiceRecorder";
import LocationStep from "./steps/LocationStep";
import RecordStep from "./steps/RecordStep";
import styles from "./VoiceNoteModal.module.css";
import { useEffect, useMemo, useState } from "react";

type Step = 'location' | 'record' | 'review';
type Prop = { onClose: () => void }

export default function VoiceModal ({onClose} : Prop) {
    
    const recorder = useVoiceRecorder();
    const [ step, setStep ] = useState<Step>('location');
    const [ pin, setPin ] = useState<{lat: number, lng: number} | null>(null);

    const { audioBlob, micPermission, reset } = recorder;
    const audioURL : string | null = useMemo(() => audioBlob ? URL.createObjectURL(audioBlob) : null, [audioBlob])

    useEffect(() => {
        return () => {
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        }
    }, [audioURL]);

    async function handleSubmit () {
        const data = new FormData();
        data.append('audio', audioBlob!);
        data.append('lat', String(pin!.lat));
        data.append('lon', String(pin!.lng));

        await fetch ('/api/voice-note', { method: 'POST', body: data });
    }

    function handleReset () {
        reset();
        setStep('record');
    }

    return (
        <div className = {styles.modalContainer}>  
        <button onClick={onClose}></button>
        {step === 'location' && (
            <div className = {styles.locationSection}>
                <h2>Where are you?</h2>
                <LocationStep pin={pin} onPinChange={setPin} onConfirm={() => setStep('record')}/>
            </div>
        )}
        {step === 'record' && (
            <div className = {styles.recordSection}>
                <h2>What's on your mind?</h2>
                <RecordStep onConfirm={() => setStep('review')}/>
                {micPermission === 'denied' && (<p>Please allow microphone access to continue</p>)}
            </div>
        )}
        {step === 'review' && audioURL && (
            <div className = {styles.reviewSection}>
                <audio src={audioURL}/>
                <button onClick={handleSubmit}>Post</button>
                <button onClick={handleReset}>Re-record</button>
            </div>
        )}
        </div>
    )
}