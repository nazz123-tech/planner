import { LoginForm } from "@/app/components/forms/LoginForm/LoginForm";
import styles from "./page.module.css";
import { Logo } from "@/app/components/ui/Logo/Logo";

export default function LoginPage() {
    return (
        <div className={styles.loginPage}>
            <Logo/>
            <LoginForm />
        </div>
    );
}

