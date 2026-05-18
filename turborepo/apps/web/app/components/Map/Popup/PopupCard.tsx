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
    const { isPlaying, peaks, playbackPercent, waveRef, handlePlay, handlePause, handleSkip } = useAudioPlayer(audioUrl);

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
                            ref={waveRef}
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