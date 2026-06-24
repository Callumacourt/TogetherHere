import styles from "./ConfirmDeletePopup.module.css";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeletePopup({ onCancel, onConfirm }: Props) {
  return (
    <div className={styles.deletePopup}>
        <div className={styles.innerCard}>
            <h2>Are you sure you want to delete your voice note?</h2>
            <span>
              <button type="button" onClick={onCancel}>
                  Cancel
              </button>
              <button type="button" onClick={onConfirm}>
                  Yes
              </button>
            </span>
        </div>
    </div>
  );
}