import { loginAction, registerAction } from "@/actions/auth";
import type { LoginDto, RegisterDto } from "@/validations/auth.validation";

export async function loginService(input: LoginDto) {
  const result = await loginAction(input);
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export async function registerService(input: RegisterDto) {
  const result = await registerAction(input);
  if (!result.ok) {
    throw new Error(result.error);
  }
}
