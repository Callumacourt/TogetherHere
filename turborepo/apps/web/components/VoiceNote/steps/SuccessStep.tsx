import styles from "./SuccessStep.module.css";

export default function SuccessStep () {
    return (
        <div className = {styles.successContainer}>
            <span>
            <h2>Thanks for contributing to our project</h2>
            <p>Keep an eye out on our newsletter for updates</p>
            </span>

            <span>
            <h3>Want to work with us in enabling communities?</h3>
            <p>Contact Us</p>
            </span>
        </div>
    )
}