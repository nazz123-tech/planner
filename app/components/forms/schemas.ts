import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().min(6).required(),
});
export const registerSchema = yup.object({
    name: yup
        .string()
        .min(2, "Minimum 2 characters")
        .required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    password: yup
        .string()
        .min(7, "Minimum 7 characters")
        .required("Password is required"),
});

export const createFormSchema = yup.object({
    title: yup.string().required(),
    description: yup.string().optional(),
    categoryId: yup.string().optional(),
    date: yup.string(),
    time: yup.string().optional(),
});
