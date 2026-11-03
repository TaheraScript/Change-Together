"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { signIn } from "@/lib/auth-client";

import { toast } from "@/components/ui/toast";
import { checkPassword, isPasswordValid, isValidEmail } from "@/lib/utils";
import GoogleButton from "@/components/auth/GoogleButton";

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

const inputBase =
  "h-12 w-full rounded-xl border bg-slate-50/70 pl-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4";
const inputState = (invalid: boolean) =>
  invalid
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-[#16A34A] focus:ring-green-100";
const iconBase =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#16A34A]";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const destination =
    nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Live password rules: uppercase, lowercase and at least 6 characters.
  const passwordChecks = checkPassword(password);
  const rulesMet = passwordChecks.filter((check) => check.met).length;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors: FormErrors = {};
    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (!isPasswordValid(password)) {
      nextErrors.password =
        "Password needs an uppercase letter, a lowercase letter and at least 6 characters.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.add({
        type: "error",
        title: nextErrors.password ? "Password too weak" : "Check your details",
        description: Object.values(nextErrors)[0],
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { data, error } = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe: true,
      });

      if (error) {
        const message =
          error.message ?? "Something went wrong. Please try again.";
        setErrors({ form: message });
        toast.add({
          type: "error",
          title: "Couldn't log you in",
          description: message,
        });
        return;
      }

      toast.add({
        type: "success",
        title: `Welcome back, ${(data?.user?.name ?? "friend").split(" ")[0]}!`,
        description: "You're signed in. Let's make something better today.",
      });
      router.push(destination);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setErrors({ form: message });
      toast.add({
        type: "error",
        title: "Couldn't log you in",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
          >
            <TriangleAlert size={15} className="mt-0.5 shrink-0" />
            {errors.form}
          </div>
        )}

        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <div className="group relative">
            <Mail size={17} className={iconBase} />
            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({
                  ...current,
                  email: undefined,
                  form: undefined,
                }));
              }}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              disabled={loading}
              className={`${inputBase} ${inputState(Boolean(errors.email))} pr-3.5 disabled:cursor-not-allowed disabled:opacity-70`}
            />
          </div>
          {errors.email && (
            <p
              id="login-email-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() =>
                toast.add({
                  type: "info",
                  title: "Password reset",
                  description:
                    "Reset emails aren't connected yet. Write to volunteer@changetogether.org and we'll help you back in.",
                })
              }
              className="text-xs font-semibold text-[#16A34A] transition hover:text-green-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="group relative">
            <Lock size={17} className={iconBase} />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({
                  ...current,
                  password: undefined,
                  form: undefined,
                }));
              }}
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="login-password-rules"
              disabled={loading}
              className={`${inputBase} ${inputState(Boolean(errors.password))} pr-11 disabled:cursor-not-allowed disabled:opacity-70`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <div
            id="login-password-rules"
            className="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((segment) => (
                  <span
                    key={segment}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      rulesMet > segment
                        ? rulesMet === 3
                          ? "bg-[#16A34A]"
                          : "bg-[#F59E0B]"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {rulesMet === 3 ? "Valid" : rulesMet > 0 ? "Almost" : "Required"}
              </span>
            </div>

            <ul className="mt-2 grid gap-1">
              {passwordChecks.map((check) => (
                <li
                  key={check.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    check.met ? "text-green-700" : "text-slate-400"
                  }`}
                >
                  {check.met ? (
                    <CheckCircle2 size={14} className="shrink-0" />
                  ) : (
                    <Circle size={14} className="shrink-0" />
                  )}
                  {check.label}
                </li>
              ))}
            </ul>
          </div>

          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#164E63] text-sm font-semibold text-white shadow-lg shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#164E63]/25 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing you in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 pt-1">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            or
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <GoogleButton
          destination={destination}
          onError={(message) => setErrors({ form: message })}
        />

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-[#16A34A]" />
          Secured with Better Auth.
        </p>
      </form>
    </div>
  );
}