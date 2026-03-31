'use client'

import styles from "./styles/Hero.module.css";
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const [ loading, setIsLoading ] = useState(false);
  const [ sent, setSent ] = useState(false);

  async function handleSubmit (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || sent) return;

    setIsLoading(true);
    
    // api call here
    await new Promise((r) => setTimeout(r, 1200));

    setIsLoading(false);
    setSent(true);
  }

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
            <p className={styles.step1}>We are all here.</p>
            <p className={styles.step2}>Together.</p>
          </div>
        </div>

        <div className={styles.emailSection}>
          <h2 className={styles.emailHeader}>Register Interest</h2>
          <form onSubmit={handleSubmit} className={styles.emailForm}>
            <div className={styles.inputWrapper}>
              <input
                className={styles.emailInput}
                type="email"
                name="email"
                placeholder="youremail@example.com"
              />
              <button type="submit" className={styles.submitButton} aria-label="Submit">
                {loading ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : sent ? (
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <Image src="/arrow-right.svg" alt="" width={20} height={20} />
                )}
              </button>
            </div>
          </form>

          {sent && (
            <small className={`${styles.successMsg} ${styles.typewriter}`} aria-live="polite">
              Thank you. We'll be in touch with updates.
            </small>
          )}
        </div>
      </section>
    </main>
  );
}
