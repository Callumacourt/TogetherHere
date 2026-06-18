import styles from "./RecordStep.module.css";
import LiveWaveForm from "../../LiveWaveForm/LiveWaveForm";
import AudioWave from "../../AudioWave/AudioWave";
import useAudioPlayer from "../../AudioWave/Utils/useAudioPlayer";
import { VoiceRecorder } from "../hooks/useVoiceRecorder";
import { useCallback, useEffect, useState } from "react";

type Props = {
    recorder: VoiceRecorder,
    onConfirm: () => void,
}

/** 
 * Responsible for voice note recording JSX and logic
 * Renders live wave form when user is recording, converts this to an audioBlob and renders AudioWave when paused
 * @param recorder - VoiceRecorder hook instance
 * @param onConfirm - Function progressing the parent VoiceNoteModal
 * @returns - JSX for recording an audio clip
 */
export default function RecordStep({ recorder, onConfirm }: Props) {
    const [elapsedMs, setElapsedMs] = useState<number>(recorder.totalTime || 0);
    const audioPlayer = useAudioPlayer(recorder.previewUrl || "");
    const progress =
        audioPlayer.playbackPercent > 1
        ? audioPlayer.playbackPercent / 100
        : audioPlayer.playbackPercent;

    const playedMs = Math.floor(progress * audioPlayer.duration * 1000);

    useEffect(() => {
        setElapsedMs(recorder.totalTime || 0);
    }, [recorder.totalTime]);

    useEffect(() => {
        if (recorder.phase !== 'recording') return;
        setElapsedMs(recorder.totalTime || 0);
        {/* timer to increase shown duration by 1s*/}
        const id = window.setInterval(() => {
            setElapsedMs(prev => prev + 1000);
        }, 1000);
        return () => clearInterval(id);
    }, [recorder.phase, recorder.totalTime]);

    // Determines current logic for the control button
    const handleMain = useCallback(async () => {
        if (recorder.phase === 'idle') {
            await recorder.start();
        } else if (recorder.phase === 'paused') {
            recorder.resume();
        } else if (recorder.phase === 'recording') {
            recorder.pause();
        }
    }, [recorder]);

    // Determines current label for the control button
    const mainLabel = recorder.phase === 'idle'
        ? 'Record'
        : recorder.phase === 'recording'
            ? 'Pause'
            : 'Resume';

    // Convert ms to m/s
    function formatElapsed(ms: number) {
        const totalSeconds = Math.floor(ms / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }

    return (
        <div className={styles.recordContainer}>
            <div className={styles.waveformContainer}>
                {recorder.phase === 'recording' && recorder.stream && (
                    <LiveWaveForm stream={recorder.stream} isRecording={recorder.phase === 'recording'} />
                )}
                
                {/* Confirm there is a URL and non empty peaks to draw*/}
                {recorder.phase === 'paused' && 
                recorder.previewUrl && 
                audioPlayer.peaks.length > 0 &&
                (
                    <>
                    <AudioWave
                        variant = {'recording'}
                        ref = {audioPlayer.waveRef}
                        playedPercent={audioPlayer.playbackPercent}
                        duration={audioPlayer.duration}
                        isPlaying={audioPlayer.isPlaying}
                        handleSkip={audioPlayer.handleSkip}
                        handlePause={audioPlayer.handlePause}
                        handlePlay={audioPlayer.handlePlay}
                        peaks={audioPlayer.peaks}
                    />
                    <button
                        type="button" 
                        onClick={audioPlayer.isPlaying ? audioPlayer.handlePause : audioPlayer.handlePlay}
                    >
                        {audioPlayer.isPlaying ? "Pause" : "Play"}
                    </button>
                    <button type="button" onClick={recorder.reset}>Reset</button>
                    </>
                )}
            </div>

            <p className={styles.clipDuration}>
                {recorder.phase === 'paused' && recorder.previewUrl
                ? `${formatElapsed(playedMs)} / ${formatElapsed(elapsedMs)}`
                : formatElapsed(elapsedMs)
                }
            </p>

            <div className={styles.btns}>
                <button className={styles.controlBtn} type="button" onClick={handleMain}>
                    {mainLabel}
                </button>

                {recorder.phase === 'paused' && (
                    <button className={styles.nextBtn} type="button" onClick={onConfirm}>
                        Continue
                    </button>
                )}
            </div>
        </div>
    )
}