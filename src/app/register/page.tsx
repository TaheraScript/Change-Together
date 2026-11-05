import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account | Change Together",
  description:
    "Join Change Together to organise community events and volunteer for drives near you.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      badge="Join the movement"
      title={
        <>
          Create your <span className="text-[#16A34A]">Volunteer account.</span>
        </>
      }
      subtitle="One account to join drives, publish events and keep every action you take in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#164E63] underline-offset-4 transition hover:text-[#16A34A] hover:underline"
          >
            Log in instead
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
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
