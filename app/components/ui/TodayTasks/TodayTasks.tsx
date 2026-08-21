import { Task } from "@/app/types/task";
import styles from "./TodayTasks.module.css";

import { EmptyTask } from "../Empty/EmptyTask/EmptyTask";
interface TodayTasksProps {
    tasks: Task[];
    onDone: () => void;
    onCreate: () => void;
}
export const TodayTasks = ({ tasks, onDone, onCreate }: TodayTasksProps) => {
    return (
        <div className={styles.tasks}>
            <div className={styles.card}>
                <ul className={styles.list}>
                    {tasks.length > 0 && (
                        <span className={styles.sectionLabel}>
                            01 / Today tasks
                        </span>
                    )}
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
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
                        ))
                    ) : (
                        <EmptyTask onCreate={onCreate} />
                    )}
                </ul>
            </div>
        </div>
    );
};
