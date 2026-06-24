import { ClipLoader } from "react-spinners";
import styles from "./LoadingSpinner.module.css";

type Props = {
    loading: boolean,
    caption: string,
}

export default function LoadingSpinner ({ loading, caption } : Props) {
    return (
        <div className = {styles.spinnerContainer}>
            <p>{caption}</p>
            <ClipLoader
                color="white"
                loading = {loading}
                size={150}
                aria-label = "Loading spinner"
            />
        </div>
    )
}