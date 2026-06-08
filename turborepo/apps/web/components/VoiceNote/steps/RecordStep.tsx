import styles from "./RecordStep.module.css";
import LiveWaveForm from "../../LiveWaveForm/LiveWaveForm";
import { VoiceRecorder } from "../hooks/useVoiceRecorder";
import { useCallback, useEffect } from "react";
import { useState } from "react";


type Props = {
    recorder: VoiceRecorder,
    onConfirm: () => void,
}

export default function RecordStep({ recorder, onConfirm }: Props) {
    
    const [elapsedMs, setElapsedMs] = useState<number>(recorder.totalTime || 0);


    useEffect(() => {
        setElapsedMs(recorder.totalTime || 0);
    }, [recorder.totalTime]);

    useEffect(() => {
        if (recorder.phase !== 'recording') return;

        setElapsedMs(recorder.totalTime || 0);
        const id = window.setInterval(() => {
            setElapsedMs(prev => prev + 1000);
        }, 1000);
        return () => clearInterval(id);
    }, [recorder.phase, recorder.totalTime]);

    const handleMain = useCallback(async () => {
        if (recorder.phase === 'idle') {
            await recorder.start();
        } else if (recorder.phase === 'paused') {
            recorder.resume();
        } else if (recorder.phase === 'recording') {
            recorder.pause();
        }
    }, [recorder]);

    const mainLabel = recorder.phase === 'idle'
        ? 'Record'
        : recorder.phase === 'recording'
            ? 'Pause'
            : 'Resume';

    function formatElapsed(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(totalMinutes).padStart(2, '0')}:${String(totalSeconds).padStart(2, '0')}`
    }

    return (
    <div className={styles.recordContainer}>
      <div className={styles.waveformContainer}>
        {recorder.phase !== 'idle' && recorder.stream && (
          <LiveWaveForm stream={recorder.stream} isRecording={recorder.phase === 'recording'} />
        )}
      </div>
        <p className = {styles.clipDuration}>{formatElapsed(elapsedMs)}</p>
        <div className={styles.btns}>
            <button className = {styles.controlBtn} type="button" onClick = {handleMain}>
                {mainLabel}
            </button>
            {recorder.phase === 'paused' && <button className = {styles.nextBtn} type="button" onClick={onConfirm}>Next</button>}
        </div>
    </div>
    )
}