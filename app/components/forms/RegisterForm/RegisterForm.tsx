"use client";
import { useForm } from "react-hook-form";
import { buildRegisterSchema } from "../schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUp } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { GoogleAuth } from "../../ui/GoogleAuth/GoogleAuth";
import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./RegisterForm.module.css";
import Link from "next/link";
import { useT } from "@/app/i18n/LanguageProvider";
export interface RegisterFormData {
    email: string;
    password: string;
    name: string;
}
export const RegisterForm = () => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const t = useT();
    const schema = useMemo(() => buildRegisterSchema(t), [t]);
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await signUp(data);
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
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.header}>
                <h2 className={styles.title}>{t("auth.register.title")}</h2>
            </div>

            <form
                className={styles.formBlock}
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className={styles.field}>
                    <label className={styles.label}>{t("auth.name")}</label>
                    <input
                        className={styles.input}
                        {...register("name")}
                        placeholder={t("auth.namePlaceholder")}
                    />
                    {errors.name && (
                        <p className={styles.error}>{errors.name.message}</p>
                    )}
                </div>

                <div className={styles.field}>
                    <label className={styles.label}>{t("auth.email")}</label>
                    <input
                        className={styles.input}
                        {...register("email")}
                        placeholder={t("auth.emailPlaceholder")}
                    />
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
                        >
                            {isVisible ? <Eye /> : <EyeOff />}
                        </button>
                    </div>

                    {errors.password && (
                        <p className={styles.error}>
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {errors.root?.serverError && (
                    <p className={styles.error}>
                        {errors.root.serverError.message}
                    </p>
                )}

                <div className={styles.buttonsGroup}>
                    <button
                        className={styles.signUp}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t("auth.signingUp") : t("auth.signUp")}
                    </button>
                    <div className={styles.divider}>
                        <div className={styles.line} />
                        <span>{t("auth.or")}</span>
                        <div className={styles.line} />
                    </div>
                    <GoogleAuth />
                </div>
            </form>

            <Link className={styles.link} href="/login">
                {t("auth.haveAccount")} <span>{t("auth.signInHere")}</span>
            </Link>
        </div>
    );
};

