import styles from "./Popup.module.css";
import Image from "next/image";
import AudioWave from "../../AudioWave/AudioWave";
import useAudioPlayer from "../../AudioWave/Utils/useAudioPlayer";

type PopupCardProps = {
  url: string;
  audioUrl: string;
  location: string;
  timeAgo: string;
};

export default function PopupCard({ url, audioUrl, location, timeAgo }: PopupCardProps) {
    const player = useAudioPlayer(audioUrl);

    // Render a lightweight skeleton while player initialises
    if (!player) {
        return (
            <div className={styles.popupCard}>
                <div className={styles.cardImg} style={{background: "rgba(255,255,255,0.03)", height: 250}} />
                <div className={styles.cardContent}>
                    <div className={styles.mediaSection}>
                        <div style={{width:48, height:48, background:"rgba(255,255,255,0.04)", borderRadius:8}} />
                        <div style={{flex:1, height:56, marginLeft:12, background:"rgba(255,255,255,0.02)"}} />
                    </div>
                    <div className={styles.cardMetadata}>
                        <small>Loading…</small>
                    </div>
                </div>
            </div>
        );
    }

    const { duration, isPlaying, peaks, playbackPercent, waveRef, handlePlay, handlePause, handleSkip } = player;

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
                            variant="map"
                            duration={duration}
                            ref={waveRef}
                            playedPercent={playbackPercent}
                            isPlaying={isPlaying}
                            handleSkip={handleSkip}
                            handlePause={handlePause}
                            handlePlay={handlePlay}
                            peaks={peaks}
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