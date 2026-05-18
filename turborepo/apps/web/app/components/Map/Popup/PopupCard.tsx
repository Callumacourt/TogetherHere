import { useEffect, useRef, useState } from "react";
import styles from "./Popup.module.css";
import Image from "next/image";
import AudioWave from "../../AudioWave/AudioWave";
import { computePeaks } from "../../../utils/drawingUtils";

type PopupCardProps = {
  url: string;
  audioUrl: string;
  location: string;
  timeAgo: string;
};

type Peak = { min: number; max: number };

const waveFormCaches = new Map<string, Peak[]>();

export default function PopupCard({ url, audioUrl, location, timeAgo }: PopupCardProps) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const rafID = useRef<number>(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [peaks, setPeaks] = useState<Peak[]>([]);
    const [playbackPercent, setPlaybackPercent] = useState(0);

    function cancelPlaybackLoop() {
        cancelAnimationFrame(rafID.current);
        rafID.current = 0;
    }

    function updatePlaybackPercent() {
        const audio = audioRef.current;
        if (!audio) return;

        if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setPlaybackPercent(audio.currentTime / audio.duration);
        }
    }

    async function getAudioPeaks() {
        if (waveFormCaches.has(audioUrl)) {
            setPeaks(waveFormCaches.get(audioUrl) ?? []);
            return;
        }

        try {
            const res = await fetch(audioUrl);
            if (!audioContextRef.current) return;

            const buffer = await audioContextRef.current.decodeAudioData(await res.arrayBuffer());
            const channelData = buffer.getChannelData(0);
            if (!channelData || channelData.length === 0) return;

            const bucketCount = Math.max(1, Math.round(300 * window.devicePixelRatio));
            const localPeaks = computePeaks(channelData, bucketCount);
            if (localPeaks.length === 0) return;

            setPeaks(localPeaks);
            waveFormCaches.set(audioUrl, localPeaks);
        } catch (err: any) {
            console.log(`Unable to fetch audio file, ${err.message}`);
        }
    }

    useEffect(() => {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (!audioRef.current) {
            audioRef.current = new Audio(audioUrl);
            audioRef.current.preload = "auto";
        }

        setIsPlaying(false);
        setPlaybackPercent(0);

        const handleEnded = () => {
            cancelPlaybackLoop();
            setIsPlaying(false);
            setPlaybackPercent(1);
        };

        getAudioPeaks();
        audioRef.current.addEventListener("ended", handleEnded);

        return () => {
            audioRef.current?.removeEventListener("ended", handleEnded);
            cancelPlaybackLoop();

            try { audioRef.current?.pause(); } catch {}
            try { sourceRef.current?.disconnect(); } catch {}
            if (audioContextRef.current) audioContextRef.current.close().catch(() => {});

            audioRef.current = null;
            sourceRef.current = null;
            audioContextRef.current = null;
        };
    }, [audioUrl]);

    function handlePause() {
        audioRef.current?.pause();
        cancelPlaybackLoop();
        setIsPlaying(false);
    }

    async function handlePlay() {
        if (audioContextRef.current?.state === "suspended") {
            await audioContextRef.current.resume();
        }

        const audio = audioRef.current;
        if (!audio) return;

        if (audio.duration > 0 && audio.currentTime >= audio.duration) {
            audio.currentTime = 0;
            setPlaybackPercent(0);
        }

        cancelPlaybackLoop();

        try {
            await audio.play();
            setIsPlaying(true);

            const animate = () => {
                const currentAudio = audioRef.current;
                if (!currentAudio) return;
                if (currentAudio.paused || currentAudio.ended) return;

                updatePlaybackPercent();
                rafID.current = requestAnimationFrame(animate);
            };

            rafID.current = requestAnimationFrame(animate);
        } catch (err) {
            console.log("Unable to play audio", err);
        }
    }

    function handleSkip(skipTime: number) {
        const audio = audioRef.current;
        if (!audio) return;
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

        const safeTime = Math.max(0, Math.min(skipTime, audio.duration));
        audio.currentTime = safeTime;
        setPlaybackPercent(safeTime / audio.duration);
    }

    return (
        <div className={styles.popupCard}>
            <Image className={styles.cardImg} src={url} alt="" width={2688} height={4032} />
            <div className={styles.cardContent}>
                <div className={styles.mediaSection}>
                    <div className={styles.playBtn}>
                        {!isPlaying ? (
                            <button onClick={handlePlay}>
                                <Image width={48} height={48} alt="" src={"/icons/play.svg"} />
                            </button>
                        ) : (
                            <button onClick={handlePause}>
                                <Image width={48} height={48} alt="" src={"/icons/pause.svg"} />
                            </button>
                        )}
                    </div>

                    {peaks.length > 0 && (
                        <AudioWave
                            playedPercent={playbackPercent}
                            handleSkip={handleSkip}
                            peaks={peaks}
                            isPlaying={isPlaying}
                        />
                    )}
                </div>

                <div className={styles.cardMetadata}>
                    <small>{location}</small>
                    <small>{timeAgo}</small>
                </div>
            </div>
        </div>
    );
}