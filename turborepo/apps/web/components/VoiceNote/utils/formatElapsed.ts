export function formatElapsed(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}