import styles from "./ScrubTooltip.module.css";
import { formatTime } from "../AudioWave/Utils/drawingUtils";

type TooltipProps = {
    scrubPercent: number | null,
    playedPercent: number,
    duration: number,
}

export default function ScrubTooltip ({ scrubPercent, playedPercent, duration }: TooltipProps) {
    const currentSeconds = (scrubPercent ?? playedPercent) * duration;
    return (
        <p className={`${styles.tooltip}${scrubPercent !== null ? ` ${styles.scrubbing}` : ""}`}>
            {formatTime(currentSeconds)} / {formatTime(duration)}
        </p>
    );
}