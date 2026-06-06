import styles from "./RecordStep.module.css";
import LiveWaveForm from "../../LiveWaveForm/LiveWaveForm";


type Props = {
    isRecording: boolean,
    stream: MediaStream | null,
    audioBlob: Blob | null,
    start: () => void,
    stop: () => void,
    handleReset: () => void,
    onConfirm: () => void,
}

export default function RecordStep({ isRecording, stream, audioBlob, start, stop, onConfirm }: Props) {
    return (
    <div className={styles.recordContainer}>
      <div className={styles.waveformContainer}>
        {isRecording && stream && <LiveWaveForm stream={stream} isRecording={isRecording}/>}
      </div>
        <div className={styles.btns}>
            <button type="button" onClick={isRecording ? stop : start}>
                {isRecording ? 'Stop' : 'Record'}
            </button>
            {!!audioBlob && <button type="button" onClick={onConfirm}>Next</button>}
        </div>
    </div>
    )
}