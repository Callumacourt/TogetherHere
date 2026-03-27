import styles from "./styles/Home.module.css";

export default function Home() {
  return (
    <>
      <section className = {styles.cta}>
          <h1>Together Here</h1>
          <h3>A digital archive of human presence. Leave your trace, listen to anothers voice. We are all here together.</h3>
      </section>
      <section>
          <h2>Claim A Note! First 50</h2>
          <form action="">
              <input type="email" />
          </form>
      </section>
      <section className = {styles.explanation}>
          <p>
            We walk amongst each other every day, each of us carrying a world in our mind. This project is a 
            non profit experiment in spatial empathy. Leave a voice note of what's on your mind and a picture of where you are
            to help us map the heart of Cardiff. 
          </p>
      </section>
      <section className={styles.transparency}>
          <h3>Built With Integrity</h3>
          <p>View our GitHub to see how we handle your data. </p>
      </section>
    </>
  );
}
