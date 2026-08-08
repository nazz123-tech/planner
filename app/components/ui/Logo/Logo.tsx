import styles from "./Logo.module.css";
export const Logo = () => {
    return (
        <span className={styles.planlyLogo}>
            planly<span className={styles.cursor}></span>
        </span>
    );
};
