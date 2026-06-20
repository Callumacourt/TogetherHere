import { useCallback, useEffect, useState } from "react";
import useAudioPlayer from "../../AudioWave/Utils/useAudioPlayer";
import { VoiceRecorder } from "../types/types";

export function useRecordStepState(recorder: VoiceRecorder, onConfirm: () => void) {
    const [elapsedMs, setElapsedMs] = useState<number>(recorder.totalTime || 0);
    const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
    const audioPlayer = useAudioPlayer(recorder.previewUrl || "");

    const hasPreview = Boolean(recorder.previewUrl) && audioPlayer.peaks.length > 0;
    const showPausedUi = recorder.phase === "paused" || (recorder.phase === "idle" && hasPreview);

    const progress = audioPlayer.playbackPercent > 1
        ? audioPlayer.playbackPercent / 100
        : audioPlayer.playbackPercent;
    const playedMs = Math.floor(progress * audioPlayer.duration * 1000);

    // Sync elapsed time with recorder
    useEffect(() => {
        setElapsedMs(recorder.totalTime || 0);
    }, [recorder.totalTime]);

    // Increment timer during recording
    useEffect(() => {
        if (recorder.phase !== 'recording') return;
        setElapsedMs(recorder.totalTime || 0);
        const id = window.setInterval(() => {
            setElapsedMs(prev => prev + 1000);
        }, 1000);
        return () => clearInterval(id);
    }, [recorder.phase, recorder.totalTime]);

    const handleMain = useCallback(async () => {
        if (showPausedUi) {
            recorder.resume();
        } else if (recorder.phase === 'idle') {
            recorder.start();
        } else if (recorder.phase === 'recording') {
            recorder.pause();
        }
    }, [recorder, showPausedUi]);

    const handleDeleteConfirm = () => {
        recorder.reset();
        setConfirmingDelete(false);
    };

    const mainLabel = recorder.phase === 'recording'
        ? 'Pause'
        : showPausedUi
            ? 'Resume recording'
            : 'Record';

    return {
        elapsedMs,
        confirmingDelete,
        setConfirmingDelete,
        audioPlayer,
        showPausedUi,
        playedMs,
        handleMain,
        handleDeleteConfirm,
        mainLabel,
    };
}