import styles from "./styles/Hero.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <main className={styles.home}>
      <section className={styles.heroContainer}>
        <Image
          src={"/heroImg.jpg"}
          className={styles.heroImg}
          alt="An urban street scene"
          fill
          priority
          sizes="100vw"
          quality={90}
        />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Together. Here.</h1>
          <div className={styles.heroSubtitle}>
            <p>A digital archive of human presence</p>
            <p className={styles.step1}>Leave your trace,</p>
            <p className={styles.step2}>Listen to anothers voice.</p>
            <p className={styles.step3}>We are all here.</p>
            <p className={styles.step4}>Together.</p>
          </div>
        </div>

        <div className={styles.emailSection}>
          <h2 className={styles.emailHeader}>Register Interest</h2>
          <form className={styles.emailForm}>
            <div className={styles.inputWrapper}>
              <input
                className={styles.emailInput}
                type="email"
                name="email"
                placeholder="youremail@example.com"
              />
              <button type="submit" className={styles.submitButton} aria-label="Submit">
                <Image
                  src="/arrow-right.svg"
                  alt=""
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
