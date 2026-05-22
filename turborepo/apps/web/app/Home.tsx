'use client'

import styles from "../styles/Hero.module.css";
import Image from "next/image";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("../components/Map/Map"), { ssr: false });
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
      <section className = {styles.mapSection}>
  <Map/>
</section>
  <section className={styles.explanationSection}>
    <div className={styles.explanationContent}> 
        <h2>We each have something to say</h2>
        <div className={styles.explanationImgContainer}>
        <Image
          src="/images/hero/explanationImg.jpg"
          className={styles.explanationImg}
          alt="A person riding a bike through a city"
          width={500}
          height={650}
          quality={75}
        />
        <small>North Street. 12:54PM</small>
      </div>
          <p>
            We're building an archive of the things we feel pinned to the exact
            places where we felt them. A private diary scattered across public spaces.
          </p>
          <p>
              If you have a thought you want to leave behind before we launch
          </p>
        <button className={styles.cta2}>Leave it here</button>
    </div>
</section>
    </main>
  );
}
