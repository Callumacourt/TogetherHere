import styles from "./RecordStep.module.css";
import LiveWaveForm from "../../LiveWaveForm/LiveWaveForm";
import ConfirmDeletePopup from "../../ConfirmDeletePopup/ConfirmDeletePopup";
import { motion } from "motion/react";
import AudioWave from "../../AudioWave/AudioWave";
import { useRecordStepState } from "../hooks/useRecordState";
import { VoiceRecorder } from "../types/types";
import { formatElapsed } from "../utils/formatElapsed";
import useAudioPlayer from "../../AudioWave/Utils/useAudioPlayer";

type Props = { recorder: VoiceRecorder; onConfirm: () => void; }

type PausedWaveFormProps = {
    audioPlayer: ReturnType<typeof useAudioPlayer>;
    onDelete: () => void;
}

/** 
 * VoiceNote step JSX
 * @param recorder - VoiceRecorder hook instance
 * @param onConfirm - Function progressing the parent VoiceNoteModal
 * @returns - JSX for recording an audio clip
 */
export default function RecordStep({ recorder, onConfirm} : Props) {

    const {
        elapsedMs,
        confirmingDelete,
        setConfirmingDelete,
        audioPlayer,
        showPausedUi,
        playedMs,
        handleMain,
        handleDeleteConfirm,
        mainLabel,
    } = useRecordStepState(recorder, onConfirm);

    return (
        <div className={styles.recordContainer}>
            <div className={styles.waveformContainer}>
                {recorder.phase === "recording" && recorder.stream && (
                    <LiveWaveForm stream={recorder.stream} isRecording={true} />
                )}

                {showPausedUi && (
                    <PausedWaveform
                        audioPlayer={audioPlayer}
                        onDelete={() => setConfirmingDelete(true)}
                    />
                )}
            </div>

            {confirmingDelete && (
                <motion.div>
                    <ConfirmDeletePopup
                        onCancel={() => setConfirmingDelete(false)}
                        onConfirm={handleDeleteConfirm}
                    />
                </motion.div>
            )}

            <p className={styles.clipDuration}>
                {showPausedUi && recorder.previewUrl
                ? `${formatElapsed(playedMs)} / ${formatElapsed(elapsedMs)}`
                : formatElapsed(elapsedMs)
                }
            </p>

            <div className={styles.btns}>
                <button className={styles.controlBtn} type="button" onClick={handleMain}>
                    {mainLabel}
                </button>

                {showPausedUi && (
                    <button className={styles.nextBtn} type="button" onClick={onConfirm}>
                        Next
                    </button>
                )}
            </div>
        </div>
    )
}

function PausedWaveform({ audioPlayer, onDelete } : PausedWaveFormProps) {
    return (
        <>
            <AudioWave
                variant="recording"
                ref={audioPlayer.waveRef}
                playedPercent={audioPlayer.playbackPercent}
                duration={audioPlayer.duration}
                isPlaying={audioPlayer.isPlaying}
                handleSkip={audioPlayer.handleSkip}
                handlePause={audioPlayer.handlePause}
                handlePlay={audioPlayer.handlePlay}
                peaks={audioPlayer.peaks}
            />
            <div className={styles.playbackControls}>
                {audioPlayer.isPlaying ? (
                    <button type="button" onClick={audioPlayer.handlePause}>Pause</button>
                ) : (
                    <button type="button" onClick={audioPlayer.handlePlay}>Play</button>
                )}
                <button type="button" onClick={onDelete}>Delete</button>
            </div>
        </>
    )
}