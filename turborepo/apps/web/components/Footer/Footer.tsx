import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <small>© {new Date().getFullYear()} TogetherHere</small>
        <nav className={styles.links} aria-label="Footer">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="mailto:@togetherhere@gmail.com">Contact</a>
        </nav>
      </div>
    </footer>
  );
}