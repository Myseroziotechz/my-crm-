import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <LoginForm next={next && next.startsWith("/") ? next : "/"} />
    </div>
  );
}
