import styles from "./WaveForm.module.css";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function WaveForm({ seed }: { seed: number }) {
  const rand = seededRandom(seed);
  const waves = Array.from({ length: 12 }, () => rand() * 50 + 10);

  return (
    <section
    onTouchStart={(e) => e.stopPropagation()}
     className={styles.waveContainer}>
      {waves.map((height, i) => (
        <div key={i} className={styles.wave} style={{ height: `${height}px` }} />
      ))}
    </section>
  );
}