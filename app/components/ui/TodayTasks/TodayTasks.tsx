import { Task } from "@/app/types/task";
import styles from "./TodayTasks.module.css";
interface TodayTasksProps {
    tasks: Task[];
    onDone: () => void;
}
export const TodayTasks = ({ tasks, onDone }: TodayTasksProps) => {
    return (
        <div className={styles.tasks}>
            <div className={styles.header}>
                <span className={styles.sectionLabel}>01 / Today's tasks</span>
                <span className={styles.line}></span>
            </div>
            <div className={styles.card}>
                <ul className={styles.list}>
                    {tasks.map((task) => (
                        <li className={styles.item} key={task.id}>
                            <div className={styles.field}>
                                <input
                                    onChange={onDone}
                                    type="checkbox"
                                    name="status"
                                    id=""
                                />
                                <label>{task.title}</label>
                            </div>

                            <p className={styles.time}>{task.time}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

