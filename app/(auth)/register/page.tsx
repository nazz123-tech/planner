import { RegisterForm } from "@/app/components/forms/RegisterForm/RegisterForm";
import { Logo } from "@/app/components/ui/Logo/Logo";
import styles from "./page.module.css";

export default function RegisterPage() {
    return (
        <div className={styles.registerPage}>
            <Logo />
            <RegisterForm />
        </div>
    );
}

