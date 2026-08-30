"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
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
import { registerService } from "@/services/auth.api";
import {
  type RegisterDto,
  registerSchema,
} from "@/validations/auth.validation";

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const { mutateAsync, error, isPending } = useMutation({
    mutationFn: registerService,
    onSuccess: () => {
      router.replace("/welcome");
    },
  });

  async function onSubmit(data: RegisterDto) {
    await mutateAsync(data);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Register to start tracking your prepaid meter.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState: { error: fieldError } }) => (
              <Field>
                <div className="flex w-full items-center justify-between">
                  <FieldLabel>Name</FieldLabel>
                  {fieldError && (
                    <FieldError className="flex items-center gap-1">
                      <AlertCircleIcon className="size-3.5" />
                      {fieldError.message}
                    </FieldError>
                  )}
                </div>
                <Input placeholder="Your name" autoComplete="name" {...field} />
              </Field>
            )}
          />
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  {...field}
                />
              </Field>
            )}
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Registration Failed</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Spinner className="mr-2" />}
            Create account
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
