import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in | Change Together",
  description:
    "Log in to Change Together to join community drives or organise your own event.",
};

export default function LoginPage() {
  return (
    <AuthShell
      badge="Welcome back"
      title={
        <>
          Log in to keep{" "}
          <span className="text-[#16A34A]">the change going.</span>
        </>
      }
      subtitle="Pick up where you left off — join a drive near you or publish your own community event."
      footer={
        <>
          New to Change Together?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#164E63] underline-offset-4 transition hover:text-[#16A34A] hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}