import { useEffect, useRef, useState } from "react";
import styles from "./Popup.module.css";
import Image from "next/image";
import AudioWave from "../../AudioWave/AudioWave";
import { computePeaks } from "../../../utils/drawingUtils";

type PopupCardProps = {
  url: string;
  audioUrl : string;
  location: string;
  timeAgo: string;
};

const waveFormCaches = new Map();

export default function PopupCard({ url, audioUrl, location, timeAgo }: PopupCardProps) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null >(null);
    const [analyser, setAnalyser] = useState <AnalyserNode | null> (null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [peaks, setPeaks] = useState <Array<{ min: number; max: number }>>([])

    // Sets audio min and max peak values used to produce the audio waveform
    async function getAudioPeaks () {
      // fetch from cache if already computed
      if (waveFormCaches.has(audioUrl)) {
        setPeaks(waveFormCaches.get(audioUrl));
        return;
      }

      try {
        const res = await fetch(audioUrl);
        if (!audioContextRef.current) return;

        const buffer = await audioContextRef.current.decodeAudioData(await res.arrayBuffer());
        const channelData = buffer.getChannelData(0);
        if (!channelData || channelData.length === 0) return;

        const bucketCount = Math.max(1, Math.round(300 * devicePixelRatio));
        const localPeaks = computePeaks(channelData, bucketCount);
        if (localPeaks.length === 0) return;

        setPeaks(localPeaks);
        waveFormCaches.set(audioUrl, localPeaks);
      } catch (err: any) {
        console.log(`Unable to fetch audio file, ${err.message}`);
      }
    }


    useEffect(() => {
        // init context and audio ref if none
        if (!audioContextRef.current) audioContextRef.current = new AudioContext();
        if (!audioRef.current) audioRef.current = new Audio(audioUrl);
        // local analyser
        let local;

        if (!sourceRef.current) {
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            // connect audio to analyser
            local = audioContextRef.current.createAnalyser();
            sourceRef.current.connect(local);
            local.connect(audioContextRef.current.destination);
            // move to state 
            setAnalyser(local)
        }

        const handleEnded = () => setIsPlaying(false);
        getAudioPeaks();
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

        if (!audioRef.current) return; 

        audioRef.current.play()
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
            {analyser && peaks.length > 0 && <AudioWave peaks = {peaks} analyserNode = {analyser} isPlaying = {isPlaying} />}
            <div className={styles.cardMetadata}>
            <small>{location}</small>
            <small>{timeAgo}</small>
            </div>
        </div>
        </div>
  );
}