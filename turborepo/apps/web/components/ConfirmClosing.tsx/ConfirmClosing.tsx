import styles from "./ConfirmClosing.module.css";

type Props = {
    onClose: () => void;
    setClosing: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ConfirmClosing ({setClosing, onClose} : Props ) {
    return (
    <div className={styles.closePopup}>
        <div className={styles.innerCard}>
            <h2>Are you sure you want to close? </h2>
            <p>You'll lose all progress</p>
            <span>
            <button type="button" onClick={() => setClosing(false)}>
                Cancel
            </button>
            <button type="button" onClick={onClose}>
                Yes
            </button>
            </span>
        </div>
    </div>
    )
}