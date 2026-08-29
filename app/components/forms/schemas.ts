import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup.string().email().required("Email is required"),
    password: yup.string().min(6).required("Password is required"),
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
    title: yup.string().required("Title is required"),
    description: yup.string().optional(),
    categoryId: yup.string().optional(),
    date: yup.string().optional(),
  time: yup.string().optional(),
});
export type CreateFormData = yup.InferType<typeof createFormSchema>;


export const boardFormSchema = yup.object({
    name: yup.string().min(3).max(30).required("Name is required"),
    color: yup.string().optional(),
    emoji:yup.string().required("Emoji is required")
})