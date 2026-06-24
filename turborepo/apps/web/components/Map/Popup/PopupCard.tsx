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
  const { duration, isPlaying, peaks, playbackPercent, waveRef, handlePlay, handlePause, handleSkip } = player ?? {};

  return (
    <div className={styles.popupCard}>
    <div className={styles.imgWrapper}>
        <Image
            className={styles.cardImg} 
            src={url} 
            alt="" 
            width={250} 
            height={250} 
            style={{ objectFit: "cover" }}/>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.mediaSection}>
          <div className={styles.playBtn}>
            {isPlaying ? (
              <button onClick={handlePause}>
                <Image width={48} height={48} alt="" src="/icons/pause.svg" />
              </button>
            ) : (
              <button onClick={handlePlay} disabled={!player}>
                <Image width={48} height={48} alt="" src="/icons/play.svg" />
              </button>
            )}
          </div>
          {peaks && peaks.length > 0 && (
            <AudioWave
              variant="map"
              duration={duration!}
              ref={waveRef!}
              playedPercent={playbackPercent!}
              isPlaying={!!isPlaying}
              handleSkip={handleSkip!}
              handlePause={handlePause!}
              handlePlay={handlePlay!}
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