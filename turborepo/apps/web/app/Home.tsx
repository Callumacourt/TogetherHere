'use client'

import styles from "../styles/Hero.module.css";
import Image from "next/image";
import Map from "../components/Map/Map";
import { useState } from "react";

export default function Home() {

  const [ loading, setIsLoading ] = useState(false);
  const [ sent, setSent ] = useState(false);
  const [ emailError, setEmailError ] = useState("");

  async function handleSubmit (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading || sent) return;

    setIsLoading(true);
    
    const email = new FormData(e.currentTarget).get("email");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({
        email: email,
      }),
      headers: {
        'Content-type': 'application.json',
      }
    });

    if (!res.ok) {
      setEmailError("Error sending email");
      return;
    }
  
    setIsLoading(false);
    setSent(true);
  }

  return (
    <main className={styles.home}>
      <section className={styles.heroContainer}>
        <Image
          src={"/images/hero/heroImg.jpg"}
          className={styles.heroImg}
          alt="An urban street scene"
          fill
          priority
          sizes="100vw"
          quality={75}
        />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Together. Here.</h1>
          <div className={styles.heroSubtitle}>
            <p>A digital archive of human presence</p>
          </div>
        </div>

        <div className={styles.emailSection}>
          <h2 className={styles.emailHeader}>Early Access</h2>
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
                  <Image src="/icons/arrow-right.svg" alt="" width={20} height={20} />
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
  <section className={styles.explanationSection}>
    <div className={styles.explanationContent}> 
        <h2>We all have something to say</h2>
          <p>
            Every voice you walk past unheard
          </p>
        <div className={styles.explanationImgContainer}>
        <Image
          src="/images/hero/explanationImg.jpg"
          className={styles.explanationImg}
          alt="A person riding a bike through a city"
          width={500}
          height={650}
          quality={75}
        />
        <small>Random Street. 12:54PM</small>
      </div>
          <p>
            An experiment in spatial empathy hoping to 
            visualise the sound of our collective 
            living within our collective space. 
          </p>
        <button className={styles.cta2}>Drop A Note</button>
    </div>
</section>
<section className = {styles.mapSection}>
  <Map/>
</section>
    </main>
  );
}
