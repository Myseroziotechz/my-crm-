"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/app/login/actions";
import { Card, CardBody } from "@/components/ui/Card";
import { FormField, TextInput } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <Card className="w-full max-w-sm">
      <CardBody className="flex flex-col gap-6 py-7">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-ink-900">
            Sign in to MyTechz CRM
          </h1>
          <p className="text-sm text-ink-500">
            Use the email and password your admin set up for you.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="next" value={next} />

          <FormField label="Email" htmlFor="email" required>
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@mytechz.com"
              required
            />
          </FormField>

          <FormField label="Password" htmlFor="password" required>
            <TextInput
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </FormField>

          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {state.error}
            </p>
          )}

          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
