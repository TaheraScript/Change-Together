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
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  TriangleAlert,
  User,
} from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "@/components/ui/toast";
import { checkPassword, isPasswordValid, isValidEmail } from "@/lib/utils";
import GoogleButton from "@/components/auth/GithubButton";

type FormErrors = {
  name?: string;
  email?: string;
  photoURL?: string;
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

function PhotoPreview({ url, name }: { url: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const looksValid = /^https?:\/\/.+/i.test(url.trim());
  const showImage = looksValid && !failed;

  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url.trim()}
          alt={name ? `${name}'s profile` : "Profile preview"}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon size={16} />
      )}
    </span>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next");
  const destination =
    nextParam && nextParam.startsWith("/") ? nextParam : "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const passwordChecks = checkPassword(password);
  const strength = passwordChecks.filter((check) => check.met).length;

  const handleSubmit = async (event: React.SubmitEvent<HTMLElement>) => {
    event.preventDefault();
    if (loading) return;

    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Please enter your full name.";
    }
    if (!isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (photoURL.trim() && !/^https?:\/\/.+/i.test(photoURL.trim())) {
      nextErrors.photoURL = "Photo URL must start with http:// or https://.";
    }
    if (!isPasswordValid(password)) {
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
      const { data, error } = await signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: photoURL.trim() || undefined,
      });

      if (error) {
        const message =
          error.message ?? "Something went wrong. Please try again.";
        const taken = /exist/i.test(`${error.code ?? ""} ${message}`);
        setErrors({ [taken ? "email" : "form"]: message });
        toast.add({
          type: "error",
          title: "Couldn't create your account",
          description: message,
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Account created 🎉",
        description: `Welcome to Change Together, ${(data?.user?.name ?? name).split(" ")[0]}. Your next drive is waiting.`,
      });
      router.push(destination);
      router.refresh();
    } catch {
      const message = "Something went wrong. Please try again.";
      setErrors({ form: message });
      toast.add({
        type: "error",
        title: "Couldn't create your account",
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
            htmlFor="register-name"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Full name
          </label>
          <div className="group relative">
            <User size={17} className={iconBase} />
            <input
              id="register-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({
                  ...current,
                  name: undefined,
                  form: undefined,
                }));
              }}
              placeholder="Ayesha Rahman"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "register-name-error" : undefined}
              disabled={loading}
              className={`${inputBase} ${inputState(Boolean(errors.name))} pr-3.5 disabled:cursor-not-allowed disabled:opacity-70`}
            />
          </div>
          {errors.name && (
            <p
              id="register-name-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <div className="group relative">
            <Mail size={17} className={iconBase} />
            <input
              id="register-email"
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
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
              disabled={loading}
              className={`${inputBase} ${inputState(Boolean(errors.email))} pr-3.5 disabled:cursor-not-allowed disabled:opacity-70`}
            />
          </div>
          {errors.email && (
            <p
              id="register-email-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-photo"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Photo URL{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex items-center gap-2.5">
            <PhotoPreview key={photoURL} url={photoURL} name={name} />
            <div className="group relative flex-1">
              <ImageIcon size={17} className={iconBase} />
              <input
                id="register-photo"
                name="photoURL"
                type="url"
                value={photoURL}
                onChange={(event) => {
                  setPhotoURL(event.target.value);
                  setErrors((current) => ({
                    ...current,
                    photoURL: undefined,
                    form: undefined,
                  }));
                }}
                placeholder="https://images.example.com/me.jpg"
                autoComplete="photo"
                aria-invalid={Boolean(errors.photoURL)}
                aria-describedby={
                  errors.photoURL
                    ? "register-photo-error"
                    : "register-photo-hint"
                }
                disabled={loading}
                className={`${inputBase} ${inputState(Boolean(errors.photoURL))} pr-3.5 disabled:cursor-not-allowed disabled:opacity-70`}
              />
            </div>
          </div>
          {errors.photoURL ? (
            <p
              id="register-photo-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.photoURL}
            </p>
          ) : (
            <p
              id="register-photo-hint"
              className="mt-1.5 text-xs text-slate-400"
            >
              Paste a link to your photo, or leave it empty to use your
              initials.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="register-password"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Password
          </label>
          <div className="group relative">
            <Lock size={17} className={iconBase} />
            <input
              id="register-password"
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
              placeholder="Create a strong password"
              autoComplete="new-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="register-password-rules"
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
            id="register-password-rules"
            className="mt-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-1" aria-hidden="true">
                {[0, 1, 2].map((segment) => (
                  <span
                    key={segment}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      strength > segment
                        ? strength === 3
                          ? "bg-[#16A34A]"
                          : "bg-[#F59E0B]"
                        : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {strength === 3 ? "Ready" : strength > 0 ? "Almost" : "Required"}
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
            <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition hover:bg-green-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-green-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating your account…
            </>
          ) : (
            <>
              Create account
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
      </form>
    </div>
  );
}