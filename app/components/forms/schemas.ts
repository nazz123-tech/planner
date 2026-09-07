import * as yup from "yup";
import type { Translate } from "@/app/lib/greetings";

/**
 * Factories rather than module-level constants: the messages have to be
 * resolved with the active language, and a constant would capture whichever
 * language happened to be loaded first. Callers memoise on `t`.
 */

export const buildLoginSchema = (t: Translate) =>
    yup.object({
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup
            .string()
            .min(6, t("validation.min7"))
            .required(t("validation.passwordRequired")),
    });

export const buildRegisterSchema = (t: Translate) =>
    yup.object({
        name: yup
            .string()
            .min(2, t("validation.min2"))
            .required(t("validation.nameRequired")),
        email: yup
            .string()
            .email(t("validation.invalidEmail"))
            .required(t("validation.emailRequired")),
        password: yup
            .string()
            .min(7, t("validation.min7"))
            .required(t("validation.passwordRequired")),
    });

export const buildCreateFormSchema = (t: Translate) =>
    yup.object({
        title: yup.string().required(t("validation.titleRequired")),
        description: yup.string().optional(),
        categoryId: yup.string().optional(),
        date: yup.string().optional(),
        time: yup.string().optional(),
    });

export const buildBoardFormSchema = (t: Translate) =>
    yup.object({
        name: yup
            .string()
            .min(3, t("validation.min2"))
            .max(30, t("validation.max30"))
            .required(t("validation.nameRequired")),
        color: yup.string().optional(),
        emoji: yup.string().required(t("validation.emojiRequired")),
    });

export const buildHabitFormSchema = (t: Translate) =>
    yup.object({
        name: yup
            .string()
            .trim()
            .min(2, t("validation.min2"))
            .max(30, t("validation.max30"))
            .required(t("validation.nameRequired")),
        emoji: yup.string().required(t("validation.pickEmoji")),
        frequencyType: yup
            .string()
            .oneOf(["daily", "weekdays"] as const)
            .required(),
        days: yup
            .array(yup.number().required())
            .when("frequencyType", {
                is: "weekdays",
                then: (schema) => schema.min(1, t("validation.selectDay")),
                otherwise: (schema) => schema,
            })
            .required(),
    });

/**
 * Types are derived from an untranslated instance — the shape is identical
 * whichever language built it, and `yup.InferType` needs a concrete value.
 */
const noop: Translate = (key) => key;

export type CreateFormData = yup.InferType<
    ReturnType<typeof buildCreateFormSchema>
>;
export type HabitFormData = yup.InferType<
    ReturnType<typeof buildHabitFormSchema>
>;
export type BoardFormData = yup.InferType<
    ReturnType<typeof buildBoardFormSchema>
>;

/** Kept so non-reactive callers (tests, defaults) still have a schema. */
export const createFormSchema = buildCreateFormSchema(noop);
export const habitFormSchema = buildHabitFormSchema(noop);
export const boardFormSchema = buildBoardFormSchema(noop);
export const loginSchema = buildLoginSchema(noop);
export const registerSchema = buildRegisterSchema(noop);
