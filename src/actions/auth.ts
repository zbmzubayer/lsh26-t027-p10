"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createSession,
  getSession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import prisma from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/validations/auth.validation";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function loginAction(input: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: false, error: "Invalid email or password" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { ok: false, error: "Invalid email or password" };
  }

  await createSession(user);
  return { ok: true };
}

export async function registerAction(input: unknown): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "An account with this email already exists" };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
    },
  });

  await createSession(user);
  return { ok: true };
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function currentSession() {
  return getSession();
}
