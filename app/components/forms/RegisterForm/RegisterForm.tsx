"use client";
import { useForm } from "react-hook-form";
import { registerSchema } from "../schemas";
import { yupResolver } from "@hookform/resolvers/yup";
import { signUp } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { GoogleAuth } from "../../ui/GoogleAuth/GoogleAuth";
import Link from "next/link";
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}
export const RegisterForm = () => {
  const router = useRouter();
  const { register, handleSubmit, setError } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
  });
  const onSubmit = async (data: RegisterFormData) => {
    await signUp(data);
    router.push("/");
  };
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input {...register("name")}></input>
        </div>

        <div>
          <input {...register("email")}></input>
        </div>
        <div>
          <input type="password" {...register("password")}></input>
        </div>
        <button type="submit">Sign Up</button>
        <GoogleAuth></GoogleAuth>
      </form>
      <Link href={"/login"}>Alreay have an account?</Link>
    </div>
  );
};
