"use client";
import { useForm } from "react-hook-form";
import { loginSchema } from "../schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { signInWithEmail } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { GoogleAuth } from "../../ui/GoogleAuth/GoogleAuth";
import Link from "next/link";
export interface LoginFormData {
  email: string;
  password: string;
}
export const LoginForm = () => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });
  const onSubmit = async (data: LoginFormData) => {
    await signInWithEmail(data);
    router.push("/");
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input {...register("email")}></input>
        </div>
        <div>
          <input type="password" {...register("password")}></input>
        </div>
        <button type="submit">Sign Up</button>
        <GoogleAuth></GoogleAuth>
      </form>
      <Link href={"/register"}>First time?</Link>
    </div>
  );
};
