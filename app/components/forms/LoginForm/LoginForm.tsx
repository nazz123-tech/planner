"use client";
import { useForm } from "react-hook-form";
import { LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { buildLoginSchema } from "../schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { resetPassword, signInWithEmail } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { GoogleAuth } from "../../ui/GoogleAuth/GoogleAuth";
import styles from "./Login.module.css";
import Link from "next/link";
import { useT } from "@/app/i18n/LanguageProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginFormData {
    email: string;
    password: string;
}
export const LoginForm = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const t = useT();
    // Rebuilt when the language changes so error text follows it.
    const schema = useMemo(() => buildLoginSchema(t), [t]);
    const {
        register,
        handleSubmit,
        setError,
        getValues,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(schema),
    });

    const handleForgotPassword = async () => {
        const email = (getValues("email") ?? "").trim();

        if (!EMAIL_PATTERN.test(email)) {
            setError("email", {
                type: "manual",
                message: t("auth.enterEmailAbove"),
            });
            toast.error(t("auth.enterEmailFirst"));
            return;
        }

        setIsResetting(true);
        try {
            await resetPassword(email);
            toast.success(t("auth.resetSent", { email }));
        } catch (error) {
            const code = (error as { code?: string }).code;
            if (code === "auth/invalid-email") {
                toast.error(t("auth.invalidEmailAddress"));
            } else if (code === "auth/too-many-requests") {
                toast.error(t("auth.tooManyAttempts"));
            } else {
                toast.error(t("auth.resetFailed"));
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
                err.response?.data?.message || t("auth.userNotFound");

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
                <h2 className={styles.title}>{t("auth.login.title")}</h2>
            </div>

            <form
                className={styles.formBlock}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className={styles.field}>
                    <label className={styles.label}>{t("auth.email")}</label>
                    <input
                        className={styles.input}
                        {...register("email")}
                        placeholder={t("auth.emailPlaceholder")}
                    ></input>
                    {errors.email && (
                        <p className={styles.error}>{errors.email.message}</p>
                    )}
                </div>
                <div className={styles.field}>
                    <label className={styles.label}>{t("auth.password")}</label>
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
                        {isResetting ? t("auth.sendingLink") : t("auth.forgotPassword")}
                    </button>
                </div>

                <div className={styles.buttonsGroup}>
                    <button className={styles.signIn} type="submit">
                        <LogIn />
                        {t("auth.signIn")}
                    </button>
                    <span className={styles.line} />
                    <div className={styles.divider}>
                        <div className={styles.line}></div>
                        <span>{t("auth.or")}</span>
                        <div className={styles.line}></div>
                    </div>
                    <span className={styles.line} />
                    <GoogleAuth></GoogleAuth>
                </div>
            </form>
            <Link className={styles.link} href={"/register"}>
                {t("auth.firstTime")} <span>{t("auth.signUpHere")}</span>
            </Link>
        </div>
    );
};

