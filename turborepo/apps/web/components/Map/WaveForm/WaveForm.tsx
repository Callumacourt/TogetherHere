import styles from "./WaveForm.module.css";

export default function WaveForm() {
    // placeholder until i get real audio clips
    const waves = Array.from({ length: 12 }, () => {
        return Math.random() * 50 + 10; 
    });

    return (
        <section className={styles.waveContainer}>
            {waves.map((height, i) => (
                <div
                    key={i}
                    className={styles.wave}
                    style={{ height: `${height}px` }}
                />
            ))}
        </section>
    );
}