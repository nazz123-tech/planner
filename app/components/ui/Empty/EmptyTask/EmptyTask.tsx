import styles from "./EmptyTask.module.css";
interface EmptyTaskProps {
    onCreate: () => void;
}
export const EmptyTask = ({ onCreate }: EmptyTaskProps) => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>There are no tasks for today</h2>
            <p className={styles.subtext}>
                Add your first task and it will appear here with the progress of
                the day
            </p>
            <button className={styles.createButton} onClick={onCreate}>
                + Create task
            </button>
        </div>
    );
};
