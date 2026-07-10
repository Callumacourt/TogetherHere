import styles from "./SuccessStep.module.css";
import { IconCheck } from '@tabler/icons-react';
import Image from "next/image";

type Props = {
    onClose: () => void
}

export default function SuccessStep ({onClose} : Props ) {
  return (
    <div className={styles.successContainer}>

      <div className={styles.body}>
        <div className={styles.checkContainer}>
          <IconCheck size={24} stroke={1.5} color="rgba(255,255,255,0.9)" />
        </div>
        <h2 className={styles.heading}>Thanks for contributing</h2>
        <p className={styles.sub}>Your note has been submitted. Keep an eye out on our newsletter for updates.</p>
      </div>

      <div className={styles.footer}>
        <span className={styles.contactUs}>
          <p className={styles.contactLabel}>Want to work with us?</p>
          <span className={styles.contactLink}>
              <a href="mailto:togetherhere@gmail.com">Contact us</a>
              <Image src={"/icons/white-arrow-right.svg"} alt="->" width={16} height={16} />
          </span>
        </span>
        <button onClick={onClose} className={styles.doneBtn}>Done</button>
      </div>

    </div>
  );
}