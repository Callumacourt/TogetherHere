import { useEffect, useRef, useState } from "react";
import styles from "./Popup.module.css";
import Image from "next/image";
import AudioWave from "../../AudioWave/AudioWave";

type PopupCardProps = {
  url: string;
  audioUrl : string;
  location: string;
  timeAgo: string;
};

export default function PopupCard({ url, audioUrl, location, timeAgo }: PopupCardProps) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null >(null);
    const [analyser, setAnalyser] = useState <AnalyserNode | null> (null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        // init context and audio ref if none
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (!audioRef.current) audioRef.current = new Audio(audioUrl);
        // create a local analyser
        let local = audioContextRef.current.createAnalyser();

        if (!sourceRef.current) {
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            // connect audio to analyser
            sourceRef.current.connect(local);
            local.connect(audioContextRef.current.destination);
            // move to state 
            setAnalyser(local)
        }

        const handleEnded = () => setIsPlaying(false);

        // when audio stops playing
        audioRef.current?.addEventListener('ended', handleEnded);

        // clean up
        return () => {
        audioRef.current?.removeEventListener('ended', handleEnded);
        try {audioRef.current?.pause() } catch {};
        try {sourceRef.current?.disconnect()} catch {};
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
        audioRef.current = null;
        sourceRef.current = null;
        audioContextRef.current = null;
        
        }
        // when a different popup is rendered
    }, [audioUrl]);

     function handlePause () {
        audioRef.current?.pause();
        setIsPlaying(false);
    }

    async function handlePlay () {
        if (audioContextRef.current?.state === "suspended") {
            await audioContextRef.current.resume();
        }

        await audioRef.current?.play()
        .then(() => setIsPlaying(true));
    }


    return (
        <div className={styles.popupCard}>
        <Image src={url} alt="" width={2688} height={4032} />
        <div className={styles.cardContent}>
            <div className={styles.playBtn}>
                {isPlaying === false ? (
                    <button onClick = {handlePlay}>Play</button>
                ) : (
                    <button onClick = {handlePause}>Pause</button>
                )}
            </div>
            {analyser && <AudioWave analyserNode = {analyser} isPlaying = {isPlaying} />}
            <div className={styles.cardMetadata}>
            <small>{location}</small>
            <small>{timeAgo}</small>
            </div>
        </div>
        </div>
  );
}