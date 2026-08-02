import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});
export const registerSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});
export const createTaskSchema = yup.object({
  title: yup.string().required(),
  description: yup.string().optional(),
  date: yup.string().required(),
  time: yup.string(),
  categoryId: yup.string(),
});
