"use client";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema } from "../schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassword, signInWithEmail } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuth } from "../../ui/GoogleAuth/GoogleAuth";
import styles from "./Login.module.css";
import Link from "next/link";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormData {
    email: string;
    password: string;
}
export const LoginForm = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
    });

    const handleForgotPassword = async () => {
        const email = (getValues("email") ?? "").trim();

        if (!EMAIL_PATTERN.test(email)) {
            setError("email", {
                type: "manual",
                message: "Enter your email above to reset your password",
            });
            toast.error("Enter your email above first");
            return;
        }

        setIsResetting(true);
        try {
            await resetPassword(email);
            toast.success(`Password reset link sent to ${email}`);
        } catch (error) {
            const code = (error as { code?: string }).code;
            if (code === "auth/invalid-email") {
                toast.error("That email address looks invalid");
            } else if (code === "auth/too-many-requests") {
                toast.error("Too many attempts — try again in a few minutes");
            } else {
                toast.error("Couldn't send the reset email. Try again");
            }
        } finally {
            setIsResetting(false);
        }
    };
    const onSubmit = async (data: LoginFormData) => {
        try {
            await signInWithEmail(data);
            router.push("/");
        } catch (error) {
            const err = error as Error & {
                response?: { data?: { message?: string } };
            };
            const errorMessage =
                err.response?.data?.message || "User not found";

            setError("root.serverError", {
                type: "manual",
                message: errorMessage,
            });
            toast.error(errorMessage);
        }
    };
    return (
        <div className={styles.form}>
            <div className={styles.header}>
                <h2 className={styles.title}>Login</h2>
            </div>

            <form
                className={styles.formBlock}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className={styles.field}>
                    <label className={styles.label}>EMAIL</label>
                    <input
                        className={styles.input}
                        {...register("email")}
                        placeholder="your@email.com"
                    ></input>
                    {errors.email && (
                        <p className={styles.error}>{errors.email.message}</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>PASSWORD</label>
                    <div className={styles.inputWrapper}>
                        <input
                            className={styles.input}
                            type={isVisible ? "text" : "password"}
                            {...register("password")}
                            placeholder="••••••••"
                        />
                        <button
                            onClick={() => setIsVisible((prev) => !prev)}
                            className={styles.showPass}
                            type="button"
                        >
                            {isVisible ? <Eye /> : <EyeOff />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className={styles.error}>
                            {errors.password.message}
                        </p>
                    )}
                    <button
                        type="button"
                        className={styles.linkPass}
                        onClick={handleForgotPassword}
                        disabled={isResetting}
                    >
                        {isResetting ? "Sending link…" : "Forgot password?"}
                    </button>
                </div>

                <div className={styles.buttonsGroup}>
                    <button className={styles.signIn} type="submit">
                        <LogIn />
                        Sign In
                    </button>
                    <span className={styles.line} />
                    <div className={styles.divider}>
                        <div className={styles.line}></div>
                        <span>OR</span>
                        <div className={styles.line}></div>
                    </div>
                    <span className={styles.line} />
                    <GoogleAuth></GoogleAuth>
                </div>
            </form>
            <Link className={styles.link} href={"/register"}>
                First time? <span>Sign up here!</span>
            </Link>
        </div>
    );
};

