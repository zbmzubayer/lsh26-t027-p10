"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { loginService } from "@/services/auth.api";
import { type LoginDto, loginSchema } from "@/validations/auth.validation";

export function LoginForm() {
  const router = useRouter();
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "zbm.abir148025@gmail.com",
      password: "zbm.abir148025@gmail.com",
    },
  });

  const { mutateAsync, error, isPending } = useMutation({
    mutationFn: loginService,
    onSuccess: () => {
      router.replace("/dashboard");
    },
  });

  async function onSubmit(data: LoginDto) {
    await mutateAsync(data);
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-flex mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Zap className="h-6 w-6 fill-primary text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue tracking your prepaid meter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState: { error: fieldError } }) => (
              <Field>
                <div className="flex w-full items-center justify-between">
                  <FieldLabel>Email</FieldLabel>
                  {fieldError && (
                    <FieldError className="flex items-center gap-1">
                      <AlertCircleIcon className="size-3.5" />
                      {fieldError.message}
                    </FieldError>
                  )}
                </div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </Field>
            )}
          />
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState: { error: fieldError } }) => (
              <Field>
                <div className="flex w-full items-center justify-between">
                  <FieldLabel>Password</FieldLabel>
                  {fieldError && (
                    <FieldError className="flex items-center gap-1">
                      <AlertCircleIcon className="size-3.5" />
                      {fieldError.message}
                    </FieldError>
                  )}
                </div>
                <PasswordInput
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...field}
                />
              </Field>
            )}
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner className="mr-2" />}
            Sign in
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
