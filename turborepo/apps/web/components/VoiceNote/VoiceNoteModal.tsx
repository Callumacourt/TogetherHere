import LocationStep from "./steps/LocationStep";
import useVoiceRecorder from "./hooks/useVoiceRecorder";
import RecordStep from "./steps/RecordStep";
import styles from "./VoiceNoteModal.module.css";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Step } from "./types/types";
import { motion } from "motion/react";
import PhotoStep from "./steps/PhotoStep";
import useImageIntake from "./hooks/useImageIntake";
import StyledAudioPlayer from "../StyledAudioPlayer/StyledAudioPlayer";
import ConfirmClosing from "../ConfirmClosing.tsx/ConfirmClosing";
type Prop = { onClose: () => void }

export default function VoiceModal ({onClose} : Prop) {
    const [ step, setStep ] = useState<Step>('location'); 
    const recorder = useVoiceRecorder({active: step === 'record'});
    const imageIntake = useImageIntake();
    const [ closing, setClosing ] = useState<boolean>(false);
    const [ pin, setPin ] = useState<{lat: number, lng: number} | null>(null);
    const isPortrait = !!imageIntake.aspectRatio && imageIntake.aspectRatio < 1;
   
    const audioURL : string | null = useMemo(() => recorder.audioBlob ? URL.createObjectURL(recorder.audioBlob) : null, [recorder.audioBlob])
     
    // -- Clean up -- //
    useEffect(() => {
        return () => {
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        }
    }, [audioURL]);

    useEffect(() => {
      const previousBodyOverflow = document.body.style.overflow;
      const previousHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
      };
    }, []);

    // -- Modal progression handlers -- //
    async function handleSubmit () {
        const data = new FormData();
        data.append('audio', recorder.audioBlob!);
        data.append('lat', String(pin!.lat));
        data.append('lon', String(pin!.lng));

        await fetch ('/api/voice-note', { method: 'POST', body: data });
    }

    function handleReturn () {
        if (step == 'record') {
            setStep('location');
        } else if (step === 'photo') {
          setStep('record');
        } else if (step === 'review') {
          setStep('photo');
        };
    };

    function handleReset () {
        recorder.reset();
        setStep('record');  
    };

    return (
        <motion.div
          initial = {{x: -20, y: 20, opacity: 0}}
          animate = {{x: 0, y: 0, opacity: 1}}
          exit = {{x: -20, y: 20, opacity: 0}}
          transition={{type: "tween", duration: 0.2, ease: "easeOut"}}
          className={styles.modalContainer}>  
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
            <button className={styles.closeBtn} onClick={() => setClosing(true)}>
              <Image
                src="/icons/close-x.svg"
                width={32}
                height={32}
                alt="Close"
              />
            </button>
          </div>

          {closing && (
            <ConfirmClosing onClose={onClose} setClosing={setClosing}/>
          )}

          {step === 'location' && (
            <div className={styles.locationSection}>
              <h2 className={styles.stepTitle}>Where are you?</h2>
              <LocationStep 
                pin={pin}
                onPinChange={setPin}
                onConfirm={() => pin && setStep('record')}/>
            </div>
          )}
          {step === 'record' && (
            <div className={styles.recordSection}>
              <h2 className={styles.stepTitle}>What's on your mind?</h2>
              <RecordStep
                recorder = {recorder}
                onConfirm={() => {
                  recorder.pause(); // don't stop incase backnav
                  setStep("photo");
                }}
              />
              {recorder.micPermission === 'denied' && (<p>Please allow microphone access to continue</p>)}
            </div>
          )}
          {step === 'photo' && (
            <div className={styles.photoSection}>
              <h2 className={styles.stepTitle}>Add a photo?</h2>
              <PhotoStep 
                imageIntake={imageIntake}
                onConfirm={() => setStep('review')}
              />
            </div>
          )}
          {step === 'review' && audioURL && (
            <div className={styles.reviewSection}>
              <h2 className={styles.stepTitle}>How does it look?</h2>
              <div className={styles.contentWrapper}>
                <div className={styles.imgWrapper}>
                  {imageIntake.imageUrl && (
                    <Image 
                      src={imageIntake.imageUrl}
                      alt="Your uploaded image"
                      fill
                      className={`${styles.reviewImage} ${isPortrait ? styles.containPortraitDesktop : ''}`}
                      style={{objectPosition: imageIntake.objectPosition, borderRadius: '6px'}}
                    />
                  )}
                </div>
                <StyledAudioPlayer src={audioURL}/>
              </div>
              <span className = {styles.reviewButtons}>
                <button onClick={handleReset}>Re-record</button>  
                <button onClick={async () => {
                  await recorder.stop();
                  await handleSubmit();
                }}>Post</button>
              </span>
            </div>
          )}
        </motion.div>
    )
}