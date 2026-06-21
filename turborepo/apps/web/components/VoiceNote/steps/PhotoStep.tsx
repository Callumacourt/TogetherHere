import styles from "./PhotoStep.module.css";
import useImageIntake from "../hooks/useImageIntake";

type Props = {
    imageIntake: ReturnType<typeof useImageIntake>;
    onConfirm: () => void;
};

export default function PhotoStep ({imageIntake, onConfirm} : Props) {
    return (
        <div className={styles.photoStepContainer}>
            <form action="">
                <label htmlFor="photo">Choose from gallery</label>
                <input className = {styles.inputBtn}
                    type="file" 
                    id="photo" 
                    name="photo" 
                    accept="image/*"
                    onChange={imageIntake.handleFileChange}
                />
            </form>
            <div className={styles.imgContainer}>
                {imageIntake.imageUrl && <img src={imageIntake.imageUrl} alt="preview" />}
            </div>
            <span className = {styles.imgButtons}>
                <button type="button" onClick={() => imageIntake.setImgUrl('')}>Delete</button>
                <button type="button" onClick={onConfirm}>Next</button>
            </span>
        </div>
    );
}