import React, { useEffect, useRef, useState } from "react";
import styles from "./PhotoStep.module.css";

type Props = {
    onConfirm: () => void
}

export default function PhotoStep ({onConfirm} : Props) {
    const [imageUrl, setImgUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const imgFile = e.target.files?.[0];
        if (!imgFile) return;

        const url = URL.createObjectURL(imgFile);
        setImgUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
        });
    };

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
    }, [imageUrl]);

    return (
        <div className={styles.photoStepContainer}>
            <form action="">
                <label htmlFor="photo">Choose from gallery</label>
                <input className = {styles.inputBtn}
                    type="file" 
                    id="photo" 
                    name="photo" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </form>
            <div className={styles.imgContainer}>
                {imageUrl && <img src={imageUrl} alt="preview" />}
            </div>
            <button type="button" onClick={() => setImgUrl('')}>Delete</button>
            <button type="button" onClick={onConfirm}>Next</button>
        </div>
    );
}