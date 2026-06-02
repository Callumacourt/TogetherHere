import styles from "./RecordStep.module.css";
import useVoiceRecorder from "../hooks/useVoiceRecorder";

type Props = {
    isRecording: boolean,
    start: () => void,
    stop: () => void,
    audioBlob : Blob | null,
    handleReset: () => void,
    onConfirm: () => void,
}

export default function RecordStep ( { onConfirm } : Props) {
    const { audioBlob, isRecording, start, stop, reset } = useVoiceRecorder()
    return (
    <div className={styles.recordContainer}>
      <div className={styles.waveformContainer}/>
        <div className={styles.btns}>
            <button type="button" onClick={isRecording ? stop : start}>
            {isRecording ? 'Stop' : 'Record'} 
            </button>
            {!!audioBlob && (<button type="button" onClick={onConfirm}>Next</button>)}
        </div>
    </div>
    )
}