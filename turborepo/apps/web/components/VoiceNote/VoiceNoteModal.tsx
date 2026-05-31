import LocationStep from "./steps/LocationStep";
import useVoiceRecorder from "./hooks/useVoiceRecorder";
import RecordStep from "./steps/RecordStep";
import styles from "./VoiceNoteModal.module.css";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Step = 'location' | 'record' | 'review';
type Prop = { onClose: () => void }

export default function VoiceModal ({onClose} : Prop) {
    
    const recorder = useVoiceRecorder();
    const [ step, setStep ] = useState<Step>('location');
    const [ pin, setPin ] = useState<{lat: number, lng: number} | null>(null);

    const { audioBlob, isRecording, micPermission, reset, start, stop } = recorder;
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

    function handleReturn () {
        if (step == 'record') {
            setStep('location');
        } else if (
            step == 'review') {
            setStep('record');
        };
    };

    function handleReset () {
        reset();
        setStep('record');
    };

    return (
        <div className={styles.modalContainer}>  
          <div className={styles.buttonRow}>
            {step !== 'location' && (
            <button className={styles.prevBtn} onClick={handleReturn}>
              <Image
                src="/icons/white-arrow-left.svg"
                width={32}
                height={32}
                alt="Back"
              />
            </button>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <Image
                src="/icons/close-x.svg"
                width={32}
                height={32}
                alt="Close"
              />
            </button>
          </div>

          {step === 'location' && (
            <div className={styles.locationSection}>
              <LocationStep pin={pin} onPinChange={setPin} onConfirm={() => setStep('record')}/>
            </div>
          )}
          {step === 'record' && (
            <div className = {styles.recordSection}>
                <RecordStep isRecording = {isRecording} audioBlob = {audioBlob} start = {start} stop = {stop} handleReset = {handleReset} onConfirm={() => setStep('review')}/>
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