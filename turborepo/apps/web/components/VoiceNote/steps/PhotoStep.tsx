import styles from "./PhotoStep.module.css";
import useImageIntake from "../hooks/useImageIntake";
import useImageFocusAdjust from "../hooks/useImageFocusAdjust";
import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
    imageIntake: ReturnType<typeof useImageIntake>,
    onConfirm: () => void,
};

export default function PhotoStep ({imageIntake, onConfirm} : Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const cameraInputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState('');
    const adjust = useImageFocusAdjust({
        imageUrl: imageIntake.imageUrl,
        aspectRatio: imageIntake.aspectRatio,
        focus: imageIntake.focus,
    });

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
            <div className={styles.uploadActions}>
                <label className = {styles.photoUpload} onClick={() => {
                    inputRef.current?.click();
                    setError('');
                }}>
                    Upload an image
                </label>
                <label className={styles.cameraCapture} onClick={() => {
                    cameraInputRef.current?.click();
                    setError('');
                }}>
                    Take photo
                </label>
            </div>
            <input className = {styles.inputBtn}
                ref = {inputRef}
                type="file" 
                id="photo" 
                name="photo" 
                accept="image/*"
                onChange={imageIntake.handleFileChange}
                />
            <input
                className={styles.inputBtn}
                ref={cameraInputRef}
                type="file"
                id="camera-photo"
                name="camera-photo"
                accept="image/*"
                capture="environment"
                onChange={imageIntake.handleFileChange}
            />
            <div
                ref={adjust.frameRef}
                className= {
                    `${styles.imgContainer} 
                    ${adjust.isAdjusting && adjust.canAdjust ? styles.adjusting : ''} 
                    ${adjust.isDragging ? styles.dragging : ''}`
                }
                onPointerDown={adjust.onPointerDown}
                onPointerMove={adjust.onPointerMove}
                onPointerUp={adjust.onPointerUp}
                onPointerCancel={adjust.onPointerCancel}
            >
                {imageIntake.imageUrl && (
                    <Image
                        src={imageIntake.imageUrl}
                        alt="preview"
                        fill
                        draggable={false}
                        className={`${styles.previewImage} ${adjust.shouldContain ? styles.containPreview : ''}`}
                        style={{ objectPosition: adjust.isAdjusting ? adjust.draftObjectPosition : imageIntake.objectPosition }}
                    />
                )}
            </div>

            {adjust.isAdjusting && imageIntake.imageUrl && (
                <div className={styles.adjustControls}>
                    <small className={styles.adjustHint}>Drag the image to choose what stays in frame.</small>
                    <span className={styles.adjustButtons}>
                        <button type="button" onClick={adjust.cancelAdjust}>Cancel</button>
                        <button type="button" onClick={() => adjust.applyAdjust(imageIntake.setFocus)}>Apply</button>
                    </span>
                </div>
            )}
            
            {!adjust.isAdjusting && (
                <span className={`${styles.imgButtons} ${!imageIntake.imageUrl ? styles.hidden : ''}`}>
                    <span className = {styles.btnSubgroup}>
                        <button type="button" onClick={() => {
                            imageIntake.clearImage();
                            adjust.stopAdjusting();
                        }}>Delete</button>
                        <button
                            type="button"
                            disabled={!adjust.canAdjust}
                            onClick={() => {
                            if (!adjust.canAdjust) return;
                            adjust.beginAdjust();
                            setError('');
                    }}>Adjust</button>
                    </span>
                    <button type="button" onClick={handleConfirm}>Next</button>
                </span>
            )}
            <small className={styles.errorMsg}>{error}</small>
        </div>
    );
}