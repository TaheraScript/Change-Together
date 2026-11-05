"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  createdAt?: Date | string;
};

type FormValues = {
  name: string;
  image: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const NAME_MIN = 2;
const NAME_MAX = 80;
const IMAGE_MAX = 2048;

const inputBase =
  "h-11 w-full rounded-xl border bg-slate-50/70 pl-11 pr-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4";
const inputState = (invalid: boolean) =>
  invalid
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-200 focus:border-[#16A34A] focus:ring-green-100";
const iconBase =
  "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#16A34A]";

function initialsOf(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "User";
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

function memberSince(value: Date | string | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function ProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your profile"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <div className="h-20 w-20 animate-pulse rounded-full bg-slate-100" />
        <div className="w-full space-y-3">
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-64 max-w-full animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-40 animate-pulse rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
        <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    name: user.name ?? "",
    image: user.image ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);

  const displayName = user.name?.trim() || user.email?.split("@")[0] || "User";
  const email = user.email ?? "";
  const joined = memberSince(user.createdAt);
  const initials = initialsOf(values.name, email);
  const preview = values.image.trim();
  const previewIsUrl = /^https?:\/\/.+/i.test(preview);
  const showPreview = previewIsUrl && !previewFailed;

  const changed =
    values.name.trim() !== (user.name ?? "").trim() ||
    preview !== (user.image ?? "").trim();

  const update =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [field]: value }));
      if (field === "image") setPreviewFailed(false);
      setErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    const name = values.name.trim();

    if (name.length < NAME_MIN) {
      next.name = "Please enter your full name.";
    } else if (name.length > NAME_MAX) {
      next.name = `Your name must be ${NAME_MAX} characters or fewer.`;
    }

    if (preview) {
      if (!previewIsUrl) {
        next.image =
          "Use a direct image link starting with http:// or https://.";
      } else if (preview.length > IMAGE_MAX) {
        next.image = "That image URL is too long.";
      }
    }

    return next;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.add({
        type: "error",
        title: "Check your details",
        description: Object.values(nextErrors)[0],
      });
      return;
    }

    if (!changed) {
      toast.add({
        type: "info",
        title: "Nothing to save",
        description: "Your profile is already up to date.",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await authClient.updateUser({
        name: values.name.trim(),
        image: preview || null,
      });

      if (error) {
        const message =
          error.message ?? "We couldn't save your changes. Please try again.";
        setErrors({ name: message });
        toast.add({
          type: "error",
          title: "Couldn't update your profile",
          description: message,
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your new name and photo are now live.",
      });
      router.refresh();
    } catch {
      toast.add({
        type: "error",
        title: "Couldn't update your profile",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col items-start gap-5 border-b border-slate-100 bg-gradient-to-br from-green-50/70 via-white to-white p-6 sm:flex-row sm:items-center sm:p-8">
        <Avatar size="lg" className="size-20 border-2 border-green-500">
          {showPreview ? (
            <AvatarImage
              src={preview}
              alt={values.name.trim() || displayName}
              referrerPolicy="no-referrer"
              onError={() => setPreviewFailed(true)}
            />
          ) : null}
          <AvatarFallback className="bg-green-50 text-xl font-bold text-[#164E63]">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
            <ShieldCheck size={12} />
            Community member
          </p>
          <h2 className="mt-2 truncate text-2xl font-bold text-[#164E63]">
            {displayName}
          </h2>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <Mail size={14} className="shrink-0" />
            <span className="truncate">{email || "No email on file"}</span>
          </p>
          {joined && (
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarDays size={13} className="shrink-0" />
              Member since {joined}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-6 sm:p-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Edit profile
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#164E63]">
            Name and profile picture
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Your email address is used to sign in and can&apos;t be changed
            here.
          </p>
        </div>

        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Display name
          </label>
          <div className="group relative">
            <UserRound size={17} className={iconBase} />
            <input
              id="profile-name"
              name="name"
              type="text"
              value={values.name}
              onChange={update("name")}
              placeholder="Your full name"
              autoComplete="name"
              maxLength={NAME_MAX}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "profile-name-error" : undefined}
              disabled={saving}
              className={`${inputBase} ${inputState(Boolean(errors.name))} disabled:cursor-not-allowed disabled:opacity-70`}
            />
          </div>
          {errors.name && (
            <p
              id="profile-name-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-image"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Profile picture URL{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="group relative">
            <ImageIcon size={17} className={iconBase} />
            <input
              id="profile-image"
              name="image"
              type="url"
              value={values.image}
              onChange={update("image")}
              placeholder="https://images.example.com/me.jpg"
              autoComplete="photo"
              maxLength={IMAGE_MAX}
              aria-invalid={Boolean(errors.image)}
              aria-describedby={
                errors.image ? "profile-image-error" : "profile-image-hint"
              }
              disabled={saving}
              className={`${inputBase} ${inputState(Boolean(errors.image))} disabled:cursor-not-allowed disabled:opacity-70`}
            />
          </div>
          {errors.image ? (
            <p
              id="profile-image-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-red-600"
            >
              {errors.image}
            </p>
          ) : (
            <p
              id="profile-image-hint"
              className="mt-1.5 text-xs text-slate-400"
            >
              Paste a direct image link, or clear it to use your initials.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <button
            type="submit"
            disabled={saving || !changed}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#164E63] px-5 text-sm font-semibold text-white shadow-md shadow-[#164E63]/20 transition hover:bg-[#0e3a4b] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#164E63]/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={17} />
                Save changes
              </>
            )}
          </button>

          <button
            type="button"
            disabled={saving || !changed}
            onClick={() => {
              setValues({
                name: user.name ?? "",
                image: user.image ?? "",
              });
              setErrors({});
              setPreviewFailed(false);
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>

          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <CheckCircle2 size={13} className="text-[#16A34A]" />
            {changed ? "You have unsaved changes" : "All changes saved"}
          </span>
        </div>
      </form>
    </div>
  );
}

export default function ProfileView() {
  const { data: session, isPending } = useSession();
  const user = session?.user as SessionUser | undefined;

  if (isPending) return <ProfileSkeleton />;

  if (!user) {
    return (
      <div className="rounded-3xl border border-dashed border-green-200 bg-white px-6 py-14 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-[#16A34A]">
          <UserRound size={26} />
        </span>
        <h2 className="mt-4 text-xl font-bold text-[#164E63]">
          Your session has expired
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Log in again to view and update your profile.
        </p>
      </div>
    );
  }

  return <ProfileForm key={user.id} user={user} />;
}
