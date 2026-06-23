import styles from "./PhotoStep.module.css";
import useImageIntake from "../hooks/useImageIntake";
import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
    imageIntake: ReturnType<typeof useImageIntake>,
    onConfirm: () => void,
};

export default function PhotoStep ({imageIntake, onConfirm} : Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState('');

    function handleConfirm() {
        if (!imageIntake.imageUrl) {
            setError('Please upload an image to continue');
            return;
        }
        setError('');
        onConfirm();
    }

    return (
        <div className={styles.photoStepContainer}>
            <label className = {styles.photoUpload} onClick={() => {
                inputRef.current?.click();
                setError('');
            }}>
                Upload an image</label>
            <input className = {styles.inputBtn}
                ref = {inputRef}
                type="file" 
                id="photo" 
                name="photo" 
                accept="image/*"
                onChange={imageIntake.handleFileChange}
                />
            <div className={styles.imgContainer}>
                {imageIntake.imageUrl && (
                    <Image
                        src={imageIntake.imageUrl}
                        alt="preview"
                        fill
                        style={{ objectFit: "cover" }}
                    />
                )}
            </div>
            <span className={`${styles.imgButtons} ${!imageIntake.imageUrl ? styles.hidden : ''}`}>
                <button type="button" onClick={() => imageIntake.setImgUrl('')}>Delete</button>
                <button type="button" onClick={handleConfirm}>Next</button>
            </span>
            <small className={styles.errorMsg}>{error}</small>
        </div>
    );
}